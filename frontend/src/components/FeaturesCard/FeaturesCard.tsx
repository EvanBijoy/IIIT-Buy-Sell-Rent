import React from 'react';
import { Badge, Button, Card, Center, Group, Image, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from './FeaturesCard.module.css';

interface FeaturesCardProps {
  orderId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  seller: string;
  sellerName: string;
  onAddToCart?: () => void;
  onSellerClick?: () => void;
}

export function FeaturesCard({
  orderId,
  name,
  price,
  description,
  image,
  category,
  seller,
  sellerName,
  onAddToCart,
  onSellerClick,
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

          <Group mt="sm" justify='right'>
            <Button variant="subtle" onClick={onSellerClick}>
              <IconUser size={14} />
              {sellerName}
            </Button>
          </Group>
        </div>

        <Card.Section className={classes.footer}>
          <Group>
            <div>
              <Text fw={700} fz="xl" c="blue">
                ₹{price}
              </Text>
            </div>
            <Button radius="xl" size="md" onClick={onAddToCart}>
              Add to Cart
            </Button>
          </Group>
        </Card.Section>
      </Card>
    </Link>
  );
}
