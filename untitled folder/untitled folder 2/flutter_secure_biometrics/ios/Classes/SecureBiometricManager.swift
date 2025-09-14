import Foundation
import LocalAuthentication
import Security
import AVFoundation
import CoreMotion

class SecureBiometricManager {
    
    private let context = LAContext()
    
    func isAvailable() -> Bool {
        var error: NSError?
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    }
    
    func getAvailableBiometrics() -> [String] {
        var availableBiometrics: [String] = []
        
        var error: NSError?
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            switch context.biometryType {
            case .faceID:
                availableBiometrics.append("face")
            case .touchID:
                availableBiometrics.append("fingerprint")
            case .opticID:
                availableBiometrics.append("opticID")
            case .none:
                break
            @unknown default:
                break
            }
        }
        
        // Check for camera-based health biometrics
        if AVCaptureDevice.default(for: .video) != nil {
            availableBiometrics.append("heartRate")
            availableBiometrics.append("bloodOxygen")
        }
        
        // Check for voice capability
        if AVAudioSession.sharedInstance().isInputAvailable {
            availableBiometrics.append("voice")
        }
        
        return availableBiometrics
    }
    
    func registerAppBiometric(
        type: String,
        appId: String,
        metadata: [String: Any]?,
        keychainManager: KeychainManager,
        completion: @escaping (Bool, Error?) -> Void
    ) {
        let reason = "Register \(type.capitalized) for \(appId)"
        
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
            DispatchQueue.main.async {
                if success {
                    // Generate app-specific key in Secure Enclave
                    do {
                        let keyGenerated = try keychainManager.generateAppSpecificKey(appId: appId, biometricType: type)
                        if keyGenerated {
                            // Store registration metadata
                            self.storeAppBiometricMetadata(appId: appId, type: type, metadata: metadata)
                            completion(true, nil)
                        } else {
                            completion(false, NSError(domain: "SecureBiometrics", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to generate key"]))
                        }
                    } catch {
                        completion(false, error)
                    }
                } else {
                    completion(false, error)
                }
            }
        }
    }
    
    func authenticate(
        config: [String: Any],
        appId: String,
        reason: String,
        keychainManager: KeychainManager,
        livenessDetector: LivenessDetector,
        spoofingDetector: SpoofingDetector,
        completion: @escaping ([String: Any]) -> Void
    ) {
        let enabledBiometrics = config["enabledBiometrics"] as? [String] ?? ["fingerprint"]
        let livenessDetection = config["livenessDetection"] as? Bool ?? true
        let antiSpoofing = config["antiSpoofing"] as? Bool ?? true
        
        // Validate app-specific biometric registration
        var registeredBiometrics: [String] = []
        for biometricType in enabledBiometrics {
            if keychainManager.isKeyRegistered(appId: appId, biometricType: biometricType) {
                registeredBiometrics.append(biometricType)
            }
        }
        
        if registeredBiometrics.isEmpty {
            completion([
                "isAuthenticated": false,
                "error": "appBiometricNotRegistered",
                "errorMessage": "No app-specific biometrics registered",
                "timestamp": Date().timeIntervalSince1970 * 1000
            ])
            return
        }
        
        // Perform biometric authentication
        let authContext = LAContext()
        authContext.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
            DispatchQueue.main.async {
                if success {
                    // Perform additional security checks
                    self.performSecurityValidation(
                        biometrics: registeredBiometrics,
                        livenessDetection: livenessDetection,
                        antiSpoofing: antiSpoofing,
                        livenessDetector: livenessDetector,
                        spoofingDetector: spoofingDetector
                    ) { validationResult in
                        if validationResult.isValid {
                            completion([
                                "isAuthenticated": true,
                                "usedBiometrics": registeredBiometrics,
                                "trustScore": [
                                    "value": 1.0,
                                    "timestamp": Date().timeIntervalSince1970 * 1000,
                                    "factors": [:],
                                    "reason": "Successful biometric authentication"
                                ],
                                "timestamp": Date().timeIntervalSince1970 * 1000
                            ])
                        } else {
                            completion([
                                "isAuthenticated": false,
                                "error": validationResult.errorType,
                                "errorMessage": validationResult.errorMessage,
                                "timestamp": Date().timeIntervalSince1970 * 1000
                            ])
                        }
                    }
                } else {
                    let errorType = self.mapLAError(error)
                    completion([
                        "isAuthenticated": false,
                        "error": errorType,
                        "errorMessage": error?.localizedDescription ?? "Authentication failed",
                        "timestamp": Date().timeIntervalSince1970 * 1000
                    ])
                }
            }
        }
    }
    
    func getHealthBiometrics(completion: @escaping ([String: Double]?, Error?) -> Void) {
        var healthData: [String: Double] = [:]
        
        // Simulate heart rate measurement via camera
        if AVCaptureDevice.default(for: .video) != nil {
            measureHeartRate { heartRate in
                healthData["heartRate"] = heartRate
                
                // Simulate blood oxygen measurement
                self.measureBloodOxygen { bloodOxygen in
                    healthData["bloodOxygen"] = bloodOxygen
                    completion(healthData, nil)
                }
            }
        } else {
            completion(nil, NSError(domain: "SecureBiometrics", code: -1, userInfo: [NSLocalizedDescriptionKey: "Camera not available"]))
        }
    }
    
    private func performSecurityValidation(
        biometrics: [String],
        livenessDetection: Bool,
        antiSpoofing: Bool,
        livenessDetector: LivenessDetector,
        spoofingDetector: SpoofingDetector,
        completion: @escaping (ValidationResult) -> Void
    ) {
        let group = DispatchGroup()
        var validationPassed = true
        var errorType = ""
        var errorMessage = ""
        
        for biometricType in biometrics {
            // Perform liveness detection
            if livenessDetection {
                group.enter()
                livenessDetector.performDetection(type: biometricType) { isLive, error in
                    if !isLive || error != nil {
                        validationPassed = false
                        errorType = "livenessDetectionFailed"
                        errorMessage = "Liveness detection failed"
                    }
                    group.leave()
                }
            }
            
            // Perform spoofing detection
            if antiSpoofing {
                let isSpoofing = spoofingDetector.detectSpoofing(type: biometricType)
                if isSpoofing {
                    validationPassed = false
                    errorType = "spoofingDetected"
                    errorMessage = "Spoofing attempt detected"
                }
            }
        }
        
        group.notify(queue: .main) {
            completion(ValidationResult(
                isValid: validationPassed,
                errorType: errorType,
                errorMessage: errorMessage
            ))
        }
    }
    
    private func storeAppBiometricMetadata(appId: String, type: String, metadata: [String: Any]?) {
        let key = "secure_biometric_\(appId)_\(type)_metadata"
        if let metadata = metadata {
            UserDefaults.standard.set(metadata, forKey: key)
        }
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: "\(key)_timestamp")
    }
    
    private func measureHeartRate(completion: @escaping (Double) -> Void) {
        // Simulate heart rate measurement using camera
        // In real implementation, this would analyze camera frames for pulse detection
        DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) {
            let heartRate = 72.0 + Double.random(in: -10...10) // Simulate 62-82 BPM
            DispatchQueue.main.async {
                completion(heartRate)
            }
        }
    }
    
    private func measureBloodOxygen(completion: @escaping (Double) -> Void) {
        // Simulate SpO2 measurement using camera and flash
        // In real implementation, this would use red and infrared light analysis
        DispatchQueue.global().asyncAfter(deadline: .now() + 1.5) {
            let bloodOxygen = 98.0 + Double.random(in: -2...2) // Simulate 96-100%
            DispatchQueue.main.async {
                completion(bloodOxygen)
            }
        }
    }
    
    private func mapLAError(_ error: Error?) -> String {
        guard let laError = error as? LAError else { return "unknown" }
        
        switch laError.code {
        case .userCancel:
            return "userCancelled"
        case .biometryNotEnrolled:
            return "noBiometricsEnrolled"
        case .biometryNotAvailable:
            return "biometricNotAvailable"
        case .biometryLockout:
            return "tooManyAttempts"
        case .authenticationFailed:
            return "authenticationFailed"
        case .systemCancel:
            return "userCancelled"
        case .passcodeNotSet:
            return "biometricNotAvailable"
        default:
            return "unknown"
        }
    }
}

struct ValidationResult {
    let isValid: Bool
    let errorType: String
    let errorMessage: String
}
