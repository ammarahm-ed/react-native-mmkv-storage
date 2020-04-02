//
//  Setters.m
//  DoubleConversion
//
//  Created by Ammar Ahmed on 1/14/1399 AP.
//

#import <Foundation/Foundation.h>
#import <MMKV/MMKV.h>

#import <Foundation/Foundation.h>
#import "Setters.h"
#import "Constants.h"
#import "StorageIndexer.h";
@implementation Setters : NSObject

StorageIndexer *indexer;

- (instancetype)init
{
    self = [super init];
    if (self) {
        indexer = [[StorageIndexer init] alloc];
    }
    return self;
}


- (void)setItemAsync:(NSString *)ID
                 key:(NSString*)key
                type:(int)type
              string:(nullable NSString *)string
             boolean:(bool)boolean
              number:(nullable NSNumber *)number
                 map:(nullable NSDictionary *)map
             mmkvMap:(NSDictionary *)mmkvMap
             resolve:(RCTPromiseResolveBlock)resolve
            rejecter:(RCTPromiseRejectBlock)reject
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
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
        mmkvMap:(NSDictionary *)mmkvMap
       callback:(RCTResponseSenderBlock)callback
{
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
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
        
        
        
    } else {
        callback(@[@"cannot_get", @"database not initialized for the given ID", [NSNull null]]);
        
    }
}

@end
