import Foundation
import Security
import CryptoKit

class KeychainManager {
    
    private let keyTag = "com.securebio.flutter_secure_biometrics"
    
    func generateAppSpecificKey(appId: String, biometricType: String) throws -> Bool {
        let keyAlias = "secure_biometric_\(appId)_\(biometricType)"
        
        // Delete existing key if present
        _ = clearAppKey(appId: appId, biometricType: biometricType)
        
        // Create key generation parameters for Secure Enclave
        let access = SecAccessControlCreateWithFlags(
            kCFAllocatorDefault,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            [.privateKeyUsage, .biometryCurrentSet],
            nil
        )
        
        guard let accessControl = access else {
            throw KeychainError.accessControlCreationFailed
        }
        
        let keyAttributes: [String: Any] = [
            kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrKeySizeInBits as String: 256,
            kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
            kSecPrivateKeyAttrs as String: [
                kSecAttrIsPermanent as String: true,
                kSecAttrApplicationTag as String: "\(keyTag).\(keyAlias)".data(using: .utf8)!,
                kSecAttrAccessControl as String: accessControl
            ]
        ]
        
        var error: Unmanaged<CFError>?
        guard let privateKey = SecKeyCreateRandomKey(keyAttributes as CFDictionary, &error) else {
            if let error = error?.takeRetainedValue() {
                throw KeychainError.keyGenerationFailed(CFErrorCopyDescription(error) as String? ?? "Unknown error")
            }
            throw KeychainError.keyGenerationFailed("Unknown error")
        }
        
        return true
    }
    
    func isKeyRegistered(appId: String, biometricType: String) -> Bool {
        let keyAlias = "secure_biometric_\(appId)_\(biometricType)"
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: "\(keyTag).\(keyAlias)".data(using: .utf8)!,
            kSecReturnRef as String: true
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        return status == errSecSuccess
    }
    
    func clearAppKey(appId: String, biometricType: String) -> Bool {
        let keyAlias = "secure_biometric_\(appId)_\(biometricType)"
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: "\(keyTag).\(keyAlias)".data(using: .utf8)!
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }
    
    func encryptData(appId: String, biometricType: String, data: Data) throws -> Data {
        let keyAlias = "secure_biometric_\(appId)_\(biometricType)"
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: "\(keyTag).\(keyAlias)".data(using: .utf8)!,
            kSecReturnRef as String: true
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        guard status == errSecSuccess, let privateKey = item else {
            throw KeychainError.keyNotFound
        }
        
        guard let publicKey = SecKeyCopyPublicKey(privateKey as! SecKey) else {
            throw KeychainError.publicKeyExtractionFailed
        }
        
        var error: Unmanaged<CFError>?
        guard let encryptedData = SecKeyCreateEncryptedData(
            publicKey,
            .eciesEncryptionCofactorX963SHA256AESGCM,
            data as CFData,
            &error
        ) else {
            if let error = error?.takeRetainedValue() {
                throw KeychainError.encryptionFailed(CFErrorCopyDescription(error) as String? ?? "Unknown error")
            }
            throw KeychainError.encryptionFailed("Unknown error")
        }
        
        return encryptedData as Data
    }
    
    func decryptData(appId: String, biometricType: String, encryptedData: Data) throws -> Data {
        let keyAlias = "secure_biometric_\(appId)_\(biometricType)"
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: "\(keyTag).\(keyAlias)".data(using: .utf8)!,
            kSecReturnRef as String: true
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        guard status == errSecSuccess, let privateKey = item else {
            throw KeychainError.keyNotFound
        }
        
        var error: Unmanaged<CFError>?
        guard let decryptedData = SecKeyCreateDecryptedData(
            privateKey as! SecKey,
            .eciesEncryptionCofactorX963SHA256AESGCM,
            encryptedData as CFData,
            &error
        ) else {
            if let error = error?.takeRetainedValue() {
                throw KeychainError.decryptionFailed(CFErrorCopyDescription(error) as String? ?? "Unknown error")
            }
            throw KeychainError.decryptionFailed("Unknown error")
        }
        
        return decryptedData as Data
    }
    
    func validateKeyIntegrity(appId: String, biometricType: String) -> Bool {
        do {
            let testData = "integrity_test".data(using: .utf8)!
            let encrypted = try encryptData(appId: appId, biometricType: biometricType, data: testData)
            let decrypted = try decryptData(appId: appId, biometricType: biometricType, encryptedData: encrypted)
            return testData == decrypted
        } catch {
            return false
        }
    }
    
    func getKeyCreationTime(appId: String, biometricType: String) -> TimeInterval {
        let keyAlias = "secure_biometric_\(appId)_\(biometricType)"
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: "\(keyTag).\(keyAlias)".data(using: .utf8)!,
            kSecReturnAttributes as String: true
        ]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        
        guard status == errSecSuccess,
              let attributes = item as? [String: Any],
              let creationDate = attributes[kSecAttrCreationDate as String] as? Date else {
            return 0
        }
        
        return creationDate.timeIntervalSince1970
    }
    
    func rotateKey(appId: String, biometricType: String) throws -> Bool {
        // Clear old key
        _ = clearAppKey(appId: appId, biometricType: biometricType)
        
        // Generate new key
        return try generateAppSpecificKey(appId: appId, biometricType: biometricType)
    }
    
    func getAllAppKeys(appId: String) -> [String] {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecMatchLimit as String: kSecMatchLimitAll,
            kSecReturnAttributes as String: true
        ]
        
        var items: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &items)
        
        guard status == errSecSuccess,
              let keyItems = items as? [[String: Any]] else {
            return []
        }
        
        var appKeys: [String] = []
        for item in keyItems {
            if let tagData = item[kSecAttrApplicationTag as String] as? Data,
               let tag = String(data: tagData, encoding: .utf8),
               tag.contains(appId) {
                let components = tag.components(separatedBy: ".")
                if let keyAlias = components.last {
                    let biometricType = keyAlias.replacingOccurrences(of: "secure_biometric_\(appId)_", with: "")
                    appKeys.append(biometricType)
                }
            }
        }
        
        return appKeys
    }
}

enum KeychainError: Error {
    case accessControlCreationFailed
    case keyGenerationFailed(String)
    case keyNotFound
    case publicKeyExtractionFailed
    case encryptionFailed(String)
    case decryptionFailed(String)
    
    var localizedDescription: String {
        switch self {
        case .accessControlCreationFailed:
            return "Failed to create access control"
        case .keyGenerationFailed(let message):
            return "Key generation failed: \(message)"
        case .keyNotFound:
            return "Key not found in keychain"
        case .publicKeyExtractionFailed:
            return "Failed to extract public key"
        case .encryptionFailed(let message):
            return "Encryption failed: \(message)"
        case .decryptionFailed(let message):
            return "Decryption failed: \(message)"
        }
    }
}
