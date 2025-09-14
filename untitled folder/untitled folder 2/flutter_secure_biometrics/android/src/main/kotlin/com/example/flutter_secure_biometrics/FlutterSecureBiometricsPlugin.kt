package com.example.flutter_secure_biometrics

import android.app.Activity
import android.content.Context
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.annotation.NonNull
import androidx.biometric.BiometricManager as AndroidXBiometricManager
import androidx.biometric.BiometricPrompt as AndroidXBiometricPrompt
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.LifecycleOwner
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import java.security.KeyStore
import java.util.concurrent.Executor
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

/** FlutterSecureBiometricsPlugin */
class FlutterSecureBiometricsPlugin : 
    FlutterPlugin, 
    MethodCallHandler, 
    ActivityAware {
    
    private lateinit var channel: MethodChannel
    private lateinit var eventChannel: EventChannel
    private var context: Context? = null
    private var activity: Activity? = null
    
    private val biometricManager = SecureBiometricManager()
    private val keystoreManager = KeystoreManager()
    private val behavioralAnalyzer = BehavioralAnalyzer()
    private val livenessDetector = LivenessDetector()
    private val spoofingDetector = SpoofingDetector()

    override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
        context = flutterPluginBinding.applicationContext
        channel = MethodChannel(flutterPluginBinding.binaryMessenger, "flutter_secure_biometrics")
        channel.setMethodCallHandler(this)
        
        eventChannel = EventChannel(flutterPluginBinding.binaryMessenger, "flutter_secure_biometrics/events")
        eventChannel.setStreamHandler(BiometricEventStreamHandler(behavioralAnalyzer))
    }

    override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
        when (call.method) {
            "isAvailable" -> handleIsAvailable(result)
            "getAvailableBiometrics" -> handleGetAvailableBiometrics(result)
            "registerAppBiometric" -> handleRegisterAppBiometric(call, result)
            "isAppBiometricRegistered" -> handleIsAppBiometricRegistered(call, result)
            "authenticate" -> handleAuthenticate(call, result)
            "startContinuousAuth" -> handleStartContinuousAuth(call, result)
            "stopContinuousAuth" -> handleStopContinuousAuth(result)
            "getCurrentTrustScore" -> handleGetCurrentTrustScore(result)
            "updateBehavioralMetrics" -> handleUpdateBehavioralMetrics(call, result)
            "lockApplication" -> handleLockApplication(result)
            "performLivenessDetection" -> handlePerformLivenessDetection(call, result)
            "detectSpoofing" -> handleDetectSpoofing(call, result)
            "getHealthBiometrics" -> handleGetHealthBiometrics(result)
            "clearAppBiometric" -> handleClearAppBiometric(call, result)
            "exportTrainingData" -> handleExportTrainingData(result)
            "importTrainingData" -> handleImportTrainingData(call, result)
            else -> result.notImplemented()
        }
    }

    private fun handleIsAvailable(result: Result) {
        try {
            val isAvailable = biometricManager.isAvailable(context!!)
            result.success(isAvailable)
        } catch (e: Exception) {
            result.error("BIOMETRIC_ERROR", "Failed to check availability: ${e.message}", null)
        }
    }

    private fun handleGetAvailableBiometrics(result: Result) {
        try {
            val availableBiometrics = biometricManager.getAvailableBiometrics(context!!)
            result.success(availableBiometrics)
        } catch (e: Exception) {
            result.error("BIOMETRIC_ERROR", "Failed to get available biometrics: ${e.message}", null)
        }
    }

    private fun handleRegisterAppBiometric(call: MethodCall, result: Result) {
        try {
            val type = call.argument<String>("type") ?: return result.error("INVALID_ARGS", "Missing type", null)
            val appId = call.argument<String>("appId") ?: return result.error("INVALID_ARGS", "Missing appId", null)
            val metadata = call.argument<Map<String, Any>>("metadata")
            
            val keyAlias = keystoreManager.generateAppSpecificKey(appId, type)
            val registered = biometricManager.registerAppBiometric(context!!, activity as FragmentActivity, type, appId, keyAlias, metadata)
            result.success(registered)
        } catch (e: Exception) {
            result.error("REGISTRATION_ERROR", "Failed to register biometric: ${e.message}", null)
        }
    }

    private fun handleIsAppBiometricRegistered(call: MethodCall, result: Result) {
        try {
            val type = call.argument<String>("type") ?: return result.error("INVALID_ARGS", "Missing type", null)
            val appId = call.argument<String>("appId") ?: return result.error("INVALID_ARGS", "Missing appId", null)
            
            val isRegistered = keystoreManager.isKeyRegistered(appId, type)
            result.success(isRegistered)
        } catch (e: Exception) {
            result.success(false)
        }
    }

    private fun handleAuthenticate(call: MethodCall, result: Result) {
        try {
            val config = call.argument<Map<String, Any>>("config") ?: return result.error("INVALID_ARGS", "Missing config", null)
            val appId = call.argument<String>("appId") ?: return result.error("INVALID_ARGS", "Missing appId", null)
            val reason = call.argument<String>("reason") ?: "Authenticate to access application"
            
            biometricManager.authenticate(
                context = context!!,
                activity = activity as FragmentActivity,
                config = config,
                appId = appId,
                reason = reason,
                keystoreManager = keystoreManager,
                livenessDetector = livenessDetector,
                spoofingDetector = spoofingDetector,
                callback = { authResult ->
                    result.success(authResult)
                }
            )
        } catch (e: Exception) {
            result.error("AUTH_ERROR", "Authentication failed: ${e.message}", null)
        }
    }

    private fun handleStartContinuousAuth(call: MethodCall, result: Result) {
        try {
            val config = call.argument<Map<String, Any>>("config") ?: return result.error("INVALID_ARGS", "Missing config", null)
            val appId = call.argument<String>("appId") ?: return result.error("INVALID_ARGS", "Missing appId", null)
            
            val started = behavioralAnalyzer.startContinuousMonitoring(context!!, config, appId)
            result.success(started)
        } catch (e: Exception) {
            result.error("CONTINUOUS_AUTH_ERROR", "Failed to start continuous auth: ${e.message}", null)
        }
    }

    private fun handleStopContinuousAuth(result: Result) {
        try {
            behavioralAnalyzer.stopContinuousMonitoring()
            result.success(true)
        } catch (e: Exception) {
            result.error("CONTINUOUS_AUTH_ERROR", "Failed to stop continuous auth: ${e.message}", null)
        }
    }

    private fun handleGetCurrentTrustScore(result: Result) {
        try {
            val trustScore = behavioralAnalyzer.getCurrentTrustScore()
            result.success(trustScore)
        } catch (e: Exception) {
            result.error("TRUST_SCORE_ERROR", "Failed to get trust score: ${e.message}", null)
        }
    }

    private fun handleUpdateBehavioralMetrics(call: MethodCall, result: Result) {
        try {
            val metrics = call.argument<Map<String, Any>>("metrics") ?: return result.error("INVALID_ARGS", "Missing metrics", null)
            val updated = behavioralAnalyzer.updateMetrics(metrics)
            result.success(updated)
        } catch (e: Exception) {
            result.error("BEHAVIORAL_ERROR", "Failed to update metrics: ${e.message}", null)
        }
    }

    private fun handleLockApplication(result: Result) {
        try {
            behavioralAnalyzer.lockApplication()
            result.success(true)
        } catch (e: Exception) {
            result.error("LOCK_ERROR", "Failed to lock application: ${e.message}", null)
        }
    }

    private fun handlePerformLivenessDetection(call: MethodCall, result: Result) {
        try {
            val type = call.argument<String>("type") ?: return result.error("INVALID_ARGS", "Missing type", null)
            val isLive = livenessDetector.performDetection(context!!, type)
            result.success(isLive)
        } catch (e: Exception) {
            result.error("LIVENESS_ERROR", "Liveness detection failed: ${e.message}", null)
        }
    }

    private fun handleDetectSpoofing(call: MethodCall, result: Result) {
        try {
            val type = call.argument<String>("type") ?: return result.error("INVALID_ARGS", "Missing type", null)
            val isSpoofing = spoofingDetector.detectSpoofing(context!!, type)
            result.success(isSpoofing)
        } catch (e: Exception) {
            result.error("SPOOFING_ERROR", "Spoofing detection failed: ${e.message}", null)
        }
    }

    private fun handleGetHealthBiometrics(result: Result) {
        try {
            val healthData = biometricManager.getHealthBiometrics(context!!)
            result.success(healthData)
        } catch (e: Exception) {
            result.error("HEALTH_ERROR", "Failed to get health biometrics: ${e.message}", null)
        }
    }

    private fun handleClearAppBiometric(call: MethodCall, result: Result) {
        try {
            val type = call.argument<String>("type") ?: return result.error("INVALID_ARGS", "Missing type", null)
            val appId = call.argument<String>("appId") ?: return result.error("INVALID_ARGS", "Missing appId", null)
            
            val cleared = keystoreManager.clearAppKey(appId, type)
            result.success(cleared)
        } catch (e: Exception) {
            result.error("CLEAR_ERROR", "Failed to clear biometric: ${e.message}", null)
        }
    }

    private fun handleExportTrainingData(result: Result) {
        try {
            val data = behavioralAnalyzer.exportTrainingData()
            result.success(data)
        } catch (e: Exception) {
            result.error("EXPORT_ERROR", "Failed to export training data: ${e.message}", null)
        }
    }

    private fun handleImportTrainingData(call: MethodCall, result: Result) {
        try {
            val data = call.argument<Map<String, Any>>("data") ?: return result.error("INVALID_ARGS", "Missing data", null)
            val imported = behavioralAnalyzer.importTrainingData(data)
            result.success(imported)
        } catch (e: Exception) {
            result.error("IMPORT_ERROR", "Failed to import training data: ${e.message}", null)
        }
    }

    override fun onAttachedToActivity(binding: ActivityPluginBinding) {
        activity = binding.activity
    }

    override fun onDetachedFromActivityForConfigChanges() {
        activity = null
    }

    override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) {
        activity = binding.activity
    }

    override fun onDetachedFromActivity() {
        activity = null
    }

    override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
        eventChannel.setStreamHandler(null)
        context = null
    }
}
