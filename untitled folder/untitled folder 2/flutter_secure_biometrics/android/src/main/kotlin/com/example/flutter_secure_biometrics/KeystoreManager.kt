package com.example.flutter_secure_biometrics

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class KeystoreManager {
    
    private val keyStore: KeyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }
    
    fun generateAppSpecificKey(appId: String, biometricType: String): String {
        val keyAlias = "secure_biometric_${appId}_${biometricType}"
        
        try {
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            val keyGenParameterSpec = KeyGenParameterSpec.Builder(
                keyAlias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setUserAuthenticationRequired(true)
                .setUserAuthenticationValidityDurationSeconds(300) // 5 minutes
                .setInvalidatedByBiometricEnrollment(true) // Key invalidated if biometrics change
                .build()
            
            keyGenerator.init(keyGenParameterSpec)
            keyGenerator.generateKey()
            
            return keyAlias
        } catch (e: Exception) {
            throw SecurityException("Failed to generate app-specific key: ${e.message}")
        }
    }
    
    fun isKeyRegistered(appId: String, biometricType: String): Boolean {
        val keyAlias = "secure_biometric_${appId}_${biometricType}"
        return try {
            keyStore.containsAlias(keyAlias)
        } catch (e: Exception) {
            false
        }
    }
    
    fun clearAppKey(appId: String, biometricType: String): Boolean {
        val keyAlias = "secure_biometric_${appId}_${biometricType}"
        return try {
            keyStore.deleteEntry(keyAlias)
            true
        } catch (e: Exception) {
            false
        }
    }
    
    fun encryptData(keyAlias: String, data: ByteArray): Pair<ByteArray, ByteArray> {
        try {
            val secretKey = keyStore.getKey(keyAlias, null) as SecretKey
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            
            val iv = cipher.iv
            val encryptedData = cipher.doFinal(data)
            
            return Pair(encryptedData, iv)
        } catch (e: Exception) {
            throw SecurityException("Failed to encrypt data: ${e.message}")
        }
    }
    
    fun decryptData(keyAlias: String, encryptedData: ByteArray, iv: ByteArray): ByteArray {
        try {
            val secretKey = keyStore.getKey(keyAlias, null) as SecretKey
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val spec = GCMParameterSpec(128, iv)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
            
            return cipher.doFinal(encryptedData)
        } catch (e: Exception) {
            throw SecurityException("Failed to decrypt data: ${e.message}")
        }
    }
    
    fun validateKeyIntegrity(appId: String, biometricType: String): Boolean {
        val keyAlias = "secure_biometric_${appId}_${biometricType}"
        return try {
            if (!keyStore.containsAlias(keyAlias)) {
                return false
            }
            
            // Test encryption/decryption to validate key integrity
            val testData = "integrity_test".toByteArray()
            val (encrypted, iv) = encryptData(keyAlias, testData)
            val decrypted = decryptData(keyAlias, encrypted, iv)
            
            testData.contentEquals(decrypted)
        } catch (e: Exception) {
            false
        }
    }
    
    fun getKeyCreationTime(appId: String, biometricType: String): Long {
        val keyAlias = "secure_biometric_${appId}_${biometricType}"
        return try {
            val certificate = keyStore.getCertificate(keyAlias)
            certificate?.let {
                // In a real implementation, you would extract creation time from certificate
                System.currentTimeMillis()
            } ?: 0L
        } catch (e: Exception) {
            0L
        }
    }
    
    fun rotateKey(appId: String, biometricType: String): Boolean {
        return try {
            // Clear old key
            clearAppKey(appId, biometricType)
            
            // Generate new key
            generateAppSpecificKey(appId, biometricType)
            
            true
        } catch (e: Exception) {
            false
        }
    }
}
