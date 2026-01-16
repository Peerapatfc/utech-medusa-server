import type { ConfigData } from './config-data';

export enum TopSearchType {
	SEARCH_ENGINE = 'search-engine',
	RECOMMEND = 'recommend',
}
export interface TopSearchesBody {
	id: string;
	search: string;
	product_id?: string;
	type: 'search-engine' | 'recommend';
	uri: string;
	deleted_at?: Date;
}

export interface CreateTopSearchesBody extends TopSearchesBody {}

export type TopSearchConfigDataForm = {
	general: TopSearchGeneralData;
};

export type TopSearchGeneralData = {
	enabled: ConfigData;
	display_mode: ConfigData;
};

export type RecommendSettingForm = {
	id: string;
	name_value: string;
	uri_value: string;
};

export interface UpdateTopSearchBody extends CreateTopSearchesBody {}
