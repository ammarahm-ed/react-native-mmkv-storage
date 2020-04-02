#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif


@interface Getters : NSObject

- (void) getItemAsync:(nonnull NSString *)ID
                  key:(nonnull NSString*)key
                 type:(nonnull NSNumber *)type
              mmkvMap:(nullable NSDictionary *)mmkvMap
              resolve:(nonnull RCTPromiseResolveBlock)resolve
             rejecter:(nonnull RCTPromiseRejectBlock)reject;

- (void) getItem:(nonnull NSString *)ID
             key:(nonnull NSString*)key
            type:(nonnull NSNumber *)type
         mmkvMap:(nullable NSDictionary *)mmkvMap
        callback:(nonnull RCTResponseSenderBlock)callback;

- (void) getMultipleItemsAsync:(nonnull NSString *)ID key:(nonnull NSArray*)keys
                       mmkvMap:(nonnull NSDictionary *)mmkvMap
                       resolve:(nonnull RCTPromiseResolveBlock)resolve
                      rejecter:(nonnull RCTPromiseRejectBlock)reject;

- (void)getMultipleItems:(nonnull NSString *)ID key:(nonnull NSArray*)keys
                 mmkvMap:(nonnull NSDictionary *)mmkvMap
                callback:(nonnull RCTResponseSenderBlock)callback;

-(void)getAllItemsForTypeAsync:(nonnull NSString *)ID
                          type:(nonnull NSNumber *)type
                       mmkvMap:(nonnull NSDictionary *)mmkvMap
                       resolve:(nonnull RCTPromiseResolveBlock)resolve
                      rejecter:(nonnull RCTPromiseRejectBlock)reject;

-(void)getAllItemsForType:(nonnull NSString *)ID
                     type:(nonnull NSNumber *)type
                  mmkvMap:(nonnull NSDictionary *)mmkvMap
                 callback:(nonnull RCTResponseSenderBlock)callback;


@end

