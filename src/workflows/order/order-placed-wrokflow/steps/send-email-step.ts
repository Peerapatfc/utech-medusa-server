import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type {
	INotificationModuleService,
	IOrderModuleService,
	MedusaContainer,
	OrderAddressDTO,
} from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	Modules,
	QueryContext,
} from '@medusajs/framework/utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { formatPriceString } from '../../../../utils/prices';
import { getPaymentName } from '../../../../utils/payment-method';
import { PRE_ORDER_STRAPI_MODULE } from '../../../../modules/strapi/pre-order';
import type PreOrderStrapiService from '../../../../modules/strapi/pre-order/service';
import type { CustomOrderDetailDTO, SendEmailInput } from '../type';
import { getEmailAddressTemplate } from '../../../../utils/address';
import type {
	EnhancedOrderLineItem,
	PreOrderMetadata,
} from '@customTypes/pre-order-email';
import type PreOrderService from '../../../../modules/pre-order/service';
import { PRE_ORDER_SERVICE } from '../../../../modules/pre-order';

const sendEmailStep = createStep(
	'send-email-step',
	async (input: SendEmailInput, { container }) => {
		const { orderDetail, paymentExpiration, orderNo } = input;
		const notificationModuleService: INotificationModuleService =
			container.resolve(Modules.NOTIFICATION);
		const orderService: IOrderModuleService = container.resolve(Modules.ORDER);

		let items =
			orderDetail.items
				.filter((item) => {
					if (!item.metadata?.type) return true;
					return item.metadata?.type !== 'premium';
				})
				.map((item) => {
					return {
						...item,
						subtotal: formatPriceString(item.subtotal as number),
					};
				}) || [];

		const item_subtotal = formatPriceString(
			orderDetail?.item_subtotal as number,
		);
		const total = formatPriceString(orderDetail?.total as number);

		const isPreOrder = !!orderDetail?.metadata?.is_pre_order;
		const additionals = {
			is_pre_order: isPreOrder,
			pre_order_metadata: null,
		};

		if (isPreOrder) {
			const preOrderMetadata = await getPreOrderMetadata(
				container,
				orderDetail,
			);
			additionals.pre_order_metadata = preOrderMetadata;

			items = await cleanUpPreOrderItems(container, orderDetail, items);
			if (orderDetail.metadata?.pickup_option?.slug === 'in-store-pickup') {
				const itemSubTotal = items.reduce((acc, item) => {
					return acc + (item.original_total as number);
				}, 0);

				const amountToBePaid = itemSubTotal - (orderDetail.total as number);
				additionals.pre_order_metadata.amount_to_be_paid =
					formatPriceString(amountToBePaid);
			}
		}

		dayjs.extend(utc);
		dayjs.extend(timezone);
		dayjs.tz.setDefault('Asia/Bangkok');

		let taxInvoiceAddress: OrderAddressDTO = null;
		if (orderDetail?.metadata?.tax_invoice_address_id) {
			taxInvoiceAddress = await orderService
				.listOrderAddresses({
					id: orderDetail?.metadata?.tax_invoice_address_id,
				})
				.then((res) => res[0]);
		}

		const payload = {
			first_name: orderDetail?.shipping_address?.first_name || '',
			landing_page_url: process.env.MEDUSA_FRONTEND_URL,
			date: paymentExpiration
				? dayjs(paymentExpiration).tz('Asia/Bangkok').format('DD/MM/YYYY')
				: '',
			time: paymentExpiration
				? dayjs(paymentExpiration).tz('Asia/Bangkok').format('HH:mm')
				: '',
			orderNo,
			payment_method: getPaymentName(
				orderDetail.payment_collections?.[0]?.payments?.[0]?.provider_id,
			),
			shipping_address: getEmailAddressTemplate(orderDetail?.shipping_address),
			billing_address: getEmailAddressTemplate(orderDetail?.billing_address),
			tax_invoice_address: getEmailAddressTemplate(taxInvoiceAddress),
			items,
			item_subtotal,
			discount: orderDetail?.discount_total,
			shipping_total: orderDetail?.shipping_total,
			total,
			...additionals,
		};

		let templateId = process.env.SENDGRID_ORDER_PLACED_ID;
		if (isPreOrder) {
			templateId = process.env.SENDGRID_PRE_ORDER_PLACED_ID;
		}

		await notificationModuleService.createNotifications({
			to: orderDetail.email,
			channel: 'email',
			template: templateId,
			data: payload,
		});

		return new StepResponse({});
	},
);

const getPreOrderMetadata = async (
	container: MedusaContainer,
	orderDetail: CustomOrderDetailDTO,
): Promise<PreOrderMetadata> => {
	const preOrderStrapiService: PreOrderStrapiService = container.resolve(
		PRE_ORDER_STRAPI_MODULE,
	);

	const mainItem = orderDetail.items.find((item) => !item.metadata?.type);
	const isInStorePickup =
		orderDetail.metadata?.pickup_option?.slug === 'in-store-pickup';

	const preOrderService: PreOrderService = container.resolve(PRE_ORDER_SERVICE);
	const preOrderTemplateItem = await preOrderService
		.listPreOrderTemplateItems({
			product_id: mainItem.product_id,
		})
		.then((data) => data[0]);

	const preOrderTemplateId = preOrderTemplateItem?.pre_order_template_id;

	const strapiPreOrderTemplate =
		await preOrderStrapiService.getPreOrderByMedusaId(preOrderTemplateId);
	const pickupTerms =
		await preOrderStrapiService.getPickupTermByMedusaId(preOrderTemplateId);
	const homeDeliveryTerms =
		await preOrderStrapiService.getHomeDeliveryTermsByMedusaId(
			preOrderTemplateId,
		);
	const map = await preOrderStrapiService.getUTechMap();

	const emailFooterImages =
		strapiPreOrderTemplate?.attributes?.email_footer_images?.data || [];

	const footerUrl = emailFooterImages[0]?.attributes?.url || '';

	const homeTermsEng = homeDeliveryTerms?.attributes?.localizations?.data.find(
		(item) => item.attributes.locale === 'en',
	);
	const pickupTermsEng = pickupTerms?.attributes?.localizations?.data.find(
		(item) => item.attributes.locale === 'en',
	);

	return {
		is_delivery: orderDetail?.metadata?.pickup_option?.slug === 'home-delivery',
		is_pickup: orderDetail?.metadata?.pickup_option?.slug === 'in-store-pickup',
		code: orderDetail?.metadata?.pre_order?.code || null,
		code_image_url: orderDetail?.metadata?.pre_order?.code_image_url || null,
		id_card_no: orderDetail?.metadata?.pre_order?.id_card_no || '',
		delivery_terms: homeDeliveryTerms?.attributes?.terms || '',
		delivery_sub_terms: homeDeliveryTerms?.attributes?.sub_terms || '',
		in_store_pickup_terms: pickupTerms?.attributes?.terms || '',
		in_store_pickup_sub_terms: pickupTerms?.attributes?.sub_terms || '',

		delivery_terms_en: homeTermsEng?.attributes?.terms || '',
		delivery_sub_terms_en: homeTermsEng?.attributes?.sub_terms || '',
		in_store_pickup_terms_en: pickupTermsEng?.attributes?.terms || '',
		in_store_pickup_sub_terms_en: pickupTermsEng?.attributes?.sub_terms || '',

		down_payment: isInStorePickup
			? formatPriceString(mainItem?.total as number)
			: '',
		down_payment_total: mainItem?.total as number,
		amount_to_be_paid: '',
		footer_url: footerUrl,
		map_url: map?.attributes?.map_url?.data?.attributes?.url || '',
	};
};

const cleanUpPreOrderItems = async (
	container: MedusaContainer,
	orderDetail: CustomOrderDetailDTO,
	items: EnhancedOrderLineItem[],
) => {
	if (orderDetail.metadata?.pickup_option?.slug === 'home-delivery') {
		return items;
	}

	const query = container.resolve(ContainerRegistrationKeys.QUERY);

	const inStorePriceItems = await Promise.all(
		items.map(async (item) => {
			const { data: variants } = await query.graph({
				entity: 'variants',
				// @ts-ignore
				fields: ['calculated_price.*'],
				filters: {
					id: item.variant_id,
				},
				context: {
					calculated_price: QueryContext({ currency_code: 'thb' }),
				},
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const variant = variants[0] as any;
			const calculated_amount = variant?.calculated_price?.calculated_amount;

			let total = calculated_amount || item.compare_at_unit_price;
			let original_total = calculated_amount || item.compare_at_unit_price;

			if (item.metadata?.type === 'bundle') {
				total = item.unit_price;
				original_total = item.unit_price;
			}

			return {
				...item,
				subtotal: formatPriceString(original_total as number),
				total,
				original_total,
			};
		}),
	);

	return inStorePriceItems;
};

export default sendEmailStep;
