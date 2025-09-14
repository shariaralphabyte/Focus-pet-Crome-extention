import 'package:flutter/material.dart';
import 'dart:async';
import 'package:flutter_smart_taps/flutter_smart_taps.dart';

void main() {
  runApp(const SmartTapsExampleApp());
}

class SmartTapsExampleApp extends StatelessWidget {
  const SmartTapsExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Smart Taps Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const SmartTapsDemo(),
    );
  }
}

class SmartTapsDemo extends StatefulWidget {
  const SmartTapsDemo({super.key});

  @override
  State<SmartTapsDemo> createState() => _SmartTapsDemoState();
}

class _SmartTapsDemoState extends State<SmartTapsDemo> {
  bool _isInitialized = false;
  bool _isDetecting = false;
  bool _isSupported = false;
  List<String> _availableSensors = [];
  List<TapEvent> _recentTaps = [];
  Map<String, dynamic> _statistics = {};
  String _statusMessage = 'Initializing...';
  
  // Configuration
  GestureConfig _currentConfig = const GestureConfig();
  
  @override
  void initState() {
    super.initState();
    _initializePlugin();
  }

  Future<void> _initializePlugin() async {
    try {
      // Check if device supports gesture recognition
      final supported = await SmartTaps.isSupported();
      final sensors = await SmartTaps.getAvailableSensors();
      
      setState(() {
        _isSupported = supported;
        _availableSensors = sensors;
      });
      
      if (supported) {
        // Initialize with default configuration
        final initialized = await SmartTaps.initialize(config: _currentConfig);
        
        if (initialized) {
          setState(() {
            _isInitialized = true;
            _statusMessage = 'Ready to detect gestures';
          });
        } else {
          setState(() {
            _statusMessage = 'Failed to initialize gesture detection';
          });
        }
      } else {
        setState(() {
          _statusMessage = 'Device does not support advanced gesture recognition';
        });
      }
    } catch (e) {
      setState(() {
        _statusMessage = 'Error: $e';
      });
    }
  }

  Future<void> _startDetection() async {
    if (!_isInitialized) return;
    
    try {
      await SmartTaps.listen(_onTapDetected);
      setState(() {
        _isDetecting = true;
        _statusMessage = 'Detecting gestures... Try tapping the back of your device!';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Failed to start detection: $e';
      });
    }
  }

  Future<void> _stopDetection() async {
    try {
      await SmartTaps.stop();
      setState(() {
        _isDetecting = false;
        _statusMessage = 'Gesture detection stopped';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Failed to stop detection: $e';
      });
    }
  }

  void _onTapDetected(TapEvent event) {
    setState(() {
      _recentTaps.insert(0, event);
      if (_recentTaps.length > 10) {
        _recentTaps.removeLast();
      }
    });
    
    // Show snackbar for immediate feedback
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${event.type.description} detected! (${(event.confidence * 100).toInt()}% confidence)'),
        duration: const Duration(seconds: 2),
        backgroundColor: _getConfidenceColor(event.confidence),
      ),
    );
    
    // Update statistics
    _updateStatistics();
  }

  Future<void> _updateStatistics() async {
    try {
      final stats = await SmartTaps.getStatistics();
      setState(() {
        _statistics = stats;
      });
    } catch (e) {
      print('Failed to get statistics: $e');
    }
  }

  Color _getConfidenceColor(double confidence) {
    if (confidence >= 0.8) return Colors.green;
    if (confidence >= 0.6) return Colors.orange;
    return Colors.red;
  }

  Future<void> _updateConfig(GestureConfig newConfig) async {
    try {
      await SmartTaps.updateConfig(newConfig);
      setState(() {
        _currentConfig = newConfig;
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Failed to update config: $e';
      });
    }
  }

  Future<void> _addCustomPattern() async {
    try {
      await SmartTaps.addCustomPattern(GesturePattern.knockKnock);
      setState(() {
        _statusMessage = 'Added knock-knock pattern';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Failed to add pattern: $e';
      });
    }
  }

  @override
  void dispose() {
    SmartTaps.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter Smart Taps Demo'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Status',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(_statusMessage),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          _isSupported ? Icons.check_circle : Icons.error,
                          color: _isSupported ? Colors.green : Colors.red,
                        ),
                        const SizedBox(width: 8),
                        Text(_isSupported ? 'Device Supported' : 'Device Not Supported'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Control Buttons
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Controls',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isInitialized && !_isDetecting ? _startDetection : null,
                            icon: const Icon(Icons.play_arrow),
                            label: const Text('Start Detection'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isDetecting ? _stopDetection : null,
                            icon: const Icon(Icons.stop),
                            label: const Text('Stop Detection'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isInitialized ? _addCustomPattern : null,
                            icon: const Icon(Icons.add),
                            label: const Text('Add Pattern'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isInitialized ? _updateStatistics : null,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Refresh Stats'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Configuration Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Configuration',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    Text('Sensitivity: ${(_currentConfig.sensitivity * 100).toInt()}%'),
                    Slider(
                      value: _currentConfig.sensitivity,
                      onChanged: (value) {
                        final newConfig = _currentConfig.copyWith(sensitivity: value);
                        _updateConfig(newConfig);
                      },
                      min: 0.1,
                      max: 1.0,
                      divisions: 9,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _updateConfig(GestureConfig.accessibility),
                            child: const Text('Accessibility Mode'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _updateConfig(GestureConfig.gaming),
                            child: const Text('Gaming Mode'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Device Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Device Information',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text('Available Sensors: ${_availableSensors.join(', ')}'),
                    const SizedBox(height: 4),
                    Text('Enabled Tap Types: ${_currentConfig.enabledTapTypes.length}'),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Statistics Card
            if (_statistics.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Statistics',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      ..._statistics.entries.map((entry) => 
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(entry.key),
                              Text(entry.value.toString()),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            
            const SizedBox(height: 16),
            
            // Recent Taps Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Recent Tap Events',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    if (_recentTaps.isEmpty)
                      const Text('No taps detected yet. Try tapping the back of your device!')
                    else
                      ..._recentTaps.map((tap) => 
                        Card(
                          margin: const EdgeInsets.symmetric(vertical: 4.0),
                          child: ListTile(
                            leading: Icon(
                              _getTapIcon(tap.type),
                              color: _getConfidenceColor(tap.confidence),
                            ),
                            title: Text(tap.type.description),
                            subtitle: Text(
                              'Confidence: ${(tap.confidence * 100).toInt()}% • '
                              'Intensity: ${(tap.intensity * 100).toInt()}%'
                            ),
                            trailing: Text(
                              '${tap.timestamp.hour.toString().padLeft(2, '0')}:'
                              '${tap.timestamp.minute.toString().padLeft(2, '0')}:'
                              '${tap.timestamp.second.toString().padLeft(2, '0')}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getTapIcon(TapType type) {
    switch (type) {
      case TapType.backSingleTap:
        return Icons.touch_app;
      case TapType.backDoubleTap:
        return Icons.double_arrow;
      case TapType.backTripleTap:
        return Icons.arrow_forward_rounded;
      case TapType.knockPattern:
        return Icons.touch_app_outlined;
      case TapType.shakeGesture:
        return Icons.vibration;
      default:
        return Icons.gesture;
    }
  }
}
