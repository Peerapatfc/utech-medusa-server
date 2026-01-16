import { Heading } from '@medusajs/ui';
import { Link, useParams } from 'react-router-dom';
import { RouteDrawer } from '../../../../../components/modals';
import {
	type CSSProperties,
	type MouseEvent,
	Suspense,
	useEffect,
	useState,
} from 'react';
import Primitive from '@uiw/react-json-view';
import { Check, SquareTwoStack, TriangleDownMini } from '@medusajs/icons';
import { useTranslation } from 'react-i18next';
import type { AdminCustomerAddress } from '@medusajs/framework/types';
import { sdk } from '../../../../../lib/client';

const CustomerAddressView = () => {
	const { t } = useTranslation();
	const [address, setAddress] = useState<AdminCustomerAddress>();
	const { id, address_id } = useParams();

	useEffect(() => {
		const fetchData = async () => {
			if (id) {
				const { customer } = await sdk.admin.customer.retrieve(id, {
					fields: ['id', 'email', '*addresses'].join(','),
				});
				setAddress(
					customer.addresses.filter((address) => address.id === address_id)[0],
				);
			}
		};
		fetchData();
	}, [id, address_id]);

	return (
		<RouteDrawer prev='../../'>
			<RouteDrawer.Header>
				<Heading>Customer Address Detail</Heading>
			</RouteDrawer.Header>

			<RouteDrawer.Body className='flex flex-1 flex-col overflow-hidden px-[5px] py-0 pb-[5px]'>
				<div className='bg-ui-contrast-bg-subtle flex-1 overflow-auto rounded-b-[4px] rounded-t-lg p-3'>
					<Suspense fallback={<div className='flex size-full flex-col' />}>
						<Primitive
							value={address ?? {}}
							displayDataTypes={false}
							style={
								{
									'--w-rjv-font-family': 'Roboto Mono, monospace',
									'--w-rjv-line-color': 'var(--contrast-border-base)',
									'--w-rjv-curlybraces-color': 'var(--contrast-fg-secondary)',
									'--w-rjv-brackets-color': 'var(--contrast-fg-secondary)',
									'--w-rjv-key-string': 'var(--contrast-fg-primary)',
									'--w-rjv-info-color': 'var(--contrast-fg-secondary)',
									'--w-rjv-type-string-color': 'var(--tag-green-icon)',
									'--w-rjv-quotes-string-color': 'var(--tag-green-icon)',
									'--w-rjv-type-boolean-color': 'var(--tag-orange-icon)',
									'--w-rjv-type-int-color': 'var(--tag-orange-icon)',
									'--w-rjv-type-float-color': 'var(--tag-orange-icon)',
									'--w-rjv-type-bigint-color': 'var(--tag-orange-icon)',
									'--w-rjv-key-number': 'var(--contrast-fg-secondary)',
									'--w-rjv-arrow-color': 'var(--contrast-fg-secondary)',
									'--w-rjv-copied-color': 'var(--contrast-fg-secondary)',
									'--w-rjv-copied-success-color': 'var(--contrast-fg-primary)',
									'--w-rjv-colon-color': 'var(--contrast-fg-primary)',
									'--w-rjv-ellipsis-color': 'var(--contrast-fg-secondary)',
								} as CSSProperties
							}
							collapsed={1}
						>
							<Primitive.Quote render={() => <span />} />
							<Primitive.Null
								render={() => (
									<span className='text-ui-tag-red-icon'>null</span>
								)}
							/>
							<Primitive.Undefined
								render={() => (
									<span className='text-ui-tag-blue-icon'>undefined</span>
								)}
							/>
							<Primitive.CountInfo
								render={(_props, { value }) => {
									return (
										<span className='text-ui-contrast-fg-secondary ml-2'>
											{t('general.items', {
												count: Object.keys(value as object).length,
											})}
										</span>
									);
								}}
							/>
							<Primitive.Arrow>
								<TriangleDownMini className='text-ui-contrast-fg-secondary -ml-[0.5px]' />
							</Primitive.Arrow>
							<Primitive.Colon>
								<span className='mr-1'>:</span>
							</Primitive.Colon>
							<Primitive.Copied
								render={({ style }, { value }) => {
									return <Copied style={style} value={value} />;
								}}
							/>
						</Primitive>
					</Suspense>
				</div>
			</RouteDrawer.Body>
		</RouteDrawer>
	);
};

type CopiedProps = {
	style?: CSSProperties;
	value: object | undefined;
};

const Copied = ({ style, value }: CopiedProps) => {
	const [copied, setCopied] = useState(false);

	const handler = (e: MouseEvent<HTMLSpanElement>) => {
		e.stopPropagation();
		setCopied(true);

		if (typeof value === 'string') {
			navigator.clipboard.writeText(value);
		} else {
			const json = JSON.stringify(value, null, 2);
			navigator.clipboard.writeText(json);
		}

		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	const styl = { whiteSpace: 'nowrap', width: '20px' };

	if (copied) {
		return (
			<span style={{ ...style, ...styl }}>
				<Check className='text-ui-contrast-fg-primary' />
			</span>
		);
	}

	return (
		<Link to={'#'} style={{ ...style, ...styl }} onClick={handler}>
			<SquareTwoStack className='text-ui-contrast-fg-secondary' />
		</Link>
	);
};

export default CustomerAddressView;
