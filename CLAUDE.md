# CLAUDE.md

## Working Practices

- Always use the right skill for the job — check available skills before starting any task (brainstorming, debugging, TDD, branch setup, etc.)
- Always work in a feature branch unless the user explicitly says otherwise
- Before planning any task, read the architecture design doc: `docs/superpowers/specs/2026-03-29-mayhem-architecture-design.md`

## Project Status

In active development. Monorepo scaffolded, rendering skeleton complete. Next: shared types & protocol. Living task list: `docs/superpowers/plans/2026-03-29-mayhem-plan.md`.

## Git Workflow

Never commit to `main` directly. Push a feature branch; user merges via GitHub PR. Pushing to `main` triggers GitHub Actions → Docker image → GitHub Container Registry → manual redeploy in Portainer on Hetzner VPS.

## Commands

```bash
docker compose up    # local dev
npm run dev          # Vite client dev server
npm run build        # tsc + vite build (server + client)
npm start            # run built server
npm run typecheck    # type-check all packages
npm run lint         # ESLint
npm run check        # format + typecheck + lint:fix + knip (run before PRs)
```

## Package Structure

```
packages/
  shared/         # network types, bitecs component defs, ModelType enum, terrain gen
  engine/         # GameInstance factory, 20hz loop, Socket.io wiring, Rapier init
  games/mayhem/   # mayhem systems, factories, world config
  client/         # Three.js renderer, lobby screen, asset registry
  server/         # entry point — loads game modes, starts instances
```

`shared/` is the source of truth for anything client and server must agree on.

## Architecture

> Target design — always check source files for current implementation state.

**Server-authoritative at 20hz.** Clients send `InputPacket` (actions, never positions). Server ticks every 50ms using real `dt` from `performance.now()` — loop jitter means dt varies, never assume 50ms. Broadcasts `WorldSnapshot` to the Socket.io room each tick. Client ECS is visual-only.

**ECS (bitecs).** Entities are integer IDs; components are typed arrays (`Position.x[eid]`). Systems are pure functions over queries. `Changed()` skips untouched entities — static props are nearly free.

**Multi-game instances.** Each game is a `GameMode` (`setup()` + `systems[]`). `GameInstance` = isolated bitecs world + Rapier + 20hz loop. Adding a new game = new `GameMode` + one line in server startup.

**Shared terrain.** Simplex noise heightmap in `shared/terrain.ts` runs on both sides from the same seed. Client builds Three.js mesh; server builds Rapier heightfield. Only the seed goes over the network.

**Entity factories.** One function per type (`spawnPlayer`, `spawnBullet`, `spawnTree`). `ModelType` enum in `shared/models.ts` maps numeric IDs to GLB paths. Server stores the number; client asset registry resolves it to a mesh.

## Network Protocol (`shared/types.ts`)

`InputPacket` (client→server): `sequenceNumber`, `timestamp`, `actions: PlayerActions`
`WorldSnapshot` (server→all): `tick`, `timestamp`, `entities: EntitySnapshot[]`
`EntitySnapshot`: `id`, `type`, `modelId`, `position`, `rotation`, `health?`

`sequenceNumber` and `tick` cost nothing now but unlock client-side prediction and delta compression later without protocol changes.

## Stack

Three.js · bitecs · Rapier.js (WASM) · Socket.io · Node.js/TypeScript · Vite · Docker on Hetzner via Portainer. Single container: Express serves the compiled client, Socket.io on the same HTTP server.

## Player Persistence

Players identified by UUID in `localStorage` (not socket ID — changes on reconnect). Server: `Map<uuid, SavedPlayerState>` in `server/playerStore.ts`. State lost on restart — swapping the Map for a DB is a one-file change.
