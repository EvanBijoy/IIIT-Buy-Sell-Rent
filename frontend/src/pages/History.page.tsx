import { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "../components/NavBar/NavBar";
import { FeaturesCardHistory } from "@/components/FeaturesCardHistory/FeaturesCardHistory";
import { useUser } from "@/providers/UserContext";
import { HistoryBar } from "@/components/HistoryBar/HistoryBar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classes from '../pagestyles/History.module.css';

// An interface for the order object stored in local storage
interface StoredOrder {
  items: string[];
  otp: string;
  timestamp: string;
}

// An interface for the order object
interface Order {
  _id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  delivered: boolean;
  otp?: number;
  item: {
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    available: boolean;
    sellerName: string;
  };
}

export function HistoryPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('Pending Orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to get the OTP stored in local storage
  const getStoredOTP = (itemId: string): number => {
    
    try {
      // Get the order history from local storage
      // This is stored as an array of orders where each order is an object
      const storedHistory = localStorage.getItem('orderHistory');
      if (!storedHistory) return 0;
  
      const orderHistory: StoredOrder[] = JSON.parse(storedHistory);
      
      // Find the order that contains the item with the given ID
      const matchingOrder = orderHistory.find(order => {
        return order.items.some(id => id === itemId);
      });
      
      // Return the OTP if found else return 0
      return matchingOrder ? parseInt(matchingOrder.otp, 10) : 0;
    } 
    
    catch (error) {
      console.error('Error retrieving OTP:', error);
      return 0;
    }
  };

  // Function to fetch the order history of the user from the server
  // This includes the items that the user:
  // - has ordered and received
  // - has ordered and not received
  // - has put up for sale and delivered
  // - has put up for sale and not delivered
  const fetchOrderHistory = async () => {
    
    try {
      // Fetch the order history from the server
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

      // Set the orders if the response is an array of orders
      if (Array.isArray(data.orders)) {
        const updatedOrders = data.orders.map((order: Order) => ({
          ...order,
          otp: getStoredOTP(order.itemId), // Get the OTP from local storage
        }));

        setOrders(updatedOrders);
      } 
      
      else {
        throw new Error('Invalid response format');
      }

      setLoading(false);
    } 
    
    catch (error) {
      setError('Failed to fetch orders');
      setLoading(false);
      toast.error('Failed to fetch order history');
    }
  };

  // Fetch the order history when the component mounts for the first time
  useEffect(() => {
    fetchOrderHistory();
  }, []);
  
  // Function to get the filtered orders
  const getFilteredOrders = () => {

    switch (activeTab) {
      // Get the orders that is yet to be delivered to the user
      // This is done by filtering the orders that have the user's ID as its buyer ID and that are not delivered
      case 'Pending Orders':
        return orders.filter(order => 
          order.buyerId === user?.id && !order.delivered
        );

      // Get the orders that the user has bought and received
      // This is done by filtering the orders that have the user's ID as its buyer ID and that are delivered
      case 'Items Bought':
        return orders.filter(order => 
          order.buyerId === user?.id && order.delivered
        );

      // Get the orders that the user has sold and delivered
      // This is done by filtering the orders that have the user's ID as its seller ID and that are delivered
      case 'Items Sold':
        return orders.filter(order => 
          order.sellerId === user?.id && order.delivered
        );

      // Returns no orders if the active tab is not one of the above
      default:
        return [];
    }
  };

  // Function to handle the change in the active tab
  const handleTabChange = (tab: string | null) => {
    if(tab) {
      setActiveTab(tab);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <NavbarMinimal />
        <div className={classes.scrollWrapper}>
          <HistoryBar activeTab={activeTab} onTabChange={handleTabChange}/>
          <div className={classes.mainContent}>
            <p>Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Get the filtered orders
  const filteredOrders = getFilteredOrders();

  return (
    <MainLayout>
      <NavbarMinimal />
      <div className={classes.scrollWrapper}>
        <ToastContainer autoClose={3000} hideProgressBar/>
        <HistoryBar activeTab={activeTab} onTabChange={handleTabChange}/>
        <div className={classes.mainContent}>
          {filteredOrders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            filteredOrders.map(order => (
              <FeaturesCardHistory
                orderId={order.itemId}
                name={order.item.name}
                price={order.item.price}
                description={order.item.description}
                image={order.item.image}
                category={order.item.category}
                sellerName={order.item.sellerName}
                otp={order.otp || 0}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}