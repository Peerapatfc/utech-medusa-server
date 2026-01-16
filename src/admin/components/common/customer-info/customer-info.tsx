import type { HttpTypes } from '@medusajs/types';
import { Avatar, Copy, Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { StatusCell } from '../../../components/table/table-cells/common/status-cell';
import { useOrderTaxInvoiceAddress } from '../../../hooks/api/orders';
import {
	getFormattedAddress,
	getFormattedTaxAddress,
} from '../../../lib/addresses';

const Id = ({ data }: { data: HttpTypes.AdminOrder }) => {
	const { t } = useTranslation();

	const id = data.customer_id;
	const name = getOrderCustomer(data);
	const email = data.email;
	const fallback = (name || email || '').charAt(0).toUpperCase();

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				{t('fields.id')}
			</Text>
			<Link
				to={`/customers/${id}`}
				className='focus:shadow-borders-focus rounded-[4px] outline-none transition-shadow'
			>
				<div className='flex items-center gap-x-2 overflow-hidden'>
					<Avatar size='2xsmall' fallback={fallback} />
					<Text
						size='small'
						leading='compact'
						className='text-ui-fg-subtle hover:text-ui-fg-base transition-fg truncate'
					>
						{name || email}
					</Text>
				</div>
			</Link>
		</div>
	);
};

const Account = ({ data }: { data: HttpTypes.AdminCustomer | undefined }) => {
	const { t } = useTranslation();

	if (!data) {
		return null;
	}

	const { has_account } = data;
	const color = has_account ? 'green' : ('orange' as const);
	const text = has_account
		? t('customers.fields.registered')
		: t('customers.fields.guest');

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				{t('fields.account')}
			</Text>
			<StatusCell color={color}>{text}</StatusCell>
		</div>
	);
};

const Company = ({ data }: { data: HttpTypes.AdminOrder }) => {
	const { t } = useTranslation();
	const company =
		data.shipping_address?.company || data.billing_address?.company;

	if (!company) {
		return null;
	}

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				{t('fields.company')}
			</Text>
			<Text size='small' leading='compact' className='truncate'>
				{company}
			</Text>
		</div>
	);
};

const Contact = ({ data }: { data: HttpTypes.AdminOrder }) => {
	const { t } = useTranslation();

	const phone = data.shipping_address?.phone || data.billing_address?.phone;
	const email = data.email || '';

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				{t('orders.customer.contactLabel')}
			</Text>
			<div className='flex flex-col gap-y-2'>
				<div className='grid grid-cols-[1fr_20px] items-start gap-x-2'>
					<Text
						size='small'
						leading='compact'
						className='text-pretty break-all'
					>
						{email}
					</Text>

					<div className='flex justify-end'>
						<Copy content={email} className='text-ui-fg-muted' />
					</div>
				</div>
				{phone && (
					<div className='grid grid-cols-[1fr_20px] items-start gap-x-2'>
						<Text
							size='small'
							leading='compact'
							className='text-pretty break-all'
						>
							{phone}
						</Text>

						<div className='flex justify-end'>
							<Copy content={email} className='text-ui-fg-muted' />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const AddressPrint = ({
	address,
	type,
}: {
	address:
	| HttpTypes.AdminOrder['shipping_address']
	| HttpTypes.AdminOrder['billing_address'];
	type: 'shipping' | 'billing' | 'tax_invoice';
}) => {
	const { t } = useTranslation();

	const typeLabel = {
		shipping: t('addresses.shippingAddress.label'),
		billing: t('addresses.billingAddress.label'),
		tax_invoice: 'Tax-Invoice Address',
	}[type];

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				{typeLabel}
			</Text>
			{address ? (
				<div className='grid grid-cols-[1fr_20px] items-start gap-x-2'>
					<Text size='small' leading='compact'>
						{getFormattedAddress({ address }).map((line) => {
							return (
								<span key={line} className='break-words'>
									{line}
									<br />
								</span>
							);
						})}
					</Text>
					<div className='flex justify-end'>
						<Copy
							content={getFormattedAddress({ address }).join('\n')}
							className='text-ui-fg-muted'
						/>
					</div>
				</div>
			) : (
				<Text size='small' leading='compact'>
					-
				</Text>
			)}
		</div>
	);
};

const Addresses = ({ data }: { data: HttpTypes.AdminOrder }) => {

	return (
		<div className='divide-y'>
			<AddressPrint address={data.shipping_address} type='shipping' />
			<AddressPrint address={data.billing_address} type='billing' />
		</div>
	);
};
const ElementTaxAddress = ({
	label,
	value,
}: { label: string; value?: string }) => {
	return (
		<div className='flex justify-between  text-ui-fg-muted'>
			<Text size='small' leading='compact' className='text-ui-fg-subtle' weight='plus'>
				{label}:
			</Text>
			<Text
				size='small'
				leading='compact'
				className='w-[calc(100%-90px)] pr-5'
				weight='regular'
			>
				{value}
			</Text>
		</div>
	);
};
const TaxAddresses = ({ data }: { data: HttpTypes.AdminOrder }) => {
	const resp = useOrderTaxInvoiceAddress(data.id);
	const address = resp?.tax_invoice_address;
	const taxInvoiceFormat = getFormattedTaxAddress({ address });
	const copyValue = taxInvoiceFormat.map((item) => item.value)

	return (
		<div className='relative'>
			<Copy
				content={copyValue.join('\n')}
				className='text-ui-fg-muted absolute top-4 right-6'
			/>

			<div className='px-6 py-4'>
				{address ? <>{taxInvoiceFormat?.map((item) => {
					return <ElementTaxAddress key={item.label}
						label={item.label}
						value={item.value}
					/>
				})}</> : <Text size='small' leading='compact'>
					-
				</Text>}
			</div>
		</div>
	);
};

export const CustomerInfo = Object.assign(
	{},
	{
		Id,
		Company,
		Contact,
		Addresses,
		TaxAddresses,
		Account,
	},
);

const getOrderCustomer = (obj: HttpTypes.AdminOrder) => {
	const { first_name: sFirstName, last_name: sLastName } =
		obj.shipping_address || {};
	const { first_name: bFirstName, last_name: bLastName } =
		obj.billing_address || {};
	const { first_name: cFirstName, last_name: cLastName } = obj.customer || {};

	const customerName = [cFirstName, cLastName].filter(Boolean).join(' ');
	const shippingName = [sFirstName, sLastName].filter(Boolean).join(' ');
	const billingName = [bFirstName, bLastName].filter(Boolean).join(' ');

	const name = customerName || shippingName || billingName;

	return name;
};
