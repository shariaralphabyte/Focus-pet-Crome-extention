import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'flutter_smart_taps_method_channel.dart';

abstract class FlutterSmartTapsPlatform extends PlatformInterface {
  /// Constructs a FlutterSmartTapsPlatform.
  FlutterSmartTapsPlatform() : super(token: _token);

  static final Object _token = Object();

  static FlutterSmartTapsPlatform _instance = MethodChannelFlutterSmartTaps();

  /// The default instance of [FlutterSmartTapsPlatform] to use.
  ///
  /// Defaults to [MethodChannelFlutterSmartTaps].
  static FlutterSmartTapsPlatform get instance => _instance;

  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [FlutterSmartTapsPlatform] when
  /// they register themselves.
  static set instance(FlutterSmartTapsPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<String?> getPlatformVersion() {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }
}
