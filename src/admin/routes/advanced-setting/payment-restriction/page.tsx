import type { PaymentRestriction } from '@customTypes/payment-restriction';
import type { PaymentProviderDTO } from '@medusajs/framework/types';
import { PencilSquare } from '@medusajs/icons';
import { Button, Container, StatusBadge, Table } from '@medusajs/ui';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '../../../components/back-button';
import { formatProvider } from '../../../lib/format-provider';
import PaymentRestrictionFormModal from './payment-restriction-form';

const CancelOrderSettingPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [openModal, setOpenModal] = useState(false);
	const [restrictionId, setRestrictionId] = useState<string | undefined>(
		undefined,
	);
	const [payment_providers, setPaymentProviders] = useState<
		PaymentProviderDTO[]
	>([]);
	const [payment_restrictions, setPaymentRestrictions] = useState<
		PaymentRestriction[]
	>([]);
	const [count, setCount] = useState<number>(0);
	const pageSize = 10;
	const currentPage = Number(searchParams.get('page'));
	const pageCount = Math.ceil(count / pageSize);
	const skip = currentPage * pageSize;
	const id = searchParams.get('id');

	const canNextPage = useMemo(
		() => currentPage < pageCount - 1,
		[currentPage, pageCount],
	);
	const canPreviousPage = useMemo(() => currentPage - 1 >= 0, [currentPage]);

	const handleOpenModal = (id?: string) => {
		if (id) {
			setRestrictionId(id);
		} else {
			setRestrictionId(undefined);
		}
		setOpenModal(true);
	};

	useEffect(() => {
		const fetchData = async () => {
			openModal;
			setPaymentRestrictions([]);
			const paymentProviders = await fetch(
				'/admin/payments/payment-providers',
				{
					credentials: 'include',
					method: 'GET',
				},
			)
				.then((response) => response.json())
				.then((response) => response.payment_providers);
			setPaymentProviders(paymentProviders);

			const params = new URLSearchParams({
				skip: skip.toString(),
				take: pageSize.toString(),
			});
			const [payment_restrictions, count] = await fetch(
				`/admin/payment-restrictions?${params}`,
				{
					credentials: 'include',
					method: 'GET',
				},
			)
				.then((response) => response.json())
				.then((response) => response.payment_restriction);
			setPaymentRestrictions(payment_restrictions);
			setCount(count);
			if (id) {
				setRestrictionId(id);
				setOpenModal(true);
			}
		};
		fetchData();
	}, [skip, openModal, id]);

	const handleCloseModal = () => {
		const params = new URLSearchParams(searchParams);
		params.delete('id');
		const query = params.toString();
		navigate(`?${query}`);
		setOpenModal(false);
	};

	const nextPage = () => {
		navigate(`?page=${currentPage + 1}`);
	};

	const previousPage = () => {
		navigate(`?page=${currentPage - 1}`);
	};

	return (
		<div className=''>
			<BackButton
				path='/advanced-setting'
				label='Back to Advanced Setting'
				className='my-4'
			/>
			<Container>
				<div className='flex justify-between items-center mb-6'>
					<div>
						<h1 className='font-sans font-medium h1-core'>
							Payment Restrictions
						</h1>
						<p className='font-normal font-sans txt-small text-ui-fg-subtle'>
							Create payment restrictions
						</p>
					</div>
					<Button
						type='button'
						className='h-fit'
						onClick={() => handleOpenModal()}
					>
						Create
					</Button>
				</div>

				<div className='flex flex-col gap-y-6 w-[100%]'>
					<Table>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell className='w-[25%]'>{'ID'}</Table.HeaderCell>
								<Table.HeaderCell className='w-[30%]'>
									{'Name'}
								</Table.HeaderCell>
								<Table.HeaderCell className='w-[20%]'>
									{'Payment method Name'}
								</Table.HeaderCell>
								<Table.HeaderCell className='w-[10%] text-center'>
									{'Status'}
								</Table.HeaderCell>
								<Table.HeaderCell className='w-[10%]' />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{payment_restrictions.map((restriction, index) => {
								return (
									<Table.Row
										key={restriction.id}
										className='[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap'
									>
										<Table.Cell>{count - index - skip}</Table.Cell>
										<Table.Cell>{restriction.name}</Table.Cell>
										<Table.Cell>
											<ul>
												{restriction.payment_providers.map((payment, index) => {
													return (
														<li key={index.toString()}>
															{formatProvider(payment)}
														</li>
													);
												})}
											</ul>
										</Table.Cell>
										<Table.Cell className='flex justify-center items-center'>
											<StatusBadge
												color={restriction.is_active ? 'green' : 'red'}
											>
												{restriction.is_active ? 'Active' : 'Disabled'}
											</StatusBadge>
										</Table.Cell>
										<Table.Cell className='text-center'>
											<Button
												variant='transparent'
												size='small'
												type='button'
												onClick={() => handleOpenModal(restriction.id)}
											>
												<PencilSquare />
											</Button>
										</Table.Cell>
									</Table.Row>
								);
							})}
						</Table.Body>
					</Table>
					<Table.Pagination
						count={count}
						pageSize={pageSize}
						pageIndex={currentPage}
						pageCount={pageCount}
						canPreviousPage={canPreviousPage}
						canNextPage={canNextPage}
						previousPage={previousPage}
						nextPage={nextPage}
					/>
				</div>
			</Container>
			<PaymentRestrictionFormModal
				openModal={openModal}
				setOpenModal={setOpenModal}
				id={restrictionId}
				paymentProviders={payment_providers}
				handleCloseModal={handleCloseModal}
			/>
		</div>
	);
};

export default CancelOrderSettingPage;
