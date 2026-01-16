import { PencilSquare, XMark } from '@medusajs/icons';
import { Button, Container, Input, toast } from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import BackButton from '../../../components/back-button';
import { useMagentoOrderURL } from '../../../hooks/api/advance-setting';
const MagentoOrderHistorySettingURL = () => {
	const magentoURL = useMagentoOrderURL();
	const [urlValue, setUrlValue] = useState(magentoURL);
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const queryClient = useQueryClient();

	const revalidateMagentoURL = () => {
		queryClient.invalidateQueries({
			queryKey: [
				'magento-order-history-url',
				{ id: 'magento/order/history-url' },
			],
		});
	};
	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		fetch('/admin/config-data', {
			credentials: 'include',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				magento: {
					order: {
						path: 'magento/order/history-url',
						value: urlValue,
					},
				},
			}),
		}).then(() => {
			revalidateMagentoURL();
			toast.success('Update magento order history url successfully');
			setIsEdit(false);
		});
	};

	const handleButtonEdit = () => {
		setIsEdit(!isEdit);
	};

	return (
		<>
			<BackButton
				path='/advanced-setting'
				label='Back to Advanced Setting'
				className='my-4'
			/>

			<Container>
				<form onSubmit={onSubmit}>
					<div className='flex justify-between'>
						<div>
							<h1 style={{ fontWeight: '700', fontSize: '20px' }}>
								Magento order history url
							</h1>
							<p className='mt-4 mb-6'>Config magento order history url</p>
						</div>
						<Button type='submit' className='h-fit'>
							Save
						</Button>
					</div>

					<div className='flex flex-col gap-y-6 ml-8 w-1/2'>
						<div className='flex flex-col space-y-5 md:col-span-2'>
							<div className='relative '>
								<Input
									value={urlValue}
									onChange={(e) => setUrlValue(e.target.value)}
									placeholder='please enter url'
									disabled={!isEdit}
									type='text'
								/>
								<div className='absolute top-0 right-[-50px]'>
									<Button
										type='button'
										variant='transparent'
										className='h-fit'
										onClick={handleButtonEdit}
									>
										{isEdit ? <XMark /> : <PencilSquare />}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</form>
			</Container>
		</>
	);
};

export default MagentoOrderHistorySettingURL;
