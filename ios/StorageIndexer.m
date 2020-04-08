

#import "StorageIndexer.h"
#import <MMKV/MMKV.h>

@implementation StorageIndexer: NSObject

NSString *stringsIndexKey = @"stringsIndex";
NSString *intIndexKey = @"intIndex";
NSString *mapIndexKey = @"mapIndex";
NSString *boolIndexKey = @"boolIndex";
NSString *arrayIndexKey = @"arrayIndex";


+ (nullable NSMutableArray *)getIndex:(MMKV *)kv
                                 type:(int)type


{
    NSMutableArray *index = [NSMutableArray array];
    
    switch (type) {
        case 1:
            index = [kv getObjectOfClass:NSMutableArray.class forKey:stringsIndexKey];
            break;
        case 2:
            index = [kv getObjectOfClass:NSMutableArray.class forKey:intIndexKey];
            break;
        case 3:
            index = [kv getObjectOfClass:NSMutableArray.class forKey:boolIndexKey];
            
            break;
        case 4:
            index = [kv getObjectOfClass:NSMutableArray.class forKey:mapIndexKey];
            break;
        case 5:
            index = [kv getObjectOfClass:NSMutableArray.class forKey:arrayIndexKey];
            break;
            
        default:
            break;
    }
    
    if (index != NULL) {
        return index;
    } else {
        return NULL;
    }
    
}

+ (void) removeKeyFromIndexer:(MMKV *)kv
                          key:(NSString *)key
{
    
    NSMutableArray *index = [self getIndex:kv type:1];
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:stringsIndexKey];
        return;
    }
    
    index = [self getIndex:kv type:2];
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:intIndexKey];
        return;
    }
    
    index = [self getIndex:kv type:3];
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:boolIndexKey];
        return;
    }
    
    index = [self getIndex:kv type:4];
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:mapIndexKey];
        return;
    }
    
    index = [self getIndex:kv type:5];
    
    if (index != NULL && [index containsObject:key]) {
        
        [index removeObject:key];
        [kv setObject:index forKey:arrayIndexKey];
        return;
    }
    
}


+(void)addToStringsIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *stringsIndex = [NSMutableArray array];
    
    if ([kv containsKey:stringsIndexKey]) {
        stringsIndex = [kv getObjectOfClass:NSMutableArray.class forKey:stringsIndexKey];
    }
    if (![stringsIndex containsObject:key]){
        [stringsIndex  addObject:key];
        [kv setObject:stringsIndex forKey:stringsIndexKey];
    }
    
}


+ (nullable NSMutableArray *)getAllStrings:(MMKV *)kv {
    
    NSMutableArray *stringsIndex = [NSMutableArray array];
    stringsIndex = [kv getObjectOfClass:NSMutableArray.class forKey:stringsIndexKey];
    
    if (stringsIndex == NULL) return NULL;
    
    NSMutableArray *array = [NSMutableArray array];
    
    for (NSString *key in stringsIndex) {
        
        NSString *string = [kv getStringForKey:key];
        NSMutableArray *child = [NSMutableArray array];
        [child addObject:key];
        [child addObject:string];
        [array addObject:child];
    }
    
    return array;
    
}

+(void)addToBoolIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *boolIndex = [NSMutableArray array];
    
    if ([kv containsKey:boolIndexKey]) {
        boolIndex = [kv getObjectOfClass:NSMutableArray.class forKey:boolIndexKey];
        
    }
    if (![boolIndex containsObject:key]) {
        [boolIndex  addObject:key];
        [kv setObject:boolIndex forKey:boolIndexKey];
    }
}



+ (nullable NSMutableArray *)getAllBooleans:(MMKV *)kv {
    
    NSMutableArray *boolIndex = [NSMutableArray array];
    boolIndex = [kv getObjectOfClass:NSMutableArray.class forKey:boolIndexKey];
    
    if (boolIndex == NULL) return NULL;
    
    NSMutableArray *array = [NSMutableArray array];
    
    for (NSString *key in boolIndex) {
        
        BOOL value = [kv getBoolForKey:key];
        
        NSMutableArray *child = [NSMutableArray array];
        [child addObject:key];
        if (value) {
            [child addObject:@YES];
        } else {
            [child addObject:@NO];
        }
        
        [array addObject:child];
    }
    
    return array;
    
}


+(void)addToIntIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *intIndex = [NSMutableArray array];
    
    if ([kv containsKey:intIndexKey]) {
        intIndex = [kv getObjectOfClass:NSMutableArray.class forKey:intIndexKey];
    }
    if (![intIndex containsObject:key]) {
        [intIndex  addObject:key];
        [kv setObject:intIndex forKey:intIndexKey];
    }
    
}


+ (nullable NSMutableArray *)getAllInts:(MMKV *)kv {
    
    NSMutableArray *intIndex = [NSMutableArray array];
    intIndex = [kv getObjectOfClass:NSMutableArray.class forKey:intIndexKey];
    
    if (intIndex == NULL) return NULL;
    
    NSMutableArray *array = [NSMutableArray array];
    
    for (NSString *key in intIndex) {
        
        int64_t value = [kv getInt64ForKey:key];
        NSMutableArray *child = [NSMutableArray array];
        [child addObject:key];
        [child addObject:[NSNumber numberWithLongLong:value]];
        [array addObject:child];
    }
    
    return array;
    
}


+(void)addToMapIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *mapIndex = [NSMutableArray array];
    
    if ([kv containsKey:mapIndexKey]) {
        mapIndex = [kv getObjectOfClass:NSMutableArray.class forKey:mapIndexKey];
    }
    
    if (![mapIndex containsObject:key]) {
        [mapIndex  addObject:key];
        [kv setObject:mapIndex forKey:mapIndexKey];
    }
}


+ (nullable NSMutableArray *)getAllMaps:(MMKV *)kv {
    
    NSMutableArray *mapIndex = [NSMutableArray array];
    mapIndex = [kv getObjectOfClass:NSMutableArray.class forKey:mapIndexKey];
    
    if (mapIndex == NULL) return NULL;
    
    NSMutableArray *array = [NSMutableArray array];
    
    for (NSString *key in mapIndex) {
        
        NSDictionary *data = [kv getObjectOfClass:NSDictionary.class forKey:key];
        NSMutableArray *child = [NSMutableArray array];
        [child addObject:key];
        [child addObject:data];
        [array addObject:child];
    }
    
    return array;
    
}


+(void)addToArrayIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *arrayIndex = [NSMutableArray array];
    
    if ([kv containsKey:arrayIndexKey]) {
        arrayIndex = [kv getObjectOfClass:NSMutableArray.class forKey:arrayIndexKey];
        
    }
    if (![arrayIndex containsObject:key]) {
        [arrayIndex  addObject:key];
        [kv setObject:arrayIndex forKey:arrayIndexKey];
    }
}

+ (nullable NSMutableArray *)getAllArrays:(MMKV *)kv {
    
    NSMutableArray *arrayIndex = [NSMutableArray array];
    arrayIndex = [kv getObjectOfClass:NSMutableArray.class forKey:arrayIndexKey];
    
    if (arrayIndex == NULL) return NULL;
    
    NSMutableArray *array = [NSMutableArray array];
    
    for (NSString *key in arrayIndex) {
        
        NSMutableArray *data = [kv getObjectOfClass:NSMutableArray.class forKey:key];
        NSMutableArray *child = [NSMutableArray array];
        [child addObject:key];
        [child addObject:data];
        [array addObject:child];
    }
    
    return array;
    
}

@end
