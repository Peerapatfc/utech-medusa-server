import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { StoreNotificationStatus } from '../../constants';
import { useTranslation } from 'react-i18next';
import { Prompt } from '@medusajs/ui';
import dayjs from 'dayjs';

type BroadCastsConfirmFormProps<
	BroadCastsCreateSchemaType extends FieldValues,
> = PropsWithChildren<{
	form: UseFormReturn<BroadCastsCreateSchemaType>;
	status: StoreNotificationStatus;
	isPromptConfirm: boolean;
	setIsPromptConfirm: Dispatch<SetStateAction<boolean>>;
	confirmedSubmitForm: (data: BroadCastsCreateSchemaType) => void;
}>;

const BroadCastsConfirmForm = <
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	BroadCastsCreateSchemaType extends FieldValues = any,
>({
	form,
	status,
	isPromptConfirm,
	setIsPromptConfirm,
	confirmedSubmitForm,
}: BroadCastsConfirmFormProps<BroadCastsCreateSchemaType>) => {
	const { t } = useTranslation();

	const handleConfirmSubmit = form.handleSubmit(async (data) => {
		setIsPromptConfirm(false);
		confirmedSubmitForm(data);
	});

	const scheduled_at = form.getValues(
		'scheduled_at' as Path<BroadCastsCreateSchemaType>,
	);

	const _recipient_type = form.getValues(
		'recipient_type' as Path<BroadCastsCreateSchemaType>,
	);
	const recipient_type =
		_recipient_type === 'all' ? 'all subscribers' : _recipient_type;
	return (
		<Prompt open={isPromptConfirm} variant='confirmation'>
			<Prompt.Content>
				<Prompt.Header>
					<Prompt.Title>{'Send broadcast?'}</Prompt.Title>
					<Prompt.Description>
						{status === StoreNotificationStatus.SENT
							? `This broadcast will be immediately sent to ${recipient_type}. Continue?`
							: `This broadcast will be sent to ${recipient_type} at ${dayjs(scheduled_at).format('D MMM YYYY HH:mm')}. Continue?`}
					</Prompt.Description>
				</Prompt.Header>
				<Prompt.Footer>
					<Prompt.Cancel
						onClick={() => setIsPromptConfirm(false)}
						type='button'
					>
						{t('actions.cancel')}
					</Prompt.Cancel>
					<Prompt.Action onClick={() => handleConfirmSubmit()} type='button'>
						{status === StoreNotificationStatus.SENT ? 'Send now' : 'Send'}
					</Prompt.Action>
				</Prompt.Footer>
			</Prompt.Content>
		</Prompt>
	);
};

export default BroadCastsConfirmForm;
