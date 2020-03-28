import { NativeModules } from "react-native";
import { stringToHex } from "./helpers";
import generatePassword from "./keygen";
import API, { modes } from "./api";

export default class loader {
  constructor() {
    this.instanceID = "default";
    this.initWithEncryption = false;
    this.secureKeyStorage = true;
    this.accessibleModeForSecureKey = null;
    this.processingMode = modes.SINGLE_PROCESS_MODE;
    this.aliasPrefix = "com.ammarahmed.MMKV.";
    this.alias = null;
    this.key = null;
    this.MMKV = NativeModules.RNFastStorage;
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
    this.key = this.generateKey();
    this.alias = this.defaultAlias;
    this.secureKeyStorage = true;
    return this;
  }

  encryptWithCustomKey(key, secureKeyStorage, alias) {
    this.key = key;
    if (secureKeyStorage) {
      this.secureKeyStorage = true;
      if (alias) {
        this.alias = stringToHex(this.aliasPrefix + alias);
      } else {
        this.alias = stringToHex(this.aliasPrefix + this.instanceID);
      }
    }
    this.secureKeyStorage = false;

    return this;
  }

  setProcessingMode(mode) {
    this.processingMode = mode;

    return this;
  }

  initialize() {
    if (this.initWithEncryption) {
      if (this.secureKeyStorage) {
        this.MMKV.secureKeyExists(this.alias, exists => {
          if (exists) {
            this.MMKV.getSecureKey(value => {
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
              { accessible: ACCESSIBLE.WHEN_UNLOCKED },
              result => {
                if (result !== true)
                  throw new Error("Unable to store key in secure storage");
                if (this.instanceID === "default") {
                  this.MMKV.setupDefaultLibraryWithEncryption(
                    this.processingMode,
                    this.key
                  );
                } else {
                  this.MMKV.setupLibraryWithInstanceIDAndEncryption(
                    this.instanceID,
                    this.processingMode,
                    this.key
                  );
                }
              }
            );
          }
        });
      } else {
        if (this.key == null || this.key.length < 3)
          throw new Error("Key is null or too short");
        this.MMKV.setupDefaultLibraryWithEncryption(
          this.processingMode,
          this.key
        );
      }
    } else {
      if (this.instanceID === "default") {
        this.MMKV.setupDefaultLibrary(this.processingMode, "");
      } else {
        this.MMKV.setupLibraryWithInstanceID(
          this.instanceID,
          this.processingMode
        );
      }
    }
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
    let instance = new API(this.instanceID, this.MMKV);

    return instance;
  }
}
