//
//  NSObject+SecureStorage.h
//  DoubleConversion
//
//  Created by Ammar Ahmed on 1/10/1399 AP.
//
#import <Foundation/Foundation.h>

@interface SecureStorage: NSObject

- (BOOL)searchKeychainCopyMatchingExists:(nonnull NSString *)identifier;

- (nonnull NSString *)searchKeychainCopyMatching:(nonnull NSString *)identifier;

- (nonnull NSMutableDictionary *)newSearchDictionary:(nonnull NSString *)identifier;

- (BOOL)createKeychainValue:(nonnull NSString *)value forIdentifier:(nonnull NSString *)identifier options: (NSDictionary * __nullable)options;

- (BOOL)updateKeychainValue:(nonnull NSString *)password forIdentifier:(nonnull NSString *)identifier options:(NSDictionary * __nullable)options;

- (BOOL)deleteKeychainValue:(nonnull NSString *)identifier;

- (void)clearSecureKeyStore;

- (void)handleAppUninstallation;



@end

