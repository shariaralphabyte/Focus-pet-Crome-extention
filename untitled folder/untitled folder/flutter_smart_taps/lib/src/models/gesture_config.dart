import 'gesture_pattern.dart';
import 'tap_type.dart';

/// Configuration class for gesture recognition settings
class GestureConfig {
  /// Enable/disable back tap detection
  final bool enableBackTap;
  
  /// Enable/disable custom gesture patterns
  final bool enableCustomPatterns;
  
  /// Enable/disable ML-based adaptive learning
  final bool enableAdaptiveLearning;
  
  /// Enable/disable false positive prevention
  final bool enableFalsePositivePrevention;
  
  /// Sensitivity level for gesture detection (0.1 to 1.0)
  final double sensitivity;
  
  /// Battery optimization level (0 = max performance, 1 = max battery life)
  final double batteryOptimization;
  
  /// Custom gesture patterns to recognize
  final List<GesturePattern> customPatterns;
  
  /// Enabled tap types
  final Set<TapType> enabledTapTypes;
  
  /// Minimum confidence threshold for gesture recognition
  final double minConfidenceThreshold;
  
  /// Sampling rate for sensors (Hz)
  final int sensorSamplingRate;
  
  /// Enable vibration feedback on gesture detection
  final bool enableVibrationFeedback;
  
  /// Enable audio feedback on gesture detection
  final bool enableAudioFeedback;

  const GestureConfig({
    this.enableBackTap = true,
    this.enableCustomPatterns = false,
    this.enableAdaptiveLearning = true,
    this.enableFalsePositivePrevention = true,
    this.sensitivity = 0.7,
    this.batteryOptimization = 0.5,
    this.customPatterns = const [],
    this.enabledTapTypes = const {
      TapType.backSingleTap,
      TapType.backDoubleTap,
    },
    this.minConfidenceThreshold = 0.6,
    this.sensorSamplingRate = 50,
    this.enableVibrationFeedback = false,
    this.enableAudioFeedback = false,
  });

  /// Creates a GestureConfig from JSON
  factory GestureConfig.fromJson(Map<String, dynamic> json) {
    return GestureConfig(
      enableBackTap: json['enableBackTap'] ?? true,
      enableCustomPatterns: json['enableCustomPatterns'] ?? false,
      enableAdaptiveLearning: json['enableAdaptiveLearning'] ?? true,
      enableFalsePositivePrevention: json['enableFalsePositivePrevention'] ?? true,
      sensitivity: (json['sensitivity'] ?? 0.7).toDouble(),
      batteryOptimization: (json['batteryOptimization'] ?? 0.5).toDouble(),
      customPatterns: (json['customPatterns'] as List<dynamic>?)
          ?.map((e) => GesturePattern.fromJson(e))
          .toList() ?? [],
      enabledTapTypes: (json['enabledTapTypes'] as List<dynamic>?)
          ?.map((e) => TapType.values.firstWhere(
              (type) => type.identifier == e,
              orElse: () => TapType.backSingleTap))
          .toSet() ?? {TapType.backSingleTap, TapType.backDoubleTap},
      minConfidenceThreshold: (json['minConfidenceThreshold'] ?? 0.6).toDouble(),
      sensorSamplingRate: json['sensorSamplingRate'] ?? 50,
      enableVibrationFeedback: json['enableVibrationFeedback'] ?? false,
      enableAudioFeedback: json['enableAudioFeedback'] ?? false,
    );
  }

  /// Converts GestureConfig to JSON
  Map<String, dynamic> toJson() {
    return {
      'enableBackTap': enableBackTap,
      'enableCustomPatterns': enableCustomPatterns,
      'enableAdaptiveLearning': enableAdaptiveLearning,
      'enableFalsePositivePrevention': enableFalsePositivePrevention,
      'sensitivity': sensitivity,
      'batteryOptimization': batteryOptimization,
      'customPatterns': customPatterns.map((e) => e.toJson()).toList(),
      'enabledTapTypes': enabledTapTypes.map((e) => e.identifier).toList(),
      'minConfidenceThreshold': minConfidenceThreshold,
      'sensorSamplingRate': sensorSamplingRate,
      'enableVibrationFeedback': enableVibrationFeedback,
      'enableAudioFeedback': enableAudioFeedback,
    };
  }

  /// Creates a copy with modified values
  GestureConfig copyWith({
    bool? enableBackTap,
    bool? enableCustomPatterns,
    bool? enableAdaptiveLearning,
    bool? enableFalsePositivePrevention,
    double? sensitivity,
    double? batteryOptimization,
    List<GesturePattern>? customPatterns,
    Set<TapType>? enabledTapTypes,
    double? minConfidenceThreshold,
    int? sensorSamplingRate,
    bool? enableVibrationFeedback,
    bool? enableAudioFeedback,
  }) {
    return GestureConfig(
      enableBackTap: enableBackTap ?? this.enableBackTap,
      enableCustomPatterns: enableCustomPatterns ?? this.enableCustomPatterns,
      enableAdaptiveLearning: enableAdaptiveLearning ?? this.enableAdaptiveLearning,
      enableFalsePositivePrevention: enableFalsePositivePrevention ?? this.enableFalsePositivePrevention,
      sensitivity: sensitivity ?? this.sensitivity,
      batteryOptimization: batteryOptimization ?? this.batteryOptimization,
      customPatterns: customPatterns ?? this.customPatterns,
      enabledTapTypes: enabledTapTypes ?? this.enabledTapTypes,
      minConfidenceThreshold: minConfidenceThreshold ?? this.minConfidenceThreshold,
      sensorSamplingRate: sensorSamplingRate ?? this.sensorSamplingRate,
      enableVibrationFeedback: enableVibrationFeedback ?? this.enableVibrationFeedback,
      enableAudioFeedback: enableAudioFeedback ?? this.enableAudioFeedback,
    );
  }

  /// Predefined configurations for different use cases
  static const GestureConfig accessibility = GestureConfig(
    enableBackTap: true,
    sensitivity: 0.9,
    enableVibrationFeedback: true,
    enabledTapTypes: {
      TapType.backSingleTap,
      TapType.backDoubleTap,
      TapType.backTripleTap,
    },
  );

  static const GestureConfig gaming = GestureConfig(
    enableBackTap: true,
    enableCustomPatterns: true,
    sensitivity: 0.8,
    batteryOptimization: 0.2,
    sensorSamplingRate: 100,
    enabledTapTypes: {
      TapType.backSingleTap,
      TapType.backDoubleTap,
      TapType.knockPattern,
      TapType.shakeGesture,
    },
  );

  static const GestureConfig batteryOptimized = GestureConfig(
    enableBackTap: true,
    enableAdaptiveLearning: false,
    sensitivity: 0.6,
    batteryOptimization: 0.9,
    sensorSamplingRate: 25,
    enabledTapTypes: {TapType.backDoubleTap},
  );

  @override
  String toString() {
    return 'GestureConfig(sensitivity: $sensitivity, enabledTypes: ${enabledTapTypes.length})';
  }
}
