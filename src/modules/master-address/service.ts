import { MedusaService } from "@medusajs/framework/utils";
import { Province } from "./models/province";
import { City } from "./models/city";
import { SubDistict } from "./models/sub_district";

class MasterAddressService extends MedusaService({
	Province,
	City,
	SubDistict,
}) {}

export default MasterAddressService;
