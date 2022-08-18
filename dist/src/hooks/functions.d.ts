import type { JsonReviver } from 'src/types';
import MMKVInstance from '../mmkvinstance';
export declare const getDataType: (value: any) => string | null;
export declare const getInitialValue: (key: string, storage: MMKVInstance, initialValueType: 'type' | 'value', reviver?: JsonReviver) => () => any;
//# sourceMappingURL=functions.d.ts.map