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
#import "Getters.h"
#import "StorageIndexer.h"

@implementation Getters : NSObject

const int DATA_TYPE_STRING = 1;

const  int DATA_TYPE_INT = 2;

const  int DATA_TYPE_BOOL = 3;

const  int DATA_TYPE_MAP = 4;

const  int DATA_TYPE_ARRAY = 5;

StorageIndexer *indexer;

- (instancetype)init
{
    self = [super init];
    if (self) {
        indexer = [[StorageIndexer init] alloc];
    }
    return self;
}


- (void) getItemAsync:(NSString *)ID
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
        
        
    } else {
        
        reject(@"cannot_get", @"database not initialized for the given ID", nil);
    }
    
}

- (void) getItem:(NSString *)ID
             key:(NSString*)key
            type:(nonnull NSNumber *)type
         mmkvMap:(NSDictionary *)mmkvMap
        callback:(RCTResponseSenderBlock)callback {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        
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
        
        
    } else {
        callback(@[@"database not initialized for the given ID", [NSNull null]]);
        
    }
}


- (void) getMultipleItemsAsync:(NSString *)ID key:(NSArray*)keys
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

- (void)getMultipleItems:(NSString *)ID key:(NSArray*)keys
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
        
        
    } else {
        callback(@[@"database not initialized for the given ID", [NSNull null]]);
        
    }
}



@end
