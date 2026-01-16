import FormValidator from '../form-validator';

describe('FormValidator', () => {
	describe('email', () => {
		it('should return a valid property', () => {
			const name = 'test@example.com';
			const validation = FormValidator.email(name);

			expect(validation).toHaveProperty('value');
			expect(validation).toHaveProperty('success');
			expect(validation).toHaveProperty('message');
			expect(validation.value).toBe(name);
			expect(validation.success).toBe(true);
			expect(validation.message).toBe('Valid email format.');
		});

		it('should validate a correct email address', () => {
			const validEmail = 'test@example.com';
			const validation = FormValidator.email(validEmail);

			expect(validation.success).toBe(true);
		});

		it('should invalidate an incorrect email address', () => {
			const invalidEmails = [
				'plainaddress',
				'@missingusername.com',
				'username@.com',
				'username@domain',
				'username@domain.',
				'username@domain.c',
				'username@domain..com',
			];

			for (const email of invalidEmails) {
				const validation = FormValidator.email(email);
				expect(validation.success).toBe(false);
			}
		});

		it('should validate case-insensitive email addresses', () => {
			const mixedCaseEmail = 'Test.Email@Example.COM';
			const validation = FormValidator.email(mixedCaseEmail);

			expect(validation.success).toBe(true);
		});

		it('should return the correct error message for invalid emails', () => {
			const name = 'username@.com';
			const validation = FormValidator.email(name);

			expect(validation.message).toBe(`${name} must be a valid email address.`);
		});
	});
});
