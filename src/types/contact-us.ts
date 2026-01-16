export type ContactUsForm = {
	name: string;
	email: string;
	message: string;
};

export type Response = {
	status: Status;
	code: Code;
	message: string;
};

export type ContactUs = ContactUsForm & {
	id: string;
	created_at: string;
	is_read: boolean;
};

export type ContactUsResponse = {
	data: ContactUs[];
	count: number;
	limit: number;
	offset: number;
};

export enum Status {
	SUCCESS = 'success',
	BADREQUEST = 'bad_request',
}

export enum Code {
	SUCCESS = 200,
	BADREQUEST = 400,
}

export type ContactUsFilters = {
	email: string;
	date: string;
	status: '' | 'read' | 'unread';
};
