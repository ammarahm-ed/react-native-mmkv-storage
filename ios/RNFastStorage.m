
#import "RNFastStorage.h"
#import <MMKV/MMKV.h>

@implementation RNFastStorage

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

#pragma mark setString
RCT_EXPORT_METHOD(setString:(NSString*)key
                  value:(NSString*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.setString", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                [mmkv setObject:value forKey:key];
                resolve(@YES);
            }
            @catch (NSException *exception) {
                reject(@"cannot_set", @"Cannot set string", nil);
            }
            
        });
    });
}

#pragma mark getString
RCT_EXPORT_METHOD(getString:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.getString", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                resolve([mmkv getObjectOfClass:NSString.class forKey:key]);
            }
            @catch (NSException *exception) {
                reject(@"cannot_get", exception.reason, nil);
            }
            
        });
    });
}

#pragma mark setInt
RCT_EXPORT_METHOD( setInt:(NSString*)key
                  value:(nonnull NSNumber*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.setString", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                [mmkv setObject:value forKey:key];
                resolve(@YES);
            }
            @catch (NSException *exception) {
                reject(@"cannot_set", @"Cannot set int value", nil);
            }
            
        });
    });
}

#pragma mark getInt
RCT_EXPORT_METHOD(getInt:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.getString", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                
                resolve([mmkv getObjectOfClass:NSNumber.class forKey:key]);
            }
            @catch (NSException *exception) {
                reject(@"cannot_get", exception.reason, nil);
            }
            
        });
    });
}

#pragma mark setBool
RCT_EXPORT_METHOD(setBool:(NSString*)key
                  value:(BOOL *)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.setString", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                [mmkv setBool:value forKey:key];
                resolve(@YES);
            }
            @catch (NSException *exception) {
                reject(@"cannot_set", @"Cannot set bool value", nil);
            }
            
        });
    });
}

#pragma mark getBool
RCT_EXPORT_METHOD(getBool:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.getString", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                
                
                bool boolValue =  [mmkv getBoolForKey:key];
                if (boolValue) {
                    resolve(@YES);
                } else {
                    resolve(@NO);
                }
                
            }
            @catch (NSException *exception) {
                reject(@"cannot_get", exception.reason, nil);
            }
            
        });
    });
}




#pragma mark setMap
RCT_EXPORT_METHOD(setMap:(NSString*)key
                  value:(NSDictionary*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.setMap", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                
                
                
                [mmkv setObject:value forKey:key];
                
                resolve(@YES);
            }
            @catch (NSException *exception) {
                reject(@"cannot_set", @"Cannot set Map", nil);
            }
            
        });
    });
}

#pragma mark getMap
RCT_EXPORT_METHOD(getMap:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.getMap", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                bool hasBool = [mmkv containsKey:key];
                if (hasBool) {
                    NSDictionary* data = [mmkv getObjectOfClass:NSDictionary.class forKey:key];
                    resolve(data);
                } else {
                    resolve(@NO);
                }
                
                
                
            }
            @catch (NSException *exception) {
                reject(@"cannot_set", @"Cannot get Map", nil);
            }
            
        });
    });
}

#pragma mark getMultipleItems
RCT_EXPORT_METHOD(getMultipleItems:(NSArray*)keys
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.getMultipleItems", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                NSMutableArray * myArray = [NSMutableArray array];
                for (NSString* key in keys)
                {
                    bool hasBool = [mmkv containsKey:key];
                    if (hasBool) {
                        
                        NSDictionary* dic = [mmkv getObjectOfClass:NSDictionary.class forKey:key];
                        NSMutableArray * array = [NSMutableArray array];
                        [array addObject:key];
                        [array addObject:dic];
                        [myArray addObject:array];
                        
                    } else {
                        resolve(@NO);
                    }
                    
                }
                resolve(myArray);
            }
            @catch (NSException *exception) {
                reject(@"cannot_get", @"Cannot get multiple Items", nil);
            }
            
        });
    });
}

#pragma mark hasKey
RCT_EXPORT_METHOD(hasKey:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.setItem", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                bool hasBool = [mmkv containsKey:key];
                if (hasBool) {
                    resolve(@YES);
                } else {
                    resolve(@NO);
                }
            }
            @catch (NSException *exception) {
                reject(@"cannot_get", exception.reason, nil);
            }
            
        });
    });
}



#pragma mark removeItem
RCT_EXPORT_METHOD(removeItem:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.removeItem", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                [mmkv removeValueForKey:key];
                resolve(@"");
            }
            @catch (NSException *exception) {
                reject(@"cannot_get", exception.reason, nil);
            }
            
        });
    });
}

#pragma mark clearStore
RCT_EXPORT_METHOD(clearStore:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.clearStore", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                [mmkv clearAll];
                resolve(@"");
            }
            @catch (NSException *exception) {
                reject(@"cannot_get", exception.reason, nil);
            }
            
        });
    });
}


@end

