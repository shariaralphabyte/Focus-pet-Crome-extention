/// Represents a custom gesture pattern for advanced tap recognition
class GesturePattern {
  /// Unique identifier for the pattern
  final String id;
  
  /// Human-readable name for the pattern
  final String name;
  
  /// Sequence of tap intervals in milliseconds
  /// Example: [100, 300, 100] = short-long-short pattern
  final List<int> intervals;
  
  /// Tolerance for timing variations (in milliseconds)
  final int tolerance;
  
  /// Minimum confidence required to trigger this pattern
  final double minConfidence;
  
  /// Maximum time between taps before pattern resets (milliseconds)
  final int maxGapDuration;

  const GesturePattern({
    required this.id,
    required this.name,
    required this.intervals,
    this.tolerance = 50,
    this.minConfidence = 0.7,
    this.maxGapDuration = 1000,
  });

  /// Creates a GesturePattern from JSON
  factory GesturePattern.fromJson(Map<String, dynamic> json) {
    return GesturePattern(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      intervals: List<int>.from(json['intervals'] ?? []),
      tolerance: json['tolerance'] ?? 50,
      minConfidence: (json['minConfidence'] ?? 0.7).toDouble(),
      maxGapDuration: json['maxGapDuration'] ?? 1000,
    );
  }

  /// Converts GesturePattern to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'intervals': intervals,
      'tolerance': tolerance,
      'minConfidence': minConfidence,
      'maxGapDuration': maxGapDuration,
    };
  }

  /// Predefined common patterns
  static const GesturePattern knockKnock = GesturePattern(
    id: 'knock_knock',
    name: 'Knock Knock',
    intervals: [200, 200],
    tolerance: 100,
  );

  static const GesturePattern sosPattern = GesturePattern(
    id: 'sos',
    name: 'SOS Pattern',
    intervals: [100, 100, 100, 300, 300, 300, 100, 100, 100],
    tolerance: 75,
  );

  static const GesturePattern shortLongShort = GesturePattern(
    id: 'short_long_short',
    name: 'Short-Long-Short',
    intervals: [150, 400, 150],
    tolerance: 80,
  );

  @override
  String toString() {
    return 'GesturePattern(id: $id, name: $name, intervals: $intervals)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GesturePattern && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
