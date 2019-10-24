
#import "RNFastStorage.h"
#import <MMKV/MMKV.h>

@implementation RNFastStorage

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

#pragma mark setItem
RCT_EXPORT_METHOD(setItem:(NSString*)key
                  value:(NSString*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.setItem", 0), ^{
        MMKV *mmkv = [MMKV defaultMMKV];
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                [mmkv setObject:value forKey:key];
                resolve(value);
            }
            @catch (NSException *exception) {
                reject(@"cannot_set", @"Cannot set item", nil);
            }
       
        });
    });
}

#pragma mark getItem
RCT_EXPORT_METHOD(getItem:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(dispatch_queue_create("FastStorage.getItem", 0), ^{
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
  
