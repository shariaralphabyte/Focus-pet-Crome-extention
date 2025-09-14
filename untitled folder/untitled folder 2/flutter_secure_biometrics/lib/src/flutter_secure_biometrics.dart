import 'dart:async';
import 'package:flutter/services.dart';
import 'flutter_secure_biometrics_platform_interface.dart';
import 'models/biometric_config.dart';
import 'models/authentication_result.dart';
import 'models/trust_score.dart';
import 'models/biometric_type.dart';
import 'models/behavioral_metrics.dart';
import 'exceptions/biometric_exceptions.dart';

/// Main class for secure biometric authentication
class FlutterSecureBiometrics {
  static FlutterSecureBiometrics? _instance;
  static FlutterSecureBiometrics get instance => _instance ??= FlutterSecureBiometrics._();
  
  FlutterSecureBiometrics._();

  final FlutterSecureBiometricsPlatform _platform = FlutterSecureBiometricsPlatform.instance;
  
  StreamController<TrustScore>? _trustScoreController;
  StreamController<BehavioralMetrics>? _behavioralController;
  Timer? _continuousAuthTimer;
  String? _currentAppId;
  BiometricConfig? _currentConfig;

  /// Stream of trust score updates during continuous authentication
  Stream<TrustScore> get trustScoreStream {
    _trustScoreController ??= StreamController<TrustScore>.broadcast();
    return _trustScoreController!.stream;
  }

  /// Stream of behavioral metrics updates
  Stream<BehavioralMetrics> get behavioralMetricsStream {
    _behavioralController ??= StreamController<BehavioralMetrics>.broadcast();
    return _behavioralController!.stream;
  }

  /// Check if biometric authentication is available on this device
  Future<bool> isAvailable() async {
    try {
      return await _platform.isAvailable();
    } catch (e) {
      throw BiometricNotAvailableException(e.toString());
    }
  }

  /// Get list of available biometric types on this device
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _platform.getAvailableBiometrics();
    } catch (e) {
      throw BiometricNotAvailableException('Failed to get available biometrics: $e');
    }
  }

  /// Register app-specific biometric for the current application
  /// This creates an isolated biometric profile that only works for this app
  Future<bool> registerAppBiometric({
    required BiometricType type,
    required String appId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final isAvailable = await isAvailable();
      if (!isAvailable) {
        throw const BiometricNotAvailableException();
      }

      final availableBiometrics = await getAvailableBiometrics();
      if (!availableBiometrics.contains(type)) {
        throw BiometricNotAvailableException('${type.displayName} is not available on this device');
      }

      return await _platform.registerAppBiometric(
        type: type,
        appId: appId,
        metadata: metadata,
      );
    } catch (e) {
      if (e is BiometricException) rethrow;
      throw BiometricNotAvailableException('Failed to register biometric: $e');
    }
  }

  /// Check if app-specific biometric is registered
  Future<bool> isAppBiometricRegistered({
    required BiometricType type,
    required String appId,
  }) async {
    try {
      return await _platform.isAppBiometricRegistered(type: type, appId: appId);
    } catch (e) {
      return false;
    }
  }

  /// Authenticate using app-specific biometric isolation
  Future<AuthenticationResult> authenticate({
    required BiometricConfig config,
    required String appId,
    String? reason,
  }) async {
    try {
      // Validate configuration
      await _validateConfig(config, appId);

      // Perform authentication
      final result = await _platform.authenticate(
        config: config,
        appId: appId,
        reason: reason ?? 'Authenticate to access ${appId}',
      );

      // Handle result
      if (!result.isAuthenticated && result.error != null) {
        _throwExceptionForError(result.error!, result.errorMessage);
      }

      return result;
    } catch (e) {
      if (e is BiometricException) rethrow;
      throw AuthenticationFailedException('Authentication failed: $e');
    }
  }

  /// Start continuous authentication monitoring
  Future<bool> startContinuousAuth({
    required BiometricConfig config,
    required String appId,
  }) async {
    try {
      if (!config.continuousMonitoring) {
        throw const BiometricNotAvailableException('Continuous monitoring not enabled in config');
      }

      await _validateConfig(config, appId);

      _currentAppId = appId;
      _currentConfig = config;

      final started = await _platform.startContinuousAuth(config: config, appId: appId);
      
      if (started) {
        _startTrustScoreMonitoring();
      }

      return started;
    } catch (e) {
      if (e is BiometricException) rethrow;
      throw AuthenticationFailedException('Failed to start continuous auth: $e');
    }
  }

  /// Stop continuous authentication monitoring
  Future<bool> stopContinuousAuth() async {
    try {
      _stopTrustScoreMonitoring();
      _currentAppId = null;
      _currentConfig = null;
      return await _platform.stopContinuousAuth();
    } catch (e) {
      return false;
    }
  }

  /// Get current trust score
  Future<TrustScore> getCurrentTrustScore() async {
    try {
      return await _platform.getCurrentTrustScore();
    } catch (e) {
      return  TrustScore(
        value: 0.0,
        timestamp: null,
        factors: {},
        reason: 'Failed to get trust score',
      );
    }
  }

  /// Update behavioral metrics for continuous authentication
  Future<bool> updateBehavioralMetrics(BehavioralMetrics metrics) async {
    try {
      final updated = await _platform.updateBehavioralMetrics(metrics);
      
      if (updated) {
        _behavioralController?.add(metrics);
      }

      return updated;
    } catch (e) {
      return false;
    }
  }

  /// Lock application immediately (emergency security measure)
  Future<bool> lockApplication() async {
    try {
      await stopContinuousAuth();
      return await _platform.lockApplication();
    } catch (e) {
      return false;
    }
  }

  /// Perform liveness detection for anti-spoofing
  Future<bool> performLivenessDetection(BiometricType type) async {
    try {
      return await _platform.performLivenessDetection(type);
    } catch (e) {
      throw LivenessDetectionException('Liveness detection failed: $e');
    }
  }

  /// Detect spoofing attempts
  Future<bool> detectSpoofing(BiometricType type) async {
    try {
      final isSpoofing = await _platform.detectSpoofing(type);
      if (isSpoofing) {
        throw const SpoofingDetectedException();
      }
      return !isSpoofing;
    } catch (e) {
      if (e is SpoofingDetectedException) rethrow;
      throw SpoofingDetectedException('Spoofing detection failed: $e');
    }
  }

  /// Get health-based biometric measurements
  Future<Map<String, double>> getHealthBiometrics() async {
    try {
      return await _platform.getHealthBiometrics();
    } catch (e) {
      throw BiometricNotAvailableException('Health biometrics not available: $e');
    }
  }

  /// Clear app-specific biometric data
  Future<bool> clearAppBiometric({
    required BiometricType type,
    required String appId,
  }) async {
    try {
      return await _platform.clearAppBiometric(type: type, appId: appId);
    } catch (e) {
      return false;
    }
  }

  /// Export training data for backup/transfer
  Future<Map<String, dynamic>> exportTrainingData() async {
    try {
      return await _platform.exportTrainingData();
    } catch (e) {
      throw BiometricNotAvailableException('Failed to export training data: $e');
    }
  }

  /// Import training data from backup
  Future<bool> importTrainingData(Map<String, dynamic> data) async {
    try {
      return await _platform.importTrainingData(data);
    } catch (e) {
      return false;
    }
  }

  /// Dispose resources
  void dispose() {
    _stopTrustScoreMonitoring();
    _trustScoreController?.close();
    _behavioralController?.close();
    _trustScoreController = null;
    _behavioralController = null;
  }

  // Private methods

  Future<void> _validateConfig(BiometricConfig config, String appId) async {
    // Check if required biometrics are registered
    for (final type in config.enabledBiometrics) {
      final isRegistered = await isAppBiometricRegistered(type: type, appId: appId);
      if (!isRegistered) {
        throw AppBiometricNotRegisteredException(
          'Biometric ${type.displayName} is not registered for app $appId',
        );
      }
    }

    // Validate security level requirements
    if (config.enabledBiometrics.length < config.securityLevel.requiredFactors) {
      throw AuthenticationFailedException(
        'Security level ${config.securityLevel.displayName} requires at least ${config.securityLevel.requiredFactors} biometric factors',
      );
    }
  }

  void _startTrustScoreMonitoring() {
    _stopTrustScoreMonitoring();
    
    _continuousAuthTimer = Timer.periodic(const Duration(seconds: 5), (timer) async {
      try {
        final trustScore = await getCurrentTrustScore();
        _trustScoreController?.add(trustScore);

        // Check if trust score is too low
        if (_currentConfig != null && 
            trustScore.value < _currentConfig!.securityLevel.minimumTrustScore) {
          await lockApplication();
          _trustScoreController?.addError(
            TrustScoreTooLowException(
              currentScore: trustScore.value,
              requiredScore: _currentConfig!.securityLevel.minimumTrustScore,
            ),
          );
        }
      } catch (e) {
        _trustScoreController?.addError(e);
      }
    });
  }

  void _stopTrustScoreMonitoring() {
    _continuousAuthTimer?.cancel();
    _continuousAuthTimer = null;
  }

  void _throwExceptionForError(AuthenticationError error, String? message) {
    switch (error) {
      case AuthenticationError.userCancelled:
        throw UserCancelledException(message);
      case AuthenticationError.biometricNotAvailable:
        throw BiometricNotAvailableException(message);
      case AuthenticationError.noBiometricsEnrolled:
        throw NoBiometricsEnrolledException(message);
      case AuthenticationError.appBiometricNotRegistered:
        throw AppBiometricNotRegisteredException(message);
      case AuthenticationError.authenticationFailed:
        throw AuthenticationFailedException(message);
      case AuthenticationError.tooManyAttempts:
        throw TooManyAttemptsException(message);
      case AuthenticationError.livenessDetectionFailed:
        throw LivenessDetectionException(message);
      case AuthenticationError.spoofingDetected:
        throw SpoofingDetectedException(message);
      case AuthenticationError.trustScoreTooLow:
        throw TrustScoreTooLowException(
          currentScore: 0.0,
          requiredScore: 0.7,
          message: message,
        );
      case AuthenticationError.timeout:
        throw TimeoutException(message);
      case AuthenticationError.hardwareError:
        throw HardwareErrorException(message);
      case AuthenticationError.networkError:
        throw NetworkErrorException(message);
      case AuthenticationError.permissionDenied:
        throw PermissionDeniedException(message);
      case AuthenticationError.unknown:
        throw BiometricException(message ?? 'Unknown error occurred');
    }
  }
}
