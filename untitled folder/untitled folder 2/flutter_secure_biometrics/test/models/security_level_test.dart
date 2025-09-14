import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

void main() {
  group('SecurityLevel', () {
    test('should have correct display names', () {
      expect(SecurityLevel.low.displayName, equals('Low Security'));
      expect(SecurityLevel.medium.displayName, equals('Medium Security'));
      expect(SecurityLevel.high.displayName, equals('High Security'));
      expect(SecurityLevel.maximum.displayName, equals('Maximum Security'));
    });

    test('should have correct required factors', () {
      expect(SecurityLevel.low.requiredFactors, equals(1));
      expect(SecurityLevel.medium.requiredFactors, equals(1));
      expect(SecurityLevel.high.requiredFactors, equals(2));
      expect(SecurityLevel.maximum.requiredFactors, equals(2));
    });

    test('should have correct continuous auth requirements', () {
      expect(SecurityLevel.low.requiresContinuousAuth, isFalse);
      expect(SecurityLevel.medium.requiresContinuousAuth, isFalse);
      expect(SecurityLevel.high.requiresContinuousAuth, isTrue);
      expect(SecurityLevel.maximum.requiresContinuousAuth, isTrue);
    });

    test('should have correct minimum trust scores', () {
      expect(SecurityLevel.low.minimumTrustScore, equals(0.5));
      expect(SecurityLevel.medium.minimumTrustScore, equals(0.65));
      expect(SecurityLevel.high.minimumTrustScore, equals(0.75));
      expect(SecurityLevel.maximum.minimumTrustScore, equals(0.85));
    });

    test('should have all enum values', () {
      expect(SecurityLevel.values.length, equals(4));
      expect(SecurityLevel.values, contains(SecurityLevel.low));
      expect(SecurityLevel.values, contains(SecurityLevel.medium));
      expect(SecurityLevel.values, contains(SecurityLevel.high));
      expect(SecurityLevel.values, contains(SecurityLevel.maximum));
    });
  });
}
