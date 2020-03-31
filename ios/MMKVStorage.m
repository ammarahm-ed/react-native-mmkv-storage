
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


