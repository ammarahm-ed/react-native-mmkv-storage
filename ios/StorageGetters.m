//
//  Setters.m
//  DoubleConversion
//
//  Created by Ammar Ahmed on 1/14/1399 AP.
//




#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <MMKV/MMKV.h>
#import <Foundation/Foundation.h>
#import "StorageGetters.h"
#import "StorageIndexer.h"

@implementation StorageGetters : NSObject





+ (void) getItemAsync:(NSString *)ID
                  key:(NSString*)key
                 type:(nonnull NSNumber *)type
              mmkvMap:(NSDictionary *)mmkvMap
              resolve:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        if ([kv containsKey:key]) {
            
            
            switch (type.integerValue) {
                case 1:
                    
                    resolve([kv getObjectOfClass:NSString.class forKey:key]);
                    break;
                case 2:
                    
                    resolve([NSNumber numberWithUnsignedLongLong:[kv getInt64ForKey:key]]);
                    break;
                case 3:
                    
                    if ([kv getBoolForKey:key]) {
                        resolve(@YES);
                    } else {
                        resolve(@NO);
                    }
                    break;
                case 4:
                    
                    resolve([kv getObjectOfClass:NSDictionary.class forKey:key]);
                    break;
                case 5:
                    
                    resolve([kv getObjectOfClass:NSDictionary.class forKey:key]);
                    break;
                default:
                    break;
            }
            
            
        } else {
            reject(@"cannot_get", @"value for key does not exist", nil);
        }
        
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

+(void) getItem:(NSString *)ID
             key:(NSString*)key
            type:(nonnull NSNumber *)type
         mmkvMap:(NSDictionary *)mmkvMap
        callback:(RCTResponseSenderBlock)callback {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        if ([kv containsKey:key]) {
            switch (type.integerValue) {
                case 1:
                    
                    callback(@[[NSNull null], [kv getObjectOfClass:NSString.class forKey:key]]);
                    break;
                case 2:
                    
                    callback(@[[NSNull null], [NSNumber numberWithUnsignedLongLong:[kv getInt64ForKey:key]]]);
                    break;
                case 3:
                    
                    if ([kv getBoolForKey:key]) {
                        callback(@[[NSNull null], @YES]);
                    } else {
                        callback(@[[NSNull null], @NO]);
                    }
                    break;
                case 4:
                    callback(@[[NSNull null], [kv getObjectOfClass:NSDictionary.class forKey:key]]);
                    
                    break;
                case 5:
                    
                    callback(@[[NSNull null], [kv getObjectOfClass:NSDictionary.class forKey:key]]);
                    
                    break;
                default:
                    break;
            }
            
            
        } else {
            callback(@[@"Value for key does not exist", [NSNull null]]);
            
        }
        
        
    } else {
        callback(@[@"database not initialized for the given ID", [NSNull null]]);
        
    }
}


+(void) getMultipleItemsAsync:(NSString *)ID key:(NSArray*)keys
                       mmkvMap:(NSDictionary *)mmkvMap
                       resolve:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject
{
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        
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
        
        
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

+(void)getMultipleItems:(NSString *)ID key:(NSArray*)keys
                 mmkvMap:(NSDictionary *)mmkvMap
                callback:(RCTResponseSenderBlock)callback
{
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        
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
        
    } else {
        callback(@[[NSNull null], @"database not initialized for the given ID"]);
    }
    
}

-(void)getAllItemsForTypeAsync:(NSString *)ID
                          type:(nonnull NSNumber *)type
                       mmkvMap:(NSDictionary *)mmkvMap
                       resolve:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        switch (type.integerValue) {
            case 1:
                
                resolve([StorageIndexer getAllStrings:kv]);
                
                break;
            case 2:
                
                resolve([StorageIndexer getAllInts:kv]);
                
                break;
            case 3:
                
                resolve([StorageIndexer getAllBooleans:kv]);
                
                break;
            case 4:
                
                resolve([StorageIndexer getAllMaps:kv]);
                
                break;
            case 5:
                
                resolve([StorageIndexer getAllArrays:kv]);
                
                break;
            default:
                break;
        }
        
        
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}


-(void)getAllItemsForType:(NSString *)ID
                     type:(nonnull NSNumber *)type
                  mmkvMap:(NSDictionary *)mmkvMap
                 callback:(RCTResponseSenderBlock)callback {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        
        switch (type.integerValue) {
            case 1:
                
                callback(@[[NSNull null], [StorageIndexer getAllStrings:kv]]);
                
                break;
            case 2:
                
                callback(@[[NSNull null], [StorageIndexer getAllInts:kv]]);
                
                break;
            case 3:
                 
                callback(@[[NSNull null], [StorageIndexer getAllBooleans:kv]]);
                
                break;
            case 4:
                callback(@[[NSNull null], [StorageIndexer getAllMaps:kv]]);
                
                break;
            case 5:
                
                callback(@[[NSNull null], [StorageIndexer getAllArrays:kv]]);
                
                break;
            default:
                break;
        }
        
        
    } else {
        callback(@[@"database not initialized for the given ID", [NSNull null]]);
        
    }
}



@end
