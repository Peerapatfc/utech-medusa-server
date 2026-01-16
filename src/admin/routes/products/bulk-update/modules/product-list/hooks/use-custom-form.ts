import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	UpdateProductsVariantsSchema,
	type UpdateProductsVariantsType,
} from '../schema';

export const useCustomForm = () => {
	const form = useForm<UpdateProductsVariantsType>({
		defaultValues: {
			product_ids: [],
			products: {},
		},
		resolver: zodResolver(UpdateProductsVariantsSchema),
	});
	return {
		...form,
	};
};
