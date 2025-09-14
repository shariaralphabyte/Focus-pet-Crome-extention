import 'package:flutter/services.dart';

class NativeDeviceService {
  static const MethodChannel _channel = MethodChannel('com.example.flutter_device_info_pro/native');

  static Future<Map<String, dynamic>?> getCpuInfo() async {
    try {
      final result = await _channel.invokeMethod('getCpuInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get CPU info: '${e.message}'.");
      return null;
    }
  }

  static Future<Map<String, dynamic>?> getMemoryInfo() async {
    try {
      final result = await _channel.invokeMethod('getMemoryInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get memory info: '${e.message}'.");
      return null;
    }
  }

  static Future<Map<String, dynamic>?> getStorageInfo() async {
    try {
      final result = await _channel.invokeMethod('getStorageInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get storage info: '${e.message}'.");
      return null;
    }
  }

  static Future<Map<String, dynamic>?> getThermalInfo() async {
    try {
      final result = await _channel.invokeMethod('getThermalInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get thermal info: '${e.message}'.");
      return null;
    }
  }

  static Future<List<Map<String, dynamic>>> getSensorList() async {
    try {
      final result = await _channel.invokeMethod('getSensorList');
      if (result is List) {
        return result.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } on PlatformException catch (e) {
      print("Failed to get sensor list: '${e.message}'.");
      return [];
    }
  }

  static Future<Map<String, dynamic>?> getSystemInfo() async {
    try {
      final result = await _channel.invokeMethod('getSystemInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get system info: '${e.message}'.");
      return null;
    }
  }

  static Future<Map<String, dynamic>> getCpuUsage() async {
    try {
      final result = await _channel.invokeMethod('getCpuUsage');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get CPU usage: '${e.message}'.");
      return {'usage': 0.0, 'error': e.message};
    }
  }

  static Future<Map<String, dynamic>> getRealTimeMemoryInfo() async {
    try {
      final result = await _channel.invokeMethod('getRealTimeMemoryInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get real-time memory info: '${e.message}'.");
      return {'error': e.message};
    }
  }

  static Future<Map<String, dynamic>> getCpuCoreInfo() async {
    try {
      final result = await _channel.invokeMethod('getCpuCoreInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get CPU core info: '${e.message}'.");
      return {'error': e.message};
    }
  }

  static Future<int> getInstalledAppsCount() async {
    try {
      final result = await _channel.invokeMethod('getInstalledAppsCount');
      return result as int? ?? 0;
    } on PlatformException catch (e) {
      print("Failed to get installed apps count: '${e.message}'.");
      return 0;
    }
  }

  static Future<Map<String, dynamic>> getBatteryInfo() async {
    try {
      final result = await _channel.invokeMethod('getBatteryInfo');
      return Map<String, dynamic>.from(result);
    } on PlatformException catch (e) {
      print("Failed to get battery info: '${e.message}'.");
      return {'level': 0, 'isCharging': false, 'error': e.message};
    }
  }
}
