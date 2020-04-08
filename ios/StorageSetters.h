//
//  Header.h
//  Pods
//
//  Created by Ammar Ahmed on 1/14/1399 AP.
//


#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <Foundation/Foundation.h>

@interface StorageSetters : NSObject


+(void) setItem:(nonnull NSString *)ID
             key:(nonnull NSString*)key
            type:(int)type
          string:(nullable NSString *)string
         boolean:(bool)boolean
          number:(nullable NSNumber *)number
             map:(nullable NSDictionary *)map
         mmkvMap:(nullable NSDictionary *)mmkvMap
        callback:(nonnull RCTResponseSenderBlock)callback;


@end
