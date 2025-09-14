import 'biometric_type.dart';
import 'trust_score.dart';

/// Result of biometric authentication attempt
class AuthenticationResult {
  final bool isAuthenticated;
  final List<BiometricType> usedBiometrics;
  final TrustScore trustScore;
  final String? errorMessage;
  final AuthenticationError? error;
  final DateTime timestamp;
  final Map<String, dynamic> metadata;

  const AuthenticationResult({
    required this.isAuthenticated,
    required this.usedBiometrics,
    required this.trustScore,
    this.errorMessage,
    this.error,
    required this.timestamp,
    this.metadata = const {},
  });

  /// Successful authentication result
  factory AuthenticationResult.success({
    required List<BiometricType> usedBiometrics,
    required TrustScore trustScore,
    Map<String, dynamic>? metadata,
  }) {
    return AuthenticationResult(
      isAuthenticated: true,
      usedBiometrics: usedBiometrics,
      trustScore: trustScore,
      timestamp: DateTime.now(),
      metadata: metadata ?? {},
    );
  }

  /// Failed authentication result
  factory AuthenticationResult.failure({
    required AuthenticationError error,
    String? errorMessage,
    List<BiometricType>? attemptedBiometrics,
    Map<String, dynamic>? metadata,
  }) {
    return AuthenticationResult(
      isAuthenticated: false,
      usedBiometrics: attemptedBiometrics ?? [],
      trustScore:  TrustScore(
        value: 0.0,
        timestamp: null,
        factors: {},
        reason: 'Authentication failed',
      ),
      error: error,
      errorMessage: errorMessage,
      timestamp: DateTime.now(),
      metadata: metadata ?? {},
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() => {
    'isAuthenticated': isAuthenticated,
    'usedBiometrics': usedBiometrics.map((e) => e.name).toList(),
    'trustScore': trustScore.toJson(),
    'errorMessage': errorMessage,
    'error': error?.name,
    'timestamp': timestamp.toIso8601String(),
    'metadata': metadata,
  };

  /// Create from JSON
  factory AuthenticationResult.fromJson(Map<String, dynamic> json) {
    return AuthenticationResult(
      isAuthenticated: json['isAuthenticated'] ?? false,
      usedBiometrics: (json['usedBiometrics'] as List?)
          ?.map((e) => BiometricType.values.firstWhere(
                (type) => type.name == e,
                orElse: () => BiometricType.fingerprint,
              ))
          .toList() ?? [],
      trustScore: TrustScore.fromJson(json['trustScore'] ?? {}),
      errorMessage: json['errorMessage'],
      error: json['error'] != null
          ? AuthenticationError.values.firstWhere(
              (e) => e.name == json['error'],
              orElse: () => AuthenticationError.unknown,
            )
          : null,
      timestamp: DateTime.parse(json['timestamp']),
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }
}

/// Authentication error types
enum AuthenticationError {
  /// User cancelled authentication
  userCancelled,
  
  /// Biometric not available on device
  biometricNotAvailable,
  
  /// No biometrics enrolled on device
  noBiometricsEnrolled,
  
  /// App-specific biometric not registered
  appBiometricNotRegistered,
  
  /// Authentication failed (wrong biometric)
  authenticationFailed,
  
  /// Too many failed attempts
  tooManyAttempts,
  
  /// Liveness detection failed
  livenessDetectionFailed,
  
  /// Spoofing attempt detected
  spoofingDetected,
  
  /// Trust score too low
  trustScoreTooLow,
  
  /// Timeout occurred
  timeout,
  
  /// Hardware error
  hardwareError,
  
  /// Network error (for cloud verification)
  networkError,
  
  /// Permission denied
  permissionDenied,
  
  /// Unknown error
  unknown,
}

extension AuthenticationErrorExtension on AuthenticationError {
  String get displayMessage {
    switch (this) {
      case AuthenticationError.userCancelled:
        return 'Authentication was cancelled by user';
      case AuthenticationError.biometricNotAvailable:
        return 'Biometric authentication is not available on this device';
      case AuthenticationError.noBiometricsEnrolled:
        return 'No biometrics are enrolled on this device';
      case AuthenticationError.appBiometricNotRegistered:
        return 'Please register your biometric for this app first';
      case AuthenticationError.authenticationFailed:
        return 'Biometric authentication failed';
      case AuthenticationError.tooManyAttempts:
        return 'Too many failed attempts. Please try again later';
      case AuthenticationError.livenessDetectionFailed:
        return 'Liveness detection failed. Please try again';
      case AuthenticationError.spoofingDetected:
        return 'Spoofing attempt detected. Authentication blocked';
      case AuthenticationError.trustScoreTooLow:
        return 'Security check failed. Please verify your identity';
      case AuthenticationError.timeout:
        return 'Authentication timed out';
      case AuthenticationError.hardwareError:
        return 'Hardware error occurred';
      case AuthenticationError.networkError:
        return 'Network error occurred';
      case AuthenticationError.permissionDenied:
        return 'Permission denied for biometric access';
      case AuthenticationError.unknown:
        return 'An unknown error occurred';
    }
  }

  bool get isRecoverable {
    return ![
      AuthenticationError.biometricNotAvailable,
      AuthenticationError.noBiometricsEnrolled,
      AuthenticationError.hardwareError,
      AuthenticationError.permissionDenied,
    ].contains(this);
  }
}
