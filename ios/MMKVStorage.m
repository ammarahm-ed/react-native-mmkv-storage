#import "MMKVStorage.h"
#import <MMKV/MMKV.h>
#import "SecureStorage.h"
#import "IDStore.h"
#import "StorageGetters.h"
#import "StorageSetters.h"
#import "StorageIndexer.h"

@implementation MMKVStorage

const int DATA_TYPE_STRING = 1;

const  int DATA_TYPE_INT = 2;

const  int DATA_TYPE_BOOL = 3;

const  int DATA_TYPE_MAP = 4;

const  int DATA_TYPE_ARRAY = 5;

static dispatch_queue_t RCTGetMethodQueue()
{
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
         NSArray *paths = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES);
         NSString *libraryPath = (NSString *) [paths firstObject];
         NSString *rootDir = [libraryPath stringByAppendingPathComponent:@"mmkv"];
         [MMKV initializeMMKV:rootDir];
        
        secureStorage = [[SecureStorage alloc]init];
        IdStore = [[IDStore alloc] initWithMMKV:[MMKV mmkvWithID:@"mmkvIdStore"]];
        mmkvMap = [NSMutableDictionary dictionary];
        
    }
    
    return self;
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

#pragma mark setupWithEncryption
RCT_EXPORT_METHOD(setupWithEncryption:(NSString *)ID
                  mode:(nonnull NSNumber *)mode
                  cryptKey:(NSString *)cryptKey
                  alias:(nullable NSString *)alias
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    MMKV *kv;
    
    NSData *key = [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
    if ([mode isEqualToNumber:@1]) {
        kv = [MMKV mmkvWithID:ID cryptKey:key mode:MMKVSingleProcess];
    } else {
        kv = [MMKV mmkvWithID:ID cryptKey:key mode:MMKVMultiProcess];
    }
    
    if (![IdStore exists:ID]) {
        
        [IdStore add:ID encrypted:true alias:alias];
        
        [kv setBool:true forKey:ID];
        [mmkvMap setObject:kv forKey:ID];
        callback(@[[NSNull null]  , @YES ]);
    } else {
        
        if ([kv containsKey:ID]) {
            [mmkvMap setObject:kv forKey:ID];
            
            callback(@[[NSNull null]  , @YES ]);
        } else {
            
            [self encryptionHandler:ID mode:mode callback:callback];
            
        }
    }
}


#pragma mark setup
RCT_EXPORT_METHOD(setup:(NSString *)ID
                  mode:(nonnull NSNumber *)mode
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    MMKV *kv;
    if ([mode isEqualToNumber:@1]) {
        kv = [MMKV mmkvWithID:ID mode:MMKVSingleProcess];
    } else {
        kv = [MMKV mmkvWithID:ID mode:MMKVMultiProcess];
    }
    
    if (![IdStore exists:ID]) {
        
        [mmkvMap setObject:kv forKey:ID];
        [kv setBool:true forKey:ID];
        [IdStore add:ID encrypted:false alias:NULL];
        callback(@[[NSNull null], @YES]);
    } else {
        
        if ([kv containsKey:ID]) {
            [mmkvMap setObject:kv forKey:ID];
            callback(@[[NSNull null]  , @YES ]);
            
        } else {
            [self encryptionHandler:ID mode:mode callback:callback];
        }
        
    }
}

#pragma mark getAllMMKVInstanceIDs
RCT_EXPORT_METHOD(getAllMMKVInstanceIDs:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject ) {
    
    resolve([[IdStore getAll] allKeys]);
}


#pragma mark getCurrentMMKVInstanceIDs
RCT_EXPORT_METHOD(getCurrentMMKVInstanceIDs:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject ) {
    
    resolve([mmkvMap allKeys]);
    
}


#pragma mark setString
RCT_EXPORT_METHOD(setString:(NSString *)ID
                  key:(NSString*)key
                  value:(NSString*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    [StorageSetters setItem:ID key:key type:DATA_TYPE_STRING string:value boolean:false number:NULL map:NULL mmkvMap:mmkvMap callback:callback];
}


#pragma mark getItem
RCT_EXPORT_METHOD(getItem:(NSString *)ID
                  key:(NSString*)key
                  type:(nonnull NSNumber *)type
                  callback:(RCTResponseSenderBlock)callback) {
    
    [StorageGetters getItem:ID key:key type:type mmkvMap:mmkvMap callback:callback];
    
}


#pragma mark setInt
RCT_EXPORT_METHOD(setInt:(NSString *)ID key:(NSString*)key
                  value:(nonnull NSNumber*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    [StorageSetters setItem:ID key:key type:DATA_TYPE_INT string:NULL boolean:false number:value map:NULL mmkvMap:mmkvMap  callback:callback];
    
}


#pragma mark setBool
RCT_EXPORT_METHOD(setBool:(NSString *)ID key:(NSString*)key
                  value:(BOOL *)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    [StorageSetters setItem:ID key:key type:DATA_TYPE_BOOL string:NULL boolean:value number:NULL map:NULL mmkvMap:mmkvMap  callback:callback];
    
}



#pragma mark setMap
RCT_EXPORT_METHOD(setMap:(NSString *)ID key:(NSString*)key
                  value:(NSDictionary*)value
                  isArray:(BOOL *)isArray
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    int type = DATA_TYPE_MAP;
    if (isArray) {
        type = DATA_TYPE_ARRAY;
    }
    [StorageSetters setItem:ID key:key type:type string:NULL boolean:false number:NULL map:value mmkvMap:mmkvMap  callback:callback];
    
}


#pragma mark getMultipleItems
RCT_EXPORT_METHOD(getMultipleItems:(NSString *)ID key:(NSArray*)keys
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    [StorageGetters getMultipleItems:ID key:keys mmkvMap:mmkvMap callback:callback];
    
}

#pragma mark getKeys
RCT_EXPORT_METHOD(getKeys:(NSString *)ID resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        NSArray *array =  kv.allKeys;
        resolve(array);
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}



#pragma mark hasKey
RCT_EXPORT_METHOD(hasKey:(NSString *)ID key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        if ([kv containsKey:key]) {
            resolve(@YES);
        } else {
            resolve(@NO);
        }
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
}




#pragma mark getTypeIndex
RCT_EXPORT_METHOD(getTypeIndex:(NSString *)ID
                  type:(nonnull NSNumber *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        resolve([StorageIndexer getIndex:kv type:type.intValue]);
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
}


#pragma mark typeIndexerHasKey
RCT_EXPORT_METHOD(typeIndexerHasKey:(NSString *)ID key:(NSString*)key
                  type:(nonnull NSNumber *)type
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        NSArray *index = [StorageIndexer getIndex:kv type:type.intValue];
        
        if (index == NULL) {
            resolve(@NO);
            
            return;
        }
        
        if ([index containsObject:key]) {
            resolve(@YES);
        } else {
            resolve(@NO);
        }
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
}




#pragma mark removeItem
RCT_EXPORT_METHOD(removeItem:(NSString *)ID key:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        if ([kv containsKey:key]) {
            [kv removeValueForKey:key];
            [StorageIndexer removeKeyFromIndexer:kv key:key];
            resolve(@YES);
        } else {
            resolve(@NO);
        }
     
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
        [kv clearAll];
        [kv setBool:true forKey:ID];
        resolve(@YES);
        
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
        [kv clearMemoryCache];
        resolve(@YES);
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}


#pragma mark getItemsForType
RCT_EXPORT_METHOD(getItemsForType:(NSString *)ID
                  type:(nonnull NSNumber *)type
                  callback:(RCTResponseSenderBlock)callback) {
    
    [StorageGetters getItemsForType:ID type:type mmkvMap:mmkvMap callback:callback];
}


#pragma mark encrypt
RCT_EXPORT_METHOD(encrypt:(NSString *)ID
                  cryptKey:(NSString *)cryptKey
                  alias:(nullable NSString *)alias
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        [IdStore add:ID encrypted:true alias:alias];
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        [kv setBool:true forKey:ID];
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
        
        [IdStore add:ID encrypted:false alias:NULL];
        MMKV *kv = [mmkvMap objectForKey:ID];
        [kv setBool:true forKey:ID];
        [kv reKey:NULL];
        resolve(@YES);
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark changeEncryptionKey
RCT_EXPORT_METHOD(changeEncryptionKey:(NSString *)ID
                  cryptKey:(NSString *)cryptKey
                  alias:(nullable NSString *)alias
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        [IdStore add:ID encrypted:true alias:alias];
        MMKV *kv = [mmkvMap objectForKey:ID];
        [kv setBool:true forKey:ID];
        NSData *key = [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
        [kv reKey:key];
        resolve(@YES);
        
    } else {
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

#pragma mark setSecureKey
RCT_EXPORT_METHOD(setSecureKey: (NSString *)alias value:(NSString *)value
                  options: (NSDictionary *)options
                  callback:(RCTResponseSenderBlock)callback
                  )
{
    
    [secureStorage setSecureKey:alias value:value options:options callback:callback];
    
}

#pragma mark getSecureKey
RCT_EXPORT_METHOD(getSecureKey:(NSString *)alias
                  callback:(RCTResponseSenderBlock)callback)
{
    
    [secureStorage getSecureKey:alias callback:callback];
    
    
}

#pragma mark secureKeyExists
RCT_EXPORT_METHOD(secureKeyExists:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    
    [secureStorage secureKeyExists:key callback:callback];
    
}
#pragma mark removeSecureKey
RCT_EXPORT_METHOD(removeSecureKey:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    
    [secureStorage removeSecureKey:key callback:callback];
    
}

-(void) encryptionHandler:(NSString *)ID
                     mode:(NSNumber *)mode
                 callback:(nullable RCTResponseSenderBlock)callback   {
    
    MMKV *kv;
    
    if ([IdStore encrypted:ID]) {
        
        NSString *alias = [IdStore getAlias:ID];
        if (alias != NULL) {
            
            if ([secureStorage secureKeyExists:alias callback:NULL]) {
                
                NSData *cryptKey = [[secureStorage getSecureKey:alias callback:NULL] dataUsingEncoding:NSUTF8StringEncoding];
                
                if ([mode isEqualToNumber:@1]) {
                    kv = [MMKV mmkvWithID:ID  cryptKey:cryptKey mode:MMKVSingleProcess];
                } else {
                    kv = [MMKV mmkvWithID:ID  cryptKey:cryptKey mode:MMKVMultiProcess ];
                }
                
                [mmkvMap setObject:kv forKey:ID];
                if (callback != NULL) {
                    
                    callback(@[[NSNull null]  ,@YES  ]);
                }
                
                
            } else {
                if (callback != NULL) {
                    callback(@[@"Wrong Password or database corrupted", [NSNull null] ]);
                }
                
            }
        }
        
    } else {
        
        if ([mode isEqualToNumber:@1]) {
            kv = [MMKV mmkvWithID:ID mode:MMKVSingleProcess];
        } else {
            kv = [MMKV mmkvWithID:ID mode:MMKVMultiProcess];
        }
        [mmkvMap setObject:kv forKey:ID];
        
        if (callback != NULL) {
                         
          callback(@[[NSNull null]  ,@YES  ]);
       }
                    
    }
    
    
    
}

@end

