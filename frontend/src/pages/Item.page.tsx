import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "@/components/NavBar/NavBar";
import { Button, Card, Image, Text, Badge, Group, ScrollArea } from '@mantine/core';
import { IconUser, IconPhone, IconStar } from '@tabler/icons-react';
import { useUser } from "@/providers/UserContext";
import { ToastContainer, toast } from 'react-toastify';
import classes from '../pagestyles/Item.module.css';

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
  sellerReviews: {
    rating: number;
    comment: string;
  }[];
  sellerPhone: string;
}

export function ItemPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the item from the server when the page loads
  useEffect(() => {
    fetchItem();
  }, [id]);

  // Function to fetch the item from the server
  const fetchItem = async () => {
    
    try {
      // Fetch the item from the server
      const response = await fetch(`https://localhost:5000/api/item/${id}`);
      
      const data = await response.json();

      // Set the item
      setItem(data.item);
    } 
    
    catch (error) {
      toast.error('Failed to fetch item details');
    } 
    
    setLoading(false);
  };

  // Function to render the review stars based on the rating
  const renderReviewStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <IconStar 
        key={index} 
        size={16} 
        color={index < rating ? '#FFD700' : '#E0E0E0'}
        fill={index < rating ? '#FFD700' : 'none'}
      />
    ));
  };

  // Function to handle adding the item to the cart of the user
  const handleAddToCart = async () => {
    // If the user is not logged in or the item is not available, return
    if (!user?.id || !item?._id) return;
    
    try {
      // Add the item to the cart of the user
      // Send userId and itemId to the server to add the item to the cart
      // Also send the token of the user for authentication
      const response = await fetch('https://localhost:5000/api/user/addcart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': user.token || '',
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: item._id,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to add to cart');
      } 
      
      else {
        toast.success('Item added to cart');
      }
    } 
    
    catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <MainLayout>
      <NavbarMinimal />
      <div className={classes.container}>
        <ToastContainer autoClose={1000} hideProgressBar/>
        <div className={classes.gridContainer}>
          <ScrollArea type="scroll" offsetScrollbars>
            <Card withBorder radius="md" className={classes.mainCard}>
                <div className={classes.imageSection}>
                <Image src={item.image} alt={item.name} height={400} fit="contain"/>
                </div>
                
                <div className={classes.contentSection}>
                <Group>
                    <div>
                    <Text size="xl" fw={700} className={classes.title}>
                        {item.name}
                    </Text>
                    <Badge size="lg" color="blue" variant="light" mb="md">
                        {item.category}
                    </Badge>
                    </div>
                </Group>
                
                <Text size="lg" className={classes.description}>
                    {item.description}
                </Text>

                <Group mt="xl">
                    <Text fw={700} size="xl" color="blue">
                    ₹{item.price}
                    </Text>
                    <Button 
                    size="lg"
                    radius="xl"
                    onClick={handleAddToCart}
                    disabled={!user}
                    >
                    Add to Cart
                    </Button>
                </Group>
                </div>
            </Card>
          </ScrollArea>

          <Card withBorder radius="md" className={classes.reviewsCard}>
            <div className={classes.sellerInfo}>
                <Text size="xl" fw={700} mb="md">
                Seller Information
                </Text>
                <Group mb="md">
                    <IconUser size={24} />
                    <Text size="lg">Name: {item.sellerName}</Text>
                </Group>
                <Group mb="md">
                    <IconPhone size={24} />
                    <Text size="lg" mt="sm">Phone Number: {item.sellerPhone}</Text>
                </Group>
            </div>

            {/* Reviews Section */}
            <div className={classes.reviewsSection}>
                <div className={classes.reviewsHeader}>
                <Text size="xl" fw={700}>
                    Seller Reviews
                </Text>
                </div>

                <div className={classes.scrollContainer}>
                <ScrollArea type="scroll" offsetScrollbars>
                    {item.sellerReviews?.length === 0 ? (
                    <Text color="dimmed">No reviews available</Text>
                    ) : (
                    item.sellerReviews?.map((review, index) => (
                        <Card key={index} className={classes.reviewCard}>
                        <div className={classes.reviewItem}>
                            <div>{renderReviewStars(review.rating)}</div>
                            <Text size="sm" fw={500}>
                            {review.comment}
                            </Text>
                        </div>
                        </Card>
                    ))
                    )}
                </ScrollArea>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}