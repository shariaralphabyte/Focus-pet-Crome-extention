import 'biometric_type.dart';
import 'security_level.dart';

/// Configuration for biometric authentication
class BiometricConfig {
  final SecurityLevel securityLevel;
  final List<BiometricType> enabledBiometrics;
  final int authenticationTimeout; // minutes
  final bool continuousMonitoring;
  final double behavioralSensitivity; // 1-10 scale
  final List<String> fallbackMethods;
  final bool livenessDetection;
  final bool antiSpoofing;
  final Map<String, dynamic> customSettings;

  const BiometricConfig({
    this.securityLevel = SecurityLevel.medium,
    this.enabledBiometrics = const [BiometricType.fingerprint],
    this.authenticationTimeout = 15,
    this.continuousMonitoring = false,
    this.behavioralSensitivity = 5.0,
    this.fallbackMethods = const ['pin'],
    this.livenessDetection = true,
    this.antiSpoofing = true,
    this.customSettings = const {},
  });

  /// Predefined configuration for banking apps
  static const BiometricConfig banking = BiometricConfig(
    securityLevel: SecurityLevel.maximum,
    enabledBiometrics: [
      BiometricType.fingerprint,
      BiometricType.face,
      BiometricType.heartRate,
    ],
    authenticationTimeout: 5,
    continuousMonitoring: true,
    behavioralSensitivity: 8.0,
    fallbackMethods: ['pin', 'password'],
    livenessDetection: true,
    antiSpoofing: true,
  );

  /// Predefined configuration for healthcare apps
  static const BiometricConfig healthcare = BiometricConfig(
    securityLevel: SecurityLevel.high,
    enabledBiometrics: [
      BiometricType.fingerprint,
      BiometricType.face,
      BiometricType.voice,
    ],
    authenticationTimeout: 10,
    continuousMonitoring: true,
    behavioralSensitivity: 7.0,
    fallbackMethods: ['pin', 'password'],
    livenessDetection: true,
    antiSpoofing: true,
  );

  /// Predefined configuration for enterprise apps
  static const BiometricConfig enterprise = BiometricConfig(
    securityLevel: SecurityLevel.high,
    enabledBiometrics: [
      BiometricType.fingerprint,
      BiometricType.face,
    ],
    authenticationTimeout: 30,
    continuousMonitoring: true,
    behavioralSensitivity: 6.0,
    fallbackMethods: ['pin', 'pattern'],
    livenessDetection: true,
    antiSpoofing: true,
  );

  /// Basic configuration for consumer apps
  static const BiometricConfig consumer = BiometricConfig(
    securityLevel: SecurityLevel.low,
    enabledBiometrics: [BiometricType.fingerprint],
    authenticationTimeout: 60,
    continuousMonitoring: false,
    behavioralSensitivity: 3.0,
    fallbackMethods: ['pin'],
    livenessDetection: false,
    antiSpoofing: false,
  );

  /// Copy with modifications
  BiometricConfig copyWith({
    SecurityLevel? securityLevel,
    List<BiometricType>? enabledBiometrics,
    int? authenticationTimeout,
    bool? continuousMonitoring,
    double? behavioralSensitivity,
    List<String>? fallbackMethods,
    bool? livenessDetection,
    bool? antiSpoofing,
    Map<String, dynamic>? customSettings,
  }) {
    return BiometricConfig(
      securityLevel: securityLevel ?? this.securityLevel,
      enabledBiometrics: enabledBiometrics ?? this.enabledBiometrics,
      authenticationTimeout: authenticationTimeout ?? this.authenticationTimeout,
      continuousMonitoring: continuousMonitoring ?? this.continuousMonitoring,
      behavioralSensitivity: behavioralSensitivity ?? this.behavioralSensitivity,
      fallbackMethods: fallbackMethods ?? this.fallbackMethods,
      livenessDetection: livenessDetection ?? this.livenessDetection,
      antiSpoofing: antiSpoofing ?? this.antiSpoofing,
      customSettings: customSettings ?? this.customSettings,
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() => {
    'securityLevel': securityLevel.name,
    'enabledBiometrics': enabledBiometrics.map((e) => e.name).toList(),
    'authenticationTimeout': authenticationTimeout,
    'continuousMonitoring': continuousMonitoring,
    'behavioralSensitivity': behavioralSensitivity,
    'fallbackMethods': fallbackMethods,
    'livenessDetection': livenessDetection,
    'antiSpoofing': antiSpoofing,
    'customSettings': customSettings,
  };

  /// Create from JSON
  factory BiometricConfig.fromJson(Map<String, dynamic> json) {
    return BiometricConfig(
      securityLevel: SecurityLevel.values.firstWhere(
        (e) => e.name == json['securityLevel'],
        orElse: () => SecurityLevel.medium,
      ),
      enabledBiometrics: (json['enabledBiometrics'] as List?)
          ?.map((e) => BiometricType.values.firstWhere(
                (type) => type.name == e,
                orElse: () => BiometricType.fingerprint,
              ))
          .toList() ?? [BiometricType.fingerprint],
      authenticationTimeout: json['authenticationTimeout'] ?? 15,
      continuousMonitoring: json['continuousMonitoring'] ?? false,
      behavioralSensitivity: json['behavioralSensitivity']?.toDouble() ?? 5.0,
      fallbackMethods: List<String>.from(json['fallbackMethods'] ?? ['pin']),
      livenessDetection: json['livenessDetection'] ?? true,
      antiSpoofing: json['antiSpoofing'] ?? true,
      customSettings: Map<String, dynamic>.from(json['customSettings'] ?? {}),
    );
  }
}
