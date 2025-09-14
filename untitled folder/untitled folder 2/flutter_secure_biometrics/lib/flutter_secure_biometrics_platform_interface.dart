import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'flutter_secure_biometrics_method_channel.dart';

abstract class FlutterSecureBiometricsPlatform extends PlatformInterface {
  /// Constructs a FlutterSecureBiometricsPlatform.
  FlutterSecureBiometricsPlatform() : super(token: _token);

  static final Object _token = Object();

  static FlutterSecureBiometricsPlatform _instance = MethodChannelFlutterSecureBiometrics();

  /// The default instance of [FlutterSecureBiometricsPlatform] to use.
  ///
  /// Defaults to [MethodChannelFlutterSecureBiometrics].
  static FlutterSecureBiometricsPlatform get instance => _instance;

  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [FlutterSecureBiometricsPlatform] when
  /// they register themselves.
  static set instance(FlutterSecureBiometricsPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<String?> getPlatformVersion() {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }
}
