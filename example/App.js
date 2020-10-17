import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  StatusBar,
} from 'react-native';

import MMKV from 'react-native-mmkv-storage';

const MMKVStorage = new MMKV.Loader().initialize();

const App = () => {
  const [stringValue, setStringValue] = useState('');
  const [arrayValue, setArrayValue] = useState([]);
  const [mapValue, setMapValue] = useState({});

  useEffect(() => {
    MMKVStorage.getMapAsync('map')
      .then((value) => {
        setMapValue(value);
      })
      .catch(() => ({}))
      .finally(() => {
        MMKVStorage.removeItem('map');
        MMKVStorage.setMapAsync('map', {
          name: 'AAA',
          date: Date.now(),
        });
      });
    MMKVStorage.getStringAsync('random-string')
      .then((value) => {
        setStringValue(value);
      })
      .catch(() => '')
      .finally(() => {
        MMKVStorage.setStringAsync(
          'random-string',
          Math.random().toString(36).substring(7),
        );
      });
    MMKVStorage.getArrayAsync('array')
      .then((value) => {
        setArrayValue(value);
      })
      .catch(() => [])
      .finally(() => {
        MMKVStorage.setArrayAsync('array', new Array(16).fill());
      });
    MMKVStorage.indexer.hasKey('map').then(console.log);
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Text>Previos value: {stringValue}</Text>
          <Text>
            Map value: {mapValue.name} {mapValue.date}
          </Text>
          <Text>Array Length: {arrayValue.length}</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: 32,
  },
});

export default App;
