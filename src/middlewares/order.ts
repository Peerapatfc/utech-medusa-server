import type {
	MedusaNextFunction,
	MedusaRequest,
	MedusaResponse,
	MiddlewareRoute,
} from "@medusajs/framework/http";
import type {
	AdminOrder,
	ICustomerModuleService,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";

const transformSearchQuery = async (
	req: MedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const q = req.query.q;
	if (!q) {
		return next();
	}

	const customerService: ICustomerModuleService = req.scope.resolve(
		Modules.CUSTOMER,
	);
	const customerIds = q
		? await customerService
				.listCustomers({
					q: q as string,
				})
				.then((res) => res.map((c) => c.id))
		: [];

	const workflow = getOrdersListWorkflow(req.scope);
	const { result } = (await workflow.run({
		input: {
			fields: ["*"],
			variables: {
				filters: {
					$or: [
						{
							metadata: {
								order_no: {
									$ilike: `%${q}%`,
								},
							},
						},
						{
							metadata: {
								invoice_no: {
									$ilike: `%${q}%`,
								},
							},
						},
						{
							email: {
								$ilike: `%${q}%`,
							},
						},
						{
							customer_id: customerIds,
						},
					],
				},
			},
		},
	})) as unknown as { result: AdminOrder[] };

	const orderIds = result?.map((r) => r.id);

	// req.query.id = orderIds;
	// req.query.id = "order_01K040ZG749NHTSCCAQWWPGMYP";

	// req.validatedQuery = {
	// 	...req.validatedQuery,
	// 	id: [
	// 		"order_01K040ZG749NHTSCCAQWWPGMYP",
	// 		"order_01JYKP75477Y5Z6YF93BZCG11F",
	// 	],
	// };

	req.filterableFields = {
		...req.filterableFields,
		q: undefined,
		id: orderIds,
	};

	next();
};

export const customAdminOrderRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ["GET"],
		matcher: "/admin/orders",
		middlewares: [transformSearchQuery],
	},
];
