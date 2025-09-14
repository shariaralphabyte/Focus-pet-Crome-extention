import Foundation
import CoreMotion
import Flutter
#if os(iOS)
import UIKit
#endif

class BehavioralAnalyzer {
    
    private let motionManager = CMMotionManager()
    private var isMonitoring = false
    private var currentAppId: String?
    private var eventSink: FlutterEventSink?
    
    private var behavioralData: [String: [Double]] = [:]
    private var trustScoreHistory: [Double] = []
    private var currentTrustScore: Double = 1.0
    
    // Behavioral pattern baselines
    private var typingSpeedBaseline: [Double] = []
    private var touchPressureBaseline: [Double] = []
    private var deviceMovementBaseline: [Double] = []
    
    private var monitoringTimer: Timer?
    
    func startContinuousMonitoring(config: [String: Any], appId: String) -> Bool {
        guard !isMonitoring else { return false }
        
        currentAppId = appId
        isMonitoring = true
        
        // Start motion sensors
        startMotionMonitoring()
        
        // Start trust score calculation timer
        startTrustScoreCalculation()
        
        return true
    }
    
    func stopContinuousMonitoring() {
        isMonitoring = false
        currentAppId = nil
        
        motionManager.stopAccelerometerUpdates()
        motionManager.stopGyroUpdates()
        motionManager.stopDeviceMotionUpdates()
        
        monitoringTimer?.invalidate()
        monitoringTimer = nil
    }
    
    func getCurrentTrustScore() -> [String: Any] {
        return [
            "value": currentTrustScore,
            "timestamp": Date().timeIntervalSince1970 * 1000,
            "factors": [
                "deviceMovement": getDeviceMovementScore(),
                "behavioralConsistency": getBehavioralConsistencyScore(),
                "temporalPattern": getTemporalPatternScore()
            ],
            "reason": getTrustScoreReason()
        ]
    }
    
    func updateMetrics(metrics: [String: Any]) -> Bool {
        // Update typing pattern metrics
        if let typingPattern = metrics["typingPattern"] as? [String: Any] {
            if let speed = typingPattern["averageSpeed"] as? Double {
                updateTypingSpeed(speed)
            }
            if let pressure = typingPattern["pressure"] as? Double {
                updateTouchPressure(pressure)
            }
        }
        
        // Update touch gesture metrics
        if let touchGesture = metrics["touchGesture"] as? [String: Any] {
            if let pressure = touchGesture["pressureSensitivity"] as? Double {
                updateTouchPressure(pressure)
            }
        }
        
        // Recalculate trust score
        calculateTrustScore()
        
        return true
    }
    
    func lockApplication() {
        currentTrustScore = 0.0
        isMonitoring = false
        
        // Send security alert
        eventSink?([
            "type": "securityAlert",
            "data": [
                "alertType": "applicationLocked",
                "reason": "Trust score too low",
                "timestamp": Date().timeIntervalSince1970 * 1000
            ]
        ])
    }
    
    func exportTrainingData() -> [String: Any] {
        return [
            "typingSpeedBaseline": typingSpeedBaseline,
            "touchPressureBaseline": touchPressureBaseline,
            "deviceMovementBaseline": deviceMovementBaseline,
            "trustScoreHistory": trustScoreHistory,
            "appId": currentAppId ?? "",
            "exportTimestamp": Date().timeIntervalSince1970 * 1000
        ]
    }
    
    func importTrainingData(data: [String: Any]) -> Bool {
        if let typingBaseline = data["typingSpeedBaseline"] as? [Double] {
            typingSpeedBaseline = typingBaseline
        }
        
        if let touchBaseline = data["touchPressureBaseline"] as? [Double] {
            touchPressureBaseline = touchBaseline
        }
        
        if let movementBaseline = data["deviceMovementBaseline"] as? [Double] {
            deviceMovementBaseline = movementBaseline
        }
        
        return true
    }
    
    func setEventSink(eventSink: FlutterEventSink?) {
        self.eventSink = eventSink
    }
    
    // MARK: - Private Methods
    
    private func startMotionMonitoring() {
        guard motionManager.isAccelerometerAvailable && motionManager.isGyroAvailable else { return }
        
        motionManager.accelerometerUpdateInterval = 0.1
        motionManager.gyroUpdateInterval = 0.1
        
        // Start accelerometer updates
        motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, error in
            guard let self = self, let data = data, self.isMonitoring else { return }
            
            let magnitude = sqrt(data.acceleration.x * data.acceleration.x +
                               data.acceleration.y * data.acceleration.y +
                               data.acceleration.z * data.acceleration.z)
            
            self.updateDeviceMovement(magnitude)
        }
        
        // Start gyroscope updates
        motionManager.startGyroUpdates(to: .main) { [weak self] data, error in
            guard let self = self, let data = data, self.isMonitoring else { return }
            
            let rotationMagnitude = sqrt(data.rotationRate.x * data.rotationRate.x +
                                       data.rotationRate.y * data.rotationRate.y +
                                       data.rotationRate.z * data.rotationRate.z)
            
            self.updateDeviceRotation(rotationMagnitude)
        }
    }
    
    private func startTrustScoreCalculation() {
        monitoringTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            guard let self = self, self.isMonitoring else { return }
            
            self.calculateTrustScore()
            
            // Send trust score update
            let trustScore = self.getCurrentTrustScore()
            self.eventSink?([
                "type": "trustScore",
                "data": trustScore
            ])
        }
    }
    
    private func calculateTrustScore() {
        var factors: [String: Double] = [:]
        
        // Device movement consistency
        factors["deviceMovement"] = getDeviceMovementScore()
        
        // Behavioral consistency
        factors["behavioralConsistency"] = getBehavioralConsistencyScore()
        
        // Temporal patterns
        factors["temporalPattern"] = getTemporalPatternScore()
        
        // Calculate weighted average
        let weights: [String: Double] = [
            "deviceMovement": 0.3,
            "behavioralConsistency": 0.5,
            "temporalPattern": 0.2
        ]
        
        currentTrustScore = factors.reduce(0.0) { result, factor in
            result + (factor.value * (weights[factor.key] ?? 0.0))
        }
        
        // Ensure trust score is between 0 and 1
        currentTrustScore = max(0.0, min(1.0, currentTrustScore))
        
        // Add to history
        trustScoreHistory.append(currentTrustScore)
        if trustScoreHistory.count > 100 {
            trustScoreHistory.removeFirst()
        }
    }
    
    private func getDeviceMovementScore() -> Double {
        guard let movementData = behavioralData["deviceMovement"],
              !movementData.isEmpty,
              !deviceMovementBaseline.isEmpty else { return 1.0 }
        
        let recentMovement = Array(movementData.suffix(10)).reduce(0, +) / Double(min(10, movementData.count))
        let baselineMovement = deviceMovementBaseline.reduce(0, +) / Double(deviceMovementBaseline.count)
        
        // Calculate similarity score (closer to baseline = higher score)
        let difference = abs(recentMovement - baselineMovement)
        let maxDifference = baselineMovement * 0.5 // Allow 50% variance
        
        return max(0.0, min(1.0, 1.0 - (difference / maxDifference)))
    }
    
    private func getBehavioralConsistencyScore() -> Double {
        guard !typingSpeedBaseline.isEmpty || !touchPressureBaseline.isEmpty else { return 1.0 }
        
        var consistencyScore = 0.0
        var factorCount = 0
        
        // Typing speed consistency
        if !typingSpeedBaseline.isEmpty,
           let typingData = behavioralData["typingSpeed"],
           !typingData.isEmpty {
            let recentTyping = Array(typingData.suffix(5)).reduce(0, +) / Double(min(5, typingData.count))
            let baselineTyping = typingSpeedBaseline.reduce(0, +) / Double(typingSpeedBaseline.count)
            let typingConsistency = max(0.0, 1.0 - abs(recentTyping - baselineTyping) / baselineTyping)
            consistencyScore += typingConsistency
            factorCount += 1
        }
        
        // Touch pressure consistency
        if !touchPressureBaseline.isEmpty,
           let pressureData = behavioralData["touchPressure"],
           !pressureData.isEmpty {
            let recentPressure = Array(pressureData.suffix(5)).reduce(0, +) / Double(min(5, pressureData.count))
            let baselinePressure = touchPressureBaseline.reduce(0, +) / Double(touchPressureBaseline.count)
            let pressureConsistency = max(0.0, 1.0 - abs(recentPressure - baselinePressure) / baselinePressure)
            consistencyScore += pressureConsistency
            factorCount += 1
        }
        
        return factorCount > 0 ? consistencyScore / Double(factorCount) : 1.0
    }
    
    private func getTemporalPatternScore() -> Double {
        guard trustScoreHistory.count >= 10 else { return 1.0 }
        
        let recentScores = Array(trustScoreHistory.suffix(10))
        let variance = calculateVariance(recentScores)
        
        // Lower variance indicates more consistent behavior
        return max(0.0, min(1.0, 1.0 - variance))
    }
    
    private func getTrustScoreReason() -> String {
        switch currentTrustScore {
        case 0.9...1.0:
            return "Excellent behavioral match"
        case 0.8..<0.9:
            return "Good behavioral consistency"
        case 0.7..<0.8:
            return "Acceptable behavioral patterns"
        case 0.6..<0.7:
            return "Some behavioral inconsistencies detected"
        default:
            return "Significant behavioral anomalies detected"
        }
    }
    
    private func updateTypingSpeed(_ speed: Double) {
        if behavioralData["typingSpeed"] == nil {
            behavioralData["typingSpeed"] = []
        }
        behavioralData["typingSpeed"]?.append(speed)
        
        if behavioralData["typingSpeed"]!.count > 50 {
            behavioralData["typingSpeed"]?.removeFirst()
        }
        
        // Update baseline if we have enough data
        if typingSpeedBaseline.count < 20 {
            typingSpeedBaseline.append(speed)
        }
    }
    
    private func updateTouchPressure(_ pressure: Double) {
        if behavioralData["touchPressure"] == nil {
            behavioralData["touchPressure"] = []
        }
        behavioralData["touchPressure"]?.append(pressure)
        
        if behavioralData["touchPressure"]!.count > 50 {
            behavioralData["touchPressure"]?.removeFirst()
        }
        
        // Update baseline if we have enough data
        if touchPressureBaseline.count < 20 {
            touchPressureBaseline.append(pressure)
        }
    }
    
    private func updateDeviceMovement(_ movement: Double) {
        if behavioralData["deviceMovement"] == nil {
            behavioralData["deviceMovement"] = []
        }
        behavioralData["deviceMovement"]?.append(movement)
        
        if behavioralData["deviceMovement"]!.count > 100 {
            behavioralData["deviceMovement"]?.removeFirst()
        }
        
        // Update baseline if we have enough data
        if deviceMovementBaseline.count < 50 {
            deviceMovementBaseline.append(movement)
        }
    }
    
    private func updateDeviceRotation(_ rotation: Double) {
        if behavioralData["deviceRotation"] == nil {
            behavioralData["deviceRotation"] = []
        }
        behavioralData["deviceRotation"]?.append(rotation)
        
        if behavioralData["deviceRotation"]!.count > 100 {
            behavioralData["deviceRotation"]?.removeFirst()
        }
    }
    
    private func calculateVariance(_ values: [Double]) -> Double {
        guard !values.isEmpty else { return 0.0 }
        
        let mean = values.reduce(0, +) / Double(values.count)
        let squaredDifferences = values.map { pow($0 - mean, 2) }
        return squaredDifferences.reduce(0, +) / Double(values.count)
    }
}
