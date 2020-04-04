

export default class indexer {e
  constructor({id = "default", mmkv,alias,aliasPrefix,key }) {

    this.MMKV = mmkv;
    this.instanceID = id;
  }
  /**
    * get all keys in storage.
    *
    */
 
   async getKeys() {
     return await this.MMKV.getKeysAsync(this.instanceID);
   }
 
   
 
   /**
    * Check if a key exists in storage.
    *
    * @param {String} key
    */
 
   async hasKey(key) {
     return await this.MMKV.hasKeyAsync(this.instanceID, key);
   }
 
 
   
 
 
 }