import { IconCashRegister } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import classes from './CartBar.module.css';

interface cartBarProps{
  onCheckout: () => void;
  total: number;
}

export function CartBar({ onCheckout, total }: cartBarProps) {
  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <h2>Your Cart</h2>
      </div>
      <div className={classes.inner}>
        <h2>Total: ₹{total.toFixed(2)}&nbsp;  </h2>
        <Button variant="filled" onClick={onCheckout}>
          <IconCashRegister size={24} />
          Checkout 
        </Button>
      </div>
    </header>
  );
}
