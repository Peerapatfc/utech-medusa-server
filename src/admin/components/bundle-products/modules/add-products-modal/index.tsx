import { Button, FocusModal, ProgressTabs } from '@medusajs/ui';
import {
	FormProvider,
	useForm,
	type UseFormSetValue,
	type UseFormGetValues,
} from 'react-hook-form';
import type { z } from 'zod';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { ProductLists } from './product-lists';
import { VariantLists } from './variant-lists';
import {
	type CustomOptionSchema,
	type ProductRecordSchema,
	Tab,
	type TabState,
} from '../../common/schemas';

interface ProductRecordForm extends z.infer<typeof ProductRecordSchema> {
	isSelected: boolean;
}

function getInitialSelection(products: { id: string }[]) {
	return products.reduce((acc, curr) => {
		acc[curr.id] = true;
		return acc;
	}, {} as RowSelectionState);
}

const AddProductsModal = ({
	indexBundle,
	setShowAddProductModal,
	getValues,
	setValue,
	tab,
	tabState,
	handleChangeTab,
	handleNextTab,
}: {
	indexBundle: number;
	setShowAddProductModal: Dispatch<SetStateAction<boolean>>;
	getValues: UseFormGetValues<z.infer<typeof CustomOptionSchema>>;
	setValue: UseFormSetValue<z.infer<typeof CustomOptionSchema>>;
	tab: Tab;
	tabState: TabState;
	handleChangeTab: (update: Tab) => void;
	handleNextTab: (tab: Tab) => void;
}) => {
	const { t } = useTranslation();
	const productRecords = getValues(`bundles.${indexBundle}.products`);
	const selectType = getValues(`bundles.${indexBundle}.selectType`);
	const selectedIds = productRecords.map((product) => ({
		id: product.productId,
	}));
	const variantIdMap = useMemo(() => {
		return productRecords.reduce(
			(acc, curr) => {
				acc[curr.variantId] = true;
				return acc;
			},
			{} as Record<string, boolean>,
		);
	}, [productRecords]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>(
		getInitialSelection(selectedIds),
	);

	const form = useForm<{ products: ProductRecordForm[] }>();

	const handleSubmit = form.handleSubmit(async (values) => {
		const products: z.infer<typeof ProductRecordSchema>[] = [];
		let index = 0;
		for (const value of values.products) {
			if (value.isSelected) {
				products.push({
					index,
					title: value.title,
					productId: value.productId,
					productTitle: value.productTitle,
					variantId: value.variantId,
					variantTitle: value.variantTitle,
					price: value.price,
				});
				index++;
			}
		}
		setValue(`bundles.${indexBundle}.products`, products);
		setShowAddProductModal(false);
	});

	return (
		<FocusModal.Content>
			<ProgressTabs
				value={tab}
				onValueChange={(tab) => handleChangeTab(tab as Tab)}
				className='flex h-full flex-col overflow-hidden'
			>
				<FormProvider {...form}>
					<form
						onSubmit={handleSubmit}
						encType='text/plain'
						className='flex h-full flex-col'
					>
						<FocusModal.Header>
							<div className='flex w-full items-center justify-between gap-x-4'>
								<div className='-my-2 w-full max-w-[600px] border-l'>
									<ProgressTabs.List className='grid w-full grid-cols-3'>
										<ProgressTabs.Trigger
											status={tabState.product}
											value={Tab.PRODUCT}
										>
											{'Products'}
										</ProgressTabs.Trigger>
										<ProgressTabs.Trigger
											status={tabState.variant}
											value={Tab.VARIANT}
										>
											{'Variants'}
										</ProgressTabs.Trigger>
									</ProgressTabs.List>
								</div>
							</div>
						</FocusModal.Header>
						<FocusModal.Body className='bg-ui-bg-subtle flex flex-1 flex-col overflow-y-auto max-h-dvh'>
							<FocusModal.Title className='sr-only' />
							<ProgressTabs.Content
								className='size-full overflow-y-auto'
								value={Tab.PRODUCT}
							>
								<ProductLists
									rowSelection={rowSelection}
									setRowSelection={setRowSelection}
									variantIdMap={variantIdMap}
								/>
							</ProgressTabs.Content>
							<ProgressTabs.Content
								className='size-full overflow-hidden'
								value={Tab.VARIANT}
							>
								<VariantLists
									rowSelection={rowSelection}
									form={form}
									productRecords={productRecords}
									selectType={selectType}
								/>
							</ProgressTabs.Content>
						</FocusModal.Body>
						<FocusModal.Footer>
							<div className='flex items-center justify-end gap-x-2'>
								<FocusModal.Close asChild>
									<Button variant='secondary' size='small'>
										{t('actions.cancel')}
									</Button>
								</FocusModal.Close>
								<PrimaryButton tab={tab} next={handleNextTab} />
							</div>
						</FocusModal.Footer>
					</form>
				</FormProvider>
			</ProgressTabs>
		</FocusModal.Content>
	);
};

type PrimaryButtonProps = {
	tab: Tab;
	next: (tab: Tab) => void;
	isLoading?: boolean;
};

const PrimaryButton = ({ tab, next, isLoading }: PrimaryButtonProps) => {
	const { t } = useTranslation();

	if (tab === Tab.VARIANT) {
		return (
			<Button
				key='submit-button'
				type='submit'
				variant='primary'
				size='small'
				isLoading={isLoading}
			>
				{t('actions.save')}
			</Button>
		);
	}

	return (
		<Button
			key='next-button'
			type='button'
			variant='primary'
			size='small'
			onClick={() => next(tab)}
		>
			{t('actions.continue')}
		</Button>
	);
};

export default AddProductsModal;
