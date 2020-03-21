

 
declare function MMKV(): any;

export default MMKV;

declare module MMKV {
  /**
 * Set a string value to storag for a given key.
 *
 * @param {String} key
 * @param {String} value
 *
 */
 function setString(key:string,value:string): Promise<boolean>;
  /**
 * Get a string value for a given key.
 * @param {String} key
 */
 function getString(key:string): Promise<string>;


 /**
 * Set a number value to storage for a given key.
 *
 * @param {String} key
 * @param {number} value
 *
 */
export async function setInt(key:string,value:number):Promise<boolean>;

/**
 * Get a number value for a given key
 * @param {String} key
 */
export async function getInt(key:string):Promise<number>;

/**
 * Set a boolean value to storag for a given key.
 *
 * @param {String} key
 * @param {boolean} value
 *
 */
export async function setBool(key:string, value:boolean):Promise<boolean>;

/**
 * Get a boolean value for a given key.
 * @param {String} key
 */
export async function getBool(key:string):Promise<boolean>;


/**
 * Set an Object to storage for a given key.
 *
 * @param {String} key
 * @param {Object} value
 *
 */

 function setMap(key:string,value:object): Promise<boolean>;
/**
 * Get an Object from storage for a given key.
 * @param {String} key
 */
 function getMap(key:string):Promise<object>;
/**
 * Set an array to the db.
 * @param {String} key
 * @param {Array} array
 */
 function setArray(key:string,value:Array<*>): Promise<boolean>;
/**
 * get an array from the storage for give key.
 * @param {String} key
 */

 function getArray(key:string):Promise<Array<*>>;
/**
 * Retrieve multiple Objects for a given array of keys. Currently will work only if data for all keys is an Object.
 * Arrays will also be returned but wrappen in a object.
 *
 * **Will not work if a key as a String value.**
 *
 * @param {Array} keys
 */
 function getMultipleItems(keys:Array<string>):Promise<Array<object>>;
/**
 * Check if a key exists in storage.
 *
 * @param {String} key
 */
 function hasKey(key:string):Promise<boolean>;
/**
 * Clear the storage.
 *
 */
 function clearStore():Promise;
/**
 * Remove an item from storage for a given key.
 *
 * @param {String} key
 */
 function removeItem(key:string):Promise;

}

