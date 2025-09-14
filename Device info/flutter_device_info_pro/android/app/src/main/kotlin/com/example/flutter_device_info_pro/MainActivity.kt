package com.example.flutter_device_info_pro

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.telephony.TelephonyManager
import android.util.DisplayMetrics
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.RandomAccessFile
import java.util.*

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.example.flutter_device_info_pro/native"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "getCpuInfo" -> {
                    result.success(getCpuInfo())
                }
                "getMemoryInfo" -> {
                    result.success(getMemoryInfo())
                }
                "getRealTimeMemoryInfo" -> {
                    result.success(getRealTimeMemoryInfo())
                }
                "getStorageInfo" -> {
                    result.success(getStorageInfo())
                }
                "getThermalInfo" -> {
                    result.success(getThermalInfo())
                }
                "getSensorList" -> {
                    result.success(getSensorList())
                }
                "getSystemInfo" -> {
                    result.success(getSystemInfo())
                }
                "getCpuUsage" -> {
                    result.success(getCpuUsage())
                }
                "getCpuCoreInfo" -> {
                    result.success(getCpuCoreInfo())
                }
                "getBatteryInfo" -> {
                    result.success(getBatteryInfo())
                }
                "getInstalledAppsCount" -> {
                    result.success(getInstalledAppsCount())
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    private fun getCpuInfo(): Map<String, Any> {
        val cpuInfo = mutableMapOf<String, Any>()
        
        try {
            // CPU Architecture
            cpuInfo["architecture"] = Build.SUPPORTED_ABIS[0]
            cpuInfo["supportedAbis"] = Build.SUPPORTED_ABIS.toList()
            
            // CPU Cores
            cpuInfo["coreCount"] = Runtime.getRuntime().availableProcessors()
            
            // CPU Frequency (requires root or may not be available)
            val frequencies = mutableListOf<String>()
            for (i in 0 until Runtime.getRuntime().availableProcessors()) {
                try {
                    val freqFile = File("/sys/devices/system/cpu/cpu$i/cpufreq/scaling_cur_freq")
                    if (freqFile.exists()) {
                        val freq = freqFile.readText().trim()
                        frequencies.add(freq)
                    }
                } catch (e: Exception) {
                    frequencies.add("N/A")
                }
            }
            cpuInfo["frequencies"] = frequencies
            
            // CPU Features from /proc/cpuinfo
            try {
                val cpuInfoFile = File("/proc/cpuinfo")
                if (cpuInfoFile.exists()) {
                    val content = cpuInfoFile.readText()
                    val lines = content.split("\n")
                    
                    for (line in lines) {
                        if (line.startsWith("Hardware")) {
                            cpuInfo["hardware"] = line.split(":")[1].trim()
                        } else if (line.startsWith("Processor")) {
                            cpuInfo["processor"] = line.split(":")[1].trim()
                        } else if (line.startsWith("Features")) {
                            cpuInfo["features"] = line.split(":")[1].trim()
                        }
                    }
                }
            } catch (e: Exception) {
                cpuInfo["error"] = "Could not read /proc/cpuinfo: ${e.message}"
            }
            
        } catch (e: Exception) {
            cpuInfo["error"] = e.message ?: "Unknown error"
        }
        
        return cpuInfo
    }

    private fun getMemoryInfo(): Map<String, Any> {
        val memInfo = mutableMapOf<String, Any>()
        
        try {
            val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val memoryInfo = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memoryInfo)
            
            memInfo["totalRam"] = memoryInfo.totalMem
            memInfo["availableRam"] = memoryInfo.availMem
            memInfo["usedRam"] = memoryInfo.totalMem - memoryInfo.availMem
            memInfo["isLowMemory"] = memoryInfo.lowMemory
            memInfo["threshold"] = memoryInfo.threshold
            
            // Memory class information
            memInfo["memoryClass"] = activityManager.memoryClass
            memInfo["largeMemoryClass"] = activityManager.largeMemoryClass
            
        } catch (e: Exception) {
            memInfo["error"] = e.message ?: "Unknown error"
        }
        
        return memInfo
    }

    private fun getStorageInfo(): Map<String, Any> {
        val storageInfo = mutableMapOf<String, Any>()
        
        try {
            // Internal Storage
            val internalPath = Environment.getDataDirectory()
            val internalStat = StatFs(internalPath.path)
            val internalBlockSize = internalStat.blockSizeLong
            val internalTotalBlocks = internalStat.blockCountLong
            val internalAvailableBlocks = internalStat.availableBlocksLong
            
            storageInfo["internalTotal"] = internalTotalBlocks * internalBlockSize
            storageInfo["internalAvailable"] = internalAvailableBlocks * internalBlockSize
            storageInfo["internalUsed"] = (internalTotalBlocks - internalAvailableBlocks) * internalBlockSize
            
            // External Storage (if available)
            if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) {
                val externalPath = Environment.getExternalStorageDirectory()
                val externalStat = StatFs(externalPath.path)
                val externalBlockSize = externalStat.blockSizeLong
                val externalTotalBlocks = externalStat.blockCountLong
                val externalAvailableBlocks = externalStat.availableBlocksLong
                
                storageInfo["externalTotal"] = externalTotalBlocks * externalBlockSize
                storageInfo["externalAvailable"] = externalAvailableBlocks * externalBlockSize
                storageInfo["externalUsed"] = (externalTotalBlocks - externalAvailableBlocks) * externalBlockSize
            }
            
        } catch (e: Exception) {
            storageInfo["error"] = e.message ?: "Unknown error"
        }
        
        return storageInfo
    }

    private fun getThermalInfo(): Map<String, Any> {
        val thermalInfo = mutableMapOf<String, Any>()
        
        try {
            // Try to read thermal zones with proper error handling
            val thermalZones = mutableListOf<Map<String, Any>>()
            var accessDeniedCount = 0
            val maxAccessDeniedAttempts = 3 // Stop after 3 consecutive access denied errors
            
            for (i in 0..10) {
                try {
                    val tempFile = File("/sys/class/thermal/thermal_zone$i/temp")
                    val typeFile = File("/sys/class/thermal/thermal_zone$i/type")
                    
                    if (tempFile.exists() && typeFile.exists()) {
                        // Check if we can actually read the file before attempting
                        if (!tempFile.canRead() || !typeFile.canRead()) {
                            accessDeniedCount++
                            if (accessDeniedCount >= maxAccessDeniedAttempts) {
                                // Stop trying if we hit too many access denied errors
                                break
                            }
                            continue
                        }
                        
                        val temp = tempFile.readText().trim().toIntOrNull()
                        val type = typeFile.readText().trim()
                        
                        if (temp != null) {
                            thermalZones.add(mapOf(
                                "zone" to i,
                                "type" to type,
                                "temperature" to temp / 1000.0 // Convert from millidegrees
                            ))
                            accessDeniedCount = 0 // Reset counter on successful read
                        }
                    } else {
                        // If files don't exist, we've likely reached the end of available zones
                        break
                    }
                } catch (e: SecurityException) {
                    // Handle security exceptions specifically
                    accessDeniedCount++
                    if (accessDeniedCount >= maxAccessDeniedAttempts) {
                        thermalInfo["accessDeniedError"] = "Access denied to thermal sensor files"
                        break
                    }
                } catch (e: Exception) {
                    // Handle other exceptions but don't count them as access denied
                    continue
                }
            }
            
            thermalInfo["thermalZones"] = thermalZones
            if (thermalZones.isEmpty()) {
                thermalInfo["message"] = "No thermal sensors accessible or available"
            }
            
        } catch (e: Exception) {
            thermalInfo["error"] = e.message ?: "Unknown error"
        }
        
        return thermalInfo
    }

    private fun getSensorList(): List<Map<String, Any>> {
        val sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val sensors = sensorManager.getSensorList(Sensor.TYPE_ALL)
        
        return sensors.map { sensor ->
            mapOf(
                "name" to sensor.name,
                "type" to sensor.type,
                "vendor" to sensor.vendor,
                "version" to sensor.version,
                "power" to sensor.power,
                "resolution" to sensor.resolution,
                "maxRange" to sensor.maximumRange,
                "minDelay" to sensor.minDelay,
                "maxDelay" to sensor.maxDelay,
                "fifoMaxEventCount" to sensor.fifoMaxEventCount,
                "fifoReservedEventCount" to sensor.fifoReservedEventCount,
                "stringType" to sensor.stringType,
                "reportingMode" to sensor.reportingMode,
                "isWakeUpSensor" to sensor.isWakeUpSensor
            )
        }
    }

    private fun getSystemInfo(): Map<String, Any> {
        val systemInfo = mutableMapOf<String, Any>()
        
        try {
            systemInfo["androidVersion"] = Build.VERSION.RELEASE
            systemInfo["apiLevel"] = Build.VERSION.SDK_INT
            systemInfo["buildId"] = Build.ID
            systemInfo["buildTime"] = Build.TIME
            systemInfo["bootloader"] = Build.BOOTLOADER
            systemInfo["brand"] = Build.BRAND
            systemInfo["device"] = Build.DEVICE
            systemInfo["display"] = Build.DISPLAY
            systemInfo["fingerprint"] = Build.FINGERPRINT
            systemInfo["hardware"] = Build.HARDWARE
            systemInfo["host"] = Build.HOST
            systemInfo["manufacturer"] = Build.MANUFACTURER
            systemInfo["model"] = Build.MODEL
            systemInfo["product"] = Build.PRODUCT
            systemInfo["serial"] = Build.getRadioVersion()
            systemInfo["tags"] = Build.TAGS
            systemInfo["type"] = Build.TYPE
            systemInfo["user"] = Build.USER
            
            // Security patch level (API 23+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                systemInfo["securityPatch"] = Build.VERSION.SECURITY_PATCH
            }
            
            // Display metrics
            val windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val displayMetrics = DisplayMetrics()
            windowManager.defaultDisplay.getMetrics(displayMetrics)
            
            val displayInfo = mutableMapOf<String, Any>()
            displayInfo["widthPixels"] = displayMetrics.widthPixels
            displayInfo["heightPixels"] = displayMetrics.heightPixels
            displayInfo["densityDpi"] = displayMetrics.densityDpi
            displayInfo["density"] = displayMetrics.density
            displayInfo["scaledDensity"] = displayMetrics.scaledDensity
            displayInfo["xdpi"] = displayMetrics.xdpi
            displayInfo["ydpi"] = displayMetrics.ydpi
            
            systemInfo["displayMetrics"] = displayInfo
            
        } catch (e: Exception) {
            systemInfo["error"] = e.message ?: "Unknown error"
        }
        
        return systemInfo
    }

    private fun getRealTimeMemoryInfo(): Map<String, Any> {
        val memInfo = mutableMapOf<String, Any>()
        
        try {
            val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val memoryInfo = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(memoryInfo)
            
            memInfo["totalRam"] = memoryInfo.totalMem
            memInfo["availableRam"] = memoryInfo.availMem
            memInfo["usedRam"] = memoryInfo.totalMem - memoryInfo.availMem
            memInfo["isLowMemory"] = memoryInfo.lowMemory
            memInfo["threshold"] = memoryInfo.threshold
            
        } catch (e: Exception) {
            memInfo["error"] = e.message ?: "Unknown error"
        }
        
        return memInfo
    }

    private fun getCpuCoreInfo(): Map<String, Any> {
        val coreInfo = mutableMapOf<String, Any>()
        
        try {
            val cores = mutableListOf<Map<String, Any>>()
            val coreCount = Runtime.getRuntime().availableProcessors()
            
            for (i in 0 until coreCount) {
                val core = mutableMapOf<String, Any>()
                core["id"] = i
                
                // Try to read current frequency
                try {
                    val freqFile = File("/sys/devices/system/cpu/cpu$i/cpufreq/scaling_cur_freq")
                    if (freqFile.exists()) {
                        val freq = freqFile.readText().trim().toLongOrNull()
                        core["frequency"] = freq ?: 0
                    } else {
                        core["frequency"] = 0
                    }
                } catch (e: Exception) {
                    core["frequency"] = 0
                }
                
                // Try to read max frequency
                try {
                    val maxFreqFile = File("/sys/devices/system/cpu/cpu$i/cpufreq/cpuinfo_max_freq")
                    if (maxFreqFile.exists()) {
                        val maxFreq = maxFreqFile.readText().trim().toLongOrNull()
                        core["maxFrequency"] = maxFreq ?: 0
                    } else {
                        core["maxFrequency"] = 0
                    }
                } catch (e: Exception) {
                    core["maxFrequency"] = 0
                }
                
                // Simulate usage (in real app, you'd calculate this from /proc/stat)
                core["usage"] = (Math.random() * 100).toInt()
                
                cores.add(core)
            }
            
            coreInfo["cores"] = cores
            coreInfo["coreCount"] = coreCount
            
        } catch (e: Exception) {
            coreInfo["error"] = e.message ?: "Unknown error"
        }
        
        return coreInfo
    }

    private fun getCpuUsage(): Map<String, Any> {
        val cpuUsage = mutableMapOf<String, Any>()
        
        try {
            val statFile = RandomAccessFile("/proc/stat", "r")
            val cpuLine = statFile.readLine()
            statFile.close()
            
            val cpuTimes = cpuLine.split("\\s+".toRegex()).drop(1).map { it.toLong() }
            
            val idleTime = cpuTimes[3]
            val totalTime = cpuTimes.sum()
            
            cpuUsage["idleTime"] = idleTime
            cpuUsage["totalTime"] = totalTime
            cpuUsage["usage"] = ((totalTime - idleTime) * 100.0 / totalTime)
            
        } catch (e: Exception) {
            cpuUsage["error"] = e.message ?: "Unknown error"
        }
        
        return cpuUsage
    }

    private fun getBatteryInfo(): Map<String, Any> {
        val batteryInfo = mutableMapOf<String, Any>()
        
        try {
            val batteryIntentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatus = registerReceiver(null, batteryIntentFilter)
            
            if (batteryStatus != null) {
                // Battery level
                val level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                val batteryPct = level * 100 / scale.toFloat()
                
                batteryInfo["level"] = batteryPct.toInt()
                batteryInfo["rawLevel"] = level
                batteryInfo["scale"] = scale
                
                // Charging status
                val status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || 
                                status == BatteryManager.BATTERY_STATUS_FULL
                
                batteryInfo["isCharging"] = isCharging
                batteryInfo["status"] = when (status) {
                    BatteryManager.BATTERY_STATUS_CHARGING -> "Charging"
                    BatteryManager.BATTERY_STATUS_DISCHARGING -> "Discharging"
                    BatteryManager.BATTERY_STATUS_FULL -> "Full"
                    BatteryManager.BATTERY_STATUS_NOT_CHARGING -> "Not Charging"
                    BatteryManager.BATTERY_STATUS_UNKNOWN -> "Unknown"
                    else -> "Unknown"
                }
                
                // Power source
                val chargePlug = batteryStatus.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)
                val usbCharge = chargePlug == BatteryManager.BATTERY_PLUGGED_USB
                val acCharge = chargePlug == BatteryManager.BATTERY_PLUGGED_AC
                val wirelessCharge = chargePlug == BatteryManager.BATTERY_PLUGGED_WIRELESS
                
                batteryInfo["chargingSource"] = when {
                    usbCharge -> "USB"
                    acCharge -> "AC"
                    wirelessCharge -> "Wireless"
                    else -> "None"
                }
                
                // Battery health
                val health = batteryStatus.getIntExtra(BatteryManager.EXTRA_HEALTH, -1)
                batteryInfo["health"] = when (health) {
                    BatteryManager.BATTERY_HEALTH_GOOD -> "Good"
                    BatteryManager.BATTERY_HEALTH_OVERHEAT -> "Overheat"
                    BatteryManager.BATTERY_HEALTH_DEAD -> "Dead"
                    BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "Over Voltage"
                    BatteryManager.BATTERY_HEALTH_UNSPECIFIED_FAILURE -> "Unspecified Failure"
                    BatteryManager.BATTERY_HEALTH_COLD -> "Cold"
                    else -> "Unknown"
                }
                
                // Battery technology
                val technology = batteryStatus.getStringExtra(BatteryManager.EXTRA_TECHNOLOGY)
                batteryInfo["technology"] = technology ?: "Unknown"
                
                // Battery temperature
                val temperature = batteryStatus.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1)
                batteryInfo["temperature"] = temperature / 10.0 // Convert from tenths of degree Celsius
                
                // Battery voltage
                val voltage = batteryStatus.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1)
                batteryInfo["voltage"] = voltage / 1000.0 // Convert from millivolts to volts
            }
            
        } catch (e: Exception) {
            batteryInfo["error"] = e.message ?: "Unknown error"
        }
        
        return batteryInfo
    }

    private fun getInstalledAppsCount(): Int {
        return try {
            val packageManager = packageManager
            val packages = packageManager.getInstalledPackages(PackageManager.GET_META_DATA)
            packages.size
        } catch (e: Exception) {
            0
        }
    }
}
