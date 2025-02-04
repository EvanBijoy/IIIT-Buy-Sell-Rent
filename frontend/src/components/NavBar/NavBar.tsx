import { useState, useEffect } from 'react';
import {
  IconShoppingCart,
  IconTruckDelivery,
  IconBuildingStore,
  IconHistory,
  IconHome2,
  IconLogout,
  IconDevicesCheck,
  IconUser,
} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton, Modal, Text, Group, Button } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../providers/UserContext';
import IIITLogo from '../IIITLogo/Logo';
import classes from './NavBar.module.css';

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  const navigate = useNavigate();

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton 
        onClick={() => {
          if(label === 'Logout') {
            onClick?.();  
          } 
          
          else {
            onClick?.();
            if(label === 'Home') {
              navigate('/');
            } 
            
            else {
              navigate(`/${label.toLowerCase()}`);
            }
          }
        }} 
        className={classes.link} 
        data-active={active || undefined}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Home', path: '/' },
  { icon: IconShoppingCart, label: 'Cart', path: '/cart' },
  { icon: IconHistory, label: 'History', path: '/history' },
  { icon: IconBuildingStore, label: 'Sell', path: '/sell' },
  { icon: IconTruckDelivery, label: 'Delivery', path: '/delivery' },
  { icon: IconDevicesCheck, label: 'Reviews', path: '/reviews' },
  { icon: IconUser, label: 'Account', path: '/account' },
];

export function NavbarMinimal() {
  const { logout } = useUser();
  const [active, setActive] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  // Update active state based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = mockdata.findIndex(item => 
      currentPath === item.path || 
      (currentPath === '/' && item.label === 'Home')
    );
    if (activeIndex !== -1) {
      setActive(activeIndex);
    }
  }, [location]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center>
        <IIITLogo/>
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} onClick={handleLogout} label="Logout" />
      </Stack>

      <Modal opened={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout" centered size="sm"
      >
        <Text size="sm" mb="lg">
          Are you sure you want to logout? You will need to login again to access your account.
        </Text>
        <Group>
          <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmLogout}>
            Logout
          </Button>
        </Group>
      </Modal>
    </nav>
  );
}