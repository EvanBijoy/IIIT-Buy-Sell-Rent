import React, { useState } from 'react';
import { Badge, Card, Group, Image, Text, Button } from '@mantine/core';
import classes from './FeaturesCardReview.module.css';
import { ReviewModal } from '../ReviewModal/ReviewModal';
import { Link } from 'react-router-dom';

interface FeaturesCardProps {
  itemId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sellerId: string;
}

export function FeaturesCardReview({
  itemId,
  name,
  price,
  description,
  image,
  category,
  sellerId
}: FeaturesCardProps) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const maxLength = 80;

  const handleReviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReviewModalOpen(true);
  };

  return (
    <Link to={`/item/${itemId}`} style={{ textDecoration: 'none' }}>
      <>
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
            <Button radius="xl" size="md" onClick={handleReviewClick}>
              Review
            </Button>
          </Group>
        </Card.Section>
      </Card>

      <ReviewModal 
      opened={reviewModalOpen}
      onClose={() => setReviewModalOpen(false)}
      sellerId={sellerId}
      />
      </>
    </Link>
  );
}
