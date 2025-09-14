import 'package:flutter/material.dart';
import 'package:flutter_secure_biometrics/flutter_secure_biometrics.dart';

class BiometricRegistrationWidget extends StatefulWidget {
  final String appId;
  final List<BiometricType> requiredBiometrics;

  const BiometricRegistrationWidget({
    super.key,
    required this.appId,
    required this.requiredBiometrics,
  });

  @override
  State<BiometricRegistrationWidget> createState() => _BiometricRegistrationWidgetState();
}

class _BiometricRegistrationWidgetState extends State<BiometricRegistrationWidget> {
  final FlutterSecureBiometrics _biometrics = FlutterSecureBiometrics.instance;
  Map<BiometricType, bool> _registrationStatus = {};
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkRegistrationStatus();
  }

  Future<void> _checkRegistrationStatus() async {
    setState(() {
      _isLoading = true;
    });

    final status = <BiometricType, bool>{};
    for (final type in widget.requiredBiometrics) {
      try {
        final isRegistered = await _biometrics.isAppBiometricRegistered(
          type: type,
          appId: widget.appId,
        );
        status[type] = isRegistered;
      } catch (e) {
        status[type] = false;
      }
    }

    setState(() {
      _registrationStatus = status;
      _isLoading = false;
    });
  }

  Future<void> _registerBiometric(BiometricType type) async {
    try {
      setState(() {
        _isLoading = true;
      });

      final success = await _biometrics.registerAppBiometric(
        type: type,
        appId: widget.appId,
        metadata: {
          'registrationTime': DateTime.now().toIso8601String(),
          'securityLevel': 'maximum',
        },
      );

      if (success) {
        setState(() {
          _registrationStatus[type] = true;
        });
        _showSuccess('${type.displayName} registered successfully');
      } else {
        _showError('Failed to register ${type.displayName}');
      }
    } catch (e) {
      _showError('Registration failed: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _clearBiometric(BiometricType type) async {
    try {
      setState(() {
        _isLoading = true;
      });

      final success = await _biometrics.clearAppBiometric(
        type: type,
        appId: widget.appId,
      );

      if (success) {
        setState(() {
          _registrationStatus[type] = false;
        });
        _showSuccess('${type.displayName} cleared successfully');
      } else {
        _showError('Failed to clear ${type.displayName}');
      }
    } catch (e) {
      _showError('Clear failed: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
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
    if (_isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: CircularProgressIndicator(),
        ),
      );
    }

    final allRegistered = widget.requiredBiometrics.every(
      (type) => _registrationStatus[type] == true,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              allRegistered ? Icons.check_circle : Icons.warning,
              color: allRegistered ? Colors.green : Colors.orange,
            ),
            const SizedBox(width: 8),
            Text(
              'Biometric Registration',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          allRegistered
              ? 'All required biometrics are registered'
              : 'Register required biometrics to continue',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
        const SizedBox(height: 12),
        
        ...widget.requiredBiometrics.map((type) {
          final isRegistered = _registrationStatus[type] == true;
          
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4.0),
            child: Row(
              children: [
                Icon(
                  _getBiometricIcon(type),
                  size: 20,
                  color: isRegistered ? Colors.green : Colors.grey,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    type.displayName,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
                if (isRegistered) ...[
                  Icon(
                    Icons.check_circle,
                    color: Colors.green,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: () => _clearBiometric(type),
                    child: const Text('Clear'),
                  ),
                ] else ...[
                  ElevatedButton(
                    onPressed: () => _registerBiometric(type),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(80, 32),
                    ),
                    child: const Text('Register'),
                  ),
                ],
              ],
            ),
          );
        }).toList(),
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
}
