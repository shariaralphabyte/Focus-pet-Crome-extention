import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';
import 'package:flutter_secure_biometrics/src/flutter_secure_biometrics_platform_interface.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics_method_channel.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'flutter_secure_biometrics_test.mocks.dart';

@GenerateMocks([FlutterSecureBiometricsPlatform])
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('FlutterSecureBiometrics', () {
    late MockFlutterSecureBiometricsPlatform mockPlatform;
    late FlutterSecureBiometrics plugin;

    setUp(() {
      mockPlatform = MockFlutterSecureBiometricsPlatform();
      FlutterSecureBiometricsPlatform.instance = mockPlatform;
      plugin = FlutterSecureBiometrics.instance;
    });

    group('Biometric Availability', () {
      test('isAvailable returns true when biometrics are available', () async {
        when(mockPlatform.isAvailable()).thenAnswer((_) async => true);

        final result = await plugin.isAvailable();

        expect(result, isTrue);
        verify(mockPlatform.isAvailable()).called(1);
      });

      test('isAvailable returns false when biometrics are not available', () async {
        when(mockPlatform.isAvailable()).thenAnswer((_) async => false);

        final result = await plugin.isAvailable();

        expect(result, isFalse);
        verify(mockPlatform.isAvailable()).called(1);
      });

      test('getAvailableBiometrics returns list of available types', () async {
        final expectedTypes = [BiometricType.fingerprint, BiometricType.face];
        when(mockPlatform.getAvailableBiometrics()).thenAnswer((_) async => expectedTypes);

        final result = await plugin.getAvailableBiometrics();

        expect(result, equals(expectedTypes));
        verify(mockPlatform.getAvailableBiometrics()).called(1);
      });
    });

    group('Biometric Registration', () {
      test('registerAppBiometric returns true on successful registration', () async {
        when(mockPlatform.registerAppBiometric(
          type: anyNamed('type'),
          appId: anyNamed('appId'),
          metadata: anyNamed('metadata'),
        )).thenAnswer((_) async => true);

        final result = await plugin.registerAppBiometric(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
        );

        expect(result, isTrue);
        verify(mockPlatform.registerAppBiometric(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
          metadata: {},
        )).called(1);
      });

      test('isAppBiometricRegistered returns registration status', () async {
        when(mockPlatform.isAppBiometricRegistered(
          type: anyNamed('type'),
          appId: anyNamed('appId'),
        )).thenAnswer((_) async => true);

        final result = await plugin.isAppBiometricRegistered(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
        );

        expect(result, isTrue);
        verify(mockPlatform.isAppBiometricRegistered(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
        )).called(1);
      });

      test('clearAppBiometric returns true on successful clearing', () async {
        when(mockPlatform.clearAppBiometric(
          type: anyNamed('type'),
          appId: anyNamed('appId'),
        )).thenAnswer((_) async => true);

        final result = await plugin.clearAppBiometric(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
        );

        expect(result, isTrue);
        verify(mockPlatform.clearAppBiometric(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
        )).called(1);
      });
    });

    group('Authentication', () {
      test('authenticate returns successful result', () async {
        final expectedResult = AuthenticationResult.success(
          biometricType: BiometricType.fingerprint,
          trustScore: 0.95,
          timestamp: DateTime.now(),
        );

        when(mockPlatform.authenticate(
          config: anyNamed('config'),
          appId: anyNamed('appId'),
          reason: anyNamed('reason'),
        )).thenAnswer((_) async => expectedResult);

        final result = await plugin.authenticate(
          config: BiometricConfig.banking,
          appId: 'com.test.app',
          reason: 'Test authentication',
        );

        expect(result.isAuthenticated, isTrue);
        expect(result.biometricType, equals(BiometricType.fingerprint));
        expect(result.trustScore, equals(0.95));
        verify(mockPlatform.authenticate(
          config: BiometricConfig.banking,
          appId: 'com.test.app',
          reason: 'Test authentication',
        )).called(1);
      });

      test('authenticate returns failure result', () async {
        final expectedResult = AuthenticationResult.failure(
          error: AuthenticationError.userCancel,
          message: 'User cancelled authentication',
          timestamp: DateTime.now(),
        );

        when(mockPlatform.authenticate(
          config: anyNamed('config'),
          appId: anyNamed('appId'),
          reason: anyNamed('reason'),
        )).thenAnswer((_) async => expectedResult);

        final result = await plugin.authenticate(
          config: BiometricConfig.banking,
          appId: 'com.test.app',
          reason: 'Test authentication',
        );

        expect(result.isAuthenticated, isFalse);
        expect(result.error, equals(AuthenticationError.userCancel));
        verify(mockPlatform.authenticate(
          config: BiometricConfig.banking,
          appId: 'com.test.app',
          reason: 'Test authentication',
        )).called(1);
      });
    });

    group('Continuous Authentication', () {
      test('startContinuousAuth calls platform method', () async {
        when(mockPlatform.startContinuousAuth(
          config: anyNamed('config'),
          appId: anyNamed('appId'),
        )).thenAnswer((_) async => {});

        await plugin.startContinuousAuth(
          config: BiometricConfig.enterprise,
          appId: 'com.test.app',
        );

        verify(mockPlatform.startContinuousAuth(
          config: BiometricConfig.enterprise,
          appId: 'com.test.app',
        )).called(1);
      });

      test('stopContinuousAuth calls platform method', () async {
        when(mockPlatform.stopContinuousAuth()).thenAnswer((_) async => {});

        await plugin.stopContinuousAuth();

        verify(mockPlatform.stopContinuousAuth()).called(1);
      });

      test('getCurrentTrustScore returns trust score', () async {
        final expectedScore = TrustScore(
          value: 0.85,
          factors: {'biometric': 0.9, 'behavioral': 0.8},
          timestamp: DateTime.now(),
        );

        when(mockPlatform.getCurrentTrustScore()).thenAnswer((_) async => expectedScore);

        final result = await plugin.getCurrentTrustScore();

        expect(result.value, equals(0.85));
        expect(result.trustLevel, equals('High'));
        verify(mockPlatform.getCurrentTrustScore()).called(1);
      });
    });

    group('Security Features', () {
      test('performLivenessDetection returns detection result', () async {
        when(mockPlatform.performLivenessDetection(
          type: anyNamed('type'),
          appId: anyNamed('appId'),
        )).thenAnswer((_) async => true);

        final result = await plugin.performLivenessDetection(
          type: BiometricType.face,
          appId: 'com.test.app',
        );

        expect(result, isTrue);
        verify(mockPlatform.performLivenessDetection(
          type: BiometricType.face,
          appId: 'com.test.app',
        )).called(1);
      });

      test('detectSpoofing returns spoofing detection result', () async {
        when(mockPlatform.detectSpoofing(
          type: anyNamed('type'),
          appId: anyNamed('appId'),
        )).thenAnswer((_) async => false);

        final result = await plugin.detectSpoofing(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
        );

        expect(result, isFalse);
        verify(mockPlatform.detectSpoofing(
          type: BiometricType.fingerprint,
          appId: 'com.test.app',
        )).called(1);
      });

      test('getHealthBiometrics returns health data', () async {
        final expectedData = {
          'heartRate': 72,
          'bloodOxygen': 98,
          'breathingRate': 16,
          'timestamp': DateTime.now().toIso8601String(),
        };

        when(mockPlatform.getHealthBiometrics()).thenAnswer((_) async => expectedData);

        final result = await plugin.getHealthBiometrics();

        expect(result['heartRate'], equals(72));
        expect(result['bloodOxygen'], equals(98));
        verify(mockPlatform.getHealthBiometrics()).called(1);
      });

      test('lockApplication calls platform method', () async {
        when(mockPlatform.lockApplication()).thenAnswer((_) async => {});

        await plugin.lockApplication();

        verify(mockPlatform.lockApplication()).called(1);
      });
    });

    group('Behavioral Metrics', () {
      test('updateBehavioralMetrics calls platform method', () async {
        final metrics = BehavioralMetrics(
          confidence: 0.85,
          timestamp: DateTime.now(),
          typingPattern: TypingPattern(
            averageSpeed: 45.0,
            rhythm: [120, 150, 130],
            dwellTimes: [80, 90, 85],
            flightTimes: [40, 50, 45],
          ),
        );

        when(mockPlatform.updateBehavioralMetrics(
          metrics: anyNamed('metrics'),
          appId: anyNamed('appId'),
        )).thenAnswer((_) async => {});

        await plugin.updateBehavioralMetrics(
          metrics: metrics,
          appId: 'com.test.app',
        );

        verify(mockPlatform.updateBehavioralMetrics(
          metrics: metrics,
          appId: 'com.test.app',
        )).called(1);
      });
    });

    group('Data Management', () {
      test('exportTrainingData returns training data', () async {
        const expectedData = '{"version":"1.0","data":"encrypted_training_data"}';

        when(mockPlatform.exportTrainingData()).thenAnswer((_) async => expectedData);

        final result = await plugin.exportTrainingData();

        expect(result, equals(expectedData));
        verify(mockPlatform.exportTrainingData()).called(1);
      });

      test('importTrainingData returns success', () async {
        const trainingData = '{"version":"1.0","data":"encrypted_training_data"}';

        when(mockPlatform.importTrainingData(anyString)).thenAnswer((_) async => true);

        final result = await plugin.importTrainingData(trainingData);

        expect(result, isTrue);
        verify(mockPlatform.importTrainingData(trainingData)).called(1);
      });
    });

    group('Error Handling', () {
      test('throws BiometricNotAvailableException when biometrics unavailable', () async {
        when(mockPlatform.authenticate(
          config: anyNamed('config'),
          appId: anyNamed('appId'),
          reason: anyNamed('reason'),
        )).thenThrow(BiometricNotAvailableException('Biometrics not available'));

        expect(
          () => plugin.authenticate(
            config: BiometricConfig.banking,
            appId: 'com.test.app',
            reason: 'Test authentication',
          ),
          throwsA(isA<BiometricNotAvailableException>()),
        );
      });

      test('throws AuthenticationFailedException on auth failure', () async {
        when(mockPlatform.authenticate(
          config: anyNamed('config'),
          appId: anyNamed('appId'),
          reason: anyNamed('reason'),
        )).thenThrow(AuthenticationFailedException('Authentication failed'));

        expect(
          () => plugin.authenticate(
            config: BiometricConfig.banking,
            appId: 'com.test.app',
            reason: 'Test authentication',
          ),
          throwsA(isA<AuthenticationFailedException>()),
        );
      });
    });
  });
}
