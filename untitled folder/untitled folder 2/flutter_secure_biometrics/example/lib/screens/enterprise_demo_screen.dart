import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';
import '../widgets/security_level_indicator.dart';
import '../widgets/biometric_registration_widget.dart';
import '../widgets/behavioral_monitoring_widget.dart';

class EnterpriseDemoScreen extends StatefulWidget {
  const EnterpriseDemoScreen({super.key});

  @override
  State<EnterpriseDemoScreen> createState() => _EnterpriseDemoScreenState();
}

class _EnterpriseDemoScreenState extends State<EnterpriseDemoScreen> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  static const String _appId = 'com.example.enterprise_app';
  
  bool _isAuthenticated = false;
  bool _isContinuousAuthActive = false;
  TrustScore _currentTrustScore = TrustScore.perfect;
  BehavioralMetrics? _behavioralMetrics;
  String? _employeeId;
  String _securityClearance = 'None';
  List<Map<String, dynamic>> _accessLogs = [];

  @override
  void initState() {
    super.initState();
    _listenToTrustScore();
    _listenToBehavioralMetrics();
  }

  void _listenToTrustScore() {
    _biometrics.trustScoreStream.listen((trustScore) {
      setState(() {
        _currentTrustScore = trustScore;
      });
      
      // Log trust score changes for enterprise audit
      _addAccessLog('Trust Score Updated', 'Score: ${(trustScore.value * 100).toStringAsFixed(1)}%');
      
      // Auto-lock if trust score drops too low
      if (trustScore.value < 0.65 && _isAuthenticated) {
        _lockAccess('Trust score below enterprise threshold');
      }
    });
  }

  void _listenToBehavioralMetrics() {
    _biometrics.behavioralMetricsStream.listen((metrics) {
      setState(() {
        _behavioralMetrics = metrics;
      });
      
      // Analyze behavioral anomalies
      if (metrics.confidence < 0.7) {
        _addAccessLog('Behavioral Anomaly', 'Confidence: ${(metrics.confidence * 100).toStringAsFixed(1)}%');
      }
    });
  }

  Future<void> _authenticateEnterprise() async {
    try {
      final result = await _biometrics.authenticate(
        config: BiometricConfig.enterprise,
        appId: _appId,
        reason: 'Authenticate for enterprise system access',
      );

      if (result.isAuthenticated) {
        setState(() {
          _isAuthenticated = true;
          _employeeId = 'EMP-${DateTime.now().millisecondsSinceEpoch}';
          _securityClearance = 'Level 3 - Confidential';
        });
        
        _addAccessLog('Authentication Success', 'Employee authenticated successfully');
        
        // Start continuous authentication for enterprise
        await _biometrics.startContinuousAuth(
          config: BiometricConfig.enterprise,
          appId: _appId,
        );
        
        setState(() {
          _isContinuousAuthActive = true;
        });
        
        _addAccessLog('Continuous Auth Started', 'Behavioral monitoring active');
        _showSuccess('Enterprise access granted! Continuous monitoring active.');
      }
    } catch (e) {
      _addAccessLog('Authentication Failed', e.toString());
      _showError('Enterprise authentication failed: ${e.toString()}');
    }
  }

  Future<void> _lockAccess(String reason) async {
    await _biometrics.stopContinuousAuth();
    await _biometrics.lockApplication();
    
    setState(() {
      _isAuthenticated = false;
      _isContinuousAuthActive = false;
      _employeeId = null;
      _securityClearance = 'None';
    });
    
    _addAccessLog('Access Locked', reason);
    _showError('Enterprise access locked: $reason');
  }

  Future<void> _performEnterpriseAction(String action) async {
    if (!_isAuthenticated) {
      _showError('Please authenticate first');
      return;
    }

    if (_currentTrustScore.value < 0.8) {
      _showError('Trust score too low for sensitive operations. Please re-authenticate.');
      return;
    }

    // Simulate enterprise action
    switch (action) {
      case 'access_files':
        _addAccessLog('File Access', 'Accessed confidential documents');
        _showSuccess('Confidential files accessed successfully');
        break;
      case 'admin_panel':
        _addAccessLog('Admin Access', 'Accessed administrative panel');
        _showSuccess('Administrative panel accessed');
        break;
      case 'export_data':
        _addAccessLog('Data Export', 'Exported sensitive data');
        _showSuccess('Data export completed with audit trail');
        break;
      case 'emergency_override':
        _addAccessLog('Emergency Override', 'Emergency access protocol activated');
        _showSuccess('Emergency override activated - all actions logged');
        break;
    }
  }

  void _addAccessLog(String action, String details) {
    setState(() {
      _accessLogs.insert(0, {
        'timestamp': DateTime.now(),
        'action': action,
        'details': details,
        'employeeId': _employeeId ?? 'Unknown',
        'trustScore': _currentTrustScore.value,
      });
      
      // Keep only last 20 logs
      if (_accessLogs.length > 20) {
        _accessLogs = _accessLogs.take(20).toList();
      }
    });
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
        title: const Text('EnterpriseSec Demo'),
        backgroundColor: Colors.indigo[700],
        foregroundColor: Colors.white,
        actions: [
          if (_isAuthenticated)
            IconButton(
              icon: const Icon(Icons.lock),
              onPressed: () => _lockAccess('Manual lock by user'),
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
              color: _isAuthenticated ? Colors.indigo[50] : Colors.red[50],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(
                      _isAuthenticated ? Icons.business : Icons.lock,
                      color: _isAuthenticated ? Colors.indigo : Colors.red,
                      size: 32,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isAuthenticated ? 'Enterprise Access Granted' : 'Enterprise Access Locked',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: _isAuthenticated ? Colors.indigo[800] : Colors.red[800],
                            ),
                          ),
                          Text(
                            _isAuthenticated 
                                ? 'Behavioral monitoring with audit trail'
                                : 'Multi-factor enterprise authentication required',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          if (_employeeId != null) ...[
                            Text(
                              'Employee ID: $_employeeId',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontFamily: 'monospace',
                                color: Colors.grey[600],
                              ),
                            ),
                            Text(
                              'Clearance: $_securityClearance',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w500,
                                color: Colors.indigo[700],
                              ),
                            ),
                          ],
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
              // Enterprise Authentication Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Enterprise Authentication',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'This demo uses enterprise-grade security with:',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 8),
                      const Text('• Multi-factor biometric authentication'),
                      const Text('• Continuous behavioral monitoring'),
                      const Text('• Real-time trust scoring'),
                      const Text('• Comprehensive audit logging'),
                      const Text('• Anomaly detection and alerting'),
                      const SizedBox(height: 16),
                      
                      BiometricRegistrationWidget(
                        appId: _appId,
                        requiredBiometrics: BiometricConfig.enterprise.enabledBiometrics,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _authenticateEnterprise,
                          icon: const Icon(Icons.business),
                          label: const Text('Authenticate Enterprise Access'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.indigo[700],
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
              // Enterprise Dashboard
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.dashboard, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            'Enterprise Dashboard',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Enterprise Actions
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 2.5,
                        children: [
                          _buildEnterpriseActionButton(
                            'Access Files',
                            Icons.folder_open,
                            () => _performEnterpriseAction('access_files'),
                          ),
                          _buildEnterpriseActionButton(
                            'Admin Panel',
                            Icons.admin_panel_settings,
                            () => _performEnterpriseAction('admin_panel'),
                          ),
                          _buildEnterpriseActionButton(
                            'Export Data',
                            Icons.download,
                            () => _performEnterpriseAction('export_data'),
                          ),
                          _buildEnterpriseActionButton(
                            'Emergency',
                            Icons.emergency,
                            () => _performEnterpriseAction('emergency_override'),
                            isEmergency: true,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Behavioral Monitoring
              if (_behavioralMetrics != null)
                BehavioralMonitoringWidget(
                  behavioralMetrics: _behavioralMetrics!,
                  trustScore: _currentTrustScore,
                ),

              const SizedBox(height: 16),

              // Access Logs
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.history, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Access Audit Log',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      if (_accessLogs.isEmpty)
                        const Text('No access logs yet')
                      else
                        ...(_accessLogs.take(5).map((log) => _buildLogEntry(log)).toList()),
                      
                      if (_accessLogs.length > 5)
                        Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            '... and ${_accessLogs.length - 5} more entries',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
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

  Widget _buildEnterpriseActionButton(
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
        backgroundColor: isEmergency ? Colors.red[600] : Colors.indigo[600],
        foregroundColor: Colors.white,
        padding: const EdgeInsets.all(8),
      ),
    );
  }

  Widget _buildLogEntry(Map<String, dynamic> log) {
    final timestamp = log['timestamp'] as DateTime;
    final timeAgo = _getTimeAgo(timestamp);
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(top: 6, right: 8),
            decoration: BoxDecoration(
              color: _getLogColor(log['action']),
              shape: BoxShape.circle,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  log['action'],
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  log['details'],
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                Text(
                  '$timeAgo • Trust: ${(log['trustScore'] * 100).toStringAsFixed(0)}%',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[500],
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getLogColor(String action) {
    if (action.contains('Failed') || action.contains('Locked') || action.contains('Anomaly')) {
      return Colors.red;
    } else if (action.contains('Success') || action.contains('Started')) {
      return Colors.green;
    } else {
      return Colors.blue;
    }
  }

  String _getTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }
}
