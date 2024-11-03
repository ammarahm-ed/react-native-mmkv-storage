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

const storage = new MMKVLoader().withEncryption().initialize();

const storage2 = new MMKVLoader().withInstanceID('storage2').initialize();

const useStorage = create(storage);
const useStorage2 = create(storage2);

const App = () => {
  const [user, setUser] = useStorage('user', 'robert');
  const [age, setAge] = useStorage2('age', 24);

  const getUser = useCallback(() => {
    let users = ['andrew', 'robert', 'jack', 'alison'];
    let _user = users[users.indexOf(user) === users.length - 1 ? 0 : users.indexOf(user) + 1];
    return _user;
  }, [user]);

  const buttons = [
    {
      title: 'setString',
      onPress: () => {
        storage.setString('user', getUser());
      }
    },
    {
      title: 'setMulti',
      onPress: () => {
        const user = getUser();
        console.log('setting user to', user);
        storage.setMultipleItemsAsync([['user', user]], 'string');
      }
    },
    {
      title: 'getMulti',
      onPress: async () => {
        console.log(await storage.getMultipleItemsAsync(['user'], 'string'));
      }
    },
    {
      title: 'setUser',
      onPress: () => {
        setUser(getUser());
      }
    },
    {
      title: 'setAge',
      onPress: () => {
        setAge((age: number) => {
          return age + 1;
        });
      }
    },
    {
      title: 'clearAll',
      onPress: () => {
        storage.clearStore();
      }
    },
    {
      title: 'removeByKeys',
      onPress: async () => {
        const keys = await storage.indexer.getKeys();
        console.log(keys);
        storage.removeItems(keys);
        storage.clearStore();
        console.log(await storage.indexer.getKeys());
      }
    }
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            I am {user} and I am {age} years old.
          </Text>
        </View>
        <ScrollView
          style={{
            width: '100%',
            paddingHorizontal: 12
          }}
        >
          {buttons.map(item => (
            <Button key={item.title} title={item.title} onPress={item.onPress} />
          ))}
        </ScrollView>
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
