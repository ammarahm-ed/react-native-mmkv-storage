class EventManager {
  _registry: { [name: string]: Function[] };
  constructor() {
    this._registry = {};
  }

  unsubscribeAll() {
    this._registry = {};
  }

  subscribeMulti(names: string[], handler: Function) {
    names.forEach(name => {
      this.subscribe(name, handler);
    });
  }

  subscribe(name: string, handler: Function) {
    if (!name || !handler) throw new Error('name and handler are required.');
    if (!this._registry[name]) this._registry[name] = [];
    this._registry[name].push(handler);
  }

  unsubscribe(name: string, handler: Function) {
    if (!this._registry[name]) return;
    const index = this._registry[name].indexOf(handler);
    if (index <= -1) return;
    this._registry[name].splice(index, 1);
  }

  publish(name: string, ...args: any[]) {
    if (!this._registry[name]) return;
    const handlers = this._registry[name];
    handlers.forEach(handler => {
      handler(...args);
    });
  }

  async publishWithResult(name: string, ...args: any[]) {
    if (!this._registry[name]) return true;
    const handlers = this._registry[name];
    if (handlers.length <= 0) return true;
    return await Promise.all(handlers.map(handler => handler(...args)));
  }
}

export default EventManager;
