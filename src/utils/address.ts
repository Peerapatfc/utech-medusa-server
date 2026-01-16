import {
	AddressType,
	type CustomStoreCustomerAddress,
	TaxInvoiceType,
} from '../types/address';
import type { HttpTypes, OrderAddressDTO } from '@medusajs/framework/types';

export interface Address extends OrderAddressDTO {
	new_field?: string;
}

export const getMappedAddress = (address: Address) => {
	if (!address) {
		return '';
	}

	const {
		address_1 = '',
		address_2 = '',
		city = '',
		province = '',
		postal_code = '',
		metadata,
	} = address;

	const subDistrict = metadata?.sub_district || '';
	const mappedAddress = [
		address_1,
		address_2,
		subDistrict,
		city,
		province,
		postal_code,
	]
		.filter(Boolean)
		.join(' ');

	return mappedAddress;
};

export const getAddressName = (address: Address) => {
	if (!address) return '';

	const addressType = address.metadata?.address_type;
	const taxInvoiceType = address.metadata?.tax_invoice_type;

	if (
		addressType === AddressType.TaxInvoice &&
		taxInvoiceType === TaxInvoiceType.Juristic
	) {
		const juristicName = `${address?.metadata?.juristic_name}`;
		if (address?.metadata?.branch_name) {
			return `${juristicName} (${address?.metadata?.branch_name})`;
		}

		return juristicName || '';
	}

	if (!address.first_name && !address.last_name) {
		return '';
	}

	return `${address.first_name || ''} ${address.last_name || ''}`;
};

export const getJuristicNo = (address: Address) => {
	if (!address?.metadata?.juristic_no) {
		return null;
	}

	const juristicTypeName =
		address.metadata?.tax_invoice_type === TaxInvoiceType.Juristic
			? 'นิติบุคคล'
			: 'บุคคลธรรมดา';

	return `${address.metadata?.juristic_no} (${juristicTypeName})`;
};

export const getEmailAddressTemplate = (address: Address) => {
	if (!address || !address?.province) {
		return null;
	}

	let juristicNo = null;
	if (address.metadata?.juristic_no) {
		juristicNo = address.metadata?.juristic_no;
	}

	return {
		name: getAddressName(address),
		juristic_no: getJuristicNo(address),
		phone: address.phone,
		address: getMappedAddress(address),
	};
};

export const getFormattedAddressForExport = ({
	address,
}: {
	address?: HttpTypes.AdminOrderAddress | CustomStoreCustomerAddress | null;
}) => {
	if (!address) {
		return [];
	}

	const { address_1, address_2, city, postal_code, province } = address;

	const formattedAddress: string[] = [];

	if (address_1) {
		formattedAddress.push(address_1);
	}

	if (address_2) {
		formattedAddress.push(address_2);
	}

	if (address.metadata?.sub_district) {
		formattedAddress.push(address.metadata.sub_district as string);
	}

	const cityProvincePostal = [city, province, postal_code]
		.filter(Boolean)
		.join(' ');

	if (cityProvincePostal) {
		formattedAddress.push(cityProvincePostal);
	}

	return formattedAddress;
};
