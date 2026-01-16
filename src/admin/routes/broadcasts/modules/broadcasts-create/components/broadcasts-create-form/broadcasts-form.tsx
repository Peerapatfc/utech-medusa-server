import type { UseFormReturn } from 'react-hook-form';
import { Button, Heading, Input, Textarea } from '@medusajs/ui';
import type { BroadCastsCreateSchemaType } from './schema';
import { Form } from '../../../../../../components/common/form';
import { Combobox } from '../../../../../../components/inputs/combobox';
import { type Dispatch, type SetStateAction, useRef, useState } from 'react';
import {
	type FileType,
	FileUpload,
} from '../../../../../../components/common/file-upload';
import { useTranslation } from 'react-i18next';
import {
	StoreNotificationCategoryOptions,
	SUPPORTED_FORMATS,
	SUPPORTED_FORMATS_FILE_EXTENSIONS,
} from '../../../../common/utils';
import { BroadCastsPreviewImage } from './broadcasts-preview-image';

type BroadCastsProductsFormProps = {
	form: UseFormReturn<BroadCastsCreateSchemaType>;
	currentImage?: string;
	setCurrentImage?: Dispatch<SetStateAction<string | undefined>>;
};

export const BroadCastsForm = ({
	form,
	currentImage,
	setCurrentImage,
}: BroadCastsProductsFormProps) => {
	const { t } = useTranslation();
	const { setValue, getValues } = form;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const textareaRef = useRef<any>(null);
	const [image, setImage] = useState<FileType>();
	const [isImageUploading, setIsImageUploading] = useState<boolean>(false);

	const insertAtCursor = (insertText: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const description = getValues('description');
		const newText =
			description.substring(0, start) + insertText + description.substring(end);

		setValue('description', newText);

		// Set cursor position after inserted text
		setTimeout(() => {
			textarea.selectionStart = textarea.selectionEnd =
				start + insertText.length;
			textarea.focus();
		}, 0);
	};

	const hasInvalidFiles = (fileList: FileType[]) => {
		const invalidFile = fileList.find(
			(f) => !SUPPORTED_FORMATS.includes(f.file.type),
		);
		if (invalidFile) {
			form.setError('image_url', {
				type: 'invalid_file',
				message: t('products.media.invalidFileType', {
					name: invalidFile.file.name,
					types: SUPPORTED_FORMATS_FILE_EXTENSIONS.join(', '),
				}),
			});

			return true;
		}

		const exceedsSizeLimit = fileList.find(
			(f) => f.file.size > 2 * 1024 * 1024,
		);
		if (exceedsSizeLimit) {
			form.setError('image_url', {
				type: 'invalid_file',
				message: 'File exceeds size limit.',
			});

			return true;
		}

		return false;
	};

	const handleImageDelete = () => {
		form.clearErrors('image_url');
		setValue('image_url', undefined);
		setImage(undefined);
		if (setCurrentImage) {
			setCurrentImage(undefined);
		}
	};

	return (
		<div className='flex flex-1 flex-col items-center overflow-y-auto'>
			<div className='flex w-full max-w-[820px] flex-col gap-y-8 px-8 py-16'>
				<div>
					<Heading>{'Broadcast'}</Heading>
				</div>
				<div className='grids grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Form.Field
						control={form.control}
						name='subject_line'
						render={({ field }) => {
							return (
								<Form.Item>
									<Form.Label>{'Subject Line'}</Form.Label>
									<Form.Control>
										<Input
											{...field}
											onChange={field.onChange}
											placeholder={'Subject Line'}
										/>
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
					<Form.Field
						control={form.control}
						name='category'
						render={({ field }) => {
							return (
								<Form.Item>
									<Form.Label>{'Category'}</Form.Label>
									<Form.Control>
										<Combobox
											{...field}
											multiple={false}
											placeholder='Select'
											options={StoreNotificationCategoryOptions}
											value={field.value}
											onChange={field.onChange}
											className='bg-ui-bg-base'
										/>
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
					<Form.Field
						control={form.control}
						name='description'
						render={({ field }) => {
							return (
								<Form.Item className='col-span-2'>
									<Form.Label>{'Description'}</Form.Label>
									<Form.Control>
										<Textarea
											{...field}
											ref={textareaRef}
											id='description'
											className='min-h-20'
											value={field.value}
											onChange={(e) => field.onChange(e.target.value)}
											placeholder={'Description'}
										/>
									</Form.Control>
									<Form.ErrorMessage />
									<Button
										size='base'
										variant='secondary'
										type='button'
										onClick={() => insertAtCursor('{{account_name}}')}
									>
										{'Account name'}
									</Button>
								</Form.Item>
							);
						}}
					/>
					<Form.Field
						control={form.control}
						name='image_url'
						render={({ field }) => {
							return (
								<Form.Item className='col-span-2'>
									<Form.Label optional>{'Media'}</Form.Label>
									<Form.Control>
										<FileUpload
											multiple={false}
											label={t('products.media.uploadImagesLabel')}
											hint={`${t('products.media.uploadImagesHint')} (Optional, max file size: 2MB, formats: JPEG, PNG, GIF)`}
											hasError={!!form.formState.errors.image_url}
											formats={SUPPORTED_FORMATS}
											onUploaded={(files) => {
												setIsImageUploading(true);
												form.clearErrors('image_url');
												files.map((f) => {
													setImage(f);
													if (setCurrentImage) [setCurrentImage(undefined)];
												});
												setTimeout(() => {
													if (hasInvalidFiles(files)) {
														setTimeout(() => {
															handleImageDelete();
														}, 5000);
														setIsImageUploading(false);
														return;
													}

													field.onChange(files[0]);
													setIsImageUploading(false);
												}, 1500);
											}}
										/>
									</Form.Control>
									<BroadCastsPreviewImage
										form={form}
										image={image}
										isImageUploading={isImageUploading}
										handleImageDelete={handleImageDelete}
										currentImage={currentImage}
									/>
								</Form.Item>
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
};
