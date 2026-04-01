# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Pre-development — architecture and planning documents exist, no source code has been written yet. The first task is scaffolding the monorepo. See `docs/superpowers/plans/2026-03-29-mayhem-plan.md` for the living task list and `docs/superpowers/specs/2026-03-29-mayhem-architecture-design.md` for the full architecture.

## Development Commands

Once the monorepo is scaffolded:

```bash
docker compose up         # local dev (all packages together)
npm run build             # build all packages
npm run dev               # watch mode via Vite (client)
```

Deployment: `git push` to `main` → GitHub Actions builds Docker image → pushed to GitHub Container Registry → manual redeploy in Portainer on Hetzner VPS.

## Planned Package Structure

```
packages/
  shared/         # network types, bitecs component defs, ModelType enum, terrain gen
  engine/         # GameInstance factory, 20hz game loop, Socket.io wiring, Rapier init
  games/
    mayhem/       # mayhem systems, factories, world config
    arena/        # arena game mode (future)
  client/         # Three.js renderer, lobby screen, asset registry
  server/         # entry point — loads game modes, starts instances
```

`shared/` is the backbone of correctness. Anything both client and server must agree on lives here — if either side drifts, TypeScript catches it at compile time.

## Core Architecture

**Server-authoritative multiplayer at 20hz:**

- Clients send `InputPacket` (actions pressed, sequenceNumber, timestamp) — never positions
- Server simulates one tick every 50ms using real `dt` from `performance.now()` (not assumed 50ms — loop jitter means actual dt varies)
- Server broadcasts `WorldSnapshot` to all players in a Socket.io room each tick
- Clients render what the server says; client ECS is for visual-only effects

**ECS on both sides (bitecs):**

- Entities are integer IDs; components are typed arrays (`Position.x[eid]`)
- Systems are pure functions over queries
- `Changed()` queries skip untouched entities — static props cost almost nothing per tick

**Multi-game instances:**

- Each game is a `GameMode` with `setup()` and `systems[]`
- `GameInstance` = isolated bitecs world + Rapier simulation + 20hz loop
- Socket.io rooms route each client to the right instance
- Adding a new game = new `GameMode` + one line in server startup list

**Shared terrain (no network cost):**

- Simplex noise heightmap in `shared/terrain.ts` runs on both sides with the same seed
- Client builds Three.js mesh; server builds Rapier heightfield — guaranteed to match
- Only the seed is sent over the network (on connect)

**Entity factories (prefab pattern):**

- One function per entity type: `spawnPlayer()`, `spawnBullet()`, `spawnTree()`
- Defines all components, initial values, physics shape, and model in one place
- `ModelType` enum in `shared/models.ts` maps numeric IDs to GLB paths (e.g. `COW = 1`, `OAK_TREE = 2`)
- Server stores the number on the entity; snapshot carries it; client looks it up in asset registry

## Network Protocol Types (in `shared/types.ts`)

```typescript
interface InputPacket {
  sequenceNumber: number; // enables client-side prediction later at no cost now
  timestamp: number; // client clock for prediction reconciliation
  actions: PlayerActions;
}

interface WorldSnapshot {
  tick: number; // enables delta compression later
  timestamp: number; // server clock for interpolation
  entities: EntitySnapshot[];
}

interface EntitySnapshot {
  id: number; // server-assigned; client mirrors this ID
  type: 'player' | 'projectile' | 'prop'; // what it does
  modelId: number; // which GLB to render
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  health?: number;
}
```

`sequenceNumber` and `tick` are designed in from the start so client-side prediction and delta compression can be added later without protocol changes.

## Stack

| Concern    | Choice                              |
| ---------- | ----------------------------------- |
| Rendering  | Three.js                            |
| ECS        | bitecs                              |
| Physics    | Rapier.js (Rust/WASM)               |
| Networking | Socket.io                           |
| Server     | Node.js + TypeScript                |
| Bundler    | Vite                                |
| Hosting    | Docker on Hetzner VPS via Portainer |

Single Docker container: Express serves the compiled client, Socket.io runs on the same HTTP server.

## Player Persistence

Players identified by UUID in `localStorage` (not socket ID, which changes on reconnect). Server keeps `Map<uuid, SavedPlayerState>` in `server/playerStore.ts`. State is lost on server restart — swapping the Map for a database is a one-file change when needed.
