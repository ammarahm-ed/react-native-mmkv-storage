import { NativeModules } from "react-native";
import { stringToHex } from "./helpers";
import generatePassword from "./keygen";
import API from "./api";
import MMKVStorage from "react-native-mmkv-storage";

export default class Loader {
  constructor() {
    this.instanceID = "default";
    this.initWithEncryption = false;
    this.secureKeyStorage = true;
    this.accessibleModeForSecureKey = null;
    this.processingMode = MMKVStorage.MODES.SINGLE_PROCESS
    this.aliasPrefix = "com.ammarahmed.MMKV.";
    this.alias = null;
    this.key = null;
    this.MMKV = NativeModules.MMKVStorage;
    this.initialized = false;
  }

  default() {
    this.instanceID = "default";
    this.secureKeyStorage = false;
    return this;
  }

  withInstanceID(id) {
    this.instanceID = id;

    return this;
  }

  withEncryption() {
    this.initWithEncryption = true;
    this.key = generatePassword();
    this.alias = stringToHex(this.aliasPrefix + this.instanceID);
    this.secureKeyStorage = true;
    return this;
  }

  encryptWithCustomKey(key, secureKeyStorage, alias) {
    this.key = key;
    this.secureKeyStorage = false;
    if (secureKeyStorage) {
      this.secureKeyStorage = true;
      if (alias) {
        this.alias = stringToHex(this.aliasPrefix + alias);
      } else {
        this.alias = stringToHex(this.aliasPrefix + this.instanceID);
      }
    }

    return this;
  }

  setProcessingMode(mode) {
    this.processingMode = mode;

    return this;
  }

  initialize() {

    console.log(this.alias,this.key);
    if (this.initWithEncryption) {
    
      if (this.secureKeyStorage) {
        this.MMKV.secureKeyExists(this.alias, (error,exists) => {
       
          if (error) return;
          if (exists) {
            this.MMKV.getSecureKey(this.alias, (error,value )=> {
              if (error) return;
              if (value) {
                if (this.instanceID === "default") {
                  this.MMKV.setupDefaultLibraryWithEncryption(
                    this.processingMode,
                    value
                  );
                } else {
                  this.MMKV.setupLibraryWithInstanceIDAndEncryption(
                    this.instanceID,
                    this.processingMode,
                    value
                  );
                }
              }
            });
          } else {
           
            if (this.key == null || this.key.length < 3)
              throw new Error("Key is null or too short");
           
            this.MMKV.setSecureKey(
              this.alias,
              this.key,
              { accessible: MMKVStorage.ACCESSIBLE.WHEN_UNLOCKED },
              (error,result) => {
                if (error) return;
                if (result !== true)
                  throw new Error("Unable to store key in secure storage");
                if (this.instanceID === "default") {
                  this.MMKV.setupDefaultLibraryWithEncryption(
                    this.processingMode,
                    this.key,
                    (error,result) =>{
                      console.log(error,result);
                    }
                  );
                } else {
                  this.MMKV.setupLibraryWithInstanceIDAndEncryption(
                    this.instanceID,
                    this.processingMode,
                    this.key,
                    (error,result) =>{
                      console.log(error,result);
                    }
                  );
                }
              }
            );
          }
        });
      } else {
        if (this.key == null || this.key.length < 3)
          throw new Error("Key is null or too short");
          if (this.instanceID === "default") {
            this.MMKV.setupDefaultLibraryWithEncryption(
              this.processingMode,
              this.key,
              (error,result) =>{
                console.log(error,result);
              }
            );
          } else {
            this.MMKV.setupLibraryWithInstanceIDAndEncryption(this.instanceID,this.processingMode,this.key, (error,result) =>{
              console.log(error,result);
            });
          }
      }
    } else {
      if (this.instanceID === "default") {
        this.MMKV.setupDefaultLibraryWithEncryption(this.processingMode, "", (error,results) =>{
          console.log(error,result);
        });
      } else {
        this.MMKV.setupLibraryWithInstanceID(
          this.instanceID,
          this.processingMode
        );
      }
    }
    return this;
  }

  generateKey() {
    this.key = generatePassword();

    return this;
  }

  async encrypt(key, secureKeyStorage, alias) {
    this.key = key;
    if (secureKeyStorage) {
      if (alias) {
        if (alias) {
          this.alias = stringToHex(this.aliasPrefix + alias);
        } else {
          this.alias = stringToHex(this.aliasPrefix + this.instanceID);
        }
      }
      this.MMKV.setSecureKey(
        this.alias,
        this.key,
        { accessible: ACCESSIBLE.WHEN_UNLOCKED },
        async (error, result) => {
          if (error) {
            return;
          } else {
            await this.MMKV.encrypt(key);
          }
        }
      );
    } else {
      await this.MMKV.encrypt(key);
    }
  }

  async decrypt() {
    await this.MMKV.decrypt();
  }

  async changeEncryptionKey(key) {
    await this.MMKV.encrypt(key);
  }

  getInstance() {
    let instance = new API({id:this.instanceID, mmkv:this.MMKV});

    return instance;
  }
}
