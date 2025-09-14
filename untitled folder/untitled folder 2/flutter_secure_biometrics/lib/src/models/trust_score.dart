/// Trust score for continuous authentication
class TrustScore {
  final double value;
  final DateTime timestamp;
  final Map<String, double> factors;
  final String reason;

  const TrustScore({
    required this.value,
    required this.timestamp,
    required this.factors,
    required this.reason,
  });

  /// Perfect trust score
  static  TrustScore perfect = TrustScore(
    value: 1.0,
    timestamp: null,
    factors: {},
    reason: 'Perfect behavioral match',
  );

  /// Create trust score from individual factors
  factory TrustScore.fromFactors({
    required Map<String, double> factors,
    String? reason,
  }) {
    final double average = factors.values.isEmpty 
        ? 0.0 
        : factors.values.reduce((a, b) => a + b) / factors.values.length;
    
    return TrustScore(
      value: average,
      timestamp: DateTime.now(),
      factors: Map.from(factors),
      reason: reason ?? 'Calculated from behavioral factors',
    );
  }

  /// Check if trust score meets minimum threshold
  bool meetsThreshold(double threshold) => value >= threshold;

  /// Check if trust score is suspicious
  bool get isSuspicious => value < 0.7;

  /// Check if trust score requires immediate action
  bool get requiresImmediateAction => value < 0.6;

  /// Get trust level description
  String get trustLevel {
    if (value >= 0.9) return 'Excellent';
    if (value >= 0.8) return 'Good';
    if (value >= 0.7) return 'Fair';
    if (value >= 0.6) return 'Suspicious';
    return 'High Risk';
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() => {
    'value': value,
    'timestamp': timestamp?.toIso8601String(),
    'factors': factors,
    'reason': reason,
  };

  /// Create from JSON
  factory TrustScore.fromJson(Map<String, dynamic> json) => TrustScore(
    value: json['value']?.toDouble() ?? 0.0,
    timestamp: json['timestamp'] != null 
        ? DateTime.parse(json['timestamp']) 
        : DateTime.now(),
    factors: Map<String, double>.from(json['factors'] ?? {}),
    reason: json['reason'] ?? '',
  );

  @override
  String toString() => 'TrustScore(${(value * 100).toStringAsFixed(1)}% - $trustLevel)';
}
