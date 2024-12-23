import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';
import { Divider } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../core/theme';
import { HeaderBar } from '../components/helpers/HeaderBar';
import { CatalogItemDisabled } from '../components/itemComponents/CatalogItemDisabled';
import * as Requests from '../helpers/requests';
import { getStorage, setStorage } from '../storage/store';
import { EventEmitter, ORDERS_UPDATED } from '../helpers/Sockets/EventEmitter';
import { processTables } from '../helpers/storage/tablesStorage';
import { useStrings } from '../core/localization/languageContext';
import { CatalogItemViewOnly } from '../components/itemComponents/CatalogItemViewOnly';
import dayjs from '../core/dayjs';
import { TableIcon } from '../components/basic/Icons';
import { LoadingOverlay } from '../components/basic/SavingOverlay';
import { OrderInfoBar } from '../components/helpers/OrderInfoBar';
import { LinearGradientFadeOut } from '../components/basic/LinearGradientFadeOut';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExpoScreenProps {
  currentIndex?: number;
}

const ExpoScreen: React.FC<ExpoScreenProps> = ({ currentIndex: initialIndex = 0 }) => {
  const [activeTables, setActiveTables] = useState<Table[]>(undefined);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);

  const isButtonScrollRef = useRef(false);
  const strings = useStrings();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialTables();
    setRefreshing(false);
  };

  const updateActiveTables = async (allTables: Table[]) => {
    setActiveTables(
      allTables
        ?.filter((table) => table.occupiedByOrder && !table.occupiedByOrder.orderReady)
        ?.reverse()
    );
  };

  const fetchInitialTables = async (): Promise<void> => {
    try {
      const allTablesIO: TableIO[] = await Requests.getRequest('/tables');
      if (!allTablesIO) {
        return;
      }
      const allTables = await processTables(allTablesIO);
      await setStorage('tableOrders', allTables);

      handleTableUpdates();
    } catch (error) {
      console.error('Error fetching initial table data:', error);
    }
  };

  const handleTableUpdates = async (): Promise<void> => {
    console.log('expo screen ORDERS_UPDATED');
    const updatedTables = await getStorage('tableOrders');
    updateActiveTables(updatedTables);
  };

  useEffect(() => {
    if (isFocused) {
      fetchInitialTables();
    }
  }, [isFocused]);

  useEffect(() => {
    const subscription = EventEmitter.addListener(ORDERS_UPDATED, handleTableUpdates);

    return () => subscription.remove();
  }, []);

  const renderOrderItem = ({ item }: { item: ItemReq }) => {
    return (
      <View
        style={[styles.itemContainer, item.markForDelete && { backgroundColor: colors.lightRed }]}
      >
        <CatalogItemViewOnly item={item} />
      </View>
    );
  };
  const handleMarkAsDone = async (item: Table) => {
    try {
      setIsLoading(true);
      await Requests.patchRequest(`/orders/ready/${item.occupiedByOrder.id}`);
    } catch (error) {
      console.error('Error marking order as done:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTable = ({ item, index }: { item: Table; index: number }) => {
    const orderItems = item.occupiedByOrder?.orderItems || [];

    return (
      <View style={styles.slideContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.tableInfoContainer}>
              <View style={styles.tableNameContainer}>
                <TableIcon size={24} />
                <Text style={styles.tableName} numberOfLines={2}>
                  {item.tableName}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <TouchableOpacity
                style={[
                  styles.doneButton,
                  item.occupiedByOrder?.orderReady && styles.doneButtonDisabled,
                ]}
                onPress={() => handleMarkAsDone(item)}
                disabled={item.occupiedByOrder?.orderReady}
              >
                <Text style={styles.doneButtonText}>{strings.MARK_DONE_BTN}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressViewOffset={20}
              />
            }
          >
            <OrderInfoBar
              order={item.occupiedByOrder}
              containerStyle={{ paddingVertical: 3 }}
              hideTableName={true}
            ></OrderInfoBar>
          </ScrollView>
        </View>

        <View style={styles.listContainer}>
          {orderItems.length > 0 ? (
            <>
              <FlashList
                data={orderItems}
                renderItem={renderOrderItem}
                estimatedItemSize={20}
                keyExtractor={(item) => item.newItemId || item.id?.toString()}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={Divider}
              />
              <LinearGradientFadeOut />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items in this order</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const onPaginationPress = useCallback((index: number) => {
    isButtonScrollRef.current = true;
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
    setActiveIndex(index);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems[0] && !isButtonScrollRef.current) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(index);
    isButtonScrollRef.current = false;
  }, []);

  const paginationListRef = useRef<FlatList>(null);

  // Add this function to calculate the scroll position
  const scrollPaginationToCenter = useCallback(() => {
    const itemWidth = 38;
    const itemOffset = itemWidth * activeIndex;
    const centeredOffset = itemOffset;

    paginationListRef.current?.scrollToOffset({
      offset: Math.max(0, centeredOffset),
      animated: true,
    });
  }, [activeIndex]);

  useEffect(() => {
    scrollPaginationToCenter();
  }, [activeIndex, scrollPaginationToCenter]);

  const ListEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{strings.NO_ACTIVE_EXPO_TABLES}</Text>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar headerTitle={strings.EXPO} />
      <View style={styles.container}>
        {activeTables !== undefined ? (
          <>
            <FlatList
              ref={flatListRef}
              data={activeTables}
              renderItem={renderTable}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              onMomentumScrollEnd={onMomentumScrollEnd}
              ListEmptyComponent={ListEmptyComponent}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50,
                minimumViewTime: 100,
              }}
              getItemLayout={(data, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
            />

            <View style={styles.paginationWrapper}>
              <FlatList
                ref={paginationListRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                data={activeTables}
                contentContainerStyle={[
                  styles.paginationContainer,
                  { paddingHorizontal: SCREEN_WIDTH / 2 - 15 },
                ]}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ index }) => (
                  <TouchableOpacity
                    onPress={() => onPaginationPress(index)}
                    style={[
                      styles.paginationNumber,
                      index === activeIndex && styles.paginationNumberActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paginationNumberText,
                        index === activeIndex && styles.paginationNumberTextActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                )}
                getItemLayout={(_, index) => ({
                  length: 38, // width + marginHorizontal
                  offset: index,
                  index,
                })}
              />
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" animating={true} color={colors.primary} />
        )}
      </View>
      {isLoading && <LoadingOverlay />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingVertical: 10,
  },
  orderCount: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemContainer: {
    marginVertical: 10,
    paddingVertical: 5,
  },
  emptyContainer: {
    height: '100%',
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    color: 'white',
    fontSize: 16,
  },
  paginationWrapper: {
    paddingVertical: 15,
  },
  paginationContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  paginationNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationNumberActive: {
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  paginationNumberText: {
    color: 'white',
    fontSize: 14,
  },
  paginationNumberTextActive: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
    backgroundColor: colors.slightlyDarkerGrey,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBlockColor: colors.lightGrey,
  },

  table: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  orderTime: {
    fontSize: 16,
    color: colors.white,
  },

  doneButtonDisabled: {
    backgroundColor: colors.success,
    opacity: 0.8,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },

  tableInfoContainer: {
    flex: 1,
    marginRight: 10,
  },

  tableNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  tableName: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 8,
    flexWrap: 'wrap',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  infoText: {
    fontSize: 16,
    color: colors.white,
  },

  divider: {
    paddingHorizontal: 8,
  },

  dividerText: {
    color: colors.white,
    fontSize: 16,
  },

  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
});

export default ExpoScreen;
