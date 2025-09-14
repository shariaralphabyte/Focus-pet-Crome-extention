import Flutter
import UIKit
import LocalAuthentication
import Security
import CryptoKit
import CoreMotion
import AVFoundation

public class FlutterSecureBiometricsPlugin: NSObject, FlutterPlugin {
    
    private var eventChannel: FlutterEventChannel?
    private var eventSink: FlutterEventSink?
    
    private let biometricManager = SecureBiometricManager()
    private let keychainManager = KeychainManager()
    private let behavioralAnalyzer = BehavioralAnalyzer()
    private let livenessDetector = LivenessDetector()
    private let spoofingDetector = SpoofingDetector()
    
    public static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(name: "flutter_secure_biometrics", binaryMessenger: registrar.messenger())
        let instance = FlutterSecureBiometricsPlugin()
        registrar.addMethodCallDelegate(instance, channel: channel)
        
        // Set up event channel for streaming
        let eventChannel = FlutterEventChannel(name: "flutter_secure_biometrics/events", binaryMessenger: registrar.messenger())
        instance.eventChannel = eventChannel
        eventChannel.setStreamHandler(instance)
    }
    
    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "isAvailable":
            handleIsAvailable(result: result)
        case "getAvailableBiometrics":
            handleGetAvailableBiometrics(result: result)
        case "registerAppBiometric":
            handleRegisterAppBiometric(call: call, result: result)
        case "isAppBiometricRegistered":
            handleIsAppBiometricRegistered(call: call, result: result)
        case "authenticate":
            handleAuthenticate(call: call, result: result)
        case "startContinuousAuth":
            handleStartContinuousAuth(call: call, result: result)
        case "stopContinuousAuth":
            handleStopContinuousAuth(result: result)
        case "getCurrentTrustScore":
            handleGetCurrentTrustScore(result: result)
        case "updateBehavioralMetrics":
            handleUpdateBehavioralMetrics(call: call, result: result)
        case "lockApplication":
            handleLockApplication(result: result)
        case "performLivenessDetection":
            handlePerformLivenessDetection(call: call, result: result)
        case "detectSpoofing":
            handleDetectSpoofing(call: call, result: result)
        case "getHealthBiometrics":
            handleGetHealthBiometrics(result: result)
        case "clearAppBiometric":
            handleClearAppBiometric(call: call, result: result)
        case "exportTrainingData":
            handleExportTrainingData(result: result)
        case "importTrainingData":
            handleImportTrainingData(call: call, result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }
    
    private func handleIsAvailable(result: @escaping FlutterResult) {
        let isAvailable = biometricManager.isAvailable()
        result(isAvailable)
    }
    
    private func handleGetAvailableBiometrics(result: @escaping FlutterResult) {
        let availableBiometrics = biometricManager.getAvailableBiometrics()
        result(availableBiometrics)
    }
    
    private func handleRegisterAppBiometric(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let type = args["type"] as? String,
              let appId = args["appId"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing required arguments", details: nil))
            return
        }
        
        let metadata = args["metadata"] as? [String: Any]
        
        biometricManager.registerAppBiometric(
            type: type,
            appId: appId,
            metadata: metadata,
            keychainManager: keychainManager
        ) { success, error in
            if let error = error {
                result(FlutterError(code: "REGISTRATION_ERROR", message: error.localizedDescription, details: nil))
            } else {
                result(success)
            }
        }
    }
    
    private func handleIsAppBiometricRegistered(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let type = args["type"] as? String,
              let appId = args["appId"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing required arguments", details: nil))
            return
        }
        
        let isRegistered = keychainManager.isKeyRegistered(appId: appId, biometricType: type)
        result(isRegistered)
    }
    
    private func handleAuthenticate(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let config = args["config"] as? [String: Any],
              let appId = args["appId"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing required arguments", details: nil))
            return
        }
        
        let reason = args["reason"] as? String ?? "Authenticate to access application"
        
        biometricManager.authenticate(
            config: config,
            appId: appId,
            reason: reason,
            keychainManager: keychainManager,
            livenessDetector: livenessDetector,
            spoofingDetector: spoofingDetector
        ) { authResult in
            result(authResult)
        }
    }
    
    private func handleStartContinuousAuth(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let config = args["config"] as? [String: Any],
              let appId = args["appId"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing required arguments", details: nil))
            return
        }
        
        let started = behavioralAnalyzer.startContinuousMonitoring(config: config, appId: appId)
        result(started)
    }
    
    private func handleStopContinuousAuth(result: @escaping FlutterResult) {
        behavioralAnalyzer.stopContinuousMonitoring()
        result(true)
    }
    
    private func handleGetCurrentTrustScore(result: @escaping FlutterResult) {
        let trustScore = behavioralAnalyzer.getCurrentTrustScore()
        result(trustScore)
    }
    
    private func handleUpdateBehavioralMetrics(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let metrics = args["metrics"] as? [String: Any] else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing metrics", details: nil))
            return
        }
        
        let updated = behavioralAnalyzer.updateMetrics(metrics: metrics)
        result(updated)
    }
    
    private func handleLockApplication(result: @escaping FlutterResult) {
        behavioralAnalyzer.lockApplication()
        result(true)
    }
    
    private func handlePerformLivenessDetection(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let type = args["type"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing type", details: nil))
            return
        }
        
        livenessDetector.performDetection(type: type) { isLive, error in
            if let error = error {
                result(FlutterError(code: "LIVENESS_ERROR", message: error.localizedDescription, details: nil))
            } else {
                result(isLive)
            }
        }
    }
    
    private func handleDetectSpoofing(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let type = args["type"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing type", details: nil))
            return
        }
        
        let isSpoofing = spoofingDetector.detectSpoofing(type: type)
        result(isSpoofing)
    }
    
    private func handleGetHealthBiometrics(result: @escaping FlutterResult) {
        biometricManager.getHealthBiometrics { healthData, error in
            if let error = error {
                result(FlutterError(code: "HEALTH_ERROR", message: error.localizedDescription, details: nil))
            } else {
                result(healthData)
            }
        }
    }
    
    private func handleClearAppBiometric(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let type = args["type"] as? String,
              let appId = args["appId"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing required arguments", details: nil))
            return
        }
        
        let cleared = keychainManager.clearAppKey(appId: appId, biometricType: type)
        result(cleared)
    }
    
    private func handleExportTrainingData(result: @escaping FlutterResult) {
        let data = behavioralAnalyzer.exportTrainingData()
        result(data)
    }
    
    private func handleImportTrainingData(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let data = args["data"] as? [String: Any] else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing data", details: nil))
            return
        }
        
        let imported = behavioralAnalyzer.importTrainingData(data: data)
        result(imported)
    }
}

// MARK: - FlutterStreamHandler
extension FlutterSecureBiometricsPlugin: FlutterStreamHandler {
    public func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink) -> FlutterError? {
        self.eventSink = events
        behavioralAnalyzer.setEventSink(eventSink: events)
        return nil
    }
    
    public func onCancel(withArguments arguments: Any?) -> FlutterError? {
        self.eventSink = nil
        behavioralAnalyzer.setEventSink(eventSink: nil)
        return nil
    }
}
