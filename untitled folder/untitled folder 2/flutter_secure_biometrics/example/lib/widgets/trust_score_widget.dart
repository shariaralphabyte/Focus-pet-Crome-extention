import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class TrustScoreWidget extends StatelessWidget {
  final TrustScore trustScore;

  const TrustScoreWidget({
    super.key,
    required this.trustScore,
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
                  _getTrustScoreIcon(),
                  color: _getTrustScoreColor(),
                ),
                const SizedBox(width: 8),
                Text(
                  'Trust Score',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getTrustScoreColor().withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    trustScore.trustLevel,
                    style: TextStyle(
                      color: _getTrustScoreColor(),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Trust Score Progress Bar
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: trustScore.value,
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(_getTrustScoreColor()),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${(trustScore.value * 100).toStringAsFixed(1)}%',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: _getTrustScoreColor(),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            Text(
              trustScore.reason,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            
            if (trustScore.factors.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Contributing Factors:',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              ...trustScore.factors.entries.map((entry) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          _formatFactorName(entry.key),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                      Container(
                        width: 60,
                        child: LinearProgressIndicator(
                          value: entry.value,
                          backgroundColor: Colors.grey[300],
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getFactorColor(entry.value),
                          ),
                          minHeight: 4,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${(entry.value * 100).toInt()}%',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ],
          ],
        ),
      ),
    );
  }

  IconData _getTrustScoreIcon() {
    if (trustScore.value >= 0.9) return Icons.security;
    if (trustScore.value >= 0.7) return Icons.verified_user;
    if (trustScore.value >= 0.6) return Icons.warning;
    return Icons.error;
  }

  Color _getTrustScoreColor() {
    if (trustScore.value >= 0.9) return Colors.green;
    if (trustScore.value >= 0.7) return Colors.orange;
    if (trustScore.value >= 0.6) return Colors.deepOrange;
    return Colors.red;
  }

  Color _getFactorColor(double value) {
    if (value >= 0.8) return Colors.green;
    if (value >= 0.6) return Colors.orange;
    return Colors.red;
  }

  String _formatFactorName(String factorName) {
    switch (factorName) {
      case 'deviceMovement':
        return 'Device Movement';
      case 'behavioralConsistency':
        return 'Behavioral Consistency';
      case 'temporalPattern':
        return 'Temporal Patterns';
      default:
        return factorName.replaceAllMapped(
          RegExp(r'([A-Z])'),
          (match) => ' ${match.group(0)}',
        ).trim();
    }
  }
}
