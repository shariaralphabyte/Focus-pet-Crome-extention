import 'dart:async';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';

import 'models/tap_event.dart';
import 'models/gesture_config.dart';
import 'models/gesture_pattern.dart';
import 'models/tap_type.dart';

/// Main class for Flutter Smart Taps gesture recognition
class SmartTaps {
  static const MethodChannel _channel = MethodChannel('flutter_smart_taps');
  static const EventChannel _eventChannel = EventChannel('flutter_smart_taps/events');
  
  static StreamSubscription<TapEvent>? _subscription;
  static final StreamController<TapEvent> _controller = StreamController<TapEvent>.broadcast();
  
  /// Stream of detected tap events
  static Stream<TapEvent> get tapStream => _controller.stream;
  
  /// Current gesture configuration
  static GestureConfig? _currentConfig;
  
  /// Initialize the gesture recognition system
  static Future<bool> initialize({GestureConfig? config}) async {
    try {
      // Request necessary permissions
      final permissions = await _requestPermissions();
      if (!permissions) {
        throw Exception('Required permissions not granted');
      }
      
      // Set default config if none provided
      _currentConfig = config ?? const GestureConfig();
      
      // Initialize native platform
      final result = await _channel.invokeMethod('initialize', _currentConfig!.toJson());
      
      if (result == true) {
        // Start listening to events
        _startListening();
        return true;
      }
      
      return false;
    } catch (e) {
      throw Exception('Failed to initialize SmartTaps: $e');
    }
  }
  
  /// Start gesture detection with optional callback
  static Future<void> listen(Function(TapEvent) onTap) async {
    if (_currentConfig == null) {
      throw Exception('SmartTaps not initialized. Call initialize() first.');
    }
    
    _subscription?.cancel();
    _subscription = tapStream.listen(onTap);
    
    await _channel.invokeMethod('startDetection');
  }
  
  /// Stop gesture detection
  static Future<void> stop() async {
    await _subscription?.cancel();
    _subscription = null;
    await _channel.invokeMethod('stopDetection');
  }
  
  /// Update gesture configuration
  static Future<void> updateConfig(GestureConfig config) async {
    _currentConfig = config;
    await _channel.invokeMethod('updateConfig', config.toJson());
  }
  
  /// Add a custom gesture pattern
  static Future<void> addCustomPattern(GesturePattern pattern) async {
    await _channel.invokeMethod('addCustomPattern', pattern.toJson());
  }
  
  /// Remove a custom gesture pattern
  static Future<void> removeCustomPattern(String patternId) async {
    await _channel.invokeMethod('removeCustomPattern', {'patternId': patternId});
  }
  
  /// Train a custom gesture with sample data
  static Future<bool> trainGesture(String gestureId, List<Map<String, dynamic>> trainingData) async {
    try {
      final result = await _channel.invokeMethod('trainGesture', {
        'gestureId': gestureId,
        'trainingData': trainingData,
      });
      return result == true;
    } catch (e) {
      return false;
    }
  }
  
  /// Get current gesture recognition statistics
  static Future<Map<String, dynamic>> getStatistics() async {
    try {
      final result = await _channel.invokeMethod('getStatistics');
      return Map<String, dynamic>.from(result ?? {});
    } catch (e) {
      return {};
    }
  }
  
  /// Check if device supports advanced gesture recognition
  static Future<bool> isSupported() async {
    try {
      final result = await _channel.invokeMethod('isSupported');
      return result == true;
    } catch (e) {
      return false;
    }
  }
  
  /// Get available sensors on the device
  static Future<List<String>> getAvailableSensors() async {
    try {
      final result = await _channel.invokeMethod('getAvailableSensors');
      return List<String>.from(result ?? []);
    } catch (e) {
      return [];
    }
  }
  
  /// Calibrate sensors for better accuracy
  static Future<bool> calibrateSensors() async {
    try {
      final result = await _channel.invokeMethod('calibrateSensors');
      return result == true;
    } catch (e) {
      return false;
    }
  }
  
  /// Export gesture training data
  static Future<Map<String, dynamic>?> exportTrainingData() async {
    try {
      final result = await _channel.invokeMethod('exportTrainingData');
      return result != null ? Map<String, dynamic>.from(result) : null;
    } catch (e) {
      return null;
    }
  }
  
  /// Import gesture training data
  static Future<bool> importTrainingData(Map<String, dynamic> data) async {
    try {
      final result = await _channel.invokeMethod('importTrainingData', data);
      return result == true;
    } catch (e) {
      return false;
    }
  }
  
  /// Dispose resources and cleanup
  static Future<void> dispose() async {
    await stop();
    await _controller.close();
    await _channel.invokeMethod('dispose');
  }
  
  // Private methods
  
  static void _startListening() {
    _eventChannel.receiveBroadcastStream().listen(
      (dynamic event) {
        try {
          final tapEvent = TapEvent.fromJson(Map<String, dynamic>.from(event));
          _controller.add(tapEvent);
        } catch (e) {
          // Handle parsing errors silently
        }
      },
      onError: (dynamic error) {
        // Handle stream errors
      },
    );
  }
  
  static Future<bool> _requestPermissions() async {
    final permissions = [
      Permission.sensors,
      Permission.activityRecognition,
    ];
    
    final statuses = await permissions.request();
    
    return statuses.values.every(
      (status) => status == PermissionStatus.granted || status == PermissionStatus.limited,
    );
  }
}

/// Convenience methods for common use cases
extension SmartTapsConvenience on SmartTaps {
  /// Quick setup for back tap detection only
  static Future<void> enableBackTap(Function(TapEvent) onBackTap) async {
    await SmartTaps.initialize(
      config: const GestureConfig(
        enableBackTap: true,
        enabledTapTypes: {TapType.backDoubleTap},
      ),
    );
    await SmartTaps.listen(onBackTap);
  }
  
  /// Quick setup for accessibility features
  static Future<void> enableAccessibilityMode(Function(TapEvent) onTap) async {
    await SmartTaps.initialize(config: GestureConfig.accessibility);
    await SmartTaps.listen(onTap);
  }
  
  /// Quick setup for gaming features
  static Future<void> enableGamingMode(Function(TapEvent) onTap) async {
    await SmartTaps.initialize(config: GestureConfig.gaming);
    await SmartTaps.listen(onTap);
  }
}
