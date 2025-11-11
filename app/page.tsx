"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Scene = {
  id: string;
  label: string;
  description: string;
  start: number;
  end: number;
};

const WIDTH = 960;
const HEIGHT = 540;
const TOTAL_DURATION = 20;

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loopKey, setLoopKey] = useState(0);

  const scenes = useMemo<Scene[]>(
    () => [
      {
        id: "playful",
        label: "Playful Curiosity",
        description:
          "A sprightly monkey tugs on the lion's tail, unaware of the danger brewing.",
        start: 0,
        end: 6
      },
      {
        id: "warning",
        label: "Lion's Warning",
        description: "The lion bristles and turns, delivering a silent warning.",
        start: 6,
        end: 10
      },
      {
        id: "pounce",
        label: "Sudden Pounce",
        description: "With explosive power the lion lunges, jaws closing around its tormentor.",
        start: 10,
        end: 14
      },
      {
        id: "aftermath",
        label: "Savanna Silence",
        description:
          "The dust settles. Only the lion remains, paw resting where the monkey once stood.",
        start: 14,
        end: TOTAL_DURATION
      }
    ],
    []
  );

  const [activeSceneId, setActiveSceneId] = useState(scenes[0]?.id ?? "");

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsedMs = timestamp - startTimeRef.current;
      const elapsedSeconds = (elapsedMs / 1000) % TOTAL_DURATION;

      renderScene(context, elapsedSeconds);

      const scene = scenes.find(
        ({ start, end }) => elapsedSeconds >= start && elapsedSeconds < end
      );
      if (scene && scene.id !== activeSceneId) {
        setActiveSceneId(scene.id);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [activeSceneId, isPlaying, loopKey, scenes]);

  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];

  const handleRestart = () => {
    startTimeRef.current = null;
    setLoopKey((value) => value + 1);
    setIsPlaying(true);
  };

  const handleToggle = () => {
    setIsPlaying((value) => !value);
  };

  return (
    <main>
      <h1>Savanna Tale</h1>
      <p className="description">An animated micro-short that traces a playful encounter spiraling into a stark finale.</p>
      <div className="canvasWrapper">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Animated lion and monkey scene" />
      </div>
      <div className="controls">
        <button type="button" onClick={handleToggle}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={handleRestart}>
          Restart Story
        </button>
      </div>
      <p className="caption">
        <strong>{activeScene?.label}</strong> — {activeScene?.description}
      </p>
    </main>
  );
}

const skyGradientStops = [
  { offset: 0, color: "#f8e4b9" },
  { offset: 0.65, color: "#f7c47a" },
  { offset: 1, color: "#f29c54" }
];

function renderScene(ctx: CanvasRenderingContext2D, elapsed: number) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  skyGradientStops.forEach(({ offset, color }) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawSun(ctx, elapsed);
  drawTerrain(ctx, elapsed);
  drawLion(ctx, elapsed);
  drawMonkey(ctx, elapsed);
  drawDust(ctx, elapsed);
}

function drawSun(ctx: CanvasRenderingContext2D, elapsed: number) {
  const sunY = 100 + Math.sin((elapsed / TOTAL_DURATION) * Math.PI * 2) * 20;
  ctx.beginPath();
  ctx.fillStyle = "#ffe7a9";
  ctx.arc(WIDTH - 120, sunY, 55, 0, Math.PI * 2);
  ctx.fill();
}

function drawTerrain(ctx: CanvasRenderingContext2D, elapsed: number) {
  ctx.fillStyle = "#e3b35d";
  ctx.fillRect(0, HEIGHT * 0.65, WIDTH, HEIGHT * 0.35);

  const waveCount = 6;
  ctx.strokeStyle = "rgba(205, 142, 54, 0.6)";
  ctx.lineWidth = 3;

  for (let i = 0; i < waveCount; i += 1) {
    const y = HEIGHT * 0.65 + i * 18;
    ctx.beginPath();
    for (let x = 0; x <= WIDTH; x += 20) {
      const offset = Math.sin((x / 80) + elapsed + i) * 4;
      if (x === 0) {
        ctx.moveTo(x, y + offset);
      } else {
        ctx.lineTo(x, y + offset);
      }
    }
    ctx.stroke();
  }
}

function drawLion(ctx: CanvasRenderingContext2D, elapsed: number) {
  const baseX = WIDTH * 0.6;
  const baseY = HEIGHT * 0.6;

  const anger = elapsed >= 6 ? Math.min((elapsed - 6) / 8, 1) : 0;
  const pounceProgress = clamp((elapsed - 10) / 4, 0, 1);

  const bodyX = baseX - pounceProgress * 120;
  const bodyY = baseY - pounceProgress * 40;

  ctx.save();
  ctx.translate(bodyX, bodyY);

  ctx.fillStyle = "#c67828";
  ctx.beginPath();
  ctx.ellipse(0, 0, 140, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d8872f";
  ctx.beginPath();
  ctx.ellipse(120, -40, 68, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  drawLionMane(ctx, anger);
  drawLionFace(ctx, anger);
  drawLionTail(ctx, elapsed, pounceProgress);
  drawLionLegs(ctx, pounceProgress);

  ctx.restore();
}

function drawLionMane(ctx: CanvasRenderingContext2D, anger: number) {
  ctx.save();
  ctx.translate(120, -42);
  ctx.fillStyle = "#8c3f1a";
  const maneRuffles = 12;
  ctx.beginPath();
  for (let i = 0; i <= maneRuffles; i += 1) {
    const angle = (i / maneRuffles) * Math.PI * 2;
    const radius = 80 + Math.sin(angle * 3 + anger * 6) * 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLionFace(ctx: CanvasRenderingContext2D, anger: number) {
  ctx.save();
  ctx.translate(120, -42);

  ctx.fillStyle = "#e3a651";
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 36, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a1f06";
  ctx.beginPath();
  ctx.arc(-10, -5 - anger * 4, 5 + anger * 1.2, 0, Math.PI * 2);
  ctx.arc(10, -5 - anger * 4, 5 + anger * 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f8d8a2";
  ctx.beginPath();
  ctx.ellipse(0, 18, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3a1f06";
  ctx.lineWidth = 4;
  ctx.beginPath();
  const mouthOpen = anger > 0.3 ? anger : anger * 0.5;
  ctx.moveTo(-18, 12);
  ctx.quadraticCurveTo(0, 32 + mouthOpen * 22, 18, 12);
  ctx.stroke();

  if (mouthOpen > 0.4) {
    ctx.fillStyle = "#fff7e1";
    ctx.beginPath();
    ctx.moveTo(-16, 18);
    ctx.lineTo(-8, 26 + mouthOpen * 14);
    ctx.lineTo(-4, 18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(16, 18);
    ctx.lineTo(8, 26 + mouthOpen * 14);
    ctx.lineTo(4, 18);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawLionTail(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  pounceProgress: number
) {
  ctx.save();
  ctx.translate(-120, -30);
  ctx.strokeStyle = "#d08938";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";

  const tailSway = Math.sin(elapsed * 2) * (1 - pounceProgress);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-120, -80 - tailSway * 30, -200, -20 - tailSway * 18);
  ctx.stroke();

  ctx.fillStyle = "#8c3f1a";
  ctx.beginPath();
  ctx.ellipse(-200, -20 - tailSway * 18, 18, 24, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLionLegs(ctx: CanvasRenderingContext2D, pounce: number) {
  ctx.fillStyle = "#bf7127";
  const frontLegOffset = pounce * 40;
  const backLegOffset = pounce * 20;

  ctx.beginPath();
  ctx.roundRect(-100 + backLegOffset, 60 - backLegOffset * 0.2, 40, 120, 18);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(-40 + backLegOffset * 0.3, 72 - backLegOffset * 0.5, 36, 118, 18);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(60 + frontLegOffset, 48 - frontLegOffset * 0.2, 40, 124, 18);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(110 + frontLegOffset * 1.2, 60 - frontLegOffset * 0.3, 38, 120, 18);
  ctx.fill();
}

function drawMonkey(ctx: CanvasRenderingContext2D, elapsed: number) {
  const playProgress = clamp(elapsed / 6, 0, 1);
  const warningProgress = clamp((elapsed - 6) / 4, 0, 1);
  const pounceProgress = clamp((elapsed - 10) / 4, 0, 1);
  const aftermathProgress = clamp((elapsed - 14) / 6, 0, 1);

  const tailContactX = WIDTH * 0.36 + Math.sin(elapsed * 2.2) * 10;
  const tailContactY = HEIGHT * 0.38 + Math.cos(elapsed * 2.4) * 6;

  const startX = WIDTH * 0.25;
  const startY = HEIGHT * 0.62;
  const playX = lerp(startX, tailContactX, easeInOut(playProgress));
  const playY = lerp(startY, tailContactY, easeInOut(playProgress));

  const warningRetreatX = lerp(playX, WIDTH * 0.42, warningProgress * 0.6);
  const warningRetreatY = lerp(playY, HEIGHT * 0.58, warningProgress * 0.6);

  const pounceX = lerp(warningRetreatX, WIDTH * 0.54, pounceProgress);
  const leapTargetY = HEIGHT * 0.56;
  const pounceY = lerp(warningRetreatY, leapTargetY, pounceProgress) - pounceProgress * 20;

  const vanishAmount = clamp(aftermathProgress, 0, 1);

  const opacity = 1 - vanishAmount;
  if (opacity <= 0) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(pounceX, pounceY - Math.sin(elapsed * 5) * (1 - pounceProgress) * 6);
  ctx.scale(1, 1 - pounceProgress * 0.2);

  ctx.fillStyle = "#8d5a2b";
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6f4520";
  ctx.beginPath();
  ctx.ellipse(-10, -42, 22, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ba8654";
  ctx.beginPath();
  ctx.ellipse(-10, -48, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3f2711";
  ctx.beginPath();
  ctx.arc(-14, -52, 3, 0, Math.PI * 2);
  ctx.arc(-6, -52, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3f2711";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-18, -40);
  ctx.quadraticCurveTo(-10, -34 - warningProgress * 8, -2, -40);
  ctx.stroke();

  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(20, -12);
  ctx.quadraticCurveTo(60, 20, 40, 54);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-20, -12);
  ctx.quadraticCurveTo(-60, 20, -40, 62);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-18, 4);
  ctx.quadraticCurveTo(-60, 40, -40, 76);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(22, 4);
  ctx.quadraticCurveTo(64, 44, 52, 74);
  ctx.stroke();

  ctx.strokeStyle = "#6f4520";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-34, -10);
  ctx.quadraticCurveTo(-78, -40, -64, -86);
  ctx.stroke();

  ctx.restore();
}

function drawDust(ctx: CanvasRenderingContext2D, elapsed: number) {
  const dustStart = 10;
  if (elapsed < dustStart) return;

  const dustProgress = clamp((elapsed - dustStart) / 6, 0, 1);
  const particleCount = 14;

  for (let i = 0; i < particleCount; i += 1) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 40 + dustProgress * 80;
    const x = WIDTH * 0.5 + Math.cos(angle) * radius;
    const y = HEIGHT * 0.58 + Math.sin(angle) * radius * 0.4;
    ctx.fillStyle = `rgba(219, 170, 92, ${0.4 - dustProgress * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, 10 - dustProgress * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
