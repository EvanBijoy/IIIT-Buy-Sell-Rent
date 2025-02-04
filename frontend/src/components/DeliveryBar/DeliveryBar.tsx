import classes from './DeliveryBar.module.css';

interface SellBarProps {
  onAddClick: () => void;
}

export function DeliveryBar() {
  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <h2>Pending Deliveries</h2>
      </div>
    </header>
  );
}