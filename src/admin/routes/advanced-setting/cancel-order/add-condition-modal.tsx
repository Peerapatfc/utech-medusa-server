import { Button, Tooltip, toast, FocusModal, Input } from '@medusajs/ui';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Form } from '../../../components/common/form';
import type {
	CancelOrderConditionRowForm,
	CancelOrderConfigDataForm,
} from '../../../../types/cancel-order';
import { useTranslation } from 'react-i18next';
import { InformationCircle } from '@medusajs/icons';
import type { PaymentProviderDTO } from '@medusajs/types';
import { Combobox } from '../../../components/inputs/combobox';
import { formatProvider } from '../../../lib/format-provider';

const AddConditionModalForm = ({
	openModal,
	setOpenModal,
	condition_path,
	paymentProviders,
	reLoadData,
}: {
	openModal: boolean;
	setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
	condition_path: string;
	paymentProviders: PaymentProviderDTO[];
	reLoadData: (paymentProviders: PaymentProviderDTO[]) => void;
}) => {
	const { t } = useTranslation();

	const form = useForm<CancelOrderConditionRowForm>();
	const { handleSubmit, control } = form;

	const onSubmit = handleSubmit((data: CancelOrderConditionRowForm) => {
		const dataForm: CancelOrderConfigDataForm = {
			general: {
				condition: {
					path: `${condition_path}/${data.payment_method}`,
					value: String(data.time),
				},
			},
		};

		fetch('/admin/config-data', {
			credentials: 'include',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dataForm),
		})
			.then((res) => res.json())
			.then(() => {
				toast.success(t('general.success'), {
					description: 'Cancel order(s) were successfully updated.',
				});
				reLoadData(paymentProviders);
				setOpenModal(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				toast.error(t('general.error'), {
					description: error.message,
				});
			});
	});

	return (
		<FocusModal open={openModal} onOpenChange={setOpenModal}>
			<FocusModal.Content>
				<FocusModal.Header>
					<span className='order-first'>Add condition</span>
				</FocusModal.Header>
				<FocusModal.Body className='py-2 px-4 w-[50%] mx-auto mt-12'>
					<FormProvider {...form}>
						<form onSubmit={onSubmit}>
							<div className='grid grid-cols-2 gap-3'>
								<Form.Field
									control={form.control}
									name='payment_method'
									render={({ field }) => {
										return (
											<Form.Item>
												<Form.Label>{'Payment method'}</Form.Label>
												<Form.Control>
													<Combobox
														options={paymentProviders.map((pp) => ({
															label: formatProvider(pp.id),
															value: pp.id,
														}))}
														{...field}
													/>
												</Form.Control>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
								<Form.Item className='w-full'>
									<Form.Label className='flex items-center font-bold gap-x-1'>
										Time
										<Tooltip content='[all store]'>
											<InformationCircle />
										</Tooltip>
									</Form.Label>
									<Controller
										name='time'
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type='number'
												onChange={(e) => field.onChange(e.target.value)}
											/>
										)}
									/>
									<p className='text-xs text-gray-500'>
										Please use the unit of time in minutes.
									</p>
									<Form.ErrorMessage />
								</Form.Item>
							</div>
							<div className='flex justify-end mt-3'>
								<Button
									type='button'
									variant='secondary'
									className='h-fit'
									onClick={() => setOpenModal(false)}
								>
									Cancel
								</Button>
								<Button type='submit' variant='primary' className='h-fit ml-3'>
									Save
								</Button>
							</div>
						</form>
					</FormProvider>
				</FocusModal.Body>
			</FocusModal.Content>
		</FocusModal>
	);
};

export default AddConditionModalForm;
