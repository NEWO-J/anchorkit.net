# Getting Started

## Requirements

Your project needs:

- Android **API level 24+** (Android 7.0 Nougat or higher)
- **CameraX 1.3+** pipeline
- A valid **AnchorKit API key** (sign up at anchorkit.net)
- Kotlin **2.1.0+** or Java **11+**

## Installation

Add the AnchorKit dependency to your app-level `build.gradle`:

```groovy
dependencies {
    implementation 'net.anchorkit:sdk:1.0.1'
}
```

Or with Kotlin DSL (`build.gradle.kts`):

```kotlin
dependencies {
    implementation("net.anchorkit:sdk:1.0.1")
}
```

## Quick Start

Create an `AnchorKit` instance. The constructor takes your application context and your API key:

```kotlin
val anchorKit = AnchorKit(
    context = applicationContext,
    apiKey = "YOUR_API_KEY_HERE"
)
```

### Capturing Anchored Media

Call `captureAndSubmit` from any coroutine scope. The SDK handles device integrity checks, photo capture, hardware attestation, and submission in a single call:

```kotlin
lifecycleScope.launch {
    try {
        val result: CaptureResult = anchorKit.captureAndSubmit(lifecycleOwner)

        // result.photo.hash -SHA-256 of the captured image
        // result.photo.timestamp -capture time (milliseconds)
        // result.receipt -server receipt confirming the hash was accepted
        Log.d("AnchorKit", "Captured with hash: ${result.photo.hash}")
    } catch (e: AnchorKitError.DeviceIntegrityError) {
        Log.e("AnchorKit", "Device is rooted or uses an emulator", e)
    } catch (e: AnchorKitError.AttestationError) {
        Log.e("AnchorKit", "Hardware attestation failed", e)
    } catch (e: AnchorKitError.NetworkError) {
        Log.e("AnchorKit", "Network error", e)
    }
}
```

The calling Activity or Fragment must hold `android.permission.CAMERA` before invoking this function; the SDK does not request permissions itself.

> **Note:** `CaptureResult.receipt` confirms the hash was received and will be included in tonight's nightly Merkle batch. A `PortableProof` (containing the full Merkle path and on-chain reference) becomes available via `downloadProof(hash)` after the nightly anchor runs.

## Next Steps

- Read the [SDK Reference](#sdk-reference) for all available methods and data classes
- Learn how [Verification](#verification) works
- Browse the [Anchor Log](#anchor-log) for recent on-chain anchors
