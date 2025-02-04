import { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "../components/NavBar/NavBar";
import { FeaturesCard } from "@/components/FeaturesCard/FeaturesCard";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { useUser } from "@/providers/UserContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatBot from "@/components/ChatBot/ChatBot.js";
import classes from '../pagestyles/Home.module.css';

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

export function HomePage() {
  const { user } = useUser();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the items from the server when the page loads
  useEffect(() => {
    fetchItems();
  }, []);

  // Function to fetch items from the server
  const fetchItems = async () => {
    
    try {
      // Fetch items from the server
      // Also send the token of the user for authentication
      const response = await fetch('https://localhost:5000/api/item/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': user?.token || ''
        }
      });

      const data = await response.json();

      // Set the items in the cart and the filtered items
      if (Array.isArray(data.items)) {
        setItems(data.items);
        setFilteredItems(data.items);
        localStorage.setItem('items', JSON.stringify(data.items));
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

  // Function to filter items based on the search term
  const handleSearch = (searchText: string, selectedCategories: string[]) => {
    const lowerSearchText = searchText.toLowerCase().trim();
  
    const filtered = items.filter(item => {
      const matchesText = lowerSearchText === '' || 
        item.name.toLowerCase().includes(lowerSearchText) || 
        item.category.toLowerCase().includes(lowerSearchText);
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(item.category);
  
      return item.available && matchesText && matchesCategory;
    });
  
    setFilteredItems(filtered);
  };
  
 
  // Function to add an item to the cart of the user on the server
  const handleAddToCart = async (userId: string, itemId: string,) => {
    
    try {
      // Add item to the cart
      // Also send the token of the user for authentication
      const response = await fetch('https://localhost:5000/api/user/addcart', {
        method: 'POST',
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
      
      // Show a toast message based on the response from the server
      if (!response.ok) {
        toast.error(data.message || 'Failed to add to cart');
      }
      
      else{
        toast.success('Item added to cart');
      }
    } 
    
    catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <NavbarMinimal />
        <div className={classes.scrollWrapper}>
          <SearchBar onSearch={handleSearch} />
          <div className={classes.mainContent}>
            <p>Loading...</p>
          </div>
          <ChatBot />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <NavbarMinimal />
        <div className={classes.scrollWrapper}>
          <SearchBar onSearch={handleSearch}/>
          <div className={classes.mainContent}>
            <p>{error}</p>
          </div>
          <ChatBot />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ToastContainer autoClose={1000} hideProgressBar/>
      <NavbarMinimal />
      <div className={classes.scrollWrapper}>
        <SearchBar onSearch={handleSearch} />
        <div className={classes.mainContent}>
          {filteredItems.map(item => (
            <FeaturesCard
              orderId={item._id}
              name={item.name}
              price={item.price}
              description={item.description}
              image={item.image}
              category={item.category}
              seller={item.sellerId}
              sellerName={item.sellerName}
              onAddToCart={() => user?.id ? handleAddToCart(user.id, item._id) : undefined}
              onSellerClick={() => {}}
            />
          ))}
        </div>
        <ChatBot />
      </div>
    </MainLayout>
  );
}