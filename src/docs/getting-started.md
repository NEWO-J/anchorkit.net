# Getting Started

## Requirements

Your project needs:

- Android **API level 24+** (Android 7.0 Nougat or higher)
- **CameraX 1.3+** or **Camera2** pipeline
- A valid **AnchorKit API key** (sign up at anchorkit.net)
- Kotlin **1.9+** or Java **11+**

## Installation

Add the AnchorKit dependency to your app-level `build.gradle`:

```groovy
dependencies {
    implementation 'net.anchorkit:sdk:1.0.0'
}
```

Or with Kotlin DSL (`build.gradle.kts`):

```kotlin
dependencies {
    implementation("net.anchorkit:sdk:1.0.0")
}
```

Then add your API key to `AndroidManifest.xml`:

```xml
<meta-data
    android:name="net.anchorkit.API_KEY"
    android:value="YOUR_API_KEY_HERE" />
```

## Quick Start

Initialize the SDK in your `Application` class:

```kotlin
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AnchorKit.init(this)
    }
}
```

### Capturing Anchored Media

Hook AnchorKit into your CameraX `ImageCapture` pipeline:

```kotlin
val anchoredCapture = AnchorKit.wrap(imageCapture)

anchoredCapture.takePicture(
    outputOptions,
    executor,
    object : AnchorKit.OnAnchoredCallback {
        override fun onSuccess(result: AnchorResult) {
            // result.hash — SHA-256 of the captured image
            // result.proofBundle — Merkle proof (available after daily anchor)
            Log.d("AnchorKit", "Captured with hash: ${result.hash}")
        }
        override fun onError(exception: AnchorException) {
            Log.e("AnchorKit", "Capture failed", exception)
        }
    }
)
```

### Camera2 Integration

If you're using Camera2 directly, pass the `ImageReader` surface to AnchorKit:

```kotlin
val anchoredReader = AnchorKit.wrapImageReader(
    width = 4032,
    height = 3024,
    format = ImageFormat.JPEG,
    maxImages = 2
)

// Use anchoredReader.surface as your capture target
captureSession.capture(captureRequest, callback, handler)
```

## Next Steps

- Read the [SDK Reference](#sdk-reference) for all available methods and configuration options
- Learn how [Verification](#verification) works
- Browse the [Anchor Log](#anchor-log) for recent on-chain anchors
