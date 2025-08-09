/**
 * Sample React Native App with MMKV Storage
 * Updated for React Native 0.79.5 template style
 */

import React, { useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { MMKVLoader, create } from 'react-native-mmkv-storage';

const storage = new MMKVLoader().withEncryption().initialize();
const storage2 = new MMKVLoader().withInstanceID('storage2').initialize();

const useStorage = create(storage);
const useStorage2 = create(storage2);

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? Colors.white : Colors.black }]}>
        {title}
      </Text>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [user, setUser] = useStorage('user', 'robert');
  const [age, setAge] = useStorage2('age', 24);
  const [test, setTest] = useStorage2('test', false);

  const getUser = useCallback(() => {
    let users = ['andrew', 'robert', 'jack', 'alison'];
    let _user =
      users[users.indexOf(user) === users.length - 1 ? 0 : users.indexOf(user) + 1];
    return _user;
  }, [user]);

  const buttons = [
    { title: 'setString', onPress: () => storage.setString('user', getUser()) },
    {
      title: 'setMulti',
      onPress: () => {
        const user = getUser();
        console.log('setting user to', user);
        storage.setMultipleItemsAsync([['user', user]], 'string');
      },
    },
    {
      title: 'getMulti',
      onPress: async () => {
        console.log(await storage.getMultipleItemsAsync(['user'], 'string'));
      },
    },
    { title: 'setUser', onPress: () => setUser(getUser()) },
    { title: 'setAge', onPress: () => setAge((age: number) => age + 1) },
    { title: 'clearAll', onPress: () => storage.clearStore() },
    {
      title: 'removeByKeys',
      onPress: async () => {
        const keys = await storage.indexer.getKeys();
        console.log(keys);
        for (const key of keys) {
          storage.removeItem(key);
        }
        storage.clearStore();
        console.log(await storage.indexer.getKeys());
      },
    },
  ];

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
        >
          <Section title="MMKV Storage Example">
            <Text style={styles.headerText}>
              I am {user} and I am {age} years old.
            </Text>
            {buttons.map((item) => (
              <Button key={item.title} title={item.title} onPress={item.onPress} />
            ))}
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

const Button = ({ title, onPress }: { title: string; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={{ color: 'white', fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 100,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '700',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
    marginBottom: 20,
  },
});

export default App;
