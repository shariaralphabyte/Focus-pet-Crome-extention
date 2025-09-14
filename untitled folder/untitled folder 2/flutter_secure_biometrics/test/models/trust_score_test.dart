import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

void main() {
  group('TrustScore', () {
    test('should create TrustScore with correct values', () {
      final timestamp = DateTime.now();
      final factors = {'biometric': 0.9, 'behavioral': 0.8};
      
      final trustScore = TrustScore(
        value: 0.85,
        factors: factors,
        timestamp: timestamp,
      );

      expect(trustScore.value, equals(0.85));
      expect(trustScore.factors, equals(factors));
      expect(trustScore.timestamp, equals(timestamp));
    });

    test('should have correct trust levels', () {
      expect(TrustScore(value: 0.95, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Excellent'));
      expect(TrustScore(value: 0.85, factors: {}, timestamp: DateTime.now()).trustLevel, equals('High'));
      expect(TrustScore(value: 0.75, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Good'));
      expect(TrustScore(value: 0.65, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Medium'));
      expect(TrustScore(value: 0.45, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Low'));
      expect(TrustScore(value: 0.25, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Critical'));
    });

    test('should have correct security status', () {
      expect(TrustScore(value: 0.95, factors: {}, timestamp: DateTime.now()).isSecure, isTrue);
      expect(TrustScore(value: 0.85, factors: {}, timestamp: DateTime.now()).isSecure, isTrue);
      expect(TrustScore(value: 0.75, factors: {}, timestamp: DateTime.now()).isSecure, isTrue);
      expect(TrustScore(value: 0.65, factors: {}, timestamp: DateTime.now()).isSecure, isTrue);
      expect(TrustScore(value: 0.55, factors: {}, timestamp: DateTime.now()).isSecure, isFalse);
      expect(TrustScore(value: 0.25, factors: {}, timestamp: DateTime.now()).isSecure, isFalse);
    });

    test('should serialize to JSON correctly', () {
      final timestamp = DateTime(2024, 12, 9, 15, 30, 0);
      final factors = {'biometric': 0.9, 'behavioral': 0.8};
      
      final trustScore = TrustScore(
        value: 0.85,
        factors: factors,
        timestamp: timestamp,
      );

      final json = trustScore.toJson();

      expect(json['value'], equals(0.85));
      expect(json['factors'], equals(factors));
      expect(json['timestamp'], equals(timestamp.toIso8601String()));
      expect(json['trustLevel'], equals('High'));
      expect(json['isSecure'], isTrue);
    });

    test('should deserialize from JSON correctly', () {
      final timestamp = DateTime(2024, 12, 9, 15, 30, 0);
      final json = {
        'value': 0.85,
        'factors': {'biometric': 0.9, 'behavioral': 0.8},
        'timestamp': timestamp.toIso8601String(),
      };

      final trustScore = TrustScore.fromJson(json);

      expect(trustScore.value, equals(0.85));
      expect(trustScore.factors['biometric'], equals(0.9));
      expect(trustScore.factors['behavioral'], equals(0.8));
      expect(trustScore.timestamp, equals(timestamp));
      expect(trustScore.trustLevel, equals('High'));
      expect(trustScore.isSecure, isTrue);
    });

    test('should create perfect trust score', () {
      final perfect = TrustScore.perfect;

      expect(perfect.value, equals(1.0));
      expect(perfect.trustLevel, equals('Excellent'));
      expect(perfect.isSecure, isTrue);
      expect(perfect.factors['biometric'], equals(1.0));
      expect(perfect.factors['behavioral'], equals(1.0));
      expect(perfect.factors['environmental'], equals(1.0));
    });

    test('should create zero trust score', () {
      final zero = TrustScore.zero;

      expect(zero.value, equals(0.0));
      expect(zero.trustLevel, equals('Critical'));
      expect(zero.isSecure, isFalse);
      expect(zero.factors['biometric'], equals(0.0));
      expect(zero.factors['behavioral'], equals(0.0));
      expect(zero.factors['environmental'], equals(0.0));
    });

    test('should handle edge cases for trust levels', () {
      expect(TrustScore(value: 1.0, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Excellent'));
      expect(TrustScore(value: 0.9, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Excellent'));
      expect(TrustScore(value: 0.89, factors: {}, timestamp: DateTime.now()).trustLevel, equals('High'));
      expect(TrustScore(value: 0.0, factors: {}, timestamp: DateTime.now()).trustLevel, equals('Critical'));
    });
  });
}
