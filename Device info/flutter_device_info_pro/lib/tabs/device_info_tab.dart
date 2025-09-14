import 'package:flutter/material.dart';
import 'package:device_info_plus/device_info_plus.dart';
import '../services/native_device_service.dart';
import '../widgets/info_card.dart';

class DeviceInfoTab extends StatefulWidget {
  const DeviceInfoTab({super.key});

  @override
  State<DeviceInfoTab> createState() => _DeviceInfoTabState();
}

class _DeviceInfoTabState extends State<DeviceInfoTab> with AutomaticKeepAliveClientMixin {
  AndroidDeviceInfo? _androidInfo;
  Map<String, dynamic>? _systemInfo;
  bool _isLoading = true;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadDeviceInfo();
  }

  Future<void> _loadDeviceInfo() async {
    try {
      final deviceInfo = DeviceInfoPlugin();
      final androidInfo = await deviceInfo.androidInfo;
      final systemInfo = await NativeDeviceService.getSystemInfo();

      if (mounted) {
        setState(() {
          _androidInfo = androidInfo;
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
      onRefresh: _loadDeviceInfo,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDeviceIdentitySection(),
            const SizedBox(height: 16),
            _buildHardwareSection(),
            const SizedBox(height: 16),
            _buildBuildInfoSection(),
            const SizedBox(height: 16),
            _buildSecuritySection(),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceIdentitySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Device Identity',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildInfoRow('Brand', _androidInfo?.brand ?? 'Unknown', Icons.business_rounded),
              _buildInfoRow('Manufacturer', _androidInfo?.manufacturer ?? 'Unknown', Icons.factory_rounded),
              _buildInfoRow('Model', _androidInfo?.model ?? 'Unknown', Icons.phone_android_rounded),
              _buildInfoRow('Device', _androidInfo?.device ?? 'Unknown', Icons.devices_rounded),
              _buildInfoRow('Product', _androidInfo?.product ?? 'Unknown', Icons.inventory_rounded),
              _buildInfoRow('Board', _androidInfo?.board ?? 'Unknown', Icons.developer_board_rounded),
              _buildInfoRow('Hardware', _androidInfo?.hardware ?? 'Unknown', Icons.memory_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHardwareSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Hardware Information',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildInfoRow('Supported ABIs', _androidInfo?.supportedAbis.join(', ') ?? 'Unknown', Icons.architecture_rounded),
              _buildInfoRow('Supported 32-bit ABIs', _androidInfo?.supported32BitAbis.join(', ') ?? 'Unknown', Icons.memory_rounded),
              _buildInfoRow('Supported 64-bit ABIs', _androidInfo?.supported64BitAbis.join(', ') ?? 'Unknown', Icons.memory_rounded),
              _buildInfoRow('Physical Device', _androidInfo?.isPhysicalDevice == true ? 'Yes' : 'No', Icons.smartphone_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBuildInfoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Build Information',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildInfoRow('Android Version', '${_androidInfo?.version.release} (API ${_androidInfo?.version.sdkInt})', Icons.android_rounded),
              _buildInfoRow('Build ID', _androidInfo?.id ?? 'Unknown', Icons.fingerprint_rounded),
              _buildInfoRow('Build Display', _androidInfo?.display ?? 'Unknown', Icons.info_rounded),
              _buildInfoRow('Build Tags', _androidInfo?.tags ?? 'Unknown', Icons.label_rounded),
              _buildInfoRow('Build Type', _androidInfo?.type ?? 'Unknown', Icons.category_rounded),
              _buildInfoRow('Build User', _systemInfo?['user'] ?? 'Unknown', Icons.person_rounded),
              _buildInfoRow('Build Host', _systemInfo?['host'] ?? 'Unknown', Icons.computer_rounded),
              _buildInfoRow('Build Time', _formatBuildTime(_systemInfo?['buildTime']), Icons.schedule_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSecuritySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Security Information',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildInfoRow('Security Patch', _androidInfo?.version.securityPatch ?? 'Unknown', Icons.security_rounded),
              _buildInfoRow('Bootloader', _androidInfo?.bootloader ?? 'Unknown', Icons.power_settings_new_rounded),
              _buildInfoRow('Fingerprint', _androidInfo?.fingerprint ?? 'Unknown', Icons.fingerprint_rounded, isExpandable: true),
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

  String _formatBuildTime(dynamic buildTime) {
    if (buildTime == null) return 'Unknown';
    try {
      final dateTime = DateTime.fromMillisecondsSinceEpoch(buildTime);
      return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Unknown';
    }
  }
}
