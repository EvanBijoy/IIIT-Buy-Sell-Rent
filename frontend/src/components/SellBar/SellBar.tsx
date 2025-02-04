import { IconPlus } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import classes from './SellBar.module.css';

interface SellBarProps {
  onAddClick: () => void;
}

export function SellBar({ onAddClick }: SellBarProps) {
  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <h2>Items for Sale</h2>
      </div>
      <div className={classes.inner}>
        <Button  onClick={onAddClick}>
          <IconPlus size={24} />
          Add item 
        </Button>
      </div>
    </header>
  );
}