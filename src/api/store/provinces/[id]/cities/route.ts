import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MASTER_ADDRESS_MODULE } from "../../../../../modules/master-address";
import type MasterAddressService from "../../../../../modules/master-address/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const provinceId = req.params.id;
	const masterAddressService: MasterAddressService = req.scope.resolve(
		MASTER_ADDRESS_MODULE,
	);

	const cities = await masterAddressService.listCities(
		{
			province_id: provinceId,
		},
		{
			order: {
				name_th: "ASC",
			},
			select: ["id", "name_th", "name_en", "province_id"],
		},
	);

	res.json({
		success: true,
		message: "GET cities",
		cities,
	});
};
