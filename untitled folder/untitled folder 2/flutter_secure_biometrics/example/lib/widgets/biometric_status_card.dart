import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class BiometricStatusCard extends StatelessWidget {
  final bool isAvailable;
  final List<BiometricType> availableBiometrics;

  const BiometricStatusCard({
    super.key,
    required this.isAvailable,
    required this.availableBiometrics,
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
                  isAvailable ? Icons.check_circle : Icons.error,
                  color: isAvailable ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(
                  'Biometric Status',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              isAvailable 
                  ? 'Biometric authentication is available'
                  : 'Biometric authentication is not available',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (availableBiometrics.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                'Available Biometrics:',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: availableBiometrics.map((type) {
                  return Chip(
                    avatar: Icon(
                      _getBiometricIcon(type),
                      size: 18,
                    ),
                    label: Text(type.displayName),
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
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
}
