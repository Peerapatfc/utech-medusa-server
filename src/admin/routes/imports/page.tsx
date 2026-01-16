import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	type DropAnimation,
	KeyboardSensor,
	PointerSensor,
	type UniqueIdentifier,
	defaultDropAnimationSideEffects,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineRouteConfig } from '@medusajs/admin-sdk';
import {
	ArrowDownTray,
	Check,
	DocumentText,
	DotsSix,
	Spinner,
	Trash,
	XMark,
} from '@medusajs/icons';
import {
	Button,
	Container,
	Heading,
	IconButton,
	Text,
	Textarea,
	toast,
} from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import * as zod from 'zod';
//@ts-ignore
import CsvIcon from '../../assets/images/csv-file.png';
import { ActionMenu } from '../../components/common/action-menu';
import { type FileType, FileUpload } from '../../components/common/file-upload';
import { Form } from '../../components/common/form';
import { Combobox } from '../../components/inputs/combobox';
import { KeyboundForm } from '../../components/utilities/keybound-form';
import { sdk } from '../../lib/client';
import { IMPORT_TYPE_OPTIONS, SUPPORTED_FORMATS } from './constants';
import type {
	ImportValidationReport,
	ImportValidationReportResponse,
} from './type';

const ImportsPage = () => {
	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2' className='flex items-center'>
					<ArrowDownTray className='h-6 w-6 mt-2' />
					Import Data
				</Heading>
				<Link to='/imports/histories'>
					<Button variant='secondary'>See Import Histories</Button>
				</Link>
			</div>
			<div className='mt-2 p-6'>
				<ImportForm />
			</div>
		</Container>
	);
};

export const MediaSchema = zod.object({
	id: zod.string().optional(),
	url: zod.string(),
	file: zod.any().nullable(),
});

const ImportSchema = zod.object({
	import_type: zod.string().optional(),
	description: zod.string().optional(),
	file: zod.array(MediaSchema).optional(),
	url: zod.string().optional(),
	id: zod.string().optional(),
	original_filename: zod.string().optional(),
});

const dropAnimationConfig: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: '0.4',
			},
		},
	}),
};

const ImportForm = () => {
	const queryClient = useQueryClient();
	const revalidateImportHistories = () => {
		queryClient.invalidateQueries({
			queryKey: ['import-histories'],
		});
	};

	const form = useForm<zod.infer<typeof ImportSchema>>({
		defaultValues: {
			import_type: IMPORT_TYPE_OPTIONS[0].value,
			description: '',
		},
		resolver: zodResolver(ImportSchema),
	});

	const navigate = useNavigate();
	const handleSubmit = form.handleSubmit(async (data) => {
		data.file = undefined;

		const resp = await sdk.client
			.fetch<{
				success: boolean;
				data: unknown;
			}>('/admin/imports', {
				method: 'POST',
				credentials: 'include',
				body: data,
			})
			.catch((err) => {
				console.error('Import Error:', err?.message);
				toast.error(`Failed to import: ${err?.message}`);
				return { success: false, data: null };
			});

		if (resp.success) {
			toast.success('Imported successfully');
			revalidateImportHistories();
			navigate('/imports/histories');
		}
	});

	const { fields, append, remove } = useFieldArray({
		name: 'file',
		control: form.control,
		keyName: 'field_id',
	});

	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveId(null);
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = fields.findIndex((item) => item.field_id === active.id);
			const newIndex = fields.findIndex((item) => item.field_id === over?.id);

			form.setValue('file', arrayMove(fields, oldIndex, newIndex), {
				shouldDirty: true,
				shouldTouch: true,
			});
		}
	};

	const handleDragCancel = () => {
		setActiveId(null);
	};

	const getOnDelete = (index: number) => {
		return () => {
			setValidationReport(null);
			remove(index);
		};
	};

	const getItemHandlers = (index: number) => {
		return {
			onDelete: getOnDelete(index),
		};
	};

	const hasInvalidFiles = useCallback(
		(fileList: FileType[]) => {
			const invalidFile = fileList.find(
				(f) => !SUPPORTED_FORMATS.includes(f.file.type),
			);

			if (invalidFile) {
				const messageError = `Invalid file type: ${invalidFile.file.type}. Only ${SUPPORTED_FORMATS.join(', ')} are allowed.`;
				form.setError('file', {
					type: 'invalid_file',
					message: messageError,
				});

				return true;
			}

			const LIMIT_SIZE = 10 * 1024 * 1024; // 10MB
			const invalidSize = fileList.find((f) => f.file.size > LIMIT_SIZE);
			if (invalidSize) {
				const messageError = `Invalid file size: ${formatFileSize(invalidSize.file.size)}. The file size must be less than 10MB.`;
				form.setError('file', {
					type: 'invalid_file',
					message: messageError,
				});

				return true;
			}

			return false;
		},
		[form],
	);

	const onUploaded = useCallback(
		async (files: FileType[]) => {
			form.clearErrors('file');
			if (hasInvalidFiles(files)) {
				return;
			}

			await sdk.admin.upload
				.create({
					files: [files[0].file],
				})
				.then((res) => {
					form.setValue('url', res.files[0].url);
					form.setValue('id', res.files[0].id);
					form.setValue('original_filename', files[0].file.name);

					handleValidateImport({
						url: res.files[0].url,
						import_type: form.getValues('import_type') as string,
					});
				})
				.catch((err) => {
					console.error('Upload Error:', err?.message);
					toast.error(`Failed to upload: ${err?.message}`);
				});

			remove(0);

			for (const f of files) {
				append({ ...f });
			}
		},
		[form, append, remove, hasInvalidFiles],
	);

	const [isValidating, setIsValidating] = useState(false);
	const [validationReport, setValidationReport] =
		useState<ImportValidationReport | null>(null);

	const handleValidateImport = useCallback(
		async (data: {
			url: string;
			import_type: string;
		}) => {
			setIsValidating(true);
			const resp = await sdk.client
				.fetch<ImportValidationReportResponse>(
					'/admin/imports/validate-reports',
					{
						method: 'POST',
						credentials: 'include',
						body: {
							url: data.url,
							import_type: data.import_type,
						},
					},
				)
				.catch((err) => {
					console.error('Validation Error:', err);
					form.setError('file', {
						type: 'invalid_data',
						message: err?.message,
					});
					toast.error(`Validation Error: ${err?.message}`, {
						duration: 10000,
					});
					return { success: false, import_validation: null };
				})
				.finally(() => setIsValidating(false));

			if (resp.success) {
				setValidationReport(resp.import_validation);
			}
		},
		[form],
	);

	return (
		<Form {...form}>
			<KeyboundForm className='flex justify-center' onSubmit={handleSubmit}>
				<div className='flex w-full max-w-[720px] flex-col gap-y-8'>
					<div>
						<Heading>Import</Heading>
						<Text size='small' className='text-ui-fg-subtle'>
							Import your data from a CSV file. The first row of the CSV file
							should contain the column names.
						</Text>
					</div>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<Form.Field
							control={form.control}
							name='import_type'
							render={({ field }) => {
								return (
									<Form.Item>
										<Form.Label>Import Type</Form.Label>
										<Form.Control>
											<Combobox {...field} options={IMPORT_TYPE_OPTIONS} />
										</Form.Control>
										<Form.ErrorMessage />
									</Form.Item>
								);
							}}
						/>
					</div>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<Form.Field
							control={form.control}
							name='description'
							render={({ field }) => {
								return (
									<Form.Item>
										<Form.Label optional>Description</Form.Label>
										<Form.Control>
											<Textarea {...field} />
										</Form.Control>
										<Form.ErrorMessage />
									</Form.Item>
								);
							}}
						/>
					</div>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div>
							<Form.Field
								control={form.control}
								name='file'
								render={() => {
									return (
										<Form.Item>
											<div className='flex flex-col gap-y-2'>
												<div className='flex flex-col gap-y-1'>
													<Form.Label>File</Form.Label>
												</div>
												<Form.Control>
													<FileUpload
														label='Upload a file here'
														hint='Only CSV files are allowed'
														hasError={!!form.formState.errors.file}
														formats={SUPPORTED_FORMATS}
														onUploaded={onUploaded}
														multiple={false}
													/>
												</Form.Control>
												<Form.ErrorMessage />
											</div>
										</Form.Item>
									);
								}}
							/>
							<div className='mt-2'>
								<DndContext
									sensors={sensors}
									onDragEnd={handleDragEnd}
									onDragStart={handleDragStart}
									onDragCancel={handleDragCancel}
								>
									<DragOverlay dropAnimation={dropAnimationConfig}>
										{activeId ? (
											<MediaGridItemOverlay
												// biome-ignore lint/style/noNonNullAssertion: <explanation>
												field={fields.find((m) => m.field_id === activeId)!}
											/>
										) : null}
									</DragOverlay>
									<ul className='flex flex-col gap-y-2'>
										<SortableContext
											items={fields.map((field) => field.field_id)}
										>
											{fields.map((field, index) => {
												const { onDelete } = getItemHandlers(index);

												return (
													<MediaItem
														key={field.field_id}
														field={field}
														onDelete={onDelete}
													/>
												);
											})}
										</SortableContext>
									</ul>
								</DndContext>
							</div>
						</div>
					</div>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<>
							{validationReport && !isValidating && (
								<div>
									<Text size='base' weight='plus'>
										Validation Result
									</Text>
									<Text size='small' className='text-ui-fg-subtle'>
										{validationReport.total_rows} rows found in the file.
									</Text>
									<Text
										size='small'
										className='text-ui-fg-subtle text-green-500 flex items-center'
									>
										{validationReport.valid_rows} rows are valid.
										<Check className='ml-2' />
									</Text>
									<Text
										size='small'
										className='text-ui-fg-subtle text-red-500 flex items-center'
									>
										{validationReport.invalid_rows} rows are invalid.
										<XMark className='ml-2' />
									</Text>
									<div className='flex items-center gap-x-2 mt-5'>
										<Link
											to={validationReport.validation_report_url}
											download
											className='flex items-center gap-x-1'
										>
											<DocumentText />
											<Text size='small'>View validation report</Text>
										</Link>
									</div>
								</div>
							)}

							{isValidating && (
								<div className='flex items-center gap-x-2'>
									<Spinner className='animate-spin' />
									<Text size='small' className='text-ui-fg-subtle'>
										Validating...
									</Text>
								</div>
							)}
						</>
					</div>

					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='flex justify-end'>
							<Button
								type='submit'
								variant='primary'
								disabled={
									isValidating ||
									!validationReport ||
									validationReport.valid_rows === 0 ||
									form.formState.isSubmitting
								}
							>
								{form.formState.isSubmitting && (
									<Spinner className='animate-spin' />
								)}
								Import
							</Button>
						</div>
					</div>
				</div>
			</KeyboundForm>
		</Form>
	);
};

type MediaField = {
	url: string;
	id?: string | undefined;
	file?: File;
	field_id: string;
};

type MediaItemProps = {
	field: MediaField;
	onDelete: () => void;
};

const MediaItem = ({ field, onDelete }: MediaItemProps) => {
	const { t } = useTranslation();

	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: field.field_id });

	const style = {
		opacity: isDragging ? 0.4 : undefined,
		transform: CSS.Translate.toString(transform),
		transition,
	};

	if (!field.file) {
		return null;
	}

	return (
		<li
			className='bg-ui-bg-component shadow-elevation-card-rest flex items-center justify-between rounded-lg px-3 py-2'
			ref={setNodeRef}
			style={style}
		>
			<div className='flex items-center gap-x-2'>
				<IconButton
					variant='transparent'
					type='button'
					size='small'
					{...attributes}
					{...listeners}
					ref={setActivatorNodeRef}
					className='cursor-grab touch-none active:cursor-grabbing'
				>
					<DotsSix className='text-ui-fg-muted' />
				</IconButton>
				<div className='flex items-center gap-x-3'>
					<div className='bg-ui-bg-base h-10 w-[30px] overflow-hidden rounded-md'>
						<ThumbnailPreview url={CsvIcon} />
					</div>
					<div className='flex flex-col'>
						<Text size='small' leading='compact'>
							{field.file.name}
						</Text>
						<div className='flex items-center gap-x-1'>
							<Text
								size='xsmall'
								leading='compact'
								className='text-ui-fg-subtle'
							>
								{formatFileSize(field.file.size)}
							</Text>
						</div>
					</div>
				</div>
			</div>
			<div className='flex items-center gap-x-1'>
				<ActionMenu
					groups={[
						{
							actions: [
								{
									icon: <Trash />,
									label: t('actions.delete'),
									onClick: onDelete,
								},
							],
						},
					]}
				/>
				<IconButton
					type='button'
					size='small'
					variant='transparent'
					onClick={onDelete}
				>
					<XMark />
				</IconButton>
			</div>
		</li>
	);
};

const MediaGridItemOverlay = ({ field }: { field: MediaField }) => {
	return (
		<li className='bg-ui-bg-component shadow-elevation-card-rest flex items-center justify-between rounded-lg px-3 py-2'>
			<div className='flex items-center gap-x-2'>
				<IconButton
					variant='transparent'
					size='small'
					className='cursor-grab touch-none active:cursor-grabbing'
				>
					<DotsSix className='text-ui-fg-muted' />
				</IconButton>
				<div className='flex items-center gap-x-3'>
					<div className='bg-ui-bg-base h-10 w-[30px] overflow-hidden rounded-md'>
						<ThumbnailPreview url={CsvIcon} />
					</div>
					<div className='flex flex-col'>
						<Text size='small' leading='compact'>
							{field.file?.name}
						</Text>
						<div className='flex items-center gap-x-1'>
							<Text
								size='xsmall'
								leading='compact'
								className='text-ui-fg-subtle'
							>
								{formatFileSize(field.file?.size ?? 0)}
							</Text>
						</div>
					</div>
				</div>
			</div>
			<div className='flex items-center gap-x-1'>
				<ActionMenu groups={[]} />
				<IconButton
					type='button'
					size='small'
					variant='transparent'
					onClick={() => {}}
				>
					<XMark />
				</IconButton>
			</div>
		</li>
	);
};

const ThumbnailPreview = ({ url }: { url?: string | null }) => {
	if (!url) {
		return null;
	}

	return (
		<img src={url} alt='' className='size-full object-cover object-center' />
	);
};

function formatFileSize(bytes: number, decimalPlaces = 2): string {
	if (bytes === 0) {
		return '0 Bytes';
	}

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / k ** i).toFixed(decimalPlaces))} ${sizes[i]}`;
}

export const config = defineRouteConfig({
	label: 'Imports',
	icon: ArrowDownTray,
});

export default ImportsPage;
