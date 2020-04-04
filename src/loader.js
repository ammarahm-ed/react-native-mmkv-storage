import { NativeModules } from "react-native";
import { stringToHex } from "./helpers";
import generatePassword from "./keygen";
import API from "./api";
import MMKVStorage from "react-native-mmkv-storage";

export default class Loader {
  constructor() {
    this.instanceID = "default";
    this.initWithEncryption = false;
    this.secureKeyStorage = false;
    this.accessibleModeForSecureKey = null;
    this.processingMode = MMKVStorage.MODES.SINGLE_PROCESS
    this.aliasPrefix = "com.MMKV.";
    this.alias = null;
    this.key = null;
    this.MMKV = NativeModules.MMKVStorage;
    this.initialized = false;
    this.error = null;

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

    if (this.initWithEncryption) {
    
      if (this.secureKeyStorage) {
        this.MMKV.secureKeyExists(this.alias, (error,exists) => {
       
          if (error) {
            this.error = error;
            return this;
          }

          if (exists) {
            this.MMKV.getSecureKey(this.alias, (error,value )=> {
           
              if (error) {
                this.error = error;
                return this;
              }
              if (value) {
                
                  this.MMKV.setupWithEncryption(
                    this.instanceID,
                    this.processingMode,
                    value,
                    this.alias,
                    (error, result) => {
                      if (error) {
                        this.error = error;
                        return this;
                      }
                   
                    }
                  );
               
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
                if (error) {
                  this.error = error;
                 
                }
              
                  this.MMKV.setupWithEncryption(
                    this.instanceID,
                    this.processingMode,
                    this.key,
                    this.alias,
                    (error,result) =>{
                      if (error) {
                        this.error = error;
                        return this;
                      }
                    
                    }
                  );
              }
            );
          }
        });
      } else {
        if (this.key == null || this.key.length < 3)
          throw new Error("Key is null or too short");
         
            this.MMKV.setupWithEncryption(this.instanceID,this.processingMode, this.key,this.alias, (error,result) =>{
              if (error) {
                this.error = error;
                return this;
              }
              
            });
         
      }
    } else {
    
        this.MMKV.setup(
          this.instanceID,
          this.processingMode,
          (error,result) => {
            if (error) {
              this.error = error;
              return this;
            }
         
          }
        );
    
    }
    return this;
  }

  generateKey() {
    this.key = generatePassword();

    return this;
  }



  getInstance() {
    if (this.error) {
      throw new Error(this.error);
  }
  let options = {id:this.instanceID, mmkv:this.MMKV, alias:this.alias, aliasPrefix:this.aliasPrefix,key:this.key}

    let instance = new API(options);
    
    return instance;
  }
}
