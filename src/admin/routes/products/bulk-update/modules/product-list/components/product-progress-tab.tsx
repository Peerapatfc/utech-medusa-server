import type { HttpTypes } from '@medusajs/framework/types';
import { Button, ProgressTabs, toast } from '@medusajs/ui';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboundForm as KeyboardForm } from '../../../../../../../admin/components/utilities/keybound-form';
import { useBulkUpdateProducts } from '../../../../../../../admin/hooks/api/products';
import {
	RouteFocusModal,
	useRouteModal,
} from '../../../../../../components/modals';
import { useFormatProductPayload } from '../hooks/use-format-product-payload';
import { useProgressTab } from '../hooks/use-progress-tab';
import type { UpdateProductsVariantsType } from '../schema';
import { type InitialStatus, Tab } from '../type/tab';
import ProductListTable from './product-list';
import ProductPriceTable from './product-price-table';

interface PropForm {
	form: UseFormReturn<UpdateProductsVariantsType>;
	currencies: HttpTypes.AdminStoreCurrency[];
	regions: HttpTypes.AdminRegion[];
	pricePreferences: HttpTypes.AdminPricePreference[];
}

const ProductProgressTabs = ({ form, ...otherProps }: PropForm) => {
	const { watch } = form;
	const selectedProducts = watch('product_ids');
	const lockedTab = selectedProducts.length === 0;
	const tabNames = [Tab.PRODUCT, Tab.PRICE];
	const { tabStatus, selectedTab, handleNextTab, handleChangeTab } =
		useProgressTab({
			tabNames,
			lockedTab,
		});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { formatPayload } = useFormatProductPayload();
	const { mutateAsync } = useBulkUpdateProducts();
	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();

	const handleSubmit = form.handleSubmit(async (data) => {
		setIsLoading(true);
		const payload = {
			updates: formatPayload(data.products, otherProps.regions),
		};
		try {
			await mutateAsync(payload);
			toast.success('Prices and Inventory level updated successfully');
			handleSuccess('../');
		} catch (error) {
			const errorMessage =
				error && typeof error === 'object' && 'message' in error
					? (error as { message?: string }).message
					: 'Something went wrong';
			toast.error(t('general.error'), {
				description: errorMessage,
			});
		} finally {
			setIsLoading(false);
		}
	});

	return (
		<KeyboardForm onSubmit={handleSubmit} className='size-full'>
			<ProgressTabs
				value={selectedTab}
				onValueChange={(tab) => handleChangeTab(tab as Tab)}
				className='flex h-full flex-col overflow-hidden'
			>
				<Header tabStatus={tabStatus} />
				<Body form={form} {...otherProps} />
				<Footer
					selectedTab={selectedTab}
					handleNextTab={handleNextTab}
					isLoading={isLoading}
				/>
			</ProgressTabs>
		</KeyboardForm>
	);
};

export default ProductProgressTabs;

const Header = ({ tabStatus }: { tabStatus: InitialStatus }) => {
	const { t } = useTranslation();
	return (
		<RouteFocusModal.Header>
			<div className='flex w-full items-center justify-between gap-x-4'>
				<div className='-my-2 w-full max-w-[400px] border-l bg-blue-200'>
					<ProgressTabs.List className='grid w-full grid-cols-2'>
						<ProgressTabs.Trigger
							status={tabStatus[Tab.PRODUCT]}
							value={Tab.PRODUCT}
						>
							{t('priceLists.create.tabs.products')}
						</ProgressTabs.Trigger>
						<ProgressTabs.Trigger
							status={tabStatus[Tab.PRICE]}
							value={Tab.PRICE}
						>
							Bulk Update
						</ProgressTabs.Trigger>
					</ProgressTabs.List>
				</div>
			</div>
		</RouteFocusModal.Header>
	);
};

const Body = ({ form, ...otherProps }: PropForm) => {
	return (
		<RouteFocusModal.Body className='size-full overflow-hidden'>
			<ProgressTabs.Content
				className='size-full overflow-y-auto'
				value={Tab.PRODUCT}
			>
				<ProductListTable form={form} />
			</ProgressTabs.Content>
			<ProgressTabs.Content
				className='size-full overflow-hidden'
				value={Tab.PRICE}
			>
				<ProductPriceTable form={form} {...otherProps} />
			</ProgressTabs.Content>
		</RouteFocusModal.Body>
	);
};
const Footer = ({
	selectedTab,
	isLoading,
	handleNextTab,
}: {
	selectedTab: Tab;
	isLoading: boolean;
	handleNextTab: (selectedTab: Tab) => void;
}) => {
	const { t } = useTranslation();
	return (
		<RouteFocusModal.Footer>
			<div className='flex items-center justify-end gap-x-2'>
				<RouteFocusModal.Close asChild>
					<Button variant='secondary' size='small'>
						{t('actions.cancel')}
					</Button>
				</RouteFocusModal.Close>
				<PrimaryButton
					tab={selectedTab}
					next={handleNextTab}
					isLoading={isLoading}
				/>
			</div>
		</RouteFocusModal.Footer>
	);
};

type PrimaryButtonProps = {
	tab: Tab;
	next: (tab: Tab) => void;
	isLoading?: boolean;
};

const PrimaryButton = ({ tab, next, isLoading }: PrimaryButtonProps) => {
	const { t } = useTranslation();

	if (tab === Tab.PRICE) {
		return (
			<Button
				key='submit-button'
				type='submit'
				variant='primary'
				size='small'
				isLoading={isLoading}
				disabled={isLoading}
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
			disabled={isLoading}
		>
			{t('actions.continue')}
		</Button>
	);
};
