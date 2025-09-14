import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui' as ui;
import 'dart:math';
import '../widgets/info_card.dart';

class DisplayTab extends StatefulWidget {
  const DisplayTab({super.key});

  @override
  State<DisplayTab> createState() => _DisplayTabState();
}

class _DisplayTabState extends State<DisplayTab> with AutomaticKeepAliveClientMixin {
  double _currentBrightness = 0.5;
  bool _isColorTestActive = false;
  Color _currentTestColor = Colors.red;
  bool _isTouchTestActive = false;
  List<Offset> _touchPoints = [];

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);

    final mediaQuery = MediaQuery.of(context);
    final screenSize = mediaQuery.size;
    final devicePixelRatio = mediaQuery.devicePixelRatio;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDisplayPropertiesSection(screenSize, devicePixelRatio),
          const SizedBox(height: 16),
          _buildBrightnessControlSection(),
          const SizedBox(height: 16),
          _buildColorTestSection(),
          const SizedBox(height: 16),
          _buildTouchTestSection(),
        ],
      ),
    );
  }

  Widget _buildDisplayPropertiesSection(Size screenSize, double devicePixelRatio) {
    final physicalWidth = screenSize.width * devicePixelRatio;
    final physicalHeight = screenSize.height * devicePixelRatio;
    final diagonal = _calculateDiagonal(physicalWidth, physicalHeight);
    final dpi = _calculateDPI(physicalWidth, physicalHeight, diagonal);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Display Properties',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildPropertyRow('Screen Resolution', '${screenSize.width.toInt()} × ${screenSize.height.toInt()}', Icons.aspect_ratio_rounded),
              _buildPropertyRow('Physical Resolution', '${physicalWidth.toInt()} × ${physicalHeight.toInt()}', Icons.monitor_rounded),
              _buildPropertyRow('Device Pixel Ratio', '${devicePixelRatio}x', Icons.zoom_in_rounded),
              _buildPropertyRow('Screen Density', '${dpi.toInt()} DPI', Icons.grid_on_rounded),
              _buildPropertyRow('Screen Size', '${diagonal.toStringAsFixed(1)}" diagonal', Icons.straighten_rounded),
              _buildPropertyRow('Aspect Ratio', _getAspectRatio(screenSize.width, screenSize.height), Icons.crop_rounded),
              _buildPropertyRow('Refresh Rate', '60 Hz', Icons.refresh_rounded),
              _buildPropertyRow('Color Depth', '24-bit (16.7M colors)', Icons.palette_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBrightnessControlSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Brightness Control',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              Row(
                children: [
                  Icon(
                    Icons.brightness_low_rounded,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  Expanded(
                    child: Slider(
                      value: _currentBrightness,
                      onChanged: (value) {
                        setState(() {
                          _currentBrightness = value;
                        });
                      },
                      divisions: 10,
                      label: '${(_currentBrightness * 100).toInt()}%',
                    ),
                  ),
                  Icon(
                    Icons.brightness_high_rounded,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                height: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: LinearGradient(
                    colors: [
                      Colors.black,
                      Colors.white.withOpacity(_currentBrightness),
                    ],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                ),
                child: Center(
                  child: Text(
                    'Brightness Preview\n${(_currentBrightness * 100).toInt()}%',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: _currentBrightness > 0.5 ? Colors.black : Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildColorTestSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Color Test Patterns',
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
                  _buildColorButton(Colors.red, 'Red'),
                  _buildColorButton(Colors.green, 'Green'),
                  _buildColorButton(Colors.blue, 'Blue'),
                  _buildColorButton(Colors.white, 'White'),
                  _buildColorButton(Colors.black, 'Black'),
                ],
              ),
              const SizedBox(height: 16),
              if (_isColorTestActive) ...[
                Container(
                  width: double.infinity,
                  height: 150,
                  decoration: BoxDecoration(
                    color: _currentTestColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Theme.of(context).colorScheme.outline,
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Color Test Active',
                          style: TextStyle(
                            color: _getContrastColor(_currentTestColor),
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () {
                            setState(() {
                              _isColorTestActive = false;
                            });
                          },
                          child: const Text('Stop Test'),
                        ),
                      ],
                    ),
                  ),
                ),
              ] else ...[
                _buildGradientTest(),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTouchTestSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Touch Test',
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
                        _isTouchTestActive = !_isTouchTestActive;
                        if (!_isTouchTestActive) {
                          _touchPoints.clear();
                        }
                      });
                    },
                    icon: Icon(_isTouchTestActive ? Icons.stop_rounded : Icons.touch_app_rounded),
                    label: Text(_isTouchTestActive ? 'Stop Test' : 'Start Test'),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _touchPoints.clear();
                      });
                    },
                    icon: const Icon(Icons.clear_rounded),
                    label: const Text('Clear'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Theme.of(context).colorScheme.outline,
                    width: 2,
                  ),
                ),
                child: GestureDetector(
                  onPanUpdate: _isTouchTestActive ? (details) {
                    setState(() {
                      _touchPoints.add(details.localPosition);
                      if (_touchPoints.length > 100) {
                        _touchPoints.removeAt(0);
                      }
                    });
                  } : null,
                  onTapDown: _isTouchTestActive ? (details) {
                    setState(() {
                      _touchPoints.add(details.localPosition);
                    });
                  } : null,
                  child: CustomPaint(
                    painter: TouchTestPainter(_touchPoints),
                    child: Container(
                      width: double.infinity,
                      height: double.infinity,
                      child: Center(
                        child: Text(
                          _isTouchTestActive 
                              ? 'Touch and drag to test\nTouch points: ${_touchPoints.length}'
                              : 'Start test to begin touch detection',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPropertyRow(String label, String value, IconData icon) {
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
                Text(
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

  Widget _buildColorButton(Color color, String label) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isColorTestActive = true;
          _currentTestColor = color;
        });
      },
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(
                color: Theme.of(context).colorScheme.outline,
                width: 2,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildGradientTest() {
    return Container(
      width: double.infinity,
      height: 100,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: const LinearGradient(
          colors: [
            Colors.red,
            Colors.orange,
            Colors.yellow,
            Colors.green,
            Colors.blue,
            Colors.indigo,
            Colors.purple,
          ],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: const Center(
        child: Text(
          'Color Gradient Test',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            shadows: [
              Shadow(
                offset: Offset(1, 1),
                blurRadius: 2,
                color: Colors.black,
              ),
            ],
          ),
        ),
      ),
    );
  }

  double _calculateDiagonal(double width, double height) {
    // Assuming a typical Android phone DPI of ~400-500
    const double assumedDPI = 440.0;
    final widthInches = width / assumedDPI;
    final heightInches = height / assumedDPI;
    return sqrt(widthInches * widthInches + heightInches * heightInches);
  }

  double _calculateDPI(double width, double height, double diagonal) {
    final pixelDiagonal = sqrt(width * width + height * height);
    return pixelDiagonal / diagonal;
  }

  String _getAspectRatio(double width, double height) {
    final gcd = _gcd(width.toInt(), height.toInt());
    final ratioW = (width / gcd).toInt();
    final ratioH = (height / gcd).toInt();
    return '$ratioW:$ratioH';
  }

  int _gcd(int a, int b) {
    while (b != 0) {
      int temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  Color _getContrastColor(Color color) {
    final luminance = color.computeLuminance();
    return luminance > 0.5 ? Colors.black : Colors.white;
  }
}

class TouchTestPainter extends CustomPainter {
  final List<Offset> touchPoints;

  TouchTestPainter(this.touchPoints);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 3
      ..style = PaintingStyle.fill;

    for (int i = 0; i < touchPoints.length; i++) {
      final opacity = (i / touchPoints.length).clamp(0.1, 1.0);
      paint.color = Colors.blue.withOpacity(opacity);
      canvas.drawCircle(touchPoints[i], 5, paint);
    }

    // Draw connecting lines
    if (touchPoints.length > 1) {
      final linePaint = Paint()
        ..color = Colors.blue.withOpacity(0.3)
        ..strokeWidth = 2
        ..style = PaintingStyle.stroke;

      for (int i = 1; i < touchPoints.length; i++) {
        canvas.drawLine(touchPoints[i - 1], touchPoints[i], linePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
