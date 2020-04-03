//
//  NSObject+IDStore.h
//  DoubleConversion
//
//  Created by Ammar Ahmed on 1/10/1399 AP.
//



#import <MMKV/MMKV.h>

#import <Foundation/Foundation.h>

@interface IDStore: NSObject

- (nonnull id) initWithMMKV:(nonnull MMKV *)kv;

- (void)add:(nonnull NSString *)ID encrypted:(bool)encrypted alias:(nullable NSString *)alias;

-(bool)exists:(nonnull NSString *)ID;

- (nullable NSMutableDictionary *)getAll;

- (bool)encrypted:(nonnull NSString *)ID;

- (nonnull NSString *)getAlias:(nonnull NSString *)ID;

- (nonnull NSMutableDictionary *)getProperties:(nonnull NSString *)ID;

@end

