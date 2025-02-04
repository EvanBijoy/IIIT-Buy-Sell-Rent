import { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "../components/NavBar/NavBar";
import { FeaturesCardDelivery } from "@/components/FeaturesCardDelivery/FeaturesCardDelivery";
import { useUser } from "@/providers/UserContext";
import { DeliveryBar } from "@/components/DeliveryBar/DeliveryBar";
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

export function DeliveryPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the items from the server
    fetchItems();
  }, []);

  // Function to fetch the items rlated to the user from the server
  // This includes the items that the user:
  // - has ordered and received
  // - has ordered and not received
  // - has put up for sale and delivered
  // - has put up for sale and not delivered
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
      
      // Set the items in the cart if the response is an array of items
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
  // This function filters the orders to get the orders that have the user's ID as its seller ID and that are not delivered
  // This basiclly gets the orders that the user has to deliver
  const getFilteredOrders = () => {
    return orders.filter(order => 
      order.sellerId === user?.id && !order.delivered
    );
  };

  // Get the filtered orders
  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <MainLayout>
        <NavbarMinimal />
        <div className={classes.scrollWrapper}>
          <DeliveryBar/>
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
      <DeliveryBar/>
      <div className={classes.mainContent}>
        {filteredOrders.length === 0 ? (
            <p>No orders found</p>
          ) :(
          filteredOrders.map(order =>
            <FeaturesCardDelivery
              itemId={order.itemId}
              name={order.item.name}
              price={order.item.price}
              description={order.item.description}
              image={order.item.image}
              category={order.item.category}
              buyerName={order.item.buyerName}
              orderId={order._id}
            />
        ))}
      </div>
    </div>
  </MainLayout>
  );
}