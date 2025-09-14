import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class BehavioralMonitoringWidget extends StatelessWidget {
  final BehavioralMetrics behavioralMetrics;
  final TrustScore trustScore;

  const BehavioralMonitoringWidget({
    super.key,
    required this.behavioralMetrics,
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
                const Icon(Icons.psychology, color: Colors.purple, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Behavioral Monitoring',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Overall Confidence Score
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _getConfidenceColor().withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _getConfidenceColor().withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _getConfidenceIcon(),
                    color: _getConfidenceColor(),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Behavioral Confidence: ${(behavioralMetrics.confidence * 100).toStringAsFixed(1)}%',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  Text(
                    _getConfidenceStatus(),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: _getConfidenceColor(),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Behavioral Metrics Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.8,
              children: [
                if (behavioralMetrics.typingPattern != null)
                  _buildMetricCard(
                    'Typing Pattern',
                    '${behavioralMetrics.typingPattern!.averageSpeed.toStringAsFixed(0)} WPM',
                    Icons.keyboard,
                    Colors.blue,
                    _getTypingStatus(),
                  ),
                
                if (behavioralMetrics.touchGestures != null)
                  _buildMetricCard(
                    'Touch Gestures',
                    '${(behavioralMetrics.touchGestures!.averagePressure * 100).toStringAsFixed(0)}% pressure',
                    Icons.touch_app,
                    Colors.green,
                    _getTouchStatus(),
                  ),
                
                if (behavioralMetrics.deviceHandling != null)
                  _buildMetricCard(
                    'Device Motion',
                    '${behavioralMetrics.deviceHandling!.orientation}',
                    Icons.screen_rotation,
                    Colors.orange,
                    _getMotionStatus(),
                  ),
                
                if (behavioralMetrics.appUsage != null)
                  _buildMetricCard(
                    'App Usage',
                    '${(behavioralMetrics.appUsage!.sessionDuration / 60).toStringAsFixed(0)}m session',
                    Icons.timer,
                    Colors.purple,
                    _getUsageStatus(),
                  ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Detailed Metrics
            ExpansionTile(
              title: const Text('Detailed Metrics'),
              leading: const Icon(Icons.analytics, size: 20),
              children: [
                if (behavioralMetrics.typingPattern != null)
                  _buildDetailedMetric('Typing Pattern', [
                    'Average Speed: ${behavioralMetrics.typingPattern!.averageSpeed.toStringAsFixed(1)} WPM',
                    'Rhythm Variance: ${_calculateVariance(behavioralMetrics.typingPattern!.rhythm).toStringAsFixed(2)}',
                    'Dwell Time Avg: ${_calculateAverage(behavioralMetrics.typingPattern!.dwellTimes).toStringAsFixed(0)}ms',
                    'Flight Time Avg: ${_calculateAverage(behavioralMetrics.typingPattern!.flightTimes).toStringAsFixed(0)}ms',
                  ]),
                
                if (behavioralMetrics.touchGestures != null)
                  _buildDetailedMetric('Touch Gestures', [
                    'Average Pressure: ${(behavioralMetrics.touchGestures!.averagePressure * 100).toStringAsFixed(1)}%',
                    'Touch Duration: ${behavioralMetrics.touchGestures!.touchDuration}ms',
                    'Swipe Velocity: ${behavioralMetrics.touchGestures!.swipeVelocity.toStringAsFixed(2)} px/ms',
                    'Tap Accuracy: ${(behavioralMetrics.touchGestures!.tapAccuracy * 100).toStringAsFixed(1)}%',
                  ]),
                
                if (behavioralMetrics.deviceHandling != null)
                  _buildDetailedMetric('Device Handling', [
                    'Accelerometer: ${behavioralMetrics.deviceHandling!.accelerometerData.map((e) => e.toStringAsFixed(2)).join(', ')}',
                    'Gyroscope: ${behavioralMetrics.deviceHandling!.gyroscopeData.map((e) => e.toStringAsFixed(3)).join(', ')}',
                    'Magnetometer: ${behavioralMetrics.deviceHandling!.magnetometerData.map((e) => e.toStringAsFixed(1)).join(', ')}',
                    'Orientation: ${behavioralMetrics.deviceHandling!.orientation}',
                  ]),
                
                if (behavioralMetrics.appUsage != null)
                  _buildDetailedMetric('App Usage', [
                    'Session Duration: ${(behavioralMetrics.appUsage!.sessionDuration / 60).toStringAsFixed(1)} minutes',
                    'Interaction Frequency: ${behavioralMetrics.appUsage!.interactionFrequency} per minute',
                    'Navigation Pattern: ${behavioralMetrics.appUsage!.navigationPatterns.join(' → ')}',
                    'Feature Usage: ${behavioralMetrics.appUsage!.featureUsage.entries.map((e) => '${e.key}:${e.value}').join(', ')}',
                  ]),
              ],
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
              fontSize: 14,
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

  Widget _buildDetailedMetric(String title, List<String> details) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          ...details.map((detail) => Padding(
            padding: const EdgeInsets.only(left: 8.0, top: 2.0),
            child: Text(
              '• $detail',
              style: const TextStyle(fontSize: 12),
            ),
          )).toList(),
        ],
      ),
    );
  }

  Color _getConfidenceColor() {
    if (behavioralMetrics.confidence >= 0.8) return Colors.green;
    if (behavioralMetrics.confidence >= 0.6) return Colors.orange;
    return Colors.red;
  }

  IconData _getConfidenceIcon() {
    if (behavioralMetrics.confidence >= 0.8) return Icons.check_circle;
    if (behavioralMetrics.confidence >= 0.6) return Icons.warning;
    return Icons.error;
  }

  String _getConfidenceStatus() {
    if (behavioralMetrics.confidence >= 0.8) return 'Normal';
    if (behavioralMetrics.confidence >= 0.6) return 'Attention';
    return 'Anomaly';
  }

  String _getTypingStatus() {
    if (behavioralMetrics.typingPattern == null) return 'Unknown';
    final speed = behavioralMetrics.typingPattern!.averageSpeed;
    if (speed < 20) return 'Slow';
    if (speed > 80) return 'Fast';
    return 'Normal';
  }

  String _getTouchStatus() {
    if (behavioralMetrics.touchGestures == null) return 'Unknown';
    final accuracy = behavioralMetrics.touchGestures!.tapAccuracy;
    if (accuracy >= 0.9) return 'Precise';
    if (accuracy >= 0.7) return 'Normal';
    return 'Imprecise';
  }

  String _getMotionStatus() {
    if (behavioralMetrics.deviceHandling == null) return 'Unknown';
    // Simple motion analysis based on accelerometer data
    final accel = behavioralMetrics.deviceHandling!.accelerometerData;
    final magnitude = accel.map((x) => x * x).reduce((a, b) => a + b);
    if (magnitude > 100) return 'Active';
    if (magnitude > 10) return 'Moderate';
    return 'Stable';
  }

  String _getUsageStatus() {
    if (behavioralMetrics.appUsage == null) return 'Unknown';
    final frequency = behavioralMetrics.appUsage!.interactionFrequency;
    if (frequency > 30) return 'High';
    if (frequency > 10) return 'Normal';
    return 'Low';
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'normal':
      case 'precise':
      case 'stable':
        return Colors.green;
      case 'attention':
      case 'moderate':
      case 'slow':
      case 'fast':
        return Colors.orange;
      case 'anomaly':
      case 'imprecise':
      case 'active':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  double _calculateVariance(List<double> values) {
    if (values.isEmpty) return 0.0;
    final mean = values.reduce((a, b) => a + b) / values.length;
    final variance = values.map((x) => (x - mean) * (x - mean)).reduce((a, b) => a + b) / values.length;
    return variance;
  }

  double _calculateAverage(List<double> values) {
    if (values.isEmpty) return 0.0;
    return values.reduce((a, b) => a + b) / values.length;
  }
}
