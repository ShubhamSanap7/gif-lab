<div align="center">

# 🧪 GIF Lab

### *Full-featured Whole GIF Studio & Search Engine with a Handcrafted LZW Encoder*

[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21+-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org)
[![Zero Build](https://img.shields.io/badge/Build-Zero_Build_Step-8b5cf6?style=for-the-badge)](https://github.com/ShubhamSanap7/gif-lab)
[![License: MIT](https://img.shields.io/badge/License-MIT-06b6d4?style=for-the-badge)](LICENSE)

<br/>

**GIF Lab** is a high-performance web studio for discovering and editing **Whole GIFs**. Search trending GIFs via a secure GIPHY backend proxy, layer customizable text and meme captions, adjust playback motion, apply cinematic filters, and export high-fidelity GIF89a animations using a **from-scratch Median-Cut quantizer and LZW encoder** — zero third-party GIF libraries.

---

</div>

## 🌟 Key Highlights

- 🔎 **Secure GIPHY Proxy**: Frontend never handles API keys. Search and stream GIFs through cached server endpoints with strict host whitelisting.
- ✍️ **Layered Text Engine**: Place multiple captions over the animation with custom fonts (Impact, Montserrat, Monospace), outlines, banner boxes, and positioning.
- ⚡ **Whole GIF Motion & Timing**: Dual-range timeline trimmer, 0.25x–4.0x speed control, Reverse direction, and Boomerang loop.
- 📐 **Social Aspect Ratios**: Crop to 1:1 Square, 9:16 Story/Reels, 16:9 Landscape, or 4:5 Feed with auto-centering.
- 🎨 **Visual Effects & Grading**: Grayscale, Sepia, Invert, Brightness, Contrast, Saturation, and retro 8-bit Pixelate.
- 🖼️ **Framing & Watermark**: Custom canvas borders, cinematic Vignette shading, and watermark badge overlay.
- 🧬 **Handcrafted Encoder**: Pure algorithmic implementation of **Median-Cut Palette Quantization**, **Floyd-Steinberg Dithering**, and **LZW GIF89a compression** written by hand without external packages.

---

## 🎨 Studio Features Breakdown

| Feature Category | Capabilities |
| :--- | :--- |
| **Text Overlay** | Multi-layer captions, Top/Center/Bottom presets, Y-axis slider, Impact / Modern / Mono fonts, font size (16–96px), color pickers, stroke outlines, black banner bars, translucent pills, subtitle boxes. |
| **Timing & Motion** | Visual timeline dual-slider trim, speed multiplier (0.25x to 4.0x), Reverse playback, Boomerang (ping-pong), Play Once toggle. |
| **Crop & Transform** | Original, 1:1 Square, 9:16 Story, 16:9 Wide, 4:5 Feed aspect crops, width resizing up to 640px, 90° CW rotation, horizontal/vertical flips. |
| **Color & FX** | B&W Grayscale, Sepia, Invert, Brightness (-100% to +100%), Contrast (-100% to +100%), Saturation (-100% to +100%), 8-bit block Pixelate. |
| **Overlays & Frames** | Adjustable border thickness (0–24px), border color, Vignette shadow gradient, custom watermark / emoji badge in any corner. |
| **Export Engine** | Median-Cut palette generation (256 colors), optional Floyd-Steinberg error diffusion dithering, variable-bit LZW sub-block streaming, live progress modal, direct download. |

---

## 🏛️ Architecture Overview

```text
┌────────────────┐           ┌───────────────────┐           ┌────────────────┐
│   Browser UI   │ ──(1)──>  │  Express Backend  │ ──(2)──>  │   GIPHY API    │
│ (public/index) │ <──(4)──  │   (server.js)     │ <──(3)──  │   (CDN Host)   │
└────────────────┘           └───────────────────┘           └────────────────┘
        │                              │
        │ [Client-Side Processing]     │ • 10-Minute Search Cache
        │ • ImageDecoder API           │ • Per-IP Rate Limiting
        │ • Real-Time Canvas Player    │ • Strict Host Whitelisting
        │ • Median-Cut Quantizer       │ • Provider Pattern
        │ • Floyd-Steinberg Ditherer
        ▼
   Handcrafted LZW GIF89a Blob
```

---

## 📁 Repository Structure

```text
gif-lab/
├── public/
│   └── index.html         # Single-file vanilla HTML/CSS/JS frontend
├── .env                   # Local environment variables (gitignored)
├── .env.example           # Example environment template
├── .gitignore             # Git ignore configuration
├── package.json           # Node.js dependencies and run scripts
├── server.js              # Express backend (cache, rate limiter, proxy)
├── vercel.json            # Vercel serverless deployment configuration
└── README.md              # Project documentation
```

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm (bundled with Node.js)

### 1. Clone & Install
```bash
git clone https://github.com/ShubhamSanap7/gif-lab.git
cd gif-lab
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
Add your GIPHY key in `.env`:
```env
PORT=3000
GIPHY_API_KEY=your_key_here
```
*(If left empty, GIF Lab automatically runs in **Demo Mode** with pre-bundled sample GIFs!)*

### 3. Run Locally
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deployment

### Deploy to Render
1. Create a **New Web Service** connected to your repository on [render.com](https://render.com/).
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `npm start`
4. Add Environment Variable: `GIPHY_API_KEY`

### Deploy to Vercel
1. Import repository on [vercel.com/new](https://vercel.com/new).
2. Set Environment Variable: `GIPHY_API_KEY`
3. Click **Deploy** *(preconfigured via `vercel.json`)*.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
