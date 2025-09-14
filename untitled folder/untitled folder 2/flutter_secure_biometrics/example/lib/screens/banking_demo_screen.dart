import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';
import '../widgets/security_level_indicator.dart';
import '../widgets/biometric_registration_widget.dart';
import '../widgets/authentication_demo_widget.dart';

class BankingDemoScreen extends StatefulWidget {
  const BankingDemoScreen({super.key});

  @override
  State<BankingDemoScreen> createState() => _BankingDemoScreenState();
}

class _BankingDemoScreenState extends State<BankingDemoScreen> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  static const String _appId = 'com.example.banking_app';
  
  bool _isAuthenticated = false;
  bool _isContinuousAuthActive = false;
  double _accountBalance = 125847.32;
  TrustScore _currentTrustScore = TrustScore.perfect;

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
      
      // Auto-lock if trust score drops too low
      if (trustScore.value < 0.6 && _isAuthenticated) {
        _lockAccount();
      }
    });
  }

  Future<void> _authenticateUser() async {
    try {
      final result = await _biometrics.authenticate(
        config: BiometricConfig.banking,
        appId: _appId,
        reason: 'Authenticate to access your banking account',
      );

      if (result.isAuthenticated) {
        setState(() {
          _isAuthenticated = true;
        });
        
        // Start continuous authentication
        await _biometrics.startContinuousAuth(
          config: BiometricConfig.banking,
          appId: _appId,
        );
        
        setState(() {
          _isContinuousAuthActive = true;
        });
        
        _showSuccess('Authentication successful! Continuous monitoring active.');
      }
    } catch (e) {
      _showError('Authentication failed: ${e.toString()}');
    }
  }

  Future<void> _lockAccount() async {
    await _biometrics.stopContinuousAuth();
    await _biometrics.lockApplication();
    
    setState(() {
      _isAuthenticated = false;
      _isContinuousAuthActive = false;
    });
    
    _showError('Account locked due to security concerns');
  }

  Future<void> _performTransaction(String type, double amount) async {
    if (!_isAuthenticated) {
      _showError('Please authenticate first');
      return;
    }

    if (_currentTrustScore.value < 0.8) {
      _showError('Trust score too low for transactions. Please re-authenticate.');
      return;
    }

    // Simulate transaction
    setState(() {
      if (type == 'withdraw') {
        _accountBalance -= amount;
      } else {
        _accountBalance += amount;
      }
    });

    _showSuccess('Transaction completed successfully');
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
        title: const Text('SecureBank Demo'),
        backgroundColor: Colors.blue[800],
        foregroundColor: Colors.white,
        actions: [
          if (_isAuthenticated)
            IconButton(
              icon: const Icon(Icons.lock),
              onPressed: _lockAccount,
              tooltip: 'Lock Account',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Security Status Card
            Card(
              color: _isAuthenticated ? Colors.green[50] : Colors.red[50],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(
                      _isAuthenticated ? Icons.security : Icons.lock,
                      color: _isAuthenticated ? Colors.green : Colors.red,
                      size: 32,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isAuthenticated ? 'Account Unlocked' : 'Account Locked',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: _isAuthenticated ? Colors.green[800] : Colors.red[800],
                            ),
                          ),
                          Text(
                            _isAuthenticated 
                                ? 'Maximum security with continuous monitoring'
                                : 'Authenticate with app-specific biometrics to access',
                            style: Theme.of(context).textTheme.bodySmall,
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
              securityLevel: SecurityLevel.maximum,
              trustScore: _currentTrustScore,
              isContinuousAuthActive: _isContinuousAuthActive,
            ),

            const SizedBox(height: 16),

            if (!_isAuthenticated) ...[
              // Authentication Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Banking Authentication',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'This demo uses maximum security configuration with:',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 8),
                      const Text('• Multi-factor biometric authentication'),
                      const Text('• Continuous behavioral monitoring'),
                      const Text('• Advanced liveness detection'),
                      const Text('• Real-time trust scoring'),
                      const SizedBox(height: 16),
                      
                      BiometricRegistrationWidget(
                        appId: _appId,
                        requiredBiometrics: BiometricConfig.banking.enabledBiometrics,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _authenticateUser,
                          icon: const Icon(Icons.fingerprint),
                          label: const Text('Authenticate'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue[800],
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
              // Account Dashboard
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.account_balance_wallet, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            'Account Balance',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '\$${_accountBalance.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.green[700],
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Transaction Buttons
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _performTransaction('withdraw', 100.0),
                              icon: const Icon(Icons.remove),
                              label: const Text('Withdraw \$100'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red[600],
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _performTransaction('deposit', 500.0),
                              icon: const Icon(Icons.add),
                              label: const Text('Deposit \$500'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green[600],
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Recent Transactions
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Recent Transactions',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildTransactionItem('Coffee Shop', -4.50, 'Today 2:30 PM'),
                      _buildTransactionItem('Salary Deposit', 3500.00, 'Yesterday'),
                      _buildTransactionItem('Gas Station', -45.20, 'Dec 7'),
                      _buildTransactionItem('Online Transfer', -200.00, 'Dec 6'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Security Features Demo
              AuthenticationDemoWidget(
                appId: _appId,
                config: BiometricConfig.banking,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionItem(String description, double amount, String date) {
    final isPositive = amount > 0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(
            isPositive ? Icons.add_circle : Icons.remove_circle,
            color: isPositive ? Colors.green : Colors.red,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  date,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${isPositive ? '+' : ''}\$${amount.abs().toStringAsFixed(2)}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: isPositive ? Colors.green[700] : Colors.red[700],
            ),
          ),
        ],
      ),
    );
  }
}
