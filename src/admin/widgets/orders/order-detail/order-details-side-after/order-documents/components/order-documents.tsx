import { Button, Text } from '@medusajs/ui';
import { ArrowDownTray } from '@medusajs/icons';
import type { AdminOrder } from '@medusajs/framework/types';
import { useOrder } from '../../../../../../hooks/api/orders';

interface CustomAdminOrder extends AdminOrder {
	metadata: {
		invoice_no: string;
		credit_note_no: string;
	};
}

type Param = {
	id: string;
	order?: AdminOrder;
};

export const OrderDocuments = ({ id }: Param) => {
	const { order: orderDetail } = useOrder(id as string, {
		fields: 'metadata',
	}) as { order: CustomAdminOrder };

	return (
		<>
			<Invoice id={id} orderDetail={orderDetail} />
			<CreditNote id={id} orderDetail={orderDetail} />
		</>
	);
};

const Invoice = ({
	id,
	orderDetail,
}: { id: string; orderDetail: CustomAdminOrder }) => {
	const paymentStatus = orderDetail?.payment_status;
	const buttonEnabled = ['captured', 'refunded', 'partially_refunded'].includes(
		paymentStatus,
	);

	const handleDownloadInvoice = async () => {
		handleDownload({ id, type: 'invoice', orderDetail });
	};

	return (
		<div className='flex items-center justify-between px-6 py-4'>
			<Text>Invoice</Text>
			<Button
				onClick={handleDownloadInvoice}
				size='small'
				disabled={!buttonEnabled}
				variant='secondary'
			>
				<ArrowDownTray />
				Download
			</Button>
		</div>
	);
};

const CreditNote = ({
	id,
	orderDetail,
}: { id: string; orderDetail: CustomAdminOrder }) => {
	const paymentStatus = orderDetail?.payment_status;
	const isHasCreditNoteNo = !!orderDetail?.metadata?.credit_note_no;
	const buttonEnabled =
		['captured', 'refunded', 'partially_refunded'].includes(paymentStatus) &&
		isHasCreditNoteNo;

	const handleDownloadCreditNote = async () => {
		handleDownload({ id, type: 'credit-note', orderDetail });
	};

	return (
		<div className='flex items-center justify-between px-6 py-4'>
			<Text>Credit Note</Text>
			<Button
				onClick={handleDownloadCreditNote}
				size='small'
				disabled={!buttonEnabled}
				variant='secondary'
			>
				<ArrowDownTray />
				Download
			</Button>
		</div>
	);
};

const handleDownload = async ({
	id,
	type,
	orderDetail,
}: {
	id: string;
	type: 'invoice' | 'credit-note';
	orderDetail: CustomAdminOrder;
}) => {
	const data = {
		path: '',
		fileName: '',
	};

	switch (type) {
		case 'invoice': {
			const fileId = orderDetail?.metadata?.invoice_no || id;
			data.path = `/admin/custom/orders/${id}/download-invoice`;
			data.fileName = `invoice-${fileId}`;
			break;
		}
		case 'credit-note': {
			const fileId = orderDetail?.metadata?.credit_note_no || id;
			data.path = `/admin/custom/orders/${id}/download-credit-note`;
			data.fileName = `credit-note-${fileId}`;
			break;
		}
		default:
			break;
	}

	try {
		const response = await fetch(data.path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch invoice. Status: ${response.status}`);
		}

		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.fileName}.pdf`;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Error downloading invoice:', error);
	}
};
