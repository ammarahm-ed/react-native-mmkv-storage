#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif


@interface StorageGetters : NSObject


+(void) getItem:(nonnull NSString *)ID
             key:(nonnull NSString*)key
            type:(nonnull NSNumber *)type
         mmkvMap:(nullable NSDictionary *)mmkvMap
        callback:(nonnull RCTResponseSenderBlock)callback;

+(void)getMultipleItems:(nonnull NSString *)ID key:(nonnull NSArray*)keys
                 mmkvMap:(nonnull NSDictionary *)mmkvMap
                callback:(nonnull RCTResponseSenderBlock)callback;


+ (void)getItemsForType:(nonnull NSString *)ID
                     type:(nonnull NSNumber *)type
                  mmkvMap:(nonnull NSDictionary *)mmkvMap
                 callback:(nonnull RCTResponseSenderBlock)callback;


@end

