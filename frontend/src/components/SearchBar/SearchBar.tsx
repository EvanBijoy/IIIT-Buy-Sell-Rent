import { useState, useEffect } from 'react';
import { MultiSelect, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import classes from './SearchBar.module.css';

interface SearchBarProps {
  onSearch?: (searchText: string, selectedCategories: string[]) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const categories = ['Food', 'Clothes', 'Electronics', 'Furniture', 'Event Tickets', 'Miscellaneous'];

  useEffect(() => {
    onSearch?.(searchText, selectedCategories);
  }, [searchText, selectedCategories]);

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <TextInput
          className={classes.searchInput}
          value={searchText}
          onChange={(event) => setSearchText(event.currentTarget.value)}
          placeholder="Search for items..."
        />

        <MultiSelect
          className={classes.searchBar}
          data={categories}
          value={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Filter by categories"
          clearable
          searchable
        />
      </div>
    </header>
  );
}
