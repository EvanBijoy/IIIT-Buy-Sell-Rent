import React, { useState } from 'react';
import { useUser } from "@/providers/UserContext";
import { Modal, TextInput, Button, Select, FileInput } from '@mantine/core';

interface AddItemModalProps {
  opened: boolean;
  onClose: () => void;
  onItemAdded: (item: any) => void;
}

export function AddItemModal({ opened, onClose, onItemAdded }: AddItemModalProps) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://localhost:5000/api/item/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          sellerId: user?.id,
          available: true
        })
      });

      if (response.ok) {
        const newItem = await response.json();
        onItemAdded(newItem);
        onClose();
      } 
      else {
        const errorData = await response.json();
        alert(`Failed to add item: ${errorData.message}`);
      }
    } 
    catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const categories = ['Food', 'Clothes', 'Electronics', 'Furninture', 'Event Tickets', 'Miscellaneous'];

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title="Add New Item"
      centered
    >
      <div className="space-y-4">
        <TextInput
          label="Item Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextInput
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <TextInput
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <TextInput
          label="Image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          required
        />
        <Select
          label="Category"
          name="category"
          data={categories}
          value={formData.category}
          onChange={(value) => setFormData(prev => ({
            ...prev,
            category: value || ''
          }))}
          required
        />
        <Button onClick={handleSubmit} fullWidth mt="md">
          Add Item
        </Button>
      </div>
    </Modal>
  );
}