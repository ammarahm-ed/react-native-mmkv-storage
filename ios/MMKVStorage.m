#import "MMKVStorage.h"
#import "SecureStorage.h"

#import <React/RCTUtils.h>


@implementation MMKVStorage

SecureStorage *secureStorage;

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (id)init
{
    self = [super init];
    if (self) {
        secureStorage = [[SecureStorage alloc]init];
    }

    return self;
}

#pragma mark setSecureKey
RCT_EXPORT_METHOD(setSecureKey: (NSString *)alias value:(NSString *)value
                  options: (NSDictionary *)options
                  callback:(RCTResponseSenderBlock)callback
                  )
{
    
    [secureStorage setSecureKey:alias value:value options:options callback:callback];
    
}

#pragma mark getSecureKey
RCT_EXPORT_METHOD(getSecureKey:(NSString *)alias
                  callback:(RCTResponseSenderBlock)callback)
{
    
    [secureStorage getSecureKey:alias callback:callback];
    
    
}

#pragma mark secureKeyExists
RCT_EXPORT_METHOD(secureKeyExists:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    
    [secureStorage secureKeyExists:key callback:callback];
    
}
#pragma mark removeSecureKey
RCT_EXPORT_METHOD(removeSecureKey:(NSString *)key
                  callback:(RCTResponseSenderBlock)callback)
{
    
    [secureStorage removeSecureKey:key callback:callback];
    
}

@end

