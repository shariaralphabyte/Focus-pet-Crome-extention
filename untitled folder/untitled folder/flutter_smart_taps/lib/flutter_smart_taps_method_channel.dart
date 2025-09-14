import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'flutter_smart_taps_platform_interface.dart';

/// An implementation of [FlutterSmartTapsPlatform] that uses method channels.
class MethodChannelFlutterSmartTaps extends FlutterSmartTapsPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('flutter_smart_taps');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>('getPlatformVersion');
    return version;
  }
}
