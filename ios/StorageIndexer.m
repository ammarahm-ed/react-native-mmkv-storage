

#import "StorageIndexer.h"
#import <MMKV/MMKV.h>

@implementation StorageIndexer: NSObject

NSString *stringsIndexKey = @"stringsIndex";
NSString *intIndexKey = @"intIndex";
NSString *mapIndexKey = @"mapIndex";
NSString *boolIndexKey = @"boolIndex";
NSString *arrayIndexKey = @"arrayIndex";


-(void)addToStringsIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *stringsIndex = [NSMutableArray array];
    
    if ([kv containsKey:stringsIndexKey]) {
        stringsIndex = [kv getObjectOfClass:NSMutableArray.class forKey:stringsIndexKey];
        [stringsIndex  addObject:key];
        [kv setObject:stringsIndex forKey:stringsIndexKey];
    } else {
        
        [stringsIndex addObject:key];
        [kv setObject:stringsIndex forKey:stringsIndexKey];
        
    }
}

- (nullable NSMutableArray *)getStringsIndex:(MMKV *)kv {
    
    NSMutableArray *stringsIndex = [NSMutableArray array];
    stringsIndex = [kv getObjectOfClass:NSMutableArray.class forKey:stringsIndexKey];
    
    if (stringsIndex != NULL) {
        return stringsIndex;
    } else {
        return NULL;
    }
}

- (nullable NSMutableArray *)getAllStrings:(MMKV *)kv {
    
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

-(void)addToBoolIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *boolIndex = [NSMutableArray array];
    
    if ([kv containsKey:boolIndexKey]) {
        boolIndex = [kv getObjectOfClass:NSMutableArray.class forKey:boolIndexKey];
        [boolIndex  addObject:key];
        [kv setObject:boolIndex forKey:boolIndexKey];
    } else {
        
        [boolIndex addObject:key];
        [kv setObject:boolIndex forKey:boolIndexKey];
        
    }
}

- (nullable NSMutableArray *)getBoolIndex:(MMKV *)kv {
    
    NSMutableArray *boolIndex = [NSMutableArray array];
    boolIndex = [kv getObjectOfClass:NSMutableArray.class forKey:boolIndexKey];
    
    if (boolIndex != NULL) {
        return boolIndex;
    } else {
        return NULL;
    }
}

- (nullable NSMutableArray *)getAllBooleans:(MMKV *)kv {
    
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


-(void)addToIntIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *intIndex = [NSMutableArray array];
    
    if ([kv containsKey:intIndexKey]) {
        intIndex = [kv getObjectOfClass:NSMutableArray.class forKey:intIndexKey];
        [intIndex  addObject:key];
        [kv setObject:intIndex forKey:intIndexKey];
    } else {
        
        [intIndex addObject:key];
        [kv setObject:intIndex forKey:intIndexKey];
        
    }
}

- (nullable NSMutableArray *)getIntIndex:(MMKV *)kv {
    
    NSMutableArray *intIndex = [NSMutableArray array];
    intIndex = [kv getObjectOfClass:NSMutableArray.class forKey:intIndexKey];
    
    if (intIndex != NULL) {
        return intIndex;
    } else {
        return NULL;
    }
}

- (nullable NSMutableArray *)getAllInts:(MMKV *)kv {
    
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


-(void)addToMapIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *mapIndex = [NSMutableArray array];
    
    if ([kv containsKey:mapIndexKey]) {
        mapIndex = [kv getObjectOfClass:NSMutableArray.class forKey:mapIndexKey];
        [mapIndex  addObject:key];
        [kv setObject:mapIndex forKey:mapIndexKey];
    } else {
        
        [mapIndex addObject:key];
        [kv setObject:mapIndex forKey:mapIndexKey];
        
    }
}

- (nullable NSMutableArray *)getMapIndex:(MMKV *)kv {
    
    NSMutableArray *mapIndex = [NSMutableArray array];
    mapIndex = [kv getObjectOfClass:NSMutableArray.class forKey:mapIndexKey];
    
    if (mapIndex != NULL) {
        return mapIndex;
    } else {
        return NULL;
    }
}

- (nullable NSMutableArray *)getAllMaps:(MMKV *)kv {
    
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


-(void)addToArrayIndex:(MMKV *)kv key:(NSString *)key {
    
    NSMutableArray *arrayIndex = [NSMutableArray array];
    
    if ([kv containsKey:arrayIndexKey]) {
        arrayIndex = [kv getObjectOfClass:NSMutableArray.class forKey:arrayIndexKey];
        [arrayIndex  addObject:key];
        [kv setObject:arrayIndex forKey:arrayIndexKey];
    } else {
        
        [arrayIndex addObject:key];
        [kv setObject:arrayIndex forKey:arrayIndexKey];
        
    }
}

- (nullable NSMutableArray *)getArrayIndex:(MMKV *)kv {
    
    NSMutableArray *arrayIndex = [NSMutableArray array];
    arrayIndex = [kv getObjectOfClass:NSMutableArray.class forKey:arrayIndexKey];
    
    if (arrayIndex != NULL) {
        return arrayIndex;
    } else {
        return NULL;
    }
}

- (nullable NSMutableArray *)getAllArrays:(MMKV *)kv {
    
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
