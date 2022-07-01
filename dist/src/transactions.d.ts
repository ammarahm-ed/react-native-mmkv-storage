import { DataType } from './types';
/**
 * A mutator function can return a value where needed. For example,
 * you can modify the value in `beforewrite` or `onread` transactions.
 */
export declare type MutatorFunction = (key: string, value?: unknown) => any;
export declare type Transaction = {
    [name: string]: MutatorFunction | null;
};
export declare type TransactionType = 'beforewrite' | 'onwrite' | 'onread' | 'ondelete';
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
 * MMKV.transcations.register("object", "onwrite", ({ key, value }) => {
 *    console.log(MMKV.instanceID, "object:onwrite: ", key, value)
 * });
 * ```
 *
 * Documentation: https://rnmmkv.vercel.app/#/transactionmanager
 */
export default class transactions {
    beforewrite: Transaction;
    onwrite: Transaction;
    onread: Transaction;
    ondelete: MutatorFunction | null;
    constructor();
    /**
     * Register a lifecycle function for a given data type.
     *
     * @param type Type of data to register a mutator function for
     * @param transaction Type of transaction to listen to
     * @param mutator The mutator function
     */
    register(type: DataType, transaction: TransactionType, mutator: MutatorFunction): () => void;
    /**
     * Register a lifecycle function for a given data type.
     * @param type Type of data to register a mutator function for
     * @param transaction Type of transaction to listen to
     */
    unregister(type: DataType, transaction: TransactionType): void;
    /**
     * Clear all registered functions.
     */
    clear(): void;
    transact<T>(type: DataType, transaction: TransactionType, key: string, value?: T): T | undefined;
}
//# sourceMappingURL=transactions.d.ts.map