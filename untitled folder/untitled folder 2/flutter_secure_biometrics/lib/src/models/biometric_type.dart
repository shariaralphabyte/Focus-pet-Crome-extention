/// Supported biometric authentication types
enum BiometricType {
  /// Fingerprint recognition
  fingerprint,
  
  /// Face recognition
  face,
  
  /// Voice pattern matching
  voice,
  
  /// Iris scanning (where supported)
  iris,
  
  /// Heart rate via camera
  heartRate,
  
  /// Blood oxygen via camera
  bloodOxygen,
  
  /// Breathing pattern analysis
  breathingPattern,
}

extension BiometricTypeExtension on BiometricType {
  String get displayName {
    switch (this) {
      case BiometricType.fingerprint:
        return 'Fingerprint';
      case BiometricType.face:
        return 'Face Recognition';
      case BiometricType.voice:
        return 'Voice Pattern';
      case BiometricType.iris:
        return 'Iris Scan';
      case BiometricType.heartRate:
        return 'Heart Rate';
      case BiometricType.bloodOxygen:
        return 'Blood Oxygen';
      case BiometricType.breathingPattern:
        return 'Breathing Pattern';
    }
  }

  bool get isHealthBased {
    return [
      BiometricType.heartRate,
      BiometricType.bloodOxygen,
      BiometricType.breathingPattern,
    ].contains(this);
  }

  bool get requiresCamera {
    return [
      BiometricType.face,
      BiometricType.iris,
      BiometricType.heartRate,
      BiometricType.bloodOxygen,
      BiometricType.breathingPattern,
    ].contains(this);
  }
}
