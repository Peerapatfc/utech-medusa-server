import { model } from '@medusajs/framework/utils';

const ContactUsModel = model.define('contact_us', {
	id: model.id().primaryKey(),
	name: model.text(),
	email: model.text(),
	message: model.text(),
	admin_read_status: model.array().default([]),
});

export default ContactUsModel;
