class EventManager {
  _registry: { [name: string]: Function[] };
  _keyListeners: Map<string, number>;

  constructor() {
    this._registry = {};
    this._keyListeners = new Map();
  }

  unsubscribeAll() {
    this._registry = {};
    this._keyListeners.clear();
  }

  subscribeMulti(names: string[], handler: Function) {
    for (let i = 0; i < names.length; i++) {
      this.subscribe(names[i], handler);
    }
  }

  unsubscribeMulti(names: string[], handler: Function) {
    for (let i = 0; i < names.length; i++) {
      this.unsubscribe(names[i], handler);
    }
  }

  subscribe(name: string, handler: Function) {
    if (!name || !handler) throw new Error('name and handler are required.');

    const handlers = this._registry[name];
    this._registry[name] = handlers ? handlers.concat(handler) : [handler];

    const key = eventKey(name);
    if (key !== null) {
      this._keyListeners.set(key, (this._keyListeners.get(key) || 0) + 1);
    }
  }

  unsubscribe(name: string, handler: Function) {
    const handlers = this._registry[name];
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index === -1) return;

    const next = handlers.slice();
    next.splice(index, 1);

    if (next.length === 0) {
      delete this._registry[name];
    } else {
      this._registry[name] = next;
    }

    const key = eventKey(name);
    if (key !== null) {
      const count = (this._keyListeners.get(key) || 1) - 1;
      if (count <= 0) {
        this._keyListeners.delete(key);
      } else {
        this._keyListeners.set(key, count);
      }
    }
  }

  hasListenersForKey(key: string) {
    return this._keyListeners.has(key);
  }

  publishEvent(name: string, event: any) {
    const handlers = this._registry[name];
    if (!handlers) return;

    for (let i = 0; i < handlers.length; i++) {
      handlers[i](event);
    }
  }

  publish(name: string, ...args: any[]) {
    const handlers = this._registry[name];
    if (!handlers) return;

    for (let i = 0; i < handlers.length; i++) {
      handlers[i](...args);
    }
  }

  async publishWithResult(name: string, ...args: any[]) {
    const handlers = this._registry[name];
    if (!handlers) return true;
    if (handlers.length <= 0) return true;
    return await Promise.all(handlers.map(handler => handler(...args)));
  }
}

function eventKey(name: string) {
  const separator = name.lastIndexOf(':');
  if (separator <= 0) return null;
  return name.slice(0, separator);
}

export default EventManager;
