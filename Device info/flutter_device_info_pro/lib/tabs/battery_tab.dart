import 'package:flutter/material.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'dart:async';
import '../widgets/info_card.dart';

class BatteryTab extends StatefulWidget {
  const BatteryTab({super.key});

  @override
  State<BatteryTab> createState() => _BatteryTabState();
}

class _BatteryTabState extends State<BatteryTab> with AutomaticKeepAliveClientMixin, TickerProviderStateMixin {
  final Battery _battery = Battery();
  Timer? _refreshTimer;
  
  int _batteryLevel = 0;
  BatteryState _batteryState = BatteryState.unknown;
  List<int> _batteryHistory = [];
  List<double> _voltageHistory = [];
  double _currentVoltage = 0;
  double _powerConsumption = 0;
  bool _isLoading = true;
  
  late AnimationController _chargingController;
  late AnimationController _pulseController;
  late Animation<double> _chargingAnimation;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _chargingController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat(reverse: true);
    
    _chargingAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _chargingController, curve: Curves.easeInOut),
    );
    
    _loadBatteryInfo();
    _startRealTimeUpdates();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _chargingController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _startRealTimeUpdates() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (mounted) {
        _updateBatteryData();
      }
    });
  }

  Future<void> _loadBatteryInfo() async {
    try {
      final level = await _battery.batteryLevel;
      final state = await _battery.batteryState;
      
      if (mounted) {
        setState(() {
          _batteryLevel = level;
          _batteryState = state;
          _isLoading = false;
        });
        
        if (state == BatteryState.charging) {
          _chargingController.repeat();
        } else {
          _chargingController.stop();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _updateBatteryData() async {
    try {
      final level = await _battery.batteryLevel;
      final state = await _battery.batteryState;
      
      if (mounted) {
        setState(() {
          _batteryLevel = level;
          _batteryState = state;
          
          // Add to history
          _batteryHistory.add(level);
          if (_batteryHistory.length > 20) {
            _batteryHistory.removeAt(0);
          }
          
          // Simulate voltage and power consumption data
          _currentVoltage = 3.7 + (level / 100) * 0.5; // Realistic voltage range
          _voltageHistory.add(_currentVoltage);
          if (_voltageHistory.length > 20) {
            _voltageHistory.removeAt(0);
          }
          
          // Calculate power consumption based on battery state
          if (state == BatteryState.charging) {
            _powerConsumption = 5.0 + (level / 100) * 10; // 5-15W while charging
          } else {
            _powerConsumption = 1.0 + (100 - level) / 100 * 3; // 1-4W while discharging
          }
        });
        
        if (state == BatteryState.charging && !_chargingController.isAnimating) {
          _chargingController.repeat();
        } else if (state != BatteryState.charging && _chargingController.isAnimating) {
          _chargingController.stop();
        }
      }
    } catch (e) {
      // Handle error silently
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
      onRefresh: _loadBatteryInfo,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBatteryLevelSection(),
            const SizedBox(height: 16),
            _buildBatteryChartsSection(),
            const SizedBox(height: 16),
            _buildPowerMetricsSection(),
            const SizedBox(height: 16),
            _buildBatteryHealthSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildBatteryLevelSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Battery Status',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        InfoCard(
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: _buildLiquidBatteryIndicator(),
              ),
              const SizedBox(width: 20),
              Expanded(
                flex: 3,
                child: _buildBatteryDetails(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLiquidBatteryIndicator() {
    return Column(
      children: [
        Container(
          height: 150,
          width: 80,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Theme.of(context).colorScheme.outline,
              width: 2,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  color: Colors.grey.withOpacity(0.2),
                ),
                Align(
                  alignment: Alignment.bottomCenter,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 500),
                    height: 150 * (_batteryLevel / 100),
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          _getBatteryColor(),
                          _getBatteryColor().withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                ),
                Text(
                  '$_batteryLevel%',
                  style: TextStyle(
                    color: _batteryLevel > 50 ? Colors.white : Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        if (_batteryState == BatteryState.charging)
          AnimatedBuilder(
            animation: _chargingAnimation,
            builder: (context, child) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1 + _chargingAnimation.value * 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.green),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.bolt_rounded,
                      color: Colors.green,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Charging',
                      style: TextStyle(
                        color: Colors.green,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            },
          )
        else
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _getBatteryStatusColor().withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _getBatteryStatusColor()),
            ),
            child: Text(
              _getBatteryStatusText(),
              style: TextStyle(
                color: _getBatteryStatusColor(),
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildBatteryDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildDetailItem('Level', '$_batteryLevel%', Icons.battery_std_rounded),
        _buildDetailItem('Status', _getBatteryStatusText(), Icons.info_rounded),
        _buildDetailItem('Voltage', '${_currentVoltage.toStringAsFixed(2)}V', Icons.electrical_services_rounded),
        _buildDetailItem('Power', '${_powerConsumption.toStringAsFixed(1)}W', Icons.power_rounded),
        _buildDetailItem('Health', _getBatteryHealthText(), Icons.health_and_safety_rounded),
      ],
    );
  }

  Widget _buildDetailItem(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(icon, size: 14, color: Theme.of(context).colorScheme.primary),
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

  Widget _buildBatteryChartsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Battery History',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildBatteryChart()),
            const SizedBox(width: 12),
            Expanded(child: _buildVoltageChart()),
          ],
        ),
      ],
    );
  }

  Widget _buildBatteryChart() {
    return InfoCard(
      child: Column(
        children: [
          Text(
            'Battery Level',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 120,
            child: _batteryHistory.isEmpty
                ? const Center(child: Text('Collecting data...'))
                : LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: const FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      minX: 0,
                      maxX: _batteryHistory.length.toDouble() - 1,
                      minY: 0,
                      maxY: 100,
                      lineBarsData: [
                        LineChartBarData(
                          spots: _batteryHistory.asMap().entries.map((e) {
                            return FlSpot(e.key.toDouble(), e.value.toDouble());
                          }).toList(),
                          isCurved: true,
                          color: _getBatteryColor(),
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: _getBatteryColor().withOpacity(0.2),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildVoltageChart() {
    return InfoCard(
      child: Column(
        children: [
          Text(
            'Voltage',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 120,
            child: _voltageHistory.isEmpty
                ? const Center(child: Text('Collecting data...'))
                : LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: const FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      minX: 0,
                      maxX: _voltageHistory.length.toDouble() - 1,
                      minY: 3.0,
                      maxY: 4.5,
                      lineBarsData: [
                        LineChartBarData(
                          spots: _voltageHistory.asMap().entries.map((e) {
                            return FlSpot(e.key.toDouble(), e.value);
                          }).toList(),
                          isCurved: true,
                          color: Colors.orange,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: Colors.orange.withOpacity(0.2),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPowerMetricsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Power Metrics',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildPowerGauge()),
            const SizedBox(width: 12),
            Expanded(child: _buildEstimatedTime()),
          ],
        ),
      ],
    );
  }

  Widget _buildPowerGauge() {
    return InfoCard(
      child: Column(
        children: [
          Text(
            'Power Consumption',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          CircularPercentIndicator(
            radius: 40,
            lineWidth: 6,
            percent: (_powerConsumption / 20).clamp(0.0, 1.0),
            center: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${_powerConsumption.toStringAsFixed(1)}W',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            progressColor: _getPowerColor(),
            backgroundColor: _getPowerColor().withOpacity(0.2),
            circularStrokeCap: CircularStrokeCap.round,
          ),
        ],
      ),
    );
  }

  Widget _buildEstimatedTime() {
    return InfoCard(
      child: Column(
        children: [
          Text(
            _batteryState == BatteryState.charging ? 'Time to Full' : 'Time Remaining',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Icon(
            _batteryState == BatteryState.charging ? Icons.schedule_rounded : Icons.timer_rounded,
            size: 32,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 8),
          Text(
            _getEstimatedTime(),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBatteryHealthSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Battery Health',
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
                  _buildHealthIndicator('Health', 85, Icons.health_and_safety_rounded, Colors.green),
                  _buildHealthIndicator('Cycles', 324, Icons.refresh_rounded, Colors.blue),
                  _buildHealthIndicator('Capacity', 92, Icons.battery_full_rounded, Colors.orange),
                ],
              ),
              const SizedBox(height: 20),
              _buildHealthTips(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHealthIndicator(String label, int value, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          '$value${label == 'Health' || label == 'Capacity' ? '%' : ''}',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildHealthTips() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.lightbulb_rounded,
                size: 16,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Text(
                'Battery Tips',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '• Avoid extreme temperatures\n• Don\'t let battery drain completely\n• Use original charger when possible\n• Enable battery optimization',
            style: TextStyle(
              fontSize: 10,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  Color _getBatteryColor() {
    if (_batteryLevel <= 20) return Colors.red;
    if (_batteryLevel <= 50) return Colors.orange;
    return Colors.green;
  }

  Color _getBatteryStatusColor() {
    switch (_batteryState) {
      case BatteryState.charging:
        return Colors.green;
      case BatteryState.discharging:
        return _getBatteryColor();
      case BatteryState.full:
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  String _getBatteryStatusText() {
    switch (_batteryState) {
      case BatteryState.charging:
        return 'Charging';
      case BatteryState.discharging:
        return 'Discharging';
      case BatteryState.full:
        return 'Full';
      case BatteryState.connectedNotCharging:
        return 'Connected';
      default:
        return 'Unknown';
    }
  }

  String _getBatteryHealthText() {
    if (_batteryLevel > 80) return 'Excellent';
    if (_batteryLevel > 60) return 'Good';
    if (_batteryLevel > 40) return 'Fair';
    if (_batteryLevel > 20) return 'Poor';
    return 'Critical';
  }

  Color _getPowerColor() {
    if (_powerConsumption > 15) return Colors.red;
    if (_powerConsumption > 10) return Colors.orange;
    if (_powerConsumption > 5) return Colors.yellow;
    return Colors.green;
  }

  String _getEstimatedTime() {
    if (_batteryState == BatteryState.charging) {
      final remainingPercent = 100 - _batteryLevel;
      final hoursToFull = (remainingPercent / 20).clamp(0.5, 8.0); // Rough estimate
      return '${hoursToFull.toStringAsFixed(1)}h';
    } else {
      final hoursRemaining = (_batteryLevel / 10).clamp(0.5, 12.0); // Rough estimate
      return '${hoursRemaining.toStringAsFixed(1)}h';
    }
  }
}
