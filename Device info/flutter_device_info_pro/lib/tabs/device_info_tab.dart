import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/native_device_service.dart';

class DeviceInfoTab extends StatefulWidget {
  const DeviceInfoTab({super.key});

  @override
  State<DeviceInfoTab> createState() => _DeviceInfoTabState();
}

class _DeviceInfoTabState extends State<DeviceInfoTab> with AutomaticKeepAliveClientMixin {
  AndroidDeviceInfo? _androidInfo;
  Map<String, dynamic>? _systemInfo;
  Map<String, dynamic>? _networkInfo;
  bool _isLoading = true;
  bool _hasPhonePermission = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadDeviceInfo();
  }

  Future<void> _requestPermissions() async {
    try {
      final phonePermission = await Permission.phone.request();
      setState(() {
        _hasPhonePermission = phonePermission.isGranted;
      });
    } catch (e) {
      print('Permission request error: $e');
    }
  }

  Future<void> _loadDeviceInfo() async {
    setState(() => _isLoading = true);
    
    try {
      // Request permissions first
      await _requestPermissions();
      
      final deviceInfo = DeviceInfoPlugin();
      final androidInfo = await deviceInfo.androidInfo;
      final systemInfo = await NativeDeviceService.getSystemInfo();
      
      // Network info will be null since getNetworkInfo doesn't exist yet
      Map<String, dynamic>? networkInfo;

      if (mounted) {
        setState(() {
          _androidInfo = androidInfo;
          _systemInfo = systemInfo;
          _networkInfo = networkInfo;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading device info: $e');
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
      return Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue[50]!,
              Colors.purple[50]!,
            ],
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.deepPurple),
              ),
              SizedBox(height: 16),
              Text(
                'Loading Device Information...',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.deepPurple,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.blue[50]!,
            Colors.purple[50]!,
          ],
        ),
      ),
      child: RefreshIndicator(
        onRefresh: _loadDeviceInfo,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeaderSection(),
              const SizedBox(height: 20),
              _buildDeviceIdentitySection(),
              const SizedBox(height: 20),
              _buildNetworkSection(),
              const SizedBox(height: 20),
              _buildSecuritySection(),
              const SizedBox(height: 20),
              _buildSystemSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.deepPurple,
            Colors.indigo,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.deepPurple.withValues(alpha:0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha:0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.smartphone,
              size: 32,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _androidInfo?.model ?? 'Unknown Device',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_androidInfo?.brand ?? 'Unknown'} • ${_androidInfo?.manufacturer ?? 'Unknown'}',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha:0.8),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha:0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Android ${_androidInfo?.version.release ?? 'Unknown'}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceIdentitySection() {
    return _buildSection(
      title: 'Device Identity',
      icon: Icons.fingerprint,
      color: Colors.blue,
      children: [
        _buildInfoCard('Device Name', _androidInfo?.model ?? 'Unknown', Icons.phone_android, Colors.blue),
        _buildInfoCard('Model', _androidInfo?.device ?? 'Unknown', Icons.devices, Colors.indigo),
        _buildInfoCard('Manufacturer', _androidInfo?.manufacturer ?? 'Unknown', Icons.factory, Colors.purple),
        _buildInfoCard('Brand', _androidInfo?.brand ?? 'Unknown', Icons.business, Colors.deepPurple),
        _buildInfoCard('Board', _androidInfo?.board ?? 'Unknown', Icons.developer_board, Colors.teal),
        _buildInfoCard('Hardware', _androidInfo?.hardware ?? 'Unknown', Icons.memory, Colors.orange),
        _buildInfoCard('Android Device ID', _androidInfo?.id ?? 'Unknown', Icons.perm_device_information, Colors.red),
        _buildExpandableCard('Build Fingerprint', _androidInfo?.fingerprint ?? 'Unknown', Icons.fingerprint, Colors.green),
      ],
    );
  }

  Widget _buildNetworkSection() {
    if (!_hasPhonePermission) {
      return _buildPermissionSection();
    }

    return _buildSection(
      title: 'Network & Connectivity',
      icon: Icons.network_cell,
      color: Colors.green,
      children: [
        _buildInfoCard('Device Type', _networkInfo?['deviceType'] ?? 'Unknown', Icons.cell_tower, Colors.green),
        _buildInfoCard('Network Type', _networkInfo?['networkType'] ?? 'Unknown', Icons.network_cell, Colors.blue),
        _buildInfoCard('Network Operator', _networkInfo?['networkOperatorName'] ?? 'Unknown', Icons.sim_card, Colors.orange),
        _buildInfoCard('eSIM Support', _networkInfo?['hasEsim'] == true ? 'Yes' : 'Unknown', Icons.sim_card_outlined, Colors.purple),
        _buildInfoCard('SIM State', _networkInfo?['simState'] ?? 'Unknown', Icons.sim_card_alert, Colors.teal),
        _buildInfoCard('Phone Number', _networkInfo?['phoneNumber'] ?? 'Unknown', Icons.phone, Colors.red),
        _buildInfoCard('Country ISO', _networkInfo?['networkCountryIso'] ?? 'Unknown', Icons.flag, Colors.indigo),
        _buildInfoCard('Signal Strength', _networkInfo?['signalStrength'] != null ? '${_networkInfo!['signalStrength']} dBm' : 'Unknown', Icons.signal_cellular_4_bar, Colors.cyan),
        _buildOperatorsList(),
      ],
    );
  }

  Widget _buildPermissionSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.orange[100]!,
            Colors.red[100]!,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange.withValues(alpha:0.3)),
      ),
      child: Column(
        children: [
          Icon(
            Icons.security,
            size: 48,
            color: Colors.orange[700],
          ),
          const SizedBox(height: 16),
          Text(
            'Phone Permission Required',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.orange[800],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'To display network information, phone permission is required.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.orange[700],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _requestPermissions,
            icon: const Icon(Icons.security),
            label: const Text('Grant Permission'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange[600],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecuritySection() {
    return _buildSection(
      title: 'Security & Build Info',
      icon: Icons.security,
      color: Colors.red,
      children: [
        _buildInfoCard('Security Patch', _androidInfo?.version.securityPatch ?? 'Unknown', Icons.security_update, Colors.red),
        _buildInfoCard('Bootloader', _androidInfo?.bootloader ?? 'Unknown', Icons.power_settings_new, Colors.orange),
        _buildInfoCard('Build ID', _androidInfo?.id ?? 'Unknown', Icons.tag, Colors.purple),
        _buildInfoCard('Build Display', _androidInfo?.display ?? 'Unknown', Icons.info, Colors.blue),
        _buildInfoCard('Build Type', _androidInfo?.type ?? 'Unknown', Icons.category, Colors.green),
        _buildInfoCard('Build Tags', _androidInfo?.tags ?? 'Unknown', Icons.label, Colors.teal),
      ],
    );
  }

  Widget _buildSystemSection() {
    return _buildSection(
      title: 'System Information',
      icon: Icons.computer,
      color: Colors.teal,
      children: [
        _buildInfoCard('Android Version', '${_androidInfo?.version.release} (API ${_androidInfo?.version.sdkInt})', Icons.android, Colors.green),
        _buildInfoCard('Physical Device', _androidInfo?.isPhysicalDevice == true ? 'Yes' : 'No', Icons.smartphone, Colors.blue),
        _buildInfoCard('Supported ABIs', _androidInfo?.supportedAbis.join(', ') ?? 'Unknown', Icons.architecture, Colors.purple),
        _buildInfoCard('64-bit Support', _androidInfo?.supported64BitAbis.isNotEmpty == true ? 'Yes' : 'No', Icons.memory, Colors.orange),
        _buildInfoCard('Build User', _systemInfo?['user'] ?? 'Unknown', Icons.person, Colors.indigo),
        _buildInfoCard('Build Host', _systemInfo?['host'] ?? 'Unknown', Icons.computer, Colors.teal),
      ],
    );
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required Color color,
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha:0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  color.withValues(alpha:0.1),
                  color.withValues(alpha:0.05),
                ],
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha:0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: color,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(children: children),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String label, String value, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withValues(alpha:0.05),
            color.withValues(alpha:0.02),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha:0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha:0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              size: 20,
              color: color,
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
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                SelectableText(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              Clipboard.setData(ClipboardData(text: value));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$label copied to clipboard'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(
                Icons.copy,
                size: 16,
                color: Colors.grey[600],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpandableCard(String label, String value, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withValues(alpha:0.05),
            color.withValues(alpha:0.02),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha:0.2)),
      ),
      child: ExpansionTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha:0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            size: 20,
            color: color,
          ),
        ),
        title: Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          value.length > 50 ? '${value.substring(0, 50)}...' : value,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: SelectableText(
                    value,
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: value));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('$label copied to clipboard'),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Icon(
                      Icons.copy,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOperatorsList() {
    final operators = _networkInfo?['operators'] as List<String>? ?? [];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.cyan.withValues(alpha:0.05),
            Colors.cyan.withValues(alpha:0.02),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.cyan.withValues(alpha:0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.cyan.withValues(alpha:0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.network_cell,
                  size: 20,
                  color: Colors.cyan,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Available Network Operators',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: operators.map((operator) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.cyan.withValues(alpha:0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.cyan.withValues(alpha:0.3)),
              ),
              child: Text(
                operator,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.cyan,
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }
}
