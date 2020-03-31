
#import "MMKVStorage.h"
#import <MMKV/MMKV.h>
#import "SecureStorage.h"
#import "IDStore.h"
#import "StorageIndexer.h"

@implementation MMKVStorage

const int DATA_TYPE_STRING = 1;

const int DATA_TYPE_INT = 2;

const int DATA_TYPE_BOOL = 3;

const int DATA_TYPE_MAP = 4;

const int DATA_TYPE_ARRAY = 5;

static dispatch_queue_t RCTGetMethodQueue()
{
    // All instances will share the same queue.
    static dispatch_queue_t queue;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        queue = dispatch_queue_create("MMKVStorage.Queue", DISPATCH_QUEUE_SERIAL);
    });
    return queue;
}

MMKV *mmkv;
SecureStorage *secureStorage;
IDStore *IdStore;
StorageIndexer *indexer;
NSMutableDictionary *mmkvMap;
NSString *defaultStorage = @"default";

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
    return RCTGetMethodQueue();
}

- (id)init
{
    self = [super init];
    if (self) {
        [MMKV initialize];
        secureStorage = [[SecureStorage alloc]init];
        IdStore = [[IDStore alloc] initWithMMKV:[MMKV mmkvWithID:@"mmkvIdStore"]];
        indexer = [[StorageIndexer alloc] init];
        mmkvMap = [NSMutableDictionary dictionary];
        
    }
    
    return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

#pragma mark setupDefaultLibrary
RCT_EXPORT_METHOD(setupDefaultLibrary) {
    
    MMKV *kv = [MMKV mmkvWithID:defaultStorage];
    
    bool isPresent = [IdStore exists:defaultStorage];
    if (!isPresent) {
        [IdStore add:defaultStorage];
    }
    [mmkvMap setObject:kv forKey:defaultStorage];
}

#pragma mark setupDefaultLibraryWithEncryption
RCT_EXPORT_METHOD(setupDefaultLibraryWithEncryption:(nonnull NSNumber *)mode
                  cryptKey:(NSString *)cryptKey
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    MMKV *kv;
    if ([cryptKey isEqualToString:@""]) {
        enum m;
        if ([mode isEqualToNumber:@1]) {
            kv = [MMKV mmkvWithID:defaultStorage mode:MMKVSingleProcess];
        } else {
            kv = [MMKV mmkvWithID:defaultStorage mode:MMKVMultiProcess];
        }
        
    } else {
        NSData *key = [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
        kv = [MMKV mmkvWithID:defaultStorage cryptKey:key];
    }
    bool isPresent = [IdStore exists:defaultStorage];
    if (!isPresent) {
        [IdStore add:defaultStorage];
        [kv setBool:true forKey:defaultStorage];
        [mmkvMap setObject:kv forKey:defaultStorage];
        callback(@[[NSNull null]  , @YES ]);
    } else {
        bool isCorrectInstance = [kv containsKey:defaultStorage];
        if (isCorrectInstance) {
            [mmkvMap setObject:kv forKey:defaultStorage];
            callback(@[[NSNull null]  , @YES ]);
        } else {
            callback(@[[NSNull null]  , @YES ]);
            callback(@[@"Wrong Password", [NSNull null] ]);
            
        }
    }
}

#pragma mark setupLibraryWithInstanceIDAndEncryption
RCT_EXPORT_METHOD(setupLibraryWithInstanceIDAndEncryption:(NSString *)ID
                  mode:(nonnull NSNumber *)mode
                  cryptKey:(NSString *)cryptKey
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    MMKV *kv;
    
    if ([ID isEqualToString:@"default"]) {
        
        callback(@[@"default ID is reserved", [NSNull null] ]);
        return;
        
    }
    if ([mode isEqualToNumber:@1]) {
        NSData *key = [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
        kv = [MMKV mmkvWithID:ID cryptKey:key mode:MMKVSingleProcess];
    } else {
        NSData *key = [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
        kv = [MMKV mmkvWithID:ID cryptKey:key mode:MMKVMultiProcess];
    }
    
    
    bool isPresent = [IdStore exists:ID];
    if (!isPresent) {
        [IdStore add:ID];
        [kv setBool:true forKey:ID];
        [mmkvMap setObject:kv forKey:ID];
        callback(@[[NSNull null]  , @YES ]);
    } else {
        bool isCorrectInstance = [kv containsKey:ID];
        if (isCorrectInstance) {
            [mmkvMap setObject:kv forKey:ID];
            callback(@[[NSNull null]  , @YES ]);
        } else {
            callback(@[@"Wrong Password", [NSNull null] ]);
        }
    }
}


#pragma mark setupLibraryWithInstanceID
RCT_EXPORT_METHOD(setupLibraryWithInstanceID:(NSString *)ID
                  mode:(nonnull NSNumber *)mode
                  ) {
    MMKV *kv;
    if ([mode isEqualToNumber:@1]) {
        
        kv = [MMKV mmkvWithID:ID mode:MMKVSingleProcess];
    } else {
        
        kv = [MMKV mmkvWithID:ID mode:MMKVMultiProcess];
    }
    
    bool isPresent = [IdStore exists:ID];
    if (!isPresent) {
        [IdStore add:ID];
    }
    
    [mmkvMap setObject:kv forKey:ID];
    
}

#pragma mark getAllMMKVInstanceIDs
RCT_EXPORT_METHOD(getAllMMKVInstanceIDs:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject ) {
    
    NSMutableArray *ids = [IdStore getAll];
    resolve(ids);
}


#pragma mark getCurrentMMKVInstanceIDs
RCT_EXPORT_METHOD(getCurrentMMKVInstanceIDs:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject ) {
    
    NSArray *ids = [mmkvMap allKeys];
    resolve(ids);
}

#pragma mark setStringAsync
RCT_EXPORT_METHOD(setStringAsync:(NSString *)ID
                  key:(NSString*)key
                  value:(NSString*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    [self setItemAsync:ID key:key type:DATA_TYPE_STRING string:value boolean:false number:NULL map:NULL resolve:resolve rejecter:reject];
}

#pragma mark setString
RCT_EXPORT_METHOD(setString:(NSString *)ID
                  key:(NSString*)key
                  value:(NSString*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    [self setItem:ID key:key type:DATA_TYPE_STRING string:value boolean:false number:NULL map:NULL callback:callback];
}

- (void)setItemAsync:(NSString *)ID
                 key:(NSString*)key
                type:(int)type
              string:(nullable NSString *)string
             boolean:(bool)boolean
              number:(nullable NSNumber *)number
                 map:(nullable NSDictionary *)map
             resolve:(RCTPromiseResolveBlock)resolve
            rejecter:(RCTPromiseRejectBlock)reject
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        dispatch_async(RCTGetMethodQueue(), ^{
            MMKV *kv = [mmkvMap objectForKey:ID];
            
            switch (type) {
                case DATA_TYPE_STRING:
                    
                    [kv setObject:string forKey:key];
                    resolve(@YES);
                    [indexer addToStringsIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_INT:
                    
                    [kv setInt64:number.intValue forKey:key];
                    resolve(@YES);
                    [indexer addToIntIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_BOOL:
                    
                    [kv setBool:boolean forKey:key];
                    resolve(@YES);
                    [indexer addToBoolIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_MAP:
                    
                    [kv setObject:map forKey:key];
                    resolve(@YES);
                    [indexer addToMapIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_ARRAY:
                    
                    [kv setObject:map forKey:key];
                    resolve(@YES);
                    [indexer addToArrayIndex:kv key:key];
            
                    break;
                default:
                    break;
            }
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}


- (void)setItem:(NSString *)ID
            key:(NSString*)key
           type:(int)type
         string:(nullable NSString *)string
        boolean:(bool)boolean
         number:(nullable NSNumber *)number
            map:(nullable NSDictionary *)map
       callback:(RCTResponseSenderBlock)callback
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        dispatch_async(RCTGetMethodQueue(), ^{
            MMKV *kv = [mmkvMap objectForKey:ID];
            
            switch (type) {
                case DATA_TYPE_STRING:
                    
                    [kv setObject:string forKey:key];
                    callback(@[[NSNull null], @YES]);
                    [indexer addToStringsIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_INT:
                    
                    [kv setInt64:number.intValue forKey:key];
                    callback(@[[NSNull null], @YES]);
                    [indexer addToIntIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_BOOL:
                    
                    [kv setBool:boolean forKey:key];
                    callback(@[[NSNull null], @YES]);
                    [indexer addToBoolIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_MAP:
                    
                    [kv setObject:map forKey:key];
                    callback(@[[NSNull null], @YES]);
                    [indexer addToMapIndex:kv key:key];
                    
                    break;
                case DATA_TYPE_ARRAY:
                    
                    [kv setObject:map forKey:key];
                    callback(@[[NSNull null], @YES]);
                    [indexer addToArrayIndex:kv key:key];
                    break;
                default:
                    break;
            }
            
        });
        
    } else {
        callback(@[@"cannot_get", @"database not initialized for the given ID", [NSNull null]]);
        
    }
}

#pragma mark getItemAsync
RCT_EXPORT_METHOD(getItemAsync:(NSString *)ID
                  key:(NSString*)key
                  type:(nonnull NSNumber *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        dispatch_async(RCTGetMethodQueue(), ^{
            MMKV *kv = [mmkvMap objectForKey:ID];
            
            if ([kv containsKey:key]) {
                
                
                switch (type.integerValue) {
                    case DATA_TYPE_STRING:
                        
                        resolve([kv getObjectOfClass:NSString.class forKey:key]);
                        break;
                    case DATA_TYPE_INT:
                        
                        resolve([NSNumber numberWithUnsignedLongLong:[kv getInt64ForKey:key]]);
                        break;
                    case DATA_TYPE_BOOL:
                        
                        if ([kv getBoolForKey:key]) {
                            resolve(@YES);
                        } else {
                            resolve(@NO);
                        }
                        break;
                    case DATA_TYPE_MAP:
                        
                        resolve([kv getObjectOfClass:NSDictionary.class forKey:key]);
                        break;
                    case DATA_TYPE_ARRAY:
                        
                        resolve([kv getObjectOfClass:NSDictionary.class forKey:key]);
                        break;
                    default:
                        break;
                }
                
                
            } else {
                reject(@"cannot_get", @"value for key does not exist", nil);
            }
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getItem
RCT_EXPORT_METHOD(getItem:(NSString *)ID
                  key:(NSString*)key
                  type:(nonnull NSNumber *)type
                  callback:(RCTResponseSenderBlock)callback) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        dispatch_async(RCTGetMethodQueue(), ^{
            MMKV *kv = [mmkvMap objectForKey:ID];
            
            if ([kv containsKey:key]) {
                switch (type.integerValue) {
                    case DATA_TYPE_STRING:
                        
                        callback(@[[NSNull null], [kv getObjectOfClass:NSString.class forKey:key]]);
                        break;
                    case DATA_TYPE_INT:
                        
                        callback(@[[NSNull null], [NSNumber numberWithUnsignedLongLong:[kv getInt64ForKey:key]]]);
                        break;
                    case DATA_TYPE_BOOL:
                        
                        if ([kv getBoolForKey:key]) {
                            callback(@[[NSNull null], @YES]);
                        } else {
                            callback(@[[NSNull null], @NO]);
                        }
                        break;
                    case DATA_TYPE_MAP:
                        callback(@[[NSNull null], [kv getObjectOfClass:NSDictionary.class forKey:key]]);
                        
                        break;
                    case DATA_TYPE_ARRAY:
                        
                        callback(@[[NSNull null], [kv getObjectOfClass:NSDictionary.class forKey:key]]);
                        
                        break;
                    default:
                        break;
                }
                
                
            } else {
                callback(@[@"Value for key does not exist", [NSNull null]]);
                
            }
            
        });
        
    } else {
        callback(@[@"database not initialized for the given ID", [NSNull null]]);
        
    }
}

#pragma mark setIntAsync
RCT_EXPORT_METHOD(setIntAsync:(NSString *)ID key:(NSString*)key
                  value:(nonnull NSNumber*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    [self setItemAsync:ID key:key type:DATA_TYPE_INT string:NULL boolean:false number:value map:NULL resolve:resolve rejecter:reject];
}

#pragma mark setInt
RCT_EXPORT_METHOD(setInt:(NSString *)ID key:(NSString*)key
                  value:(nonnull NSNumber*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    [self setItem:ID key:key type:DATA_TYPE_INT string:NULL boolean:false number:value map:NULL callback:callback];
    
}


#pragma mark setBoolAsync
RCT_EXPORT_METHOD(setBoolAsync:(NSString *)ID key:(NSString*)key
                  value:(BOOL *)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    [self setItemAsync:ID key:key type:DATA_TYPE_BOOL string:NULL boolean:value number:NULL map:NULL resolve:resolve rejecter:reject];
    
}

#pragma mark setBool
RCT_EXPORT_METHOD(setBool:(NSString *)ID key:(NSString*)key
                  value:(BOOL *)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    [self setItem:ID key:key type:DATA_TYPE_BOOL string:NULL boolean:value number:NULL map:NULL callback:callback];
    
}

#pragma mark setMapAsync
RCT_EXPORT_METHOD(setMapAsync:(NSString *)ID key:(NSString*)key
                  value:(NSDictionary*)value
                  isArray:(bool)isArray
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    int type = DATA_TYPE_MAP;
    if (isArray) {
        type = DATA_TYPE_ARRAY;
    }
    [self setItemAsync:ID key:key type:type string:NULL boolean:false number:NULL map:value resolve:resolve rejecter:reject];
    
}

#pragma mark setMap
RCT_EXPORT_METHOD(setMap:(NSString *)ID key:(NSString*)key
                  value:(NSDictionary*)value
                  isArray:(bool)isArray
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    int type = DATA_TYPE_MAP;
    if (isArray) {
        type = DATA_TYPE_ARRAY;
    }
    [self setItem:ID key:key type:type string:NULL boolean:false number:NULL map:value callback:callback];
    
}

#pragma mark getMultipleItemsAsync
RCT_EXPORT_METHOD(getMultipleItemsAsync:(NSString *)ID key:(NSArray*)keys
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            
            NSMutableArray * objects = [NSMutableArray array];
            for (NSString* key in keys)
            {
                
                if ([kv containsKey:key]) {
                    NSMutableArray * array = [NSMutableArray array];
                    NSDictionary* dic = [kv getObjectOfClass:NSDictionary.class forKey:key];
                    [array addObject:key];
                    [array addObject:dic];
                    [objects addObject:array];
                } else {
                    NSMutableArray * array = [NSMutableArray array];
                    [array addObject:key];
                    [array addObject:[NSNull null]];
                    [objects addObject:array];
                }
            }
            resolve(objects);
            
        });
        
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getMultipleItems
RCT_EXPORT_METHOD(getMultipleItems:(NSString *)ID key:(NSArray*)keys
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            NSMutableArray * objects = [NSMutableArray array];
            for (NSString* key in keys)
            {
                
                if ([kv containsKey:key]) {
                    
                    NSDictionary* dic = [kv getObjectOfClass:NSDictionary.class forKey:key];
                    NSMutableArray * array = [NSMutableArray array];
                    [array addObject:key];
                    [array addObject:dic];
                    [objects addObject:array];
                    
                } else {
                    NSMutableArray * array = [NSMutableArray array];
                    [array addObject:key];
                    [array addObject:[NSNull null]];
                    [objects addObject:array];
                }
            }
            
            callback(@[[NSNull null], objects]);
            
        });
        
    } else {
        callback(@[[NSNull null], @"database not initialized for the given ID"]);
    }
    
}

#pragma mark getKeysAsync
RCT_EXPORT_METHOD(getKeysAsync:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        NSArray *array =  kv.allKeys;
        resolve(array);
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
    
}

#pragma mark getKeys
RCT_EXPORT_METHOD(getKeys:(NSString *)ID callback:(RCTResponseSenderBlock)callback) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        NSArray *array =  kv.allKeys;
        callback(@[[NSNull null], array]);
        
    } else {
        callback(@[@"database not initialized for the given ID", [NSNull null]]);
    }
}


#pragma mark hasKeyAsync
RCT_EXPORT_METHOD(hasKeyAsync:(NSString *)ID key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                resolve(@YES);
            } else {
                resolve(@NO);
            }
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
}

#pragma mark hasKey
RCT_EXPORT_METHOD(hasKey:(NSString *)ID key:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                callback(@[[NSNull null], @YES]);
            } else {
                callback(@[[NSNull null], @NO]);
            }
            
        });
        
    } else {
        callback(@[@"database not initialized for the given ID" ,[NSNull null]]);
    }
}



#pragma mark removeItem
RCT_EXPORT_METHOD(removeItem:(NSString *)ID key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                [kv removeValueForKey:key];
            } else {
                resolve(@NO);
            }
            resolve(@YES);
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
    
}

#pragma mark clearStore
RCT_EXPORT_METHOD(clearStore:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [kv clearAll];
            [kv setBool:true forKey:ID];
            resolve(@YES);
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}


#pragma mark clearMemoryCache
RCT_EXPORT_METHOD(clearMemoryCache:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            [kv clearMemoryCache];
            resolve(@YES);
        });
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getAllItemsForTypeAsync
RCT_EXPORT_METHOD(getAllItemsForTypeAsync:(NSString *)ID
                  type:(nonnull NSNumber *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        dispatch_async(RCTGetMethodQueue(), ^{
            MMKV *kv = [mmkvMap objectForKey:ID];
            
            switch (type.integerValue) {
                case DATA_TYPE_STRING:
                    
                    resolve([indexer getAllStrings:kv]);
                    
                    break;
                case DATA_TYPE_INT:
                    
                    resolve([indexer getAllInts:kv]);
                    
                    break;
                case DATA_TYPE_BOOL:
                    
                    resolve([indexer getAllBooleans:kv]);
                    
                    break;
                case DATA_TYPE_MAP:
                    
                    resolve([indexer getAllMaps:kv]);
                    
                    break;
                case DATA_TYPE_ARRAY:
                    
                    resolve([indexer getAllArrays:kv]);
                    
                    break;
                default:
                    break;
            }
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getAllItemsForType
RCT_EXPORT_METHOD(getAllItemsForType:(NSString *)ID
                  type:(nonnull NSNumber *)type
                  callback:(RCTResponseSenderBlock)callback) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        dispatch_async(RCTGetMethodQueue(), ^{
            MMKV *kv = [mmkvMap objectForKey:ID];
            
            switch (type.integerValue) {
                case DATA_TYPE_STRING:
                    
                    callback(@[[NSNull null], [indexer getAllStrings:kv]]);
                    
                    break;
                case DATA_TYPE_INT:
                    
                    callback(@[[NSNull null], [indexer getAllInts:kv]]);
                    
                    break;
                case DATA_TYPE_BOOL:
                    
                    callback(@[[NSNull null], [indexer getAllBooleans:kv]]);
                    
                    break;
                case DATA_TYPE_MAP:
                    callback(@[[NSNull null], [indexer getAllMaps:kv]]);
                    
                    break;
                case DATA_TYPE_ARRAY:
                    
                    callback(@[[NSNull null], [indexer getAllArrays:kv]]);
                    
                    break;
                default:
                    break;
            }
            
        });
        
    } else {
        callback(@[@"database not initialized for the given ID", [NSNull null]]);
        
    }
}

#pragma mark encrypt
RCT_EXPORT_METHOD(encrypt:(NSString *)ID
                  cryptKey:(NSString *)cryptKey
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        NSData *key = [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
        [kv reKey:key];
        resolve(@YES);
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark decrypt
RCT_EXPORT_METHOD(decrypt:(NSString *)ID
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        [kv reKey:NULL];
        resolve(@YES);
        
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark changeEncryptionKey
RCT_EXPORT_METHOD(changeEncryptionKey:(NSString *)ID
                  cryptKey:(NSString *)cryptKey
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        NSData *key = [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
        [kv reKey:key];
        resolve(@YES);
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark setSecureKey
RCT_EXPORT_METHOD(setSecureKey: (NSString *)key value:(NSString *)value
                  options: (NSDictionary *)options
                  callback:(RCTResponseSenderBlock)callback
                  )
{
    
    @try {
        
        [secureStorage handleAppUninstallation];
        BOOL status = [secureStorage createKeychainValue: value forIdentifier: key options: options];
        if (status) {
            callback(@[[NSNull null],@"Key updated successfully" ]);
            
        } else {
            BOOL status = [secureStorage updateKeychainValue: value forIdentifier: key options: options];
            if (status) {
                callback(@[[NSNull null],@"Key updated successfully" ]);
            } else {
                callback(@[@"An error occurred", [NSNull null]]);
            }
        }
    }
    @catch (NSException *exception) {
        callback(@[exception.reason, [NSNull null]]);
    }
}

#pragma mark getSecureKey
RCT_EXPORT_METHOD(getSecureKey:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    
    @try {
        [secureStorage handleAppUninstallation];
        NSString *value = [secureStorage searchKeychainCopyMatching:key];
        if (value == nil) {
            NSString* errorMessage = @"key does not present";
            callback(@[errorMessage, [NSNull null]]);
        } else {
            callback(@[[NSNull null], value]);
        }
    }
    @catch (NSException *exception) {
        callback(@[exception.reason, [NSNull null]]);
    }
}

#pragma mark secureKeyExists
RCT_EXPORT_METHOD(secureKeyExists:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    
    @try {
        [secureStorage handleAppUninstallation];
        BOOL exists = [secureStorage searchKeychainCopyMatchingExists:key];
        if (exists) {
            callback(@[[NSNull null], @true]);
        } else {
            callback(@[[NSNull null], @false]);
        }
    }
    @catch(NSException *exception) {
        callback(@[exception.reason, [NSNull null]]);
    }
}
#pragma mark removeSecureKey
RCT_EXPORT_METHOD(removeSecureKey:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    @try {
        BOOL status = [secureStorage deleteKeychainValue:key];
        if (status) {
            callback(@[[NSNull null], @"key removed successfully"]);
            
        } else {
            NSString* errorMessage = @"Could not find the key to delete.";
            
            callback(@[errorMessage, [NSNull null]]);
        }
    }
    @catch(NSException *exception) {
        callback(@[exception.reason, [NSNull null]]);
    }
}

@end


