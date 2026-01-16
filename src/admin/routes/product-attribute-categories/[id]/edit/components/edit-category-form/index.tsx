import {
	Button,
	Container,
	Heading,
	Input,
	Textarea,
	toast,
} from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RouteDrawer } from '../../../../../../components/modals';
import {
	productAttributeCategoryQueryKeys,
	useUpdateProductAttributeCategory,
} from '../../../../../../hooks/api/product-attribute-categories';
import type { ProductAttributeCategory } from '../../../../../../types/attribute';

type EditCategoryFormValues = {
	name: string;
	description: string;
};

type EditCategoryFormProps = {
	category: ProductAttributeCategory;
};

const EditProductAttributeCategoryForm = ({
	category,
}: EditCategoryFormProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useForm<EditCategoryFormValues>({
		defaultValues: {
			name: category.name,
			description: category.description || '',
		},
	});

	const {
		register,
		handleSubmit,
		formState: { isDirty, isSubmitting },
	} = form;

	const updateCategory = useUpdateProductAttributeCategory(category.id);

	const onSubmit = async (data: EditCategoryFormValues) => {
		try {
			// Call the API to update the category
			await updateCategory.mutateAsync({
				name: data.name,
				description: data.description,
			});
			// Show success notification
			toast.success('Category updated successfully');
			queryClient.invalidateQueries({
				queryKey: productAttributeCategoryQueryKeys.all,
			});
			navigate(`/product-attribute-categories/${category.id}`);
		} catch (error) {
			console.error('Failed to update category - detailed error:', error);
			toast.error('Failed to update category');
		}
	};

	return (
		<RouteDrawer>
			<RouteDrawer.Header>
				<Heading>
					{t('product-attributes.editCategory', 'Edit Category')}
				</Heading>
			</RouteDrawer.Header>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Container className='p-8'>
					<div className='flex flex-col gap-y-8'>
						<div>
							<div className='flex flex-col gap-y-2'>
								<label
									htmlFor='name'
									className='text-sm font-medium text-gray-700 flex items-center gap-x-1'
								>
									{t('general.name', 'Name')}
									<span className='text-rose-500'>*</span>
								</label>
								<Input
									id='name'
									{...register('name', { required: true })}
									placeholder={t('forms.placeholder.name', 'Name')}
								/>
							</div>
						</div>

						<div>
							<div className='flex flex-col gap-y-2'>
								<label
									htmlFor='description'
									className='text-sm font-medium text-gray-700'
								>
									{t('general.description', 'Description')}
								</label>
								<Textarea
									id='description'
									{...register('description')}
									placeholder={t(
										'forms.placeholder.description',
										'Description',
									)}
									rows={3}
								/>
							</div>
						</div>
					</div>
				</Container>
				<RouteDrawer.Footer>
					<div className='flex gap-x-2 justify-end'>
						<Button
							variant='secondary'
							onClick={() =>
								navigate(`/product-attribute-categories/${category.id}`)
							}
							type='button'
						>
							{t('actions.cancel', 'Cancel')}
						</Button>
						<Button
							size='small'
							type='submit'
							isLoading={isSubmitting}
							disabled={!isDirty || isSubmitting}
						>
							{t('actions.save', 'Save')}
						</Button>
					</div>
				</RouteDrawer.Footer>
			</form>
		</RouteDrawer>
	);
};

export default EditProductAttributeCategoryForm;
