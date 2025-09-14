import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class AuthenticationDemoWidget extends StatefulWidget {
  final String appId;
  final BiometricConfig config;

  const AuthenticationDemoWidget({
    super.key,
    required this.appId,
    required this.config,
  });

  @override
  State<AuthenticationDemoWidget> createState() => _AuthenticationDemoWidgetState();
}

class _AuthenticationDemoWidgetState extends State<AuthenticationDemoWidget> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  
  bool _isLoading = false;
  String? _lastResult;
  Map<String, dynamic>? _lastAuthResult;
  Map<String, dynamic>? _healthBiometrics;
  BehavioralMetrics? _behavioralMetrics;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Security Features Demo',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            // Authentication Tests
            _buildSection(
              'Authentication Tests',
              [
                _buildDemoButton(
                  'Test Authentication',
                  Icons.fingerprint,
                  _testAuthentication,
                ),
                _buildDemoButton(
                  'Test Liveness Detection',
                  Icons.face_retouching_natural,
                  _testLivenessDetection,
                ),
                _buildDemoButton(
                  'Test Spoofing Detection',
                  Icons.security,
                  _testSpoofingDetection,
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Health & Behavioral
            _buildSection(
              'Health & Behavioral',
              [
                _buildDemoButton(
                  'Get Health Biometrics',
                  Icons.favorite,
                  _getHealthBiometrics,
                ),
                _buildDemoButton(
                  'Update Behavioral Metrics',
                  Icons.psychology,
                  _updateBehavioralMetrics,
                ),
                _buildDemoButton(
                  'Get Current Trust Score',
                  Icons.shield,
                  _getCurrentTrustScore,
                ),
              ],
            ),
            
            if (_isLoading) ...[
              const SizedBox(height: 16),
              const Center(child: CircularProgressIndicator()),
            ],
            
            if (_lastResult != null) ...[
              const SizedBox(height: 16),
              _buildResultCard(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: children,
        ),
      ],
    );
  }

  Widget _buildDemoButton(String label, IconData icon, VoidCallback onPressed) {
    return ElevatedButton.icon(
      onPressed: _isLoading ? null : onPressed,
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue[50],
        foregroundColor: Colors.blue[800],
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }

  Widget _buildResultCard() {
    return Card(
      color: Colors.grey[50],
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.info_outline, size: 16),
                const SizedBox(width: 8),
                Text(
                  'Last Result',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              _lastResult!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontFamily: 'monospace',
              ),
            ),
            
            if (_lastAuthResult != null) ...[
              const SizedBox(height: 8),
              _buildAuthResultDetails(),
            ],
            
            if (_healthBiometrics != null) ...[
              const SizedBox(height: 8),
              _buildHealthBiometricsDetails(),
            ],
            
            if (_behavioralMetrics != null) ...[
              const SizedBox(height: 8),
              _buildBehavioralMetricsDetails(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAuthResultDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Authentication Details:',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        ...(_lastAuthResult!.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(left: 8.0),
            child: Text(
              '• ${entry.key}: ${entry.value}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          );
        }).toList()),
      ],
    );
  }

  Widget _buildHealthBiometricsDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Health Biometrics:',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        ...(_healthBiometrics!.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(left: 8.0),
            child: Text(
              '• ${entry.key}: ${entry.value}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          );
        }).toList()),
      ],
    );
  }

  Widget _buildBehavioralMetricsDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Behavioral Metrics:',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(
            '• Confidence: ${(_behavioralMetrics!.confidence * 100).toStringAsFixed(1)}%',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(
            '• Typing Speed: ${_behavioralMetrics!.typingPattern?.averageSpeed ?? 0} WPM',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(
            '• Touch Pressure: ${_behavioralMetrics!.touchGestures?.averagePressure ?? 0}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ],
    );
  }

  Future<void> _testAuthentication() async {
    setState(() {
      _isLoading = true;
      _lastResult = null;
      _lastAuthResult = null;
    });

    try {
      final result = await _biometrics.authenticate(
        config: widget.config,
        appId: widget.appId,
        reason: 'Testing authentication features',
      );

      setState(() {
        _lastResult = 'Authentication ${result.isAuthenticated ? 'SUCCESS' : 'FAILED'}';
        _lastAuthResult = {
          'Authenticated': result.isAuthenticated,
          'Biometric Type': result.biometricType?.displayName ?? 'Unknown',
          'Trust Score': (result.trustScore * 100).toStringAsFixed(1) + '%',
          'Timestamp': result.timestamp.toString(),
          if (result.error != null) 'Error': result.error.toString(),
        };
      });
    } catch (e) {
      setState(() {
        _lastResult = 'Authentication ERROR: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _testLivenessDetection() async {
    setState(() {
      _isLoading = true;
      _lastResult = null;
    });

    try {
      final result = await _biometrics.performLivenessDetection(
        type: BiometricType.face,
        appId: widget.appId,
      );

      setState(() {
        _lastResult = 'Liveness Detection: ${result ? 'PASSED' : 'FAILED'}';
      });
    } catch (e) {
      setState(() {
        _lastResult = 'Liveness Detection ERROR: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _testSpoofingDetection() async {
    setState(() {
      _isLoading = true;
      _lastResult = null;
    });

    try {
      final result = await _biometrics.detectSpoofing(
        type: BiometricType.fingerprint,
        appId: widget.appId,
      );

      setState(() {
        _lastResult = 'Spoofing Detection: ${result ? 'SPOOFING DETECTED' : 'GENUINE'}';
      });
    } catch (e) {
      setState(() {
        _lastResult = 'Spoofing Detection ERROR: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _getHealthBiometrics() async {
    setState(() {
      _isLoading = true;
      _lastResult = null;
      _healthBiometrics = null;
    });

    try {
      final result = await _biometrics.getHealthBiometrics();

      setState(() {
        _lastResult = 'Health Biometrics Retrieved Successfully';
        _healthBiometrics = result;
      });
    } catch (e) {
      setState(() {
        _lastResult = 'Health Biometrics ERROR: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _updateBehavioralMetrics() async {
    setState(() {
      _isLoading = true;
      _lastResult = null;
      _behavioralMetrics = null;
    });

    try {
      // Create sample behavioral metrics
      final metrics = BehavioralMetrics(
        confidence: 0.85,
        timestamp: DateTime.now(),
        typingPattern: TypingPattern(
          averageSpeed: 45.0,
          rhythm: [120, 150, 130, 140],
          dwellTimes: [80, 90, 85, 95],
          flightTimes: [40, 50, 45, 55],
        ),
        touchGestures: TouchGestures(
          averagePressure: 0.7,
          touchDuration: 200,
          swipeVelocity: 1.2,
          tapAccuracy: 0.95,
        ),
        deviceHandling: DeviceHandling(
          accelerometerData: [0.1, -0.2, 9.8],
          gyroscopeData: [0.05, 0.02, -0.01],
          magnetometerData: [25.5, -15.2, 42.1],
          orientation: 'portrait',
        ),
        appUsage: AppUsage(
          sessionDuration: 1800,
          interactionFrequency: 25,
          navigationPatterns: ['home', 'banking', 'settings'],
          featureUsage: {'transfer': 5, 'balance': 10, 'history': 3},
        ),
      );

      await _biometrics.updateBehavioralMetrics(
        metrics: metrics,
        appId: widget.appId,
      );

      setState(() {
        _lastResult = 'Behavioral Metrics Updated Successfully';
        _behavioralMetrics = metrics;
      });
    } catch (e) {
      setState(() {
        _lastResult = 'Behavioral Metrics ERROR: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _getCurrentTrustScore() async {
    setState(() {
      _isLoading = true;
      _lastResult = null;
    });

    try {
      final trustScore = await _biometrics.getCurrentTrustScore();

      setState(() {
        _lastResult = 'Trust Score: ${(trustScore.value * 100).toStringAsFixed(1)}% (${trustScore.trustLevel})';
      });
    } catch (e) {
      setState(() {
        _lastResult = 'Trust Score ERROR: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
}
