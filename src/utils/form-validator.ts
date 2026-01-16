import { z } from 'zod';

const emailSchema = z.string().email('email invalid');

const FormValidator = {
	email: (name: string) => {
		const result = emailSchema.safeParse(name);
		if (!result.success) {
			return {
				value: name,
				success: false,
				message: `${name} must be a valid email address.`,
			};
		}
		return {
			value: name,
			success: true,
			message: 'Valid email format.',
		};
	},
};

export default FormValidator;
