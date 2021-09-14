export default class transactions {
  constructor() {
    this.beforewrite = {};
    this.onwrite = {};
    this.onread = {};
    this.ondelete = null;
  }

  register(type, transaction, mutator) {
    if (!transaction || !type || !mutator)
      throw new Error("All parameters are required");
    
      if (transaction === "ondelete") {
        this[transaction] = mutator;
      } else {
        this[transaction][type] = mutator;
      }

    return () => this.unregister(type, transaction);
  }
  unregister(type, transaction) {
    if (!key || !transaction) throw new Error("All parameters are required");
    if (transaction === "ondelete") {
      this.ondelete = null;
      return;
    }
    this[transaction][type] = null;
  }

  clear() {
    this.beforewrite = {};
    this.onread = {};
    this.onwrite = {};
    this.ondelete = null;
  }
}
