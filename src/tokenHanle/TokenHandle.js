import AsyncStorage from '@react-native-async-storage/async-storage';






export async function saveToken(value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('@storage_Key', jsonValue);
  } catch (e) {
    console.log(e);
  }
}

export async function getToken() {
  console.log("fffff");
  try {
    const value = await AsyncStorage.getItem('@storage_Key')
    console.log("ddddddd")
    return value != null ? JSON.parse(value) : null;
  } catch (e) {
    console.log(e);
  }
}

export async function removeToken() {
  await AsyncStorage.removeItem('@storage_Key');
  //window.localStorage.removeItem("Bearer");
}