import Foundation
import CoreMotion
import Flutter
#if os(iOS)
import UIKit
#endif

class IOSGestureDetector {
    private let motionManager = CMMotionManager()
    private var eventSink: FlutterEventSink?
    private var config: [String: Any] = [:]
    private var isDetecting = false
    
    // Configuration
    private var sensitivity: Double = 0.7
    private var enableBackTap = true
    private var enableCustomPatterns = false
    private var enableFalsePositivePrevention = true
    
    // Detection state
    private var lastTapTime: TimeInterval = 0
    private var tapCount = 0
    private let tapTimeout: TimeInterval = 0.5
    private let doubleTapWindow: TimeInterval = 0.3
    private let tripleTapWindow: TimeInterval = 0.6
    
    // Sensor data buffers
    private var accelerometerBuffer: [CMAccelerometerData] = []
    private var gyroBuffer: [CMGyroData] = []
    private let bufferSize = 50
    
    // Statistics
    private var statistics: [String: Any] = [:]
    
    // Custom patterns
    private var customPatterns: [String: GesturePattern] = [:]
    
    struct GesturePattern {
        let id: String
        let intervals: [Int]
        let tolerance: Int
        let minConfidence: Double
    }
    
    struct TapData {
        let timestamp: TimeInterval
        let acceleration: [Double]
        let gyroscope: [Double]
        let magnitude: Double
        let confidence: Double
    }
    
    init(config: [String: Any]) {
        self.config = config
        updateConfigInternal(config: config)
        setupMotionManager()
    }
    
    private func setupMotionManager() {
        // Configure accelerometer
        if motionManager.isAccelerometerAvailable {
            motionManager.accelerometerUpdateInterval = 0.02 // 50Hz
        }
        
        // Configure gyroscope
        if motionManager.isGyroAvailable {
            motionManager.gyroUpdateInterval = 0.02 // 50Hz
        }
        
        // Configure device motion (includes attitude, rotation rate, user acceleration)
        if motionManager.isDeviceMotionAvailable {
            motionManager.deviceMotionUpdateInterval = 0.02 // 50Hz
        }
    }
    
    func startDetection() throws {
        guard !isDetecting else { return }
        
        isDetecting = true
        
        // Start accelerometer updates
        if motionManager.isAccelerometerAvailable {
            motionManager.startAccelerometerUpdates(to: OperationQueue.main) { [weak self] (data, error) in
                guard let self = self, let data = data else { return }
                self.processAccelerometerData(data)
            }
        }
        
        // Start gyroscope updates
        if motionManager.isGyroAvailable {
            motionManager.startGyroUpdates(to: OperationQueue.main) { [weak self] (data, error) in
                guard let self = self, let data = data else { return }
                self.processGyroData(data)
            }
        }
        
        // Start device motion updates for better accuracy
        if motionManager.isDeviceMotionAvailable {
            motionManager.startDeviceMotionUpdates(to: OperationQueue.main) { [weak self] (motion, error) in
                guard let self = self, let motion = motion else { return }
                self.processDeviceMotion(motion)
            }
        }
        
        print("iOS gesture detection started")
    }
    
    func stopDetection() {
        guard isDetecting else { return }
        
        isDetecting = false
        motionManager.stopAccelerometerUpdates()
        motionManager.stopGyroUpdates()
        motionManager.stopDeviceMotionUpdates()
        
        print("iOS gesture detection stopped")
    }
    
    func setEventSink(_ sink: FlutterEventSink?) {
        eventSink = sink
    }
    
    private func processAccelerometerData(_ data: CMAccelerometerData) {
        // Add to buffer
        accelerometerBuffer.append(data)
        if accelerometerBuffer.count > bufferSize {
            accelerometerBuffer.removeFirst()
        }
        
        // Calculate magnitude
        let magnitude = sqrt(data.acceleration.x * data.acceleration.x +
                           data.acceleration.y * data.acceleration.y +
                           data.acceleration.z * data.acceleration.z)
        
        // Apply gravity compensation (iOS provides user acceleration in device motion)
        let gravityCompensated = magnitude - 1.0 // Normalized gravity
        
        // Check for tap threshold
        let threshold = 2.0 * sensitivity // Adjusted for iOS sensitivity
        if enableBackTap && abs(gravityCompensated) > threshold {
            let confidence = calculateTapConfidence(data)
            
            if confidence > 0.5 && !shouldFilterTap() {
                processTapEvent(timestamp: data.timestamp, 
                              acceleration: [data.acceleration.x, data.acceleration.y, data.acceleration.z],
                              confidence: confidence)
            }
        }
    }
    
    private func processGyroData(_ data: CMGyroData) {
        // Add to buffer
        gyroBuffer.append(data)
        if gyroBuffer.count > bufferSize {
            gyroBuffer.removeFirst()
        }
    }
    
    private func processDeviceMotion(_ motion: CMDeviceMotion) {
        // Use user acceleration (gravity removed) for more accurate detection
        let userAccel = motion.userAcceleration
        let magnitude = sqrt(userAccel.x * userAccel.x + 
                           userAccel.y * userAccel.y + 
                           userAccel.z * userAccel.z)
        
        let threshold = 1.5 * sensitivity
        if enableBackTap && magnitude > threshold {
            let confidence = calculateDeviceMotionConfidence(motion)
            
            if confidence > 0.5 && !shouldFilterTap() {
                processTapEvent(timestamp: motion.timestamp,
                              acceleration: [userAccel.x, userAccel.y, userAccel.z],
                              confidence: confidence)
            }
        }
    }
    
    private func calculateTapConfidence(_ data: CMAccelerometerData) -> Double {
        let magnitude = sqrt(data.acceleration.x * data.acceleration.x +
                           data.acceleration.y * data.acceleration.y +
                           data.acceleration.z * data.acceleration.z)
        
        // iOS back tap typically shows strong Z-axis component
        let zAxisRatio = abs(data.acceleration.z) / magnitude
        
        // Get gyro data for rotation analysis
        let gyroMagnitude: Double
        if let lastGyro = gyroBuffer.last {
            gyroMagnitude = sqrt(lastGyro.rotationRate.x * lastGyro.rotationRate.x +
                               lastGyro.rotationRate.y * lastGyro.rotationRate.y +
                               lastGyro.rotationRate.z * lastGyro.rotationRate.z)
        } else {
            gyroMagnitude = 0
        }
        
        let rotationPenalty = min(1.0, gyroMagnitude / 2.0)
        var confidence = zAxisRatio * (1.0 - rotationPenalty)
        
        // Apply sensitivity adjustment
        confidence *= sensitivity
        
        return max(0.0, min(1.0, confidence))
    }
    
    private func calculateDeviceMotionConfidence(_ motion: CMDeviceMotion) -> Double {
        let userAccel = motion.userAcceleration
        let magnitude = sqrt(userAccel.x * userAccel.x + 
                           userAccel.y * userAccel.y + 
                           userAccel.z * userAccel.z)
        
        // Back tap confidence based on user acceleration pattern
        let zAxisRatio = abs(userAccel.z) / max(magnitude, 0.001)
        let rotationMagnitude = sqrt(motion.rotationRate.x * motion.rotationRate.x +
                                   motion.rotationRate.y * motion.rotationRate.y +
                                   motion.rotationRate.z * motion.rotationRate.z)
        
        let rotationPenalty = min(1.0, rotationMagnitude / 2.0)
        var confidence = zAxisRatio * (1.0 - rotationPenalty)
        
        confidence *= sensitivity
        
        return max(0.0, min(1.0, confidence))
    }
    
    private func shouldFilterTap() -> Bool {
        if !enableFalsePositivePrevention { return false }
        
        let currentTime = CFAbsoluteTimeGetCurrent()
        
        // Filter rapid successive taps (potential vibrations)
        if currentTime - lastTapTime < 0.05 { return true }
        
        // Additional iOS-specific filtering could be added here
        // (e.g., using proximity sensor if available, device orientation)
        
        return false
    }
    
    private func processTapEvent(timestamp: TimeInterval, acceleration: [Double], confidence: Double) {
        let currentTime = CFAbsoluteTimeGetCurrent()
        
        // Determine tap type based on timing
        if currentTime - lastTapTime > tripleTapWindow {
            tapCount = 1
        } else if currentTime - lastTapTime <= doubleTapWindow {
            tapCount += 1
        }
        
        lastTapTime = currentTime
        
        // Schedule tap type determination
        DispatchQueue.main.asyncAfter(deadline: .now() + tapTimeout) { [weak self] in
            self?.determineTapType(count: self?.tapCount ?? 1, confidence: confidence)
            self?.tapCount = 0
        }
    }
    
    private func determineTapType(count: Int, confidence: Double) {
        let tapType: String
        switch count {
        case 1:
            tapType = "backSingleTap"
        case 2:
            tapType = "backDoubleTap"
        case 3:
            tapType = "backTripleTap"
        default:
            tapType = "backSingleTap"
        }
        
        sendTapEvent(type: tapType, confidence: confidence)
        updateStatistics(tapType: tapType)
    }
    
    private func sendTapEvent(type: String, confidence: Double) {
        let event: [String: Any] = [
            "type": type,
            "timestamp": Int64(Date().timeIntervalSince1970 * 1000),
            "confidence": confidence,
            "sensorData": [
                "accelerometer": accelerometerBuffer.last?.acceleration != nil ? 
                    [accelerometerBuffer.last!.acceleration.x, 
                     accelerometerBuffer.last!.acceleration.y, 
                     accelerometerBuffer.last!.acceleration.z] : [0, 0, 0],
                "gyroscope": gyroBuffer.last?.rotationRate != nil ?
                    [gyroBuffer.last!.rotationRate.x,
                     gyroBuffer.last!.rotationRate.y,
                     gyroBuffer.last!.rotationRate.z] : [0, 0, 0]
            ],
            "duration": 100,
            "intensity": confidence,
            "metadata": [
                "deviceOrientation": getDeviceOrientation(),
                "platform": "iOS"
            ]
        ]
        
        eventSink?(event)
        print("iOS tap event sent: \(type) with confidence \(confidence)")
    }
    
    private func getDeviceOrientation() -> String {
        switch UIDevice.current.orientation {
        case .portrait:
            return "portrait"
        case .portraitUpsideDown:
            return "portraitUpsideDown"
        case .landscapeLeft:
            return "landscapeLeft"
        case .landscapeRight:
            return "landscapeRight"
        case .faceUp:
            return "faceUp"
        case .faceDown:
            return "faceDown"
        default:
            return "unknown"
        }
    }
    
    private func updateStatistics(tapType: String) {
        let currentCount = statistics[tapType] as? Int ?? 0
        statistics[tapType] = currentCount + 1
        statistics["totalTaps"] = (statistics["totalTaps"] as? Int ?? 0) + 1
        statistics["lastTapTime"] = Int64(Date().timeIntervalSince1970 * 1000)
    }
    
    // Public API methods
    
    func updateConfig(config: [String: Any]) {
        self.config = config
        updateConfigInternal(config: config)
    }
    
    private func updateConfigInternal(config: [String: Any]) {
        sensitivity = config["sensitivity"] as? Double ?? 0.7
        enableBackTap = config["enableBackTap"] as? Bool ?? true
        enableCustomPatterns = config["enableCustomPatterns"] as? Bool ?? false
        enableFalsePositivePrevention = config["enableFalsePositivePrevention"] as? Bool ?? true
        
        // Update motion manager intervals based on sensor sampling rate
        let samplingRate = config["sensorSamplingRate"] as? Int ?? 50
        let interval = 1.0 / Double(samplingRate)
        
        motionManager.accelerometerUpdateInterval = interval
        motionManager.gyroUpdateInterval = interval
        motionManager.deviceMotionUpdateInterval = interval
    }
    
    func addCustomPattern(pattern: [String: Any]) {
        guard let id = pattern["id"] as? String,
              let intervals = pattern["intervals"] as? [Int] else { return }
        
        let tolerance = pattern["tolerance"] as? Int ?? 50
        let minConfidence = pattern["minConfidence"] as? Double ?? 0.7
        
        customPatterns[id] = GesturePattern(id: id, intervals: intervals, tolerance: tolerance, minConfidence: minConfidence)
    }
    
    func removeCustomPattern(patternId: String) {
        customPatterns.removeValue(forKey: patternId)
    }
    
    func trainGesture(gestureId: String, trainingData: [[String: Any]]) -> Bool {
        // Placeholder for ML training implementation
        print("Training gesture: \(gestureId) with \(trainingData.count) samples")
        return true
    }
    
    func getStatistics() -> [String: Any] {
        return statistics
    }
    
    func isSupported() -> Bool {
        return motionManager.isAccelerometerAvailable && motionManager.isGyroAvailable
    }
    
    func getAvailableSensors() -> [String] {
        var sensors: [String] = []
        if motionManager.isAccelerometerAvailable { sensors.append("accelerometer") }
        if motionManager.isGyroAvailable { sensors.append("gyroscope") }
        if motionManager.isDeviceMotionAvailable { sensors.append("deviceMotion") }
        if motionManager.isMagnetometerAvailable { sensors.append("magnetometer") }
        return sensors
    }
    
    func calibrateSensors() -> Bool {
        // iOS handles sensor calibration automatically
        print("iOS sensors are automatically calibrated")
        return true
    }
    
    func exportTrainingData() -> [String: Any]? {
        return [
            "accelerometerBuffer": accelerometerBuffer.suffix(10).map { data in
                [
                    "timestamp": data.timestamp,
                    "x": data.acceleration.x,
                    "y": data.acceleration.y,
                    "z": data.acceleration.z
                ]
            },
            "gyroBuffer": gyroBuffer.suffix(10).map { data in
                [
                    "timestamp": data.timestamp,
                    "x": data.rotationRate.x,
                    "y": data.rotationRate.y,
                    "z": data.rotationRate.z
                ]
            },
            "statistics": statistics
        ]
    }
    
    func importTrainingData(data: [String: Any]) -> Bool {
        // Placeholder for importing training data
        print("Importing training data...")
        return true
    }
    
    func dispose() {
        stopDetection()
        accelerometerBuffer.removeAll()
        gyroBuffer.removeAll()
        customPatterns.removeAll()
        statistics.removeAll()
    }
}
