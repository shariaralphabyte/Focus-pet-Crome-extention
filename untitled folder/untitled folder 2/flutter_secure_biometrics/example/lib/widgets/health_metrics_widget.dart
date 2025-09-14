import 'package:flutter/material.dart';

class HealthMetricsWidget extends StatelessWidget {
  final Map<String, dynamic> healthData;

  const HealthMetricsWidget({
    super.key,
    required this.healthData,
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
                const Icon(Icons.favorite, color: Colors.red, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Health Biometrics',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Health Metrics Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: [
                _buildMetricCard(
                  'Heart Rate',
                  '${healthData['heartRate'] ?? 72} BPM',
                  Icons.favorite,
                  Colors.red,
                  _getHeartRateStatus(healthData['heartRate']),
                ),
                _buildMetricCard(
                  'Blood Oxygen',
                  '${healthData['bloodOxygen'] ?? 98}%',
                  Icons.bloodtype,
                  Colors.blue,
                  _getBloodOxygenStatus(healthData['bloodOxygen']),
                ),
                _buildMetricCard(
                  'Breathing Rate',
                  '${healthData['breathingRate'] ?? 16} /min',
                  Icons.air,
                  Colors.teal,
                  _getBreathingRateStatus(healthData['breathingRate']),
                ),
                _buildMetricCard(
                  'Temperature',
                  '${healthData['bodyTemperature'] ?? 98.6}°F',
                  Icons.thermostat,
                  Colors.orange,
                  _getTemperatureStatus(healthData['bodyTemperature']),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Additional Health Info
            if (healthData['timestamp'] != null) ...[
              Row(
                children: [
                  const Icon(Icons.schedule, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    'Last Updated: ${_formatTimestamp(healthData['timestamp'])}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            
            // Health Status Summary
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _getOverallHealthColor().withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _getOverallHealthColor().withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _getOverallHealthIcon(),
                    color: _getOverallHealthColor(),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Overall Health Status: ${_getOverallHealthStatus()}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                      color: _getOverallHealthColor(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(
    String title,
    String value,
    IconData icon,
    Color color,
    String status,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            status,
            style: TextStyle(
              fontSize: 10,
              color: _getStatusColor(status),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  String _getHeartRateStatus(dynamic heartRate) {
    if (heartRate == null) return 'Unknown';
    final rate = heartRate as num;
    if (rate < 60) return 'Low';
    if (rate > 100) return 'High';
    return 'Normal';
  }

  String _getBloodOxygenStatus(dynamic bloodOxygen) {
    if (bloodOxygen == null) return 'Unknown';
    final oxygen = bloodOxygen as num;
    if (oxygen < 95) return 'Low';
    if (oxygen >= 95) return 'Normal';
    return 'Unknown';
  }

  String _getBreathingRateStatus(dynamic breathingRate) {
    if (breathingRate == null) return 'Unknown';
    final rate = breathingRate as num;
    if (rate < 12) return 'Low';
    if (rate > 20) return 'High';
    return 'Normal';
  }

  String _getTemperatureStatus(dynamic temperature) {
    if (temperature == null) return 'Unknown';
    final temp = temperature as num;
    if (temp < 97.0) return 'Low';
    if (temp > 99.5) return 'High';
    return 'Normal';
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'normal':
        return Colors.green;
      case 'low':
      case 'high':
        return Colors.orange;
      case 'critical':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getOverallHealthStatus() {
    final statuses = [
      _getHeartRateStatus(healthData['heartRate']),
      _getBloodOxygenStatus(healthData['bloodOxygen']),
      _getBreathingRateStatus(healthData['breathingRate']),
      _getTemperatureStatus(healthData['bodyTemperature']),
    ];

    if (statuses.any((status) => status == 'Critical')) {
      return 'Critical';
    }
    if (statuses.any((status) => status == 'High' || status == 'Low')) {
      return 'Attention Needed';
    }
    if (statuses.every((status) => status == 'Normal')) {
      return 'Excellent';
    }
    return 'Good';
  }

  Color _getOverallHealthColor() {
    final status = _getOverallHealthStatus();
    switch (status) {
      case 'Excellent':
        return Colors.green;
      case 'Good':
        return Colors.teal;
      case 'Attention Needed':
        return Colors.orange;
      case 'Critical':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getOverallHealthIcon() {
    final status = _getOverallHealthStatus();
    switch (status) {
      case 'Excellent':
        return Icons.check_circle;
      case 'Good':
        return Icons.thumb_up;
      case 'Attention Needed':
        return Icons.warning;
      case 'Critical':
        return Icons.error;
      default:
        return Icons.help;
    }
  }

  String _formatTimestamp(dynamic timestamp) {
    if (timestamp == null) return 'Unknown';
    try {
      final dateTime = DateTime.parse(timestamp.toString());
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inMinutes < 1) {
        return 'Just now';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes}m ago';
      } else if (difference.inHours < 24) {
        return '${difference.inHours}h ago';
      } else {
        return '${difference.inDays}d ago';
      }
    } catch (e) {
      return 'Unknown';
    }
  }
}
