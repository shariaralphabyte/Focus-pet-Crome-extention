import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_smart_taps/flutter_smart_taps.dart';
import 'package:flutter_smart_taps/flutter_smart_taps_platform_interface.dart';
import 'package:flutter_smart_taps/flutter_smart_taps_method_channel.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockFlutterSmartTapsPlatform
    with MockPlatformInterfaceMixin
    implements FlutterSmartTapsPlatform {

  @override
  Future<String?> getPlatformVersion() => Future.value('42');
}

void main() {
  final FlutterSmartTapsPlatform initialPlatform = FlutterSmartTapsPlatform.instance;

  test('$MethodChannelFlutterSmartTaps is the default instance', () {
    expect(initialPlatform, isInstanceOf<MethodChannelFlutterSmartTaps>());
  });

  test('getPlatformVersion', () async {
    FlutterSmartTaps flutterSmartTapsPlugin = FlutterSmartTaps();
    MockFlutterSmartTapsPlatform fakePlatform = MockFlutterSmartTapsPlatform();
    FlutterSmartTapsPlatform.instance = fakePlatform;

    expect(await flutterSmartTapsPlugin.getPlatformVersion(), '42');
  });
}
