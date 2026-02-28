---
title: "Verify a Photo"
description: "Check if a photo was taken with AnchorKit and anchored to the Solana blockchain"
---

{{< verify-demo >}}

<div class="verify-explainer">

### How it works

1. **You select a photo** — it stays on your device. Nothing is uploaded.
2. **Your browser computes a SHA-256 fingerprint** of the raw image bytes using the Web Crypto API.
3. **We query the AnchorKit API** with just the 64-character hex hash.
4. **You see the result** — verified on-chain, pending anchor, or not found.

### What the results mean

| Result | Meaning |
|---|---|
| ✅ Verified & Anchored | The photo's hash is in a Merkle tree whose root is posted to Solana. Immutable proof. |
| ⏳ Pending Anchor | Submitted today via AnchorKit — will be anchored at midnight UTC. |
| ❌ Not Found | No AnchorKit record. The photo was not submitted via the AnchorKit camera app. |

### Privacy

The photo file **never leaves your browser**. Only the SHA-256 hash (a 64-character string) is sent to the API. A hash cannot be reversed into the original image.

</div>
