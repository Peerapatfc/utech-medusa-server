import type { CustomStoreCustomerAddress } from "@customTypes/address";
import type { HttpTypes } from "@medusajs/types";
import { TaxInvoiceType } from "../../types/address";
export const getFormattedAddress = ({
	address,
}: {
	address?: HttpTypes.AdminOrderAddress | CustomStoreCustomerAddress | null;
}) => {
	if (!address) {
		return [];
	}

	const {
		first_name,
		last_name,
		address_1,
		address_2,
		city,
		postal_code,
		province,
		metadata,
	} = address;

	const name = [first_name, last_name].filter(Boolean).join(" ");

	const formattedAddress: string[] = [];

	if (name) {
		formattedAddress.push(name);
	}

	if (metadata?.juristic_name) {
		formattedAddress.push(metadata?.juristic_name as string);
	}

	if (metadata?.juristic_no) {
		formattedAddress.push(metadata?.juristic_no as string);
	}

	if (metadata?.email) {
		formattedAddress.push(metadata?.email as string);
	}

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
		.join(" ");

	if (cityProvincePostal) {
		formattedAddress.push(cityProvincePostal);
	}

	return formattedAddress;
};

export const getFormattedTaxAddress = ({
	address,
}: {
	address?: HttpTypes.AdminOrderAddress | CustomStoreCustomerAddress | null;
}) => {
	if (!address) {
		return [];
	}

	const formattedAddress: { label: string; value: string }[] = [];

	const {
		first_name,
		last_name,
		address_1,
		address_2,
		city,
		postal_code,
		province,
		phone,
		metadata,
	} = address;

	let fullName = [first_name, last_name].join(" ");
	if (metadata?.tax_invoice_type === TaxInvoiceType.Juristic) {
		fullName = metadata?.juristic_name as string;
	}

	if (metadata?.tax_invoice_type) {
		formattedAddress.push({
			label: "Type",
			value: metadata?.tax_invoice_type as string,
		});
	}
	if (metadata?.branch_name) {
		formattedAddress.push({
			label: "Branch",
			value: metadata?.branch_name as string,
		});
	}

	if (metadata?.juristic_no) {
		formattedAddress.push({
			label: "Juristic No",
			value: metadata?.juristic_no as string,
		});
	}
	if (fullName.trim().length > 0) {
		formattedAddress.push({ label: "Name", value: fullName });
	}

	const fullAddress = [address_1, address_2, city, province, postal_code].join(
		" ",
	);
	if (fullAddress) {
		formattedAddress.push({ label: "Address", value: fullAddress });
	}
	if (phone) {
		formattedAddress.push({ label: "Tel", value: phone });
	}
	if (metadata?.email) {
		formattedAddress.push({ label: "Email", value: metadata?.email as string });
	}

	return formattedAddress;
};


