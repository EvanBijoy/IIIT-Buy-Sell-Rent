import { ReactNode } from 'react';
import { Container } from '@mantine/core';
import classes from './Main.module.css';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className={classes.pageContainer}>
      {children}
    </div>
  );
}