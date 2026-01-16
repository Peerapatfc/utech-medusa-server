import { Table, Skeleton } from '@medusajs/ui';

const TableInboxSkeleton = () => {
	return (
		<Table.Row>
			<Table.Cell>
				<Skeleton className='h-4 w-6' />
			</Table.Cell>
			<Table.Cell>
				<Skeleton className='h-4 w-24' />
			</Table.Cell>
			<Table.Cell>
				<Skeleton className='h-4 w-32' />
			</Table.Cell>
			<Table.Cell>
				<Skeleton className='h-4 w-48' />
			</Table.Cell>
			<Table.Cell>
				<Skeleton className='h-4 w-40' />
			</Table.Cell>
			<Table.Cell>
				<Skeleton className='h-4 w-12' />
			</Table.Cell>
		</Table.Row>
	);
};

export default TableInboxSkeleton;
