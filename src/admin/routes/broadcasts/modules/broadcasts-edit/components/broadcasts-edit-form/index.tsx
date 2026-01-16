import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ProgressTabs, toast } from '@medusajs/ui';
import { type FieldPath, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import {
	RouteFocusModal,
	useRouteModal,
} from '../../../../../../components/modals';
import { KeyboundForm } from '../../../../../../components/utilities/keybound-form';
import { BroadCastsDetailsForm } from '../../../broadcasts-create/components/broadcasts-create-form/broadcasts-details-form';
import {
	BroadCastsCreateSchema,
	type BroadCastsCreateSchemaType,
	BroadCastsDetailsFields,
	BroadCastsDetailsSchema,
} from '../../../broadcasts-create/components/broadcasts-create-form/schema';
import { BroadCastsForm } from '../../../broadcasts-create/components/broadcasts-create-form/broadcasts-form';
import {
	initialTabState,
	StoreNotificationStatus,
	Tab,
	tabOrder,
	type TabState,
} from '../../../../common/constants';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import {
	getStoreNotificationById,
	updateStoreNotificationById,
} from '../../../../../../hooks/api/store-notifications';
import BroadCastsConfirmForm from '../../../../common/components/broadcasts-confirm-form';
import BroadCastsPrimaryButtonForm from '../../../../common/components/broadcasts-primary-button-form';

export const BroadCastsEditForm = () => {
	const { id } = useParams();
	const [tab, setTab] = useState<Tab>(Tab.DETAIL);
	const [tabState, setTabState] = useState<TabState>(initialTabState);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isPromptConfirm, setIsPromptConfirm] = useState<boolean>(false);
	const [broadcastType, setBroadcastType] = useState<string>('now');
	const [recipientType, setRecipientType] = useState<string>('all');
	const [currentImage, setCurrentImage] = useState<string>();

	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();

	const form = useForm<BroadCastsCreateSchemaType>({
		defaultValues: {
			subject_line: '',
			recipient_type: 'all',
			status: 'draft',
			broadcast_type: 'now',
			category: 'announcement',
			description: '',
			scheduled_at: dayjs().toDate(),
		},
		resolver: zodResolver(BroadCastsCreateSchema),
	});

	const { setValue, getValues } = form;

	const handleBeforeSubmit = (status: StoreNotificationStatus) => {
		setValue('status', status);
		handleSubmit();
	};

	const confirmedSubmitForm = async (data: BroadCastsCreateSchemaType) => {
		if (data.image_url) {
			const formData = new FormData();
			formData.append('files', data.image_url?.file);
			const uploadResponse = await fetch('/admin/uploads', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});
			const uploads = await uploadResponse.json();
			// @ts-ignore
			data.image_url = uploads?.files[0]?.url;
		} else {
			// @ts-ignore
			data.image_url = currentImage ?? null;
		}
		// @ts-ignore
		data.customer_group_ids = data.customer_group_ids?.map((group) => group.id);
		// @ts-ignore
		data.customer_ids = data.customer_ids?.map((customer) => customer.id);
		if (id) {
			await updateStoreNotificationById(id, data);
		}
		if (data.status === 'draft') {
			toast.success('Save as draft, completed');
		}
		if (data.status === 'sent') {
			toast.success('Sending...');
		}
		if (data.status === 'scheduled') {
			toast.success('Schedule, completed');
		}
		setIsPromptConfirm(false);
		handleSuccess('/broadcasts');
	};

	const handleSubmit = form.handleSubmit(async (data) => {
		setIsLoading(true);
		if (data.status !== StoreNotificationStatus.DRAFT) {
			setIsLoading(false);
			setIsPromptConfirm(true);
		} else {
			confirmedSubmitForm(data);
		}
	});

	const partialFormValidation = (
		fields: FieldPath<BroadCastsCreateSchemaType>[],
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		schema: z.ZodSchema<any>,
	) => {
		form.clearErrors(fields);

		const values = fields.reduce(
			(acc, key) => {
				acc[key] = form.getValues(key);
				return acc;
			},
			{} as Record<string, unknown>,
		);

		const validationResult = schema
			.superRefine((data, ctx) => {
				if (
					data.recipient_type === 'targeting' &&
					data.customer_group_ids.length === 0
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Must have at least 1 customer groups.',
						path: ['customer_group_ids'],
					});
				}
				if (
					data.recipient_type === 'specific' &&
					data.customer_ids.length === 0
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Must have at least 1 customers.',
						path: ['customer_ids'],
					});
				}
				if (data.broadcast_type === 'scheduled' && !data.scheduled_at) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'The schedule time is required.',
						path: ['scheduled_at'],
					});
				}
				if (
					data.broadcast_type === 'scheduled' &&
					data.scheduled_at < dayjs().toDate()
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'The schedule time have to more than now.',
						path: ['scheduled_at'],
					});
				}
			})
			.safeParse(values);
		if (!validationResult.success) {
			for (const { path, message, code } of validationResult.error.errors) {
				form.setError(path.join('.') as keyof BroadCastsCreateSchemaType, {
					type: code,
					message,
				});
			}
			return false;
		}

		return true;
	};

	const isTabDirty = (tab: Tab) => {
		switch (tab) {
			case Tab.DETAIL: {
				const fields = BroadCastsDetailsFields;

				return fields.some((field) => {
					return form.getFieldState(field).isDirty;
				});
			}
		}
	};

	const handleChangeTab = (update: Tab) => {
		if (tab === update) {
			return;
		}

		if (tabOrder.indexOf(update) < tabOrder.indexOf(tab)) {
			const isCurrentTabDirty = isTabDirty(tab);

			setTabState((prev) => ({
				...prev,
				[tab]: isCurrentTabDirty ? prev[tab] : 'not-started',
				[update]: 'in-progress',
			}));

			setTab(update);
			return;
		}

		// get the tabs from the current tab to the update tab including the current tab
		const tabs = tabOrder.slice(0, tabOrder.indexOf(update));

		// validate all the tabs from the current tab to the update tab if it fails on any of tabs then set that tab as current tab
		for (const tab of tabs) {
			if (tab === Tab.DETAIL) {
				if (
					!partialFormValidation(
						BroadCastsDetailsFields,
						BroadCastsDetailsSchema,
					)
				) {
					setTabState((prev) => ({
						...prev,
						[tab]: 'in-progress',
					}));
					setTab(tab);
					return;
				}

				setTabState((prev) => ({
					...prev,
					[tab]: 'completed',
				}));
			}
		}

		setTabState((prev) => ({
			...prev,
			[tab]: 'completed',
			[update]: 'in-progress',
		}));
		setTab(update);
	};

	const handleNextTab = (tab: Tab) => {
		if (tabOrder.indexOf(tab) + 1 >= tabOrder.length) {
			return;
		}

		const nextTab = tabOrder[tabOrder.indexOf(tab) + 1];
		handleChangeTab(nextTab);
	};

	useEffect(() => {
		const fetchData = async () => {
			if (id) {
				const res = await getStoreNotificationById(id);
				setValue('subject_line', res.subject_line);
				if (res.description) {
					setValue('description', res.description);
				}
				setValue('category', res.category);
				if (res.image_url) {
					setCurrentImage(res.image_url);
				}
				setValue('recipient_type', res.recipient_type);
				setRecipientType(res.recipient_type);
				if (res.customer_group_ids) {
					setValue(
						'customer_group_ids',
						res.customer_groups?.map((group) => ({
							id: group.id,
							name: group.name ?? '-',
							customers: group.customers?.length ?? 0,
						})),
					);
				}
				if (res.customer_ids) {
					setValue(
						'customer_ids',
						res.customers?.map((customer) => ({
							id: customer.id,
							name: `${customer.first_name} ${customer.last_name}`,
							email: customer.email ?? '-',
							has_account: true,
						})),
					);
				}
				setValue('status', res.status);
				setValue('broadcast_type', res.broadcast_type);
				setBroadcastType(res.broadcast_type);
				if (res.scheduled_at) {
					setValue('scheduled_at', dayjs(res.scheduled_at).toDate());
				}
			}
		};
		fetchData();
	}, [id, setValue]);

	return (
		<RouteFocusModal.Form
			form={form}
			unsavedChangesTitle='Discarded'
			unsavedChangesDescription='Any unsaved changes will be lost. Discard your changes?'
			actionContinueText='Discard'
			variant='danger'
		>
			<ProgressTabs
				value={tab}
				onValueChange={(tab) => handleChangeTab(tab as Tab)}
				className='flex h-full flex-col overflow-hidden'
			>
				<KeyboundForm onSubmit={handleSubmit} className='flex h-full flex-col'>
					<RouteFocusModal.Header>
						<div className='flex w-full items-center justify-between gap-x-4'>
							<div className='-my-2 w-full max-w-[600px] border-l'>
								<ProgressTabs.List className='grid w-full grid-cols-3'>
									<ProgressTabs.Trigger
										status={tabState.detail}
										value={Tab.DETAIL}
									>
										{'Recipient and Time'}
									</ProgressTabs.Trigger>
									<ProgressTabs.Trigger
										status={tabState.broad_cast}
										value={Tab.BOARD_CAST}
									>
										{'Broadcast'}
									</ProgressTabs.Trigger>
								</ProgressTabs.List>
							</div>
						</div>
					</RouteFocusModal.Header>
					<RouteFocusModal.Body className='size-full overflow-hidden'>
						<ProgressTabs.Content
							className='size-full overflow-y-auto'
							value={Tab.DETAIL}
						>
							<BroadCastsDetailsForm
								form={form}
								setBroadcastType={setBroadcastType}
								broadcastType={broadcastType}
								setRecipientType={setRecipientType}
								recipientType={recipientType}
							/>
						</ProgressTabs.Content>
						<ProgressTabs.Content
							className='size-full overflow-y-auto'
							value={Tab.BOARD_CAST}
						>
							<BroadCastsForm
								form={form}
								currentImage={currentImage}
								setCurrentImage={setCurrentImage}
							/>
						</ProgressTabs.Content>
					</RouteFocusModal.Body>
					<RouteFocusModal.Footer>
						<div className='flex items-center justify-end gap-x-2'>
							<RouteFocusModal.Close asChild>
								<Button variant='secondary' size='small'>
									{t('actions.cancel')}
								</Button>
							</RouteFocusModal.Close>
							<BroadCastsPrimaryButtonForm
								tab={tab}
								next={handleNextTab}
								isLoading={isLoading}
								broadcastType={broadcastType}
								handleBeforeSubmit={handleBeforeSubmit}
							/>
						</div>
					</RouteFocusModal.Footer>
				</KeyboundForm>
			</ProgressTabs>
			<BroadCastsConfirmForm
				status={getValues('status') as StoreNotificationStatus}
				isPromptConfirm={isPromptConfirm}
				setIsPromptConfirm={setIsPromptConfirm}
				form={form}
				confirmedSubmitForm={confirmedSubmitForm}
			/>
		</RouteFocusModal.Form>
	);
};
