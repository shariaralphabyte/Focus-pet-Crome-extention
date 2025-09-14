import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:async';
import 'dart:math';
import '../services/native_device_service.dart';
import '../widgets/info_card.dart';

class SensorsTab extends StatefulWidget {
  const SensorsTab({super.key});

  @override
  State<SensorsTab> createState() => _SensorsTabState();
}

class _SensorsTabState extends State<SensorsTab> with AutomaticKeepAliveClientMixin, TickerProviderStateMixin {
  List<Map<String, dynamic>> _sensorList = [];
  bool _isLoading = true;
  
  // Sensor data streams
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;
  StreamSubscription<GyroscopeEvent>? _gyroscopeSubscription;
  StreamSubscription<MagnetometerEvent>? _magnetometerSubscription;
  
  // Current sensor values
  AccelerometerEvent? _accelerometerEvent;
  GyroscopeEvent? _gyroscopeEvent;
  MagnetometerEvent? _magnetometerEvent;
  
  // Historical data for charts
  List<double> _accelerometerHistory = [];
  List<double> _gyroscopeHistory = [];
  List<double> _magnetometerHistory = [];
  
  // Animation controllers
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  
  bool _sensorsActive = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();
    
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _loadSensorInfo();
  }

  @override
  void dispose() {
    _stopSensorStreams();
    _rotationController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _loadSensorInfo() async {
    try {
      final sensorList = await NativeDeviceService.getSensorList();
      
      if (mounted) {
        setState(() {
          _sensorList = sensorList;
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

  void _startSensorStreams() {
    _accelerometerSubscription = accelerometerEvents.listen((event) {
      if (mounted) {
        setState(() {
          _accelerometerEvent = event;
          final magnitude = sqrt(event.x * event.x + event.y * event.y + event.z * event.z);
          _accelerometerHistory.add(magnitude);
          if (_accelerometerHistory.length > 50) {
            _accelerometerHistory.removeAt(0);
          }
        });
      }
    });

    _gyroscopeSubscription = gyroscopeEvents.listen((event) {
      if (mounted) {
        setState(() {
          _gyroscopeEvent = event;
          final magnitude = sqrt(event.x * event.x + event.y * event.y + event.z * event.z);
          _gyroscopeHistory.add(magnitude);
          if (_gyroscopeHistory.length > 50) {
            _gyroscopeHistory.removeAt(0);
          }
        });
      }
    });

    _magnetometerSubscription = magnetometerEvents.listen((event) {
      if (mounted) {
        setState(() {
          _magnetometerEvent = event;
          final magnitude = sqrt(event.x * event.x + event.y * event.y + event.z * event.z);
          _magnetometerHistory.add(magnitude);
          if (_magnetometerHistory.length > 50) {
            _magnetometerHistory.removeAt(0);
          }
        });
      }
    });
  }

  void _stopSensorStreams() {
    _accelerometerSubscription?.cancel();
    _gyroscopeSubscription?.cancel();
    _magnetometerSubscription?.cancel();
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
      onRefresh: _loadSensorInfo,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSensorControlSection(),
            const SizedBox(height: 16),
            _buildRealTimeSensorSection(),
            const SizedBox(height: 16),
            _buildSensorChartsSection(),
            const SizedBox(height: 16),
            _buildAvailableSensorsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildSensorControlSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sensor Monitoring',
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
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _sensorsActive = !_sensorsActive;
                        if (_sensorsActive) {
                          _startSensorStreams();
                        } else {
                          _stopSensorStreams();
                        }
                      });
                    },
                    icon: Icon(_sensorsActive ? Icons.stop_rounded : Icons.play_arrow_rounded),
                    label: Text(_sensorsActive ? 'Stop Monitoring' : 'Start Monitoring'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _sensorsActive ? Colors.red : Colors.green,
                      foregroundColor: Colors.white,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _accelerometerHistory.clear();
                        _gyroscopeHistory.clear();
                        _magnetometerHistory.clear();
                      });
                    },
                    icon: const Icon(Icons.clear_rounded),
                    label: const Text('Clear Data'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: (_sensorsActive ? Colors.green : Colors.grey).withOpacity(0.1 + _pulseController.value * 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: _sensorsActive ? Colors.green : Colors.grey,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _sensorsActive ? Icons.sensors_rounded : Icons.sensors_off_rounded,
                          color: _sensorsActive ? Colors.green : Colors.grey,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _sensorsActive ? 'Sensors Active' : 'Sensors Inactive',
                          style: TextStyle(
                            color: _sensorsActive ? Colors.green : Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRealTimeSensorSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Real-time Sensor Data',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.2,
          children: [
            _buildSensorCard(
              'Accelerometer',
              Icons.speed_rounded,
              _accelerometerEvent != null
                  ? 'X: ${_accelerometerEvent!.x.toStringAsFixed(2)}\nY: ${_accelerometerEvent!.y.toStringAsFixed(2)}\nZ: ${_accelerometerEvent!.z.toStringAsFixed(2)}'
                  : 'No data',
              Colors.blue,
            ),
            _buildSensorCard(
              'Gyroscope',
              Icons.rotate_right_rounded,
              _gyroscopeEvent != null
                  ? 'X: ${_gyroscopeEvent!.x.toStringAsFixed(2)}\nY: ${_gyroscopeEvent!.y.toStringAsFixed(2)}\nZ: ${_gyroscopeEvent!.z.toStringAsFixed(2)}'
                  : 'No data',
              Colors.orange,
            ),
            _buildSensorCard(
              'Magnetometer',
              Icons.explore_rounded,
              _magnetometerEvent != null
                  ? 'X: ${_magnetometerEvent!.x.toStringAsFixed(2)}\nY: ${_magnetometerEvent!.y.toStringAsFixed(2)}\nZ: ${_magnetometerEvent!.z.toStringAsFixed(2)}'
                  : 'No data',
              Colors.green,
            ),
            _buildCompassCard(),
          ],
        ),
      ],
    );
  }

  Widget _buildSensorCard(String title, IconData icon, String data, Color color) {
    return InfoCard(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            data,
            style: const TextStyle(fontSize: 10),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildCompassCard() {
    double heading = 0;
    if (_magnetometerEvent != null) {
      heading = atan2(_magnetometerEvent!.y, _magnetometerEvent!.x) * (180 / pi);
      if (heading < 0) heading += 360;
    }

    return InfoCard(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.red, width: 2),
                ),
              ),
              Transform.rotate(
                angle: heading * (pi / 180),
                child: Icon(
                  Icons.navigation_rounded,
                  color: Colors.red,
                  size: 30,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Compass',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${heading.toInt()}°',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildSensorChartsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sensor History Charts',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Column(
          children: [
            _buildSensorChart('Accelerometer', _accelerometerHistory, Colors.blue),
            const SizedBox(height: 12),
            _buildSensorChart('Gyroscope', _gyroscopeHistory, Colors.orange),
            const SizedBox(height: 12),
            _buildSensorChart('Magnetometer', _magnetometerHistory, Colors.green),
          ],
        ),
      ],
    );
  }

  Widget _buildSensorChart(String title, List<double> data, Color color) {
    return InfoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 100,
            child: data.isEmpty
                ? Center(
                    child: Text(
                      'No data available',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  )
                : LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: const FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      minX: 0,
                      maxX: data.length.toDouble() - 1,
                      minY: data.isEmpty ? 0 : data.reduce(min),
                      maxY: data.isEmpty ? 10 : data.reduce(max),
                      lineBarsData: [
                        LineChartBarData(
                          spots: data.asMap().entries.map((e) {
                            return FlSpot(e.key.toDouble(), e.value);
                          }).toList(),
                          isCurved: true,
                          color: color,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: color.withOpacity(0.2),
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

  Widget _buildAvailableSensorsSection() {
    final sensors = _sensorList;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Available Sensors (${sensors.length})',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: sensors.isEmpty
              ? const Center(
                  child: Text('No sensor information available'),
                )
              : Column(
                  children: sensors.map<Widget>((sensor) {
                    return _buildSensorListItem(sensor);
                  }).toList(),
                ),
        ),
      ],
    );
  }

  Widget _buildSensorListItem(Map<String, dynamic> sensor) {
    final name = sensor['name'] ?? 'Unknown Sensor';
    final vendor = sensor['vendor'] ?? 'Unknown';
    final type = sensor['type'] ?? 0;
    final power = sensor['power'] ?? 0.0;
    final maxRange = sensor['maxRange'] ?? 0.0;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ExpansionTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _getSensorTypeColor(type).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getSensorTypeIcon(type),
            size: 20,
            color: _getSensorTypeColor(type),
          ),
        ),
        title: Text(
          name,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          vendor,
          style: TextStyle(
            fontSize: 12,
            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSensorDetail('Type ID', type.toString()),
                _buildSensorDetail('Power Consumption', '${power.toStringAsFixed(2)} mA'),
                _buildSensorDetail('Maximum Range', maxRange.toStringAsFixed(2)),
                _buildSensorDetail('Resolution', (sensor['resolution'] ?? 0.0).toStringAsFixed(4)),
                _buildSensorDetail('Version', (sensor['version'] ?? 0).toString()),
                _buildSensorDetail('Min Delay', '${sensor['minDelay'] ?? 0} μs'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSensorDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getSensorTypeIcon(int type) {
    switch (type) {
      case 1: return Icons.speed_rounded; // Accelerometer
      case 2: return Icons.explore_rounded; // Magnetic field
      case 4: return Icons.rotate_right_rounded; // Gyroscope
      case 5: return Icons.wb_sunny_rounded; // Light
      case 6: return Icons.straighten_rounded; // Pressure
      case 8: return Icons.place_rounded; // Proximity
      case 9: return Icons.grain_rounded; // Gravity
      case 10: return Icons.trending_up_rounded; // Linear acceleration
      case 11: return Icons.rotate_90_degrees_ccw_rounded; // Rotation vector
      case 13: return Icons.thermostat_rounded; // Ambient temperature
      default: return Icons.sensors_rounded;
    }
  }

  Color _getSensorTypeColor(int type) {
    switch (type) {
      case 1: return Colors.blue; // Accelerometer
      case 2: return Colors.green; // Magnetic field
      case 4: return Colors.orange; // Gyroscope
      case 5: return Colors.yellow; // Light
      case 6: return Colors.purple; // Pressure
      case 8: return Colors.red; // Proximity
      case 9: return Colors.teal; // Gravity
      case 10: return Colors.indigo; // Linear acceleration
      case 11: return Colors.pink; // Rotation vector
      case 13: return Colors.deepOrange; // Ambient temperature
      default: return Colors.grey;
    }
  }
}
