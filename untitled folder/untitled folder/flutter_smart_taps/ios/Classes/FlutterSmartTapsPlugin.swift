import Flutter
import UIKit
import CoreMotion
import Foundation

public class FlutterSmartTapsPlugin: NSObject, FlutterPlugin {
    private var methodChannel: FlutterMethodChannel?
    private var eventChannel: FlutterEventChannel?
    private var gestureDetector: IOSGestureDetector?
    private var eventSink: FlutterEventSink?
    
    public static func register(with registrar: FlutterPluginRegistrar) {
        let methodChannel = FlutterMethodChannel(name: "flutter_smart_taps", binaryMessenger: registrar.messenger())
        let eventChannel = FlutterEventChannel(name: "flutter_smart_taps/events", binaryMessenger: registrar.messenger())
        let instance = FlutterSmartTapsPlugin()
        
        instance.methodChannel = methodChannel
        instance.eventChannel = eventChannel
        
        registrar.addMethodCallDelegate(instance, channel: methodChannel)
        eventChannel.setStreamHandler(instance)
    }

    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "initialize":
            let config = call.arguments as? [String: Any] ?? [:]
            initialize(config: config, result: result)
        case "startDetection":
            startDetection(result: result)
        case "stopDetection":
            stopDetection(result: result)
        case "updateConfig":
            let config = call.arguments as? [String: Any] ?? [:]
            updateConfig(config: config, result: result)
        case "addCustomPattern":
            let pattern = call.arguments as? [String: Any] ?? [:]
            addCustomPattern(pattern: pattern, result: result)
        case "removeCustomPattern":
            let args = call.arguments as? [String: Any] ?? [:]
            let patternId = args["patternId"] as? String ?? ""
            removeCustomPattern(patternId: patternId, result: result)
        case "trainGesture":
            let args = call.arguments as? [String: Any] ?? [:]
            trainGesture(args: args, result: result)
        case "getStatistics":
            getStatistics(result: result)
        case "isSupported":
            isSupported(result: result)
        case "getAvailableSensors":
            getAvailableSensors(result: result)
        case "calibrateSensors":
            calibrateSensors(result: result)
        case "exportTrainingData":
            exportTrainingData(result: result)
        case "importTrainingData":
            let data = call.arguments as? [String: Any] ?? [:]
            importTrainingData(data: data, result: result)
        case "dispose":
            dispose(result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }
    
    private func initialize(config: [String: Any], result: @escaping FlutterResult) {
        do {
            gestureDetector = IOSGestureDetector(config: config)
            gestureDetector?.setEventSink(eventSink)
            result(true)
        } catch {
            result(FlutterError(code: "INIT_ERROR", message: "Failed to initialize gesture detector: \(error.localizedDescription)", details: nil))
        }
    }
    
    private func startDetection(result: @escaping FlutterResult) {
        do {
            try gestureDetector?.startDetection()
            result(true)
        } catch {
            result(FlutterError(code: "START_ERROR", message: "Failed to start detection: \(error.localizedDescription)", details: nil))
        }
    }
    
    private func stopDetection(result: @escaping FlutterResult) {
        gestureDetector?.stopDetection()
        result(true)
    }
    
    private func updateConfig(config: [String: Any], result: @escaping FlutterResult) {
        gestureDetector?.updateConfig(config: config)
        result(true)
    }
    
    private func addCustomPattern(pattern: [String: Any], result: @escaping FlutterResult) {
        gestureDetector?.addCustomPattern(pattern: pattern)
        result(true)
    }
    
    private func removeCustomPattern(patternId: String, result: @escaping FlutterResult) {
        gestureDetector?.removeCustomPattern(patternId: patternId)
        result(true)
    }
    
    private func trainGesture(args: [String: Any], result: @escaping FlutterResult) {
        let gestureId = args["gestureId"] as? String ?? ""
        let trainingData = args["trainingData"] as? [[String: Any]] ?? []
        let success = gestureDetector?.trainGesture(gestureId: gestureId, trainingData: trainingData) ?? false
        result(success)
    }
    
    private func getStatistics(result: @escaping FlutterResult) {
        let stats = gestureDetector?.getStatistics() ?? [:]
        result(stats)
    }
    
    private func isSupported(result: @escaping FlutterResult) {
        let supported = gestureDetector?.isSupported() ?? false
        result(supported)
    }
    
    private func getAvailableSensors(result: @escaping FlutterResult) {
        let sensors = gestureDetector?.getAvailableSensors() ?? []
        result(sensors)
    }
    
    private func calibrateSensors(result: @escaping FlutterResult) {
        let success = gestureDetector?.calibrateSensors() ?? false
        result(success)
    }
    
    private func exportTrainingData(result: @escaping FlutterResult) {
        let data = gestureDetector?.exportTrainingData()
        result(data)
    }
    
    private func importTrainingData(data: [String: Any], result: @escaping FlutterResult) {
        let success = gestureDetector?.importTrainingData(data: data) ?? false
        result(success)
    }
    
    private func dispose(result: @escaping FlutterResult) {
        gestureDetector?.dispose()
        result(true)
    }
}

extension FlutterSmartTapsPlugin: FlutterStreamHandler {
    public func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink) -> FlutterError? {
        eventSink = events
        gestureDetector?.setEventSink(events)
        return nil
    }
    
    public func onCancel(withArguments arguments: Any?) -> FlutterError? {
        eventSink = nil
        gestureDetector?.setEventSink(nil)
        return nil
    }
}
