import React, { useState } from 'react';
import { Badge, Card, Group, Image, Text } from '@mantine/core';
import { IconUser, IconCheck, IconX } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useUser } from '@/providers/UserContext';
import classes from './FeaturesCardDelivery.module.css';
import { L } from 'vitest/dist/chunks/reporters.D7Jzd9GS';

interface FeaturesCardProps {
  itemId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  buyerName: string;
  orderId: string;
}

export function FeaturesCardDelivery({
  itemId,
  name,
  price,
  description,
  image,
  category,
  buyerName,
  orderId
}: FeaturesCardProps) {
  const { user } = useUser();
  const [otp, setOtp] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value);
  }

  const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const response = await fetch('https://localhost:5000/api/order/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': user?.token || ''
          },
          body: JSON.stringify({ orderId, otp }),
        });

        const result = await response.json();

        console.log(result);

        if (result.message === "OTP verified successfully") {
          setStatus('success');
          setTimeout(() => {
          }, 1500);
        } else {
          setStatus('error');
          setTimeout(() => setStatus('idle'), 1500);
        }
      } catch (error) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 1500);
      }
    }
  }

  const getCardClassName = () => {
    let baseClass = classes.card;
    if (status === 'success') baseClass += ` ${classes.successAnimation}`;
    if (status === 'error') baseClass += ` ${classes.errorShake}`;
    return baseClass;
  }

  const maxLength = 80;

  return (
    <Card withBorder radius="md" className={getCardClassName()}>
      <Card.Section className={classes.buyer}>
        <Text fw={600} fz="lg">
          Delivery to:&nbsp; 
        </Text>
        <Text fw={600} fz="lg" c="blue">
          <IconUser size={14} />
          {buyerName}
        </Text>
      </Card.Section>
      <Card.Section className={classes.imageSection}>
        <Image src={image} alt={name} height={200} />
      </Card.Section>

      <div className={classes.content}>
        <Text fw={600} fz="lg" className={classes.title}>
          {name}
        </Text>
        <Badge color="blue" variant="light" className={classes.category}>
          {category}
        </Badge>
        <Text fz="sm" c="dimmed" className={classes.description}>
          {description.length > maxLength ? description.substring(0, maxLength) + '...' : description}
        </Text>
      </div>

      <Card.Section className={classes.footer}>
        <Group justify="space-between" align="center">
          <Text fw={700} fz="xl" c="blue">
            ₹{price}
          </Text>
          {status === 'error' && (
            <Text c="red" fw={600}>
              <IconX size={16} /> Incorrect OTP
            </Text>
          )}
          {status === 'idle' && (
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter OTP"
              className={classes.otpInput}
              value={otp}
              onChange={handleOtpChange}
              onKeyPress={handleKeyPress}
              maxLength={4}
            />
          )}
          {status === 'success' && (
            <Text c="green" fw={700}>
              <IconCheck size={16} /> Order Delivered
            </Text>
          )}
        </Group>
      </Card.Section>
    </Card>
  );
}