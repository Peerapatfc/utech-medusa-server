import type {
	Noop,
	RefCallBack,
	UseFieldArrayUpdate,
	UseFormGetValues,
} from 'react-hook-form';
import { Form } from '../../../common/form';
import { Select } from '@medusajs/ui';
import { useProductVariants } from '../../../../hooks/api/products';
import type { AdminProductVariant } from '@medusajs/framework/types';
import type { z } from 'zod';
import type { CustomOptionSchema } from '../../common/schemas';

type Props = {
	productId: string;
	field: {
		onBlur: Noop;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		value: any;
		disabled?: boolean;
		name: `bundles.${number}.products.${number}.variantId`;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		onChange: (...event: any[]) => void;
	};
	selectRef: RefCallBack;
	isLoading: boolean;
	isView: boolean;
	nestIndex: number;
	index: number;
	update: UseFieldArrayUpdate<
		z.infer<typeof CustomOptionSchema>,
		`bundles.${number}.products`
	>;
	getValues: UseFormGetValues<z.infer<typeof CustomOptionSchema>>;
};

const ProductVariantSelect = ({
	productId,
	field,
	selectRef,
	isLoading,
	isView,
	nestIndex,
	index,
	update,
	getValues,
}: Props) => {
	const { variants } =
		productId !== '' ? useProductVariants(productId) : { variants: [] };
	return (
		<Form.Item className='w-full'>
			<Form.Control>
				<Select
					{...field}
					value={field.value}
					onValueChange={(value) => {
						const variant = variants?.find(
							(variant: { id: string }) => variant.id === value,
						);
						field.onChange(value);
						update(index, {
							index: index,
							productId,
							productTitle: getValues(
								`bundles.${nestIndex}.products.${index}.productTitle`,
							),
							title: getValues(`bundles.${nestIndex}.products.${index}.title`),
							variantId: value,
							variantTitle: variant?.title ?? '',
							price: getValues(`bundles.${nestIndex}.products.${index}.price`),
						});
					}}
					disabled={isLoading || isView}
				>
					<Select.Trigger ref={selectRef} className='bg-ui-bg-base truncate'>
						<Select.Value placeholder='Select Variant' />
					</Select.Trigger>

					<Select.Content>
						{variants?.map((variant: AdminProductVariant, index: number) => (
							<Select.Item key={index.toString()} value={variant.id}>
								<span className='text-ui-fg-subtle'>{variant.title}</span>
							</Select.Item>
						))}
					</Select.Content>
				</Select>
			</Form.Control>

			<Form.ErrorMessage />
		</Form.Item>
	);
};

export default ProductVariantSelect;
