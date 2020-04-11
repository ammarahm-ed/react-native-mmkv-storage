import { NativeModules } from "react-native";
import generatePassword from "./keygen";
import API from "./api";
import { stringToHex, ACCESSIBLE, MODES } from "./utils";

export default class Loader {
  constructor() {
    this.instanceID = "default";
    this.initWithEncryption = false;
    this.secureKeyStorage = false;
    this.accessibleMode = ACCESSIBLE.WHEN_UNLOCKED
    this.processingMode = MODES.SINGLE_PROCESS
    this.aliasPrefix = "com.MMKV.";
    this.alias = null;
    this.key = null;
    this.MMKV = NativeModules.MMKVStorage;
    this.initialized = false;
    this.error = null;
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

  setAccessibleIOS(accessible) {
    this.accessibleMode = accessible;
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

  async initialize() {
    return new Promise((resolve, reject) => {

      if (this.initWithEncryption) {

        if (this.secureKeyStorage) {
          this.MMKV.secureKeyExists(this.alias, (error, exists) => {

            if (error) {
              reject(error);
            }

            if (exists) {
              this.MMKV.getSecureKey(this.alias, (error, value) => {

                if (error) {
                  reject(error)
                  return;
                }
                if (value) {

                  this.MMKV.setupWithEncryption(
                    this.instanceID,
                    this.processingMode,
                    value,
                    this.alias,
                    (error, result) => {
                      if (error) {
                        reject(error);
                        return;
                      }
                      resolve(this.getInstance());

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
                { accessible: this.accessibleMode },
                (error, result) => {
                  if (error) {
                    reject(error);

                  }

                  this.MMKV.setupWithEncryption(
                    this.instanceID,
                    this.processingMode,
                    this.key,
                    this.alias,
                    (error, result) => {
                      if (error) {
                        reject(error);
                        return;
                      }
                      resolve(this.getInstance());

                    }
                  );
                }
              );
            }
          });
        } else {
          if (this.key == null || this.key.length < 3)
            throw new Error("Key is null or too short");

          this.MMKV.setupWithEncryption(this.instanceID, this.processingMode, this.key, this.alias, (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(this.getInstance());

          });
        }
      } else {
        this.MMKV.setup(
          this.instanceID,
          this.processingMode,
          (error, result) => {
            if (error) {
              reject(error);
            }
            resolve(this.getInstance());
          }
        );

      }

    })
  }

  generateKey() {
    this.key = generatePassword();

    return this;
  }

  getInstance() {

    if (this.error) {
      throw new Error(this.error);
    }
    let options = { id: this.instanceID, mmkv: this.MMKV, alias: this.alias, aliasPrefix: this.aliasPrefix, key: this.key, accessibleMode: this.accessibleMode }

    let instance = new API(options);

    return instance;


  }
}
