// router.tsx
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useUser } from './providers/UserContext';
import { LoginPage } from './pages/Login.page';
import { RegisterPage } from './pages/Register.page';
import { HomePage } from './pages/Home.page';
import { CartPage } from './pages/Cart.page';
import { SellPage } from './pages/Sell.page';
import { DeliveryPage } from './pages/Delivery.page';
import { AccountPage } from './pages/Account.page';
import { HistoryPage } from './pages/History.page';
import { ReviewPage } from './pages/Review.page';
import { ItemPage } from './pages/Item.page';

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Define routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/delivery', element: <DeliveryPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/sell', element: <SellPage /> },
      { path: '/reviews', element: <ReviewPage /> },
      { path: '/item/:id', element: <ItemPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/cas', element: <RegisterPage /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
