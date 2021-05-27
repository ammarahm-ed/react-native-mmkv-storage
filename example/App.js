import React, {useCallback} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MMKVStorage, {create} from 'react-native-mmkv-storage';

const Button = ({title, onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={{color: 'white'}}>{title}</Text>
    </TouchableOpacity>
  );
};

const storage = new MMKVStorage.Loader().withEncryption().initialize();
const useStorage = create(storage);

const App = () => {
  const [user, setUser] = useStorage('user');
  const [age, setAge] = useStorage('age');

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
        setAge(age => {
          console.log(age);
          return age + 1;
        });
      },
    },
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            I am {user || 'andrew'} and I am {age || 24} years old.
          </Text>
        </View>

        {buttons.map(item => (
          <Button key={item.title} title={item.title} onPress={item.onPress} />
        ))}
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
    width: '95%',
    height: 50,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  headerText: {fontSize: 40, textAlign: 'center'},
});
