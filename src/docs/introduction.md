# Introduction

## What is AnchorKit?

AnchorKit is a mobile SDK that cryptographically anchors photos and videos to the Solana blockchain at the moment of capture. Every piece of media gets a tamper-evident proof bundle -a SHA-256 hash committed to a Merkle tree, anchored on-chain -so authenticity can be verified by anyone, forever.

No trusted intermediaries. No cloud dependency at verify time. Just math.

## How It Works

When a user captures media through an AnchorKit-enabled app, the SDK:

1. Computes a SHA-256 hash of the raw media bytes
2. Bundles that hash into a daily Merkle tree alongside other submissions
3. Anchors the Merkle root to the Solana blockchain via a signed transaction
4. Returns a proof bundle to the device containing the Merkle path and on-chain transaction ID

To verify later, anyone can recompute the hash from the original file, walk the Merkle path, and confirm the root matches the on-chain record -completely offline, using only a public Solana RPC.

## Why Solana?

Solana has low transaction fees, fast finality, and broad public RPC support -practical for anchoring media at any volume. Anchoring costs fractions of a cent per batch, and verification is a single RPC call to any public node.

## Trust Model

Verification requires **zero trust** in AnchorKit or any other third party. The proof bundle and a public Solana node are all that's needed. Even if AnchorKit's servers went offline tomorrow, every previously anchored piece of media would remain permanently verifiable.
