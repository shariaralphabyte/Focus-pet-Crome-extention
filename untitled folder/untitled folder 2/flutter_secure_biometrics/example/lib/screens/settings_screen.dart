import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  
  bool _isLoading = false;
  List<BiometricType> _availableBiometrics = [];
  Map<String, bool> _registeredApps = {};
  String? _exportedData;
  
  final List<String> _testAppIds = [
    'com.example.banking_app',
    'com.example.healthcare_app',
    'com.example.enterprise_app',
  ];

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Check available biometrics
      final available = await _biometrics.getAvailableBiometrics();
      setState(() {
        _availableBiometrics = available;
      });

      // Check registered apps
      final registeredStatus = <String, bool>{};
      for (final appId in _testAppIds) {
        bool hasAnyRegistered = false;
        for (final type in BiometricType.values) {
          try {
            final isRegistered = await _biometrics.isAppBiometricRegistered(
              type: type,
              appId: appId,
            );
            if (isRegistered) {
              hasAnyRegistered = true;
              break;
            }
          } catch (e) {
            // Ignore errors for individual checks
          }
        }
        registeredStatus[appId] = hasAnyRegistered;
      }
      
      setState(() {
        _registeredApps = registeredStatus;
      });
    } catch (e) {
      _showError('Failed to load settings: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _clearAllBiometrics() async {
    final confirmed = await _showConfirmDialog(
      'Clear All Biometrics',
      'This will remove all registered biometric data for all demo apps. This action cannot be undone.',
    );

    if (!confirmed) return;

    setState(() {
      _isLoading = true;
    });

    try {
      for (final appId in _testAppIds) {
        for (final type in BiometricType.values) {
          try {
            await _biometrics.clearAppBiometric(type: type, appId: appId);
          } catch (e) {
            // Ignore individual failures
          }
        }
      }
      
      await _loadSettings();
      _showSuccess('All biometric data cleared successfully');
    } catch (e) {
      _showError('Failed to clear biometrics: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _exportTrainingData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final data = await _biometrics.exportTrainingData();
      setState(() {
        _exportedData = data;
      });
      _showSuccess('Training data exported successfully');
    } catch (e) {
      _showError('Failed to export training data: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _importTrainingData() async {
    if (_exportedData == null) {
      _showError('No exported data available to import');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final success = await _biometrics.importTrainingData(_exportedData!);
      if (success) {
        _showSuccess('Training data imported successfully');
      } else {
        _showError('Failed to import training data');
      }
    } catch (e) {
      _showError('Failed to import training data: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _testBiometricAvailability() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final isAvailable = await _biometrics.isAvailable();
      final available = await _biometrics.getAvailableBiometrics();
      
      _showInfoDialog(
        'Biometric Availability',
        'Biometrics Available: ${isAvailable ? 'Yes' : 'No'}\n\n'
        'Available Types:\n${available.map((type) => '• ${type.displayName}').join('\n')}',
      );
    } catch (e) {
      _showError('Failed to check availability: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _getCurrentTrustScore() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final trustScore = await _biometrics.getCurrentTrustScore();
      
      _showInfoDialog(
        'Current Trust Score',
        'Trust Score: ${(trustScore.value * 100).toStringAsFixed(1)}%\n'
        'Trust Level: ${trustScore.trustLevel}\n'
        'Last Updated: ${trustScore.timestamp}\n\n'
        'Contributing Factors:\n${trustScore.factors.entries.map((e) => '• ${e.key}: ${(e.value * 100).toStringAsFixed(1)}%').join('\n')}',
      );
    } catch (e) {
      _showError('Failed to get trust score: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<bool> _showConfirmDialog(String title, String content) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  Future<void> _showInfoDialog(String title, String content) async {
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(
          child: Text(content),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings & Testing'),
        backgroundColor: Colors.grey[800],
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _loadSettings,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Biometric Status
                  _buildSection(
                    'Biometric Status',
                    [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Available Biometric Types',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              if (_availableBiometrics.isEmpty)
                                const Text('No biometric types available')
                              else
                                ..._availableBiometrics.map((type) => Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 2.0),
                                  child: Row(
                                    children: [
                                      Icon(
                                        _getBiometricIcon(type),
                                        size: 16,
                                        color: Colors.green,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(type.displayName),
                                    ],
                                  ),
                                )).toList(),
                              
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: _testBiometricAvailability,
                                  icon: const Icon(Icons.check_circle),
                                  label: const Text('Test Availability'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Registered Apps
                  _buildSection(
                    'Registered Apps',
                    [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'App Registration Status',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              
                              ..._testAppIds.map((appId) {
                                final isRegistered = _registeredApps[appId] ?? false;
                                final appName = _getAppName(appId);
                                
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                                  child: Row(
                                    children: [
                                      Icon(
                                        isRegistered ? Icons.check_circle : Icons.cancel,
                                        size: 16,
                                        color: isRegistered ? Colors.green : Colors.red,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(child: Text(appName)),
                                      Text(
                                        isRegistered ? 'Registered' : 'Not Registered',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: isRegistered ? Colors.green : Colors.red,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Testing Tools
                  _buildSection(
                    'Testing Tools',
                    [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Security Testing',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              
                              GridView.count(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                crossAxisCount: 2,
                                mainAxisSpacing: 8,
                                crossAxisSpacing: 8,
                                childAspectRatio: 3,
                                children: [
                                  ElevatedButton.icon(
                                    onPressed: _getCurrentTrustScore,
                                    icon: const Icon(Icons.security, size: 16),
                                    label: const Text('Trust Score', style: TextStyle(fontSize: 12)),
                                  ),
                                  ElevatedButton.icon(
                                    onPressed: _exportTrainingData,
                                    icon: const Icon(Icons.download, size: 16),
                                    label: const Text('Export Data', style: TextStyle(fontSize: 12)),
                                  ),
                                  ElevatedButton.icon(
                                    onPressed: _importTrainingData,
                                    icon: const Icon(Icons.upload, size: 16),
                                    label: const Text('Import Data', style: TextStyle(fontSize: 12)),
                                  ),
                                  ElevatedButton.icon(
                                    onPressed: _clearAllBiometrics,
                                    icon: const Icon(Icons.delete_forever, size: 16),
                                    label: const Text('Clear All', style: TextStyle(fontSize: 12)),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.red[100],
                                      foregroundColor: Colors.red[800],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Plugin Information
                  _buildSection(
                    'Plugin Information',
                    [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Flutter Secure Biometrics',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text('Version: 1.0.0'),
                              const Text('Platform: Android & iOS'),
                              const SizedBox(height: 12),
                              
                              const Text('Features:', style: TextStyle(fontWeight: FontWeight.w500)),
                              const SizedBox(height: 4),
                              const Text('• App-specific biometric isolation'),
                              const Text('• Multi-modal authentication'),
                              const Text('• Continuous behavioral monitoring'),
                              const Text('• Liveness & spoofing detection'),
                              const Text('• Health biometric integration'),
                              const Text('• Real-time trust scoring'),
                              const Text('• Enterprise-grade security'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (_exportedData != null) ...[
                    const SizedBox(height: 16),
                    _buildSection(
                      'Exported Data Preview',
                      [
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Training Data Export',
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  width: double.infinity,
                                  height: 100,
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: Colors.grey[300]!),
                                  ),
                                  child: SingleChildScrollView(
                                    child: Text(
                                      _exportedData!.length > 500
                                          ? '${_exportedData!.substring(0, 500)}...'
                                          : _exportedData!,
                                      style: const TextStyle(
                                        fontFamily: 'monospace',
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
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
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  IconData _getBiometricIcon(BiometricType type) {
    switch (type) {
      case BiometricType.fingerprint:
        return Icons.fingerprint;
      case BiometricType.face:
        return Icons.face;
      case BiometricType.voice:
        return Icons.record_voice_over;
      case BiometricType.iris:
        return Icons.visibility;
      case BiometricType.heartRate:
        return Icons.favorite;
      case BiometricType.bloodOxygen:
        return Icons.bloodtype;
      case BiometricType.breathingPattern:
        return Icons.air;
    }
  }

  String _getAppName(String appId) {
    switch (appId) {
      case 'com.example.banking_app':
        return 'SecureBank Demo';
      case 'com.example.healthcare_app':
        return 'HealthSecure Demo';
      case 'com.example.enterprise_app':
        return 'EnterpriseSec Demo';
      default:
        return appId;
    }
  }
}
