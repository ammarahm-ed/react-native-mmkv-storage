
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif
#import <React/RCTBridgeDelegate.h>

@interface MMKVStorage : NSObject <RCTBridgeModule, RCTBridgeDelegate>

- (instancetype)init:(NSString *)appID bundleURL:(NSURL *)bundleURL;

@end
  
