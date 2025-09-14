/// Security levels for biometric authentication
enum SecurityLevel {
  /// Single biometric factor
  low,
  
  /// Two biometric factors required
  medium,
  
  /// Three or more biometric factors required
  high,
  
  /// Maximum security with continuous monitoring
  maximum,
}

extension SecurityLevelExtension on SecurityLevel {
  String get displayName {
    switch (this) {
      case SecurityLevel.low:
        return 'Low Security';
      case SecurityLevel.medium:
        return 'Medium Security';
      case SecurityLevel.high:
        return 'High Security';
      case SecurityLevel.maximum:
        return 'Maximum Security';
    }
  }

  int get requiredFactors {
    switch (this) {
      case SecurityLevel.low:
        return 1;
      case SecurityLevel.medium:
        return 2;
      case SecurityLevel.high:
        return 3;
      case SecurityLevel.maximum:
        return 3;
    }
  }

  bool get requiresContinuousAuth {
    return this == SecurityLevel.maximum;
  }

  double get minimumTrustScore {
    switch (this) {
      case SecurityLevel.low:
        return 0.6;
      case SecurityLevel.medium:
        return 0.7;
      case SecurityLevel.high:
        return 0.8;
      case SecurityLevel.maximum:
        return 0.9;
    }
  }
}
