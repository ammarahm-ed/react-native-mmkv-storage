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
var transactions = /** @class */ (function () {
    function transactions() {
        this.beforewrite = {};
        this.onwrite = {};
        this.onread = {};
        this.ondelete = null;
    }
    /**
     * Register a lifecycle function for a given data type.
     *
     * @param type Type of data to register a mutator function for
     * @param transaction Type of transaction to listen to
     * @param mutator The mutator function
     */
    transactions.prototype.register = function (type, transaction, mutator) {
        var _this = this;
        if (!transaction || !type || !mutator)
            throw new Error('All parameters are required');
        if (transaction === 'ondelete') {
            this.ondelete = mutator;
        }
        else {
            this[transaction][type] = mutator;
        }
        return function () { return _this.unregister(type, transaction); };
    };
    /**
     * Register a lifecycle function for a given data type.
     * @param type Type of data to register a mutator function for
     * @param transaction Type of transaction to listen to
     */
    transactions.prototype.unregister = function (type, transaction) {
        if (!type || !transaction)
            throw new Error('All parameters are required');
        if (transaction === 'ondelete') {
            this.ondelete = null;
            return;
        }
        this[transaction][type] = null;
    };
    /**
     * Clear all registered functions.
     */
    transactions.prototype.clear = function () {
        this.beforewrite = {};
        this.onread = {};
        this.onwrite = {};
        this.ondelete = null;
    };
    transactions.prototype.transact = function (type, transaction, key, value) {
        var mutator = transaction === 'ondelete' ? this.ondelete : this[transaction][type];
        if (!mutator)
            return value;
        var _value = mutator(key, value);
        // In case a mutator function does not return a value or returns undefined, we will return the original value.
        return _value === undefined || _value === null ? value : _value;
    };
    return transactions;
}());
export default transactions;
