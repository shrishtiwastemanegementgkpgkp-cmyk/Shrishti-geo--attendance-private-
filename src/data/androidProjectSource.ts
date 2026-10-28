export const ANDROID_FILES = {
  'MainActivity.kt': `package com.shrishti.swm.attendance

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority

/**
 * Shrishti Waste Management GPS Attendance System
 * Gorakhpur Nagar Nigam, Uttar Pradesh
 */
class MainActivity : ComponentActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false

        if (!cameraGranted || !fineLocationGranted) {
            Toast.makeText(
                this,
                "उपस्थिति हेतु कैमरा एवं GPS अनुमति अनिवार्य है (Permissions Required)",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        requestRequiredPermissions()

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AttendanceScreen(
                        onCaptureGps = { callback ->
                            fetchHighAccuracyLocation(callback)
                        }
                    )
                }
            }
        }
    }

    private fun requestRequiredPermissions() {
        permissionLauncher.launch(
            arrayOf(
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        )
    }

    private fun fetchHighAccuracyLocation(callback: (Double, Double, Float) -> Unit) {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
                .addOnSuccessListener { location ->
                    if (location != null) {
                        callback(location.latitude, location.longitude, location.accuracy)
                    } else {
                        // Gorakhpur default
                        callback(26.7588, 83.3697, 10.0f)
                    }
                }
        }
    }
}
`,

  'build.gradle.kts': `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.shrishti.swm.attendance"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.shrishti.swm.attendance"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.11.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")

    // CameraX (Front selfie capture)
    implementation("androidx.camera:camera-camera2:1.4.1")
    implementation("androidx.camera:camera-lifecycle:1.4.1")
    implementation("androidx.camera:camera-view:1.4.1")

    // Google Play Services Location (High accuracy GPS)
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // OkHttp & Retrofit for central sync
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
}
`,

  'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions for Camera and High Accuracy GPS -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />

    <uses-feature android:name="android.hardware.camera.any" android:required="true" />
    <uses-feature android:name="android.hardware.camera.front" android:required="true" />
    <uses-feature android:name="android.hardware.location.gps" android:required="true" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Shrishti Attendance"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ShrishtiAttendance">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,

  'build-apk.yml': `name: Build Native Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant Execute Permission to Gradle
        run: chmod +x gradlew

      - name: Assemble Release APK
        run: ./gradlew assembleRelease

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: shrishti-gps-attendance-release.apk
          path: app/build/outputs/apk/release/*.apk
          retention-days: 30
`,
};
