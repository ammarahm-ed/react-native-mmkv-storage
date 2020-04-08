package com.ammarahmed.mmkv;


import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.security.KeyPairGeneratorSpec;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.securepreferences.SecurePreferences;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Locale;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.security.auth.x500.X500Principal;

public class SecureKeystore {

    private SharedPreferences prefs;
    private SecureKeystore rnKeyStore;

    private boolean useKeystore() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.M;
    }

    private ReactApplicationContext reactContext;

    public SecureKeystore(ReactApplicationContext reactApplicationContext) {

        reactContext = reactApplicationContext;
        if (!useKeystore()) {
            prefs = new SecurePreferences(reactApplicationContext, (String) null, "e4b001df9a082298dd090bb7455c45d92fbd5ddd.xml");
        }
    }

    public static boolean isRTL(Locale locale) {

        final int directionality = Character.getDirectionality(locale.getDisplayName().charAt(0));
        return directionality == Character.DIRECTIONALITY_RIGHT_TO_LEFT ||
                directionality == Character.DIRECTIONALITY_RIGHT_TO_LEFT_ARABIC;
    }


    public void setSecureKey(String key, String value, @Nullable ReadableMap options, Callback callback) {


        if (useKeystore()) {

            try {
                Locale initialLocale = Locale.getDefault();
                if (isRTL(initialLocale)) {
                    Locale.setDefault(Locale.ENGLISH);
                    setCipherText(reactContext, key, value);
                    callback.invoke(false, true);
                    Locale.setDefault(initialLocale);
                } else {
                    setCipherText(reactContext, key, value);
                    callback.invoke(false, true);
                }
            } catch (Exception e) {
                callback.invoke(e.getMessage(), false);
            }

        } else {
            try {
                SharedPreferences.Editor editor = prefs.edit();
                editor.putString(key, value);
                editor.apply();
                callback.invoke(false, true);
            } catch (Exception e) {
                callback.invoke(e.getMessage(), false);
            }
        }
    }


    public String getSecureKey(String key, Callback callback) {
        if (useKeystore()) {
            try {
                String value = getPlainText(reactContext, key);

                if (callback != null) {
                    callback.invoke(null, value);
                }

                return value;


            } catch (FileNotFoundException fnfe) {

                if (callback != null) {
                    callback.invoke(fnfe.getMessage(), null);
                }

                return null;


            } catch (Exception e) {

                if (callback != null) {
                    callback.invoke(e.getMessage(), null);
                }

                return null;

            }
        } else {
            try {
                String value = prefs.getString(key, null);
                if (callback != null) {
                    callback.invoke(null, value);
                }

                return value;

            } catch (IllegalViewOperationException e) {
                if (callback != null) {
                    callback.invoke(e.getMessage(), null);
                }

                return null;
            }
        }
    }

    public boolean secureKeyExists(String key, @Nullable Callback callback) {
        if (useKeystore()) {
            try {

                boolean exists = exists(reactContext, key);
                if (callback != null) {
                    callback.invoke(null, exists);
                }
                return exists;


            } catch (Exception e) {
                if (callback != null) {
                    callback.invoke(e.getMessage(), null);
                }
                return false;

            }
        } else {
            try {
                boolean exists = prefs.contains(key);

                if (callback != null) {
                    callback.invoke(null, exists);
                }
                return exists;


            } catch (IllegalViewOperationException e) {
                if (callback != null) {
                    callback.invoke(e.getMessage(), null);
                }
                return false;
            }
        }
    }


    public void removeSecureKey(String key, Callback callback) {
        ArrayList<Boolean> fileDeleted = new ArrayList<Boolean>();
        if (useKeystore()) {
            try {
                for (String filename : new String[]{
                        Constants.SKS_DATA_FILENAME + key,
                        Constants.SKS_KEY_FILENAME + key,
                }) {
                    fileDeleted.add(reactContext.deleteFile(filename));
                }
                if (!fileDeleted.get(0) || !fileDeleted.get(1)) {
                    callback.invoke("404: Key not found", null);
                } else {
                    callback.invoke(null, true);

                }
            } catch (Exception e) {
                callback.invoke(e.getMessage(), null);
            }
        } else {
            try {
                if (prefs.getString(key, null) == null) {
                    callback.invoke("404: Key not found", null);
                } else {
                    SharedPreferences.Editor editor = prefs.edit();
                    editor.remove(key).apply();
                    callback.invoke(null, true);
                }
            } catch (Exception e) {
                callback.invoke(e.getMessage(), null);
            }
        }
    }


    private PublicKey getOrCreatePublicKey(Context context, String alias) throws GeneralSecurityException, IOException {
        KeyStore keyStore = KeyStore.getInstance(getKeyStore());
        keyStore.load(null);

        if (!keyStore.containsAlias(alias) || keyStore.getCertificate(alias) == null) {
            Log.i(Constants.TAG, "no existing asymmetric keys for alias");

            Calendar start = Calendar.getInstance();
            Calendar end = Calendar.getInstance();
            end.add(Calendar.YEAR, 50);
            KeyPairGeneratorSpec spec = new KeyPairGeneratorSpec.Builder(context)
                    .setAlias(alias)
                    .setSubject(new X500Principal("CN=" + alias))
                    .setSerialNumber(BigInteger.ONE)
                    .setStartDate(start.getTime())
                    .setEndDate(end.getTime())
                    .build();

            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA", getKeyStore());
            generator.initialize(spec);
            generator.generateKeyPair();

            Log.i(Constants.TAG, "created new asymmetric keys for alias");
        }

        return keyStore.getCertificate(alias).getPublicKey();
    }

    private byte[] encryptRsaPlainText(PublicKey publicKey, byte[] plainTextBytes) throws GeneralSecurityException, IOException {
        Cipher cipher = Cipher.getInstance(Constants.RSA_ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        return encryptCipherText(cipher, plainTextBytes);
    }

    private byte[] encryptAesPlainText(SecretKey secretKey, String plainText) throws GeneralSecurityException, IOException {
        Cipher cipher = Cipher.getInstance(Constants.AES_ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        return encryptCipherText(cipher, plainText);
    }

    private byte[] encryptCipherText(Cipher cipher, String plainText) throws GeneralSecurityException, IOException {
        return encryptCipherText(cipher, plainText.getBytes("UTF-8"));
    }

    private byte[] encryptCipherText(Cipher cipher, byte[] plainTextBytes) throws GeneralSecurityException, IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        CipherOutputStream cipherOutputStream = new CipherOutputStream(outputStream, cipher);
        cipherOutputStream.write(plainTextBytes);
        cipherOutputStream.close();
        return outputStream.toByteArray();
    }

    private SecretKey getOrCreateSecretKey(Context context, String alias) throws GeneralSecurityException, IOException {
        try {
            return getSymmetricKey(context, alias);
        } catch (FileNotFoundException fnfe) {
            Log.i(Constants.TAG, "no existing symmetric key for alias");

            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            //32bytes / 256bits AES key
            keyGenerator.init(256);
            SecretKey secretKey = keyGenerator.generateKey();
            PublicKey publicKey = getOrCreatePublicKey(context, alias);
            Storage.writeValues(context, Constants.SKS_KEY_FILENAME + alias,
                    encryptRsaPlainText(publicKey, secretKey.getEncoded()));

            Log.i(Constants.TAG, "created new symmetric keys for alias");
            return secretKey;
        }
    }

    public void setCipherText(Context context, String alias, String input) throws GeneralSecurityException, IOException {
        Storage.writeValues(context, Constants.SKS_DATA_FILENAME + alias,
                encryptAesPlainText(getOrCreateSecretKey(context, alias), input));
    }

    private PrivateKey getPrivateKey(String alias) throws GeneralSecurityException, IOException {
        KeyStore keyStore = KeyStore.getInstance(getKeyStore());
        keyStore.load(null);
        return (PrivateKey) keyStore.getKey(alias, null);
    }

    private byte[] decryptRsaCipherText(PrivateKey privateKey, byte[] cipherTextBytes) throws GeneralSecurityException, IOException {
        Cipher cipher = Cipher.getInstance(Constants.RSA_ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        return decryptCipherText(cipher, cipherTextBytes);
    }

    private byte[] decryptAesCipherText(SecretKey secretKey, byte[] cipherTextBytes) throws GeneralSecurityException, IOException {
        Cipher cipher = Cipher.getInstance(Constants.AES_ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        return decryptCipherText(cipher, cipherTextBytes);
    }

    private byte[] decryptCipherText(Cipher cipher, byte[] cipherTextBytes) throws IOException {
        ByteArrayInputStream bais = new ByteArrayInputStream(cipherTextBytes);
        CipherInputStream cipherInputStream = new CipherInputStream(bais, cipher);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[256];
        int bytesRead = cipherInputStream.read(buffer);
        while (bytesRead != -1) {
            baos.write(buffer, 0, bytesRead);
            bytesRead = cipherInputStream.read(buffer);
        }
        return baos.toByteArray();
    }

    private SecretKey getSymmetricKey(Context context, String alias) throws GeneralSecurityException, IOException {
        byte[] cipherTextBytes = Storage.readValues(context, Constants.SKS_KEY_FILENAME + alias);
        return new SecretKeySpec(decryptRsaCipherText(getPrivateKey(alias), cipherTextBytes), Constants.AES_ALGORITHM);
    }

    public String getPlainText(Context context, String alias) throws GeneralSecurityException, IOException {
        SecretKey secretKey = getSymmetricKey(context, alias);
        byte[] cipherTextBytes = Storage.readValues(context, Constants.SKS_DATA_FILENAME + alias);
        return new String(decryptAesCipherText(secretKey, cipherTextBytes), "UTF-8");
    }

    public boolean exists(Context context, String alias) throws IOException {
        return Storage.exists(context, Constants.SKS_DATA_FILENAME + alias);
    }


    private String getKeyStore() {
        try {
            KeyStore.getInstance(Constants.KEYSTORE_PROVIDER_1);
            return Constants.KEYSTORE_PROVIDER_1;
        } catch (Exception err) {
            try {
                KeyStore.getInstance(Constants.KEYSTORE_PROVIDER_2);
                return Constants.KEYSTORE_PROVIDER_2;
            } catch (Exception e) {
                return Constants.KEYSTORE_PROVIDER_3;
            }
        }
    }
}
