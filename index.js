import { NativeModules } from "react-native";

const { RNFastStorage } = NativeModules;

if (RNFastStorage.setupLibrary) RNFastStorage.setupLibrary();

export default RNFastStorage;
