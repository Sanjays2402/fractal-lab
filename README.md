# Fractal Lab

> Interactive Mandelbrot & Julia set explorer with zoom, pan & custom color mapping

A GPU-inspired, Web Worker-powered fractal explorer built with React and Vite. Dive into infinite mathematical beauty with smooth zooming, real-time coordinate tracking, and cinematic dark visuals.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

**Dual Fractal Modes** — Switch between Mandelbrot and Julia sets instantly

**Smooth Zoom & Pan** — Click to zoom in, right-click to zoom out, scroll wheel, drag to pan

**6 Color Palettes** — Classic, Fire, Ocean, Neon, Grayscale, Indigo gradient

**Web Workers** — Multi-threaded rendering using all available CPU cores

**Interactive Julia Control** — Drag a point on a mini-Mandelbrot to set Julia c-parameters in real-time

**Live Coordinates** — Real + imaginary parts displayed at cursor position (JetBrains Mono)

**Minimap** — Always see where you are in the full Mandelbrot overview

**Bookmarks** — Save interesting locations to localStorage, revisit anytime

**Export PNG** — Download the current view as a high-resolution image

**Iteration Control** — Slider from 50–2000 for detail vs speed tradeoff

**Render Progress** — Thin progress bar shows computation status

**Reset View** — One click back to the default overview

## Getting Started

```bash
git clone https://github.com/Sanjays2402/fractal-lab.git
cd fractal-lab
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start exploring.

## Controls

| Action | Input |
|---|---|
| Zoom in | Click / Scroll up |
| Zoom out | Right-click / Scroll down |
| Pan | Click & drag |
| Coordinates | Move cursor |

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool with lightning-fast HMR
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Web Workers** — Parallel fractal computation
- **Canvas API** — Pixel-level rendering

## Design

Dark cinematic aesthetic with glassmorphism panels, indigo/purple accent colors, subtle grain textures, and monospace coordinate displays. Inspired by tools like Linear and Raycast.

## How It Works

The Mandelbrot set is computed by iterating `z = z² + c` for each pixel, where `c` is the complex coordinate. Points that don't escape to infinity after `maxIterations` are in the set (colored black). Escape speed determines the color.

For Julia sets, `c` is fixed (controlled by the selector) and `z₀` varies across the canvas.

Computation is split across Web Workers (one per CPU core) for parallel row-based rendering.

## License

MIT
