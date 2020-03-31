//
//  NSObject+SecureStorage.m
//  DoubleConversion
//
//  Created by Ammar Ahmed on 1/10/1399 AP.
//

#import "SecureStorage.h"



@implementation SecureStorage


NSString *serviceName;


- (NSMutableDictionary *)newSearchDictionary:(NSString *)identifier {
    NSMutableDictionary *searchDictionary = [[NSMutableDictionary alloc] init];
    serviceName = [[NSBundle mainBundle] bundleIdentifier];
    
    [searchDictionary setObject:(id)kSecClassGenericPassword forKey:(id)kSecClass];
    
    NSData *encodedIdentifier = [identifier dataUsingEncoding:NSUTF8StringEncoding];
    [searchDictionary setObject:encodedIdentifier forKey:(id)kSecAttrGeneric];
    [searchDictionary setObject:encodedIdentifier forKey:(id)kSecAttrAccount];
    [searchDictionary setObject:serviceName forKey:(id)kSecAttrService];
    
    return searchDictionary;
}

- (NSString *)searchKeychainCopyMatching:(NSString *)identifier {
    NSMutableDictionary *searchDictionary = [self newSearchDictionary:identifier];
    
    // Add search attributes
    [searchDictionary setObject:(id)kSecMatchLimitOne forKey:(id)kSecMatchLimit];
    
    // Add search return types
    [searchDictionary setObject:(id)kCFBooleanTrue forKey:(id)kSecReturnData];
    
    NSDictionary *found = nil;
    CFTypeRef result = NULL;
    OSStatus status = SecItemCopyMatching((CFDictionaryRef)searchDictionary,
                                          (CFTypeRef *)&result);
    
    NSString *value = nil;
    found = (__bridge NSDictionary*)(result);
    if (found) {
        value = [[NSString alloc] initWithData:found encoding:NSUTF8StringEncoding];
    }
    return value;
}

- (BOOL)searchKeychainCopyMatchingExists:(NSString *)identifier {
    NSMutableDictionary *searchDictionary = [self newSearchDictionary:identifier];
    
    // Add search attributes
    [searchDictionary setObject:(id)kSecMatchLimitOne forKey:(id)kSecMatchLimit];
    
    // Add search return types
    [searchDictionary setObject:(id)kCFBooleanTrue forKey:(id)kSecReturnData];
    
    CFTypeRef result = NULL;
    OSStatus status = SecItemCopyMatching((CFDictionaryRef)searchDictionary,
                                          (CFTypeRef *)&result);
    
    if (status != errSecItemNotFound) {
      return YES;
    }
    return NO;
}

- (BOOL)createKeychainValue:(NSString *)value forIdentifier:(NSString *)identifier options: (NSDictionary * __nullable)options {
    CFStringRef accessible = accessibleValue(options);
    NSMutableDictionary *dictionary = [self newSearchDictionary:identifier];
    
    NSData *valueData = [value dataUsingEncoding:NSUTF8StringEncoding];
    [dictionary setObject:valueData forKey:(id)kSecValueData];
    dictionary[(__bridge NSString *)kSecAttrAccessible] = (__bridge id)accessible;
    
    OSStatus status = SecItemAdd((CFDictionaryRef)dictionary, NULL);
    
    if (status == errSecSuccess) {
        return YES;
    }
    return NO;
}

- (BOOL)updateKeychainValue:(NSString *)password forIdentifier:(NSString *)identifier options:(NSDictionary * __nullable)options {
    
    CFStringRef accessible = accessibleValue(options);
    NSMutableDictionary *searchDictionary = [self newSearchDictionary:identifier];
    NSMutableDictionary *updateDictionary = [[NSMutableDictionary alloc] init];
    NSData *passwordData = [password dataUsingEncoding:NSUTF8StringEncoding];
    [updateDictionary setObject:passwordData forKey:(id)kSecValueData];
    updateDictionary[(__bridge NSString *)kSecAttrAccessible] = (__bridge id)accessible;
    OSStatus status = SecItemUpdate((CFDictionaryRef)searchDictionary,
                                    (CFDictionaryRef)updateDictionary);
    
    if (status == errSecSuccess) {
        return YES;
    }
    return NO;
}

- (BOOL)deleteKeychainValue:(NSString *)identifier {
    NSMutableDictionary *searchDictionary = [self newSearchDictionary:identifier];
    OSStatus status = SecItemDelete((CFDictionaryRef)searchDictionary);
    if (status == errSecSuccess) {
        return YES;
    }
    return NO;
}

- (void)clearSecureKeyStore
{
    NSArray *secItemClasses = @[(__bridge id)kSecClassGenericPassword,
                                (__bridge id)kSecAttrGeneric,
                                (__bridge id)kSecAttrAccount,
                                (__bridge id)kSecClassKey,
                                (__bridge id)kSecAttrService];
    for (id secItemClass in secItemClasses) {
        NSDictionary *spec = @{(__bridge id)kSecClass: secItemClass};
        SecItemDelete((__bridge CFDictionaryRef)spec);
    }
}

- (void)handleAppUninstallation
{
    if (![[NSUserDefaults standardUserDefaults] boolForKey:@"RnSksIsAppInstalled"]) {
        [self clearSecureKeyStore];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"RnSksIsAppInstalled"];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}

NSError * secureKeyStoreError(NSString *errMsg)
{
    NSError *error = [NSError errorWithDomain:serviceName code:200 userInfo:@{@"reason": errMsg}];
    return error;
}



CFStringRef accessibleValue(NSDictionary *options)
{
    if (options && options[@"accessible"] != nil) {
        NSDictionary *keyMap = @{
                                 @"AccessibleWhenUnlocked": (__bridge NSString *)kSecAttrAccessibleWhenUnlocked,
                                 @"AccessibleAfterFirstUnlock": (__bridge NSString *)kSecAttrAccessibleAfterFirstUnlock,
                                 @"AccessibleAlways": (__bridge NSString *)kSecAttrAccessibleAlways,
                                 @"AccessibleWhenPasscodeSetThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
                                 @"AccessibleWhenUnlockedThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
                                 @"AccessibleAfterFirstUnlockThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
                                 @"AccessibleAlwaysThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleAlwaysThisDeviceOnly
                                 };
        NSString *result = keyMap[options[@"accessible"]];
        if (result) {
            return (__bridge CFStringRef)result;
        }
    }
    return kSecAttrAccessibleAfterFirstUnlock;
}

@end
