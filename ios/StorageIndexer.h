
#import <MMKV/MMKV.h>


@interface StorageIndexer: NSObject

+ (nullable NSMutableArray *)getIndex:(nonnull MMKV *)kv type:(int)type;

+(void)addToStringsIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;


+ (nullable NSMutableArray *)getAllStrings:(nonnull MMKV *)kv;


+(void)addToIntIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;


+ (nullable NSMutableArray *)getAllInts:(nonnull MMKV *)kv;


+(void)addToBoolIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;


+ (nullable NSMutableArray *)getAllBooleans:(nonnull MMKV *)kv;


+(void)addToMapIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;


+ (nullable NSMutableArray *)getAllMaps:(nonnull MMKV *)kv;


+(void)addToArrayIndex:(nonnull MMKV *)kv key:(nonnull NSString *)key;


+ (nullable NSMutableArray *)getAllArrays:(nonnull MMKV *)kv;

+ (void) removeKeyFromIndexer:(nonnull MMKV *)kv
                          key:(nonnull NSString *)key;

@end

