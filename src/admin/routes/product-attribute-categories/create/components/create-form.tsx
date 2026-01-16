import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	FocusModal,
	Heading,
	Input,
	Switch,
	Text,
	Textarea,
	toast,
} from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';
import { Form } from '../../../../components/common/form/form';
import { RouteFocusModal, useRouteModal } from '../../../../components/modals';
import { KeyboundForm } from '../../../../components/utilities/keybound-form';
import {
	productAttributeCategoryQueryKeys,
	useCreateProductAttributeCategory,
} from '../../../../hooks/api/product-attribute-categories';

const CreateProductAttributeCategorySchema = zod.object({
	name: zod.string().min(1),
	description: zod.string().optional().nullable(),
	rank: zod.number().default(0),
	status: zod.boolean().default(true),
});

export const CreateProductAttributeCategoryForm = () => {
	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();
	const queryClient = useQueryClient();

	const methods = useForm<
		zod.infer<typeof CreateProductAttributeCategorySchema>
	>({
		defaultValues: {
			name: '',
			description: null,
			rank: 0,
			status: true,
		},
		resolver: zodResolver(CreateProductAttributeCategorySchema),
	});

	const { mutateAsync, isPending } = useCreateProductAttributeCategory();

	const handleSubmit = methods.handleSubmit(async (data) => {
		const payload = {
			name: data.name,
			description: data.description || undefined,
			rank: data.rank,
			status: data.status,
		};

		await mutateAsync(payload, {
			onSuccess: (response) => {
				toast.success(
					t(
						'productAttributeCategories.createSuccess',
						'Category created successfully',
					),
				);

				if (response.category?.id) {
					handleSuccess(
						`/product-attribute-categories/${response.category.id}`,
					);
					queryClient.invalidateQueries({
						queryKey: productAttributeCategoryQueryKeys.all,
					});
				} else {
					handleSuccess('/product-attribute-categories'); // Fallback path
				}
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	});

	return (
		<FormProvider {...methods}>
			<RouteFocusModal.Form form={methods}>
				<KeyboundForm
					onSubmit={handleSubmit}
					className='flex flex-col overflow-hidden'
				>
					<RouteFocusModal.Header>
						<div className='flex items-center justify-end gap-x-2'>
							<RouteFocusModal.Close asChild>
								<Button size='small' variant='secondary'>
									{t('actions.cancel')}
								</Button>
							</RouteFocusModal.Close>
							<Button
								size='small'
								variant='primary'
								type='submit'
								isLoading={isPending}
							>
								{t('actions.create')}
							</Button>
						</div>
					</RouteFocusModal.Header>
					<RouteFocusModal.Body className='flex flex-col items-center overflow-y-auto p-16'>
						<div className='flex w-full max-w-[720px] flex-col gap-y-8'>
							<div>
								<FocusModal.Title className='sr-only' />
								<Heading>
									{t(
										'product-attribute-categories.createCategory',
										'Create Product Attribute Category',
									)}
								</Heading>
								<Text size='small' className='text-ui-fg-subtle'>
									{t(
										'product-attribute-categories.createCategoryHint',
										'Create a new product attribute category',
									)}
								</Text>
							</div>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-1'>
								<Form.Field
									control={methods.control}
									name='name'
									render={({ field }) => {
										return (
											<Form.Item>
												<Form.Label>{t('fields.name')}</Form.Label>
												<Form.Control>
													<Input autoComplete='off' {...field} />
												</Form.Control>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
								<Form.Field
									control={methods.control}
									name='description'
									render={({ field }) => {
										return (
											<Form.Item className='md:col-span-2'>
												<Form.Label optional>
													{t('fields.description')}
												</Form.Label>
												<Form.Control>
													<Textarea
														autoComplete='off'
														{...field}
														value={field.value || ''}
													/>
												</Form.Control>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
								<Form.Field
									control={methods.control}
									name='status'
									render={({ field }) => {
										return (
											<Form.Item>
												<div className='flex items-center gap-x-2'>
													<Form.Label>{t('fields.status')}</Form.Label>
													<Form.Control>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</Form.Control>
												</div>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
							</div>
						</div>
					</RouteFocusModal.Body>
				</KeyboundForm>
			</RouteFocusModal.Form>
		</FormProvider>
	);
};
