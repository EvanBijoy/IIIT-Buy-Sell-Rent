import classes from './ReviewBar.module.css';

interface SellBarProps {
  onAddClick: () => void;
}

export function ReviewBar() {
  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <h2>Provide Reviews</h2>
      </div>
    </header>
  );
}