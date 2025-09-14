# Flutter Secure Biometrics

Advanced biometric authentication plugin with app-specific isolation, multi-modal authentication, and continuous security monitoring for Flutter applications.

## Features

🔐 **App-Specific Biometric Isolation**
- Unique cryptographic keys per app and biometric type
- Hardware-backed security (Android Keystore, iOS Secure Enclave)
- Complete data separation between applications

🎯 **Multi-Modal Authentication**
- Fingerprint, Face, Voice, Iris recognition
- Health biometrics (Heart Rate, Blood Oxygen, Breathing Pattern)
- Configurable security levels and fallback methods

🧠 **Behavioral Biometrics**
- Continuous authentication with trust scoring
- Typing patterns, touch gestures, device handling analysis
- Real-time anomaly detection and adaptive learning

🛡️ **Advanced Security**
- Liveness detection to prevent spoofing attacks
- Anti-spoofing measures with sensor fusion
- Emergency app lock and security monitoring

🏥 **Industry-Specific Configurations**
- Banking: Maximum security with multi-factor auth
- Healthcare: HIPAA-compliant with health biometrics
- Enterprise: Behavioral monitoring with audit trails
- Government: Highest security standards

## Installation

Add this to your package's `pubspec.yaml` file:

```yaml
dependencies:
  flutter_secure_biometrics: ^1.0.0
```

Then run:

```bash
flutter pub get
```

## Platform Setup

### Android

Add the following permissions to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.BODY_SENSORS" />
```

### iOS

Add the following to your `ios/Runner/Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for secure authentication</string>
<key>NSCameraUsageDescription</key>
<string>This app uses camera for liveness detection</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app uses microphone for voice authentication</string>
<key>NSMotionUsageDescription</key>
<string>This app uses motion sensors for behavioral analysis</string>
```

## Quick Start

```dart
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  
  @override
  void initState() {
    super.initState();
    _initializeBiometrics();
  }
  
  Future<void> _initializeBiometrics() async {
    // Check if biometrics are available
    final isAvailable = await _biometrics.isAvailable();
    if (!isAvailable) return;
    
    // Register app-specific biometric
    await _biometrics.registerAppBiometric(
      type: BiometricType.fingerprint,
      appId: 'com.example.myapp',
    );
    
    // Authenticate user
    final result = await _biometrics.authenticate(
      config: BiometricConfig.banking,
      appId: 'com.example.myapp',
      reason: 'Authenticate to access your account',
    );
    
    if (result.isAuthenticated) {
      // Start continuous authentication
      await _biometrics.startContinuousAuth(
        config: BiometricConfig.banking,
        appId: 'com.example.myapp',
      );
    }
  }
}
```

## API Reference

### Core Methods

#### `isAvailable()`
Check if biometric authentication is available on the device.

```dart
final bool isAvailable = await FlutterSecureBiometrics.instance.isAvailable();
```

#### `getAvailableBiometrics()`
Get list of available biometric types on the device.

```dart
final List<BiometricType> types = await FlutterSecureBiometrics.instance.getAvailableBiometrics();
```

#### `registerAppBiometric()`
Register app-specific biometric data with hardware-backed isolation.

```dart
final bool success = await FlutterSecureBiometrics.instance.registerAppBiometric(
  type: BiometricType.fingerprint,
  appId: 'com.example.myapp',
  metadata: {'registrationTime': DateTime.now().toIso8601String()},
);
```

#### `authenticate()`
Perform biometric authentication with comprehensive security checks.

```dart
final AuthenticationResult result = await FlutterSecureBiometrics.instance.authenticate(
  config: BiometricConfig.banking,
  appId: 'com.example.myapp',
  reason: 'Authenticate to access secure features',
);

if (result.isAuthenticated) {
  print('Trust Score: ${result.trustScore}');
  print('Biometric Type: ${result.biometricType}');
}
```

### Continuous Authentication

#### `startContinuousAuth()`
Start continuous behavioral monitoring and trust scoring.

```dart
await FlutterSecureBiometrics.instance.startContinuousAuth(
  config: BiometricConfig.enterprise,
  appId: 'com.example.myapp',
);

// Listen to trust score changes
FlutterSecureBiometrics.instance.trustScoreStream.listen((trustScore) {
  if (trustScore.value < 0.6) {
    // Handle low trust score
    await FlutterSecureBiometrics.instance.lockApplication();
  }
});
```

#### `updateBehavioralMetrics()`
Update behavioral biometric data for continuous authentication.

```dart
final metrics = BehavioralMetrics(
  confidence: 0.85,
  timestamp: DateTime.now(),
  typingPattern: TypingPattern(averageSpeed: 45.0, rhythm: [120, 150, 130]),
  touchGestures: TouchGestures(averagePressure: 0.7, touchDuration: 200),
);

await FlutterSecureBiometrics.instance.updateBehavioralMetrics(
  metrics: metrics,
  appId: 'com.example.myapp',
);
```

### Security Features

#### `performLivenessDetection()`
Perform liveness detection to prevent spoofing attacks.

```dart
final bool isLive = await FlutterSecureBiometrics.instance.performLivenessDetection(
  type: BiometricType.face,
  appId: 'com.example.myapp',
);
```

#### `detectSpoofing()`
Detect spoofing attempts using advanced algorithms.

```dart
final bool isSpoofed = await FlutterSecureBiometrics.instance.detectSpoofing(
  type: BiometricType.fingerprint,
  appId: 'com.example.myapp',
);
```

#### `getHealthBiometrics()`
Get health-based biometric data for healthcare applications.

```dart
final Map<String, dynamic> healthData = await FlutterSecureBiometrics.instance.getHealthBiometrics();
print('Heart Rate: ${healthData['heartRate']} BPM');
print('Blood Oxygen: ${healthData['bloodOxygen']}%');
```

## Configuration

### Security Levels

The plugin provides predefined security configurations for different use cases:

```dart
// Banking: Maximum security
BiometricConfig.banking
// - Requires 2+ biometric factors
// - Continuous authentication required
// - Minimum trust score: 80%

// Healthcare: HIPAA-compliant
BiometricConfig.healthcare  
// - Health biometrics enabled
// - High security level
// - Minimum trust score: 70%

// Enterprise: Behavioral monitoring
BiometricConfig.enterprise
// - Behavioral biometrics enabled
// - Audit logging
// - Minimum trust score: 65%

// Government: Highest security
BiometricConfig.government
// - All biometric types required
// - Maximum security measures
// - Minimum trust score: 90%
```

### Custom Configuration

```dart
final config = BiometricConfig(
  securityLevel: SecurityLevel.high,
  enabledBiometrics: [
    BiometricType.fingerprint,
    BiometricType.face,
    BiometricType.voice,
  ],
  authenticationTimeout: Duration(seconds: 30),
  continuousAuthRequired: true,
  fallbackMethods: [FallbackMethod.pin, FallbackMethod.password],
  minimumTrustScore: 0.75,
  livenessDetectionRequired: true,
  spoofingDetectionEnabled: true,
);
```

## Example App

The plugin includes a comprehensive example app demonstrating all features:

- **Banking Demo**: Secure banking with maximum security
- **Healthcare Demo**: HIPAA-compliant health biometrics
- **Enterprise Demo**: Behavioral monitoring with audit trails
- **Settings**: Configuration and testing tools

Run the example:

```bash
cd example
flutter run
```

## Architecture

### App-Specific Isolation

Each app gets unique cryptographic keys stored in:
- **Android**: Hardware-backed Android Keystore
- **iOS**: Secure Enclave with Keychain Services

### Security Flow

1. **Registration**: Generate app-specific keys
2. **Authentication**: Multi-factor biometric verification
3. **Continuous Monitoring**: Real-time trust scoring
4. **Anomaly Detection**: Behavioral analysis
5. **Emergency Response**: Automatic app lock

### Trust Scoring

The trust score (0.0 - 1.0) is calculated from:
- Biometric confidence levels
- Behavioral pattern matching
- Environmental factors
- Device security status
- Historical usage patterns

## Security Considerations

- All biometric data is processed locally
- No cloud synchronization or external transmission
- Hardware-backed key storage when available
- Secure deletion of sensitive data
- Compliance with GDPR, HIPAA, and other regulations

## Platform Support

| Feature | Android | iOS |
|---------|---------|-----|
| Fingerprint | ✅ | ✅ |
| Face Recognition | ✅ | ✅ |
| Voice Recognition | ✅ | ✅ |
| Iris Recognition | ✅ | ✅ |
| Health Biometrics | ✅ | ✅ |
| Behavioral Analysis | ✅ | ✅ |
| Liveness Detection | ✅ | ✅ |
| Spoofing Detection | ✅ | ✅ |
| Hardware Security | Keystore | Secure Enclave |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/flutter_secure_biometrics/issues)
- 📖 Documentation: [API Documentation](https://pub.dev/documentation/flutter_secure_biometrics)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## Getting Started

This project is a starting point for a Flutter
[plug-in package](https://flutter.dev/to/develop-plugins),
a specialized package that includes platform-specific implementation code for
Android and/or iOS.

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

