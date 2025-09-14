import 'package:flutter/material.dart';
import 'dart:math' as math;

class AnimatedThermometer extends StatefulWidget {
  final double temperature;
  final double minTemp;
  final double maxTemp;
  final double width;
  final double height;

  const AnimatedThermometer({
    super.key,
    required this.temperature,
    this.minTemp = 0.0,
    this.maxTemp = 100.0,
    this.width = 60.0,
    this.height = 200.0,
  });

  @override
  State<AnimatedThermometer> createState() => _AnimatedThermometerState();
}

class _AnimatedThermometerState extends State<AnimatedThermometer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.0,
      end: _getTemperatureRatio(),
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedThermometer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.temperature != widget.temperature) {
      _animation = Tween<double>(
        begin: _animation.value,
        end: _getTemperatureRatio(),
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ));
      _controller.reset();
      _controller.forward();
    }
  }

  double _getTemperatureRatio() {
    return ((widget.temperature - widget.minTemp) / (widget.maxTemp - widget.minTemp))
        .clamp(0.0, 1.0);
  }

  Color _getTemperatureColor() {
    final ratio = _getTemperatureRatio();
    if (ratio < 0.3) return Colors.blue;
    if (ratio < 0.6) return Colors.green;
    if (ratio < 0.8) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      height: widget.height,
      child: CustomPaint(
        painter: ThermometerPainter(
          animation: _animation,
          temperature: widget.temperature,
          color: _getTemperatureColor(),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class ThermometerPainter extends CustomPainter {
  final Animation<double> animation;
  final double temperature;
  final Color color;

  ThermometerPainter({
    required this.animation,
    required this.temperature,
    required this.color,
  }) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..strokeWidth = 2.0;

    // Draw thermometer outline
    final outlinePaint = Paint()
      ..color = Colors.grey.shade300
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    final bulbRadius = size.width * 0.3;
    final tubeWidth = size.width * 0.4;
    final tubeHeight = size.height - bulbRadius * 2;

    // Draw tube outline
    final tubeRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        (size.width - tubeWidth) / 2,
        bulbRadius,
        tubeWidth,
        tubeHeight,
      ),
      Radius.circular(tubeWidth / 2),
    );
    canvas.drawRRect(tubeRect, outlinePaint);

    // Draw bulb outline
    canvas.drawCircle(
      Offset(size.width / 2, size.height - bulbRadius),
      bulbRadius,
      outlinePaint,
    );

    // Draw mercury/liquid
    paint.color = color;
    
    // Draw bulb filled
    canvas.drawCircle(
      Offset(size.width / 2, size.height - bulbRadius),
      bulbRadius - 3,
      paint,
    );

    // Draw tube filled (animated)
    final fillHeight = tubeHeight * animation.value;
    if (fillHeight > 0) {
      final fillRect = RRect.fromRectAndRadius(
        Rect.fromLTWH(
          (size.width - tubeWidth) / 2 + 3,
          bulbRadius + tubeHeight - fillHeight,
          tubeWidth - 6,
          fillHeight,
        ),
        Radius.circular((tubeWidth - 6) / 2),
      );
      canvas.drawRRect(fillRect, paint);
    }

    // Draw temperature markings
    final markPaint = Paint()
      ..color = Colors.grey.shade600
      ..strokeWidth = 1.0;

    final textPainter = TextPainter(
      textDirection: TextDirection.ltr,
    );

    for (int i = 0; i <= 10; i++) {
      final y = bulbRadius + (tubeHeight * i / 10);
      final isMainMark = i % 2 == 0;
      final markLength = isMainMark ? 8.0 : 4.0;
      
      canvas.drawLine(
        Offset(size.width + 5, y),
        Offset(size.width + 5 + markLength, y),
        markPaint,
      );

      if (isMainMark) {
        final temp = (100 - (i * 10)).toString();
        textPainter.text = TextSpan(
          text: temp,
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 10,
          ),
        );
        textPainter.layout();
        textPainter.paint(
          canvas,
          Offset(size.width + 15, y - textPainter.height / 2),
        );
      }
    }

    // Draw current temperature text
    textPainter.text = TextSpan(
      text: '${temperature.toStringAsFixed(1)}°C',
      style: TextStyle(
        color: color,
        fontSize: 14,
        fontWeight: FontWeight.bold,
      ),
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(
        (size.width - textPainter.width) / 2,
        10,
      ),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
