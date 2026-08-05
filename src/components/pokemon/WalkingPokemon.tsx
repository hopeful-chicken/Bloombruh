"use client";

// A small, purely decorative easter egg for the Pokemon Cards page: every
// 6-10 seconds, a real animated Pokemon sprite spawns and genuinely
// wanders the screen — picks a direction, walks it for a couple of
// seconds, picks a new one, bounces off the screen edges, and bobs
// vertically as it moves (a walking gait, not a flat glide). Driven by a
// single shared requestAnimationFrame loop (not one CSS animation per
// sprite) so direction changes and bouncing are real physics, not a fixed
// point-A-to-point-B keyframe. Capped at a handful on screen so a long
// visit doesn't quietly grow the DOM forever.
//
// Sprites are real animated GIFs from the PokeAPI/sprites GitHub repo
// (Pokemon Showdown/Smogon-community-sourced Gen V "Black & White" style
// sprites, explicitly credited as reusable in that repo's own README),
// served via jsDelivr's GitHub CDN mirror rather than raw.githubusercontent
// — GitHub's own docs ask that raw URLs not be hotlinked in production;
// jsDelivr exists specifically for this. Same non-commercial, educational,
// fan-project usage category as the card artwork already shown elsewhere
// on this page (via TCGdex).

import { useEffect, useRef, useState } from "react";

const DEX_IDS = [1, 4, 6, 7, 9, 25, 39, 52, 54, 94, 129, 131, 133, 143, 150];

const SPRITE_BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites/sprites/pokemon/versions/generation-v/black-white/animated";

const MAX_ON_SCREEN = 6;
const MIN_SPAWN_MS = 6000;
const MAX_SPAWN_MS = 10000;
const SPRITE_SIZE = 48;
const WALK_SPEED = 40; // px/second
const LIFETIME_S = 35; // despawn after wandering this long
const BOB_AMPLITUDE = 6; // px
const BOB_FREQUENCY = 4; // full bobs per second, roughly

type Walker = {
  key: number;
  dexId: number;
  x: number;
  y: number;
  angle: number; // radians, current walking direction
  nextTurnAt: number; // seconds elapsed at which to pick a new angle
  bornAt: number;
  zone: "left" | "right"; // stays in this side's margin band — the content column is off-limits
};

let nextKey = 0;

// This page's content sits in a centered max-w-5xl (1024px) column — these
// are the empty side margins on a wider screen, which is where "walk on
// the side/corners, away from the text" actually means. Falls back to a
// slim fixed band on narrow viewports where there's no real margin to speak of.
const CONTENT_WIDTH = 1024;
function sideMarginWidth(vw: number): number {
  return Math.max((vw - CONTENT_WIDTH) / 2, 70);
}

function spawnWalker(dexId: number, elapsed: number): Walker {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = sideMarginWidth(vw);
  const zone: Walker["zone"] = Math.random() < 0.5 ? "left" : "right";
  const x = zone === "left" ? Math.random() * margin : vw - Math.random() * margin;
  return {
    key: nextKey++,
    dexId,
    x,
    y: vh * (0.15 + Math.random() * 0.6),
    angle: randomAngleFor(zone),
    nextTurnAt: elapsed + 1.5 + Math.random() * 2.5,
    bornAt: elapsed,
    zone,
  };
}

function randomAngleFor(zone: "left" | "right"): number {
  // A gentle bias toward "mostly vertical wandering" so a walker spends
  // its time drifting up/down its own margin band rather than immediately
  // making a break for the text column.
  const vertical = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
  return zone === "left" ? vertical + (Math.random() - 0.5) * 0.6 : vertical + (Math.random() - 0.5) * 0.6;
}

export default function WalkingPokemon() {
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const walkersRef = useRef<Walker[]>([]);
  const countRef = useRef(0);
  const [, forceRender] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let spawnTimeout: ReturnType<typeof setTimeout>;
    const startTime = performance.now();

    function scheduleSpawn() {
      const delay = MIN_SPAWN_MS + Math.random() * (MAX_SPAWN_MS - MIN_SPAWN_MS);
      spawnTimeout = setTimeout(() => {
        if (cancelled) return;
        // Guard against spawning with garbage coordinates if the viewport
        // isn't actually laid out yet (0 width/height) — skip this cycle
        // rather than clustering a walker at the origin.
        if (countRef.current < MAX_ON_SCREEN && window.innerWidth > 100 && window.innerHeight > 100) {
          const elapsed = (performance.now() - startTime) / 1000;
          const dexId = DEX_IDS[Math.floor(Math.random() * DEX_IDS.length)];
          const walker = spawnWalker(dexId, elapsed);
          countRef.current += 1;
          walkersRef.current = [...walkersRef.current, walker];
          setWalkers(walkersRef.current);
        }
        scheduleSpawn();
      }, delay);
    }

    let raf: number;
    let lastFrame = performance.now();

    function tick(now: number) {
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      const elapsed = (now - startTime) / 1000;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let changed = false;
      walkersRef.current = walkersRef.current.filter((w) => {
        if (elapsed - w.bornAt > LIFETIME_S) {
          countRef.current = Math.max(0, countRef.current - 1);
          changed = true;
          return false;
        }
        return true;
      });

      const margin = sideMarginWidth(vw);
      const minY = vh * 0.12;
      const maxY = vh * 0.85;

      for (const w of walkersRef.current) {
        // Occasionally pick a new wander direction, not just at the edges
        // — this is what makes it "walk around" rather than beeline. Stays
        // biased toward this walker's own zone rather than a fully free
        // angle, so it doesn't immediately make a break for the text column.
        if (elapsed >= w.nextTurnAt) {
          w.angle = randomAngleFor(w.zone);
          w.nextTurnAt = elapsed + 1.5 + Math.random() * 2.5;
          changed = true;
        }

        let nx = w.x + Math.cos(w.angle) * WALK_SPEED * dt;
        let ny = w.y + Math.sin(w.angle) * WALK_SPEED * dt;

        // Bounce off both the outer screen edge and the inner boundary
        // where this zone's margin ends (i.e. where the text column
        // starts) — reflecting the angle so the walk stays continuous
        // instead of visibly snapping or crossing into the content.
        const outerEdge = w.zone === "left" ? -SPRITE_SIZE : vw;
        const innerEdge = w.zone === "left" ? margin : vw - margin;
        const zoneMin = w.zone === "left" ? outerEdge : innerEdge;
        const zoneMax = w.zone === "left" ? innerEdge : outerEdge;
        if (nx < zoneMin) {
          w.angle = Math.PI - w.angle;
          nx = zoneMin;
        } else if (nx > zoneMax) {
          w.angle = Math.PI - w.angle;
          nx = zoneMax;
        }
        if (ny < minY) {
          w.angle = -w.angle;
          ny = minY;
        } else if (ny > maxY) {
          w.angle = -w.angle;
          ny = maxY;
        }

        w.x = nx;
        w.y = ny;
        changed = true;
      }

      if (changed) forceRender((n) => n + 1);
      raf = requestAnimationFrame(tick);
    }

    scheduleSpawn();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      clearTimeout(spawnTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {walkers.map((w) => {
        const facingLeft = Math.cos(w.angle) < 0;
        const bob = Math.sin((performance.now() / 1000) * BOB_FREQUENCY * Math.PI) * BOB_AMPLITUDE;
        return (
          <img
            key={w.key}
            src={`${SPRITE_BASE}/${w.dexId}.gif`}
            alt=""
            className="absolute"
            width={SPRITE_SIZE}
            height={SPRITE_SIZE}
            style={{
              left: `${w.x}px`,
              top: `${w.y + bob}px`,
              transform: facingLeft ? "scaleX(-1)" : undefined,
            }}
            onError={() => {
              walkersRef.current = walkersRef.current.filter((x) => x.key !== w.key);
              countRef.current = Math.max(0, countRef.current - 1);
              setWalkers(walkersRef.current);
            }}
          />
        );
      })}
    </div>
  );
}
