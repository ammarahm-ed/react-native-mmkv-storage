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

- (void)add:(nonnull NSString *)ID;

-(bool)exists:(nonnull NSString *)ID;

- (nullable NSMutableArray *)getAll;
@end

