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




+(void) getItem:(NSString *)ID
            key:(NSString*)key
           type:(nonnull NSNumber *)type
        mmkvMap:(NSDictionary *)mmkvMap
       callback:(RCTResponseSenderBlock)callback {
    
    if ([[mmkvMap allKeys] containsObject:ID]) {
        
        
        MMKV *kv = [mmkvMap objectForKey:ID];
        NSString *string;
        NSDictionary *dic;
        NSNumber *num;
        
        if ([kv containsKey:key]) {
            switch (type.integerValue) {
                case 1:
                    string =[kv getObjectOfClass:NSString.class forKey:key];
                    
                    callback(@[[NSNull null], string? string : [NSNull null]]);
                    break;
                case 2:
                    num =[NSNumber numberWithUnsignedLongLong:[kv getInt64ForKey:key]];
                    callback(@[[NSNull null],num? num : [NSNull null] ]);
                    break;
                case 3:
                    
                    if ([kv getBoolForKey:key]) {
                        callback(@[[NSNull null], @YES]);
                    } else {
                        callback(@[[NSNull null], @NO]);
                    }
                    break;
                case 4:
                    dic =  [kv getObjectOfClass:NSDictionary.class forKey:key];
                    callback(@[[NSNull null],dic? dic : [NSNull null]]);
                    
                    break;
                case 5:
                    
                     dic =  [kv getObjectOfClass:NSDictionary.class forKey:key];
                     callback(@[[NSNull null],dic? dic : [NSNull null]]);
                    
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



+(void)getItemsForType:(NSString *)ID
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
