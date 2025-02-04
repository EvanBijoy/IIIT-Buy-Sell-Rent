import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import { UserProvider } from './providers/UserContext';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <UserProvider>
        <Router />
      </UserProvider>
    </MantineProvider>
  );
}
