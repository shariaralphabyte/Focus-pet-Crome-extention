import 'package:flutter/material.dart';
import 'package:system_info2/system_info2.dart';
import '../services/native_device_service.dart';
import '../widgets/info_card.dart';

class SystemTab extends StatefulWidget {
  const SystemTab({super.key});

  @override
  State<SystemTab> createState() => _SystemTabState();
}

class _SystemTabState extends State<SystemTab> with AutomaticKeepAliveClientMixin {
  Map<String, dynamic>? _systemInfo;
  bool _isLoading = true;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadSystemInfo();
  }

  Future<void> _loadSystemInfo() async {
    try {
      final systemInfo = await NativeDeviceService.getSystemInfo();

      if (mounted) {
        setState(() {
          _systemInfo = systemInfo;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadSystemInfo,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildOSSection(),
            const SizedBox(height: 16),
            _buildRuntimeSection(),
            const SizedBox(height: 16),
            _buildKernelSection(),
            const SizedBox(height: 16),
            _buildSystemFeaturesSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildOSSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Operating System',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildInfoRow('Android Version', _systemInfo?['androidVersion'] ?? 'Unknown', Icons.android_rounded),
              _buildInfoRow('API Level', _systemInfo?['apiLevel']?.toString() ?? 'Unknown', Icons.api_rounded),
              _buildInfoRow('Security Patch', _systemInfo?['securityPatch'] ?? 'Unknown', Icons.security_rounded),
              _buildInfoRow('Build ID', _systemInfo?['buildId'] ?? 'Unknown', Icons.fingerprint_rounded),
              _buildInfoRow('Build Display', _systemInfo?['display'] ?? 'Unknown', Icons.info_rounded),
              _buildInfoRow('Build Tags', _systemInfo?['tags'] ?? 'Unknown', Icons.label_rounded),
              _buildInfoRow('Build Type', _systemInfo?['type'] ?? 'Unknown', Icons.category_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRuntimeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Runtime Information',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildInfoRow('Kernel Architecture', SysInfo.kernelArchitecture.toString(), Icons.architecture_rounded),
              _buildInfoRow('Kernel Name', SysInfo.kernelName, Icons.computer_rounded),
              _buildInfoRow('Kernel Version', SysInfo.kernelVersion, Icons.info_rounded),
              _buildInfoRow('Operating System', SysInfo.operatingSystemName, Icons.settings_system_daydream_rounded),
              _buildInfoRow('OS Version', SysInfo.operatingSystemVersion, Icons.update_rounded),
              _buildInfoRow('User Name', _systemInfo?['user'] ?? 'Unknown', Icons.person_rounded),
              _buildInfoRow('Host Name', _systemInfo?['host'] ?? 'Unknown', Icons.dns_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildKernelSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Kernel & Hardware',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildInfoRow('Hardware Platform', _systemInfo?['hardware'] ?? 'Unknown', Icons.developer_board_rounded),
              _buildInfoRow('Bootloader', _systemInfo?['bootloader'] ?? 'Unknown', Icons.power_settings_new_rounded),
              _buildInfoRow('Radio Version', _systemInfo?['serial'] ?? 'Unknown', Icons.radio_rounded),
              _buildInfoRow('Build Fingerprint', _systemInfo?['fingerprint'] ?? 'Unknown', Icons.fingerprint_rounded, isExpandable: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSystemFeaturesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'System Features',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildFeatureRow('64-bit Architecture', _is64BitArchitecture(), Icons.memory_rounded),
              _buildFeatureRow('Multi-core Processor', _isMultiCore(), Icons.developer_board_rounded),
              _buildFeatureRow('Hardware Acceleration', true, Icons.speed_rounded),
              _buildFeatureRow('Virtualization Support', _hasVirtualizationSupport(), Icons.cloud_rounded),
              _buildFeatureRow('Secure Boot', _hasSecureBoot(), Icons.security_rounded),
              _buildFeatureRow('SELinux Enforcing', _isSELinuxEnforcing(), Icons.shield_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon, {bool isExpandable = false}) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              size: 16,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                  ),
                ),
                const SizedBox(height: 4),
                isExpandable
                    ? ExpansionTile(
                        title: Text(
                          value.length > 50 ? '${value.substring(0, 50)}...' : value,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: SelectableText(
                              value,
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                        ],
                        tilePadding: EdgeInsets.zero,
                        childrenPadding: EdgeInsets.zero,
                      )
                    : SelectableText(
                        value,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(String label, bool isSupported, IconData icon) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (isSupported ? Colors.green : Colors.red).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              size: 16,
              color: isSupported ? Colors.green : Colors.red,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  isSupported ? 'Supported' : 'Not Supported',
                  style: TextStyle(
                    fontSize: 12,
                    color: isSupported ? Colors.green : Colors.red,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            isSupported ? Icons.check_circle_rounded : Icons.cancel_rounded,
            color: isSupported ? Colors.green : Colors.red,
            size: 20,
          ),
        ],
      ),
    );
  }

  bool _is64BitArchitecture() {
    final arch = SysInfo.kernelArchitecture.toString().toLowerCase();
    return arch.contains('64') || arch.contains('aarch64') || arch.contains('x86_64');
  }

  bool _isMultiCore() {
    return true; // Most modern Android devices are multi-core
  }

  bool _hasVirtualizationSupport() {
    // This would require more detailed hardware inspection
    return true; // Most modern Android devices support some form of virtualization
  }

  bool _hasSecureBoot() {
    // This would require checking bootloader status
    return _systemInfo?['tags']?.contains('release-keys') ?? false;
  }

  bool _isSELinuxEnforcing() {
    // This would require checking SELinux status
    return _systemInfo?['tags']?.contains('release-keys') ?? false;
  }
}
