import 'package:flutter/material.dart';
import '../tabs/dashboard_tab.dart';
import '../tabs/device_info_tab.dart';
import '../tabs/system_tab.dart';
import '../tabs/cpu_tab.dart';
import '../tabs/battery_tab.dart';
import '../tabs/memory_tab.dart';
import '../tabs/display_tab.dart';
import '../tabs/camera_tab.dart';
import '../tabs/sensors_tab.dart';
import '../tabs/network_tab.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _tabsData = [
    {
      'icon': Icons.dashboard_rounded,
      'text': 'Dashboard',
      'color': const Color(0xFF10B981),
    },
    {
      'icon': Icons.phone_android_rounded,
      'text': 'Device',
      'color': const Color(0xFF3B82F6),
    },
    {
      'icon': Icons.settings_system_daydream_rounded,
      'text': 'System',
      'color': const Color(0xFF8B5CF6),
    },
    {
      'icon': Icons.memory_rounded,
      'text': 'CPU',
      'color': const Color(0xFFEF4444),
    },
    {
      'icon': Icons.battery_charging_full_rounded,
      'text': 'Battery',
      'color': const Color(0xFF10B981),
    },
    {
      'icon': Icons.storage_rounded,
      'text': 'Memory',
      'color': const Color(0xFFF59E0B),
    },
    {
      'icon': Icons.monitor_rounded,
      'text': 'Display',
      'color': const Color(0xFF06B6D4),
    },
    {
      'icon': Icons.camera_alt_rounded,
      'text': 'Camera',
      'color': const Color(0xFFEC4899),
    },
    {
      'icon': Icons.sensors_rounded,
      'text': 'Sensors',
      'color': const Color(0xFF84CC16),
    },
    {
      'icon': Icons.wifi_rounded,
      'text': 'Network',
      'color': const Color(0xFF6366F1),
    },
  ];

  final List<Widget> _tabViews = [
    const DashboardTab(),
    const DeviceInfoTab(),
    const SystemTab(),
    const CpuTab(),
    const BatteryTab(),
    const MemoryTab(),
    const DisplayTab(),
    const CameraTab(),
    const SensorsTab(),
    const NetworkTab(),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabsData.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Device Info Pro',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        foregroundColor: Theme.of(context).colorScheme.onSurface,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              // Refresh current tab data
              setState(() {});
            },
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: const Icon(Icons.more_vert_rounded),
            onPressed: () {
              _showOptionsMenu(context);
            },
            tooltip: 'Options',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Theme.of(context).colorScheme.surface,
                  Theme.of(context).colorScheme.surface.withOpacity(0.95),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 2),
                  spreadRadius: 0,
                ),
              ],
            ),
            child: _buildModernTabBar(),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        physics: const BouncingScrollPhysics(),
        children: _tabViews,
      ),
    );
  }

  Widget _buildModernTabBar() {
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: _tabsData.length,
        itemBuilder: (context, index) {
          final tabData = _tabsData[index];
          final isSelected = _tabController.index == index;
          
          return GestureDetector(
            onTap: () {
              setState(() {
                _tabController.animateTo(index);
              });
            },
            child: AnimatedBuilder(
              animation: _tabController,
              builder: (context, child) {
                final isSelected = _tabController.index == index;
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              tabData['color'].withOpacity(0.15),
                              tabData['color'].withOpacity(0.08),
                            ],
                          )
                        : null,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? tabData['color'].withOpacity(0.3)
                          : Colors.transparent,
                      width: 1.5,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: tabData['color'].withOpacity(0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? tabData['color'].withOpacity(0.2)
                              : Colors.grey[100],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          tabData['icon'],
                          size: 16,
                          color: isSelected
                              ? tabData['color']
                              : Colors.grey[600],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        tabData['text'],
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected
                              ? tabData['color']
                              : Colors.grey[600],
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _showOptionsMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.settings_rounded),
              title: const Text('Settings'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to settings
              },
            ),
            ListTile(
              leading: const Icon(Icons.info_rounded),
              title: const Text('About'),
              onTap: () {
                Navigator.pop(context);
                _showAboutDialog(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.share_rounded),
              title: const Text('Export Data'),
              onTap: () {
                Navigator.pop(context);
                // Export device data
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'Device Info Pro',
      applicationVersion: '1.0.0',
      applicationIcon: Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Icon(
          Icons.phone_android_rounded,
          color: Theme.of(context).colorScheme.onPrimary,
          size: 32,
        ),
      ),
      children: [
        const Text(
          'Professional Android Device Information App with Native Integration\n\n'
          'Features comprehensive device monitoring, real-time system analytics, '
          'and advanced hardware information display.',
        ),
      ],
    );
  }
}
