/// Enumeration of supported tap types for gesture recognition
enum TapType {
  /// Single tap on device back panel
  backSingleTap,
  
  /// Double tap on device back panel
  backDoubleTap,
  
  /// Triple tap on device back panel
  backTripleTap,
  
  /// Custom knock pattern (e.g., short-long-short)
  knockPattern,
  
  /// Custom tap sequence defined by developer
  customSequence,
  
  /// Proximity-based gesture (device movement near ear/face)
  proximityGesture,
  
  /// Shake gesture with configurable intensity
  shakeGesture,
  
  /// Flip gesture (device orientation change)
  flipGesture,
}

/// Extension to provide human-readable descriptions
extension TapTypeExtension on TapType {
  String get description {
    switch (this) {
      case TapType.backSingleTap:
        return 'Single tap on back panel';
      case TapType.backDoubleTap:
        return 'Double tap on back panel';
      case TapType.backTripleTap:
        return 'Triple tap on back panel';
      case TapType.knockPattern:
        return 'Custom knock pattern';
      case TapType.customSequence:
        return 'Custom tap sequence';
      case TapType.proximityGesture:
        return 'Proximity-based gesture';
      case TapType.shakeGesture:
        return 'Shake gesture';
      case TapType.flipGesture:
        return 'Flip gesture';
    }
  }
  
  String get identifier {
    return toString().split('.').last;
  }
}
