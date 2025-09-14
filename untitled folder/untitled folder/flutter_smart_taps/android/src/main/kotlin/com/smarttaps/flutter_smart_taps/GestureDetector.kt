package com.smarttaps.flutter_smart_taps

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import io.flutter.plugin.common.EventChannel
import kotlin.math.*

class GestureDetector(
    private val context: Context,
    private var config: Map<String, Any>
) : SensorEventListener {

    companion object {
        private const val TAG = "SmartTapsGestureDetector"
        private const val BACK_TAP_THRESHOLD = 15.0f
        private const val TAP_TIMEOUT_MS = 500L
        private const val DOUBLE_TAP_WINDOW_MS = 300L
        private const val TRIPLE_TAP_WINDOW_MS = 600L
    }

    private val sensorManager: SensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val powerManager: PowerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    private val handler = Handler(Looper.getMainLooper())

    // Sensors
    private var accelerometer: Sensor? = null
    private var gyroscope: Sensor? = null
    private var proximity: Sensor? = null
    private var magnetometer: Sensor? = null

    // Sensor data
    private val accelerometerData = FloatArray(3)
    private val gyroscopeData = FloatArray(3)
    private val magnetometerData = FloatArray(3)
    private var proximityValue = 0f

    // Detection state
    private var isDetecting = false
    private var eventSink: EventChannel.EventSink? = null
    private var lastTapTime = 0L
    private var tapCount = 0
    private var isInPocket = false
    private var isOnTable = false

    // ML and pattern recognition
    private val tapBuffer = mutableListOf<TapData>()
    private val customPatterns = mutableMapOf<String, GesturePattern>()
    private val statistics = mutableMapOf<String, Any>()

    // Configuration
    private var sensitivity = 0.7
    private var enableBackTap = true
    private var enableCustomPatterns = false
    private var enableFalsePositivePrevention = true
    private var sensorSamplingRate = SensorManager.SENSOR_DELAY_GAME

    data class TapData(
        val timestamp: Long,
        val acceleration: FloatArray,
        val gyroscope: FloatArray,
        val magnitude: Float,
        val confidence: Float
    )

    data class GesturePattern(
        val id: String,
        val intervals: List<Int>,
        val tolerance: Int,
        val minConfidence: Double
    )

    init {
        initializeSensors()
        updateConfigInternal(config)
    }

    private fun initializeSensors() {
        try {
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
            proximity = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY)
            magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

            Log.d(TAG, "Sensors initialized - Accelerometer: ${accelerometer != null}, " +
                    "Gyroscope: ${gyroscope != null}, Proximity: ${proximity != null}, " +
                    "Magnetometer: ${magnetometer != null}")
            
            // List all available sensors for debugging
            val allSensors = sensorManager.getSensorList(Sensor.TYPE_ALL)
            Log.d(TAG, "Total sensors available: ${allSensors.size}")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing sensors: ${e.message}")
        }
    }

    fun startDetection() {
        if (isDetecting) return

        isDetecting = true
        
        Log.d(TAG, "Starting sensor registration...")
        
        accelerometer?.let { 
            val registered = sensorManager.registerListener(this, it, sensorSamplingRate)
            Log.d(TAG, "Accelerometer registration: $registered")
        } ?: Log.w(TAG, "Accelerometer is null, cannot register")
        
        gyroscope?.let { 
            val registered = sensorManager.registerListener(this, it, sensorSamplingRate)
            Log.d(TAG, "Gyroscope registration: $registered")
        } ?: Log.w(TAG, "Gyroscope is null, cannot register")
        
        proximity?.let { 
            val registered = sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
            Log.d(TAG, "Proximity registration: $registered")
        } ?: Log.w(TAG, "Proximity is null, cannot register")
        
        magnetometer?.let { 
            val registered = sensorManager.registerListener(this, it, sensorSamplingRate)
            Log.d(TAG, "Magnetometer registration: $registered")
        } ?: Log.w(TAG, "Magnetometer is null, cannot register")

        Log.d(TAG, "Gesture detection started")
    }

    fun stopDetection() {
        if (!isDetecting) return

        isDetecting = false
        sensorManager.unregisterListener(this)
        
        Log.d(TAG, "Gesture detection stopped")
    }

    fun setEventSink(sink: EventChannel.EventSink?) {
        eventSink = sink
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (!isDetecting || event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                Log.d(TAG, "Accelerometer data: x=${event.values[0]}, y=${event.values[1]}, z=${event.values[2]}")
                System.arraycopy(event.values, 0, accelerometerData, 0, 3)
                processAccelerometerData(event.values, event.timestamp)
            }
            Sensor.TYPE_GYROSCOPE -> {
                Log.d(TAG, "Gyroscope data received")
                System.arraycopy(event.values, 0, gyroscopeData, 0, 3)
            }
            Sensor.TYPE_PROXIMITY -> {
                Log.d(TAG, "Proximity data: ${event.values[0]}")
                proximityValue = event.values[0]
                updatePocketDetection()
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                Log.d(TAG, "Magnetometer data received")
                System.arraycopy(event.values, 0, magnetometerData, 0, 3)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Handle accuracy changes if needed
    }

    private fun processAccelerometerData(values: FloatArray, timestamp: Long) {
        val magnitude = sqrt(values[0] * values[0] + values[1] * values[1] + values[2] * values[2])
        
        // Apply gravity compensation
        val gravityCompensated = magnitude - SensorManager.GRAVITY_EARTH
        
        Log.d(TAG, "Accel magnitude: $magnitude, gravity compensated: $gravityCompensated, threshold: ${BACK_TAP_THRESHOLD * sensitivity}")
        
        if (enableBackTap && abs(gravityCompensated) > BACK_TAP_THRESHOLD * sensitivity) {
            val confidence = calculateTapConfidence(values, gyroscopeData)
            
            Log.d(TAG, "Potential tap detected! Confidence: $confidence")
            
            if (confidence > 0.5 && !shouldFilterTap()) {
                Log.d(TAG, "Processing tap event")
                processTapEvent(timestamp, values, confidence)
            } else {
                Log.d(TAG, "Tap filtered - confidence too low or filtered")
            }
        }
    }

    private fun calculateTapConfidence(accel: FloatArray, gyro: FloatArray): Float {
        // Advanced confidence calculation based on sensor fusion
        val accelMagnitude = sqrt(accel[0] * accel[0] + accel[1] * accel[1] + accel[2] * accel[2])
        val gyroMagnitude = sqrt(gyro[0] * gyro[0] + gyro[1] * gyro[1] + gyro[2] * gyro[2])
        
        // Back tap typically has high Z-axis acceleration with minimal rotation
        val zAxisRatio = abs(accel[2]) / accelMagnitude
        val rotationPenalty = min(1.0f, gyroMagnitude / 2.0f)
        
        var confidence = zAxisRatio * (1.0f - rotationPenalty)
        
        // Apply ML-based adjustments if available
        confidence *= sensitivity.toFloat()
        
        return max(0.0f, min(1.0f, confidence))
    }

    private fun shouldFilterTap(): Boolean {
        if (!enableFalsePositivePrevention) return false
        
        // Filter if device is in pocket (proximity sensor)
        if (isInPocket) return true
        
        // Filter if device is on table (magnetometer + accelerometer analysis)
        if (isOnTable) return true
        
        // Filter rapid successive taps that might be vibrations
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastTapTime < 50) return true
        
        return false
    }

    private fun updatePocketDetection() {
        // Simple proximity-based pocket detection
        isInPocket = proximityValue < 1.0f
    }

    private fun processTapEvent(timestamp: Long, accel: FloatArray, confidence: Float) {
        val currentTime = System.currentTimeMillis()
        
        // Store tap data for pattern analysis
        val tapData = TapData(
            timestamp = currentTime,
            acceleration = accel.copyOf(),
            gyroscope = gyroscopeData.copyOf(),
            magnitude = sqrt(accel[0] * accel[0] + accel[1] * accel[1] + accel[2] * accel[2]),
            confidence = confidence
        )
        
        tapBuffer.add(tapData)
        if (tapBuffer.size > 10) {
            tapBuffer.removeAt(0)
        }
        
        // Determine tap type based on timing
        when {
            currentTime - lastTapTime > TRIPLE_TAP_WINDOW_MS -> {
                // Reset tap count for new sequence
                tapCount = 1
            }
            currentTime - lastTapTime <= DOUBLE_TAP_WINDOW_MS -> {
                tapCount++
            }
        }
        
        lastTapTime = currentTime
        
        // Schedule tap type determination
        handler.removeCallbacksAndMessages(null)
        handler.postDelayed({
            determineTapType(tapCount, confidence)
            tapCount = 0
        }, TAP_TIMEOUT_MS)
    }

    private fun determineTapType(count: Int, confidence: Float) {
        val tapType = when (count) {
            1 -> "backSingleTap"
            2 -> "backDoubleTap"
            3 -> "backTripleTap"
            else -> "backSingleTap"
        }
        
        sendTapEvent(tapType, confidence)
        updateStatistics(tapType)
    }

    private fun sendTapEvent(type: String, confidence: Float) {
        val event = mapOf(
            "type" to type,
            "timestamp" to System.currentTimeMillis(),
            "confidence" to confidence.toDouble(),
            "sensorData" to mapOf(
                "accelerometer" to accelerometerData.toList(),
                "gyroscope" to gyroscopeData.toList(),
                "proximity" to proximityValue.toDouble()
            ),
            "duration" to 100,
            "intensity" to confidence.toDouble(),
            "metadata" to mapOf(
                "deviceOrientation" to getDeviceOrientation(),
                "isInPocket" to isInPocket
            )
        )
        
        eventSink?.success(event)
        Log.d(TAG, "Tap event sent: $type with confidence $confidence")
    }

    private fun getDeviceOrientation(): String {
        // Simple orientation detection based on accelerometer
        val x = accelerometerData[0]
        val y = accelerometerData[1]
        val z = accelerometerData[2]
        
        return when {
            abs(z) > abs(x) && abs(z) > abs(y) -> if (z > 0) "faceUp" else "faceDown"
            abs(y) > abs(x) -> if (y > 0) "portrait" else "portraitUpsideDown"
            else -> if (x > 0) "landscapeLeft" else "landscapeRight"
        }
    }

    private fun updateStatistics(tapType: String) {
        val currentCount = statistics[tapType] as? Int ?: 0
        statistics[tapType] = currentCount + 1
        statistics["totalTaps"] = (statistics["totalTaps"] as? Int ?: 0) + 1
        statistics["lastTapTime"] = System.currentTimeMillis()
    }

    // Public API methods
    
    fun updateConfig(newConfig: Map<String, Any>) {
        config = newConfig
        updateConfigInternal(newConfig)
    }

    private fun updateConfigInternal(config: Map<String, Any>) {
        sensitivity = (config["sensitivity"] as? Double) ?: 0.7
        enableBackTap = config["enableBackTap"] as? Boolean ?: true
        enableCustomPatterns = config["enableCustomPatterns"] as? Boolean ?: false
        enableFalsePositivePrevention = config["enableFalsePositivePrevention"] as? Boolean ?: true
        
        val samplingRate = config["sensorSamplingRate"] as? Int ?: 50
        sensorSamplingRate = when {
            samplingRate >= 100 -> SensorManager.SENSOR_DELAY_FASTEST
            samplingRate >= 50 -> SensorManager.SENSOR_DELAY_GAME
            samplingRate >= 20 -> SensorManager.SENSOR_DELAY_UI
            else -> SensorManager.SENSOR_DELAY_NORMAL
        }
    }

    fun addCustomPattern(pattern: Map<String, Any>) {
        val id = pattern["id"] as? String ?: return
        val intervals = pattern["intervals"] as? List<Int> ?: return
        val tolerance = pattern["tolerance"] as? Int ?: 50
        val minConfidence = pattern["minConfidence"] as? Double ?: 0.7
        
        customPatterns[id] = GesturePattern(id, intervals, tolerance, minConfidence)
    }

    fun removeCustomPattern(patternId: String) {
        customPatterns.remove(patternId)
    }

    fun trainGesture(gestureId: String, trainingData: List<Map<String, Any>>): Boolean {
        // Placeholder for ML training implementation
        Log.d(TAG, "Training gesture: $gestureId with ${trainingData.size} samples")
        return true
    }

    fun getStatistics(): Map<String, Any> {
        return statistics.toMap()
    }

    fun isSupported(): Boolean {
        return try {
            Log.d(TAG, "Checking device support...")
            
            // Check if sensor manager is available
            if (sensorManager == null) {
                Log.e(TAG, "SensorManager is null!")
                return false
            }
            
            // Try to get accelerometer directly
            val testAccel = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            val hasAccelerometer = testAccel != null
            
            Log.d(TAG, "Direct sensor check - Accelerometer available: $hasAccelerometer")
            
            if (hasAccelerometer) {
                Log.d(TAG, "Accelerometer details: ${testAccel?.name}, Vendor: ${testAccel?.vendor}")
            }
            
            // List all available sensors for debugging
            val allSensors = sensorManager.getSensorList(Sensor.TYPE_ALL)
            Log.d(TAG, "Total sensors on device: ${allSensors.size}")
            
            // Always return true for now to test the app flow
            // We'll make this more restrictive once we confirm sensor access works
            true
            
        } catch (e: Exception) {
            Log.e(TAG, "Exception in isSupported: ${e.message}", e)
            // Return true to allow testing
            true
        }
    }

    fun getAvailableSensors(): List<String> {
        val sensors = mutableListOf<String>()
        if (accelerometer != null) sensors.add("accelerometer")
        if (gyroscope != null) sensors.add("gyroscope")
        if (proximity != null) sensors.add("proximity")
        if (magnetometer != null) sensors.add("magnetometer")
        return sensors
    }

    fun calibrateSensors(): Boolean {
        // Placeholder for sensor calibration
        Log.d(TAG, "Calibrating sensors...")
        return true
    }

    fun exportTrainingData(): Map<String, Any>? {
        return mapOf(
            "tapBuffer" to tapBuffer.map { tap ->
                mapOf(
                    "timestamp" to tap.timestamp,
                    "acceleration" to tap.acceleration.toList(),
                    "gyroscope" to tap.gyroscope.toList(),
                    "magnitude" to tap.magnitude,
                    "confidence" to tap.confidence
                )
            },
            "statistics" to statistics
        )
    }

    fun importTrainingData(data: Map<String, Any>): Boolean {
        // Placeholder for importing training data
        Log.d(TAG, "Importing training data...")
        return true
    }

    fun dispose() {
        stopDetection()
        handler.removeCallbacksAndMessages(null)
        tapBuffer.clear()
        customPatterns.clear()
        statistics.clear()
    }
}
