import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import axios from 'axios';
import { MASTER_ADDRESS_MODULE } from '../../../../../modules/master-address';
import type MasterAddressService from '../../../../../modules/master-address/service';

interface Base {
	id: number;
	name_th: string;
	name_en: string;
	deleted_at: string;
}

interface Tambon extends Base {
	amphure_id: number;
	zip_code: string;
}

interface Ampure extends Base {
	province_id: number;
	tambon: Tambon[];
}

interface Province extends Base {
	amphure: Ampure[];
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const data = await getAddressData();

	const masterAddressService: MasterAddressService = req.scope.resolve(
		MASTER_ADDRESS_MODULE,
	);

	const provinces = data.map((province) => ({
		id: province.id,
		name_th: province.name_th,
		name_en: province.name_en,
	}));

	const cities = data.flatMap((province) => {
		return province.amphure.map((amphure) => ({
			id: amphure.id,
			name_th: amphure.name_th,
			name_en: amphure.name_en,
			province_id: amphure.province_id,
		}));
	});

	const subDistricts = data.flatMap((province) => {
		return province.amphure.flatMap((amphure) => {
			return amphure.tambon.map((tambon) => ({
				id: tambon.id,
				name_th: tambon.name_th,
				name_en: tambon.name_en,
				city_id: tambon.amphure_id,
				postal_code: `${tambon.zip_code}`,
			}));
		});
	});

	await masterAddressService.createProvinces(provinces);
	await masterAddressService.createCities(cities);
	await masterAddressService.createSubDisticts(subDistricts);

	const additionalSubDistricts = [
		{
			id: 970000,
			name_th: 'นวลจันทร์',
			name_en: 'Nuan Chan',
			city_id: 1027,
			postal_code: '10230',
		},
	];
	await masterAddressService.createSubDisticts(additionalSubDistricts);

	res.status(201).json({
		success: true,
	});
};

const getAddressData = async () => {
	try {
		const resp = await axios.get<Province[]>(
			'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json',
		);
		return resp.data;
	} catch (error) {
		console.error(error);
		return [];
	}
};
