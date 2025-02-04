import { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "../components/NavBar/NavBar";
import { FeaturesCardCart } from "@/components/FeaturesCardCart/FeaturesCardCart";
import { useUser } from "@/providers/UserContext";
import { CartBar } from "@/components/CartBar/CartBar";
import { ToastContainer, toast } from 'react-toastify';
import { Modal, Text, Group } from '@mantine/core';
import 'react-toastify/dist/ReactToastify.css';
import classes from '../pagestyles/Cart.module.css';

// An interface for the item object
interface Item {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sellerId: string;
  available: boolean;
}

export function CartPage() {
  const { user } = useUser();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentOtp, setCurrentOtp] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  // Function to fetch items from the cart of the user from the server
  const fetchItems = async () => {
    
    try {
      
      // Fetch items from the cart
      // Also send the token of the user for authentication
      const response = await fetch('https://localhost:5000/api/user/cart/' + user?.id,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        }
      });

      const data = await response.json();

      // Set the items in the cart
      if (Array.isArray(data.items)) {
        setItems(data.items);
      } 
      
      else {
        throw new Error('Invalid response format');
      }

      // Set loading to false
      setLoading(false);
    } 
    
    catch (error) {
      setError('Failed to fetch items');
      setLoading(false);
    }
  };

  // Function to remove an item from the cart of the user on the server
  const removeFromCart = (userId: string, itemId: string) => async () => {
    
    try {

      // Remove item from the cart
      // Also send the token of the user for authentication
      const response = await fetch('https://localhost:5000/api/user/remcart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        },
        body: JSON.stringify({
          userId,
          itemId,
        }),
      });

      const data = await response.json();

      // Check if the item was removed successfully
      if (!response.ok) {
        toast.error(data.message || 'Failed to remove item from cart');
        return;
      }

      // Remove the item from the cart on the client side and show a success message
      setItems(prev => prev.filter(item => item._id !== itemId));
      toast.success('Item removed from cart');
    } 
    
    catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  // Function to handle the checkout process of the user on the server
  const handleCheckout = async () => {
    try {

      // Checkout request the items in the cart of the user
      // Sends the buyerId and totalAmount of the items in the cart for the order confirmation
      // Also send the token of the user for authentication
      const response = await fetch('https://localhost:5000/api/order/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        },
        body: JSON.stringify({
          buyerId: user?.id,
          totalAmount: items.reduce((total, item) => total + item.price, 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to checkout');
        return;
      }

      // Save the order history of the user in the local storage
      // Firstly get the existing order history from the local storage
      // Then add the new order to the existing order history
      // Finally save the updated order history in the local storage
      const existingOrderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const orderHistory = Array.isArray(existingOrderHistory) ? existingOrderHistory : [];

      const newOrder = {
        items: data.itemIds,
        otp: data.otp,
        timestamp: new Date().toISOString(),
      };

      orderHistory.push(newOrder);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

      // Show a success message and clear the cart of the user on the client side
      // Also show the OTP for the order confirmation in a modal and show success message
      setItems([]);
      setCurrentOtp(data.otp);
      setShowOtpModal(true);
      toast.success('Checkout successful!');
    } 
    
    catch (error) {
      console.error('Failed to checkout:', error);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <MainLayout>
        <NavbarMinimal />
        <div className={classes.scrollWrapper}>
          <CartBar onCheckout={handleCheckout} total={total}/>
          <div className={classes.mainContent}>
            <p>Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <NavbarMinimal />
      <div className={classes.scrollWrapper}>
        <ToastContainer autoClose={1000} hideProgressBar/>
        <CartBar onCheckout={handleCheckout} total={total}/>
        <div className={classes.mainContent}>
          {items
          .filter(item => item.available)
          .map(item => (
            <FeaturesCardCart
              key={item._id}
              orderId={item._id}
              name={item.name}
              price={item.price}
              description={item.description}
              image={item.image}
              category={item.category}
              onRemoveFromCart={user?.id ? removeFromCart(user.id, item._id) : undefined}
            />
          ))}
        </div>

        <Modal opened={showOtpModal} onClose={() => setShowOtpModal(false)} title="Order Confirmation" centered size="sm">
          <Group>
            <Text size="lg">
              Your OTP for this order is:
            </Text>
            <Text size="xl" color="blue">
              {currentOtp}
            </Text>
            <Text size="sm" color="dimmed">
              Please save this OTP. You'll need it to confirm your delivery.
            </Text>
          </Group>
        </Modal>
      </div>
    </MainLayout>
  );
}

export default CartPage;