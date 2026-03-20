

# Plan: Update README for Polkadot Hub Submission + Generate Screenshots

## What Changed
The project is now being submitted for a **Polkadot Hub DeFi hackathon**, not the World ID/Chainlink track. Smart contracts have been deployed on Polkadot Hub EVM:
- **MarketRegistry**: `0x261492BF6f99899561b7E08582697fE7b0775947`
- **BettingPool**: `0x704C6d2f06232D722e0AaEf1C1D4FcB1aB4103E1`
- **LiquidityPool**: `0x8FD8AD0170738a2f3d24F9b71b51cDdb9609Af6D`

## Tasks

### 1. Rewrite README.md completely
Remove all World ID, CRE/Chainlink references. New structure:
- **Introduction**: Destaker — DeFi yield prediction market on Polkadot Hub
- **Problem**: Lack of yield hedging tools, information asymmetry, no on-chain settlement
- **Goals**: Decentralized yield prediction, transparent AI-driven pricing, on-chain settlement via Polkadot EVM
- **Solution**: Prediction markets with smart contracts on Polkadot Hub + AI pricing
- **How It Works** (ASCII chart): User → Frontend → Smart Contracts (Polkadot Hub) → DeFiLlama + AI
- **Smart Contracts Section**: Explain each contract:
  - `MarketRegistry` — Creates and tracks prediction markets (asset, threshold, settlement date)
  - `BettingPool` — Handles YES/NO position bets, holds funds, distributes payouts
  - `LiquidityPool` — Provides liquidity for market trading, LP rewards
- **What is Polkadot Hub EVM**: Explain EVM compatibility on Polkadot, why we chose it
- **Evidence of deployment**: Contract addresses as on-chain proof on Polkadot Hub explorer
- **AI Prediction Engine**: Keep Gemini AI + DeFiLlama section
- **Tech Stack**: Update to include Polkadot Hub, Solidity, remove World ID/Chainlink
- **Repo Structure**: Update file labels, remove World ID/CRE labels, add smart contract labels
- **Architecture diagram** (ASCII): Show smart contract integration flow
- **Getting Started**: Clean setup instructions

### 2. Take multiple screenshots for DoraHack submission
- Homepage with markets
- Market detail page with trading panel
- Connect wallet modal
- Portfolio page
- Different market categories filtered

### 3. Generate product shots
Use the product shot generator to create polished screenshots with frames for DoraHack upload.

## Technical Details

### Files Modified
- `README.md` — Complete rewrite

### Files NOT modified (code stays the same)
- No frontend/backend code changes needed — this is a documentation + screenshot task only

### Smart Contract Architecture (for README)
```
MarketRegistry (0x2614...)
  ├── createMarket(asset, threshold, settlementDate)
  ├── getMarket(marketId) → Market struct
  └── listMarkets() → all active markets

BettingPool (0x704C...)
  ├── placeBet(marketId, side, amount)
  ├── claimWinnings(marketId)
  └── getPositions(user) → user's bets

LiquidityPool (0x8FD8...)
  ├── addLiquidity(marketId, amount)
  ├── removeLiquidity(marketId, shares)
  └── claimFees(marketId)
```

### Flow Diagram (for README)
```
User → React Frontend → Polkadot Hub EVM
                           ├── MarketRegistry (create/query markets)
                           ├── BettingPool (YES/NO positions)
                           └── LiquidityPool (provide liquidity)
                        ↕
              Backend (Edge Functions)
                 ├── DeFiLlama API (live yield data)
                 └── Gemini AI (prediction engine)
```

