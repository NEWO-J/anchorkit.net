# SDK Reference

## AnchorKit

The main entry point for the SDK.

### `AnchorKit.init(context)`

Initializes the SDK. Must be called before any other SDK methods, typically in your `Application.onCreate()`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | `Context` | Application context |

```kotlin
AnchorKit.init(applicationContext)
```

---

### `AnchorKit.wrap(imageCapture)`

Wraps a CameraX `ImageCapture` use case to automatically hash and submit captured images.

| Parameter | Type | Description |
|-----------|------|-------------|
| `imageCapture` | `ImageCapture` | A configured CameraX ImageCapture instance |

**Returns** `AnchoredImageCapture`

---

### `AnchorKit.wrapImageReader(width, height, format, maxImages)`

Creates an anchored `ImageReader` for use with Camera2 pipelines.

| Parameter | Type | Description |
|-----------|------|-------------|
| `width` | `Int` | Capture width in pixels |
| `height` | `Int` | Capture height in pixels |
| `format` | `Int` | `ImageFormat` constant (e.g. `JPEG`, `RAW_SENSOR`) |
| `maxImages` | `Int` | Max images held concurrently |

**Returns** `AnchoredImageReader`

---

## AnchoredImageCapture

### `takePicture(outputOptions, executor, callback)`

Captures a photo and submits its hash to AnchorKit. Mirrors the CameraX `ImageCapture.takePicture` API.

| Parameter | Type | Description |
|-----------|------|-------------|
| `outputOptions` | `OutputFileOptions` | Where to write the image |
| `executor` | `Executor` | Executor for the callback |
| `callback` | `OnAnchoredCallback` | Called on success or failure |

---

## AnchorResult

The result object returned to your callback after a successful capture.

| Field | Type | Description |
|-------|------|-------------|
| `hash` | `String` | SHA-256 hex digest of the raw image bytes |
| `timestamp` | `Long` | Unix epoch seconds at time of capture |
| `proofBundle` | `ProofBundle?` | Merkle proof, populated after the daily anchor window |
| `anchorTx` | `String?` | Solana transaction ID of the anchor, once confirmed |

---

## ProofBundle

A self-contained proof that a hash was included in an on-chain Merkle tree.

| Field | Type | Description |
|-------|------|-------------|
| `merkleRoot` | `String` | Root of the Merkle tree anchored on-chain |
| `merklePath` | `List<String>` | Sibling hashes needed to reconstruct the root |
| `anchorTx` | `String` | Solana transaction signature |
| `day` | `String` | Anchor date in `YYYY-MM-DD` format |

### Offline Verification

Given a `ProofBundle`, verification requires no network and no trust in AnchorKit:

```kotlin
val verified = ProofBundle.verify(
    fileHash = sha256OfYourFile,
    bundle = proofBundle,
    rpcUrl = "https://api.mainnet-beta.solana.com"
)
```

---

## Configuration

Pass a `AnchorKitConfig` to `init()` for fine-grained control:

```kotlin
AnchorKit.init(
    context = this,
    config = AnchorKitConfig(
        apiKey = "YOUR_KEY",          // Override manifest meta-data
        environment = Environment.MAINNET,
        hashAlgorithm = HashAlgorithm.SHA256,
        submitRetries = 3,
        logLevel = LogLevel.WARN
    )
)
```

| Option | Default | Description |
|--------|---------|-------------|
| `environment` | `MAINNET` | `MAINNET` or `DEVNET` |
| `hashAlgorithm` | `SHA256` | Hash function used for media fingerprinting |
| `submitRetries` | `3` | Number of retry attempts on network failure |
| `logLevel` | `WARN` | `VERBOSE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `NONE` |
