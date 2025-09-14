import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

void main() {
  group('BiometricConfig', () {
    test('should create BiometricConfig with all parameters', () {
      final config = BiometricConfig(
        securityLevel: SecurityLevel.high,
        enabledBiometrics: [BiometricType.fingerprint, BiometricType.face],
        authenticationTimeout: const Duration(seconds: 30),
        continuousAuthRequired: true,
        fallbackMethods: [FallbackMethod.pin, FallbackMethod.password],
        minimumTrustScore: 0.75,
        livenessDetectionRequired: true,
        spoofingDetectionEnabled: true,
      );

      expect(config.securityLevel, equals(SecurityLevel.high));
      expect(config.enabledBiometrics, equals([BiometricType.fingerprint, BiometricType.face]));
      expect(config.authenticationTimeout, equals(const Duration(seconds: 30)));
      expect(config.continuousAuthRequired, isTrue);
      expect(config.fallbackMethods, equals([FallbackMethod.pin, FallbackMethod.password]));
      expect(config.minimumTrustScore, equals(0.75));
      expect(config.livenessDetectionRequired, isTrue);
      expect(config.spoofingDetectionEnabled, isTrue);
    });

    test('should serialize to JSON correctly', () {
      final config = BiometricConfig(
        securityLevel: SecurityLevel.high,
        enabledBiometrics: [BiometricType.fingerprint, BiometricType.face],
        authenticationTimeout: const Duration(seconds: 30),
        continuousAuthRequired: true,
        fallbackMethods: [FallbackMethod.pin],
        minimumTrustScore: 0.75,
        livenessDetectionRequired: true,
        spoofingDetectionEnabled: true,
      );

      final json = config.toJson();

      expect(json['securityLevel'], equals('high'));
      expect(json['enabledBiometrics'], equals(['fingerprint', 'face']));
      expect(json['authenticationTimeoutSeconds'], equals(30));
      expect(json['continuousAuthRequired'], isTrue);
      expect(json['fallbackMethods'], equals(['pin']));
      expect(json['minimumTrustScore'], equals(0.75));
      expect(json['livenessDetectionRequired'], isTrue);
      expect(json['spoofingDetectionEnabled'], isTrue);
    });

    test('should deserialize from JSON correctly', () {
      final json = {
        'securityLevel': 'high',
        'enabledBiometrics': ['fingerprint', 'face'],
        'authenticationTimeoutSeconds': 30,
        'continuousAuthRequired': true,
        'fallbackMethods': ['pin'],
        'minimumTrustScore': 0.75,
        'livenessDetectionRequired': true,
        'spoofingDetectionEnabled': true,
      };

      final config = BiometricConfig.fromJson(json);

      expect(config.securityLevel, equals(SecurityLevel.high));
      expect(config.enabledBiometrics, equals([BiometricType.fingerprint, BiometricType.face]));
      expect(config.authenticationTimeout, equals(const Duration(seconds: 30)));
      expect(config.continuousAuthRequired, isTrue);
      expect(config.fallbackMethods, equals([FallbackMethod.pin]));
      expect(config.minimumTrustScore, equals(0.75));
      expect(config.livenessDetectionRequired, isTrue);
      expect(config.spoofingDetectionEnabled, isTrue);
    });

    group('Predefined Configurations', () {
      test('banking configuration should have maximum security', () {
        final config = BiometricConfig.banking;

        expect(config.securityLevel, equals(SecurityLevel.maximum));
        expect(config.enabledBiometrics, contains(BiometricType.fingerprint));
        expect(config.enabledBiometrics, contains(BiometricType.face));
        expect(config.continuousAuthRequired, isTrue);
        expect(config.minimumTrustScore, equals(0.8));
        expect(config.livenessDetectionRequired, isTrue);
        expect(config.spoofingDetectionEnabled, isTrue);
      });

      test('healthcare configuration should include health biometrics', () {
        final config = BiometricConfig.healthcare;

        expect(config.securityLevel, equals(SecurityLevel.high));
        expect(config.enabledBiometrics, contains(BiometricType.heartRate));
        expect(config.enabledBiometrics, contains(BiometricType.bloodOxygen));
        expect(config.continuousAuthRequired, isTrue);
        expect(config.minimumTrustScore, equals(0.7));
        expect(config.livenessDetectionRequired, isTrue);
        expect(config.spoofingDetectionEnabled, isTrue);
      });

      test('enterprise configuration should enable behavioral monitoring', () {
        final config = BiometricConfig.enterprise;

        expect(config.securityLevel, equals(SecurityLevel.high));
        expect(config.enabledBiometrics, contains(BiometricType.fingerprint));
        expect(config.enabledBiometrics, contains(BiometricType.face));
        expect(config.continuousAuthRequired, isTrue);
        expect(config.minimumTrustScore, equals(0.65));
        expect(config.livenessDetectionRequired, isTrue);
        expect(config.spoofingDetectionEnabled, isTrue);
      });

      test('government configuration should have highest security', () {
        final config = BiometricConfig.government;

        expect(config.securityLevel, equals(SecurityLevel.maximum));
        expect(config.enabledBiometrics.length, greaterThan(3));
        expect(config.continuousAuthRequired, isTrue);
        expect(config.minimumTrustScore, equals(0.9));
        expect(config.livenessDetectionRequired, isTrue);
        expect(config.spoofingDetectionEnabled, isTrue);
      });

      test('basic configuration should have minimal requirements', () {
        final config = BiometricConfig.basic;

        expect(config.securityLevel, equals(SecurityLevel.low));
        expect(config.enabledBiometrics, equals([BiometricType.fingerprint]));
        expect(config.continuousAuthRequired, isFalse);
        expect(config.minimumTrustScore, equals(0.5));
        expect(config.livenessDetectionRequired, isFalse);
        expect(config.spoofingDetectionEnabled, isFalse);
      });
    });

    test('should handle empty biometric types list', () {
      final config = BiometricConfig(
        securityLevel: SecurityLevel.low,
        enabledBiometrics: [],
        authenticationTimeout: const Duration(seconds: 30),
        continuousAuthRequired: false,
        fallbackMethods: [],
        minimumTrustScore: 0.5,
        livenessDetectionRequired: false,
        spoofingDetectionEnabled: false,
      );

      expect(config.enabledBiometrics, isEmpty);
      expect(config.fallbackMethods, isEmpty);
    });

    test('should validate minimum trust score bounds', () {
      final config1 = BiometricConfig(
        securityLevel: SecurityLevel.low,
        enabledBiometrics: [BiometricType.fingerprint],
        authenticationTimeout: const Duration(seconds: 30),
        continuousAuthRequired: false,
        fallbackMethods: [],
        minimumTrustScore: 0.0,
        livenessDetectionRequired: false,
        spoofingDetectionEnabled: false,
      );

      final config2 = BiometricConfig(
        securityLevel: SecurityLevel.maximum,
        enabledBiometrics: [BiometricType.fingerprint],
        authenticationTimeout: const Duration(seconds: 30),
        continuousAuthRequired: true,
        fallbackMethods: [],
        minimumTrustScore: 1.0,
        livenessDetectionRequired: true,
        spoofingDetectionEnabled: true,
      );

      expect(config1.minimumTrustScore, equals(0.0));
      expect(config2.minimumTrustScore, equals(1.0));
    });
  });

  group('FallbackMethod', () {
    test('should have correct display names', () {
      expect(FallbackMethod.pin.displayName, equals('PIN'));
      expect(FallbackMethod.password.displayName, equals('Password'));
      expect(FallbackMethod.pattern.displayName, equals('Pattern'));
      expect(FallbackMethod.none.displayName, equals('None'));
    });

    test('should have all enum values', () {
      expect(FallbackMethod.values.length, equals(4));
      expect(FallbackMethod.values, contains(FallbackMethod.pin));
      expect(FallbackMethod.values, contains(FallbackMethod.password));
      expect(FallbackMethod.values, contains(FallbackMethod.pattern));
      expect(FallbackMethod.values, contains(FallbackMethod.none));
    });
  });
}
