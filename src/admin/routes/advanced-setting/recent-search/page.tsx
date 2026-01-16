import BackButton from '../../../components/back-button';
import {
	Button,
	Container,
	Tooltip,
	Select,
	toast,
	Textarea,
} from '@medusajs/ui';
import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Form } from '../../../components/common/form';
import type { RecentSearchConfigDataForm } from '../../../../types/recent-search';
import { useTranslation } from 'react-i18next';
import { findConfigDataByPath } from '../../../../admin/utils/config-data';
import { InformationCircle } from '@medusajs/icons';
import { Controller } from 'react-hook-form';

const RecentSearchSettingPage = () => {
	const { t } = useTranslation();

	const form = useForm<RecentSearchConfigDataForm>();
	const { setValue, handleSubmit, control } = form;

	const RECENT_SEARCH_GENERAL_ENABLED = 'recent-search/general/enabled';
	const RECENT_SEARCH_GENERAL_PROHIBITED_WORD =
		'recent-search/general/prohibited_word';

	const onSubmit = handleSubmit((data: RecentSearchConfigDataForm) => {
		fetch('/admin/config-data', {
			credentials: 'include',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})
			.then((res) => res.json())
			.then(() => {
				toast.success(t('general.success'), {
					description: 'Recent Search were successfully updated.',
				});
			})
			.catch((error) => {
				console.error('Error:', error);
				toast.error(t('general.error'), {
					description: error.message,
				});
			});
	});

	const enableOptions = [
		{ value: '1', label: 'Yes' },
		{ value: '0', label: 'No' },
	];

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setValue('general.enabled.path', RECENT_SEARCH_GENERAL_ENABLED);
		setValue('general.enabled.value', '0');
		setValue(
			'general.prohibited_word.path',
			RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
		);
		setValue('general.prohibited_word.value', '');
		const params = new URLSearchParams({
			'paths[0]': RECENT_SEARCH_GENERAL_ENABLED,
			'paths[1]': RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
		});
		fetch(`/admin/config-data?${params.toString()}`, {
			credentials: 'include',
			method: 'GET',
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.data) {
					const enabled_value = findConfigDataByPath(
						res.data,
						RECENT_SEARCH_GENERAL_ENABLED,
					);
					const prohibited_word = findConfigDataByPath(
						res.data,
						RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
					);
					setValue('general.enabled.value', enabled_value);
					setValue('general.prohibited_word.value', prohibited_word);
				}
			})
			.catch((error) => {
				toast.error(t('general.error'), {
					description: error.message,
				});
			});
	}, [RECENT_SEARCH_GENERAL_ENABLED, RECENT_SEARCH_GENERAL_PROHIBITED_WORD]);

	return (
		<div className=''>
			<BackButton
				path='/advanced-setting'
				label='Back to Advanced Setting'
				className='my-4'
			/>
			<Container>
				<FormProvider {...form}>
					<form onSubmit={onSubmit}>
						<div className='flex justify-between'>
							<div>
								<h1 style={{ fontWeight: '700', fontSize: '20px' }}>
									Recent Search
								</h1>
								<p className='mt-4 mb-6'>Config recent search</p>
							</div>
							<Button type='submit' className='h-fit'>
								Save
							</Button>
						</div>

						<div className='flex flex-col gap-y-6 ml-8 w-11/12 lg:w-1/2'>
							<Form.Field
								control={form.control}
								name='general.enabled.value'
								render={({ field: { onChange, value, ...rest } }) => (
									<Form.Item className='md:col-span-2'>
										<Form.Label className='font-bold'>
											Enabled Service
										</Form.Label>
										<Form.Control>
											<Select
												value={value}
												onValueChange={(newValue) => onChange(newValue)}
												{...rest}
											>
												<Select.Trigger>
													<Select.Value placeholder='Enabled Service' />
												</Select.Trigger>
												<Select.Content>
													{enableOptions.map((item) => (
														<Select.Item key={item.value} value={item.value}>
															{item.label}
														</Select.Item>
													))}
												</Select.Content>
											</Select>
										</Form.Control>
										<Form.ErrorMessage />
									</Form.Item>
								)}
							/>

							<div className='flex flex-col space-y-2 md:col-span-2'>
								<div className='flex items-center gap-x-1'>
									<Form.Item className='w-full md:col-span-2'>
										<Form.Label className='flex items-center font-bold gap-x-1'>
											Prohibited Word
											<Tooltip content='[all store]'>
												<InformationCircle />
											</Tooltip>
										</Form.Label>
										<Controller
											name='general.prohibited_word.value'
											control={control}
											render={({ field }) => (
												<Textarea
													{...field}
													id='prohibited_word'
													className='min-h-20'
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
												/>
											)}
										/>
										<p className='text-xs text-gray-500'>
											No search results are displayed when searching with these
											words.
										</p>
									</Form.Item>
								</div>
							</div>
						</div>
					</form>
				</FormProvider>
			</Container>
		</div>
	);
};

export default RecentSearchSettingPage;
