# Mayhem — Plan

A living todo list. Move things between sections as priorities shift. Keep **Now** to one or two items max.

See `docs/superpowers/specs/2026-03-29-mayhem-architecture-design.md` for the full architecture.

---

## Now

- [ ] **Project setup** — scaffold the monorepo (`packages/client`, `packages/server`, `packages/shared`), configure TypeScript for all three, set up Vite for the client, wire up package cross-references so `shared` is importable from both sides. Add `docker-compose.yml` for local dev and a `Dockerfile` for the single container. Add GitHub Actions workflow to build and push to GitHub Container Registry on push to main. Goal: `docker compose up` runs locally, a push to main produces a deployable image.

---

## Up Next

- [ ] **Rendering skeleton** — initialise a Three.js scene on the client. Flat green plane, a directional light, a camera positioned above it. Open the browser and see something. No networking, no physics, no game logic. Just proof the rendering pipeline works and something is visible on day one.

- [ ] **Shared types & protocol** — define all types that cross the network in `packages/shared/types.ts`: `InputPacket`, `PlayerActions`, `WorldSnapshot`, `EntitySnapshot`. Define `ModelType` enum in `shared/models.ts`. Define bitecs component definitions (`Position`, `Velocity`, `Health`, `Renderable`, etc.) in `shared/components.ts`. This is the contract everything else builds on.

- [ ] **Server + Networking** — set up the bitecs world and 20hz game loop on the server (`performance.now()` for real `dt`). Add Socket.io. Handle `connect`: assign a player entity, send `init` with world seed and player ID. Handle `disconnect`: remove the player entity. Broadcast a `WorldSnapshot` every tick. Client connects and logs received snapshots. These two are merged because neither is meaningful without the other.

- [ ] **Input + Player movement** — implement `InputMapper` on the client (keyboard + mouse → `PlayerActions`, wrapped in `InputPacket` with sequence number and timestamp, sent to server). On the server, add `spawnPlayer` factory and a `MovementSystem` that reads queued input, applies `velocity × dt` to position via Rapier capsule collider. Client spawns a placeholder box mesh for each player ID in the snapshot and interpolates its position. First playable moment: open browser, move a box around.

- [ ] **Deployment** — configure Portainer stack on Hetzner VPS using the GitHub Container Registry image. Verify the full loop: `git push → GitHub Actions builds image → image pushed → manual redeploy in Portainer → live`. Write deploy steps in the README. Do this early so every feature after this point is immediately visible to anyone with the URL.

---

## Backlog

- [ ] **Terrain generation** — implement the simplex noise heightmap generator in `shared/terrain.ts`. Takes a seed, returns a heightmap array. Tunable amplitude and scale. Server builds a Rapier heightfield from it. Client replaces the flat plane with a Three.js mesh built from the same data. Same seed = same world on both sides, nothing sent over the network.

- [ ] **Physics** — players now collide with terrain and don't fall through. Gravity works. Rapier capsule collider on each player. Jumping.

- [ ] **FPS camera** — attach a `PerspectiveCamera` to the local player. Mouse movement rotates it. Pointer lock on click. Player now looks around a world in first person.

- [ ] **Multiplayer visible** — other players appear as placeholder boxes in the right positions. You can see someone else moving around. The shared world feeling lands here.

- [ ] **Character model** — replace placeholder boxes with loaded GLB characters (Mixamo or Quaternius). Wire up `AnimationMixer`: idle when still, walk when moving. Client asset registry maps `ModelType` numbers to GLB paths.

- [ ] **Shooting** — implement `spawnBullet` factory on the server. When `actions.shoot` is true and cooldown allows, server spawns a bullet with velocity in the aim direction. `BulletSystem` moves bullets each tick. `LifetimeSystem` despawns after 3 seconds. Client renders bullets as small meshes.

- [ ] **Gamepad input** — extend `InputMapper` to read from the Gamepad API. Same `PlayerActions` output. No game logic changes.

- [ ] **Health & damage** — bullets that collide with a player reduce `Health`. Player despawns on death and respawns after a delay. Health shown in a basic HUD.

- [ ] **Props** — implement `spawnTree` and `spawnRock` factories. Place them deterministically from the terrain seed. Client renders with Kenney GLB assets. World starts feeling inhabited.

- [ ] **Shadows & lighting pass** — shadow maps on the directional light, casting shadows on terrain, players, and props. Tune light balance. Quick visual win.

- [ ] **Entity factories cleanup** — review all factories for consistent component sets and physics setup. Ensure all `ModelType` values and client asset registry entries are in place.

---

## Done

