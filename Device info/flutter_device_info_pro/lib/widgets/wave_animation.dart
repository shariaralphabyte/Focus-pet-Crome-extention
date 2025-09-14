import 'package:flutter/material.dart';
import 'dart:math' as math;

class WaveAnimation extends StatefulWidget {
  final double amplitude;
  final double frequency;
  final Color color;
  final double height;
  final double width;

  const WaveAnimation({
    super.key,
    this.amplitude = 20.0,
    this.frequency = 1.0,
    this.color = Colors.blue,
    this.height = 100.0,
    this.width = 300.0,
  });

  @override
  State<WaveAnimation> createState() => _WaveAnimationState();
}

class _WaveAnimationState extends State<WaveAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _controller.repeat();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      height: widget.height,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            painter: WavePainter(
              animationValue: _controller.value,
              amplitude: widget.amplitude,
              frequency: widget.frequency,
              color: widget.color,
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

class WavePainter extends CustomPainter {
  final double animationValue;
  final double amplitude;
  final double frequency;
  final Color color;

  WavePainter({
    required this.animationValue,
    required this.amplitude,
    required this.frequency,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    final path = Path();
    final centerY = size.height / 2;
    
    // Create wave path
    path.moveTo(0, centerY);
    
    for (double x = 0; x <= size.width; x += 1) {
      final y = centerY + 
          amplitude * math.sin((x / size.width * 2 * math.pi * frequency) + 
          (animationValue * 2 * math.pi));
      path.lineTo(x, y);
    }
    
    canvas.drawPath(path, paint);

    // Draw additional wave layers for depth
    final paint2 = Paint()
      ..color = color.withOpacity(0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final path2 = Path();
    path2.moveTo(0, centerY);
    
    for (double x = 0; x <= size.width; x += 1) {
      final y = centerY + 
          (amplitude * 0.7) * math.sin((x / size.width * 2 * math.pi * frequency * 1.5) + 
          (animationValue * 2 * math.pi * 1.2));
      path2.lineTo(x, y);
    }
    
    canvas.drawPath(path2, paint2);

    // Third wave layer
    final paint3 = Paint()
      ..color = color.withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final path3 = Path();
    path3.moveTo(0, centerY);
    
    for (double x = 0; x <= size.width; x += 1) {
      final y = centerY + 
          (amplitude * 0.5) * math.sin((x / size.width * 2 * math.pi * frequency * 2) + 
          (animationValue * 2 * math.pi * 0.8));
      path3.lineTo(x, y);
    }
    
    canvas.drawPath(path3, paint3);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class PulseWave extends StatefulWidget {
  final double intensity;
  final Color color;
  final double size;

  const PulseWave({
    super.key,
    required this.intensity,
    this.color = Colors.green,
    this.size = 100.0,
  });

  @override
  State<PulseWave> createState() => _PulseWaveState();
}

class _PulseWaveState extends State<PulseWave>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: (2000 - widget.intensity * 10).clamp(500, 2000).toInt()),
      vsync: this,
    );
    _controller.repeat();
  }

  @override
  void didUpdateWidget(PulseWave oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.intensity != widget.intensity) {
      _controller.duration = Duration(
        milliseconds: (2000 - widget.intensity * 10).clamp(500, 2000).toInt(),
      );
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
          return CustomPaint(
            painter: PulsePainter(
              animationValue: _controller.value,
              intensity: widget.intensity,
              color: widget.color,
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

class PulsePainter extends CustomPainter {
  final double animationValue;
  final double intensity;
  final Color color;

  PulsePainter({
    required this.animationValue,
    required this.intensity,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;

    // Draw multiple pulse rings
    for (int i = 0; i < 3; i++) {
      final progress = (animationValue + (i * 0.3)) % 1.0;
      final radius = maxRadius * progress;
      final opacity = (1.0 - progress) * (intensity / 100.0);

      final paint = Paint()
        ..color = color.withOpacity(opacity.clamp(0.0, 0.8))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0 * (1.0 - progress);

      canvas.drawCircle(center, radius, paint);
    }

    // Draw center dot
    final centerPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, 4.0, centerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
