import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';
import '../widgets/biometric_status_card.dart';
import '../widgets/trust_score_widget.dart';
import '../widgets/feature_showcase_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  
  bool _isAvailable = false;
  List<BiometricType> _availableBiometrics = [];
  TrustScore _currentTrustScore = TrustScore.perfect;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeBiometrics();
    _listenToTrustScore();
  }

  Future<void> _initializeBiometrics() async {
    try {
      final isAvailable = await _biometrics.isAvailable();
      final availableBiometrics = await _biometrics.getAvailableBiometrics();
      final trustScore = await _biometrics.getCurrentTrustScore();

      setState(() {
        _isAvailable = isAvailable;
        _availableBiometrics = availableBiometrics;
        _currentTrustScore = trustScore;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showError('Failed to initialize biometrics: $e');
    }
  }

  void _listenToTrustScore() {
    _biometrics.trustScoreStream.listen((trustScore) {
      setState(() {
        _currentTrustScore = trustScore;
      });
    });
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Secure Biometrics Demo'),
        centerTitle: true,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _initializeBiometrics,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome Section
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.security,
                                  color: Theme.of(context).primaryColor,
                                  size: 32,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Welcome to Secure Biometrics',
                                        style: Theme.of(context).textTheme.headlineSmall,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'App-specific biometric isolation with continuous authentication',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Biometric Status
                    BiometricStatusCard(
                      isAvailable: _isAvailable,
                      availableBiometrics: _availableBiometrics,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Trust Score
                    TrustScoreWidget(trustScore: _currentTrustScore),
                    
                    const SizedBox(height: 24),
                    
                    // Features Section
                    Text(
                      'Key Features',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    
                    // Feature Cards
                    FeatureShowcaseCard(
                      icon: Icons.fingerprint,
                      title: 'App-Specific Isolation',
                      description: 'Each app gets its own biometric profile, preventing cross-app access.',
                      color: Colors.blue,
                      onTap: () => _demonstrateFeature('App-Specific Isolation'),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    FeatureShowcaseCard(
                      icon: Icons.face,
                      title: 'Multi-Modal Authentication',
                      description: 'Support for fingerprint, face, voice, and health-based biometrics.',
                      color: Colors.green,
                      onTap: () => _demonstrateFeature('Multi-Modal Authentication'),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    FeatureShowcaseCard(
                      icon: Icons.psychology,
                      title: 'Behavioral Biometrics',
                      description: 'Continuous authentication through typing patterns and device usage.',
                      color: Colors.purple,
                      onTap: () => _demonstrateFeature('Behavioral Biometrics'),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    FeatureShowcaseCard(
                      icon: Icons.security_update_good,
                      title: 'Liveness Detection',
                      description: 'Advanced anti-spoofing with blink detection and 3D analysis.',
                      color: Colors.orange,
                      onTap: () => _demonstrateFeature('Liveness Detection'),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    FeatureShowcaseCard(
                      icon: Icons.favorite,
                      title: 'Health Biometrics',
                      description: 'Heart rate and blood oxygen measurement via camera.',
                      color: Colors.red,
                      onTap: () => _demonstrateFeature('Health Biometrics'),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Demo Apps Section
                    Text(
                      'Demo Applications',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: _buildDemoCard(
                            context,
                            'Banking',
                            'Maximum security for financial apps',
                            Icons.account_balance,
                            Colors.blue,
                            1,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildDemoCard(
                            context,
                            'Healthcare',
                            'HIPAA-compliant medical records',
                            Icons.local_hospital,
                            Colors.green,
                            2,
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 12),
                    
                    _buildDemoCard(
                      context,
                      'Enterprise',
                      'Corporate device sharing with secure access',
                      Icons.business,
                      Colors.purple,
                      3,
                    ),
                    
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildDemoCard(
    BuildContext context,
    String title,
    String description,
    IconData icon,
    Color color,
    int tabIndex,
  ) {
    return Card(
      child: InkWell(
        onTap: () {
          DefaultTabController.of(context)?.animateTo(tabIndex);
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, color: color, size: 24),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 16),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                description,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _demonstrateFeature(String featureName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(featureName),
        content: Text('This feature demonstrates $featureName capabilities. '
            'Navigate to the demo apps to see it in action.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
