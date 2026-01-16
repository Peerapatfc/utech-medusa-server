import { Link, useParams } from 'react-router-dom';
import {
	Container,
	Heading,
	Badge,
	Text,
	Table,
	Button,
	usePrompt,
	toast,
} from '@medusajs/ui';
import { keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PencilSquare, Trash } from '@medusajs/icons';
import { SectionRow } from '../../../../components/common/section';
import {
	usePreOrderTemplate,
	useRemoveProductsFromPreOrderTemplate,
} from '../../../../hooks/api/pre-order-template';
import { dateFormat } from '../../../../lib/date';
import type { HttpTypes } from '@medusajs/framework/types';
import { Thumbnail } from '../../../../components/common/thumbnail';
import { formatCurrency } from '../../../../lib/format-currency';
import { ActionMenu } from '../../../../components/common/action-menu';
import { ProductStatusCell } from '../../../../components/table/table-cells/product/product-status-cell';

const PreOrderTemplateDetail = () => {
	const { id } = useParams();
	if (!id) {
		return null;
	}

	const {
		isPending: isLoading,
		pre_order_template: preOrderTemplate,
		products,
	} = usePreOrderTemplate(
		id,
		{},
		{
			placeholderData: keepPreviousData,
		},
	);

	return (
		<>
			<Container className='divide-y p-0'>
				{isLoading && <Text>Loading...</Text>}
				{preOrderTemplate && (
					<>
						<div className='flex items-center justify-between px-6 py-4'>
							<Heading>Pre-order: {preOrderTemplate.name_th}</Heading>
							<Link to={`/pre-order-campaigns/${id}/edit`}>
								<Button size='small' variant='secondary'>
									<PencilSquare /> Edit
								</Button>
							</Link>
						</div>

						<SectionRow
							title='Name'
							value={
								<div className='flex items-center gap-x-2'>
									<Badge size='small' className='uppercase'>
										{preOrderTemplate.name_th}
									</Badge>
								</div>
							}
						/>

						<SectionRow
							title='Shipping Date'
							value={dateFormat(preOrderTemplate.shipping_start_date)}
						/>

						<SectionRow
							title='Pickup Date'
							value={dateFormat(preOrderTemplate.pickup_start_date)}
						/>

						<SectionRow
							title='Down Payment'
							value={formatCurrency(preOrderTemplate.upfront_price)}
						/>

						<SectionRow
							title='Pickup/Shipping Terms'
							value={
								<div className='flex items-center gap-x-2'>
									<Button
										size='small'
										variant='secondary'
										onClick={() =>
											goToStrapi(
												preOrderTemplate.metadata?.strapi_home_delivery_id,
												'pre-order-pickup-and-shipping-term',
											)
										}
									>
										Home Delivery Terms
									</Button>
									<Button
										size='small'
										variant='secondary'
										onClick={() =>
											goToStrapi(
												preOrderTemplate.metadata?.strapi_in_store_pickup_id,
												'pre-order-pickup-and-shipping-term',
											)
										}
									>
										In-Store Pickup Terms
									</Button>
								</div>
							}
						/>

						<SectionRow
							title='Contens'
							value={
								<div className='flex items-center gap-x-2'>
									<Button
										size='small'
										variant='secondary'
										onClick={() =>
											goToStrapi(
												preOrderTemplate.metadata?.strapi_id,
												'pre-order-campaign',
											)
										}
									>
										Contents
									</Button>
								</div>
							}
						/>
					</>
				)}
			</Container>

			<PreOrderProductsTable products={products} id={id} />
		</>
	);
};

export default PreOrderTemplateDetail;

type PreOrderProductsTableProps = {
	id: string;
	products: HttpTypes.AdminProduct[] | undefined;
};

export const PreOrderProductsTable = ({
	id,
	products,
}: PreOrderProductsTableProps) => {
	const { t } = useTranslation();
	const prompt = usePrompt();

	const { mutateAsync } = useRemoveProductsFromPreOrderTemplate(id);
	const handleDeleteProductFromPreOrder = async (productId: string) => {
		const res = await prompt({
			title: t('general.areYouSure'),
			description: 'Are you sure you want to delete this product?',
			verificationText: 'DELETE',
			verificationInstruction: t('general.typeToConfirm'),
			confirmText: t('actions.delete'),
			cancelText: t('actions.cancel'),
		});

		if (!res) {
			return;
		}

		await mutateAsync({
			product_id: productId,
		});
	};

	return (
		<Container className='mt-10'>
			<div className='flex items-center justify-between px-6 py-4'>
				<div>
					<Heading>Pre-order Products</Heading>
				</div>
				<Link to={`/pre-order-campaigns/${id}/add-products`}>
					<Button size='small' variant='secondary'>
						+ Add Product
					</Button>
				</Link>
			</div>

			<div className='flex gap-1 flex-col'>
				<Table>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>#</Table.HeaderCell>
							<Table.HeaderCell>Product</Table.HeaderCell>
							<Table.HeaderCell>Variants</Table.HeaderCell>
							<Table.HeaderCell>Status</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					{products && (
						<Table.Body>
							{products.map((product, index) => {
								return (
									<Table.Row
										key={product.id}
										className='[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap'
									>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell>
											<div className='flex items-center'>
												<Thumbnail src={product.thumbnail} />
												<div className='ml-2'>{product.title}</div>
											</div>
										</Table.Cell>
										<Table.Cell>{product.variants?.length}</Table.Cell>
										{/* <Table.Cell>0</Table.Cell> */}
										<Table.Cell className='text-ui-fg-muted'>
											<ProductStatusCell status={product.status} />
										</Table.Cell>
										<Table.Cell>
											<ActionMenu
												groups={[
													{
														actions: [
															{
																label: t('actions.delete'),
																onClick: () => {
																	handleDeleteProductFromPreOrder(product.id);
																},
																icon: <Trash />,
																disabled: !product.id,
															},
														],
													},
												]}
											/>
										</Table.Cell>
									</Table.Row>
								);
							})}
						</Table.Body>
					)}
				</Table>
			</div>
		</Container>
	);
};

const getStrapiLink = async (id: number, collection: string) => {
	return fetch(
		`/admin/strapi/generate-link?collection=${collection}&collection_id=${id}`,
		{
			credentials: 'include',
		},
	)
		.then((res) => res.json())
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.error(`Error: ${error}`);
			return null;
		});
};

const goToStrapi = async (id: number | undefined, collection: string) => {
	if (!id) {
		toast.warning('Warning', {
			description: 'Not linked to strapi yet',
		});
		return;
	}

	const { link, message } = await getStrapiLink(id, collection);

	if (link) {
		window.open(link, '_blank');
	} else {
		toast.warning('Warning', {
			description: message,
		});
	}
};
