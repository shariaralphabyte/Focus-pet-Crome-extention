import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

void main() {
  group('BehavioralMetrics', () {
    test('should create BehavioralMetrics with all components', () {
      final timestamp = DateTime.now();
      final typingPattern = TypingPattern(
        averageSpeed: 45.0,
        rhythm: [120, 150, 130],
        dwellTimes: [80, 90, 85],
        flightTimes: [40, 50, 45],
      );
      final touchGestures = TouchGestures(
        averagePressure: 0.7,
        touchDuration: 200,
        swipeVelocity: 1.2,
        tapAccuracy: 0.95,
      );
      final deviceHandling = DeviceHandling(
        accelerometerData: [0.1, -0.2, 9.8],
        gyroscopeData: [0.05, 0.02, -0.01],
        magnetometerData: [25.5, -15.2, 42.1],
        orientation: 'portrait',
      );
      final appUsage = AppUsage(
        sessionDuration: 1800,
        interactionFrequency: 25,
        navigationPatterns: ['home', 'banking', 'settings'],
        featureUsage: {'transfer': 5, 'balance': 10},
      );

      final metrics = BehavioralMetrics(
        confidence: 0.85,
        timestamp: timestamp,
        typingPattern: typingPattern,
        touchGestures: touchGestures,
        deviceHandling: deviceHandling,
        appUsage: appUsage,
      );

      expect(metrics.confidence, equals(0.85));
      expect(metrics.timestamp, equals(timestamp));
      expect(metrics.typingPattern, equals(typingPattern));
      expect(metrics.touchGestures, equals(touchGestures));
      expect(metrics.deviceHandling, equals(deviceHandling));
      expect(metrics.appUsage, equals(appUsage));
    });

    test('should serialize to JSON correctly', () {
      final timestamp = DateTime(2024, 12, 9, 15, 30, 0);
      final metrics = BehavioralMetrics(
        confidence: 0.85,
        timestamp: timestamp,
        typingPattern: TypingPattern(
          averageSpeed: 45.0,
          rhythm: [120, 150, 130],
          dwellTimes: [80, 90, 85],
          flightTimes: [40, 50, 45],
        ),
      );

      final json = metrics.toJson();

      expect(json['confidence'], equals(0.85));
      expect(json['timestamp'], equals(timestamp.toIso8601String()));
      expect(json['typingPattern'], isNotNull);
      expect(json['typingPattern']['averageSpeed'], equals(45.0));
    });

    test('should deserialize from JSON correctly', () {
      final timestamp = DateTime(2024, 12, 9, 15, 30, 0);
      final json = {
        'confidence': 0.85,
        'timestamp': timestamp.toIso8601String(),
        'typingPattern': {
          'averageSpeed': 45.0,
          'rhythm': [120.0, 150.0, 130.0],
          'dwellTimes': [80.0, 90.0, 85.0],
          'flightTimes': [40.0, 50.0, 45.0],
        },
      };

      final metrics = BehavioralMetrics.fromJson(json);

      expect(metrics.confidence, equals(0.85));
      expect(metrics.timestamp, equals(timestamp));
      expect(metrics.typingPattern?.averageSpeed, equals(45.0));
      expect(metrics.typingPattern?.rhythm, equals([120.0, 150.0, 130.0]));
    });
  });

  group('TypingPattern', () {
    test('should create TypingPattern with correct values', () {
      final pattern = TypingPattern(
        averageSpeed: 45.0,
        rhythm: [120, 150, 130],
        dwellTimes: [80, 90, 85],
        flightTimes: [40, 50, 45],
      );

      expect(pattern.averageSpeed, equals(45.0));
      expect(pattern.rhythm, equals([120, 150, 130]));
      expect(pattern.dwellTimes, equals([80, 90, 85]));
      expect(pattern.flightTimes, equals([40, 50, 45]));
    });

    test('should serialize and deserialize correctly', () {
      final pattern = TypingPattern(
        averageSpeed: 45.0,
        rhythm: [120, 150, 130],
        dwellTimes: [80, 90, 85],
        flightTimes: [40, 50, 45],
      );

      final json = pattern.toJson();
      final restored = TypingPattern.fromJson(json);

      expect(restored.averageSpeed, equals(pattern.averageSpeed));
      expect(restored.rhythm, equals(pattern.rhythm));
      expect(restored.dwellTimes, equals(pattern.dwellTimes));
      expect(restored.flightTimes, equals(pattern.flightTimes));
    });
  });

  group('TouchGestures', () {
    test('should create TouchGestures with correct values', () {
      final gestures = TouchGestures(
        averagePressure: 0.7,
        touchDuration: 200,
        swipeVelocity: 1.2,
        tapAccuracy: 0.95,
      );

      expect(gestures.averagePressure, equals(0.7));
      expect(gestures.touchDuration, equals(200));
      expect(gestures.swipeVelocity, equals(1.2));
      expect(gestures.tapAccuracy, equals(0.95));
    });

    test('should serialize and deserialize correctly', () {
      final gestures = TouchGestures(
        averagePressure: 0.7,
        touchDuration: 200,
        swipeVelocity: 1.2,
        tapAccuracy: 0.95,
      );

      final json = gestures.toJson();
      final restored = TouchGestures.fromJson(json);

      expect(restored.averagePressure, equals(gestures.averagePressure));
      expect(restored.touchDuration, equals(gestures.touchDuration));
      expect(restored.swipeVelocity, equals(gestures.swipeVelocity));
      expect(restored.tapAccuracy, equals(gestures.tapAccuracy));
    });
  });

  group('DeviceHandling', () {
    test('should create DeviceHandling with correct values', () {
      final handling = DeviceHandling(
        accelerometerData: [0.1, -0.2, 9.8],
        gyroscopeData: [0.05, 0.02, -0.01],
        magnetometerData: [25.5, -15.2, 42.1],
        orientation: 'portrait',
      );

      expect(handling.accelerometerData, equals([0.1, -0.2, 9.8]));
      expect(handling.gyroscopeData, equals([0.05, 0.02, -0.01]));
      expect(handling.magnetometerData, equals([25.5, -15.2, 42.1]));
      expect(handling.orientation, equals('portrait'));
    });

    test('should serialize and deserialize correctly', () {
      final handling = DeviceHandling(
        accelerometerData: [0.1, -0.2, 9.8],
        gyroscopeData: [0.05, 0.02, -0.01],
        magnetometerData: [25.5, -15.2, 42.1],
        orientation: 'portrait',
      );

      final json = handling.toJson();
      final restored = DeviceHandling.fromJson(json);

      expect(restored.accelerometerData, equals(handling.accelerometerData));
      expect(restored.gyroscopeData, equals(handling.gyroscopeData));
      expect(restored.magnetometerData, equals(handling.magnetometerData));
      expect(restored.orientation, equals(handling.orientation));
    });
  });

  group('AppUsage', () {
    test('should create AppUsage with correct values', () {
      final usage = AppUsage(
        sessionDuration: 1800,
        interactionFrequency: 25,
        navigationPatterns: ['home', 'banking', 'settings'],
        featureUsage: {'transfer': 5, 'balance': 10},
      );

      expect(usage.sessionDuration, equals(1800));
      expect(usage.interactionFrequency, equals(25));
      expect(usage.navigationPatterns, equals(['home', 'banking', 'settings']));
      expect(usage.featureUsage, equals({'transfer': 5, 'balance': 10}));
    });

    test('should serialize and deserialize correctly', () {
      final usage = AppUsage(
        sessionDuration: 1800,
        interactionFrequency: 25,
        navigationPatterns: ['home', 'banking', 'settings'],
        featureUsage: {'transfer': 5, 'balance': 10},
      );

      final json = usage.toJson();
      final restored = AppUsage.fromJson(json);

      expect(restored.sessionDuration, equals(usage.sessionDuration));
      expect(restored.interactionFrequency, equals(usage.interactionFrequency));
      expect(restored.navigationPatterns, equals(usage.navigationPatterns));
      expect(restored.featureUsage, equals(usage.featureUsage));
    });
  });
}
