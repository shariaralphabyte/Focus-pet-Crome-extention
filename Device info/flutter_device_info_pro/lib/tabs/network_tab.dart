import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:network_info_plus/network_info_plus.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'dart:async';
import 'dart:math';
import '../widgets/info_card.dart';

class NetworkTab extends StatefulWidget {
  const NetworkTab({super.key});

  @override
  State<NetworkTab> createState() => _NetworkTabState();
}

class _NetworkTabState extends State<NetworkTab> with AutomaticKeepAliveClientMixin, TickerProviderStateMixin {
  final Connectivity _connectivity = Connectivity();
  final NetworkInfo _networkInfo = NetworkInfo();
  
  ConnectivityResult _connectionStatus = ConnectivityResult.none;
  String? _wifiName;
  String? _wifiBSSID;
  String? _wifiIP;
  String? _wifiGateway;
  String? _wifiSubmask;
  int? _wifiSignalStrength;
  
  bool _isLoading = true;
  bool _isSpeedTesting = false;
  double _downloadSpeed = 0;
  double _uploadSpeed = 0;
  List<double> _signalHistory = [];
  List<double> _speedHistory = [];
  
  late AnimationController _waveController;
  late AnimationController _pulseController;
  Timer? _refreshTimer;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();
    
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _loadNetworkInfo();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _waveController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _startAutoRefresh() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (mounted) {
        _loadNetworkInfo();
      }
    });
  }

  Future<void> _loadNetworkInfo() async {
    try {
      final connectivityResults = await _connectivity.checkConnectivity();
      final connectivityResult = connectivityResults.isNotEmpty ? connectivityResults.first : ConnectivityResult.none;
      
      String? wifiName;
      String? wifiBSSID;
      String? wifiIP;
      String? wifiGateway;
      String? wifiSubmask;
      
      if (connectivityResult == ConnectivityResult.wifi) {
        wifiName = await _networkInfo.getWifiName();
        wifiBSSID = await _networkInfo.getWifiBSSID();
        wifiIP = await _networkInfo.getWifiIP();
        wifiGateway = await _networkInfo.getWifiGatewayIP();
        wifiSubmask = await _networkInfo.getWifiSubmask();
      }

      if (mounted) {
        setState(() {
          _connectionStatus = connectivityResult;
          _wifiName = wifiName;
          _wifiBSSID = wifiBSSID;
          _wifiIP = wifiIP;
          _wifiGateway = wifiGateway;
          _wifiSubmask = wifiSubmask;
          _isLoading = false;
          
          // Simulate signal strength
          if (connectivityResult == ConnectivityResult.wifi) {
            _wifiSignalStrength = -30 - Random().nextInt(40); // -30 to -70 dBm
            _signalHistory.add(_wifiSignalStrength!.abs().toDouble());
            if (_signalHistory.length > 20) {
              _signalHistory.removeAt(0);
            }
          }
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

  Future<void> _runSpeedTest() async {
    setState(() {
      _isSpeedTesting = true;
      _downloadSpeed = 0;
      _uploadSpeed = 0;
    });

    // Simulate speed test
    for (int i = 0; i <= 100; i += 5) {
      if (!mounted || !_isSpeedTesting) break;
      
      await Future.delayed(const Duration(milliseconds: 100));
      
      setState(() {
        _downloadSpeed = (Random().nextDouble() * 100 + 10); // 10-110 Mbps
        _uploadSpeed = (Random().nextDouble() * 50 + 5); // 5-55 Mbps
      });
    }

    if (mounted) {
      setState(() {
        _isSpeedTesting = false;
        _speedHistory.add(_downloadSpeed);
        if (_speedHistory.length > 10) {
          _speedHistory.removeAt(0);
        }
      });
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
      onRefresh: _loadNetworkInfo,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildConnectionStatusSection(),
            const SizedBox(height: 16),
            _buildNetworkDetailsSection(),
            const SizedBox(height: 16),
            _buildSpeedTestSection(),
            const SizedBox(height: 16),
            _buildSignalAnalyzerSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionStatusSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Connection Status',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: _buildConnectionIndicator(),
              ),
              const SizedBox(width: 20),
              Expanded(
                flex: 3,
                child: _buildConnectionDetails(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildConnectionIndicator() {
    return Column(
      children: [
        AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _getConnectionColor().withOpacity(0.1 + _pulseController.value * 0.2),
                border: Border.all(
                  color: _getConnectionColor(),
                  width: 2,
                ),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Icon(
                    _getConnectionIcon(),
                    size: 32,
                    color: _getConnectionColor(),
                  ),
                  if (_connectionStatus == ConnectivityResult.wifi)
                    AnimatedBuilder(
                      animation: _waveController,
                      builder: (context, child) {
                        return CustomPaint(
                          size: const Size(80, 80),
                          painter: WifiWavePainter(
                            _waveController.value,
                            _getSignalStrength(),
                          ),
                        );
                      },
                    ),
                ],
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _getConnectionColor().withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _getConnectionColor()),
          ),
          child: Text(
            _getConnectionStatusText(),
            style: TextStyle(
              color: _getConnectionColor(),
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConnectionDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildDetailRow('Type', _getConnectionTypeText(), Icons.network_check_rounded),
        if (_connectionStatus == ConnectivityResult.wifi) ...[
          _buildDetailRow('Network', _wifiName ?? 'Unknown', Icons.wifi_rounded),
          _buildDetailRow('Signal', '${_wifiSignalStrength ?? 0} dBm', Icons.signal_wifi_4_bar_rounded),
          _buildDetailRow('IP Address', _wifiIP ?? 'Unknown', Icons.location_on_rounded),
        ] else if (_connectionStatus == ConnectivityResult.mobile) ...[
          _buildDetailRow('Carrier', 'Mobile Network', Icons.cell_tower_rounded),
          _buildDetailRow('Type', '4G/5G', Icons.network_cell_rounded),
        ],
        _buildDetailRow('Status', _connectionStatus != ConnectivityResult.none ? 'Connected' : 'Disconnected', Icons.info_rounded),
      ],
    );
  }

  Widget _buildNetworkDetailsSection() {
    if (_connectionStatus == ConnectivityResult.none) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Network Details',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              if (_connectionStatus == ConnectivityResult.wifi) ...[
                _buildNetworkDetailRow('SSID', _wifiName ?? 'Unknown', Icons.wifi_rounded),
                _buildNetworkDetailRow('BSSID', _wifiBSSID ?? 'Unknown', Icons.router_rounded),
                _buildNetworkDetailRow('IP Address', _wifiIP ?? 'Unknown', Icons.location_on_rounded),
                _buildNetworkDetailRow('Gateway', _wifiGateway ?? 'Unknown', Icons.router_rounded),
                _buildNetworkDetailRow('Subnet Mask', _wifiSubmask ?? 'Unknown', Icons.network_check_rounded),
                _buildNetworkDetailRow('DNS', '8.8.8.8, 8.8.4.4', Icons.dns_rounded),
              ] else if (_connectionStatus == ConnectivityResult.mobile) ...[
                _buildNetworkDetailRow('Network Type', 'Mobile Data', Icons.cell_tower_rounded),
                _buildNetworkDetailRow('Technology', '4G LTE', Icons.network_cell_rounded),
                _buildNetworkDetailRow('Carrier', 'Mobile Carrier', Icons.sim_card_rounded),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSpeedTestSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Speed Test',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildSpeedGauge('Download', _downloadSpeed, Colors.green),
                  _buildSpeedGauge('Upload', _uploadSpeed, Colors.blue),
                ],
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _isSpeedTesting ? null : _runSpeedTest,
                icon: Icon(_isSpeedTesting ? Icons.stop_rounded : Icons.speed_rounded),
                label: Text(_isSpeedTesting ? 'Testing...' : 'Start Speed Test'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isSpeedTesting ? Colors.orange : Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
              if (_speedHistory.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text(
                  'Speed History',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 100,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: const FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      minX: 0,
                      maxX: _speedHistory.length.toDouble() - 1,
                      minY: 0,
                      maxY: _speedHistory.isEmpty ? 100 : _speedHistory.reduce(max),
                      lineBarsData: [
                        LineChartBarData(
                          spots: _speedHistory.asMap().entries.map((e) {
                            return FlSpot(e.key.toDouble(), e.value);
                          }).toList(),
                          isCurved: true,
                          color: Colors.blue,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: Colors.blue.withOpacity(0.2),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSignalAnalyzerSection() {
    if (_connectionStatus != ConnectivityResult.wifi) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'WiFi Signal Analyzer',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildSignalStrengthIndicator(),
                  _buildSignalQualityIndicator(),
                ],
              ),
              const SizedBox(height: 20),
              if (_signalHistory.isNotEmpty) ...[
                Text(
                  'Signal Strength History',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 100,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: const FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      minX: 0,
                      maxX: _signalHistory.length.toDouble() - 1,
                      minY: 0,
                      maxY: 100,
                      lineBarsData: [
                        LineChartBarData(
                          spots: _signalHistory.asMap().entries.map((e) {
                            return FlSpot(e.key.toDouble(), e.value);
                          }).toList(),
                          isCurved: true,
                          color: _getSignalColor(),
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: _getSignalColor().withOpacity(0.2),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Icon(icon, size: 12, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNetworkDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
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
                const SizedBox(height: 2),
                SelectableText(
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

  Widget _buildSpeedGauge(String label, double speed, Color color) {
    return Column(
      children: [
        CircularPercentIndicator(
          radius: 40,
          lineWidth: 6,
          percent: (speed / 100).clamp(0.0, 1.0),
          center: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '${speed.toInt()}',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Mbps',
                style: TextStyle(
                  fontSize: 8,
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                ),
              ),
            ],
          ),
          progressColor: color,
          backgroundColor: color.withOpacity(0.2),
          circularStrokeCap: CircularStrokeCap.round,
          animation: true,
          animationDuration: 1000,
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildSignalStrengthIndicator() {
    final strength = _getSignalStrength();
    
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _getSignalColor().withOpacity(0.1),
            border: Border.all(color: _getSignalColor(), width: 2),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.signal_wifi_4_bar_rounded,
                color: _getSignalColor(),
                size: 24,
              ),
              Text(
                '${strength.toInt()}%',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: _getSignalColor(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Signal Strength',
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildSignalQualityIndicator() {
    final quality = _getSignalQuality();
    
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _getQualityColor(quality).withOpacity(0.1),
            border: Border.all(color: _getQualityColor(quality), width: 2),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.network_check_rounded,
                color: _getQualityColor(quality),
                size: 24,
              ),
              Text(
                quality,
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                  color: _getQualityColor(quality),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Signal Quality',
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Color _getConnectionColor() {
    switch (_connectionStatus) {
      case ConnectivityResult.wifi:
        return Colors.green;
      case ConnectivityResult.mobile:
        return Colors.blue;
      case ConnectivityResult.ethernet:
        return Colors.orange;
      default:
        return Colors.red;
    }
  }

  IconData _getConnectionIcon() {
    switch (_connectionStatus) {
      case ConnectivityResult.wifi:
        return Icons.wifi_rounded;
      case ConnectivityResult.mobile:
        return Icons.cell_tower_rounded;
      case ConnectivityResult.ethernet:
        return Icons.cable_rounded;
      default:
        return Icons.wifi_off_rounded;
    }
  }

  String _getConnectionStatusText() {
    switch (_connectionStatus) {
      case ConnectivityResult.wifi:
        return 'WiFi Connected';
      case ConnectivityResult.mobile:
        return 'Mobile Data';
      case ConnectivityResult.ethernet:
        return 'Ethernet';
      default:
        return 'Disconnected';
    }
  }

  String _getConnectionTypeText() {
    switch (_connectionStatus) {
      case ConnectivityResult.wifi:
        return 'WiFi';
      case ConnectivityResult.mobile:
        return 'Mobile Data';
      case ConnectivityResult.ethernet:
        return 'Ethernet';
      default:
        return 'None';
    }
  }

  double _getSignalStrength() {
    if (_wifiSignalStrength == null) return 0;
    // Convert dBm to percentage (rough approximation)
    final dbm = _wifiSignalStrength!.abs();
    if (dbm <= 30) return 100;
    if (dbm <= 40) return 80;
    if (dbm <= 50) return 60;
    if (dbm <= 60) return 40;
    if (dbm <= 70) return 20;
    return 10;
  }

  Color _getSignalColor() {
    final strength = _getSignalStrength();
    if (strength >= 80) return Colors.green;
    if (strength >= 60) return Colors.orange;
    return Colors.red;
  }

  String _getSignalQuality() {
    final strength = _getSignalStrength();
    if (strength >= 80) return 'Excellent';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Fair';
    return 'Poor';
  }

  Color _getQualityColor(String quality) {
    switch (quality) {
      case 'Excellent':
        return Colors.green;
      case 'Good':
        return Colors.lightGreen;
      case 'Fair':
        return Colors.orange;
      default:
        return Colors.red;
    }
  }
}

class WifiWavePainter extends CustomPainter {
  final double animationValue;
  final double signalStrength;

  WifiWavePainter(this.animationValue, this.signalStrength);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.green.withOpacity(0.3)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;

    // Draw concentric circles representing wifi waves
    for (int i = 1; i <= 3; i++) {
      final radius = (maxRadius * i / 3) * (signalStrength / 100);
      final opacity = (1 - (animationValue + i * 0.2) % 1).clamp(0.0, 1.0);
      paint.color = Colors.green.withOpacity(opacity * 0.5);
      canvas.drawCircle(center, radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
