import React from 'react';
import { Badge, Button, Card, Center, Group, Image, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import classes from './FeaturesCardCart.module.css';

interface FeaturesCardProps {
  orderId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  onRemoveFromCart?: () => void;
}

export function FeaturesCardCart({
  orderId,
  name,
  price,
  description,
  image,
  category,
  onRemoveFromCart,
}: FeaturesCardProps) {
  const maxLength = 80;
  
  return (
    <Link to={`/item/${orderId}`} style={{ textDecoration: 'none' }}>
      <Card withBorder radius="md" className={classes.card}>
        <Card.Section className={classes.imageSection}>
          <Image src={image} alt={name} height={200} />
        </Card.Section>

        <div className={classes.content}>
          <Text fw={600} fz="lg" className={classes.title}>
            {name}
          </Text>
          <Badge  color="blue" variant="light" className={classes.category}>
            {category}
          </Badge>
          <Text fz="sm" c="dimmed" className={classes.description}>
            {description.length > maxLength ? description.substring(0, maxLength) + '...' : description}
          </Text>
        </div>

        <Card.Section className={classes.footer}>
          <Group>
            <div>
              <Text fw={700} fz="xl" c="blue">
                ₹{price}
              </Text>
            </div>
            <Button radius="xl" size="md" onClick={onRemoveFromCart}>
              Remove
            </Button>
          </Group>
        </Card.Section>
      </Card>
    </Link>
  );
}
