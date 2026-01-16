import type { MedusaResponse } from "@medusajs/framework/http";
import { validate } from "class-validator";
import type { MedusaRequestWithAuth } from "../types/common";

export const _validate = async (
	req: MedusaRequestWithAuth,
	res: MedusaResponse,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	ValidateClass: any,
) => {
	const body = req.body;
	const validateClass = new ValidateClass();
	Object.assign(validateClass, body);
	const errors = await validate(validateClass, {
		whitelist: true,
	});

	req.body = validateClass;

	if (errors.length > 0) {
		const _errors = errors.map((error) => ({
			field: error.property,
			messages: Object.values(error.constraints)?.[0] || "Invalid value",
		}));

		res.status(400).json({
			message: "Validation error",
			errors: _errors,
		});
		return;
	}
};
