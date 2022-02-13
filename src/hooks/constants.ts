export const types = ['string', 'number', 'boolean', 'object', 'array'];

export const methods = {
  string: {
    indexer: 'strings',
    get: 'getString',
    set: 'setString',
    copy: (value: string) => {
      return value;
    }
  },
  number: {
    indexer: 'numbers',
    get: 'getInt',
    set: 'setInt',
    copy: (value: number) => {
      return value;
    }
  },
  boolean: {
    indexer: 'booleans',
    get: 'getBool',
    set: 'setBool',
    copy: (value: boolean) => {
      return value;
    }
  },
  object: {
    indexer: 'maps',
    get: 'getMap',
    set: 'setMap',
    copy: (value: object) => {
      return { ...value };
    }
  },
  array: {
    indexer: 'arrays',
    get: 'getArray',
    set: 'setArray',
    copy: (value: any[]) => {
      return [...value];
    }
  }
};
