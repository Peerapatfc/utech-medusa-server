import { Prompt } from '@medusajs/ui';
import type { PropsWithChildren } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';
import { Form } from '../../common/form';

type RouteModalFormProps<TFieldValues extends FieldValues> = PropsWithChildren<{
	form: UseFormReturn<TFieldValues>;
	blockSearch?: boolean;
	onClose?: (isSubmitSuccessful: boolean) => void;
	unsavedChangesTitle?: string;
	unsavedChangesDescription?: string;
	actionCancelText?: string;
	actionContinueText?: string;
	variant?: 'danger' | 'confirmation';
}>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const RouteModalForm = <TFieldValues extends FieldValues = any>({
	form,
	blockSearch = false,
	children,
	onClose,
	unsavedChangesTitle,
	unsavedChangesDescription,
	actionCancelText,
	actionContinueText,
	variant = 'confirmation',
}: RouteModalFormProps<TFieldValues>) => {
	const { t } = useTranslation();

	const {
		formState: { isDirty },
	} = form;

	const blocker = useBlocker(({ currentLocation, nextLocation }) => {
		const { isSubmitSuccessful } = nextLocation.state || {};

		if (isSubmitSuccessful) {
			onClose?.(true);
			return false;
		}

		const isPathChanged = currentLocation.pathname !== nextLocation.pathname;
		const isSearchChanged = currentLocation.search !== nextLocation.search;

		if (blockSearch) {
			const ret = isDirty && (isPathChanged || isSearchChanged);

			if (!ret) {
				onClose?.(isSubmitSuccessful);
			}

			return ret;
		}

		const ret = isDirty && isPathChanged;

		if (!ret) {
			onClose?.(isSubmitSuccessful);
		}

		return ret;
	});

	const handleCancel = () => {
		blocker?.reset?.();
	};

	const handleContinue = () => {
		blocker?.proceed?.();
		onClose?.(false);
	};

	return (
		<Form {...form}>
			{children}
			<Prompt open={blocker.state === 'blocked'} variant={variant}>
				<Prompt.Content>
					<Prompt.Header>
						<Prompt.Title>
							{unsavedChangesTitle ?? t('general.unsavedChangesTitle')}
						</Prompt.Title>
						<Prompt.Description>
							{unsavedChangesDescription ??
								t('general.unsavedChangesDescription')}
						</Prompt.Description>
					</Prompt.Header>
					<Prompt.Footer>
						<Prompt.Cancel onClick={handleCancel} type='button'>
							{actionCancelText ? actionCancelText : t('actions.cancel')}
						</Prompt.Cancel>
						<Prompt.Action onClick={handleContinue} type='button'>
							{actionContinueText ? actionContinueText : t('actions.continue')}
						</Prompt.Action>
					</Prompt.Footer>
				</Prompt.Content>
			</Prompt>
		</Form>
	);
};
