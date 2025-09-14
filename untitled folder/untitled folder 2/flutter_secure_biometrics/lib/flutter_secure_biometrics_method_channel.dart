import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'flutter_secure_biometrics_platform_interface.dart';

/// An implementation of [FlutterSecureBiometricsPlatform] that uses method channels.
class MethodChannelFlutterSecureBiometrics extends FlutterSecureBiometricsPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('flutter_secure_biometrics');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>('getPlatformVersion');
    return version;
  }
}
