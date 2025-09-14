import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
// Removed syncfusion dependency - using custom gauge implementation
import 'dart:math' as math;
import '../providers/device_data_provider.dart';
import '../widgets/info_card.dart';
import '../widgets/animated_thermometer.dart';
import '../widgets/wave_animation.dart';

class CpuTab extends StatefulWidget {
  const CpuTab({super.key});

  @override
  State<CpuTab> createState() => _CpuTabState();
}

// Custom circular gauge painter to replace Syncfusion dependency
class CircularGaugePainter extends CustomPainter {
  final double value;
  final Color color;

  CircularGaugePainter({required this.value, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 10;
    
    // Background circle
    final backgroundPaint = Paint()
      ..color = Colors.grey.withValues(alpha: 0.2)
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    canvas.drawCircle(center, radius, backgroundPaint);
    
    // Progress arc
    final progressPaint = Paint()
      ..color = color
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    final sweepAngle = (value / 100) * 2 * math.pi;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

// Custom CPU fan painter with ship-like rotating blades
class CpuFanPainter extends CustomPainter {
  final double rotation;
  final double usage;

  CpuFanPainter({required this.rotation, required this.usage});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 5;
    
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(rotation);
    
    // Fan hub (center circle)
    final hubPaint = Paint()
      ..color = Colors.grey[800]!
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset.zero, radius * 0.2, hubPaint);
    
    // Fan blades (ship-like curved blades)
    final bladePaint = Paint()
      ..color = _getFanColor(usage)
      ..style = PaintingStyle.fill;
    
    for (int i = 0; i < 6; i++) {
      final angle = (i * math.pi * 2) / 6;
      canvas.save();
      canvas.rotate(angle);
      
      // Create curved blade path
      final path = Path();
      path.moveTo(radius * 0.2, 0);
      path.quadraticBezierTo(
        radius * 0.6, -radius * 0.15,
        radius * 0.85, -radius * 0.05
      );
      path.quadraticBezierTo(
        radius * 0.9, 0,
        radius * 0.85, radius * 0.05
      );
      path.quadraticBezierTo(
        radius * 0.6, radius * 0.15,
        radius * 0.2, 0
      );
      path.close();
      
      canvas.drawPath(path, bladePaint);
      canvas.restore();
    }
    
    // Center dot
    final centerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset.zero, radius * 0.08, centerPaint);
    
    canvas.restore();
  }
  
  Color _getFanColor(double usage) {
    if (usage < 30) return Colors.blue;
    if (usage < 60) return Colors.green;
    if (usage < 80) return Colors.orange;
    return Colors.red;
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _CpuTabState extends State<CpuTab> with TickerProviderStateMixin, AutomaticKeepAliveClientMixin {
  late AnimationController _fanController;
  late AnimationController _pulseController;
  
  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _fanController = AnimationController(
      duration: const Duration(milliseconds: 800), // Faster rotation
      vsync: this,
    )..repeat();
    
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    // Start real-time updates
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<DeviceDataProvider>(context, listen: false);
      provider.startRealTimeUpdates();
    });
  }

  @override
  void dispose() {
    _fanController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    
    return Consumer<DeviceDataProvider>(
      builder: (context, provider, child) {
        // Update fan speed based on CPU usage
        _fanController.animateTo(provider.cpuUsage / 100);
        
        return RefreshIndicator(
          onRefresh: () async {
            await provider.refreshData();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProcessorHeader(provider),
                const SizedBox(height: 16),
                _buildCpuOverview(provider),
                const SizedBox(height: 16),
                _buildCoreDetails(provider),
                const SizedBox(height: 16),
                _buildPerformanceGraphs(provider),
                const SizedBox(height: 16),
                _buildThermalMonitoring(provider),
                const SizedBox(height: 16),
                _buildCpuSpecifications(provider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProcessorHeader(DeviceDataProvider provider) {
    final cpuModel = provider.cpuModel;
    
    return InfoCard(
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _getProcessorColor(cpuModel).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getProcessorIcon(cpuModel),
                  size: 32,
                  color: _getProcessorColor(cpuModel),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getProcessorBrand(cpuModel),
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: _getProcessorColor(cpuModel),
                      ),
                    ),
                    Text(
                      cpuModel,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _buildChip('${provider.cpuCores} Cores'),
                        const SizedBox(width: 8),
                        _buildChip('${provider.cpuThreads} Threads'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }

  String _getProcessorBrand(String model) {
    if (model.toLowerCase().contains('snapdragon')) return 'Qualcomm Snapdragon';
    if (model.toLowerCase().contains('mediatek') || model.toLowerCase().contains('dimensity')) return 'MediaTek';
    if (model.toLowerCase().contains('exynos')) return 'Samsung Exynos';
    if (model.toLowerCase().contains('apple')) return 'Apple Silicon';
    if (model.toLowerCase().contains('intel')) return 'Intel';
    if (model.toLowerCase().contains('amd')) return 'AMD';
    return 'Processor';
  }

  Color _getProcessorColor(String model) {
    if (model.toLowerCase().contains('snapdragon')) return Colors.red;
    if (model.toLowerCase().contains('mediatek') || model.toLowerCase().contains('dimensity')) return Colors.orange;
    if (model.toLowerCase().contains('exynos')) return Colors.blue;
    if (model.toLowerCase().contains('apple')) return Colors.grey;
    if (model.toLowerCase().contains('intel')) return Colors.blue;
    if (model.toLowerCase().contains('amd')) return Colors.red;
    return Theme.of(context).colorScheme.primary;
  }

  IconData _getProcessorIcon(String model) {
    if (model.toLowerCase().contains('snapdragon')) return Icons.android;
    if (model.toLowerCase().contains('mediatek') || model.toLowerCase().contains('dimensity')) return Icons.memory;
    if (model.toLowerCase().contains('exynos')) return Icons.smartphone;
    if (model.toLowerCase().contains('apple')) return Icons.phone_iphone;
    return Icons.developer_board;
  }

  Widget _buildCpuOverview(DeviceDataProvider provider) {
    return Row(
      children: [
        Expanded(
          child: InfoCard(
            child: Column(
              children: [
                Text(
                  'CPU Usage',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: 120,
                  height: 120,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Background gauge
                      CustomPaint(
                        painter: CircularGaugePainter(
                          value: provider.cpuUsage,
                          color: _getCpuUsageColor(provider.cpuUsage),
                        ),
                        size: const Size(120, 120),
                      ),
                      // Rotating fan
                      AnimatedBuilder(
                        animation: _fanController,
                        builder: (context, child) {
                          return CustomPaint(
                            painter: CpuFanPainter(
                              rotation: _fanController.value * 2 * math.pi,
                              usage: provider.cpuUsage,
                            ),
                            size: const Size(80, 80),
                          );
                        },
                      ),
                      // CPU usage text
                      Text(
                        '${provider.cpuUsage.toStringAsFixed(1)}%',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          shadows: [
                            Shadow(
                              offset: Offset(1, 1),
                              blurRadius: 2,
                              color: Colors.black54,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: InfoCard(
            child: Column(
              children: [
                Text(
                  'Cooling System',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: 120,
                  height: 120,
                  child: AnimatedBuilder(
                    animation: _fanController,
                    builder: (context, child) {
                      return Transform.rotate(
                        angle: _fanController.value * 2 * math.pi,
                        child: CustomPaint(
                          size: const Size(120, 120),
                          painter: FanPainter(
                            speed: provider.cpuUsage / 100,
                            color: _getCpuUsageColor(provider.cpuUsage),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Text(
                  '${(provider.cpuUsage * 10).toInt()} RPM',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCoreDetails(DeviceDataProvider provider) {
    final coreUsages = provider.cpuCoreUsage;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'CPU Cores (${provider.cpuCores} cores)',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: math.min(4, provider.cpuCores),
                  childAspectRatio: 1.2,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: coreUsages.length,
                itemBuilder: (context, index) {
                  final usage = coreUsages[index];
                  return Container(
                    decoration: BoxDecoration(
                      color: _getCpuUsageColor(usage).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: _getCpuUsageColor(usage).withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Core ${index + 1}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${usage.toStringAsFixed(1)}%',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: _getCpuUsageColor(usage),
                          ),
                        ),
                        const SizedBox(height: 4),
                        LinearProgressIndicator(
                          value: usage / 100,
                          backgroundColor: Colors.grey.withOpacity(0.3),
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getCpuUsageColor(usage),
                          ),
                          minHeight: 3,
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 60,
                child: WaveAnimation(
                  amplitude: provider.cpuUsage / 100 * 20,
                  frequency: 3.0,
                  color: _getCpuUsageColor(provider.cpuUsage),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceGraphs(DeviceDataProvider provider) {
    final history = provider.cpuUsageHistory;
    if (history.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Performance History',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: SizedBox(
            height: 200,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: true,
                  horizontalInterval: 25,
                  verticalInterval: 10,
                  getDrawingHorizontalLine: (value) {
                    return FlLine(
                      color: Colors.grey.withOpacity(0.2),
                      strokeWidth: 1,
                    );
                  },
                  getDrawingVerticalLine: (value) {
                    return FlLine(
                      color: Colors.grey.withOpacity(0.2),
                      strokeWidth: 1,
                    );
                  },
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      interval: 10,
                      getTitlesWidget: (double value, TitleMeta meta) {
                        return SideTitleWidget(
                          axisSide: meta.axisSide,
                          child: Text(
                            '${value.toInt()}s',
                            style: const TextStyle(
                              color: Colors.grey,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      interval: 25,
                      getTitlesWidget: (double value, TitleMeta meta) {
                        return Text(
                          '${value.toInt()}%',
                          style: const TextStyle(
                            color: Colors.grey,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        );
                      },
                      reservedSize: 42,
                    ),
                  ),
                ),
                borderData: FlBorderData(
                  show: true,
                  border: Border.all(color: Colors.grey.withOpacity(0.3)),
                ),
                minX: 0,
                maxX: (history.length - 1).toDouble(),
                minY: 0,
                maxY: 100,
                lineBarsData: [
                  LineChartBarData(
                    spots: history.asMap().entries.map((entry) {
                      return FlSpot(entry.key.toDouble(), entry.value);
                    }).toList(),
                    isCurved: true,
                    gradient: LinearGradient(
                      colors: [
                        Theme.of(context).colorScheme.primary,
                        Theme.of(context).colorScheme.primary.withOpacity(0.5),
                      ],
                    ),
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          Theme.of(context).colorScheme.primary.withOpacity(0.3),
                          Theme.of(context).colorScheme.primary.withOpacity(0.1),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildThermalMonitoring(DeviceDataProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Thermal Monitoring',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: InfoCard(
                child: Column(
                  children: [
                    SizedBox(
                      width: 100,
                      height: 100,
                      child: AnimatedThermometer(
                        temperature: provider.cpuTemperature,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${provider.cpuTemperature.toStringAsFixed(1)}°C',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: _getTemperatureColor(provider.cpuTemperature),
                      ),
                    ),
                    Text(
                      'CPU Temperature',
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: InfoCard(
                child: Column(
                  children: [
                    AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, child) {
                        return Column(
                          children: [
                            const SizedBox(height: 16),
                            Container(
                              height: 200,
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.grey.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: LineChart(
                                LineChartData(
                                  gridData: FlGridData(
                                    show: true,
                                    drawVerticalLine: true,
                                    horizontalInterval: 25,
                                    verticalInterval: 10,
                                    getDrawingHorizontalLine: (value) {
                                      return FlLine(
                                        color: Colors.grey.withValues(alpha: 0.2),
                                        strokeWidth: 1,
                                      );
                                    },
                                    getDrawingVerticalLine: (value) {
                                      return FlLine(
                                        color: Colors.grey.withValues(alpha: 0.2),
                                        strokeWidth: 1,
                                      );
                                    },
                                  ),
                                  titlesData: FlTitlesData(
                                    show: true,
                                    rightTitles: const AxisTitles(
                                      sideTitles: SideTitles(showTitles: false),
                                    ),
                                    topTitles: const AxisTitles(
                                      sideTitles: SideTitles(showTitles: false),
                                    ),
                                    bottomTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        showTitles: true,
                                        reservedSize: 30,
                                        interval: 15,
                                        getTitlesWidget: (double value, TitleMeta meta) {
                                          return SideTitleWidget(
                                            axisSide: meta.axisSide,
                                            child: Text(
                                              '${(60 - value).toInt()}s',
                                              style: const TextStyle(fontSize: 10),
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                    leftTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        showTitles: true,
                                        interval: 25,
                                        reservedSize: 40,
                                        getTitlesWidget: (double value, TitleMeta meta) {
                                          return SideTitleWidget(
                                            axisSide: meta.axisSide,
                                            child: Text(
                                              '${value.toInt()}%',
                                              style: const TextStyle(fontSize: 10),
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  ),
                                  borderData: FlBorderData(
                                    show: true,
                                    border: Border.all(
                                      color: Colors.grey.withValues(alpha: 0.3),
                                      width: 1,
                                    ),
                                  ),
                                  minX: 0,
                                  maxX: 59,
                                  minY: 0,
                                  maxY: 100,
                                  lineBarsData: [
                                    LineChartBarData(
                                      spots: provider.cpuUsageHistory
                                          .asMap()
                                          .entries
                                          .map((e) => FlSpot(e.key.toDouble(), e.value))
                                          .toList(),
                                      isCurved: true,
                                      color: _getCpuUsageColor(provider.cpuUsage),
                                      barWidth: 2,
                                      isStrokeCapRound: true,
                                      dotData: const FlDotData(show: false),
                                      belowBarData: BarAreaData(
                                        show: true,
                                        gradient: LinearGradient(
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                          colors: [
                                            _getCpuUsageColor(provider.cpuUsage).withValues(alpha: 0.4),
                                            _getCpuUsageColor(provider.cpuUsage).withValues(alpha: 0.1),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Thermal Zone',
                              style: TextStyle(
                                fontSize: 12,
                                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCpuSpecifications(DeviceDataProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'CPU Specifications',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildSpecRow('Model', provider.cpuModel, Icons.memory),
              _buildSpecRow('Architecture', provider.cpuInfo?['architecture'] ?? 'Unknown', Icons.architecture),
              _buildSpecRow('Cores', '${provider.cpuCores}', Icons.developer_board),
              _buildSpecRow('Threads', '${provider.cpuThreads}', Icons.settings_ethernet),
              _buildSpecRow('Base Frequency', '${provider.cpuInfo?['frequency'] ?? 'Unknown'} MHz', Icons.speed),
              _buildSpecRow('Cache Size', '${provider.cpuInfo?['cacheSize'] ?? 'Unknown'}', Icons.storage),
              _buildSpecRow('Process Node', '${provider.cpuInfo?['processNode'] ?? 'Unknown'}', Icons.precision_manufacturing),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSpecRow(String label, String value, IconData icon) {
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
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Color _getCpuUsageColor(double usage) {
    if (usage > 80) return Colors.red;
    if (usage > 60) return Colors.orange;
    if (usage > 40) return Colors.yellow;
    return Colors.green;
  }

  Color _getTemperatureColor(double temperature) {
    if (temperature > 80) return Colors.red;
    if (temperature > 60) return Colors.orange;
    if (temperature > 40) return Colors.yellow;
    return Colors.green;
  }
}

class FanPainter extends CustomPainter {
  final double speed;
  final Color color;

  FanPainter({required this.speed, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Draw fan blades
    for (int i = 0; i < 6; i++) {
      final angle = (i * 60) * math.pi / 180;
      final path = Path();
      
      path.moveTo(center.dx, center.dy);
      path.lineTo(
        center.dx + radius * 0.8 * math.cos(angle),
        center.dy + radius * 0.8 * math.sin(angle),
      );
      path.lineTo(
        center.dx + radius * 0.6 * math.cos(angle + 0.5),
        center.dy + radius * 0.6 * math.sin(angle + 0.5),
      );
      path.close();

      canvas.drawPath(path, paint);
    }

    // Draw center hub
    canvas.drawCircle(center, radius * 0.2, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
