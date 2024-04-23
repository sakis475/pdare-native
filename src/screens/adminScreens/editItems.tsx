import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { CatalogItem } from '../../components/CatalogItem';

import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import * as Requests from '../../helpers/requests';

const EditItemScreen = ({ route }: any) => {
  // const { tableName } = route?.params;
  const [items, setItems]: any = useState([]);

  const navigation = useNavigation();

  const fetchItems = async () => {
    const fetchItems = await Requests.getRequest('/items');
    setItems(fetchItems);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={{ marginBottom: 4 }}>
      <CatalogItem item={item} type={'Manage'} />
      <Divider style={{ marginTop: 4 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2F2F2F',
  },
});

export default EditItemScreen;
