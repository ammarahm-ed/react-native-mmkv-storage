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
NSString *storeData = @"mmkvIdData";

- (id) initWithMMKV:(MMKV *)kv{
    
    self = [super init];
    store = kv;
    
    return self;
}



- (void)add:(NSString *)ID
  encrypted:(bool)encrypted
      alias:(NSString *)alias
{
    
    
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    
    if ([store containsKey:storeData]) {
        dic = [store getObjectOfClass:NSMutableDictionary.class forKey:storeData];
    }
    
    NSMutableDictionary *properties = [NSMutableDictionary dictionary];
    
    [properties setValue:[NSNumber numberWithBool:encrypted] forKey:@"encrypted"];
    
    
    [properties setValue:alias forKey:@"alias"];
    
    
    [properties setValue:ID forKey:@"id"];
    [dic setObject:properties forKey:ID];
    
    [store setObject:dic forKey:storeData];
    
}

- (bool) encrypted:(NSString *)ID {
    
    NSMutableDictionary *dic = [store getObjectOfClass:NSMutableDictionary.class forKey:storeData];
    
    NSMutableDictionary *properties = [dic objectForKey:ID];
    
    return [[properties valueForKey:@"encrypted"] boolValue];
    
    
}

- (NSString *) getAlias:(NSString *)ID {
    
    NSMutableDictionary *dic = [store getObjectOfClass:NSMutableDictionary.class forKey:storeData];
    
    NSMutableDictionary *properties = [dic objectForKey:ID];
    
    return [properties valueForKey:@"alias"];
}

- (NSMutableDictionary *) getProperties:(NSString *)ID {
    
    NSMutableDictionary *dic = [store getObjectOfClass:NSMutableDictionary.class forKey:storeData];
    
    return [dic objectForKey:ID];
}



- (NSMutableDictionary *)getAll {
    if ([store containsKey:storeData]) {
        
        return [store getObjectOfClass:NSMutableDictionary.class forKey:storeData];
        
    } else {
        
        return NULL;
    }
}



-(bool)exists:(NSString *)ID {
    
    bool hasKey = [store containsKey:storeData];
    
    if (hasKey) {
           NSMutableDictionary *mmkvStore = [store getObjectOfClass:NSMutableDictionary.class forKey:storeData];
        
        return [[mmkvStore allKeys] containsObject:ID];
        
    } else {
        return false;
    }
    
}


@end
