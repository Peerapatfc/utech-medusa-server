import { Badge, Button, Heading, Table, Text } from '@medusajs/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	useAddAttributesToCategory,
	useCategoryAttributes,
	useProductAttributes,
} from '../../../../../hooks/api/product-attributes.tsx';
import type {
	ProductAttribute,
	ProductAttributeCategory,
} from '../../../../../types/attribute';

interface TableData {
	data: ProductAttribute[];
}

interface AddAttributesToCategoryFormProps {
	category: ProductAttributeCategory;
	onClose: () => void;
}

/**
 * Modal form component for adding attributes to a category
 * Similar to AddProductsToCollectionForm in collections
 */
const AddAttributesToCategoryForm = ({
	category,
	onClose,
}: AddAttributesToCategoryFormProps) => {
	const { t } = useTranslation();
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [errorMessage, setErrorMessage] = useState<string>('');

	// Fetch all attributes and category attributes
	const { attributes: allAttributes, isLoading: isLoadingAllAttributes } =
		useProductAttributes();
	const { attributes: categoryAttributes, refetch: refetchCategoryAttributes } =
		useCategoryAttributes(category.id);

	// Mutation for adding attributes
	const addAttributeMutation = useAddAttributesToCategory(category.id);

	// Filter attributes that aren't already in the category
	const availableAttributes = allAttributes.filter(
		(attr) => !categoryAttributes.some((catAttr) => catAttr.id === attr.id),
	);

	// Get the selected attribute IDs from rowSelection
	const selectedAttributes = Object.keys(rowSelection).filter(
		(id) => rowSelection[id],
	);

	// Define table columns
	const columns = [
		{
			id: 'select',
			header: ({ table }: { table: TableData }) => (
				<input
					type='checkbox'
					checked={
						Object.keys(rowSelection).length > 0 &&
						Object.keys(rowSelection).length === availableAttributes.length &&
						Object.values(rowSelection).every(Boolean)
					}
					onChange={(e) => {
						const value = e.target.checked;
						const newSelection: Record<string, boolean> = {};

						// Use for...of instead of forEach
						for (const attr of availableAttributes) {
							newSelection[attr.id] = value;
						}

						setRowSelection(newSelection);
					}}
					className='w-4 h-4'
				/>
			),
			cell: ({ row }: { row: { original: ProductAttribute } }) => {
				const attr = row.original;
				const isSelected = rowSelection[attr.id] || false;

				return (
					<input
						type='checkbox'
						checked={isSelected}
						onChange={() => {
							setRowSelection((prev) => ({
								...prev,
								[attr.id]: !isSelected,
							}));
						}}
						className='w-4 h-4'
					/>
				);
			},
			width: '40px',
		},
		{
			id: 'title',
			header: 'Title',
			cell: ({ row }: { row: { original: ProductAttribute } }) =>
				row.original.title,
		},
		{
			id: 'description',
			header: 'Description',
			cell: ({ row }: { row: { original: ProductAttribute } }) =>
				row.original.description || '-',
		},
		{
			id: 'status',
			header: 'Status',
			cell: ({ row }: { row: { original: ProductAttribute } }) => (
				<Badge
					className={
						row.original.status
							? 'bg-transparent border-none text-green-500 p-0'
							: 'bg-transparent border-none text-red-500 p-0'
					}
				>
					{row.original.status ? 'Active' : 'Inactive'}
				</Badge>
			),
		},
	];

	// Filter by search term if provided
	const filteredAttributes = searchTerm
		? availableAttributes.filter((attr) =>
				attr.title.toLowerCase().includes(searchTerm.toLowerCase()),
			)
		: availableAttributes;

	const handleSubmit = async () => {
		if (selectedAttributes.length === 0) {
			setErrorMessage('Please select at least one attribute');
			return;
		}

		try {
			setIsSubmitting(true);
			setErrorMessage('');
			await addAttributeMutation.mutateAsync(selectedAttributes);
			await refetchCategoryAttributes();
			onClose();
		} catch (error) {
			console.error('Error adding attributes:', error);
			if (error instanceof Error) {
				setErrorMessage(error.message || 'Failed to add attributes');
			} else {
				setErrorMessage('Failed to add attributes');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='flex flex-col h-full max-h-[100vh]'>
			<div className='flex items-center justify-between p-4 border-b'>
				<Heading level='h3'>Add Attributes to {category.name}</Heading>
				<div className='flex items-center gap-x-2'>
					<Button variant='secondary' size='small' onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant='primary'
						size='small'
						onClick={handleSubmit}
						disabled={selectedAttributes.length === 0 || isSubmitting}
					>
						{isSubmitting
							? 'Adding...'
							: `Add Attributes${selectedAttributes.length > 0 ? ` (${selectedAttributes.length})` : ''}`}
					</Button>
				</div>
			</div>

			{errorMessage && (
				<div className='p-4 bg-red-50 text-red-500'>{errorMessage}</div>
			)}

			<div className='p-4 flex flex-col flex-1 overflow-hidden'>
				<div className='mb-4'>
					<input
						type='text'
						placeholder='Search attributes...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full p-2 border border-gray-300 rounded-md'
					/>
				</div>

				{isLoadingAllAttributes ? (
					<div className='flex items-center justify-center py-8'>
						<div className='animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent' />
						<Text className='ml-2'>Loading attributes...</Text>
					</div>
				) : filteredAttributes.length === 0 ? (
					<div className='text-center py-8'>
						<Text>No attributes found</Text>
					</div>
				) : (
					<div className='overflow-y-auto flex-1 border rounded'>
						<Table>
							<Table.Header>
								<Table.Row>
									{columns.map((column) => (
										<Table.HeaderCell key={column.id}>
											{typeof column.header === 'function'
												? column.header({ table: { data: filteredAttributes } })
												: column.header}
										</Table.HeaderCell>
									))}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{filteredAttributes.map((attr) => (
									<Table.Row
										key={attr.id}
										className={
											rowSelection[attr.id]
												? 'bg-blue-50 dark:bg-blue-950 text-zinc-500 dark:text-zinc-400'
												: ''
										}
										onClick={() => {
											setRowSelection((prev) => ({
												...prev,
												[attr.id]: !rowSelection[attr.id],
											}));
										}}
									>
										{columns.map((column) => (
											<Table.Cell key={`${attr.id}-${column.id}`}>
												{column.cell({
													row: {
														original: attr,
													},
												})}
											</Table.Cell>
										))}
									</Table.Row>
								))}
							</Table.Body>
						</Table>
					</div>
				)}

				{selectedAttributes.length > 0 && (
					<div className='mt-4 text-sm text-gray-600'>
						{selectedAttributes.length} attribute
						{selectedAttributes.length !== 1 ? 's' : ''} selected
					</div>
				)}
			</div>
		</div>
	);
};

export default AddAttributesToCategoryForm;
