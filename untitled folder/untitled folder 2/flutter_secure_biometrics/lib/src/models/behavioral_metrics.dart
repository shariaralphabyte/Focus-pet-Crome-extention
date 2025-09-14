/// Behavioral biometric metrics for continuous authentication
class BehavioralMetrics {
  final TypingPattern? typingPattern;
  final TouchGesture? touchGesture;
  final DeviceHandling? deviceHandling;
  final AppUsage? appUsage;
  final DateTime timestamp;

  const BehavioralMetrics({
    this.typingPattern,
    this.touchGesture,
    this.deviceHandling,
    this.appUsage,
    required this.timestamp,
  });

  /// Convert to JSON
  Map<String, dynamic> toJson() => {
    'typingPattern': typingPattern?.toJson(),
    'touchGesture': touchGesture?.toJson(),
    'deviceHandling': deviceHandling?.toJson(),
    'appUsage': appUsage?.toJson(),
    'timestamp': timestamp.toIso8601String(),
  };

  /// Create from JSON
  factory BehavioralMetrics.fromJson(Map<String, dynamic> json) => BehavioralMetrics(
    typingPattern: json['typingPattern'] != null 
        ? TypingPattern.fromJson(json['typingPattern']) 
        : null,
    touchGesture: json['touchGesture'] != null 
        ? TouchGesture.fromJson(json['touchGesture']) 
        : null,
    deviceHandling: json['deviceHandling'] != null 
        ? DeviceHandling.fromJson(json['deviceHandling']) 
        : null,
    appUsage: json['appUsage'] != null 
        ? AppUsage.fromJson(json['appUsage']) 
        : null,
    timestamp: DateTime.parse(json['timestamp']),
  );
}

/// Typing pattern analysis
class TypingPattern {
  final double averageSpeed; // WPM
  final double rhythm; // Consistency score
  final double pressure; // Touch pressure
  final double dwellTime; // Key hold duration

  const TypingPattern({
    required this.averageSpeed,
    required this.rhythm,
    required this.pressure,
    required this.dwellTime,
  });

  Map<String, dynamic> toJson() => {
    'averageSpeed': averageSpeed,
    'rhythm': rhythm,
    'pressure': pressure,
    'dwellTime': dwellTime,
  };

  factory TypingPattern.fromJson(Map<String, dynamic> json) => TypingPattern(
    averageSpeed: json['averageSpeed']?.toDouble() ?? 0.0,
    rhythm: json['rhythm']?.toDouble() ?? 0.0,
    pressure: json['pressure']?.toDouble() ?? 0.0,
    dwellTime: json['dwellTime']?.toDouble() ?? 0.0,
  );
}

/// Touch gesture analysis
class TouchGesture {
  final double swipeVelocity;
  final double pressureSensitivity;
  final double fingerAngle;
  final List<double> touchPoints;

  const TouchGesture({
    required this.swipeVelocity,
    required this.pressureSensitivity,
    required this.fingerAngle,
    required this.touchPoints,
  });

  Map<String, dynamic> toJson() => {
    'swipeVelocity': swipeVelocity,
    'pressureSensitivity': pressureSensitivity,
    'fingerAngle': fingerAngle,
    'touchPoints': touchPoints,
  };

  factory TouchGesture.fromJson(Map<String, dynamic> json) => TouchGesture(
    swipeVelocity: json['swipeVelocity']?.toDouble() ?? 0.0,
    pressureSensitivity: json['pressureSensitivity']?.toDouble() ?? 0.0,
    fingerAngle: json['fingerAngle']?.toDouble() ?? 0.0,
    touchPoints: List<double>.from(json['touchPoints'] ?? []),
  );
}

/// Device handling patterns
class DeviceHandling {
  final double holdingAngle;
  final List<double> movementPatterns;
  final double stabilityScore;
  final double gripPressure;

  const DeviceHandling({
    required this.holdingAngle,
    required this.movementPatterns,
    required this.stabilityScore,
    required this.gripPressure,
  });

  Map<String, dynamic> toJson() => {
    'holdingAngle': holdingAngle,
    'movementPatterns': movementPatterns,
    'stabilityScore': stabilityScore,
    'gripPressure': gripPressure,
  };

  factory DeviceHandling.fromJson(Map<String, dynamic> json) => DeviceHandling(
    holdingAngle: json['holdingAngle']?.toDouble() ?? 0.0,
    movementPatterns: List<double>.from(json['movementPatterns'] ?? []),
    stabilityScore: json['stabilityScore']?.toDouble() ?? 0.0,
    gripPressure: json['gripPressure']?.toDouble() ?? 0.0,
  );
}

/// App usage patterns
class AppUsage {
  final List<String> navigationSequence;
  final Map<String, int> featureUsage;
  final double sessionDuration;
  final List<int> timingBetweenActions;

  const AppUsage({
    required this.navigationSequence,
    required this.featureUsage,
    required this.sessionDuration,
    required this.timingBetweenActions,
  });

  Map<String, dynamic> toJson() => {
    'navigationSequence': navigationSequence,
    'featureUsage': featureUsage,
    'sessionDuration': sessionDuration,
    'timingBetweenActions': timingBetweenActions,
  };

  factory AppUsage.fromJson(Map<String, dynamic> json) => AppUsage(
    navigationSequence: List<String>.from(json['navigationSequence'] ?? []),
    featureUsage: Map<String, int>.from(json['featureUsage'] ?? {}),
    sessionDuration: json['sessionDuration']?.toDouble() ?? 0.0,
    timingBetweenActions: List<int>.from(json['timingBetweenActions'] ?? []),
  );
}
