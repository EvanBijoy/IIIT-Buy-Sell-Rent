import { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "../components/NavBar/NavBar";
import { FeaturesCardSelf } from "@/components/FeaturesCardSelf/FeaturesCardSelf";
import { useUser } from "@/providers/UserContext";
import { SellBar } from "../components/SellBar/SellBar";
import { AddItemModal } from "../components/AddItemModal/AddItemModal";
import classes from '../pagestyles/Sell.module.css';

// An interface for the item object
interface Item {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sellerId: string;
  sellerName: string;
  available: boolean;
}

export function SellPage() {
  const { user } = useUser();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal

  // Fetch the items from the server when the page loads
  useEffect(() => {
    fetchItems();
  }, []);

  // Function to fetch items from the server
  const fetchItems = async () => {
    
    try {
      // Fetch items from the server
      // Also send the token of the user for authentication
      const response = await fetch('https://localhost:5000/api/item/get/' + user?.id,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        }
      });

      const data = await response.json();

      // Set the items in the cart if the response is in valid format
      if (Array.isArray(data.items)) {
        setItems(data.items);
      } 
      
      else {
        throw new Error('Invalid response format');
      }

      setLoading(false);
    } 
    
    catch (error) {
      setError('Failed to fetch items');
      setLoading(false);
    }
  };

  const handleItemAdded = (newItem: Item) => {
    setItems(prevItems => [...prevItems, newItem]);
  };

  return (
    <MainLayout>
      <NavbarMinimal />
      <div className={classes.scrollWrapper}>
        <SellBar onAddClick={() => setIsModalOpen(true)} /> {/* Pass click handler */}
        <AddItemModal 
          opened={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onItemAdded={handleItemAdded}
        />
        <div className={classes.mainContent}>
          {items
            .filter(item => item.available)
            .map(item => (
              <FeaturesCardSelf
                orderId={item._id}
                name={item.name}
                price={item.price}
                description={item.description}
                image={item.image}
                category={item.category}
              />
            ))}
        </div>
      </div>
    </MainLayout>
  );
}