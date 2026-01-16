import {
	getMappedAddress,
	getEmailAddressTemplate,
	getAddressName,
	getJuristicNo,
	type Address,
} from '../address';
import { AddressType, TaxInvoiceType } from '../../types/address';

describe('Address Utility Functions', () => {
	const mockAddress = {
		address_1: '123 Main St',
		address_2: 'Apt 4B',
		city: 'Metropolis',
		province: 'State',
		postal_code: '12345',
		phone: '555-1234',
		metadata: {
			sub_district: 'Downtown',
			address_type: AddressType.TaxInvoice,
			tax_invoice_type: TaxInvoiceType.Juristic,
			juristic_name: 'Company Inc.',
			branch_name: 'Branch 1',
			juristic_no: '123456789',
		},
		first_name: 'John',
		last_name: 'Doe',
	} as unknown as Address;

	describe('getMappedAddress', () => {
		it('should return a correctly mapped address', () => {
			const result = getMappedAddress(mockAddress);
			expect(result).toBe('123 Main St Apt 4B Downtown Metropolis State 12345');
		});

		it('should return an empty string when address is null', () => {
			const result = getMappedAddress(null);
			expect(result).toBe('');
		});

		it('should handle missing fields gracefully', () => {
			const partialAddress = { address_1: '456 Elm St' } as unknown as Address;
			const result = getMappedAddress(partialAddress);
			expect(result).toBe('456 Elm St');
		});
	});

	describe('getAddressName', () => {
		it('should return a formatted name for a juristic address with branch name', () => {
			const result = getAddressName(mockAddress);
			expect(result).toBe('Company Inc. (Branch 1)');
		});

		it('should return only the juristic name if branch name is missing', () => {
			const addressWithoutBranch = {
				...mockAddress,
				metadata: { ...mockAddress.metadata, branch_name: undefined },
			};
			const result = getAddressName(addressWithoutBranch);
			expect(result).toBe('Company Inc.');
		});

		it('should return an empty string if both first_name and last_name are missing', () => {
			const addressWithoutName = {
				...mockAddress,
				metadata: {
					...mockAddress.metadata,
					tax_invoice_type: TaxInvoiceType.Personal,
				},
				first_name: '',
				last_name: '',
			};
			const result = getAddressName(addressWithoutName);
			expect(result).toBe('');
		});

		it('should return the first and last name for a non-juristic address', () => {
			const nonJuristicAddress = {
				...mockAddress,
				metadata: { address_type: undefined, tax_invoice_type: undefined },
			};
			const result = getAddressName(nonJuristicAddress);
			expect(result).toBe('John Doe');
		});
	});

	describe('getJuristicNo', () => {
		it('should return a formatted juristic number for a juristic address', () => {
			const result = getJuristicNo(mockAddress);
			expect(result).toBe('123456789 (นิติบุคคล)');
		});

		it('should return null if juristic_no is missing', () => {
			const addressWithoutJuristicNo = {
				...mockAddress,
				metadata: { ...mockAddress.metadata, juristic_no: undefined },
			};
			const result = getJuristicNo(addressWithoutJuristicNo);
			expect(result).toBeNull();
		});

		it('should indicate บุคคลธรรมดา for non-juristic addresses', () => {
			const personalAddress = {
				...mockAddress,
				metadata: { ...mockAddress.metadata, tax_invoice_type: undefined },
			};
			const result = getJuristicNo(personalAddress);
			expect(result).toBe('123456789 (บุคคลธรรมดา)');
		});
	});

	describe('getEmailAddressTemplate', () => {
		it('should return a formatted email address template', () => {
			const result = getEmailAddressTemplate(mockAddress);
			expect(result).toEqual({
				name: 'Company Inc. (Branch 1)',
				juristic_no: '123456789 (นิติบุคคล)',
				phone: '555-1234',
				address: '123 Main St Apt 4B Downtown Metropolis State 12345',
			});
		});

		it('should return null if address is null', () => {
			const result = getEmailAddressTemplate(null);
			expect(result).toBeNull();
		});

		it('should return null if province is missing', () => {
			const addressWithoutProvince = { ...mockAddress, province: undefined };
			const result = getEmailAddressTemplate(addressWithoutProvince);
			expect(result).toBeNull();
		});
	});
});
