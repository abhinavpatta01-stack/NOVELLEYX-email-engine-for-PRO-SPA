# Novelleyx Email Engine Pro

An interactive email marketing campaign editor designed to map clickable hotspot regions onto promotional banner graphics, customize corporate branding layouts, and export production-ready, highly compatible responsive HTML code.

![Banner Mockup](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80)

---

## ⚡ Key Features

1. **Interactive Hotspot Canvas**
   - Click and drag directly on the workspace banner to map custom link hotspots.
   - Resize regions in real-time using tactile bottom-right resizing handles.
   - Drag and reposition mapped zones easily across coordinates.
   - Sleek glassmorphic settings modal for link URL, description labels, and accessibility tags.

2. **Branding & Presets Profile Manager**
   - Configure Brand Name, main fallback redirect URL, and inbox preview preheader.
   - Save custom brand profiles into browser `localStorage` for instant template loads.
   - Toggle optional modules like **Header Block**, **Secondary CTA Section**, and **Footer Block**.

3. **Advanced Email Builder Modules**
   - **Header Block**: Custom logo image, custom colors, and up to 4 header navigation links.
   - **Secondary CTA Block**: Title headline, body details, button text, redirect URL, custom background, and text colors.
   - **Footer Block**: Custom copyright text, disclaimer links, and up to 5 social media links (X, Facebook, Instagram, LinkedIn, YouTube) using CDN-hosted icons.

4. **Dual Preview & Code Engine**
   - **Desktop Simulator**: Live sandbox preview rendering inside an isolated `iframe`.
   - **Mobile Simulator**: Simulated phone viewport (330px width) to verify responsiveness.
   - **HTML Source Code Viewer**: Raw generated code with a double-click auto-select box, instant clipboard copier, and one-click `.html` template downloader.

---

## 🛠️ Technology Stack

- **Framework**: React 18 & TypeScript
- **Bundler**: Vite 5
- **Icons**: Lucide React
- **Styles**: Custom Vanilla CSS (with custom properties, neon glows, glassmorphism, responsive scrollbars, and keyframe animations)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v16.0.0 or higher) and **npm** installed on your local machine.

### Installation

Clone the repository and install the dependencies:

```bash
# Navigate to the workspace
cd "NOVELLEYX proficianl CTA EMAIL editor"

# Install NPM packages
npm install
```

### Run Locally

Spin up the local Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Build for Production

Compile code and build the production bundle:

```bash
npm run build
```

This compiles static assets into the `dist/` directory, ready to be deployed to any static host (Netlify, Vercel, GitHub Pages).

---

## 📬 Email Client Compatibility Tips

Since HTML email rendering is notorious for inconsistent CSS support across clients (like Outlook, Gmail, Apple Mail):
- **Base64 vs CDN**: Base64 images are embedded inline but are often blocked by Gmail or Outlook Web. We highly recommend using the **CDN Hosted Image URL** option and hosting your banner image on a reliable server (like Imgur, AWS S3, or your own hosting server).
- **Responsive Image Maps**: Image maps work perfectly on desktop screens. On mobile devices that scale the template down, coordinates remain absolute. We have added a built-in mobile viewport toggle to let you visually inspect coordinates.
