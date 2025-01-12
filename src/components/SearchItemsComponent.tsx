import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Searchbar, Divider } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useStrings } from '../core/localization/languageContext';
import { normalizeString } from '../core/utils';
import { CatalogItemAdd } from './itemComponents/CatalogItemAdd';
import { colors } from '../core/theme';

interface SearchComponentProps {
  allItems: ItemReq[];
  onSearchQueryChange?: (query: string) => void;
}

const SearchComponent = ({ allItems, onSearchQueryChange }: SearchComponentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<ItemReq[]>([]);
  const strings = useStrings();

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearchQueryChange?.(query);
    },
    [onSearchQueryChange]
  );

  // Filter items based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const filtered = allItems.filter((item) => {
      const normalizedQuery = normalizeString(searchQuery);
      return (
        normalizeString(item.title).includes(normalizedQuery) ||
        normalizeString(item.category?.title || '').includes(normalizedQuery) ||
        normalizeString(item.description || '').includes(normalizedQuery)
      );
    });

    setFilteredItems(filtered);
  }, [searchQuery, allItems]);
  const renderSearchItem = useCallback((item: ItemReq, index: number) => {
    return (
      <View key={index}>
        <CatalogItemAdd item={item} />
      </View>
    );
  }, []);
  return (
    <>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={strings.SEARCH}
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchInput}
          onClearIconPress={() => handleSearchChange('')}
        />
      </View>

      {searchQuery.trim() !== '' && (
        <View style={styles.searchResultsContainer}>
          {filteredItems.length > 0 ? (
            <FlashList
              data={filteredItems}
              renderItem={({ item, index }) => renderSearchItem(item, index)}
              estimatedItemSize={50}
              contentContainerStyle={styles.searchResultsList}
              ItemSeparatorComponent={Divider}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{strings.NO_PRODUCTS_FOUND}</Text>
            </View>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: colors.darkerGrey,
    color: colors.white,
    padding: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  searchResultsContainer: {
    flex: 1,
  },
  searchResultsList: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
  },
});

export default SearchComponent;
