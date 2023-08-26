import React, {useCallback} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// @ts-expect-error
import MMKVStorage, {create} from 'react-native-mmkv-storage';

const Button = ({title, onPress}: {title: string; onPress: () => void}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={{color: 'white'}}>{title}</Text>
    </TouchableOpacity>
  );
};

const storage = new MMKVStorage.Loader().withEncryption().initialize();
const useStorage = create(storage);

const App = () => {
  const [user, setUser] = useStorage('user', 'robert');
  const [age, setAge] = useStorage('age', 24);

  const getUser = useCallback(() => {
    let users = ['andrew', 'robert', 'jack', 'alison'];
    let _user =
      users[
        users.indexOf(user) === users.length - 1 ? 0 : users.indexOf(user) + 1
      ];
    return _user;
  }, [user]);

  const buttons = [
    {
      title: 'setString',
      onPress: () => {
        storage.setString('user', getUser());
      },
    },
    {
      title: 'setUser',
      onPress: () => {
        setUser(getUser());
      },
    },
    {
      title: 'setAge',
      onPress: () => {
        setAge((age: number) => {
          return age + 1;
        });
      },
    },
    {
      title: 'clearAll',
      onPress: () => {
        storage.clearStore();
      },
    },
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
            paddingHorizontal: 12,
          }}>
          {buttons.map(item => (
            <Button
              key={item.title}
              title={item.title}
              onPress={item.onPress}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  headerText: {fontSize: 40, textAlign: 'center', color: 'black'},
});
