import {
	type Control,
	useFieldArray,
	type UseFormGetValues,
	type UseFormSetValue,
} from 'react-hook-form';
import type { z } from 'zod';
import OptionValuesModal from './components/option-values-modal';
import type { CustomOptionSchema, Tab } from '../../common/schemas';

type Props = {
	nestIndex: number;
	control: Control<z.infer<typeof CustomOptionSchema>>;
	isLoading: boolean;
	isView: boolean;
	getValues: UseFormGetValues<z.infer<typeof CustomOptionSchema>>;
	setValue: UseFormSetValue<z.infer<typeof CustomOptionSchema>>;
	handleShowAddProductModal: (indexBundle: number, tab: Tab) => void;
};

const CustomOptionField = ({
	nestIndex,
	control,
	isLoading,
	isView,
	getValues,
	setValue,
	handleShowAddProductModal,
}: Props) => {
	const { fields, remove } = useFieldArray({
		control,
		name: `bundles.${nestIndex}.products`,
	});

	const handleRemove = (index: number) => {
		const products = getValues(`bundles.${nestIndex}.products`);
		remove();
		setTimeout(() => {
			const pds = products
				.filter((_product, i: number) => i !== index)
				.map((product, i: number) => ({
					...product,
					index: i,
				}));
			setValue(`bundles.${nestIndex}.products`, pds);
		}, 10);
	};

	return (
		<div className='flex flex-col items-center justify-center text-ui-fg-subtle px-6'>
			<OptionValuesModal
				isView={isView}
				handleShowAddProductModal={handleShowAddProductModal}
				nestIndex={nestIndex}
				handleRemove={handleRemove}
				fields={fields}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default CustomOptionField;
