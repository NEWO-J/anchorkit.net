# Verification

## Overview

Verification requires **zero trust** in any third party, including AnchorKit. All you need is the original file and a public Solana RPC endpoint.

## How Verification Works

### Step 1: Hash the File

Compute the SHA-256 hash of the raw media bytes. This is the fingerprint that was submitted at capture time.

```kotlin
val hash = MessageDigest.getInstance("SHA-256")
    .digest(file.readBytes())
    .joinToString("") { "%02x".format(it) }
```

### Step 2: Look Up the Proof

Query the AnchorKit API (or use the locally stored proof bundle from the SDK) to retrieve the Merkle proof for this hash.

```
GET https://api.anchorkit.net/api/verify-hash/{hash}
```

The response includes the Merkle path, the Merkle root, and the Solana transaction ID.

### Step 3: Walk the Merkle Path

Recompute the Merkle root by hashing the file hash together with each sibling in the proof path:

```kotlin
var current = fileHash
for (sibling in merklePath) {
    current = sha256(current + sibling)
}
// current should equal merkleRoot
```

### Step 4: Confirm On-Chain

Fetch the registry account (PDA) directly and confirm the Merkle root stored on-chain for the proof's date matches the root you computed:

```
POST https://api.mainnet-beta.solana.com
  { "method": "getAccountInfo", "params": [solana_registry_pda, {"encoding":"base64"}] }
```

Parse the borsh-encoded account data to find the entry whose `date` field matches the proof's `day`. If the root in that entry matches the root you computed in Step 3, the file is authentic.

Note: `solana_tx` in the proof bundle is an audit-trail reference to the transaction that originally posted the root. Verification reads the account state directly, not the transaction data.

## Verification States

| State | Meaning |
|-------|---------|
| **Verified** | Hash found, Merkle proof valid, on-chain confirmed |
| **Pending** | Hash submitted but daily anchor window not yet closed |
| **Not Found** | Hash not in the AnchorKit registry |
| **Invalid** | Hash found but proof verification failed |

## Using the Web Verifier

Go to [anchorkit.net/verify](/verify):

1. Drop or select your media file
2. The page computes the SHA-256 hash client-side (nothing is uploaded)
3. The hash is sent to the AnchorKit API
4. Results show the verification status and proof details

Only the hash is transmitted; no file data ever leaves your device.

## API Reference

### `GET /api/verify-hash/:hash`

Verify a SHA-256 hash against the AnchorKit registry.

**Parameters**

| Name | In | Description |
|------|----|-------------|
| `hash` | path | Lowercase hex SHA-256 string (64 chars) |

**Response**

```json
{
  "hash": "a3f2...",
  "verified": true,
  "pending_anchor": false,
  "merkle_proof": [["b1c2...", "right"], ["d3e4...", "left"]],
  "solana_tx": "5xYz...",
  "explorer_url": "https://explorer.solana.com/tx/5xYz...",
  "day": "2025-01-15",
  "timestamp": 1736985600,
  "hash_id": 42,
  "attestation_verified": true
}
```

Each element of `merkle_proof` is a two-element array `[sibling_hash, "left"|"right"]` indicating the sibling's position at that level of the tree.

### `GET /api/anchors`

Returns the most recent daily anchor records.

**Response**

An array of anchor objects, each containing the date, hash count, Merkle root, and Solana transaction details.
