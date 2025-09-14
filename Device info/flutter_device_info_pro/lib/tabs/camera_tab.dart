import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import '../widgets/info_card.dart';

class CameraTab extends StatefulWidget {
  const CameraTab({super.key});

  @override
  State<CameraTab> createState() => _CameraTabState();
}

class _CameraTabState extends State<CameraTab> with AutomaticKeepAliveClientMixin {
  List<CameraDescription> _cameras = [];
  CameraController? _controller;
  bool _isLoading = true;
  bool _hasPermission = false;
  int _selectedCameraIndex = 0;
  bool _isPreviewActive = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _initializeCamera() async {
    try {
      // Request camera permission
      final status = await Permission.camera.request();
      if (status != PermissionStatus.granted) {
        setState(() {
          _isLoading = false;
          _hasPermission = false;
        });
        return;
      }

      _hasPermission = true;
      _cameras = await availableCameras();
      
      if (_cameras.isNotEmpty) {
        await _initializeCameraController(_selectedCameraIndex);
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _initializeCameraController(int cameraIndex) async {
    if (_cameras.isEmpty) return;

    await _controller?.dispose();
    
    _controller = CameraController(
      _cameras[cameraIndex],
      ResolutionPreset.medium,
      enableAudio: false,
    );

    try {
      await _controller!.initialize();
      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      print('Error initializing camera: $e');
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

    if (!_hasPermission) {
      return _buildPermissionDenied();
    }

    if (_cameras.isEmpty) {
      return _buildNoCameras();
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCameraPreviewSection(),
          const SizedBox(height: 16),
          _buildCameraSpecsSection(),
          const SizedBox(height: 16),
          _buildCameraFeaturesSection(),
          const SizedBox(height: 16),
          _buildCameraControlsSection(),
        ],
      ),
    );
  }

  Widget _buildPermissionDenied() {
    return Center(
      child: InfoCard(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.camera_alt_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Camera Permission Required',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please grant camera permission to view camera specifications and preview.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () async {
                await openAppSettings();
              },
              icon: const Icon(Icons.settings_rounded),
              label: const Text('Open Settings'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoCameras() {
    return Center(
      child: InfoCard(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.camera_alt_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No Cameras Found',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'No camera devices were detected on this device.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCameraPreviewSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Camera Preview',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            if (_cameras.length > 1)
              DropdownButton<int>(
                value: _selectedCameraIndex,
                items: _cameras.asMap().entries.map((entry) {
                  return DropdownMenuItem<int>(
                    value: entry.key,
                    child: Text(_getCameraName(entry.value)),
                  );
                }).toList(),
                onChanged: (index) async {
                  if (index != null) {
                    setState(() {
                      _selectedCameraIndex = index;
                    });
                    await _initializeCameraController(index);
                  }
                },
              ),
          ],
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              if (_controller != null && _controller!.value.isInitialized && _isPreviewActive) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: AspectRatio(
                    aspectRatio: _controller!.value.aspectRatio,
                    child: CameraPreview(_controller!),
                  ),
                ),
                const SizedBox(height: 12),
              ] else ...[
                Container(
                  width: double.infinity,
                  height: 200,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Theme.of(context).colorScheme.outline,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.camera_alt_rounded,
                        size: 48,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Camera Preview Disabled',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _isPreviewActive = !_isPreviewActive;
                  });
                },
                icon: Icon(_isPreviewActive ? Icons.videocam_off_rounded : Icons.videocam_rounded),
                label: Text(_isPreviewActive ? 'Stop Preview' : 'Start Preview'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCameraSpecsSection() {
    final camera = _cameras[_selectedCameraIndex];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Camera Specifications',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildSpecRow('Camera Name', _getCameraName(camera), Icons.camera_alt_rounded),
              _buildSpecRow('Lens Direction', _getLensDirection(camera.lensDirection), Icons.flip_camera_android_rounded),
              _buildSpecRow('Sensor Orientation', '${camera.sensorOrientation}°', Icons.screen_rotation_rounded),
              _buildSpecRow('Resolution', _getResolutionText(), Icons.photo_size_select_actual_rounded),
              _buildSpecRow('Aspect Ratio', _getAspectRatioText(), Icons.aspect_ratio_rounded),
              _buildSpecRow('Focus Mode', 'Auto Focus', Icons.center_focus_strong_rounded),
              _buildSpecRow('Flash Support', _getFlashSupport(), Icons.flash_on_rounded),
              _buildSpecRow('Zoom Support', 'Digital Zoom', Icons.zoom_in_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCameraFeaturesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Camera Features',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        InfoCard(
          child: Column(
            children: [
              _buildFeatureRow('HDR Support', true, Icons.hdr_on_rounded),
              _buildFeatureRow('Video Recording', true, Icons.videocam_rounded),
              _buildFeatureRow('Image Stabilization', true, Icons.image_rounded),
              _buildFeatureRow('Face Detection', true, Icons.face_rounded),
              _buildFeatureRow('Burst Mode', true, Icons.burst_mode_rounded),
              _buildFeatureRow('Manual Controls', false, Icons.tune_rounded),
              _buildFeatureRow('RAW Capture', false, Icons.raw_on_rounded),
              _buildFeatureRow('Slow Motion', true, Icons.slow_motion_video_rounded),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCameraControlsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Camera Controls',
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
                  _buildControlButton('Focus Test', Icons.center_focus_strong_rounded, () {
                    _testFocus();
                  }),
                  _buildControlButton('Flash Test', Icons.flash_on_rounded, () {
                    _testFlash();
                  }),
                  _buildControlButton('Zoom Test', Icons.zoom_in_rounded, () {
                    _testZoom();
                  }),
                ],
              ),
              const SizedBox(height: 16),
              Container(
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
                          Icons.info_rounded,
                          size: 16,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Camera Tips',
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
                      '• Clean camera lens regularly for better image quality\n'
                      '• Use adequate lighting for better photos\n'
                      '• Hold device steady to avoid blur\n'
                      '• Tap to focus on specific subjects',
                      style: TextStyle(
                        fontSize: 10,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ),
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

  Widget _buildFeatureRow(String label, bool isSupported, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (isSupported ? Colors.green : Colors.red).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              size: 16,
              color: isSupported ? Colors.green : Colors.red,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Icon(
            isSupported ? Icons.check_circle_rounded : Icons.cancel_rounded,
            color: isSupported ? Colors.green : Colors.red,
            size: 20,
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton(String label, IconData icon, VoidCallback onPressed) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            shape: const CircleBorder(),
            padding: const EdgeInsets.all(16),
          ),
          child: Icon(icon, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 10),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  String _getCameraName(CameraDescription camera) {
    switch (camera.lensDirection) {
      case CameraLensDirection.front:
        return 'Front Camera';
      case CameraLensDirection.back:
        return 'Rear Camera';
      case CameraLensDirection.external:
        return 'External Camera';
    }
  }

  String _getLensDirection(CameraLensDirection direction) {
    switch (direction) {
      case CameraLensDirection.front:
        return 'Front-facing';
      case CameraLensDirection.back:
        return 'Rear-facing';
      case CameraLensDirection.external:
        return 'External';
    }
  }

  String _getResolutionText() {
    if (_controller != null && _controller!.value.isInitialized) {
      final size = _controller!.value.previewSize;
      return '${size?.width.toInt() ?? 'Unknown'} × ${size?.height.toInt() ?? 'Unknown'}';
    }
    return 'Unknown';
  }

  String _getAspectRatioText() {
    if (_controller != null && _controller!.value.isInitialized) {
      final aspectRatio = _controller!.value.aspectRatio;
      return aspectRatio.toStringAsFixed(2);
    }
    return 'Unknown';
  }

  String _getFlashSupport() {
    // This would require checking actual flash capabilities
    return 'LED Flash';
  }

  void _testFocus() {
    if (_controller != null && _controller!.value.isInitialized) {
      // Implement focus test
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Focus test initiated')),
      );
    }
  }

  void _testFlash() {
    if (_controller != null && _controller!.value.isInitialized) {
      // Implement flash test
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Flash test initiated')),
      );
    }
  }

  void _testZoom() {
    if (_controller != null && _controller!.value.isInitialized) {
      // Implement zoom test
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Zoom test initiated')),
      );
    }
  }
}
