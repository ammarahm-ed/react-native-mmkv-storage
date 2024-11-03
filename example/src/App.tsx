import React, { useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { MMKVLoader, create } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withInstanceID("ABC").initialize();
console.log(storage.indexer.strings.hasKey('abc'));

// const storage2 = new MMKVLoader().withInstanceID('storage2').initialize();

// const useStorage = create(storage);
// const useStorage2 = create(storage2);

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
      </SafeAreaView>
    </>
  );
};

const Button = ({ title, onPress }: { title: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={{ color: 'white' }}>{title}</Text>
    </TouchableOpacity>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10
  },
  headerText: { fontSize: 40, textAlign: 'center', color: 'black' }
});
