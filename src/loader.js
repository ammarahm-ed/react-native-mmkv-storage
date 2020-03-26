import { NativeModules } from "react-native";

const RNFastStorage = NativeModules.RNFastStorage;


export class loader {
  constructor() {
      this.instanceID = null;
      this.initWithEncryption = false;
      this.secureKeyStorage = false;
      this.accessibleModeForSecureKey = null;
      this.mmkvDirPath = '';
      this.initWithCustomDirPath = false;
      this.processingMode = '';
      this.defaultAlias = 'com.ammarahmed.MMKV';
      this.alias = null;
      this.key = null;
  }

default() {
  RNFastStorage.setupLibrary();
}

withInstanceID(id) {
  this.instanceID = id;

  return this;
}

withEncryption() {
  this.initWithEncryption = true;
  this.key = this.generateKey();
  this.alias = this.defaultAlias;
  this.secureKeyStorage = true;
  return this;
}

withCustomKey(key) {
  this.key = key;
  this.secureKeyStorage = false;
  return this;
}


withSecureKeyStorage(alias = this.defaultAlias) {
  this.secureKeyStorage = true;
  this.alias = stringToHex(alias);

  return this;
}

withCustomDirPath(path) {
  this.initWithCustomDirPath = true;
  this.mmkvDirPath = path;

  return this;
}

setProcessingMode(mode) {
  this.processingMode = mode;

  return this;
}

initialize() {
 console.log(this);
}

generateKey() {
  this.key = generatePassword();

  return this;
}

encrypt(key) {
 RNFastStorage.encrypt(key);
}

decrypt() {
  RNFastStorage.decrypt();
}

changeEncryptionKey(key) {
  RNFastStorage.encrypt(key);
}

}