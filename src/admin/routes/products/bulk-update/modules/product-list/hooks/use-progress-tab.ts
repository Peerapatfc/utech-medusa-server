import { useState } from 'react';
import type { InitialStatus, Tab } from '../type/tab';

interface Props {
	tabNames: Tab[];
	lockedTab?: boolean;
}
const getInitialStatus = (tabNames: Tab[]) => {
	return tabNames.reduce((acc: InitialStatus, tabName: Tab, index) => {
		acc[tabName] = index === 0 ? 'in-progress' : 'not-started';
		return acc;
	}, {} as InitialStatus);
};

export const useProgressTab = ({ tabNames, lockedTab }: Props) => {
	const [selectedTab, setSelectedTab] = useState<Tab>(tabNames[0]);
	const initialStatus = getInitialStatus(tabNames);

	const [tabStatus, setTabStatus] = useState<InitialStatus>(initialStatus);

	const getStatusTab = (currentTab: Tab): InitialStatus => {
		if (currentTab === selectedTab) return tabStatus;

		const currentTabIndex = tabNames.indexOf(currentTab);

		const statusMap: InitialStatus = tabNames.reduce(
			(acc: InitialStatus, tabName: Tab, index: number) => {
				if (index < currentTabIndex) {
					acc[tabName] = 'completed';
				} else if (index === currentTabIndex) {
					acc[tabName] = 'in-progress';
				} else {
					acc[tabName] = 'not-started';
				}
				return acc;
			},
			{} as InitialStatus,
		);

		return statusMap;
	};

	const handleNextTab = (tab: Tab) => {
		if (lockedTab) return;
		const countTabs = tabNames.length;
		const indexNextTab = tabNames.indexOf(tab) + 1;
		if (indexNextTab >= countTabs) {
			return;
		}
		const nextTab = tabNames[indexNextTab];
		handleChangeTab(nextTab);
	};

	const handleChangeTab = (tab: Tab) => {
		if (lockedTab) return;
		if (tab === selectedTab) return;
		setSelectedTab(tab);
		const updatedStatus = getStatusTab(tab);
		setTabStatus(updatedStatus);
	};

	return {
		selectedTab,
		tabStatus,
		handleNextTab,
		handleChangeTab,
	};
};
