# Flutter Smart Taps 🚀

[![pub package](https://img.shields.io/pub/v/flutter_smart_taps.svg)](https://pub.dev/packages/flutter_smart_taps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A next-generation gesture recognition plugin for Flutter that enables developers to integrate advanced tap detection features like back-panel taps, double/triple custom tap patterns, and contextual gesture-based actions. Inspired by Google's TapTap project, the plugin combines ML-based motion analysis with sensor fusion techniques to deliver accurate, low-latency, and battery-optimized gesture recognition.

## 🎯 Features

### Core Gesture Recognition
- **Back Tap Detection**: Single, double, and triple taps on device back panel
- **Custom Tap Patterns**: Define complex tap sequences (e.g., short-long-short, knock patterns)
- **Sensor Fusion**: Advanced accelerometer + gyroscope + proximity sensor integration
- **ML-Based Classification**: On-device gesture learning and adaptation

### Smart Detection
- **False Positive Prevention**: Pocket detection, vibration filtering, table detection
- **Adaptive Learning**: Improves accuracy based on user behavior
- **Battery Optimization**: Intelligent sensor sampling and power management
- **Cross-Platform Support**: Android (full features) + iOS (motion sensor fallbacks)

### Developer Experience
- **Easy Integration**: Simple API with just a few lines of code
- **Flexible Configuration**: Sensitivity, battery optimization, custom patterns
- **Real-time Analytics**: Gesture statistics and performance metrics
- **Accessibility Ready**: Pre-configured modes for different use cases

## 🚀 Quick Start

### Installation

Add this to your package's `pubspec.yaml` file:

```yaml
dependencies:
  flutter_smart_taps: ^1.0.0
```

### Basic Usage

```dart
import 'package:flutter_smart_taps/flutter_smart_taps.dart';

// Initialize and start listening for back taps
await SmartTaps.enableBackTap((TapEvent event) {
  if (event.type == TapType.backDoubleTap) {
    // Take screenshot, toggle flashlight, etc.
    print('Double back tap detected!');
  }
});
```

### Advanced Configuration

```dart
// Custom configuration
final config = GestureConfig(
  sensitivity: 0.8,
  enableBackTap: true,
  enableCustomPatterns: true,
  enabledTapTypes: {
    TapType.backSingleTap,
    TapType.backDoubleTap,
    TapType.knockPattern,
  },
);

await SmartTaps.initialize(config: config);
await SmartTaps.listen((TapEvent event) {
  print('Detected: ${event.type.description}');
  print('Confidence: ${event.confidence}');
  print('Timestamp: ${event.timestamp}');
});
```

## 📱 Platform Support

| Feature | Android | iOS |
|---------|---------|-----|
| Back Tap Detection | ✅ Full | ✅ Limited* |
| Custom Patterns | ✅ | ✅ |
| Sensor Fusion | ✅ | ✅ |
| ML Classification | ✅ | ⚠️ Basic |
| False Positive Prevention | ✅ | ✅ |

*iOS limitations due to hardware API restrictions

## 🎮 Use Cases

### Accessibility
```dart
await SmartTaps.enableAccessibilityMode((event) {
  switch (event.type) {
    case TapType.backSingleTap:
      // Voice assistant
      break;
    case TapType.backDoubleTap:
      // Screen reader
      break;
    case TapType.backTripleTap:
      // Emergency call
      break;
  }
});
```

### Gaming
```dart
await SmartTaps.enableGamingMode((event) {
  if (event.type == TapType.backDoubleTap) {
    // Jump action
    gameController.jump();
  }
});
```

### Productivity
```dart
await SmartTaps.initialize();
await SmartTaps.listen((event) {
  switch (event.type) {
    case TapType.backDoubleTap:
      // Take screenshot
      await takeScreenshot();
      break;
    case TapType.knockPattern:
      // Toggle flashlight
      await toggleFlashlight();
      break;
  }
});
```

## 🔧 Configuration Options

### GestureConfig

```dart
const GestureConfig({
  bool enableBackTap = true,
  bool enableCustomPatterns = false,
  bool enableAdaptiveLearning = true,
  bool enableFalsePositivePrevention = true,
  double sensitivity = 0.7, // 0.1 to 1.0
  double batteryOptimization = 0.5, // 0.0 to 1.0
  Set<TapType> enabledTapTypes = const {TapType.backDoubleTap},
  double minConfidenceThreshold = 0.6,
  int sensorSamplingRate = 50, // Hz
  bool enableVibrationFeedback = false,
  bool enableAudioFeedback = false,
})
```

### Predefined Configurations

```dart
// For accessibility applications
GestureConfig.accessibility

// For gaming applications  
GestureConfig.gaming

// For battery-conscious applications
GestureConfig.batteryOptimized
```

## 🎯 Custom Gesture Patterns

### Define Custom Patterns

```dart
const customPattern = GesturePattern(
  id: 'morse_sos',
  name: 'SOS Pattern',
  intervals: [100, 100, 100, 300, 300, 300, 100, 100, 100],
  tolerance: 75,
  minConfidence: 0.8,
);

await SmartTaps.addCustomPattern(customPattern);
```

### Predefined Patterns

```dart
// Simple knock-knock pattern
GesturePattern.knockKnock

// SOS morse code pattern
GesturePattern.sosPattern

// Short-long-short pattern
GesturePattern.shortLongShort
```

## 📊 Analytics & Statistics

```dart
// Get gesture recognition statistics
final stats = await SmartTaps.getStatistics();
print('Total taps: ${stats['totalTaps']}');
print('Back double taps: ${stats['backDoubleTap']}');
print('Average confidence: ${stats['averageConfidence']}');

// Export training data for analysis
final trainingData = await SmartTaps.exportTrainingData();
```

## 🛠️ Advanced Features

### Machine Learning Training

```dart
// Train custom gesture with sample data
final success = await SmartTaps.trainGesture(
  'custom_gesture_id',
  trainingDataSamples,
);
```

### Sensor Information

```dart
// Check device capabilities
final isSupported = await SmartTaps.isSupported();
final sensors = await SmartTaps.getAvailableSensors();
print('Available sensors: $sensors');
```

### Calibration

```dart
// Calibrate sensors for better accuracy
final calibrated = await SmartTaps.calibrateSensors();
```

## 🔒 Permissions

### Android
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BODY_SENSORS" />
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
```

### iOS
Add to `ios/Runner/Info.plist`:

```xml
<key>NSMotionUsageDescription</key>
<string>This app uses motion sensors for gesture recognition</string>
```

## 📖 API Reference

### SmartTaps Class

| Method | Description | Returns |
|--------|-------------|---------|
| `initialize(config)` | Initialize gesture detection | `Future<bool>` |
| `listen(callback)` | Start listening for gestures | `Future<void>` |
| `stop()` | Stop gesture detection | `Future<void>` |
| `updateConfig(config)` | Update configuration | `Future<void>` |
| `addCustomPattern(pattern)` | Add custom gesture pattern | `Future<void>` |
| `isSupported()` | Check device support | `Future<bool>` |
| `getStatistics()` | Get usage statistics | `Future<Map<String, dynamic>>` |

### TapEvent Class

```dart
class TapEvent {
  final TapType type;           // Type of gesture detected
  final DateTime timestamp;     // When the event occurred
  final double confidence;      // ML confidence score (0.0-1.0)
  final double intensity;       // Gesture strength (0.0-1.0)
  final int duration;          // Duration in milliseconds
  final Map<String, dynamic> sensorData;  // Raw sensor data
  final Map<String, dynamic> metadata;    // Additional context
}
```

### TapType Enum

```dart
enum TapType {
  backSingleTap,     // Single tap on back panel
  backDoubleTap,     // Double tap on back panel
  backTripleTap,     // Triple tap on back panel
  knockPattern,      // Custom knock pattern
  customSequence,    // Developer-defined sequence
  proximityGesture,  // Proximity-based gesture
  shakeGesture,      // Shake gesture
  flipGesture,       // Device flip gesture
}
```

## 🧪 Example App

Run the example app to see all features in action:

```bash
cd example
flutter run
```

The example demonstrates:
- Real-time gesture detection
- Configuration options
- Statistics dashboard
- Custom pattern creation
- Different sensitivity modes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/flutter/flutter_smart_taps.git
cd flutter_smart_taps
flutter packages get
cd example && flutter packages get
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Google's TapTap research project
- Built with Flutter's plugin architecture
- Uses advanced sensor fusion algorithms
- Implements ML-based gesture classification

## 📞 Support

- 📧 Email: support@smarttaps.dev
- 🐛 Issues: [GitHub Issues](https://github.com/flutter/flutter_smart_taps/issues)
- 📖 Documentation: [API Docs](https://pub.dev/documentation/flutter_smart_taps)
- 💬 Discussions: [GitHub Discussions](https://github.com/flutter/flutter_smart_taps/discussions)

---

**Made with ❤️ for the Flutter community**

