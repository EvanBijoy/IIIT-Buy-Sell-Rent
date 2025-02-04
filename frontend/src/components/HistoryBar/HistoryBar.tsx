import { Container, Tabs } from '@mantine/core';
import classes from './HistoryBar.module.css';

const tabs = [
  'Pending Orders',
  'Items Bought',
  'Items Sold',
];

interface HistoryBarProps {
  activeTab: string;
  onTabChange: (tab: string | null) => void;
}

export function HistoryBar({ activeTab, onTabChange }: HistoryBarProps) {
  const items = tabs.map((tab) => (
    <Tabs.Tab value={tab} key={tab}>
      {tab}
    </Tabs.Tab>
  ));

  return (
    <div className={classes.header}>
      <Container size="md">
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          variant="outline"
          visibleFrom="sm"
          classNames={{
            root: classes.tabs,
            list: classes.tabsList,
            tab: classes.tab,
          }}
        >
          <Tabs.List>{items}</Tabs.List>
        </Tabs>
      </Container>
    </div>
  );
}