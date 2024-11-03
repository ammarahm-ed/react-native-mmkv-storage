
#ifdef RCT_NEW_ARCH_ENABLED
#import "MMKVStorageSpec.h"
@interface MMKVStorage : NSObject <NativeMMKVStorageSpec>
@property (nonatomic, assign) BOOL setBridgeOnMainQueue;
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface MMKVStorage : NSObject <RCTBridgeModule>

@property (nonatomic, assign) BOOL setBridgeOnMainQueue;
#endif
@end
  

