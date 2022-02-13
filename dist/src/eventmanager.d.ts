declare class EventManager {
    _registry: {
        [name: string]: Function[];
    };
    constructor();
    unsubscribeAll(): void;
    subscribeMulti(names: string[], handler: Function): void;
    subscribe(name: string, handler: Function): void;
    unsubscribe(name: string, handler: Function): void;
    publish(name: string, ...args: any[]): void;
    publishWithResult(name: string, ...args: any[]): Promise<true | any[]>;
}
export default EventManager;
//# sourceMappingURL=eventmanager.d.ts.map