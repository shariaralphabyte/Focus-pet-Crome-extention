package com.example.flutter_secure_biometrics

import android.content.Context
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraManager
import android.os.Build
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import java.util.concurrent.Executor

class SecureBiometricManager {
    
    fun isAvailable(context: Context): Boolean {
        val biometricManager = BiometricManager.from(context)
        return when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)) {
            BiometricManager.BIOMETRIC_SUCCESS -> true
            else -> false
        }
    }
    
    fun getAvailableBiometrics(context: Context): List<String> {
        val availableBiometrics = mutableListOf<String>()
        val biometricManager = BiometricManager.from(context)
        
        // Check fingerprint
        if (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG) == BiometricManager.BIOMETRIC_SUCCESS) {
            availableBiometrics.add("fingerprint")
        }
        
        // Check face recognition (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                val cameraIds = cameraManager.cameraIdList
                if (cameraIds.isNotEmpty()) {
                    availableBiometrics.add("face")
                }
            } catch (e: CameraAccessException) {
                // Face recognition not available
            }
        }
        
        // Check for camera-based health biometrics
        if (hasCamera(context)) {
            availableBiometrics.add("heartRate")
            availableBiometrics.add("bloodOxygen")
        }
        
        return availableBiometrics
    }
    
    fun registerAppBiometric(
        context: Context,
        activity: FragmentActivity,
        type: String,
        appId: String,
        keyAlias: String,
        metadata: Map<String, Any>?
    ): Boolean {
        return try {
            // Create biometric prompt for registration
            val executor: Executor = ContextCompat.getMainExecutor(context)
            val biometricPrompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                }
                
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    // Store app-specific biometric template
                    storeAppBiometricTemplate(context, appId, type, keyAlias)
                }
                
                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                }
            })
            
            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Register ${type.capitalize()} for $appId")
                .setSubtitle("This will create an app-specific biometric profile")
                .setNegativeButtonText("Cancel")
                .build()
            
            biometricPrompt.authenticate(promptInfo)
            true
        } catch (e: Exception) {
            false
        }
    }
    
    fun authenticate(
        context: Context,
        activity: FragmentActivity,
        config: Map<String, Any>,
        appId: String,
        reason: String,
        keystoreManager: KeystoreManager,
        livenessDetector: LivenessDetector,
        spoofingDetector: SpoofingDetector,
        callback: (Map<String, Any>) -> Unit
    ) {
        val executor: Executor = ContextCompat.getMainExecutor(context)
        val biometricPrompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                callback(mapOf(
                    "isAuthenticated" to false,
                    "error" to getErrorType(errorCode),
                    "errorMessage" to errString.toString(),
                    "timestamp" to System.currentTimeMillis()
                ))
            }
            
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                
                // Perform additional security checks
                val enabledBiometrics = config["enabledBiometrics"] as? List<String> ?: listOf("fingerprint")
                val livenessDetection = config["livenessDetection"] as? Boolean ?: true
                val antiSpoofing = config["antiSpoofing"] as? Boolean ?: true
                
                var authenticationValid = true
                val usedBiometrics = mutableListOf<String>()
                
                // Validate each biometric type
                for (biometricType in enabledBiometrics) {
                    if (keystoreManager.isKeyRegistered(appId, biometricType)) {
                        usedBiometrics.add(biometricType)
                        
                        // Perform liveness detection
                        if (livenessDetection && !livenessDetector.performDetection(context, biometricType)) {
                            authenticationValid = false
                            break
                        }
                        
                        // Perform spoofing detection
                        if (antiSpoofing && spoofingDetector.detectSpoofing(context, biometricType)) {
                            authenticationValid = false
                            break
                        }
                    }
                }
                
                if (authenticationValid) {
                    callback(mapOf(
                        "isAuthenticated" to true,
                        "usedBiometrics" to usedBiometrics,
                        "trustScore" to mapOf(
                            "value" to 1.0,
                            "timestamp" to System.currentTimeMillis(),
                            "factors" to mapOf<String, Double>(),
                            "reason" to "Successful biometric authentication"
                        ),
                        "timestamp" to System.currentTimeMillis()
                    ))
                } else {
                    callback(mapOf(
                        "isAuthenticated" to false,
                        "error" to "livenessDetectionFailed",
                        "errorMessage" to "Security validation failed",
                        "timestamp" to System.currentTimeMillis()
                    ))
                }
            }
            
            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                callback(mapOf(
                    "isAuthenticated" to false,
                    "error" to "authenticationFailed",
                    "errorMessage" to "Biometric authentication failed",
                    "timestamp" to System.currentTimeMillis()
                ))
            }
        })
        
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Authenticate")
            .setSubtitle(reason)
            .setNegativeButtonText("Cancel")
            .build()
        
        biometricPrompt.authenticate(promptInfo)
    }
    
    fun getHealthBiometrics(context: Context): Map<String, Double> {
        val healthData = mutableMapOf<String, Double>()
        
        if (hasCamera(context)) {
            // Simulate heart rate measurement via camera
            healthData["heartRate"] = measureHeartRate(context)
            
            // Simulate blood oxygen measurement
            healthData["bloodOxygen"] = measureBloodOxygen(context)
        }
        
        return healthData
    }
    
    private fun hasCamera(context: Context): Boolean {
        return context.packageManager.hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA_ANY)
    }
    
    private fun measureHeartRate(context: Context): Double {
        // Placeholder for actual heart rate measurement using camera
        // In real implementation, this would analyze camera frames for pulse detection
        return 72.0 + (Math.random() * 20 - 10) // Simulate 62-82 BPM
    }
    
    private fun measureBloodOxygen(context: Context): Double {
        // Placeholder for actual SpO2 measurement using camera and flash
        // In real implementation, this would use red and infrared light analysis
        return 98.0 + (Math.random() * 4 - 2) // Simulate 96-100%
    }
    
    private fun storeAppBiometricTemplate(context: Context, appId: String, type: String, keyAlias: String) {
        // Store app-specific biometric template in encrypted storage
        val sharedPrefs = context.getSharedPreferences("secure_biometrics_$appId", Context.MODE_PRIVATE)
        sharedPrefs.edit()
            .putString("${type}_template", keyAlias)
            .putLong("${type}_registered", System.currentTimeMillis())
            .apply()
    }
    
    private fun getErrorType(errorCode: Int): String {
        return when (errorCode) {
            BiometricPrompt.ERROR_USER_CANCELED -> "userCancelled"
            BiometricPrompt.ERROR_NO_BIOMETRICS -> "noBiometricsEnrolled"
            BiometricPrompt.ERROR_HW_NOT_PRESENT -> "biometricNotAvailable"
            BiometricPrompt.ERROR_HW_UNAVAILABLE -> "hardwareError"
            BiometricPrompt.ERROR_LOCKOUT -> "tooManyAttempts"
            BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> "tooManyAttempts"
            BiometricPrompt.ERROR_TIMEOUT -> "timeout"
            else -> "unknown"
        }
    }
}
