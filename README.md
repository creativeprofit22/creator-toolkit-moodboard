# Creator Toolkit — UI Moodboard

Interactive design reference for [Creator Toolkit](https://github.com/creativeprofit22/creator-toolkit). 23 live sections you can open in a browser — no install, no build step, no framework required.

Built to nail down every visual decision before writing a single React component.

## What's In Here

| Section | What It Covers |
|---------|---------------|
| Color Palette | Full token system — coral, amber, mint, sky, cyan, rose on dark surfaces |
| Typography | Scale, weights, font pairings (Inter + Space Grotesk) |
| Component Patterns | Cards, badges, stats, status indicators, inputs |
| Comparison Layout | Side-by-side content panels with responsive stacking |
| Preview Window | Video/content preview with overlays and metadata |
| Pipeline Flow | Multi-step workflow visualization with status states |
| Kanban Board | Draggable columns with cards, labels, and priority flags |
| Content Calendar | Monthly grid with event slots and day interactions |
| Celebrations | Confetti, badge unlocks, milestone animations |
| Live Engagement | Floating hearts, viral pulse, real-time counters |
| Glassmorphism | Frosted glass cards, layered blur effects |
| Cursor Effects | Custom cursors, hover trails, magnetic interactions |
| Design Principles | Spacing, elevation, grid, and layout rules |
| Sidebar Nav | Collapsible navigation with nested sections |
| AI Chat | Chat interface with message bubbles, typing indicator, suggestions |
| ECharts | Line, bar, donut, and area charts with the Creator Toolkit palette |
| Dashboard | Full admin view — stats, charts, activity feed, quick actions |
| Text Animation | Typewriter, gradient sweep, word reveal effects |
| Buttons | Every variant — solid, outline, ghost, icon, loading states |
| Dropdowns | Select menus, multi-select, command palette style |
| Date Pickers | Calendar pickers, range selection, time inputs |
| Search Inputs | Autocomplete, filter chips, command bar |
| Social Previews | Platform-specific post previews (YouTube, X, Instagram) |

## How To Use

```bash
# That's it. Open the file.
open index.html
```

Or serve it locally if you want hot reload:

```bash
npx serve .
```

Each section loads as a standalone HTML fragment — edit one without touching the rest.

## Why A Moodboard?

Designing in Figma then translating to code wastes time. This moodboard *is* the code — every color, shadow, radius, and animation here is the exact CSS that ships in the real app. When a component looks right in the moodboard, it's already done.

## Tech

- **HTML + CSS + vanilla JS** — no build, no bundler, no dependencies to install
- **Tailwind via CDN** — utility classes with a custom Creator Toolkit color config
- **ECharts** — for the chart sections
- **CSS custom properties** — all colors and spacing flow from `styles/variables.css`

## Structure

```
├── index.html              # Main page — loads all sections
├── moodboard-splash-demo.html  # Animated splash screen
├── components/             # 23 standalone section files
│   ├── section-01-color-palette.html
│   ├── section-02-typography.html
│   └── ...
├── scripts/                # Section-specific interactions
│   ├── main.js
│   ├── ai-chat.js
│   ├── echarts-init.js
│   └── ...
└── styles/
    ├── variables.css       # Design tokens
    └── base.css            # Shared styles and utilities
```

## Part Of

This moodboard is the design reference for [Creator Toolkit](https://github.com/creativeprofit22/creator-toolkit) — a YouTube research hub for content creators.

Built by [Douro Digital](https://wearedouro.agency).
