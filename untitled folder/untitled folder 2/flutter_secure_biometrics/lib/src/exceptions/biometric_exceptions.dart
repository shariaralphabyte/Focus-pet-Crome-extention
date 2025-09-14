/// Base exception for biometric operations
abstract class BiometricException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  const BiometricException(this.message, {this.code, this.details});

  @override
  String toString() => 'BiometricException: $message';
}

/// Exception thrown when biometric hardware is not available
class BiometricNotAvailableException extends BiometricException {
  const BiometricNotAvailableException([String? message])
      : super(message ?? 'Biometric authentication is not available on this device',
              code: 'BIOMETRIC_NOT_AVAILABLE');
}

/// Exception thrown when no biometrics are enrolled
class NoBiometricsEnrolledException extends BiometricException {
  const NoBiometricsEnrolledException([String? message])
      : super(message ?? 'No biometrics are enrolled on this device',
              code: 'NO_BIOMETRICS_ENROLLED');
}

/// Exception thrown when app-specific biometric is not registered
class AppBiometricNotRegisteredException extends BiometricException {
  const AppBiometricNotRegisteredException([String? message])
      : super(message ?? 'App-specific biometric is not registered',
              code: 'APP_BIOMETRIC_NOT_REGISTERED');
}

/// Exception thrown when authentication fails
class AuthenticationFailedException extends BiometricException {
  const AuthenticationFailedException([String? message])
      : super(message ?? 'Biometric authentication failed',
              code: 'AUTHENTICATION_FAILED');
}

/// Exception thrown when too many attempts are made
class TooManyAttemptsException extends BiometricException {
  const TooManyAttemptsException([String? message])
      : super(message ?? 'Too many failed authentication attempts',
              code: 'TOO_MANY_ATTEMPTS');
}

/// Exception thrown when liveness detection fails
class LivenessDetectionException extends BiometricException {
  const LivenessDetectionException([String? message])
      : super(message ?? 'Liveness detection failed',
              code: 'LIVENESS_DETECTION_FAILED');
}

/// Exception thrown when spoofing is detected
class SpoofingDetectedException extends BiometricException {
  const SpoofingDetectedException([String? message])
      : super(message ?? 'Spoofing attempt detected',
              code: 'SPOOFING_DETECTED');
}

/// Exception thrown when trust score is too low
class TrustScoreTooLowException extends BiometricException {
  final double currentScore;
  final double requiredScore;

  const TrustScoreTooLowException({
    required this.currentScore,
    required this.requiredScore,
    String? message,
  }) : super(
          message ?? 'Trust score too low: $currentScore < $requiredScore',
          code: 'TRUST_SCORE_TOO_LOW',
        );
}

/// Exception thrown when permission is denied
class PermissionDeniedException extends BiometricException {
  const PermissionDeniedException([String? message])
      : super(message ?? 'Permission denied for biometric access',
              code: 'PERMISSION_DENIED');
}

/// Exception thrown when hardware error occurs
class HardwareErrorException extends BiometricException {
  const HardwareErrorException([String? message])
      : super(message ?? 'Biometric hardware error occurred',
              code: 'HARDWARE_ERROR');
}

/// Exception thrown when network error occurs
class NetworkErrorException extends BiometricException {
  const NetworkErrorException([String? message])
      : super(message ?? 'Network error during biometric verification',
              code: 'NETWORK_ERROR');
}

/// Exception thrown when operation times out
class TimeoutException extends BiometricException {
  const TimeoutException([String? message])
      : super(message ?? 'Biometric operation timed out',
              code: 'TIMEOUT');
}

/// Exception thrown when user cancels operation
class UserCancelledException extends BiometricException {
  const UserCancelledException([String? message])
      : super(message ?? 'User cancelled biometric operation',
              code: 'USER_CANCELLED');
}
