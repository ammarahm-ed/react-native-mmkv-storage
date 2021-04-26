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

@end

