//
//  Setters.m
//  DoubleConversion
//
//  Created by Ammar Ahmed on 1/14/1399 AP.
//



#import <Foundation/Foundation.h>
#import <MMKV/MMKV.h>

#import <Foundation/Foundation.h>
#import "StorageSetters.h"
#import "StorageIndexer.h"

@implementation StorageSetters : NSObject

 


+(void)setItem:(NSString *)ID
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
            case 1:
                
                [kv setObject:string forKey:key];
                callback(@[[NSNull null], @YES]);
                [StorageIndexer addToStringsIndex:kv key:key];
                
                break;
            case 2:
                
                [kv setInt64:number.intValue forKey:key];
                callback(@[[NSNull null], @YES]);
                [StorageIndexer addToIntIndex:kv key:key];
                
                break;
            case 3:
                
                [kv setBool:boolean forKey:key];
                callback(@[[NSNull null], @YES]);
                [StorageIndexer addToBoolIndex:kv key:key];
                
                break;
            case 4:
                
                [kv setObject:map forKey:key];
                callback(@[[NSNull null], @YES]);
                [StorageIndexer addToMapIndex:kv key:key];
                
                break;
            case 5:
                
                [kv setObject:map forKey:key];
                callback(@[[NSNull null], @YES]);
                [StorageIndexer addToArrayIndex:kv key:key];
                break;
            default:
                break;
        }
        
        
        
    } else {
        callback(@[@"cannot_get", @"database not initialized for the given ID", [NSNull null]]);
        
    }
}

@end
