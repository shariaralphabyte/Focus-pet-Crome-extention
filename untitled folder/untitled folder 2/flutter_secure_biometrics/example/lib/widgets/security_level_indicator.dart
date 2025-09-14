import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class SecurityLevelIndicator extends StatelessWidget {
  final SecurityLevel securityLevel;
  final TrustScore trustScore;
  final bool isContinuousAuthActive;

  const SecurityLevelIndicator({
    super.key,
    required this.securityLevel,
    required this.trustScore,
    required this.isContinuousAuthActive,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  _getSecurityIcon(),
                  color: _getSecurityColor(),
                  size: 24,
                ),
                const SizedBox(width: 8),
                Text(
                  'Security Level: ${securityLevel.displayName}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            
            // Security Level Progress
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: _getSecurityProgress(),
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(_getSecurityColor()),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${(_getSecurityProgress() * 100).toInt()}%',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Security Features
            _buildSecurityFeature(
              'Required Factors',
              '${securityLevel.requiredFactors} biometric types',
              Icons.fingerprint,
            ),
            
            _buildSecurityFeature(
              'Continuous Auth',
              isContinuousAuthActive ? 'Active' : 'Inactive',
              Icons.psychology,
              isActive: isContinuousAuthActive,
            ),
            
            _buildSecurityFeature(
              'Trust Score',
              '${(trustScore.value * 100).toStringAsFixed(1)}% - ${trustScore.trustLevel}',
              Icons.security,
              isActive: trustScore.value >= securityLevel.minimumTrustScore,
            ),
            
            _buildSecurityFeature(
              'Min Trust Required',
              '${(securityLevel.minimumTrustScore * 100).toInt()}%',
              Icons.shield,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityFeature(
    String title,
    String value,
    IconData icon, {
    bool? isActive,
  }) {
    Color? statusColor;
    if (isActive != null) {
      statusColor = isActive ? Colors.green : Colors.red;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Icon(
            icon,
            size: 16,
            color: statusColor ?? Colors.grey[600],
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: statusColor ?? Colors.grey[800],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getSecurityIcon() {
    switch (securityLevel) {
      case SecurityLevel.low:
        return Icons.security;
      case SecurityLevel.medium:
        return Icons.verified_user;
      case SecurityLevel.high:
        return Icons.admin_panel_settings;
      case SecurityLevel.maximum:
        return Icons.gpp_good;
    }
  }

  Color _getSecurityColor() {
    switch (securityLevel) {
      case SecurityLevel.low:
        return Colors.orange;
      case SecurityLevel.medium:
        return Colors.blue;
      case SecurityLevel.high:
        return Colors.purple;
      case SecurityLevel.maximum:
        return Colors.green;
    }
  }

  double _getSecurityProgress() {
    switch (securityLevel) {
      case SecurityLevel.low:
        return 0.25;
      case SecurityLevel.medium:
        return 0.5;
      case SecurityLevel.high:
        return 0.75;
      case SecurityLevel.maximum:
        return 1.0;
    }
  }
}
