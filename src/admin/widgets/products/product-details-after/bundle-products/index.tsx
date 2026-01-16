import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Button, Container, FocusModal, Heading, toast } from '@medusajs/ui';
import type { z } from 'zod';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilSquare } from '@medusajs/icons';
import { useParams } from 'react-router-dom';
import { useUpdateProduct } from '../../../../hooks/api/products';
import { useEffect, useState } from 'react';
import { ActionMenu } from '../../../../components/common/action-menu';
import { sdk } from '../../../../lib/client';
import type { AdminProduct } from '@medusajs/framework/types';
import AddProductsModal from '../../../../components/bundle-products/modules/add-products-modal';
import BundlesForm from '../../../../components/bundle-products/components/bundles-form';
import {
	CustomOptionSchema,
	initialTabState,
	Tab,
	tabOrder,
	type TabState,
} from '../../../../components/bundle-products/common/schemas';

const CustomOptionsWidget = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(true);
	const [showAddProductModal, setShowAddProductModal] = useState(false);
	const [tab, setTab] = useState<Tab>(Tab.PRODUCT);
	const [tabState, setTabState] = useState<TabState>(initialTabState);
	const [indexBundle, setIndexBundle] = useState<number>();
	const form = useForm<z.infer<typeof CustomOptionSchema>>({
		resolver: zodResolver(CustomOptionSchema),
	});
	const { handleSubmit, setValue, getValues } = form;

	const { id } = useParams();
	const [product, setProduct] = useState<AdminProduct>();
	const { mutateAsync } = useUpdateProduct(id ?? '');

	const onSubmit = handleSubmit(
		async (data: z.infer<typeof CustomOptionSchema>) => {
			setIsLoading(true);
			const updatedMetadata = {
				...product?.metadata,
				bundles: data.bundles,
			};
			setValue('bundles', data.bundles);

			try {
				await mutateAsync({ metadata: updatedMetadata });
				toast.success('Custom options were successfully updated.');
				setTimeout(async () => {
					if (id) {
						const { product } = await sdk.admin.product.retrieve(id);
						setProduct(product);
					}
				}, 500);
				setIsLoading(false);
				setIsView(true);
			} catch (error) {
				toast.error((error as Error).message);
				setIsLoading(false);
			}
		},
	);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'bundles',
		keyName: 'bundles',
	});

	const cancelEdit = () => {
		if (product?.metadata?.bundles) {
			remove();
			setTimeout(() => {
				/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */
				setValue('bundles', product?.metadata?.bundles as any);
			}, 10);
		}
		setIsView(true);
	};

	const handleRemove = (index: number) => {
		const bundles = getValues('bundles');
		remove();
		setTimeout(() => {
			const bds = bundles.filter((_bundle, i: number) => i !== index);
			setValue('bundles', bds);
		}, 10);
	};

	useEffect(() => {
		if (product?.metadata?.bundles && getValues('bundles').length === 0) {
			/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */
			setValue('bundles', product?.metadata?.bundles as any);
		}
	}, [product, setValue, getValues]);

	useEffect(() => {
		const fetchData = async () => {
			if (id) {
				const { product } = await sdk.admin.product.retrieve(id);
				setProduct(product);
			}
		};
		fetchData();
	}, [id]);

	const handleShowAddProductModal = (indexBundle: number, tab: Tab) => {
		setIndexBundle(indexBundle);
		setShowAddProductModal(true);
		handleChangeTab(tab);
	};

	const handleChangeTab = (update: Tab) => {
		if (tabOrder.indexOf(update) < tabOrder.indexOf(tab)) {
			setTabState((prev) => ({
				...prev,
				[tab]: 'not-started',
				[update]: 'in-progress',
			}));

			setTab(update);
			return;
		}

		const tabs = tabOrder.slice(0, tabOrder.indexOf(update));
		for (const tab of tabs) {
			if (tab === Tab.PRODUCT) {
				setTabState((prev) => ({
					...prev,
					[tab]: 'completed',
				}));
			}
		}
		if (update === Tab.PRODUCT) {
			setTabState((prev) => ({
				...prev,
				[Tab.PRODUCT]: 'in-progress',
			}));
		}
		if (update === Tab.VARIANT) {
			setTabState((prev) => ({
				...prev,
				[Tab.VARIANT]: 'in-progress',
			}));
		}
		setTab(update);
	};

	const handleNextTab = (tab: Tab) => {
		const nextTab = tabOrder[tabOrder.indexOf(tab) + 1];
		handleChangeTab(nextTab);
	};

	return (
		<Container className='divide-y p-0'>
			<FormProvider {...form}>
				<form onSubmit={onSubmit} encType='text/plain'>
					<div className='flex items-center justify-between px-6 py-4'>
						<Heading level='h2'>Custom Options</Heading>
						{!isView ? (
							<div className='flex items-center gap-2'>
								{!!fields.length && (
									<Button
										variant='secondary'
										size='small'
										type='button'
										disabled={isLoading}
										onClick={() => remove()}
									>
										Clear All
									</Button>
								)}
								<Button
									variant='primary'
									size='small'
									type='button'
									disabled={isLoading}
									onClick={() => {
										append({
											title_th: '',
											title_en: '',
											description_th: '',
											description_en: '',
											selectType: '',
											isRequired: false,
											products: [],
										});
									}}
								>
									Add Option
								</Button>
								<Button
									variant='primary'
									size='small'
									type='submit'
									isLoading={isLoading}
								>
									Save
								</Button>
								<Button
									variant='secondary'
									size='small'
									type='button'
									onClick={() => cancelEdit()}
								>
									Cancel
								</Button>
							</div>
						) : (
							<ActionMenu
								groups={[
									{
										actions: [
											{
												label: 'Edit',
												onClick: () => setIsView(false),
												icon: <PencilSquare />,
											},
										],
									},
								]}
							/>
						)}
					</div>
					<div className='overflow-auto'>
						{fields.length === 0 ? (
							<div className='flex flex-col items-center justify-center text-ui-fg-subtle'>
								<h3 className='text-[13px] font-bold text-[#27272A] leading-relaxed'>
									No Records
								</h3>
								<div className='text-center text-[11px] text-[#4B5563] font-normal leading-relaxed mb-6'>
									There are no bundle options in the product.
								</div>
							</div>
						) : (
							<BundlesForm
								fields={fields}
								form={form}
								isLoading={isLoading}
								isView={isView}
								handleRemove={handleRemove}
								getValues={getValues}
								setValue={setValue}
								handleShowAddProductModal={handleShowAddProductModal}
							/>
						)}
					</div>
				</form>
			</FormProvider>
			{showAddProductModal && typeof indexBundle !== 'undefined' && (
				<FocusModal
					open={showAddProductModal}
					onOpenChange={() => {
						setShowAddProductModal(!showAddProductModal);
					}}
				>
					<AddProductsModal
						indexBundle={indexBundle}
						setShowAddProductModal={setShowAddProductModal}
						getValues={getValues}
						setValue={setValue}
						tab={tab}
						tabState={tabState}
						handleChangeTab={handleChangeTab}
						handleNextTab={handleNextTab}
					/>
				</FocusModal>
			)}
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product.details.after',
});

export default CustomOptionsWidget;
