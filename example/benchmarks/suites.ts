import { MMKVLoader } from 'react-native-mmkv-storage';
import { group, bench } from './framework';

const plain = new MMKVLoader().withInstanceID('bench_plain').initialize();
const encrypted = new MMKVLoader().withInstanceID('bench_encrypted').withEncryption().initialize();
const unindexed = new MMKVLoader().withInstanceID('bench_unindexed').disableIndexing().initialize();
const transactional = new MMKVLoader().withInstanceID('bench_transactions').initialize();

const SMALL_OBJECT = { id: 1, name: 'ammar', active: true };
const LARGE_OBJECT = Object.fromEntries(
  Array.from({ length: 100 }, (_, index) => [`field_${index}`, `value_${index}`])
);
const SMALL_ARRAY = [1, 2, 3, 4, 5];
const LARGE_ARRAY = Array.from({ length: 1000 }, (_, index) => index);
const SHORT_STRING = 'hello world';
const LONG_STRING = 'x'.repeat(10000);

const BULK_SIZE = 100;
const bulkKeys = Array.from({ length: BULK_SIZE }, (_, index) => `bulk_key_${index}`);
const bulkPairs = bulkKeys.map(key => [key, `value_for_${key}`] as [string, string]);

const seedRead = () => {
  plain.setString('read_short', SHORT_STRING);
  plain.setString('read_long', LONG_STRING);
  plain.setInt('read_int', 123456);
  plain.setBool('read_bool', true);
  plain.setMap('read_small_map', SMALL_OBJECT);
  plain.setMap('read_large_map', LARGE_OBJECT);
  plain.setArray('read_small_array', SMALL_ARRAY);
  plain.setArray('read_large_array', LARGE_ARRAY);
  encrypted.setString('read_short', SHORT_STRING);
  unindexed.setString('read_short', SHORT_STRING);
};

group('Strings', () => {
  bench('setString short', iteration => {
    plain.setString(`bench_string_${iteration % 100}`, SHORT_STRING);
  });

  bench('setString 10KB', iteration => {
    plain.setString(`bench_long_${iteration % 20}`, LONG_STRING);
  }, { iterations: 500 });

  bench('getString', () => {
    plain.getString('read_short');
  }, { setup: seedRead });

  bench('getString 10KB', () => {
    plain.getString('read_long');
  }, { setup: seedRead, iterations: 500 });

  bench('setStringAsync', async iteration => {
    await plain.setStringAsync(`bench_async_string_${iteration % 100}`, SHORT_STRING);
  }, { iterations: 1000 });

  bench('getStringAsync', async () => {
    await plain.getStringAsync('read_short');
  }, { setup: seedRead, iterations: 1000 });

  bench('setItem (AsyncStorage shape)', async iteration => {
    await plain.setItem(`bench_setitem_${iteration % 100}`, SHORT_STRING);
  }, { iterations: 1000 });

  bench('getItem (AsyncStorage shape)', async () => {
    await plain.getItem('read_short');
  }, { setup: seedRead, iterations: 1000 });
});

group('Numbers and booleans', () => {
  bench('setInt', iteration => {
    plain.setInt(`bench_int_${iteration % 100}`, iteration);
  });

  bench('getInt', () => {
    plain.getInt('read_int');
  }, { setup: seedRead });

  bench('setBool', iteration => {
    plain.setBool(`bench_bool_${iteration % 100}`, iteration % 2 === 0);
  });

  bench('getBool', () => {
    plain.getBool('read_bool');
  }, { setup: seedRead });

  bench('setIntAsync', async iteration => {
    await plain.setIntAsync(`bench_async_int_${iteration % 100}`, iteration);
  }, { iterations: 1000 });
});

group('Objects', () => {
  bench('setMap 3 fields', iteration => {
    plain.setMap(`bench_map_${iteration % 100}`, SMALL_OBJECT);
  });

  bench('setMap 100 fields', iteration => {
    plain.setMap(`bench_large_map_${iteration % 20}`, LARGE_OBJECT);
  }, { iterations: 500 });

  bench('getMap 3 fields', () => {
    plain.getMap('read_small_map');
  }, { setup: seedRead });

  bench('getMap 100 fields', () => {
    plain.getMap('read_large_map');
  }, { setup: seedRead, iterations: 500 });

  bench('setMapAsync', async iteration => {
    await plain.setMapAsync(`bench_async_map_${iteration % 100}`, SMALL_OBJECT);
  }, { iterations: 1000 });
});

group('Arrays', () => {
  bench('setArray 5 items', iteration => {
    plain.setArray(`bench_array_${iteration % 100}`, SMALL_ARRAY);
  });

  bench('setArray 1000 items', iteration => {
    plain.setArray(`bench_large_array_${iteration % 20}`, LARGE_ARRAY);
  }, { iterations: 300 });

  bench('getArray 5 items', () => {
    plain.getArray('read_small_array');
  }, { setup: seedRead });

  bench('getArray 1000 items', () => {
    plain.getArray('read_large_array');
  }, { setup: seedRead, iterations: 300 });
});

group('Bulk operations', () => {
  bench('setMultipleItemsAsync 100 strings', async () => {
    await plain.setMultipleItemsAsync(bulkPairs, 'string');
  }, { iterations: 100, batch: 5, opsPerRun: BULK_SIZE });

  bench('setString loop 100 strings', () => {
    for (let index = 0; index < BULK_SIZE; index++) {
      plain.setString(bulkKeys[index], bulkPairs[index][1]);
    }
  }, { iterations: 100, batch: 5, opsPerRun: BULK_SIZE });

  bench('getMultipleItemsAsync 100 strings', async () => {
    await plain.getMultipleItemsAsync(bulkKeys, 'string');
  }, {
    iterations: 100,
    batch: 5,
    opsPerRun: BULK_SIZE,
    setup: async () => {
      await plain.setMultipleItemsAsync(bulkPairs, 'string');
    }
  });

  bench('getString loop 100 strings', () => {
    for (let index = 0; index < BULK_SIZE; index++) {
      plain.getString(bulkKeys[index]);
    }
  }, {
    iterations: 100,
    batch: 5,
    opsPerRun: BULK_SIZE,
    setup: async () => {
      await plain.setMultipleItemsAsync(bulkPairs, 'string');
    }
  });

  bench('getMultipleItems sync 100 strings', () => {
    plain.getMultipleItems(bulkKeys, 'string');
  }, {
    iterations: 100,
    batch: 5,
    opsPerRun: BULK_SIZE,
    setup: async () => {
      await plain.setMultipleItemsAsync(bulkPairs, 'string');
    }
  });
});

group('Deletes', () => {
  bench('removeItem', iteration => {
    const key = `bench_remove_${iteration % 200}`;
    plain.setString(key, SHORT_STRING);
    plain.removeItem(key);
  }, { iterations: 1000, opsPerRun: 1 });

  bench('removeItems 100 keys', () => {
    for (let index = 0; index < BULK_SIZE; index++) {
      plain.setString(bulkKeys[index], SHORT_STRING);
    }
    plain.removeItems(bulkKeys);
  }, { iterations: 50, batch: 5, opsPerRun: BULK_SIZE });

  bench('clearStore', () => {
    const scoped = new MMKVLoader().withInstanceID('bench_clear').initialize();
    scoped.setString('a', SHORT_STRING);
    scoped.clearStore();
  }, { iterations: 200, batch: 10 });
});

group('Indexer', () => {
  bench('indexer.hasKey', () => {
    plain.indexer.hasKey('read_short');
  }, { setup: seedRead });

  bench('strings.hasKey', () => {
    plain.indexer.strings.hasKey('read_short');
  }, { setup: seedRead });

  bench('indexer.getKeys', async () => {
    await plain.indexer.getKeys();
  }, { iterations: 300, setup: seedRead });

  bench('strings.getKeys', async () => {
    await plain.indexer.strings.getKeys();
  }, { iterations: 300, setup: seedRead });

  bench('strings.getAll', async () => {
    await plain.indexer.strings.getAll();
  }, { iterations: 100, batch: 5 });
});

group('Encryption overhead', () => {
  bench('plain setString', iteration => {
    plain.setString(`bench_cmp_${iteration % 100}`, SHORT_STRING);
  }, { iterations: 1000 });

  bench('encrypted setString', iteration => {
    encrypted.setString(`bench_cmp_${iteration % 100}`, SHORT_STRING);
  }, { iterations: 1000 });

  bench('plain getString', () => {
    plain.getString('read_short');
  }, { iterations: 1000, setup: seedRead });

  bench('encrypted getString', () => {
    encrypted.getString('read_short');
  }, { iterations: 1000, setup: seedRead });
});

group('Indexing overhead', () => {
  bench('indexed setString', iteration => {
    plain.setString(`bench_idx_${iteration % 100}`, SHORT_STRING);
  }, { iterations: 1000 });

  bench('unindexed setString', iteration => {
    unindexed.setString(`bench_idx_${iteration % 100}`, SHORT_STRING);
  }, { iterations: 1000 });

  bench('indexed getString', () => {
    plain.getString('read_short');
  }, { iterations: 1000, setup: seedRead });

  bench('unindexed getString', () => {
    unindexed.getString('read_short');
  }, { iterations: 1000, setup: seedRead });
});

group('Transactions overhead', () => {
  bench('setString without mutator', iteration => {
    transactional.setString(`bench_tx_${iteration % 100}`, SHORT_STRING);
  }, {
    iterations: 1000,
    setup: () => {
      transactional.transactions.clear();
    }
  });

  bench('setString with beforewrite mutator', iteration => {
    transactional.setString(`bench_tx_${iteration % 100}`, SHORT_STRING);
  }, {
    iterations: 1000,
    setup: () => {
      transactional.transactions.clear();
      transactional.transactions.register('string', 'beforewrite', (_key: string, value?: unknown) => value);
    },
    teardown: () => {
      transactional.transactions.clear();
    }
  });

  bench('setString with onwrite mutator', iteration => {
    transactional.setString(`bench_tx_${iteration % 100}`, SHORT_STRING);
  }, {
    iterations: 1000,
    setup: () => {
      transactional.transactions.clear();
      transactional.transactions.register('string', 'onwrite', (_key: string, value?: unknown) => value);
    },
    teardown: () => {
      transactional.transactions.clear();
    }
  });

  bench('getString with onread mutator', () => {
    transactional.getString('read_short');
  }, {
    iterations: 1000,
    setup: () => {
      transactional.setString('read_short', SHORT_STRING);
      transactional.transactions.clear();
      transactional.transactions.register('string', 'onread', (_key: string, value?: unknown) => value);
    },
    teardown: () => {
      transactional.transactions.clear();
    }
  });
});

group('Events', () => {
  bench('write with one subscriber', iteration => {
    plain.setString('bench_event_key', `${iteration}`);
  }, {
    iterations: 1000,
    setup: () => {
      plain.ev.subscribe('bench_event_key:onwrite', () => {});
    },
    teardown: () => {
      plain.ev.unsubscribeAll();
    }
  });

  bench('write with ten subscribers', iteration => {
    plain.setString('bench_event_key', `${iteration}`);
  }, {
    iterations: 1000,
    setup: () => {
      for (let index = 0; index < 10; index++) {
        plain.ev.subscribe('bench_event_key:onwrite', () => {});
      }
    },
    teardown: () => {
      plain.ev.unsubscribeAll();
    }
  });

  bench('publish', () => {
    plain.ev.publish('bench_manual_event', { key: 'bench_manual_event', value: 1 });
  }, {
    iterations: 2000,
    setup: () => {
      plain.ev.subscribe('bench_manual_event', () => {});
    },
    teardown: () => {
      plain.ev.unsubscribeAll();
    }
  });
});

group('Instance', () => {
  bench('getCurrentMMKVInstanceIDs', () => {
    plain.getCurrentMMKVInstanceIDs();
  }, { iterations: 1000 });

  bench('getAllMMKVInstanceIDs', () => {
    plain.getAllMMKVInstanceIDs();
  }, { iterations: 500 });

  bench('loader initialize (existing instance)', () => {
    new MMKVLoader().withInstanceID('bench_plain').initialize();
  }, { iterations: 200, batch: 10 });

  bench('clearMemoryCache', () => {
    plain.clearMemoryCache();
  }, { iterations: 500 });
});
