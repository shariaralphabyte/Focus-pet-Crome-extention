import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

void main() {
  group('BiometricType', () {
    test('should have correct display names', () {
      expect(BiometricType.fingerprint.displayName, equals('Fingerprint'));
      expect(BiometricType.face.displayName, equals('Face ID'));
      expect(BiometricType.voice.displayName, equals('Voice Recognition'));
      expect(BiometricType.iris.displayName, equals('Iris Recognition'));
      expect(BiometricType.heartRate.displayName, equals('Heart Rate'));
      expect(BiometricType.bloodOxygen.displayName, equals('Blood Oxygen'));
      expect(BiometricType.breathingPattern.displayName, equals('Breathing Pattern'));
    });

    test('should correctly identify health-based biometrics', () {
      expect(BiometricType.fingerprint.isHealthBased, isFalse);
      expect(BiometricType.face.isHealthBased, isFalse);
      expect(BiometricType.voice.isHealthBased, isFalse);
      expect(BiometricType.iris.isHealthBased, isFalse);
      expect(BiometricType.heartRate.isHealthBased, isTrue);
      expect(BiometricType.bloodOxygen.isHealthBased, isTrue);
      expect(BiometricType.breathingPattern.isHealthBased, isTrue);
    });

    test('should correctly identify camera-required biometrics', () {
      expect(BiometricType.fingerprint.requiresCamera, isFalse);
      expect(BiometricType.face.requiresCamera, isTrue);
      expect(BiometricType.voice.requiresCamera, isFalse);
      expect(BiometricType.iris.requiresCamera, isTrue);
      expect(BiometricType.heartRate.requiresCamera, isFalse);
      expect(BiometricType.bloodOxygen.requiresCamera, isFalse);
      expect(BiometricType.breathingPattern.requiresCamera, isFalse);
    });

    test('should have all enum values', () {
      expect(BiometricType.values.length, equals(7));
      expect(BiometricType.values, contains(BiometricType.fingerprint));
      expect(BiometricType.values, contains(BiometricType.face));
      expect(BiometricType.values, contains(BiometricType.voice));
      expect(BiometricType.values, contains(BiometricType.iris));
      expect(BiometricType.values, contains(BiometricType.heartRate));
      expect(BiometricType.values, contains(BiometricType.bloodOxygen));
      expect(BiometricType.values, contains(BiometricType.breathingPattern));
    });
  });
}
