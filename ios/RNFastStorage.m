
#import "RNFastStorage.h"
#import <MMKV/MMKV.h>

@implementation RNFastStorage



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



RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
    return RCTGetMethodQueue();
}


#pragma mark setupLibrary
RCT_EXPORT_METHOD(setupLibrary) {
    
    [MMKV initialize];
    mmkv = [MMKV defaultMMKV];
    
}


#pragma mark setStringAsync
RCT_EXPORT_METHOD(setStringAsync:(NSString*)key
                  value:(NSString*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    
    dispatch_async(RCTGetMethodQueue(), ^{
        
        [mmkv setObject:value forKey:key];
        resolve(@YES);
        
    });
}

#pragma mark setString
RCT_EXPORT_METHOD(setString:(NSString*)key
                  value:(NSString*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    
    dispatch_async(RCTGetMethodQueue(), ^{
        
        [mmkv setObject:value forKey:key];
        NSMutableArray *array = [NSMutableArray array];
        [array addObject:@YES];
        callback(array);
        
    });
}





#pragma mark getStringAsync
RCT_EXPORT_METHOD(getStringAsync:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([mmkv containsKey:key]) {
            resolve([mmkv getObjectOfClass:NSString.class forKey:key]);
        } else {
            reject(@"cannot_get", @"value for key does not exist", nil);
        }
        
        
        
    });
}

#pragma mark getString
RCT_EXPORT_METHOD(getString:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([mmkv containsKey:key]) {
            NSString *string =[mmkv getObjectOfClass:NSString.class forKey:key];
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:string];
            callback(array);
        } else {
            NSDictionary *dic = [NSDictionary dictionary];
            [dic setValue:@"Value for key does not exist" forKey:@"Error"];
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:dic];
            callback(array);
        }
        
    });
}



#pragma mark setIntAsync
RCT_EXPORT_METHOD(setIntAsync:(NSString*)key
                  value:(nonnull NSNumber*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        [mmkv setInt64:value.intValue forKey:key];
        resolve(@YES);
        
        
        
    });
    
    
    
}

#pragma mark setInt
RCT_EXPORT_METHOD(setInt:(NSString*)key
                  value:(nonnull NSNumber*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        [mmkv setInt64:value.intValue forKey:key];
        NSMutableArray *array = [NSMutableArray array];
        [array addObject:@YES];
        callback(array);
        
    });
    
}

#pragma mark getIntAsync
RCT_EXPORT_METHOD(getIntAsync:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([mmkv containsKey:key]) {
            int64_t val = [mmkv getInt64ForKey:key];
            NSNumber *number = [NSNumber numberWithUnsignedLongLong:val];
            resolve(number);
        } else {
            reject(@"cannot_get", @"value for key does not exist", nil);
        }
        
    });
    
}

#pragma mark getInt
RCT_EXPORT_METHOD(getInt:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([mmkv containsKey:key]) {
            int64_t val = [mmkv getInt64ForKey:key];
            NSNumber *number = [NSNumber numberWithUnsignedLongLong:val];
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:number];
            callback(array);
        } else {
            NSDictionary *dic = [NSDictionary dictionary];
            [dic setValue:@"Value for key does not exist" forKey:@"Error"];
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:dic];
            callback(array);
        }
        
    });
    
}


#pragma mark setBoolAsync
RCT_EXPORT_METHOD(setBoolAsync:(NSString*)key
                  value:(BOOL *)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        [mmkv setBool:value forKey:key];
        resolve(@YES);
        
        
    });
    
    
    
    
}

#pragma mark setBool
RCT_EXPORT_METHOD(setBool:(NSString*)key
                  value:(BOOL *)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        [mmkv setBool:value forKey:key];
        NSMutableArray *array = [NSMutableArray array];
        [array addObject:@YES];
        callback(array);
        
    });
    
}

#pragma mark getBoolAsync
RCT_EXPORT_METHOD(getBoolAsync:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        if ([mmkv containsKey:key]) {
            
            
            bool boolValue =  [mmkv getBoolForKey:key];
            if (boolValue) {
                resolve(@YES);
            } else {
                resolve(@NO);
            }
            
        } else {
            reject(@"cannot_get", @"value for key does not exist", nil);
        }
        
    });
    
}

#pragma mark getBool
RCT_EXPORT_METHOD(getBool:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        if ([mmkv containsKey:key]) {
            bool boolValue =  [mmkv getBoolForKey:key];
            NSMutableArray *array = [NSMutableArray array];
            
            if (boolValue) {
                [array addObject:@YES];
            } else {
                [array addObject:@NO];
            }
            
            callback(array);
        } else {
            NSDictionary *dic = [NSDictionary dictionary];
            [dic setValue:@"Value for key does not exist" forKey:@"Error"];
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:dic];
            callback(array);
        }
        
    });
    
}


#pragma mark setMapAsync
RCT_EXPORT_METHOD(setMapAsync:(NSString*)key
                  value:(NSDictionary*)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        [mmkv setObject:value forKey:key];
        resolve(@YES);
        
    });
}

#pragma mark setMap
RCT_EXPORT_METHOD(setMap:(NSString*)key
                  value:(NSDictionary*)value
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        [mmkv setObject:value forKey:key];
        NSMutableArray *array = [NSMutableArray array];
        [array addObject:@YES];
        callback(array);
        
    });
}




#pragma mark getMapAsync
RCT_EXPORT_METHOD(getMapAsync:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([mmkv containsKey:key]) {
            NSDictionary* data = [mmkv getObjectOfClass:NSDictionary.class forKey:key];
            resolve(data);
        } else {
            reject(@"cannot_get", @"value for key does not exist", nil);
        }
        
    });
}

#pragma mark getMap
RCT_EXPORT_METHOD(getMap:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        if ([mmkv containsKey:key]) {
            NSDictionary *data = [mmkv getObjectOfClass:NSDictionary.class forKey:key];
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:data];
            callback(array);
        } else {
            NSDictionary *dic = [NSDictionary dictionary];
            [dic setValue:@"Value for key does not exist" forKey:@"Error"];
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:dic];
            callback(array);
        }
    });
}



#pragma mark getMultipleItemsAsync
RCT_EXPORT_METHOD(getMultipleItemsAsync:(NSArray*)keys
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        NSMutableArray * myArray = [NSMutableArray array];
        for (NSString* key in keys)
        {
            
            if ([mmkv containsKey:key]) {
                
                NSDictionary* dic = [mmkv getObjectOfClass:NSDictionary.class forKey:key];
                NSMutableArray * array = [NSMutableArray array];
                [array addObject:key];
                [array addObject:dic];
                [myArray addObject:array];
                
                
            } else {
                NSMutableArray * array = [NSMutableArray array];
                [array addObject:key];
                [array addObject:@"value for key does not exist"];
                [myArray addObject:array];
            }
            resolve(myArray);
            
        }
        
    });
}

#pragma mark getMultipleItems
RCT_EXPORT_METHOD(getMultipleItems:(NSArray*)keys
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        
        NSMutableArray * myArray = [NSMutableArray array];
        for (NSString* key in keys)
        {
            
            if ([mmkv containsKey:key]) {
                
                NSDictionary* dic = [mmkv getObjectOfClass:NSDictionary.class forKey:key];
                NSMutableArray * array = [NSMutableArray array];
                [array addObject:key];
                [array addObject:dic];
                [myArray addObject:array];
                
                
            } else {
                NSMutableArray * array = [NSMutableArray array];
                [array addObject:key];
                [array addObject:@"value for key does not exist"];
                [myArray addObject:array];
            }
            NSMutableArray *array = [NSMutableArray array];
            [array addObject:myArray];
            callback(array);
            
        }
        
    });
}


#pragma mark getKeysAsync
RCT_EXPORT_METHOD(getKeysAsync:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *array =  mmkv.allKeys;
    resolve(array);
}

#pragma mark getKeys
RCT_EXPORT_METHOD(callback:(RCTResponseSenderBlock)callback) {
    NSMutableArray *event = [NSMutableArray array];
    NSArray *array =  mmkv.allKeys;
    [event addObject:array];
    callback(event);
    
}


#pragma mark hasKeyAsync
RCT_EXPORT_METHOD(hasKeyAsync:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([mmkv containsKey:key]) {
            resolve(@YES);
        } else {
            resolve(@NO);
        }
        
    });
}

#pragma mark hasKey
RCT_EXPORT_METHOD(hasKey:(NSString*)key
                  callback:(RCTResponseSenderBlock)callback
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        NSMutableArray *array = [NSMutableArray array];
        
        if ([mmkv containsKey:key]) {
            [array addObject:@YES];
        } else {
            [array addObject:@NO];
        }
        callback(array);
        
    });
}



#pragma mark removeItem
RCT_EXPORT_METHOD(removeItem:(NSString*)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        if ([mmkv containsKey:key]) {
            [mmkv removeValueForKey:key];
        } else {
            resolve(@NO);
        }
        
        
        resolve(@YES);
        
    });
}

#pragma mark clearStore
RCT_EXPORT_METHOD(clearStore:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  ) {
    dispatch_async(RCTGetMethodQueue(), ^{
        
        [mmkv clearAll];
        resolve(@YES);
        
    });
}


@end


