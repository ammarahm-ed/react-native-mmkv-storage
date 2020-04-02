//
//  NSObject+IDStore.m
//  DoubleConversion
//
//  Created by Ammar Ahmed on 1/10/1399 AP.
//


#import "IDStore.h"
#import <MMKV/MMKV.h>

@implementation IDStore: NSObject

MMKV *store;

NSString *storeId = @"mmkvIdStore";


- (id) initWithMMKV:(MMKV *)kv{
    
    self = [super init];
    store = kv;
    
    return self;
}



- (void)add:(NSString *)ID {
    
    bool hasKey = [store containsKey:storeId];
    
    if (hasKey) {
        
        NSMutableArray *mmkvStore = [store getObjectOfClass:NSMutableArray.class forKey:storeId];
        [mmkvStore addObject:ID];
        [store setObject:mmkvStore forKey:storeId];
    } else {
        NSMutableArray *mmkvStore = [NSMutableArray array];
        [mmkvStore addObject:ID];
        [store setObject:mmkvStore forKey:storeId];
    }

}

- (NSMutableArray *)getAll {
    bool hasKey = [store containsKey:storeId];
    if (hasKey) {
        
        return [store getObjectOfClass:NSMutableArray.class forKey:storeId];
        
    } else {
        
        return NULL;
    }
}

-(bool)exists:(NSString *)ID {
    
     bool hasKey = [store containsKey:storeId];
    
    if (hasKey) {
        NSMutableArray *mmkvStore = [store getObjectOfClass:NSMutableArray.class forKey:storeId];
        
        return [mmkvStore containsObject:ID];
        
    } else {
        return false;
    }
    
    
}


@end
