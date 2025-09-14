import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';
import '../widgets/security_level_indicator.dart';
import '../widgets/biometric_registration_widget.dart';
import '../widgets/health_metrics_widget.dart';

class HealthcareDemoScreen extends StatefulWidget {
  const HealthcareDemoScreen({super.key});

  @override
  State<HealthcareDemoScreen> createState() => _HealthcareDemoScreenState();
}

class _HealthcareDemoScreenState extends State<HealthcareDemoScreen> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  static const String _appId = 'com.example.healthcare_app';
  
  bool _isAuthenticated = false;
  bool _isContinuousAuthActive = false;
  TrustScore _currentTrustScore = TrustScore.perfect;
  Map<String, dynamic>? _healthBiometrics;
  String? _patientId;

  @override
  void initState() {
    super.initState();
    _listenToTrustScore();
  }

  void _listenToTrustScore() {
    _biometrics.trustScoreStream.listen((trustScore) {
      setState(() {
        _currentTrustScore = trustScore;
      });
      
      // Auto-lock if trust score drops too low for healthcare
      if (trustScore.value < 0.7 && _isAuthenticated) {
        _lockAccess();
      }
    });
  }

  Future<void> _authenticateHealthcare() async {
    try {
      final result = await _biometrics.authenticate(
        config: BiometricConfig.healthcare,
        appId: _appId,
        reason: 'Authenticate to access patient health records',
      );

      if (result.isAuthenticated) {
        setState(() {
          _isAuthenticated = true;
          _patientId = 'PT-${DateTime.now().millisecondsSinceEpoch}';
        });
        
        // Start continuous authentication for healthcare
        await _biometrics.startContinuousAuth(
          config: BiometricConfig.healthcare,
          appId: _appId,
        );
        
        setState(() {
          _isContinuousAuthActive = true;
        });
        
        // Get initial health biometrics
        await _getHealthBiometrics();
        
        _showSuccess('Healthcare access granted! Health monitoring active.');
      }
    } catch (e) {
      _showError('Healthcare authentication failed: ${e.toString()}');
    }
  }

  Future<void> _lockAccess() async {
    await _biometrics.stopContinuousAuth();
    await _biometrics.lockApplication();
    
    setState(() {
      _isAuthenticated = false;
      _isContinuousAuthActive = false;
      _patientId = null;
      _healthBiometrics = null;
    });
    
    _showError('Healthcare access locked due to security concerns');
  }

  Future<void> _getHealthBiometrics() async {
    try {
      final healthData = await _biometrics.getHealthBiometrics();
      setState(() {
        _healthBiometrics = healthData;
      });
    } catch (e) {
      _showError('Failed to get health biometrics: ${e.toString()}');
    }
  }

  Future<void> _performHealthAction(String action) async {
    if (!_isAuthenticated) {
      _showError('Please authenticate first');
      return;
    }

    if (_currentTrustScore.value < 0.8) {
      _showError('Trust score too low for health actions. Please re-authenticate.');
      return;
    }

    // Simulate health action
    switch (action) {
      case 'view_records':
        _showSuccess('Patient records accessed successfully');
        break;
      case 'update_vitals':
        await _getHealthBiometrics();
        _showSuccess('Vital signs updated from biometric sensors');
        break;
      case 'prescribe':
        _showSuccess('Prescription created and digitally signed');
        break;
      case 'emergency':
        _showSuccess('Emergency protocol activated - continuous monitoring enabled');
        break;
    }
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
        title: const Text('HealthSecure Demo'),
        backgroundColor: Colors.teal[700],
        foregroundColor: Colors.white,
        actions: [
          if (_isAuthenticated)
            IconButton(
              icon: const Icon(Icons.lock),
              onPressed: _lockAccess,
              tooltip: 'Lock Access',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Access Status Card
            Card(
              color: _isAuthenticated ? Colors.teal[50] : Colors.red[50],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(
                      _isAuthenticated ? Icons.medical_services : Icons.lock,
                      color: _isAuthenticated ? Colors.teal : Colors.red,
                      size: 32,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isAuthenticated ? 'Healthcare Access Granted' : 'Healthcare Access Locked',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: _isAuthenticated ? Colors.teal[800] : Colors.red[800],
                            ),
                          ),
                          Text(
                            _isAuthenticated 
                                ? 'HIPAA-compliant with health biometric monitoring'
                                : 'Multi-factor health authentication required',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          if (_patientId != null)
                            Text(
                              'Patient ID: $_patientId',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontFamily: 'monospace',
                                color: Colors.grey[600],
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Security Level Indicator
            SecurityLevelIndicator(
              securityLevel: SecurityLevel.high,
              trustScore: _currentTrustScore,
              isContinuousAuthActive: _isContinuousAuthActive,
            ),

            const SizedBox(height: 16),

            if (!_isAuthenticated) ...[
              // Healthcare Authentication Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Healthcare Authentication',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'This demo uses healthcare-grade security with:',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 8),
                      const Text('• Health biometric authentication (heart rate, blood oxygen)'),
                      const Text('• HIPAA-compliant data protection'),
                      const Text('• Continuous health monitoring'),
                      const Text('• Emergency access protocols'),
                      const SizedBox(height: 16),
                      
                      BiometricRegistrationWidget(
                        appId: _appId,
                        requiredBiometrics: BiometricConfig.healthcare.enabledBiometrics,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _authenticateHealthcare,
                          icon: const Icon(Icons.favorite),
                          label: const Text('Authenticate Healthcare Access'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal[700],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ] else ...[
              // Patient Dashboard
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.person, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            'Patient Dashboard',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Health Actions
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 2.5,
                        children: [
                          _buildHealthActionButton(
                            'View Records',
                            Icons.folder_open,
                            () => _performHealthAction('view_records'),
                          ),
                          _buildHealthActionButton(
                            'Update Vitals',
                            Icons.monitor_heart,
                            () => _performHealthAction('update_vitals'),
                          ),
                          _buildHealthActionButton(
                            'Prescribe',
                            Icons.medication,
                            () => _performHealthAction('prescribe'),
                          ),
                          _buildHealthActionButton(
                            'Emergency',
                            Icons.emergency,
                            () => _performHealthAction('emergency'),
                            isEmergency: true,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Health Biometrics Display
              if (_healthBiometrics != null)
                HealthMetricsWidget(healthData: _healthBiometrics!),

              const SizedBox(height: 16),

              // Health Compliance Info
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.verified_user, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Compliance & Security',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildComplianceItem('HIPAA Compliant', true),
                      _buildComplianceItem('End-to-End Encryption', true),
                      _buildComplianceItem('Audit Trail Active', true),
                      _buildComplianceItem('Health Biometrics Monitoring', _isContinuousAuthActive),
                      _buildComplianceItem('Emergency Access Ready', true),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHealthActionButton(
    String label,
    IconData icon,
    VoidCallback onPressed, {
    bool isEmergency = false,
  }) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(
        label,
        style: const TextStyle(fontSize: 12),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: isEmergency ? Colors.red[600] : Colors.teal[600],
        foregroundColor: Colors.white,
        padding: const EdgeInsets.all(8),
      ),
    );
  }

  Widget _buildComplianceItem(String title, bool isCompliant) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Icon(
            isCompliant ? Icons.check_circle : Icons.error,
            color: isCompliant ? Colors.green : Colors.red,
            size: 16,
          ),
          const SizedBox(width: 8),
          Text(
            title,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}
