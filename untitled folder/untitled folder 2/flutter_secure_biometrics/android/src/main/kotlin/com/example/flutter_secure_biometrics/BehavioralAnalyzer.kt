package com.example.flutter_secure_biometrics

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.sqrt

class BehavioralAnalyzer : SensorEventListener {
    
    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var gyroscope: Sensor? = null
    private var isMonitoring = false
    
    private val behavioralData = ConcurrentHashMap<String, MutableList<Double>>()
    private val trustScoreHistory = mutableListOf<Double>()
    private var currentTrustScore = 1.0
    private var currentAppId: String? = null
    
    private val monitoringScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private val handler = Handler(Looper.getMainLooper())
    
    // Behavioral pattern baselines
    private val typingSpeedBaseline = mutableListOf<Double>()
    private val touchPressureBaseline = mutableListOf<Double>()
    private val deviceMovementBaseline = mutableListOf<Double>()
    
    fun startContinuousMonitoring(context: Context, config: Map<String, Any>, appId: String): Boolean {
        return try {
            currentAppId = appId
            sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
            accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
            
            // Register sensor listeners
            accelerometer?.let {
                sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
            }
            gyroscope?.let {
                sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
            }
            
            isMonitoring = true
            startTrustScoreCalculation()
            
            true
        } catch (e: Exception) {
            false
        }
    }
    
    fun stopContinuousMonitoring() {
        isMonitoring = false
        sensorManager?.unregisterListener(this)
        monitoringScope.cancel()
        currentAppId = null
    }
    
    fun getCurrentTrustScore(): Map<String, Any> {
        return mapOf(
            "value" to currentTrustScore,
            "timestamp" to System.currentTimeMillis(),
            "factors" to mapOf(
                "deviceMovement" to getDeviceMovementScore(),
                "behavioralConsistency" to getBehavioralConsistencyScore(),
                "temporalPattern" to getTemporalPatternScore()
            ),
            "reason" to getTrustScoreReason()
        )
    }
    
    fun updateMetrics(metrics: Map<String, Any>): Boolean {
        return try {
            // Update typing pattern metrics
            (metrics["typingPattern"] as? Map<String, Any>)?.let { typing ->
                (typing["averageSpeed"] as? Double)?.let { speed ->
                    updateTypingSpeed(speed)
                }
                (typing["pressure"] as? Double)?.let { pressure ->
                    updateTouchPressure(pressure)
                }
            }
            
            // Update touch gesture metrics
            (metrics["touchGesture"] as? Map<String, Any>)?.let { touch ->
                (touch["pressureSensitivity"] as? Double)?.let { pressure ->
                    updateTouchPressure(pressure)
                }
            }
            
            // Recalculate trust score
            calculateTrustScore()
            
            true
        } catch (e: Exception) {
            false
        }
    }
    
    fun lockApplication() {
        currentTrustScore = 0.0
        isMonitoring = false
    }
    
    fun exportTrainingData(): Map<String, Any> {
        return mapOf(
            "typingSpeedBaseline" to typingSpeedBaseline.toList(),
            "touchPressureBaseline" to touchPressureBaseline.toList(),
            "deviceMovementBaseline" to deviceMovementBaseline.toList(),
            "trustScoreHistory" to trustScoreHistory.toList(),
            "appId" to (currentAppId ?: ""),
            "exportTimestamp" to System.currentTimeMillis()
        )
    }
    
    fun importTrainingData(data: Map<String, Any>): Boolean {
        return try {
            (data["typingSpeedBaseline"] as? List<Double>)?.let {
                typingSpeedBaseline.clear()
                typingSpeedBaseline.addAll(it)
            }
            
            (data["touchPressureBaseline"] as? List<Double>)?.let {
                touchPressureBaseline.clear()
                touchPressureBaseline.addAll(it)
            }
            
            (data["deviceMovementBaseline"] as? List<Double>)?.let {
                deviceMovementBaseline.clear()
                deviceMovementBaseline.addAll(it)
            }
            
            true
        } catch (e: Exception) {
            false
        }
    }
    
    override fun onSensorChanged(event: SensorEvent?) {
        if (!isMonitoring || event == null) return
        
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                val magnitude = sqrt(
                    event.values[0] * event.values[0] +
                    event.values[1] * event.values[1] +
                    event.values[2] * event.values[2]
                )
                updateDeviceMovement(magnitude.toDouble())
            }
            
            Sensor.TYPE_GYROSCOPE -> {
                val rotationMagnitude = sqrt(
                    event.values[0] * event.values[0] +
                    event.values[1] * event.values[1] +
                    event.values[2] * event.values[2]
                )
                updateDeviceRotation(rotationMagnitude.toDouble())
            }
        }
    }
    
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Handle sensor accuracy changes if needed
    }
    
    private fun startTrustScoreCalculation() {
        monitoringScope.launch {
            while (isMonitoring) {
                calculateTrustScore()
                delay(5000) // Update every 5 seconds
            }
        }
    }
    
    private fun calculateTrustScore() {
        val factors = mutableMapOf<String, Double>()
        
        // Device movement consistency
        factors["deviceMovement"] = getDeviceMovementScore()
        
        // Behavioral consistency
        factors["behavioralConsistency"] = getBehavioralConsistencyScore()
        
        // Temporal patterns
        factors["temporalPattern"] = getTemporalPatternScore()
        
        // Calculate weighted average
        val weights = mapOf(
            "deviceMovement" to 0.3,
            "behavioralConsistency" to 0.5,
            "temporalPattern" to 0.2
        )
        
        currentTrustScore = factors.entries.sumOf { (key, value) ->
            value * (weights[key] ?: 0.0)
        }
        
        // Ensure trust score is between 0 and 1
        currentTrustScore = currentTrustScore.coerceIn(0.0, 1.0)
        
        // Add to history
        trustScoreHistory.add(currentTrustScore)
        if (trustScoreHistory.size > 100) {
            trustScoreHistory.removeAt(0)
        }
    }
    
    private fun getDeviceMovementScore(): Double {
        val movementData = behavioralData["deviceMovement"] ?: return 1.0
        if (movementData.isEmpty() || deviceMovementBaseline.isEmpty()) return 1.0
        
        val recentMovement = movementData.takeLast(10).average()
        val baselineMovement = deviceMovementBaseline.average()
        
        // Calculate similarity score (closer to baseline = higher score)
        val difference = kotlin.math.abs(recentMovement - baselineMovement)
        val maxDifference = baselineMovement * 0.5 // Allow 50% variance
        
        return (1.0 - (difference / maxDifference)).coerceIn(0.0, 1.0)
    }
    
    private fun getBehavioralConsistencyScore(): Double {
        if (typingSpeedBaseline.isEmpty() && touchPressureBaseline.isEmpty()) return 1.0
        
        var consistencyScore = 0.0
        var factorCount = 0
        
        // Typing speed consistency
        if (typingSpeedBaseline.isNotEmpty()) {
            val typingData = behavioralData["typingSpeed"] ?: emptyList()
            if (typingData.isNotEmpty()) {
                val recentTyping = typingData.takeLast(5).average()
                val baselineTyping = typingSpeedBaseline.average()
                val typingConsistency = 1.0 - (kotlin.math.abs(recentTyping - baselineTyping) / baselineTyping).coerceAtMost(1.0)
                consistencyScore += typingConsistency
                factorCount++
            }
        }
        
        // Touch pressure consistency
        if (touchPressureBaseline.isNotEmpty()) {
            val pressureData = behavioralData["touchPressure"] ?: emptyList()
            if (pressureData.isNotEmpty()) {
                val recentPressure = pressureData.takeLast(5).average()
                val baselinePressure = touchPressureBaseline.average()
                val pressureConsistency = 1.0 - (kotlin.math.abs(recentPressure - baselinePressure) / baselinePressure).coerceAtMost(1.0)
                consistencyScore += pressureConsistency
                factorCount++
            }
        }
        
        return if (factorCount > 0) consistencyScore / factorCount else 1.0
    }
    
    private fun getTemporalPatternScore(): Double {
        // Analyze temporal patterns in user behavior
        if (trustScoreHistory.size < 10) return 1.0
        
        val recentScores = trustScoreHistory.takeLast(10)
        val variance = calculateVariance(recentScores)
        
        // Lower variance indicates more consistent behavior
        return (1.0 - variance).coerceIn(0.0, 1.0)
    }
    
    private fun getTrustScoreReason(): String {
        return when {
            currentTrustScore >= 0.9 -> "Excellent behavioral match"
            currentTrustScore >= 0.8 -> "Good behavioral consistency"
            currentTrustScore >= 0.7 -> "Acceptable behavioral patterns"
            currentTrustScore >= 0.6 -> "Some behavioral inconsistencies detected"
            else -> "Significant behavioral anomalies detected"
        }
    }
    
    private fun updateTypingSpeed(speed: Double) {
        val typingData = behavioralData.getOrPut("typingSpeed") { mutableListOf() }
        typingData.add(speed)
        if (typingData.size > 50) typingData.removeAt(0)
        
        // Update baseline if we have enough data
        if (typingSpeedBaseline.size < 20) {
            typingSpeedBaseline.add(speed)
        }
    }
    
    private fun updateTouchPressure(pressure: Double) {
        val pressureData = behavioralData.getOrPut("touchPressure") { mutableListOf() }
        pressureData.add(pressure)
        if (pressureData.size > 50) pressureData.removeAt(0)
        
        // Update baseline if we have enough data
        if (touchPressureBaseline.size < 20) {
            touchPressureBaseline.add(pressure)
        }
    }
    
    private fun updateDeviceMovement(movement: Double) {
        val movementData = behavioralData.getOrPut("deviceMovement") { mutableListOf() }
        movementData.add(movement)
        if (movementData.size > 100) movementData.removeAt(0)
        
        // Update baseline if we have enough data
        if (deviceMovementBaseline.size < 50) {
            deviceMovementBaseline.add(movement)
        }
    }
    
    private fun updateDeviceRotation(rotation: Double) {
        val rotationData = behavioralData.getOrPut("deviceRotation") { mutableListOf() }
        rotationData.add(rotation)
        if (rotationData.size > 100) rotationData.removeAt(0)
    }
    
    private fun calculateVariance(values: List<Double>): Double {
        if (values.isEmpty()) return 0.0
        val mean = values.average()
        val squaredDifferences = values.map { (it - mean) * (it - mean) }
        return squaredDifferences.average()
    }
}
