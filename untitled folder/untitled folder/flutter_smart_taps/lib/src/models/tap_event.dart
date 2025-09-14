import 'tap_type.dart';

/// Represents a detected tap/gesture event with metadata
class TapEvent {
  /// Type of tap that was detected
  final TapType type;
  
  /// Timestamp when the event occurred
  final DateTime timestamp;
  
  /// Confidence score from ML model (0.0 to 1.0)
  final double confidence;
  
  /// Raw sensor data that triggered the event
  final Map<String, dynamic> sensorData;
  
  /// Duration of the gesture in milliseconds
  final int duration;
  
  /// Intensity/strength of the tap (0.0 to 1.0)
  final double intensity;
  
  /// Additional metadata specific to the gesture type
  final Map<String, dynamic> metadata;

  const TapEvent({
    required this.type,
    required this.timestamp,
    required this.confidence,
    required this.sensorData,
    required this.duration,
    required this.intensity,
    this.metadata = const {},
  });

  /// Creates a TapEvent from JSON data (for platform channel communication)
  factory TapEvent.fromJson(Map<String, dynamic> json) {
    return TapEvent(
      type: TapType.values.firstWhere(
        (e) => e.identifier == json['type'],
        orElse: () => TapType.backSingleTap,
      ),
      timestamp: DateTime.fromMillisecondsSinceEpoch(json['timestamp'] ?? 0),
      confidence: (json['confidence'] ?? 0.0).toDouble(),
      sensorData: Map<String, dynamic>.from(json['sensorData'] ?? {}),
      duration: json['duration'] ?? 0,
      intensity: (json['intensity'] ?? 0.0).toDouble(),
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }

  /// Converts TapEvent to JSON for platform channel communication
  Map<String, dynamic> toJson() {
    return {
      'type': type.identifier,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'confidence': confidence,
      'sensorData': sensorData,
      'duration': duration,
      'intensity': intensity,
      'metadata': metadata,
    };
  }

  @override
  String toString() {
    return 'TapEvent(type: $type, confidence: ${confidence.toStringAsFixed(2)}, '
           'intensity: ${intensity.toStringAsFixed(2)}, duration: ${duration}ms)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is TapEvent &&
        other.type == type &&
        other.timestamp == timestamp &&
        other.confidence == confidence;
  }

  @override
  int get hashCode {
    return type.hashCode ^ timestamp.hashCode ^ confidence.hashCode;
  }
}
