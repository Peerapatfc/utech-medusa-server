import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Container, Button, Toaster, Text, clx, toast } from '@medusajs/ui';
import { ChevronDownMini, ChevronUpMini } from '@medusajs/icons';
import BackButton from '../../../components/back-button';
import RunningNumberForm from '../../../components/running-number/running-number-setting-form';
import type { ConfigData } from '@customTypes/config-data';

const CustomOrderNumberPage = () => {
	const { handleSubmit, control, setValue } = useForm();
	const [data, setData] = useState<ConfigData[]>([]);
	const [shows, setShows] = useState<string[]>(['order']);

	const types: { type: 'order' | 'invoice' | 'credit_note'; label: string }[] =
		[
			{
				type: 'order',
				label: 'Order',
			},
			{
				type: 'invoice',
				label: 'Invoice',
			},
			{
				type: 'credit_note',
				label: 'Credit Note',
			},
		];

	useEffect(() => {
		const fetchData = async () => {
			try {
				const params = new URLSearchParams();
				const _params: string[] = [];
				types.map((value) => {
					_params.push(`running_number/${value.type}/is_enable`);
					_params.push(`running_number/${value.type}/format`);
					_params.push(`running_number/${value.type}/counter_increment`);
					_params.push(`running_number/${value.type}/counter_padding`);
				});
				_params.map((param, index) => {
					params.set(`paths[${index}]`, param);
				});
				const response = await fetch(
					`/admin/config-data?${params.toString()}`,
					{
						method: 'GET',
						credentials: 'include',
						headers: {
							'Cache-Control': 'no-cache',
						},
					},
				)
					.then((res) => res.json())
					.then((res) => {
						return res.data;
					});

				const data = response;
				setData(data);
			} catch (error) {
				console.error('Error fetching data', error);
			}
		};
		fetchData();
	}, []);

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const onSubmit = async (formData: any) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const data: Record<string, any> = {};
		types.map((value) => {
			data[value.type] = {
				is_enable: {
					path: `running_number/${value.type}/is_enable`,
					value: formData[`${value.type}_is_enable`],
				},
				format: {
					path: `running_number/${value.type}/format`,
					value: formData[`${value.type}_format`],
				},
				counter_increment: {
					path: `running_number/${value.type}/counter_increment`,
					value: formData[`${value.type}_counter_increment`].toString(),
				},
				counter_padding: {
					path: `running_number/${value.type}/counter_padding`,
					value: formData[`${value.type}_counter_padding`].toString(),
				},
			};
		});
		try {
			const response = await fetch('/admin/config-data', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			if (response.ok) {
				toast.success('Success', {
					description: 'Order number settings were successfully updated.',
				});
			}
		} catch (error) {
			toast.error('Error', {
				description: 'An error occurred. Please try again.',
			});
		}
	};

	const handleShow = (value: string) => {
		const result = shows.filter((item) => value === item);
		if (result.length > 0) {
			setShows((items) => {
				return items.filter((item) => item !== value);
			});
		} else {
			setShows((items) => {
				return [...items, value];
			});
		}
	};

	return (
		<div className=''>
			<BackButton
				path='/advanced-setting'
				label='Back to Advanced Setting'
				className='my-4'
			/>

			<Container>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='flex justify-between'>
						<div>
							<h1 className='font-bold text-xl'>Setting Running Number</h1>
							<p>Manage your order, invoice, shipping, credit note number</p>
						</div>
						<Toaster />
						<Button className='h-fit' type='submit'>
							Save
						</Button>
					</div>
					{/* Content */}
					<div>
						{types.map((value, index) => (
							<div
								key={index.toString()}
								className='pt-3 border-t first:border-t-0'
							>
								<div className='pb-3'>
									<Button
										type='button'
										variant='transparent'
										onClick={() => handleShow(value.type)}
									>
										<div className='text-ui-fg-muted'>
											<ChevronDownMini
												className={shows.includes(value.type) ? 'hidden' : ''}
											/>
											<ChevronUpMini
												className={!shows.includes(value.type) ? 'hidden' : ''}
											/>
										</div>
										<Text
											size='base'
											weight='plus'
											leading='compact'
											className='font-bold'
										>
											{value.label}
										</Text>
									</Button>
								</div>
								<div
									className={clx('pb-6', {
										hidden: !shows.includes(value.type),
									})}
								>
									<RunningNumberForm
										type={value.type}
										control={control}
										setValue={setValue}
										data={data}
									/>
								</div>
							</div>
						))}
					</div>
				</form>
			</Container>
		</div>
	);
};

export default CustomOrderNumberPage;
