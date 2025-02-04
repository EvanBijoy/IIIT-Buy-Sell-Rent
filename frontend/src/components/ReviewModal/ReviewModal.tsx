import React, { useState } from 'react';
import { Modal, Textarea, Button, Rating } from '@mantine/core';
import { useUser } from "@/providers/UserContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ReviewModalProps {
  opened: boolean;
  onClose: () => void;
  sellerId: string;
  itemId?: string;
}

export function ReviewModal({ 
  opened, 
  onClose, 
  sellerId,
  itemId 
}: ReviewModalProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!user) {
      alert('You must be logged in to submit a review');
      return;
    }

    try {
      const response = await fetch('https://localhost:5000/api/user/addreview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': user.token || ''
        },
        body: JSON.stringify({
          userId: user.id,
          sellerId,
          rating,
          comment,
        })
      });

      if (response.ok) {
        onClose();
        toast.success('Review submitted successfully');
      } 
      else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } 
    catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title="Leave a Review"
      centered
    >
      <div className="space-y-4">
        <Rating 
          value={rating} 
          onChange={setRating}
          size="xl"
          className="mb-4"
        />
        <Textarea
          label="Comment"
          placeholder="Tell us about your experience"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          minRows={4}
        />
        <Button 
          onClick={handleSubmit} 
          fullWidth 
          mt="md"
          disabled={rating === 0}
        >
          Submit Review
        </Button>
      </div>
    </Modal>
  );
}