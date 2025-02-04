import { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "../components/NavBar/NavBar";
import { FeaturesCardReview } from "@/components/FaeturesCardReview/FeaturesCardReview";
import { useUser } from "@/providers/UserContext";
import { ReviewBar } from "@/components/ReviewBar/ReviewBar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classes from '../pagestyles/Cart.module.css';

// An interface for the order object
interface Order {
  _id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  delivered: boolean;
  item: {
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    available: boolean;
    sellerName: string;
    buyerName: string;
  };
}

export function ReviewPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the items from the server when the page loads
  useEffect(() => {
    fetchItems();
  }, []);

  // Function to fetch the items rlated to the user from the server
  const fetchItems = async () => {
    
    try {
      // Fetch the items from the server
      // Also send the token of the user for authentication
      const response = await fetch(`https://localhost:5000/api/order/history/${user?.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        }
      });
      
      const data = await response.json();

      const orders = data.orders;
      
      // Set the items in the cart and set the loading state to false
      setOrders(orders);
      setLoading(false);
    } 
    
    catch (error) {
      setError('Failed to fetch orders');
      setLoading(false);
      toast.error('Failed to fetch order history');
    }
  };

  // Function to get the filtered orders
  const getFilteredOrders = () => {
    // The orders that have been delivered to the user is filtered
    // This is done by checking if the buyerId of the order is the same as the id of the user 
    // And if the order has been delivered
    return orders.filter(order => 
        order.buyerId === user?.id && order.delivered
    );
  };

  // Get the filtered orders
  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <MainLayout>
        <NavbarMinimal />
        <div className={classes.scrollWrapper}>
          <ReviewBar/>
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
      <ReviewBar/>
      <div className={classes.mainContent}>
        {filteredOrders.length === 0 ? (
            <p>No orders found</p>
          ) :(
          filteredOrders.map(order =>
            <FeaturesCardReview
              itemId={order.itemId}
              name={order.item.name}
              price={order.item.price}
              description={order.item.description}
              image={order.item.image}
              category={order.item.category}
              sellerId={order.sellerId}
            />
        ))}
      </div>
    </div>
  </MainLayout>
  );
}