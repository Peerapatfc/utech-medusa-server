import {
	Button,
	Container,
	Heading,
	Table,
	Text,
	toast,
	usePrompt,
} from '@medusajs/ui';
import { Trash } from '@medusajs/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { keepPreviousData } from '@tanstack/react-query';
import { usePreOrderTemplateTableQuery } from '../../../hooks/table/query/use-pre-order-template-table-query';
import {
	useDeletePreOrderTemplate,
	usePreOrderTemplates,
} from '../../../hooks/api/pre-order-template';
import { dateTimeFormat } from '../../../lib/date';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionMenu } from '../../../components/common/action-menu';
import type { PreOrderTemplate } from '@customTypes/pre-order';

const PreOrderListPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const pageSize = 20;

	const { searchParams } = usePreOrderTemplateTableQuery({
		pageSize,
	});
	const {
		pre_order_templates: preOrderTemplates,
		count = 0,
		isPending: isLoading,
		refetch,
	} = usePreOrderTemplates(
		{
			...searchParams,
			fields: '*payment_providers',
		},
		{
			placeholderData: keepPreviousData,
		},
	);

	const [currentPage, setCurrentPage] = useState(0);
	const pageCount = Math.ceil(count / pageSize);
	const canNextPage = useMemo(
		() => currentPage < pageCount - 1,
		[currentPage, pageCount],
	);
	const canPreviousPage = useMemo(() => currentPage - 1 >= 0, [currentPage]);

	const nextPage = () => {
		if (canNextPage) {
			setCurrentPage(currentPage + 1);
		}
	};

	const previousPage = () => {
		if (canPreviousPage) {
			setCurrentPage(currentPage - 1);
		}
	};

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<div>
					<Heading>Pre Orders</Heading>
					<Text className='text-ui-fg-subtle' size='small'>
						Pre-Order Campaignes
					</Text>
				</div>
				<Link to='/pre-order-campaigns/create'>
					<Button size='small' variant='secondary'>
						{t('actions.create')}
					</Button>
				</Link>
			</div>

			{!isLoading && preOrderTemplates && (
				<div className='flex gap-1 flex-col'>
					<Table>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>#</Table.HeaderCell>
								<Table.HeaderCell>Pre-Order Name</Table.HeaderCell>
								<Table.HeaderCell>Created At</Table.HeaderCell>
								<Table.HeaderCell>Actions</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{preOrderTemplates.map((preOrderTemplate, index) => {
								return (
									<Table.Row
										key={preOrderTemplate.id}
										className='[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap cursor-pointer'
										onClick={() =>
											navigate(`/pre-order-campaigns/${preOrderTemplate.id}`)
										}
									>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell>{preOrderTemplate.name_th}</Table.Cell>
										<Table.Cell>
											{dateTimeFormat(preOrderTemplate.created_at)}
										</Table.Cell>
										<Table.Cell>
											<ProductTypeRowActions row={preOrderTemplate} refetch={refetch} />
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
						pageCount={count}
						canPreviousPage={canPreviousPage}
						canNextPage={canNextPage}
						previousPage={previousPage}
						nextPage={nextPage}
					/>
				</div>
			)}
		</Container>
	);
};

type ActionsProps = {
	row: PreOrderTemplate;
	refetch: () => void;
};

export const ProductTypeRowActions = ({ row, refetch }: ActionsProps) => {
	const { t } = useTranslation();
	const prompt = usePrompt();

	const { mutateAsync } = useDeletePreOrderTemplate(row.id || '');
	const handleDeletePreOrderTemplate = async () => {
		const res = await prompt({
			title: t('general.areYouSure'),
			description: 'Are you sure you want to delete this one?',
			verificationText: 'DELETE',
			verificationInstruction: t('general.typeToConfirm'),
			confirmText: t('actions.delete'),
			cancelText: t('actions.cancel'),
		});

		if (!res) {
			return;
		}

		try {
			await mutateAsync();
			toast.success(`Pre-Order Template "${row.name_th}" deleted successfully`);
			refetch();
		} catch (error) {
			console.error('Error deleting pre-order template:', error);
		}
	};

	return (
		<ActionMenu
			groups={[
				{
					actions: [
						{
							label: t('actions.delete'),
							icon: <Trash />,
							onClick: () => handleDeletePreOrderTemplate(),
						},
					],
				},
			]}
		/>
	);
};

export default PreOrderListPage;
