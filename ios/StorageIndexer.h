
#import <MMKV/MMKV.h>


@interface StorageIndexer: NSObject

-(void)addToStringsIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;

- (nullable NSMutableArray *)getStringsIndex:(nonnull MMKV *)kv;

- (nullable NSMutableArray *)getAllStrings:(nonnull MMKV *)kv;


-(void)addToIntIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;

- (nullable NSMutableArray *)getIntIndex:(nonnull MMKV *)kv;

- (nullable NSMutableArray *)getAllInts:(nonnull MMKV *)kv;


-(void)addToBoolIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;

- (nullable NSMutableArray *)getBoolIndex:(nonnull MMKV *)kv;

- (nullable NSMutableArray *)getAllBooleans:(nonnull MMKV *)kv;


-(void)addToMapIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;

- (nullable NSMutableArray *)getMapIndex:(nonnull MMKV *)kv;

- (nullable NSMutableArray *)getAllMaps:(nonnull MMKV *)kv;


-(void)addToArrayIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;

- (nullable NSMutableArray *)getArrayIndex:(nonnull MMKV *)kv;

- (nullable NSMutableArray *)getAllArrays:(nonnull MMKV *)kv;

@end

