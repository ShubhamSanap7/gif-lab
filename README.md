# GIF Lab 🧪✨

A fast, lightweight web app for searching GIPHY and editing **Whole GIFs** with layered text overlays, speed controls, aspect-ratio cropping, filters, and a handcrafted GIF encoder (Median-Cut palette quantization + LZW compression built from scratch without external libraries).

---

## ✨ Whole GIF Editing Features

### ✍️ Text Over GIF (Full Text Layer Engine)
- **Multi-layer Text Support**: Add multiple custom captions and labels anywhere over the entire GIF animation.
- **Positioning**: Quick presets (**Top**, **Center**, **Bottom**) or fine-tune vertical position slider (0% to 100%).
- **Typography**: Select from multiple font families (Impact Meme, Montserrat, Monospace, Modern Sans, Classic Serif).
- **Styling**:
  - Font size slider (16px to 96px).
  - Text color & outline color pickers.
  - Outline / stroke thickness slider.
  - Background styling options: **None (Transparent)**, **Black Banner Bar**, **Translucent Pill**, or **White Subtitle Box**.
  - One-tap uppercase transform.

### ⚡ Timing & Motion
- **Whole GIF Timeline**: Interactive dual-trim sliders to set start and end points of the animation in seconds.
- **Speed Control**: Adjust playback speed from **0.25x** to **4.0x** with quick presets (`0.5x`, `1.0x`, `1.5x`, `2.0x`).
- **Direction & Loop**:
  - **Reverse GIF**: Plays the animation in reverse.
  - **Boomerang**: Smooth ping-pong back-and-forth loop.
  - **Play Once**: Toggle between continuous loop and single play.

### 📐 Crop & Transform
- **Aspect Ratio Cropping**: One-click crop presets:
  - **Original**
  - **1:1 Square** (Instagram / Avatars)
  - **9:16 Story** (TikTok / Reels)
  - **16:9 Wide** (Landscape / YouTube)
  - **4:5 Feed** (Social posts)
- **Width Resize**: Scale output width up to 640px.
- **Rotation & Flips**: Rotate 90° clockwise, flip horizontal, flip vertical.

### 🎨 Color & Visual FX
- **Filter Presets**: Grayscale, Sepia, Invert.
- **Color Grading**: Brightness (-100% to +100%), Contrast (-100% to +100%), Saturation (-100% to +100%).
- **Pixelate Effect**: Retro 8-bit block pixelation slider.

### 🖼️ Framing, Borders & Watermark
- **Custom Borders**: Border thickness (0 to 24px) with color picker.
- **Vignette Shadow**: Cinematic edge shading effect.
- **Watermark / Sticker Badge**: Add custom text or emojis (e.g. `@myhandle` or `🔥`) in any corner.

### 📦 Handcrafted Export Engine (Zero Libraries)
- **Median-Cut Palette Quantizer**: Computes an optimal 256-color palette for each frame.
- **Floyd-Steinberg Dithering**: Optional error diffusion dithering for smooth color gradients.
- **Handcrafted LZW Encoder**: Full GIF89a specification output with Netscape 2.0 loop extensions.
- **Real-Time Progress & Download**: Visual progress bar and direct "Save GIF" download link.

---

## 🔍 GIPHY Search & Proxy Backend
- **Direct GIPHY Search & Trending**: Proxied safely through the Node/Express backend (`/api/search`, `/api/trending`). The frontend never sees the API key.
- **Strict Hostname Security**: `/api/gif?url=...` streams only valid `*.giphy.com` CDN URLs to eliminate open-proxy risks and avoid CORS issues.
- **In-Memory Cache**: Caches identical searches for 10 minutes.
- **Per-IP Rate Limiting**: Built-in sliding-window limiter.
- **Demo Mode**: Works straight out of the box with curated demo GIFs even before adding an API key.

---

## 🚀 Running Locally

```bash
cd D:/Projects/gif-lab
npm install
npm start
```

Visit `http://localhost:3000` in your browser.

To use live GIPHY search:
1. Copy `.env.example` to `.env`.
2. Add your GIPHY API key: `GIPHY_API_KEY=your_key_here`.

---

## 🌐 Deployment

- **Render**: Connect repository, build command `npm install`, start command `npm start`, add `GIPHY_API_KEY` env var.
- **Vercel**: Deploy with `npx vercel` or GitHub integration (preconfigured with `vercel.json`).
