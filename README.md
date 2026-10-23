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

## Terms & Disclaimer

By using this project you agree to the following.

- **No warranty.** This software is provided "as is", without warranty of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
- **No liability.** To the maximum extent permitted by law, the author and contributors are not liable for any claim, loss, or damage (direct, indirect, incidental, or consequential, including lost data or profits) arising from its use.
- **Your responsibility.** You use it at your own risk and are responsible for complying with the laws that apply to you.
- **Third parties.** Names, logos, APIs, and services of others belong to their owners and are used for identification only; no affiliation or endorsement is implied.
- **Your statutory rights.** Nothing here limits rights that cannot be waived by agreement, including under consumer-protection laws in the USA, Canada (including Quebec), and India (Consumer Protection Act, 2019).
- **License.** Use, copying, and distribution are governed by the [LICENSE](LICENSE) file; if anything here conflicts with it, the license controls.

## Content, Assets & Fair Use

- **Original work.** Unless noted otherwise (including below), the code, text, design, and images in this repository were created by the author.
- **Libraries, fonts, and icons.** Third-party libraries, fonts (for example Google Fonts), and icon sets belong to their creators and are used under their own licenses; see the dependency manifests and each source for terms.
- **Logos, brands, and screenshots.** Third-party names, logos, and screenshots appear only to identify or describe their products (nominative use). They remain the property of their owners and do not imply affiliation or endorsement.
- **Ideas and inspiration.** Where this project is inspired by another product, game, or idea, it is an independent implementation. It borrows only general ideas, mechanics, or styles, which are not anyone's exclusive property, and is meant to contain no third-party code or artwork used without permission.
- **Fair use and fair dealing.** Any third-party material is used in limited ways for purposes such as education, research, review, commentary, or identification, relying on fair use in the USA (17 U.S.C. § 107), fair dealing in Canada (Copyright Act, ss. 29–29.2), and fair dealing in India (Copyright Act, 1957, s. 52), where they apply.
- **Concerns and takedown requests.** If you own rights in something here and believe it is used improperly, [open an issue](https://github.com/Sanjays2402/fractal-lab/issues) or contact the author through their GitHub profile with a link to the material and your claim. It will be reviewed promptly and credited, changed, or removed as appropriate. You may also use GitHub's DMCA process.
- **Contributions.** By contributing, you confirm you have the right to submit your contribution and agree it is licensed under this repository's license.
- **Website.** The project site has its own [Terms](https://sanjays2402.github.io/fractal-lab/terms.html) and [Fair Use](https://sanjays2402.github.io/fractal-lab/fair-use.html) pages.
