package com.smarttaps.flutter_smart_taps

import android.content.Context
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result

/** FlutterSmartTapsPlugin */
class FlutterSmartTapsPlugin : FlutterPlugin, MethodCallHandler, EventChannel.StreamHandler {
    
    private lateinit var methodChannel: MethodChannel
    private lateinit var eventChannel: EventChannel
    private lateinit var context: Context
    private var gestureDetector: GestureDetector? = null
    private var eventSink: EventChannel.EventSink? = null

    override fun onAttachedToEngine(flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
        context = flutterPluginBinding.applicationContext
        
        methodChannel = MethodChannel(flutterPluginBinding.binaryMessenger, "flutter_smart_taps")
        methodChannel.setMethodCallHandler(this)
        
        eventChannel = EventChannel(flutterPluginBinding.binaryMessenger, "flutter_smart_taps/events")
        eventChannel.setStreamHandler(this)
    }

    override fun onMethodCall(call: MethodCall, result: Result) {
        when (call.method) {
            "initialize" -> {
                val config = call.arguments as? Map<String, Any>
                initialize(config, result)
            }
            "startDetection" -> {
                startDetection(result)
            }
            "stopDetection" -> {
                stopDetection(result)
            }
            "updateConfig" -> {
                val config = call.arguments as? Map<String, Any>
                updateConfig(config, result)
            }
            "addCustomPattern" -> {
                val pattern = call.arguments as? Map<String, Any>
                addCustomPattern(pattern, result)
            }
            "removeCustomPattern" -> {
                val args = call.arguments as? Map<String, Any>
                val patternId = args?.get("patternId") as? String
                removeCustomPattern(patternId, result)
            }
            "trainGesture" -> {
                val args = call.arguments as? Map<String, Any>
                trainGesture(args, result)
            }
            "getStatistics" -> {
                getStatistics(result)
            }
            "isSupported" -> {
                isSupported(result)
            }
            "getAvailableSensors" -> {
                getAvailableSensors(result)
            }
            "calibrateSensors" -> {
                calibrateSensors(result)
            }
            "exportTrainingData" -> {
                exportTrainingData(result)
            }
            "importTrainingData" -> {
                val data = call.arguments as? Map<String, Any>
                importTrainingData(data, result)
            }
            "dispose" -> {
                dispose(result)
            }
            else -> {
                result.notImplemented()
            }
        }
    }

    override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
        eventSink = events
        gestureDetector?.setEventSink(events)
    }

    override fun onCancel(arguments: Any?) {
        eventSink = null
        gestureDetector?.setEventSink(null)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        methodChannel.setMethodCallHandler(null)
        eventChannel.setStreamHandler(null)
        gestureDetector?.dispose()
    }

    private fun initialize(config: Map<String, Any>?, result: Result) {
        try {
            gestureDetector = GestureDetector(context, config ?: emptyMap())
            result.success(true)
        } catch (e: Exception) {
            result.error("INIT_ERROR", "Failed to initialize gesture detector: ${e.message}", null)
        }
    }

    private fun startDetection(result: Result) {
        try {
            gestureDetector?.startDetection()
            result.success(true)
        } catch (e: Exception) {
            result.error("START_ERROR", "Failed to start detection: ${e.message}", null)
        }
    }

    private fun stopDetection(result: Result) {
        try {
            gestureDetector?.stopDetection()
            result.success(true)
        } catch (e: Exception) {
            result.error("STOP_ERROR", "Failed to stop detection: ${e.message}", null)
        }
    }

    private fun updateConfig(config: Map<String, Any>?, result: Result) {
        try {
            gestureDetector?.updateConfig(config ?: emptyMap())
            result.success(true)
        } catch (e: Exception) {
            result.error("CONFIG_ERROR", "Failed to update config: ${e.message}", null)
        }
    }

    private fun addCustomPattern(pattern: Map<String, Any>?, result: Result) {
        try {
            gestureDetector?.addCustomPattern(pattern ?: emptyMap())
            result.success(true)
        } catch (e: Exception) {
            result.error("PATTERN_ERROR", "Failed to add pattern: ${e.message}", null)
        }
    }

    private fun removeCustomPattern(patternId: String?, result: Result) {
        try {
            gestureDetector?.removeCustomPattern(patternId ?: "")
            result.success(true)
        } catch (e: Exception) {
            result.error("PATTERN_ERROR", "Failed to remove pattern: ${e.message}", null)
        }
    }

    private fun trainGesture(args: Map<String, Any>?, result: Result) {
        try {
            val gestureId = args?.get("gestureId") as? String ?: ""
            val trainingData = args?.get("trainingData") as? List<Map<String, Any>> ?: emptyList()
            val success = gestureDetector?.trainGesture(gestureId, trainingData) ?: false
            result.success(success)
        } catch (e: Exception) {
            result.error("TRAIN_ERROR", "Failed to train gesture: ${e.message}", null)
        }
    }

    private fun getStatistics(result: Result) {
        try {
            val stats = gestureDetector?.getStatistics() ?: emptyMap<String, Any>()
            result.success(stats)
        } catch (e: Exception) {
            result.error("STATS_ERROR", "Failed to get statistics: ${e.message}", null)
        }
    }

    private fun isSupported(result: Result) {
        try {
            if (gestureDetector == null) {
                // Try to create a temporary detector to check support
                val tempDetector = GestureDetector(context, emptyMap())
                val supported = tempDetector.isSupported()
                result.success(supported)
            } else {
                val supported = gestureDetector!!.isSupported()
                result.success(supported)
            }
        } catch (e: Exception) {
            android.util.Log.e("FlutterSmartTaps", "Error checking device support: ${e.message}")
            result.success(false)
        }
    }

    private fun getAvailableSensors(result: Result) {
        try {
            val sensors = gestureDetector?.getAvailableSensors() ?: emptyList<String>()
            result.success(sensors)
        } catch (e: Exception) {
            result.success(emptyList<String>())
        }
    }

    private fun calibrateSensors(result: Result) {
        try {
            val success = gestureDetector?.calibrateSensors() ?: false
            result.success(success)
        } catch (e: Exception) {
            result.success(false)
        }
    }

    private fun exportTrainingData(result: Result) {
        try {
            val data = gestureDetector?.exportTrainingData()
            result.success(data)
        } catch (e: Exception) {
            result.success(null)
        }
    }

    private fun importTrainingData(data: Map<String, Any>?, result: Result) {
        try {
            val success = gestureDetector?.importTrainingData(data ?: emptyMap()) ?: false
            result.success(success)
        } catch (e: Exception) {
            result.success(false)
        }
    }

    private fun dispose(result: Result) {
        try {
            gestureDetector?.dispose()
            result.success(true)
        } catch (e: Exception) {
            result.success(false)
        }
    }
}
