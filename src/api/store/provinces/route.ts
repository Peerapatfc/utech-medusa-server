import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MASTER_ADDRESS_MODULE } from "../../../modules/master-address";
import type MasterAddressService from "../../../modules/master-address/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const masterAddressService: MasterAddressService = req.scope.resolve(
		MASTER_ADDRESS_MODULE,
	);

	const provinces = await masterAddressService.listProvinces(
		{},
		{
			order: {
				name_th: "ASC",
			},
			select: ["id", "name_th", "name_en"],
		},
	);

	res.json({
		success: true,
		message: "GET provinces",
		provinces,
	});
};
