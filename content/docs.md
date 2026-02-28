---
title: "Docs"
description: "Integrate AnchorKit into an existing CameraX or Camera2 Android app in minutes"
---

AnchorKit hooks into your existing CameraX pipeline. You don't rewrite your camera stack — you call one function after the shutter fires.

---

## 1. Install

Add the dependency to your app's `build.gradle`:

```groovy
// settings.gradle — add the JitPack repo
dependencyResolutionManagement {
    repositories {
        maven { url 'https://jitpack.io' }
    }
}

// app/build.gradle
dependencies {
    implementation 'com.github.NEWO-J:AnchorKit:1.0.1'
}
```

Requires **Android API 24+** and the `CAMERA` permission (already in your manifest if you're using CameraX).

---

## 2. Initialize

Create one instance — typically in your `Activity` or `Application`:

```kotlin
val anchorKit = AnchorKit(
    context = this,
    apiKey  = "YOUR_API_KEY"
)
```

Get a free API key at [api.anchorkit.net](https://api.anchorkit.net).

---

## 3. Capture & submit in one call

The simplest integration. Call `captureAndSubmit` from your shutter button handler and you're done:

```kotlin
binding.btnShutter.setOnClickListener {
    lifecycleScope.launch {
        val result = anchorKit.captureAndSubmit(lifecycleOwner = this@CameraActivity)

        val hash    = result.photo.hash   // SHA-256 of the raw image bytes
        val receipt = result.receipt      // server confirmation + anchoring status
    }
}
```

That's it. AnchorKit handles device integrity checking, hardware attestation, hashing, and submission atomically.

---

## 4. Drop into an existing camera UI

If you already manage `ImageCapture` yourself, use the two-step flow instead. Your shutter code stays the same — you just hand the hash to AnchorKit afterward:

```kotlin
// In your existing OnImageCapturedCallback — no changes to the capture itself
override fun onCaptureSuccess(image: ImageProxy) {
    val bytes = ByteArray(image.planes[0].buffer.remaining())
    image.planes[0].buffer.get(bytes)
    val width  = image.width
    val height = image.height
    val hash   = sha256Hex(bytes)         // your existing hash util
    val ts     = System.currentTimeMillis()
    image.close()

    // Hand off to AnchorKit — can be deferred to a background coroutine
    lifecycleScope.launch {
        val receipt = anchorKit.submitPhoto(
            hash      = hash,
            timestamp = ts,
            width     = width,
            height    = height
        )
    }
}
```

`submitPhoto` fetches a server nonce, signs the hash with the device's hardware-backed attestation key (StrongBox / TEE), and submits. Your camera code is untouched.

---

## 5. Error handling

All functions are `suspend` and throw typed errors you can catch individually:

```kotlin
try {
    val result = anchorKit.captureAndSubmit(this)
} catch (e: AnchorKitError.DeviceIntegrityError) {
    // Rooted device or unlocked bootloader — attestation not possible
} catch (e: AnchorKitError.AttestationError) {
    // Hardware signing failed
} catch (e: AnchorKitError.NetworkError) {
    // No connectivity
} catch (e: AnchorKitError.ApiError) {
    // Non-2xx from the API — e.statusCode, e.body
}
```

---

## What you get back

The `receipt` returned by any submit call tells you the anchoring status:

| Field | Description |
|---|---|
| `hash_id` | Server-assigned ID for this submission |
| `day` | UTC date the submission will be anchored |
| `attestation_verified` | `true` if hardware attestation was verified server-side |
| `cert_fingerprint` | Fingerprint of the attestation certificate |

Hashes are batched nightly into a Merkle tree. The root is posted to Solana every night at midnight UTC. After anchoring you can verify any submission with `anchorKit.verify(hash)` or download a self-contained proof bundle with `anchorKit.downloadProof(hash)`.
