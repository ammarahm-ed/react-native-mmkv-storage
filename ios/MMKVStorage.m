
#import "MMKVStorage.h"
#import <MMKV/MMKV.h>

#import "SecureStorage.h"
#import "IDStore.h"
#import "StorageIndexer.h"
@implementation MMKVStorage

static dispatch_queue_t RCTGetMethodQueue()
{
    // All instances will share the same queue.
    static dispatch_queue_t queue;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        queue = dispatch_queue_create("FastStorage.Queue", DISPATCH_QUEUE_SERIAL);
    });
    return queue;
}

MMKV *mmkv;

SecureStorage *secureStorage;
IDStore *IdStore;
StorageIndexer *indexer;
NSMutableDictionary *mmkvMap;

NSString *serviceName;

NSString *defaultStorage = @"default";

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
    return RCTGetMethodQueue();
}

- (id)init
{
    self = [super init];
    if (self) {
        [MMKV initialize];
        secureStorage = [[SecureStorage alloc]init];
        IdStore = [[IDStore alloc] initWithMMKV:[MMKV mmkvWithID:@"mmkvIdStore"]];
        
        indexer = [[StorageIndexer alloc] init];
        mmkvMap = [NSMutableDictionary dictionary];
        
    }
    
    return self;
}




@end


