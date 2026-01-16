import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MASTER_ADDRESS_MODULE } from "../../../../../../../modules/master-address";
import type MasterAddressService from "../../../../../../../modules/master-address/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const cityId = req.params.city_id;
	const masterAddressService: MasterAddressService = req.scope.resolve(
		MASTER_ADDRESS_MODULE,
	);

	const subDistricts = await masterAddressService.listSubDisticts(
		{
			city_id: cityId,
		},
		{
			order: {
				name_th: "ASC",
			},
			select: ["id", "name_th", "name_en", "postal_code", "city_id"],
		},
	);

	res.json({
		success: true,
		message: "GET sub districts",
		sub_districts: subDistricts,
	});
};
