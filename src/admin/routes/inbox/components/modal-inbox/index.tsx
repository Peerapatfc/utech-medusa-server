import * as Dialog from '@radix-ui/react-dialog';
import type { ContactUs } from '@customTypes/contact-us';
import { dateFormat } from '../../../../lib/date';
import { Copy, Button } from '@medusajs/ui';

type ModalInboxProps = {
	isOpen: boolean;
	onClose: () => void;
	message: ContactUs;
};

const ModalInbox = ({ message, isOpen, onClose }: ModalInboxProps) => {
	const nameUser = message.name;
	const emailUser = message.email;
	const receivedDate = dateFormat(message.created_at);
	const messageDetail = message.message;

	const userInfo = [
		{ label: 'คุณ', value: nameUser },
		{ label: 'อีเมล', value: emailUser },
	];

	return (
		<div>
			<Dialog.Root open={isOpen} onOpenChange={onClose}>
				<Dialog.Portal>
					<Dialog.Overlay className='fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow' />
					<Dialog.Content
						onOpenAutoFocus={(event) => event.preventDefault()}
						aria-describedby={undefined}
						className='fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white dark:bg-[#212124] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow'
					>
						<Dialog.Title className='p-6 text-[22px] font-[600]'>
							ข้อความจาก...
						</Dialog.Title>
						<hr />

						<div className='flex flex-col gap-y-8 p-6'>
							{userInfo.map(({ label, value }) => (
								<div key={label} className='flex items-center justify-between'>
									<p className='flex items-center gap-x-3'>
										<span className='text-[22px] font-[600]'>{label} :</span>
										<span>{value}</span>
									</p>
									<Copy content={value} className='focus:outline-none' />
								</div>
							))}
							{/* detail message */}
							<div>
								<p className='text-[22px] font-[600] mb-3'>รายละเอียดข้อความ</p>
								<span className='break-words'>{messageDetail}</span>
							</div>
							{/* detail message */}

							<div className='flex flex-col items-center gap-y-4'>
								<p className='text-[12px]'>
									ได้รับ ณ วันที่ <span>{receivedDate}</span>
								</p>

								<Button onClick={onClose} type='button'>
									Close
								</Button>
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
};

export default ModalInbox;
