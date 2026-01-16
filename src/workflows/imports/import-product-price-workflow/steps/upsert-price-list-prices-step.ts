import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type {
	AddPriceListPricesDTO,
	CreatePriceListPriceDTO,
	IPricingModuleService,
	Logger,
	PricingTypes,
} from "@medusajs/framework/types";
import dayjs from "dayjs";
import type { ValidateProductPrice } from "../type";
import type { MedusaContainer } from "@medusajs/framework";
import {
	convertCustomFormatToUTC,
	isTimeRangesOverlap,
} from "../../../../utils/date";

export const upsertPriceListPricesStep = createStep(
	"upsert-price-list-prices-step",
	async (
		{
			product_prices,
			original_filename,
		}: { product_prices: ValidateProductPrice[]; original_filename: string },
		{ container },
	) => {
		const logger: Logger = container.resolve("logger");
		const isInvalidAll = product_prices.every((p) => !p.is_valid);
		if (isInvalidAll) {
			return new StepResponse({});
		}

		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		const pricingService: IPricingModuleService = container.resolve(
			Modules.PRICING,
		);

		const groupedPriceListByDate = await groupPriceListByDate(product_prices);

		const createdPriceLists: PricingTypes.PriceListDTO[] = [];
		const priceListPricesToCreate: AddPriceListPricesDTO[] = [];
		const deletedPriceIds: string[] = [];
		for await (const groupedPriceList of groupedPriceListByDate) {
			const {
				special_price_from_date,
				special_price_to_date,
				product_prices: productPrices,
			} = groupedPriceList;

			const startAtTemplate = special_price_from_date
				? dayjs(special_price_from_date).format("D MMMM YYYY HH:mm")
				: "Not specified";
			const endAtTemplate = special_price_to_date
				? dayjs(special_price_to_date).format("D MMMM YYYY HH:mm")
				: "Not specified";
			const title = `[Imported]: Start ${startAtTemplate} - End ${endAtTemplate}`;

			logger.info(
				`create price list with starts_at: ${convertCustomFormatToUTC(special_price_from_date)}`,
			);

			const [createdPriceList] = await pricingService.createPriceLists([
				{
					title,
					description: `Imported from ${original_filename}`,
					starts_at: convertCustomFormatToUTC(special_price_from_date),
					ends_at: convertCustomFormatToUTC(special_price_to_date),
					status: "active",
				} as PricingTypes.CreatePriceListDTO,
			]);
			createdPriceLists.push(createdPriceList);

			const pricesToAdd: CreatePriceListPriceDTO[] = [];
			for await (const productPrice of productPrices) {
				const { variant_id, special_price } = productPrice;

				if (!special_price) {
					continue;
				}

				const {
					data: [variant],
				} = await query.graph({
					entity: "variants",
					filters: {
						id: variant_id,
					},
					fields: ["price_set.*"],
					pagination: {
						skip: 0,
						take: 1,
					},
				});

				if (variant.price_set) {
					// check if is overlap time to remove old price
					const _deletedPriceIds = await checkOverlapTimeAndRemoveOldPrice(
						{
							price_set_id: variant.price_set.id,
							new_starts_at: createdPriceList.starts_at,
							new_ends_at: createdPriceList.ends_at,
						},
						{ container },
					);
					deletedPriceIds.push(..._deletedPriceIds);

					pricesToAdd.push({
						price_set_id: variant.price_set?.id,
						currency_code: "thb",
						amount: productPrice.special_price,
					});
				}
			}

			if (pricesToAdd.length) {
				priceListPricesToCreate.push({
					price_list_id: createdPriceList.id,
					prices: pricesToAdd,
				});
			}
		}

		const createdPrices = await pricingService.addPriceListPrices(
			priceListPricesToCreate,
		);

		return new StepResponse(
			{
				createdPriceLists,
				createdPrices,
				deletedPriceIds,
			},
			{
				createdPriceLists,
				createdPrices,
				deletedPriceIds,
			},
		);
	},
	async (previousData, { container }) => {
		const pricingService: IPricingModuleService = container.resolve(
			Modules.PRICING,
		);

		const { createdPriceLists, createdPrices, deletedPriceIds } =
			previousData as {
				createdPriceLists: PricingTypes.PriceListDTO[];
				createdPrices: PricingTypes.PriceDTO[];
				deletedPriceIds: string[];
			};

		if (createdPrices.length) {
			await pricingService.softDeletePrices(createdPrices.map((p) => p.id));
		}

		if (createdPriceLists.length) {
			await pricingService.softDeletePriceLists(
				createdPriceLists.map((p) => p.id),
			);
		}

		if (deletedPriceIds.length) {
			await pricingService.restorePrices(deletedPriceIds);
		}
	},
);

const groupPriceListByDate = (product_prices: ValidateProductPrice[]) => {
	const map = new Map<
		string,
		{
			special_price_from_date: string;
			special_price_to_date: string;
			product_prices: ValidateProductPrice[];
		}
	>();

	for (const productPrice of product_prices) {
		const {
			special_price_from_date,
			special_price_to_date,
			is_valid,
			variant_id,
		} = productPrice;

		if (!is_valid || !variant_id) {
			continue;
		}

		const key = `${special_price_from_date.toString()}_${special_price_to_date.toString()}`;

		const value = map.get(key);
		if (value) {
			value.product_prices.push(productPrice);
		}

		if (!value) {
			map.set(key, {
				special_price_from_date,
				special_price_to_date,
				product_prices: [productPrice],
			});
		}
	}

	return Array.from(map.values());
};

const checkOverlapTimeAndRemoveOldPrice = async (
	{
		price_set_id,
		new_starts_at,
		new_ends_at,
	}: {
		price_set_id: string;
		new_starts_at: string;
		new_ends_at: string;
	},
	{ container }: { container: MedusaContainer },
) => {
	const pricingService: IPricingModuleService = container.resolve(
		Modules.PRICING,
	);

	const prices = await pricingService.listPrices(
		{
			price_set_id: [price_set_id],
		},
		{
			relations: ["price_list"],
		},
	);

	const deletedPriceIds = [];
	const priceListPrices = prices.filter((p) => !!p.price_list);
	for (const price of priceListPrices) {
		const { id, price_list } = price;
		const { starts_at, ends_at } = price_list;

		const isOverlap = isTimeRangesOverlap({
			starts_at_1: new_starts_at,
			ends_at_1: new_ends_at,
			starts_at_2: starts_at,
			ends_at_2: ends_at,
		});

		if (isOverlap) {
			const deleted = await pricingService.softDeletePrices([id]);
			if (deleted) {
				deletedPriceIds.push(...deleted.price_id);
			}
		}
	}

	return deletedPriceIds;
};
