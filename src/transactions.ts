import { DataType } from './types';

/**
 * A mutator function can return a value where needed. For example,
 * you can modify the value in `beforewrite` or `onread` transactions.
 */
export type MutatorFunction = (key: string, value?: unknown) => any;

export type Transaction = { [name: string]: MutatorFunction | null };

export type TransactionType = 'beforewrite' | 'onwrite' | 'onread' | 'ondelete';

/**
 * Listen to a value’s lifecycle and mutate it on the go.
 * Transactions lets you register lifecycle functions
 * with your storage instance such as `onwrite`,
 * `beforewrite`, `onread`, `ondelete`. This allows for a
 * better and more managed control over the storage and
 * also let’s you build custom indexes with a few lines of code.
 *
 * Example:
 * ```tsx
 * import MMKVStorage from "react-native-mmkv-storage";
 *
 * const MMKV = new MMKVStorage.Loader().initialize();
 *
 * MMKV.transactions.register("object", "onwrite", ({ key, value }) => {
 *    console.log(MMKV.instanceID, "object:onwrite: ", key, value)
 * });
 * ```
 *
 * Documentation: https://rnmmkv.vercel.app/#/transactionmanager
 */
export type ObserverFunction = (key: string, value?: unknown) => void;

export default class transactions {
  beforewrite: Transaction;
  onwrite: Transaction;
  onread: Transaction;
  ondelete: MutatorFunction | null;
  observers: { [transaction: string]: { [type: string]: ObserverFunction[] } };
  deleteObservers: ObserverFunction[];
  constructor() {
    this.beforewrite = {};
    this.onwrite = {};
    this.onread = {};
    this.ondelete = null;
    this.observers = { beforewrite: {}, onwrite: {}, onread: {} };
    this.deleteObservers = [];
  }

  subscribe(type: DataType, transaction: TransactionType, observer: ObserverFunction) {
    if (!transaction || !type || !observer) throw new Error('All parameters are required');

    const list =
      transaction === 'ondelete'
        ? this.deleteObservers
        : (this.observers[transaction][type] = this.observers[transaction][type] || []);

    list.push(observer);

    return () => {
      const index = list.indexOf(observer);
      if (index !== -1) list.splice(index, 1);
    };
  }

  hasDeleteListeners() {
    return this.ondelete !== null || this.deleteObservers.length > 0;
  }

  hasListeners(type: DataType, transaction: TransactionType) {
    if (transaction === 'ondelete') return this.hasDeleteListeners();

    const observers = this.observers[transaction][type];
    return Boolean(this[transaction][type]) || (observers !== undefined && observers.length > 0);
  }

  private notify(type: DataType, transaction: TransactionType, key: string, value?: unknown) {
    const list =
      transaction === 'ondelete' ? this.deleteObservers : this.observers[transaction][type];
    if (!list || list.length === 0) return;

    const snapshot = list.slice();
    for (let i = 0; i < snapshot.length; i++) {
      snapshot[i](key, value);
    }
  }

  /**
   * Register a lifecycle function for a given data type.
   *
   * @param type Type of data to register a mutator function for
   * @param transaction Type of transaction to listen to
   * @param mutator The mutator function
   */
  register(type: DataType, transaction: TransactionType, mutator: MutatorFunction) {
    if (!transaction || !type || !mutator) throw new Error('All parameters are required');

    if (transaction === 'ondelete') {
      this.ondelete = mutator;
    } else {
      this[transaction][type] = mutator;
    }

    return () => this.unregister(type, transaction);
  }

  /**
   * Register a lifecycle function for a given data type.
   * @param type Type of data to register a mutator function for
   * @param transaction Type of transaction to listen to
   */
  unregister(type: DataType, transaction: TransactionType) {
    if (!type || !transaction) throw new Error('All parameters are required');
    if (transaction === 'ondelete') {
      this.ondelete = null;
      return;
    }
    this[transaction][type] = null;
  }
  /**
   * Clear all registered functions.
   */
  clear() {
    this.beforewrite = {};
    this.onread = {};
    this.onwrite = {};
    this.ondelete = null;
  }

  transact<T>(type: DataType, transaction: TransactionType, key: string, value?: T): T | undefined {
    const mutator = transaction === 'ondelete' ? this.ondelete : this[transaction][type];

    if (!mutator) {
      this.notify(type, transaction, key, value);
      return value;
    }

    let _value = mutator(key, value);
    // In case a mutator function does not return a value or returns undefined, we will return the original value.
    const result = _value === undefined || _value === null ? value : _value;

    this.notify(type, transaction, key, result);

    return result;
  }
}
