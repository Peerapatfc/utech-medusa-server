import {
	clx,
	Heading,
	InlineTip,
	RadioGroup,
	Button,
	IconButton,
	Text,
	DatePicker,
} from '@medusajs/ui';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { MagnifyingGlass, XMarkMini } from '@medusajs/icons';

import { Divider } from '../../../../../../components/common/divider';
import { Form } from '../../../../../../components/common/form';
import { StackedFocusModal } from '../../../../../../components/modals/stacked-focus-modal';
import { useStackedModal } from '../../../../../../components/modals/stacked-modal-provider';
import type {
	BroadCastsCreateSchemaType,
	BroadCastsCustomerGroupsArrayType,
	BroadCastsCustomersArrayType,
} from './schema';
import { useTranslation } from 'react-i18next';
import { BroadCastsCustomerGroupForm } from '../../../../common/components/broadcasts-customer-group-form';
import { type Dispatch, type SetStateAction, useEffect } from 'react';
import { BroadCastsCustomerForm } from '../../../../common/components/broadcasts-customer-form';
import { AccountCell } from '../../../../../../components/table/table-cells/customer/account-cell/account-cell';
import { useCustomers } from '../../../../../../hooks/api/customers';
import { useCustomerTableQuery } from '../../../../../../hooks/table/query/use-customer-table-query';
import { keepPreviousData } from '@tanstack/react-query';

type BroadCastsDetailsFormProps = {
	form: UseFormReturn<BroadCastsCreateSchemaType>;
	broadcastType: string;
	setBroadcastType: Dispatch<SetStateAction<string>>;
	recipientType: string;
	setRecipientType: Dispatch<SetStateAction<string>>;
};

export const BroadCastsDetailsForm = ({
	form,
	broadcastType,
	setBroadcastType,
	recipientType,
	setRecipientType,
}: BroadCastsDetailsFormProps) => {
	const { t } = useTranslation();

	const { setIsOpen } = useStackedModal();

	const handleAddCustomerGroup = (
		groups: BroadCastsCustomerGroupsArrayType,
	) => {
		const newIds = groups.map((group) => group.id);

		const fieldsToAdd = groups.filter(
			(group) => !fields.some((field) => field.id === group.id),
		);

		for (const field of fields) {
			if (!newIds.includes(field.id)) {
				remove(fields.indexOf(field));
			}
		}

		append(fieldsToAdd);
		setIsOpen('cg', false);
	};

	const { searchParams } = useCustomerTableQuery({
		pageSize: 100000,
		prefix: 'count',
	});
	const { count } = useCustomers(
		{
			...searchParams,
			has_account: true,
			fields: 'id',
		},
		{
			placeholderData: keepPreviousData,
		},
	);

	const handleAddCustomer = (customers: BroadCastsCustomersArrayType) => {
		const newIds = customers.map((customer) => customer.id);

		const customerFieldsToAdd = customers.filter(
			(customer) => !customerFields.some((field) => field.id === customer.id),
		);

		for (const field of customerFields) {
			if (!newIds.includes(field.id)) {
				customerRemove(customerFields.indexOf(field));
			}
		}

		customerAppend(customerFieldsToAdd);
		setIsOpen('csm', false);
	};

	const { fields, remove, append } = useFieldArray({
		control: form.control,
		name: 'customer_group_ids',
		keyName: 'cg_id',
	});

	const {
		fields: customerFields,
		remove: customerRemove,
		append: customerAppend,
	} = useFieldArray({
		control: form.control,
		name: 'customer_ids',
		keyName: 'csm_id',
	});

	const { getValues } = form;

	useEffect(() => {
		setRecipientType(getValues('recipient_type'));
		setBroadcastType(getValues('broadcast_type'));
	}, [getValues, setBroadcastType, setRecipientType]);

	return (
		<div className='flex flex-1 flex-col items-center overflow-y-auto'>
			<div className='flex w-full max-w-[820px] flex-col gap-y-8 px-8 py-16'>
				<div>
					<Heading>{'Specify recipient and broadcast time'}</Heading>
				</div>
				<Form.Field
					control={form.control}
					name='recipient_type'
					render={({ field: { onChange, ...rest } }) => {
						return (
							<Form.Item>
								<div className='flex flex-col gap-y-4'>
									<div>
										<Form.Label>{'Recipient'}</Form.Label>
									</div>
									<Form.Control>
										<RadioGroup
											onValueChange={(e) => {
												onChange(e);
												setRecipientType(e);
											}}
											{...rest}
											className='grid grid-cols-1 gap-4 md:grid-cols-3'
										>
											<RadioGroup.ChoiceBox
												value={'all'}
												label={'All subscribers'}
												description={''}
											/>
											<RadioGroup.ChoiceBox
												value={'targeting'}
												label={'Targeting'}
												description={
													'Specify the recipient group from Customer Groups.'
												}
											/>
											<RadioGroup.ChoiceBox
												value={'specific'}
												label={'Specify recipient'}
												description={'Specify individual recipients'}
											/>
										</RadioGroup>
									</Form.Control>
								</div>
								<Form.ErrorMessage />
							</Form.Item>
						);
					}}
				/>
				{recipientType === 'all' && (
					<InlineTip label='Target estimate' variant='success'>
						Approx <span className='font-[600]'>{count?.toString() ?? 0}</span>{' '}
						people
					</InlineTip>
				)}
				{recipientType === 'targeting' && (
					<Form.Field
						control={form.control}
						name='customer_group_ids'
						render={({ field }) => {
							return (
								<Form.Item>
									<div>
										<Form.Label>{t('customerGroups.domain')}</Form.Label>
										<Form.Hint>
											{
												'Organize customers into groups. Groups can have different promotions and prices.'
											}
										</Form.Hint>
									</div>
									<Form.Control>
										<div
											className={clx(
												'bg-ui-bg-component shadow-elevation-card-rest transition-fg grid gap-1.5 rounded-xl py-1.5',
												"aria-[invalid='true']:shadow-borders-error",
											)}
											role='application'
											ref={field.ref}
										>
											<div className='text-ui-fg-subtle grid gap-1.5 px-1.5 md:grid-cols-2'>
												<div className='bg-ui-bg-field shadow-borders-base txt-compact-small rounded-md px-2 py-1.5'>
													{t(
														'priceLists.fields.customerAvailability.attribute',
													)}
												</div>
												<div className='bg-ui-bg-field shadow-borders-base txt-compact-small rounded-md px-2 py-1.5'>
													{t('operators.in')}
												</div>
											</div>
											<div className='flex items-center gap-1.5 px-1.5'>
												<StackedFocusModal id='cg'>
													<StackedFocusModal.Trigger
														asChild
														className='flex justify-between'
													>
														<button
															type='button'
															className='bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover shadow-borders-base txt-compact-small text-ui-fg-muted transition-fg focus-visible:shadow-borders-interactive-with-active flex flex-1 items-center gap-x-2 rounded-md px-2 py-1.5 outline-none'
														>
															<MagnifyingGlass />
															{t(
																'priceLists.fields.customerAvailability.placeholder',
															)}
														</button>
													</StackedFocusModal.Trigger>
													<StackedFocusModal.Trigger asChild>
														<Button variant='secondary'>
															{t('actions.browse')}
														</Button>
													</StackedFocusModal.Trigger>
													<StackedFocusModal.Content>
														<StackedFocusModal.Header />
														<BroadCastsCustomerGroupForm
															state={fields}
															setState={handleAddCustomerGroup}
															setIsOpen={setIsOpen}
															type='focus'
														/>
													</StackedFocusModal.Content>
												</StackedFocusModal>
											</div>
											{fields.length > 0 ? (
												<div className='flex flex-col gap-y-1.5'>
													<Divider variant='dashed' />
													<div className='flex flex-col gap-y-1.5 px-1.5'>
														{fields.map((field, index) => {
															return (
																<div
																	key={field.cg_id}
																	className='bg-ui-bg-field-component shadow-borders-base flex items-center justify-between gap-2 rounded-md px-2 py-0.5'
																>
																	<Text size='small' leading='compact'>
																		{field.name}{' '}
																		{field.customers > 0
																			? `(${field.customers})`
																			: ''}
																	</Text>
																	<IconButton
																		size='small'
																		variant='transparent'
																		type='button'
																		onClick={() => remove(index)}
																	>
																		<XMarkMini />
																	</IconButton>
																</div>
															);
														})}
													</div>
												</div>
											) : null}
										</div>
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
				)}
				{recipientType === 'specific' && (
					<Form.Field
						control={form.control}
						name='customer_ids'
						render={({ field }) => {
							return (
								<Form.Item>
									<div>
										<Form.Label>{t('customers.domain')}</Form.Label>
									</div>
									<Form.Control>
										<div
											className={clx(
												'bg-ui-bg-component shadow-elevation-card-rest transition-fg grid gap-1.5 rounded-xl py-1.5',
												"aria-[invalid='true']:shadow-borders-error",
											)}
											role='application'
											ref={field.ref}
										>
											<div className='text-ui-fg-subtle grid gap-1.5 px-1.5 md:grid-cols-2'>
												<div className='bg-ui-bg-field shadow-borders-base txt-compact-small rounded-md px-2 py-1.5'>
													{t('customers.domain')}
												</div>
												<div className='bg-ui-bg-field shadow-borders-base txt-compact-small rounded-md px-2 py-1.5'>
													{t('operators.in')}
												</div>
											</div>
											<div className='flex items-center gap-1.5 px-1.5'>
												<StackedFocusModal id='csm'>
													<StackedFocusModal.Trigger
														asChild
														className='flex justify-between'
													>
														<button
															type='button'
															className='bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover shadow-borders-base txt-compact-small text-ui-fg-muted transition-fg focus-visible:shadow-borders-interactive-with-active flex flex-1 items-center gap-x-2 rounded-md px-2 py-1.5 outline-none'
														>
															<MagnifyingGlass />
															{'Search for customers'}
														</button>
													</StackedFocusModal.Trigger>
													<StackedFocusModal.Trigger asChild>
														<Button variant='secondary'>
															{t('actions.browse')}
														</Button>
													</StackedFocusModal.Trigger>
													<StackedFocusModal.Content>
														<StackedFocusModal.Header />
														<BroadCastsCustomerForm
															state={customerFields}
															setState={handleAddCustomer}
															type='focus'
															setIsOpen={setIsOpen}
														/>
													</StackedFocusModal.Content>
												</StackedFocusModal>
											</div>
											{customerFields.length > 0 ? (
												<div className='flex flex-col gap-y-1.5'>
													<Divider variant='dashed' />
													<div className='flex flex-col gap-y-1.5 px-1.5'>
														{customerFields.map((field, index) => {
															return (
																<div
																	key={field.csm_id}
																	className='bg-ui-bg-field-component shadow-borders-base flex items-center justify-between gap-2 rounded-md px-2 py-0.5'
																>
																	<div className='w-full grid grid-cols-3'>
																		<Text size='small'>{field.email}</Text>
																		<Text size='small'>{field.name}</Text>
																		<AccountCell
																			hasAccount={field.has_account}
																		/>
																	</div>
																	<IconButton
																		size='small'
																		variant='transparent'
																		type='button'
																		onClick={() => customerRemove(index)}
																	>
																		<XMarkMini />
																	</IconButton>
																</div>
															);
														})}
													</div>
												</div>
											) : null}
										</div>
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
				)}
				<Divider />
				<Form.Field
					control={form.control}
					name='broadcast_type'
					render={({ field: { onChange, ...rest } }) => {
						return (
							<Form.Item>
								<div className='flex flex-col gap-y-4'>
									<div>
										<Form.Label>{'Broadcast time'}</Form.Label>
									</div>
									<Form.Control>
										<RadioGroup
											onValueChange={(e) => {
												onChange(e);
												setBroadcastType(e);
											}}
											{...rest}
											className='grid grid-cols-1 gap-4 md:grid-cols-2'
										>
											<RadioGroup.ChoiceBox
												value={'now'}
												label={'Send now'}
												description={''}
											/>
											<RadioGroup.ChoiceBox
												value={'scheduled'}
												label={'Set time period'}
												description={''}
											/>
										</RadioGroup>
									</Form.Control>
								</div>
								<Form.ErrorMessage />
							</Form.Item>
						);
					}}
				/>
				{broadcastType === 'scheduled' && (
					<Form.Field
						control={form.control}
						name='scheduled_at'
						render={({ field }) => {
							return (
								<Form.Item>
									<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
										<div className='flex flex-col'>
											<Form.Label optional={false}>
												{'Schedule a time to send notifications?'}
											</Form.Label>
											<Form.Hint>
												{'Schedule a future notification to be sent'}
											</Form.Hint>
										</div>
										<Form.Control>
											<DatePicker
												granularity='minute'
												shouldCloseOnSelect={false}
												{...field}
											/>
										</Form.Control>
									</div>
									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
				)}
				{/* <Divider />
				<div className='flex flex-col gap-y-4'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
						<div className='col-span-3'>
							<Form.Label>{'Advanced settings'}</Form.Label>
						</div>
						<div className='col-span-9'>
							<div className='mb-6'>
								<Form.Field
									name='isABTest'
									render={({
										field: { onChange, ref, ...field },
									}) => {
										return (
											<Form.Item>
												<Form.Control>
													<div className='flex items-center space-x-2 my-auto'>
														<Checkbox
															{...field}
															ref={ref}
															id={'a-b-test'}
															onCheckedChange={onChange}
															checked={field.value}
															className='bg-ui-bg-base'
														/>
														<Label
															htmlFor={'a-b-test'}
														>
															{'Create A/B test'}
														</Label>
													</div>
												</Form.Control>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
								<Text size='small' className='ml-7 text-ui-fg-subtle'>
									{'The quick brown fox jumps over a lazy dog.'}
								</Text>
							</div>
							<div>
								<Form.Field
									name='isAssignToCampaign'
									render={({
										field: { onChange, ref, ...field },
									}) => {
										return (
											<Form.Item>
												<Form.Control>
													<div className='flex items-center space-x-2 my-auto'>
														<Checkbox
															{...field}
															ref={ref}
															id={'assign-to-campaign'}
															onCheckedChange={onChange}
															checked={field.value}
															className='bg-ui-bg-base'
														/>
														<Label
															htmlFor={'assign-to-campaign'}
														>
															{'Assign to a campaign'}
														</Label>
													</div>
												</Form.Control>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
								<Text size='small' className='ml-7 text-ui-fg-subtle'>
									{'The quick brown fox jumps over a lazy dog.'}
								</Text>
							</div>
						</div>
					</div>
				</div> */}
			</div>
		</div>
	);
};
