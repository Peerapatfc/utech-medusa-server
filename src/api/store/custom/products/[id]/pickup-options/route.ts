import type { PickupOption } from '@customTypes/pre-order';
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type PreOrderService from '../../../../../../modules/pre-order/service';
import { PRE_ORDER_SERVICE } from '../../../../../..//modules/pre-order';
import type PreOrderStrapiService from '../../../../../../modules/strapi/pre-order/service';
import { PRE_ORDER_STRAPI_MODULE } from '../../../../../../modules/strapi/pre-order';
import type { PickupShippingTermStrapiData } from '../../../../../../modules/strapi/pre-order/type';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id } = req.params;
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	const preOrderStrapiService: PreOrderStrapiService = req.scope.resolve(
		PRE_ORDER_STRAPI_MODULE,
	);
	const pickupOptions = await preOrderService.listPickupOptions(
		{},
		{
			order: {
				rank: 'ASC',
			},
		},
	);

	const preOrderTemplateItem = await preOrderService
		.listPreOrderTemplateItems({
			product_id: id,
		})
		.then((data) => data[0]);

	const preOrderTemplate = await preOrderService
		.listPreOrderTemplates({
			id: preOrderTemplateItem?.pre_order_template_id,
		})
		.then((data) => data[0]);

	if (!preOrderTemplateItem || !preOrderTemplate) {
		res.status(200).json({
			pickup_options: pickupOptions,
			pickup_terms: [],
		});
		return;
	}

	for (const pickupOption of pickupOptions) {
		if (pickupOption.slug === 'home-delivery') {
			pickupOption.shipping_start_date = preOrderTemplate.shipping_start_date;
		}

		if (pickupOption.slug === 'in-store-pickup') {
			pickupOption.pickup_start_date = preOrderTemplate.pickup_start_date;
			pickupOption.upfront_price = preOrderTemplate.upfront_price;
			pickupOption.raw_upfront_price = preOrderTemplate.raw_upfront_price;
		}
	}

	const pickupTerms = [];
	const preOrderTemplateId = preOrderTemplate.id;
	const [homeDeliveryTerms, inStorePickupTerms] = await Promise.all([
		preOrderStrapiService.getHomeDeliveryTermsByMedusaId(preOrderTemplateId),
		preOrderStrapiService.getInStorePickupTermsByMedusaId(preOrderTemplateId),
	]);

	if (homeDeliveryTerms) {
		const homeDeliveryTermsEng = getEngTerms(homeDeliveryTerms);
		pickupTerms.push({
			name: homeDeliveryTerms?.attributes?.name,
			pickup_slug: homeDeliveryTerms?.attributes?.pickup_slug,
			sub_terms: homeDeliveryTerms?.attributes?.sub_terms,
			terms: homeDeliveryTerms?.attributes?.terms,
			...homeDeliveryTermsEng,
		});
	}
	if (inStorePickupTerms) {
		const inStorePickupTermsEng = getEngTerms(inStorePickupTerms);
		pickupTerms.push({
			name: inStorePickupTerms?.attributes?.name,
			pickup_slug: inStorePickupTerms?.attributes?.pickup_slug,
			sub_terms: inStorePickupTerms?.attributes?.sub_terms,
			terms: inStorePickupTerms?.attributes?.terms,
			...inStorePickupTermsEng,
		});
	}

	res.status(200).json({
		pickup_options: pickupOptions,
		pickup_terms: pickupTerms,
	});
};

const getEngTerms = (terms: PickupShippingTermStrapiData) => {
	const termsEng = terms.attributes.localizations?.data.find(
		(item) => item.attributes.locale === 'en',
	);
	return {
		sub_terms_en: termsEng?.attributes?.sub_terms || terms.attributes.sub_terms,
		terms_en: termsEng?.attributes?.terms || terms.attributes.terms,
	};
};
