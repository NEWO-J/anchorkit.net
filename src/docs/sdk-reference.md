# SDK Reference

## AnchorKit

The main entry point for the SDK. Instantiated with a context and an API key.

### Constructor

```kotlin
AnchorKit(
    context: Context,
    apiKey: String,
    baseUrl: String = "https://api.anchorkit.net"
)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | `Context` | Application or activity context |
| `apiKey` | `String` | Your AnchorKit API key |
| `baseUrl` | `String` | API base URL (default: production) |

---

### `captureAndSubmit(lifecycleOwner, flashMode?)`

Captures a photo, signs the hash with the hardware-backed attestation key, and submits the hash + attestation to the API in one atomic step. This is the primary method for producing an attested photo submission.

Suspending -call from a coroutine scope.

| Parameter | Type | Description |
|-----------|------|-------------|
| `lifecycleOwner` | `LifecycleOwner` | Activity or Fragment binding the CameraX lifecycle |
| `flashMode` | `Int` | `ImageCapture.FLASH_MODE_OFF` (default), `ON`, or `AUTO` |

**Returns** `CaptureResult`

**Throws**
- `AnchorKitError.DeviceIntegrityError` -device shows signs of being rooted or is an emulator
- `AnchorKitError.AttestationError` -hardware attestation failed
- `AnchorKitError.NetworkError` -connectivity failure
- `AnchorKitError.ApiError` -non-2xx API response

The calling Activity or Fragment must hold `android.permission.CAMERA` before invoking.

---

### `capturePhoto(lifecycleOwner, lensFacing?, flashMode?)`

Captures a photo without submitting it. Returns the raw image bytes and SHA-256 hash. Use this to split capture from submission -for example, capture in the camera Activity and submit from a background coroutine on the result screen.

Pass the returned `PhotoResult` directly to `submitPhoto` to complete an attested submission.

| Parameter | Type | Description |
|-----------|------|-------------|
| `lifecycleOwner` | `LifecycleOwner` | Activity or Fragment binding the CameraX lifecycle |
| `lensFacing` | `Int` | `CameraSelector.LENS_FACING_BACK` (default) or `LENS_FACING_FRONT` |
| `flashMode` | `Int` | `ImageCapture.FLASH_MODE_OFF` (default), `ON`, or `AUTO` |

**Returns** `PhotoResult`

**Throws**
- `AnchorKitError.DeviceIntegrityError` -device shows signs of tampering

---

### `submitPhoto(photo)`

Sign and submit a `PhotoResult` previously obtained from `capturePhoto`. Fetches a fresh nonce, signs the hash and metadata with the hardware-backed attestation key, and submits to the API.

The `PhotoResult` type has an internal constructor -it can only be produced by the SDK's own `capturePhoto` (or `captureAndSubmit`). This prevents callers from injecting an arbitrary hash: the hash submitted is always the one computed directly from the camera-captured bytes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `photo` | `PhotoResult` | Result returned by `capturePhoto` |

**Returns** `VerificationReceipt`

**Throws**
- `AnchorKitError.AttestationError` -hardware signing failed
- `AnchorKitError.NetworkError` -connectivity failure
- `AnchorKitError.ApiError` -non-2xx API response

---

### `verify(hash)`

Check whether a hash has been anchored on-chain. Makes a single API call; no local cryptography is performed.

| Parameter | Type | Description |
|-----------|------|-------------|
| `hash` | `String` | Lowercase hex SHA-256 hash (64 chars) |

**Returns** `VerificationResult`

---

### `downloadProof(hash)`

Download a `PortableProof` for a hash that has already been anchored. Store the returned object in your own database -it is permanently verifiable without contacting AnchorKit.

Only available after the nightly anchor has run for the day the hash was submitted. Returns HTTP 404/202 if the hash is not yet anchored.

**Returns** `PortableProof`

---

### `verifyLocally(proof)`

Verify a `PortableProof` without contacting the AnchorKit API. Performs two independent checks:

1. **Local Merkle math** -recomputes the Merkle root from the proof path using SHA-256. No network required.
2. **On-chain root lookup** -re-derives the expected PDA from the proof's `solana_program` and `solana_chunk_index`, fetches the PDA account from a public Solana RPC, and compares the stored root against the proof's `merkle_root`.

**Returns** `SolanaVerifier.LocalVerificationResult`

---

### `startVideoRecording(lifecycleOwner, lensFacing?, previewSurfaceProvider?, cameraSelector?)`

Begin recording video. Returns a `VideoRecordingSession` immediately; recording is already in progress. Call `stopVideoAndSubmit` when the user taps stop.

**Returns** `VideoRecordingSession`

---

### `stopVideoAndSubmit(session)`

Stop an active recording, hash the output file, attest, and submit. Suspends until the encoder finalises the file.

**Returns** `VideoCaptureResult`

---

### `subscribeToNotifications(email)`

Subscribe an email address to receive a notification after each nightly batch is anchored.

**Returns** `String` (confirmation message)

---

### `unsubscribeFromNotifications(email)`

Unsubscribe an email address from nightly batch notifications.

---

## Data Classes

### `CaptureResult`

Returned by `captureAndSubmit`.

| Field | Type | Description |
|-------|------|-------------|
| `photo` | `PhotoResult` | Captured image data and hash |
| `receipt` | `VerificationReceipt` | Server receipt confirming the hash was stored |

---

### `PhotoResult`

| Field | Type | Description |
|-------|------|-------------|
| `data` | `ByteArray` | Raw JPEG bytes as delivered by the camera |
| `hash` | `String` | SHA-256 hex digest of `data` (64 lowercase chars) |
| `timestamp` | `Long` | Capture time in milliseconds since epoch |
| `width` | `Int` | Image width in pixels |
| `height` | `Int` | Image height in pixels |

---

### `VerificationReceipt`

Returned by `captureAndSubmit` (via `CaptureResult.receipt`) and `submitPhoto`. Confirms the hash was accepted and stored for nightly batching.

| Field | Type | Description |
|-------|------|-------------|
| `hash` | `String` | The submitted hash |
| `day` | `String` | Submission date (`YYYY-MM-DD`) |
| `hash_id` | `Int` | Position in the daily batch (used for Merkle ordering) |
| `table` | `String` | Internal hot-storage table identifier |
| `timestamp` | `Long?` | Server-recorded epoch seconds of receipt |
| `attestation_verified` | `Boolean?` | Whether hardware attestation was validated |
| `cert_fingerprint` | `String?` | SHA-256 fingerprint of the device leaf certificate |
| `cert_valid_from` | `String?` | Certificate validity start (ISO 8601) |
| `cert_valid_until` | `String?` | Certificate validity end (ISO 8601) |

---

### `VerificationResult`

Returned by `verify`. Reflects the current anchor status of a hash.

| Field | Type | Description |
|-------|------|-------------|
| `hash` | `String` | The queried hash |
| `verified` | `Boolean` | `true` if anchored on-chain |
| `day` | `String?` | Submission date |
| `timestamp` | `Long?` | Submission epoch seconds |
| `hash_id` | `Int?` | Position in daily batch |
| `merkle_proof` | `List<List<String>>?` | Proof path: each element is `[sibling_hash, "left"\|"right"]` |
| `merkle_root` | `String?` | Merkle root committed on-chain |
| `solana_tx` | `String?` | Solana transaction signature (audit trail) |
| `explorer_url` | `String?` | Block explorer link |
| `solana_program` | `String?` | On-chain programme ID |
| `chain` | `String?` | `"devnet"` or `"mainnet"` |
| `attestation_verified` | `Boolean?` | Whether hardware attestation was validated |
| `message` | `String?` | Human-readable status message |

---

### `PortableProof`

A self-contained proof bundle. Obtained via `downloadProof`; verified via `verifyLocally`. Store this in your own database -it is permanently verifiable without AnchorKit.

| Field | Type | Description |
|-------|------|-------------|
| `schema_version` | `Int` | Always `1` |
| `hash` | `String` | SHA-256 hex hash of the image |
| `day` | `String` | Submission date (`YYYY-MM-DD`) |
| `timestamp` | `Long` | Submission epoch seconds |
| `hash_id` | `Int` | Position in daily batch (0-indexed) |
| `merkle_root` | `String` | Merkle root anchored on-chain (`0x`-prefixed hex) |
| `merkle_proof` | `List<List<String>>` | Proof path: each element is `[sibling_hash, "left"\|"right"]` |
| `solana_program` | `String` | On-chain programme ID |
| `solana_registry_pda` | `String?` | Base-58 address of the registry account |
| `solana_chunk_index` | `Int?` | Chunk index used to derive `solana_registry_pda` |
| `solana_tx` | `String?` | Transaction signature (audit trail) |
| `chain` | `String` | `"devnet"` or `"mainnet"` |

### Offline Verification

```kotlin
val result: SolanaVerifier.LocalVerificationResult = anchorKit.verifyLocally(proof)
if (result.valid) {
    // Hash is confirmed on-chain -no AnchorKit server contacted
} else {
    Log.e("AnchorKit", "Verification failed: ${result.reason}")
}
```

---

### `SolanaVerifier.LocalVerificationResult`

| Field | Type | Description |
|-------|------|-------------|
| `valid` | `Boolean` | `true` if all verification steps passed |
| `reason` | `String?` | Human-readable failure reason when `valid` is `false` |
