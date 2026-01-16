import { ArrowLeft, PencilSquare, Plus, Trash } from '@medusajs/icons';
import {
	Button,
	Container,
	Heading,
	Skeleton,
	Table,
	Text,
	usePrompt,
} from '@medusajs/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SingleColumnPage } from '../../../components/layout/pages';
import type {
	ProductAttribute,
	ProductAttributeCategory,
} from '../../../types/attribute';

// Import the actual hooks implementations
import {
	useDeleteProductAttributeCategory,
	useProductAttributeCategory,
} from '../../../hooks/api/product-attribute-categories.tsx';

import { RouteFocusModal } from '../../../components/route-modal';
import {
	useCategoryAttributes,
	useRemoveAttributesFromCategory,
} from '../../../hooks/api/product-attributes.tsx';

// Import the AddAttributesToCategoryForm component
import AddAttributesToCategoryForm from './components/add-attributes-form';

// Import ActionMenu component
import { ActionMenu } from '../../../components/common/action-menu';

// Define the component props type
type CategorySectionProps = {
	category: ProductAttributeCategory;
	onDelete: () => Promise<void>;
};

/**
 * ProductAttributeCategoryDetailPage displays the details of a product attribute category
 * using the SingleColumnPage layout, following the pattern from the collection detail page.
 */
const ProductAttributeCategoryDetailPage = () => {
	const { id } = useParams();
	const { t } = useTranslation();
	const prompt = usePrompt();
	const navigate = useNavigate();
	const [showAddModal, setShowAddModal] = useState(false);

	const { product_attribute_category, isLoading, isError, error } =
		useProductAttributeCategory(id || '', {
			refetchOnMount: 'always',
			staleTime: 0,
		});

	const deleteCategory = useDeleteProductAttributeCategory(id || '');

	const handleDelete = async () => {
		if (!id || !product_attribute_category) return;

		const res = await prompt({
			title:
				t('general.areYouSure') || `Delete ${product_attribute_category.name}`,
			description:
				t('collections.deleteWarning', {
					count: 1,
					title: product_attribute_category.name,
				}) ||
				'Are you sure you want to delete this category? This action cannot be undone.',
			confirmText: t('actions.delete') || 'Yes, delete',
			cancelText: t('actions.cancel') || 'Cancel',
		});

		if (!res) {
			return;
		}

		try {
			await deleteCategory.mutateAsync();
			// Navigate back to the list page
			navigate('/product-attribute-categories');
		} catch (error) {
			console.error('Error deleting category:', error);
		}
	};

	if (isLoading) {
		return (
			<div className='flex flex-col gap-y-8 max-w-[1280px] px-8 pb-16'>
				<div className='flex items-center gap-x-2'>
					<Link to='/product-attribute-categories'>
						<Button variant='secondary' className='flex items-center gap-x-1'>
							<ArrowLeft />
							Back
						</Button>
					</Link>
				</div>

				<Container className='p-0'>
					<div className='px-6 py-4'>
						<Skeleton className='w-1/3 h-8' />
					</div>
					<div className='px-6 py-12 flex flex-col gap-y-4'>
						<Skeleton className='w-full h-6' />
						<Skeleton className='w-full h-6' />
						<Skeleton className='w-2/3 h-6' />
					</div>
				</Container>
			</div>
		);
	}

	if (isError) {
		throw error;
	}

	if (!product_attribute_category) {
		return (
			<div className='flex w-full max-w-[1600px] flex-col gap-y-2 p-3'>
				<div className='flex flex-col items-center justify-center h-96 gap-y-2'>
					<Text className='text-ui-fg-subtle'>Category not found</Text>
					<Link to='/product-attribute-categories'>
						<Button variant='secondary'>Back to categories</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='flex w-full max-w-[1600px] flex-col gap-y-2'>
			{/* Main Content using SingleColumnPage layout */}
			<SingleColumnPage showJSON showMetadata data={product_attribute_category}>
				<ProductAttributeCategoryGeneralSection
					category={product_attribute_category}
					onDelete={handleDelete}
					onEdit={() => navigate(`/product-attribute-categories/${id}/edit`)}
				/>
				<CategoryAttributesSection
					categoryId={id || ''}
					onAddClick={() => setShowAddModal(true)}
				/>
			</SingleColumnPage>

			{/* Add Attributes Modal */}
			{showAddModal && (
				<RouteFocusModal>
					<AddAttributesToCategoryForm
						category={product_attribute_category}
						onClose={() => setShowAddModal(false)}
					/>
				</RouteFocusModal>
			)}
		</div>
	);
};

/**
 * General section component displaying the main information about a product attribute category
 * Following the pattern of CollectionGeneralSection
 */
const ProductAttributeCategoryGeneralSection = ({
	category,
	onDelete,
	onEdit,
}: CategorySectionProps & { onEdit: () => void }) => {
	const { t } = useTranslation();

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<div className='flex flex-col gap-y-1'>
					<Heading>{category.name}</Heading>
				</div>
				<ActionMenu
					groups={[
						{
							actions: [
								{
									icon: <PencilSquare />,
									label: 'Edit',
									onClick: onEdit,
									disabled: !category.id,
								},
							],
						},
						{
							actions: [
								{
									icon: <Trash />,
									label: 'Delete',
									onClick: onDelete,
									disabled: !category.id,
								},
							],
						},
					]}
				/>
			</div>
			<div className='text-ui-fg-subtle grid grid-cols-2 gap-3 px-6 py-4'>
				<Text size='small' leading='compact' weight='plus'>
					{t('fields.description') || 'Description'}
				</Text>
				<Text size='small' leading='compact'>
					{category.description || '-'}
				</Text>
			</div>
			{/* Display metadata if available */}
			{category.metadata && Object.keys(category.metadata).length > 0 && (
				<div className='text-ui-fg-subtle grid grid-cols-2 gap-3 px-6 py-4'>
					<Text size='small' leading='compact' weight='plus'>
						{t('fields.metadata') || 'Metadata'}
					</Text>
					<Text size='small' leading='compact'>
						{JSON.stringify(category.metadata)}
					</Text>
				</div>
			)}
		</Container>
	);
};

/**
 * Component for attribute actions
 */
const AttributeActions = ({
	attribute,
	categoryId,
	onRemove,
	isRemoving,
}: {
	attribute: ProductAttribute;
	categoryId: string;
	onRemove: (attributeId: string) => Promise<void>;
	isRemoving: boolean;
}) => {
	const { t } = useTranslation();
	const prompt = usePrompt();
	const navigate = useNavigate();

	const handleRemove = async () => {
		const res = await prompt({
			title: t('general.areYouSure') || 'Are you sure?',
			description: `Are you sure you want to remove ${attribute.title} from this product attribute category?`,
			confirmText: t('actions.remove') || 'Remove',
			cancelText: t('actions.cancel') || 'Cancel',
		});

		if (!res) {
			return;
		}

		await onRemove(attribute.id);
	};

	return (
		<div className='flex justify-end'>
			<ActionMenu
				groups={[
					{
						actions: [
							{
								icon: <PencilSquare />,
								label: 'Edit',
								to: `/product-attributes/${attribute.id}/edit`,
								disabled: !attribute.id,
							},
						],
					},
					{
						actions: [
							{
								icon: <Trash />,
								label: 'Remove',
								onClick: handleRemove,
								disabled: isRemoving || !attribute.id,
							},
						],
					},
				]}
			/>
		</div>
	);
};

// Create a column helper for ProductAttribute
const columnHelper = createColumnHelper<ProductAttribute>();

// Hook to generate attribute table columns
const useAttributeColumns = (
	categoryId: string,
	onRemove: (attributeId: string) => Promise<void>,
	isRemoving: boolean,
) => {
	return useMemo(
		() => [
			columnHelper.accessor('title', {
				header: 'Title',
				cell: ({ getValue }) => getValue(),
			}),
			columnHelper.accessor('description', {
				header: 'Description',
				cell: ({ getValue }) => getValue() || '-',
			}),
			columnHelper.accessor('status', {
				header: 'Status',
				cell: ({ getValue }) => (
					<div className='flex items-center gap-1.5'>
						<div
							className={`w-2 h-2 rounded-full ${
								getValue() ? 'bg-green-500' : 'bg-gray-400'
							}`}
						/>
						<Text>{getValue() ? 'Active' : 'Inactive'}</Text>
					</div>
				),
			}),
			columnHelper.accessor('rank', {
				header: 'Rank',
				cell: ({ getValue }) => (getValue() !== undefined ? getValue() : '-'),
			}),
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) => (
					<AttributeActions
						attribute={row.original}
						categoryId={categoryId}
						onRemove={onRemove}
						isRemoving={isRemoving}
					/>
				),
			}),
		],
		[categoryId, onRemove, isRemoving],
	);
};

/**
 * Component to manage attributes assigned to a category
 */
const CategoryAttributesSection = ({
	categoryId,
	onAddClick,
}: {
	categoryId: string;
	onAddClick: () => void;
}) => {
	const { t } = useTranslation();
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isRemoving, setIsRemoving] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10; // Number of items to show per page

	// Custom hooks for attribute management
	const {
		attributes,
		isLoading: isLoadingCategoryAttributes,
		refetch: refetchCategoryAttributes,
	} = useCategoryAttributes(categoryId);

	const removeAttributeMutation = useRemoveAttributesFromCategory(categoryId);

	const handleRemoveAttribute = async (attributeId: string) => {
		try {
			setIsRemoving(true);
			setErrorMessage('');
			await removeAttributeMutation.mutateAsync([attributeId]);
			refetchCategoryAttributes();
		} catch (error) {
			console.error('Error removing attribute from category:', error);
			if (error instanceof Error) {
				setErrorMessage(
					error.message || 'Failed to remove attribute from category',
				);
			} else {
				setErrorMessage('Failed to remove attribute from category');
			}
		} finally {
			setIsRemoving(false);
		}
	};

	// Get columns using the custom hook
	const columns = useAttributeColumns(
		categoryId,
		handleRemoveAttribute,
		isRemoving,
	);

	// Calculate pagination values
	const totalItems = attributes.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const start = (currentPage - 1) * itemsPerPage + 1;
	const end = Math.min(currentPage * itemsPerPage, totalItems);

	// Get the current page of attributes
	const currentAttributes = attributes.slice(start - 1, end);

	// Handle page changes
	const goToNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const goToPrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	return (
		<Container className='p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>{t('Assigned Attributes')}</Heading>
				<Button variant='secondary' size='small' onClick={onAddClick}>
					<Plus className='mr-2' />
					Add Attributes
				</Button>
			</div>

			{errorMessage && (
				<div className='px-6 py-2 mb-4 bg-red-50 text-red-500 rounded'>
					{errorMessage}
				</div>
			)}

			<div className='px-6 py-4'>
				{isLoadingCategoryAttributes ? (
					<div className='py-4 flex items-center'>
						<div className='animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent' />
						<Text className='ml-2'>Loading attributes...</Text>
					</div>
				) : attributes.length === 0 ? (
					<div className='py-4 text-center'>
						<Text className='text-ui-fg-subtle'>
							No attributes assigned to this category
						</Text>
					</div>
				) : (
					<>
						<Table>
							<Table.Header>
								<Table.Row>
									{columns.map((column) => (
										<Table.HeaderCell key={column.id || String(column.header)}>
											{column.header}
										</Table.HeaderCell>
									))}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{currentAttributes.map((attribute: ProductAttribute) => (
									<Table.Row key={attribute.id}>
										{columns.map((column) => (
											<Table.Cell
												key={`${attribute.id}-${column.id || String(column.header)}`}
											>
												{column.cell({
													getValue: () => {
														if (column.accessorKey) {
															return attribute[
																column.accessorKey as keyof ProductAttribute
															];
														}
														return null;
													},
													row: {
														original: attribute,
													},
												})}
											</Table.Cell>
										))}
									</Table.Row>
								))}
							</Table.Body>
						</Table>

						{/* Pagination information */}
						<div className='flex items-center justify-between mt-4 text-sm text-gray-500'>
							<div>
								{totalItems > 0 && (
									<span>
										{start} — {end} of {totalItems} results
									</span>
								)}
							</div>
							<div className='flex items-center gap-x-2'>
								<span>
									{currentPage} of {totalPages} pages
								</span>
								<div className='flex items-center gap-x-1'>
									<Button
										variant='secondary'
										size='small'
										onClick={goToPrevPage}
										disabled={currentPage === 1}
									>
										Prev
									</Button>
									<Button
										variant='secondary'
										size='small'
										onClick={goToNextPage}
										disabled={currentPage === totalPages}
									>
										Next
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</Container>
	);
};

export default ProductAttributeCategoryDetailPage;
