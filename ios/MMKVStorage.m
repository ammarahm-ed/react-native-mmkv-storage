
#import "MMKVStorage.h"
#import <MMKV/MMKV.h>

#import "SecureStorage.h"
#import "IDStore.h"
#import "StorageIndexer.h"
@implementation MMKVStorage

static dispatch_queue_t RCTGetMethodQueue()
{
    // All instances will share the same queue.
    static dispatch_queue_t queue;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        queue = dispatch_queue_create("FastStorage.Queue", DISPATCH_QUEUE_SERIAL);
    });
    return queue;
}

MMKV *mmkv;

SecureStorage *secureStorage;
IDStore *IdStore;
StorageIndexer *indexer;
NSMutableDictionary *mmkvMap;

NSString *serviceName;

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
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [kv setObject:value forKey:key];
            resolve(@YES);
            [indexer addToStringsIndex:kv key:key];
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark setString
RCT_EXPORT_METHOD(setString:(NSString *)ID
                  key:(NSString*)key
                  value:(NSString*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [kv setObject:value forKey:key];
            [args addObject:[NSNull null]];
            [args addObject:@YES];
            
            [indexer addToStringsIndex:kv key:key];
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
}





#pragma mark getStringAsync
RCT_EXPORT_METHOD(getStringAsync:(NSString *)ID  key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                resolve([kv getObjectOfClass:NSString.class forKey:key]);
            } else {
                reject(@"cannot_get", @"value for key does not exist", nil);
            }
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}



#pragma mark getString
RCT_EXPORT_METHOD(getString:(NSString *)ID key:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                NSString *string =[kv getObjectOfClass:NSString.class forKey:key];
                [args addObject:[NSNull null]];
                [args addObject:string];
                
            } else {
                
                [args addObject:@"Value for the given key does not exist"];
                [args addObject:[NSNull null]];
                
            }
            
            
        });
        
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
    
}






#pragma mark setIntAsync
RCT_EXPORT_METHOD(setIntAsync:(NSString *)ID key:(NSString*)key
                  value:(nonnull NSNumber*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            [kv setInt64:value.intValue forKey:key];
            resolve(@YES);
            [indexer addToIntIndex:kv key:key];
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
}

#pragma mark setInt
RCT_EXPORT_METHOD(setInt:(NSString *)ID key:(NSString*)key
                  value:(nonnull NSNumber*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [kv setInt64:value.intValue forKey:key];
            
            [args addObject:[NSNull null]];
            [args addObject:@YES];
            
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
    
    
}

#pragma mark getIntAsync
RCT_EXPORT_METHOD(getIntAsync:(NSString *)ID key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([[mmkvMap allKeys] containsObject:ID]) {
            
            MMKV *kv = [mmkvMap objectForKey:ID];
            
            if ([kv containsKey:key]) {
                int64_t val = [kv getInt64ForKey:key];
                NSNumber *number = [NSNumber numberWithUnsignedLongLong:val];
                resolve(number);
            } else {
                reject(@"cannot_get", @"value for key does not exist", nil);
            }
            
        } else {
            
            reject(@"cannot_get", @"database not initialized for the given ID", nil);
        }
        
        
        
    });
    
}

#pragma mark getInt
RCT_EXPORT_METHOD(getInt:(NSString *)ID key:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                int64_t val = [kv getInt64ForKey:key];
                NSNumber *number = [NSNumber numberWithUnsignedLongLong:val];
                [args addObject:[NSNull null]];
                [args addObject:number];
                
            } else {
                
                [args addObject:@"Value for the given key does not exist"];
                [args addObject:[NSNull null]];
            }
            
            
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
    
    
    
}




#pragma mark setBoolAsync
RCT_EXPORT_METHOD(setBoolAsync:(NSString *)ID key:(NSString*)key
                  value:(BOOL *)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [kv setBool:value forKey:key];
            resolve(@YES);
            [indexer addToBoolIndex:kv key:key];
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark setBool
RCT_EXPORT_METHOD(setBool:(NSString *)ID key:(NSString*)key
                  value:(BOOL *)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            [kv setBool:value forKey:key];
            
            [args addObject:[NSNull null]];
            [args addObject:@YES];
            
            [indexer addToBoolIndex:kv key:key];
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
    }
    callback(args);
    
}

#pragma mark getBoolAsync
RCT_EXPORT_METHOD(getBoolAsync:(NSString *)ID key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                
                bool boolValue =  [kv getBoolForKey:key];
                if (boolValue) {
                    resolve(@YES);
                } else {
                    resolve(@NO);
                }
                
            } else {
                reject(@"cannot_get", @"value for key does not exist", nil);
            }
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
    
    
}

#pragma mark getBool
RCT_EXPORT_METHOD(getBool:(NSString *)ID key:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            
            if ([kv containsKey:key]) {
                bool boolValue =  [kv getBoolForKey:key];
                [args addObject:[NSNull null]];
                if (boolValue) {
                    [args addObject:@YES];
                } else {
                    [args addObject:@NO];
                }
                
            } else {
                [args addObject:@"Value for the given key does not exist"];
                [args addObject:[NSNull null]];
            }
            
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
}




#pragma mark setMapAsync
RCT_EXPORT_METHOD(setMapAsync:(NSString *)ID key:(NSString*)key
                  value:(NSDictionary*)value
                  isArray:(bool)isArray
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [kv setObject:value forKey:key];
            resolve(@YES);
            
            if (isArray) {
                [indexer addToArrayIndex:kv key:key];
            } else {
                [indexer addToMapIndex:kv key:key];
            }
            
        });
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
    
    
}

#pragma mark setMap
RCT_EXPORT_METHOD(setMap:(NSString *)ID key:(NSString*)key
                  value:(NSDictionary*)value
                  isArray:(bool)isArray
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [kv setObject:value forKey:key];
            
            [args addObject:[NSNull null]];
            [args addObject:@YES];
            
            if (isArray) {
                [indexer addToArrayIndex:kv key:key];
            } else {
                [indexer addToMapIndex:kv key:key];
            }
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
    
}




#pragma mark getMapAsync
RCT_EXPORT_METHOD(getMapAsync:(NSString *)ID key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            if ([kv containsKey:key]) {
                NSDictionary* data = [kv getObjectOfClass:NSDictionary.class forKey:key];
                resolve(data);
            } else {
                reject(@"cannot_get", @"value for key does not exist", nil);
            }
            
        });
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
    
    
}

#pragma mark getMap
RCT_EXPORT_METHOD(getMap:(NSString *)ID key:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            
            if ([kv containsKey:key]) {
                NSDictionary *data = [kv getObjectOfClass:NSDictionary.class forKey:key];
                [args addObject:[NSNull null]];
                [args addObject:data];
            } else {
                
                [args addObject:@"Value for given key does not exist"];
                [args addObject:[NSNull null]];
            }
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
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
    NSMutableArray *args = [NSMutableArray array];
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
            
            [args addObject:[NSNull null]];
            [args addObject:objects];
            
        });
        
        
    } else {
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
    }
    callback(args);
    
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
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        
        
        NSArray *array =  kv.allKeys;
        [args addObject:array];
        
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
        
    }
    callback(args);
    
    
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
    NSMutableArray *args = [NSMutableArray array];
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            [args addObject:[NSNull null]];
            if ([kv containsKey:key]) {
                [args addObject:@YES];
            } else {
                [args addObject:@NO];
            }
            
        });
        
    } else {
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
    }
    callback(args);
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






#pragma mark getAllStringsAsync
RCT_EXPORT_METHOD(getAllStringsAsync:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            resolve([indexer getAllStrings:kv]);
        });
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getAllStrings
RCT_EXPORT_METHOD(getAllStrings:(NSString *)ID
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            NSMutableArray *strings = [indexer getAllStrings:kv];
            [args addObject:[NSNull null]];
            [args addObject:strings];
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
    }
    callback(args);
    
}

#pragma mark getAllIntsAsync
RCT_EXPORT_METHOD(getAllIntsAsync:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            resolve([indexer getAllInts:kv]);
        });
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getAllInts
RCT_EXPORT_METHOD(getAllInts:(NSString *)ID
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            NSMutableArray *ints = [indexer getAllInts:kv];
            [args addObject:[NSNull null]];
            [args addObject:ints];
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
    }
    callback(args);
    
}

#pragma mark getAllBoolsAsync
RCT_EXPORT_METHOD(getAllBoolsAsync:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            resolve([indexer getAllBooleans:kv]);
        });
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getAllBooleans
RCT_EXPORT_METHOD(getAllBooleans:(NSString *)ID
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            NSMutableArray *bools = [indexer getAllBooleans:kv];
            [args addObject:[NSNull null]];
            [args addObject:bools];
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
    }
    callback(args);
    
}

#pragma mark getAllMapsAsync
RCT_EXPORT_METHOD(getAllMapsAsync:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            resolve([indexer getAllMaps:kv]);
        });
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getAllMaps
RCT_EXPORT_METHOD(getAllMaps:(NSString *)ID
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            NSMutableArray *maps = [indexer getAllMaps:kv];
            [args addObject:[NSNull null]];
            [args addObject:maps];
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
    }
    callback(args);
    
}


#pragma mark getAllArraysAsync
RCT_EXPORT_METHOD(getAllArraysAsync:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            resolve([indexer getAllArrays:kv]);
        });
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark getAllArrays
RCT_EXPORT_METHOD(getAllArrays:(NSString *)ID
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    NSMutableArray *args = [NSMutableArray array];
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        dispatch_async(RCTGetMethodQueue(), ^{
            
            NSMutableArray *bools = [indexer getAllArrays:kv];
            [args addObject:[NSNull null]];
            [args addObject:bools];
            
        });
        
    } else {
        
        [args addObject:@"database not initialized for the given ID"];
        [args addObject:[NSNull null]];
        
    }
    callback(args);
    
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
    NSMutableArray *args = [NSMutableArray array];
    @try {
        
        [secureStorage handleAppUninstallation];
        BOOL status = [secureStorage createKeychainValue: value forIdentifier: key options: options];
        if (status) {
            
            [args addObject:[NSNull null]];
            [args addObject:@"Key updated successfully"];
            callback(args);
            
        } else {
            BOOL status = [secureStorage updateKeychainValue: value forIdentifier: key options: options];
            if (status) {
                
                [args addObject:[NSNull null]];
                [args addObject:@"Key updated successfully"];
                callback(args);
                
            } else {
                NSString* errorMessage = @"An error occurred";
                [args addObject:errorMessage];
                [args addObject:[NSNull null]];
                callback(args);
            }
        }
    }
    @catch (NSException *exception) {
        NSString* errorMessage = @"key does not present";
        [args addObject:errorMessage];
        [args addObject:[NSNull null]];
        callback(args);
    }
}

#pragma mark getSecureKey
RCT_EXPORT_METHOD(getSecureKey:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    
    NSMutableArray *args = [NSMutableArray array];
    @try {
        [secureStorage handleAppUninstallation];
        NSString *value = [secureStorage searchKeychainCopyMatching:key];
        if (value == nil) {
            NSString* errorMessage = @"key does not present";
            [args addObject:errorMessage];
            [args addObject:[NSNull null]];
            callback(args);
        } else {
            
            [args addObject:[NSNull null]];
            [args addObject:value];
            callback(args);
            
        }
    }
    @catch (NSException *exception) {
        NSString* errorMessage = @"key does not present";
        [args addObject:errorMessage];
        [args addObject:[NSNull null]];
        callback(args);
    }
}

#pragma mark secureKeyExists
RCT_EXPORT_METHOD(secureKeyExists:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    NSMutableArray *args = [NSMutableArray array];
    @try {
        [secureStorage handleAppUninstallation];
        BOOL exists = [secureStorage searchKeychainCopyMatchingExists:key];
        if (exists) {
            
            [args addObject:[NSNull null]];
            [args addObject:@true];
            callback(args);
        } else {
            
            [args addObject:[NSNull null]];
            [args addObject:@false];
            callback(args);
            
        }
    }
    @catch(NSException *exception) {
        
        [args addObject:exception.reason];
        [args addObject:[NSNull null]];
        callback(args);
        
    }
    
}
#pragma mark removeSecureKey
RCT_EXPORT_METHOD(removeSecureKey:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    NSMutableArray *args = [NSMutableArray array];
    @try {
        BOOL status = [secureStorage deleteKeychainValue:key];
        if (status) {
            [args addObject:[NSNull null]];
            [args addObject:@"key removed successfully"];
            callback(args);
            
        } else {
            NSString* errorMessage = @"Could not find the key to delete.";
            
            [args addObject:errorMessage];
            [args addObject:[NSNull null]];
            callback(args);
        }
    }
    @catch(NSException *exception) {
        NSString* errorMessage =@"Could not find the key to delete.";
        [args addObject:errorMessage];
        [args addObject:[NSNull null]];
        callback(args);
    }
}


NSError * secureKeyStoreError(NSString *errMsg)
{
    NSError *error = [NSError errorWithDomain:serviceName code:200 userInfo:@{@"reason": errMsg}];
    return error;
}

CFStringRef accessibleValue(NSDictionary *options)
{
    if (options && options[@"accessible"] != nil) {
        NSDictionary *keyMap = @{
            @"AccessibleWhenUnlocked": (__bridge NSString *)kSecAttrAccessibleWhenUnlocked,
            @"AccessibleAfterFirstUnlock": (__bridge NSString *)kSecAttrAccessibleAfterFirstUnlock,
            @"AccessibleAlways": (__bridge NSString *)kSecAttrAccessibleAlways,
            @"AccessibleWhenPasscodeSetThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
            @"AccessibleWhenUnlockedThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            @"AccessibleAfterFirstUnlockThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
            @"AccessibleAlwaysThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleAlwaysThisDeviceOnly
        };
        NSString *result = keyMap[options[@"accessible"]];
        if (result) {
            return (__bridge CFStringRef)result;
        }
    }
    return kSecAttrAccessibleAfterFirstUnlock;
}


@end


