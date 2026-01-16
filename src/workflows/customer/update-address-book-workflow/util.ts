import { AdminCustomerAddress, OrderAddress } from '@medusajs/framework/types';

export const checkCustomerAddressExists = (
	customerAddresses: AdminCustomerAddress[],
	orderAddress: OrderAddress,
) => {
	if (!customerAddresses || customerAddresses.length === 0) return false;

	for (const customerAddress of customerAddresses) {
		const isNameMatching =
			customerAddress.first_name === orderAddress.first_name &&
			customerAddress.last_name === orderAddress.last_name;

		const isPhoneMatching = customerAddress.phone === orderAddress.phone;

		const isSubDistrictMatching =
			customerAddress.metadata?.sub_district ===
			orderAddress.metadata?.sub_district;

		const isCityMatching = customerAddress.city === orderAddress.city;

		const isProvinceMatching =
			customerAddress.province === orderAddress.province;

		const isAddress1Matching =
			customerAddress.address_1 === orderAddress.address_1;

		const isAddress2Matching =
			customerAddress.address_2 === orderAddress.address_2;

		if (
			isNameMatching &&
			isPhoneMatching &&
			isSubDistrictMatching &&
			isCityMatching &&
			isProvinceMatching &&
			isAddress1Matching &&
			isAddress2Matching
		) {
			return true;
		}
	}

	return false;
};
