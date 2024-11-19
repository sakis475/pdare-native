import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView } from 'react-native';
import { Divider, Portal } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../core/theme';
import { ScreenNames, navigate } from '../navigation/AppNavigator';
import { AlertWithOptions } from '../core/utils';
import TableSelectBottomSheet from '../components/bottomSheets/TableSelectBottomSheet';
import {
  createNewOrder,
  getTempOrder,
  markActiveItemForDelete,
  setTableTempOrder,
  convertOccupiedOrderToOrder,
} from '../helpers/storage/orderStorage';
import { CatalogItemAdded } from '../components/itemComponents/CatalogItemAdded';
import { CatalogItemDisabled } from '../components/itemComponents/CatalogItemDisabled';
import { HeaderBar } from '../components/helpers/HeaderBar';
import * as Requests from '../helpers/requests';
import { EventId, socketManager } from '../helpers/Sockets/SocketManager';
import { getStorage } from '../storage/store';

interface ExpoScreenProps {
  currentIndex?: number;
}

const ExpoScreen: React.FC<ExpoScreenProps> = ({ currentIndex }) => {
  const [table, setTable] = useState<Table>();
  const [items, setItems] = useState<ItemReq[]>();
  const isFocused = useIsFocused();

  // Process tables function
  const processTables = async (tablesIO: TableIO[]): Promise<Table[]> => {
    const items: ItemReq[] = await getStorage('items');

    return tablesIO.reduce((acc: Table[], table: TableIO) => {
      if (table.occupiedByOrder) {
        const occupiedByOrder = convertOccupiedOrderToOrder(table, items);
        acc.push({
          id: table.id,
          tableName: table.tableName,
          isEnabled: table.isEnabled,
          tableOrder: table.tableOrder,
          occupiedByOrder: occupiedByOrder,
        });
      }
      return acc;
    }, []);
  };

  // Handle socket updates
  const handleTableUpdates = async (updatedTablesIO: TableIO[]): Promise<void> => {
    const updatedTables = await processTables(updatedTablesIO);
    // Update current table if it exists in updates
    const currentTableUpdate = updatedTables.find((t) => t.id === table?.id);
    if (currentTableUpdate) {
      setTable(currentTableUpdate);
      setItems(currentTableUpdate.occupiedByOrder?.orderItems ?? []);
    }
  };

  const fetchItems = async () => {
    try {
      const tempOrder: Order = await getTempOrder();

      // Fetch latest table data from server
      if (tempOrder?.table?.id) {
        const allTablesIO: TableIO[] = await Requests.getRequest('/tables');
        if (allTablesIO) {
          const processedTables = await processTables(allTablesIO);
          const currentTable = processedTables.find((t) => t.id === tempOrder.table.id);
          if (currentTable) {
            setTable(currentTable);
            setItems(currentTable.occupiedByOrder?.orderItems ?? []);
            return;
          }
        }
      }

      // Fallback to temp order if server fetch fails
      setTable(tempOrder?.table);
      setItems(tempOrder?.orderItems ?? []);
    } catch (error) {
      console.error('Error fetching items:', error);
      // Fallback to temp order if there's an error
      const tempOrder: Order = await getTempOrder();
      setTable(tempOrder?.table);
      setItems(tempOrder?.orderItems ?? []);
    }
  };

  // Set up socket listener
  useEffect(() => {
    socketManager.on(EventId.tableOrdersUpdated, handleTableUpdates);
    return () => {
      socketManager.off(EventId.tableOrdersUpdated);
    };
  }, [table]); // Depend on table to ensure we have latest table reference in handleTableUpdates

  // Fetch items when screen is focused or route changes
  useEffect(() => {
    if (currentIndex && currentIndex !== 1) return;
    fetchItems();
  }, [isFocused, currentIndex]);

  const refreshTempList = async () => {
    await fetchItems();
  };

  const renderItems = (item: ItemReq) => {
    return (
      <View
        style={[styles.itemContainer, item.markForDelete && { backgroundColor: colors.lightRed }]}
      >
        {item.alreadySend ? (
          <CatalogItemDisabled
            item={item}
            refreshList={refreshTempList}
            onItemDelete={async (item: ItemReq) => {
              await markActiveItemForDelete(item);
              refreshTempList();
            }}
          />
        ) : (
          <CatalogItemAdded item={item} refreshList={refreshTempList} onItemPress={() => {}} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar headerTitle={'Πάσο'} />

      <View style={styles.container}>
        {items && items.length > 0 ? (
          <View style={styles.listContainer}>
            <FlashList
              data={items}
              keyExtractor={(item) => item.newItemId}
              renderItem={({ item }) => renderItems(item)}
              estimatedItemSize={50}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              ItemSeparatorComponent={Divider}
            />
          </View>
        ) : items?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Προϊόντα που θα προσθέσετε</Text>
            <Text style={styles.emptyText}>θα εμφανιστούν εδώ.</Text>
          </View>
        ) : (
          <ActivityIndicator size="large" animating={true} color={colors.primary} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  itemContainer: {
    marginVertical: 10,
    paddingVertical: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#ffffff',
  },
  tableButtonContainer: {
    alignItems: 'flex-end',
    paddingVertical: 2,
    backgroundColor: colors.darkerGrey,
  },
  tableButton: {
    marginRight: 20,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
    padding: 4,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ExpoScreen;
