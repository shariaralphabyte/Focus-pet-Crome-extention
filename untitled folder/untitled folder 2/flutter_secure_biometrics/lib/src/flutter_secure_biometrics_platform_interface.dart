import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'models/biometric_config.dart';
import 'models/authentication_result.dart';
import 'models/trust_score.dart';
import 'models/biometric_type.dart';
import 'models/behavioral_metrics.dart';

/// Platform interface for flutter_secure_biometrics
abstract class FlutterSecureBiometricsPlatform extends PlatformInterface {
  FlutterSecureBiometricsPlatform() : super(token: _token);

  static final Object _token = Object();
  static FlutterSecureBiometricsPlatform _instance = _DefaultPlatform();

  static FlutterSecureBiometricsPlatform get instance => _instance;

  static set instance(FlutterSecureBiometricsPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  /// Check if biometric authentication is available
  Future<bool> isAvailable() {
    throw UnimplementedError('isAvailable() has not been implemented.');
  }

  /// Get available biometric types on device
  Future<List<BiometricType>> getAvailableBiometrics() {
    throw UnimplementedError('getAvailableBiometrics() has not been implemented.');
  }

  /// Register app-specific biometric
  Future<bool> registerAppBiometric({
    required BiometricType type,
    required String appId,
    Map<String, dynamic>? metadata,
  }) {
    throw UnimplementedError('registerAppBiometric() has not been implemented.');
  }

  /// Check if app-specific biometric is registered
  Future<bool> isAppBiometricRegistered({
    required BiometricType type,
    required String appId,
  }) {
    throw UnimplementedError('isAppBiometricRegistered() has not been implemented.');
  }

  /// Authenticate with biometric
  Future<AuthenticationResult> authenticate({
    required BiometricConfig config,
    required String appId,
    String? reason,
  }) {
    throw UnimplementedError('authenticate() has not been implemented.');
  }

  /// Start continuous authentication monitoring
  Future<bool> startContinuousAuth({
    required BiometricConfig config,
    required String appId,
  }) {
    throw UnimplementedError('startContinuousAuth() has not been implemented.');
  }

  /// Stop continuous authentication monitoring
  Future<bool> stopContinuousAuth() {
    throw UnimplementedError('stopContinuousAuth() has not been implemented.');
  }

  /// Get current trust score
  Future<TrustScore> getCurrentTrustScore() {
    throw UnimplementedError('getCurrentTrustScore() has not been implemented.');
  }

  /// Update behavioral metrics
  Future<bool> updateBehavioralMetrics(BehavioralMetrics metrics) {
    throw UnimplementedError('updateBehavioralMetrics() has not been implemented.');
  }

  /// Lock application immediately
  Future<bool> lockApplication() {
    throw UnimplementedError('lockApplication() has not been implemented.');
  }

  /// Perform liveness detection
  Future<bool> performLivenessDetection(BiometricType type) {
    throw UnimplementedError('performLivenessDetection() has not been implemented.');
  }

  /// Detect spoofing attempts
  Future<bool> detectSpoofing(BiometricType type) {
    throw UnimplementedError('detectSpoofing() has not been implemented.');
  }

  /// Get health-based biometric data
  Future<Map<String, double>> getHealthBiometrics() {
    throw UnimplementedError('getHealthBiometrics() has not been implemented.');
  }

  /// Clear app-specific biometric data
  Future<bool> clearAppBiometric({
    required BiometricType type,
    required String appId,
  }) {
    throw UnimplementedError('clearAppBiometric() has not been implemented.');
  }

  /// Export biometric training data
  Future<Map<String, dynamic>> exportTrainingData() {
    throw UnimplementedError('exportTrainingData() has not been implemented.');
  }

  /// Import biometric training data
  Future<bool> importTrainingData(Map<String, dynamic> data) {
    throw UnimplementedError('importTrainingData() has not been implemented.');
  }
}

class _DefaultPlatform extends FlutterSecureBiometricsPlatform {
  @override
  Future<bool> isAvailable() async => false;

  @override
  Future<List<BiometricType>> getAvailableBiometrics() async => [];

  @override
  Future<bool> registerAppBiometric({
    required BiometricType type,
    required String appId,
    Map<String, dynamic>? metadata,
  }) async => false;

  @override
  Future<bool> isAppBiometricRegistered({
    required BiometricType type,
    required String appId,
  }) async => false;

  @override
  Future<AuthenticationResult> authenticate({
    required BiometricConfig config,
    required String appId,
    String? reason,
  }) async {
    return AuthenticationResult.failure(
      error: AuthenticationError.biometricNotAvailable,
      errorMessage: 'Platform not implemented',
    );
  }

  @override
  Future<bool> startContinuousAuth({
    required BiometricConfig config,
    required String appId,
  }) async => false;

  @override
  Future<bool> stopContinuousAuth() async => false;

  @override
  Future<TrustScore> getCurrentTrustScore() async => TrustScore.perfect;

  @override
  Future<bool> updateBehavioralMetrics(BehavioralMetrics metrics) async => false;

  @override
  Future<bool> lockApplication() async => false;

  @override
  Future<bool> performLivenessDetection(BiometricType type) async => false;

  @override
  Future<bool> detectSpoofing(BiometricType type) async => false;

  @override
  Future<Map<String, double>> getHealthBiometrics() async => {};

  @override
  Future<bool> clearAppBiometric({
    required BiometricType type,
    required String appId,
  }) async => false;

  @override
  Future<Map<String, dynamic>> exportTrainingData() async => {};

  @override
  Future<bool> importTrainingData(Map<String, dynamic> data) async => false;
}
