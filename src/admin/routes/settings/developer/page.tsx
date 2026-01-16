import { defineRouteConfig } from '@medusajs/admin-sdk';
import { Container, Heading } from '@medusajs/ui';
import { Link } from 'react-router-dom';
import { CreditCard } from '@medusajs/icons';
import { RevalidateCache } from './components/revalidate-cache';
import { SyncData } from './components/sync-data';

const AvailablePaymentPage = () => {
	return (
		<Container>
			<Heading level='h1' className='inline-flex'>
				For Developer
			</Heading>

			<div className='mt-5 mb-5'>
				<nav className='w-full h-full  flex flex-col text-sm border rounded-lg'>
					<ul className='flex-1 space-y-2 p-2'>
						<li>
							<Link
								to='/settings/developer/available-payments'
								className='block p-2 bg-ui-bg-subtle rounded-md font-medium '
							>
								Available Payment Methods
								<CreditCard className='inline-block ml-2' />
							</Link>
						</li>

						<SyncData />
						<RevalidateCache />
					</ul>
				</nav>
			</div>
		</Container>
	);
};

export const config = defineRouteConfig({
	label: 'For Developer',
});

export default AvailablePaymentPage;
