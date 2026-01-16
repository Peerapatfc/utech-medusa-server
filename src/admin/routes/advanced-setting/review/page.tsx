import { InformationCircle } from '@medusajs/icons';
import { Button, Container, Textarea, Tooltip, toast } from '@medusajs/ui';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { RecentSearchConfigDataForm } from '../../../../types/recent-search';
import BackButton from '../../../components/back-button';
import { Form } from '../../../components/common/form';
import { findConfigDataByPath } from '../../../utils/config-data';

const RecentSearchSettingPage = () => {
	const { t } = useTranslation();

	const form = useForm<RecentSearchConfigDataForm>();
	const { setValue, handleSubmit, control } = form;

	const REVIEW_GENERAL_PROHIBITED_WORD = 'review/general/prohibited_word';

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setValue('general.prohibited_word.path', REVIEW_GENERAL_PROHIBITED_WORD);
		setValue('general.prohibited_word.value', '');
		const params = new URLSearchParams({
			'paths[0]': REVIEW_GENERAL_PROHIBITED_WORD,
		});
		fetch(`/admin/config-data?${params.toString()}`, {
			credentials: 'include',
			method: 'GET',
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.data) {
					const prohibited_word = findConfigDataByPath(
						res.data,
						REVIEW_GENERAL_PROHIBITED_WORD,
					);
					setValue('general.prohibited_word.value', prohibited_word);
				}
			})
			.catch((error) => {
				toast.error(t('general.error'), {
					description: error.message,
				});
			});
	}, [REVIEW_GENERAL_PROHIBITED_WORD]);

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
									Review prohibited word
								</h1>
								<p className='mt-4 mb-6'>Config review prohibited word</p>
							</div>
							<Button type='submit' className='h-fit'>
								Save
							</Button>
						</div>

						<div className='flex flex-col gap-y-6 ml-8 w-11/12 lg:w-1/2'>
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
													placeholder='word1,word2,...'
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
												/>
											)}
										/>
										<p className='text-xs text-gray-500 flex flex-col'>
											Prohibited words in the review will be automatically
											redacted and appear as '***' please use the comma to
											separate between each words.
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
