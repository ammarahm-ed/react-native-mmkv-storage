import React, { useCallback } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import MMKVStorage, { useMMKVStorage } from 'react-native-mmkv-storage';

const storage = new MMKVStorage.Loader().withEncryption().initialize();
const useStorage = key => {
  const [value, setValue] = useMMKVStorage(key, storage);
  return [value, setValue];
};
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

  const getAge = useCallback(() => {
    let ages = [24, 27, 32, 36];
    let _age =
      ages[ages.indexOf(age) === ages.length - 1 ? 0 : ages.indexOf(age) + 1];
    return _age;
  }, [age]);
  

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          backgroundColor: 'white',
        }}>
        <View
          style={{
            width: '100%',
            backgroundColor: '#f7f7f7',
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical:50
          }}>
          <Text style={{fontSize: 40,textAlign:'center'}}>
            I am {user || 'andrew'} and I am {age || 24} years old.
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: '95%',
            height: 50,
            marginBottom: 10,
            backgroundColor: 'green',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
          }}
          onPress={async () => {
            storage.setString('user', getUser());
          }}>
          <Text style={{color: 'white'}}>setString</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '95%',
            height: 50,
            backgroundColor: 'orange',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            marginBottom: 10,
          }}
          onPress={async () => {
            setUser(getUser());
          }}>
          <Text style={{color: 'black'}}>setUser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: '95%',
            height: 50,
            backgroundColor: 'blue',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
          }}
          onPress={async () => {
            setAge(getAge());
          }}>
          <Text style={{color: 'white'}}>setAge</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default App;
