import type { PreOrderDetail } from '@customTypes/pre-order';
import { Copy, Prompt, Text } from '@medusajs/ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Code = ({ data }: { data: PreOrderDetail | undefined }) => {
	if (!data) {
		return null;
	}
	const code = data?.metadata?.pre_order?.code || '';
	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				Code
			</Text>
			<div className='flex items-center gap-x-2 overflow-hidden'>
				<Text
					size='small'
					leading='compact'
					className='text-ui-fg-subtle hover:text-ui-fg-base transition-fg truncate'
				>
					{code || '-'}
				</Text>
				{code && (
					<div className='flex justify-end'>
						<Copy content={code} className='text-ui-fg-muted' />
					</div>
				)}
			</div>
		</div>
	);
};

const CodeImage = ({ data }: { data: PreOrderDetail | undefined }) => {
	const [open, setOpen] = useState(false);

	const codeImageUrl = data?.metadata?.pre_order?.code_image_url;
	if (!data) {
		return null;
	}

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				Code Image
			</Text>
			{codeImageUrl && (
				<Link to='#' onClick={() => setOpen(true)}>
					<img src={codeImageUrl} alt='code' className='w-12 h-12 rounded-md' />
				</Link>
			)}

			{!codeImageUrl && (
				<Text size='small' leading='compact' className='text-ui-fg-muted'>
					-
				</Text>
			)}

			<Prompt open={open}>
				<Prompt.Content className='w-96'>
					<Prompt.Header>
						<Prompt.Title>Pre-order Code</Prompt.Title>
						<Prompt.Description className='flex item-center'>
							<img
								src={codeImageUrl}
								alt='code'
								className='w-full h-auto object-cover rounded-md'
							/>
						</Prompt.Description>
						<Prompt.Footer>
							<Prompt.Cancel onClick={() => setOpen(false)}>
								Close
							</Prompt.Cancel>
						</Prompt.Footer>
					</Prompt.Header>
				</Prompt.Content>
			</Prompt>
		</div>
	);
};

const PickupOption = ({ data }: { data: PreOrderDetail }) => {
	const piclupOption = data.metadata?.pickup_option;

	if (!piclupOption) {
		return null;
	}

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				Pickup / Shipping
			</Text>
			<Text size='small' leading='compact' className='truncate'>
				{piclupOption.name_en}
			</Text>
		</div>
	);
};

const IDCard = ({ data }: { data: PreOrderDetail }) => {
	const id_card_no = data.metadata?.pre_order?.id_card_no;

	if (!id_card_no) {
		return null;
	}

	return (
		<div className='text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4'>
			<Text size='small' leading='compact' weight='plus'>
				ID Card NO.
			</Text>
			<div className='flex items-center gap-x-2 overflow-hidden'>
				<Text
					size='small'
					leading='compact'
					className='text-ui-fg-subtle hover:text-ui-fg-base transition-fg truncate'
				>
					{id_card_no || '-'}
				</Text>
				{id_card_no && (
					<div className='flex justify-end'>
						<Copy content={id_card_no} className='text-ui-fg-muted' />
					</div>
				)}
			</div>
		</div>
	);
};

export const PreOrderInfo = Object.assign(
	{},
	{
		Code,
		CodeImage,
		PickupOption,
		IDCard,
	},
);
