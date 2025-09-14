package com.example.flutter_secure_biometrics

import io.flutter.plugin.common.EventChannel
import kotlinx.coroutines.*

class BiometricEventStreamHandler(
    private val behavioralAnalyzer: BehavioralAnalyzer
) : EventChannel.StreamHandler {
    
    private var eventSink: EventChannel.EventSink? = null
    private val eventScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
        eventSink = events
        startEventStreaming()
    }
    
    override fun onCancel(arguments: Any?) {
        eventSink = null
        eventScope.cancel()
    }
    
    private fun startEventStreaming() {
        eventScope.launch {
            while (eventSink != null) {
                try {
                    // Send trust score updates
                    val trustScore = behavioralAnalyzer.getCurrentTrustScore()
                    eventSink?.success(mapOf(
                        "type" to "trustScore",
                        "data" to trustScore
                    ))
                    
                    delay(5000) // Send updates every 5 seconds
                } catch (e: Exception) {
                    eventSink?.error("STREAM_ERROR", "Failed to send event: ${e.message}", null)
                }
            }
        }
    }
    
    fun sendBehavioralMetrics(metrics: Map<String, Any>) {
        eventSink?.success(mapOf(
            "type" to "behavioralMetrics",
            "data" to metrics
        ))
    }
    
    fun sendSecurityAlert(alert: Map<String, Any>) {
        eventSink?.success(mapOf(
            "type" to "securityAlert",
            "data" to alert
        ))
    }
}
