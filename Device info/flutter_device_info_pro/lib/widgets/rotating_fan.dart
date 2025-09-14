import 'package:flutter/material.dart';
import 'dart:math' as math;

class RotatingFan extends StatefulWidget {
  final double speed; // 0.0 to 100.0
  final double size;
  final Color color;

  const RotatingFan({
    super.key,
    required this.speed,
    this.size = 60.0,
    this.color = Colors.blue,
  });

  @override
  State<RotatingFan> createState() => _RotatingFanState();
}

class _RotatingFanState extends State<RotatingFan>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: _getRotationDuration()),
      vsync: this,
    );
    _startRotation();
  }

  @override
  void didUpdateWidget(RotatingFan oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.speed != widget.speed) {
      _controller.duration = Duration(milliseconds: _getRotationDuration());
      if (widget.speed > 0) {
        if (!_controller.isAnimating) {
          _startRotation();
        }
      } else {
        _controller.stop();
      }
    }
  }

  int _getRotationDuration() {
    if (widget.speed <= 0) return 2000;
    // Faster speed = shorter duration (faster rotation)
    return (2000 - (widget.speed * 18)).clamp(100, 2000).toInt();
  }

  void _startRotation() {
    if (widget.speed > 0) {
      _controller.repeat();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.rotate(
            angle: _controller.value * 2 * math.pi,
            child: CustomPaint(
              painter: FanPainter(
                color: widget.color,
                speed: widget.speed,
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class FanPainter extends CustomPainter {
  final Color color;
  final double speed;

  FanPainter({required this.color, required this.speed});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    
    final paint = Paint()
      ..color = color.withOpacity(0.8)
      ..style = PaintingStyle.fill;

    final outlinePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Draw fan blades
    const bladeCount = 6;
    for (int i = 0; i < bladeCount; i++) {
      final angle = (i * 2 * math.pi) / bladeCount;
      
      // Create blade path
      final path = Path();
      final bladeLength = radius * 0.8;
      final bladeWidth = radius * 0.3;
      
      // Start from center
      path.moveTo(center.dx, center.dy);
      
      // Create curved blade
      final controlPoint1 = Offset(
        center.dx + math.cos(angle - 0.3) * bladeLength * 0.6,
        center.dy + math.sin(angle - 0.3) * bladeLength * 0.6,
      );
      
      final endPoint = Offset(
        center.dx + math.cos(angle) * bladeLength,
        center.dy + math.sin(angle) * bladeLength,
      );
      
      final controlPoint2 = Offset(
        center.dx + math.cos(angle + 0.3) * bladeLength * 0.6,
        center.dy + math.sin(angle + 0.3) * bladeLength * 0.6,
      );
      
      path.quadraticBezierTo(
        controlPoint1.dx, controlPoint1.dy,
        endPoint.dx, endPoint.dy,
      );
      
      path.quadraticBezierTo(
        controlPoint2.dx, controlPoint2.dy,
        center.dx, center.dy,
      );
      
      canvas.drawPath(path, paint);
      canvas.drawPath(path, outlinePaint);
    }

    // Draw center hub
    final hubRadius = radius * 0.15;
    canvas.drawCircle(center, hubRadius, paint);
    canvas.drawCircle(center, hubRadius, outlinePaint);

    // Draw speed indicator dots around the hub
    if (speed > 0) {
      final dotPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;
      
      final dotCount = (speed / 20).ceil().clamp(1, 5);
      for (int i = 0; i < dotCount; i++) {
        final dotAngle = (i * 2 * math.pi) / 5;
        final dotRadius = hubRadius * 0.6;
        final dotPosition = Offset(
          center.dx + math.cos(dotAngle) * dotRadius * 0.5,
          center.dy + math.sin(dotAngle) * dotRadius * 0.5,
        );
        canvas.drawCircle(dotPosition, 2, dotPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
