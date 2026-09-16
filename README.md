# Party Funtime 🚀

A modern, self-hostable real-time party games web application built for remote team socials and meeting icebreakers over Microsoft Teams & Zoom.

![License](https://img.shields.io/badge/license-MIT-blue)
![Docker](https://img.shields.io/badge/docker-ready-cyan)
![Node](https://img.shields.io/badge/node-20%2B-emerald)

---

## 🎮 Included Games (12 Total)

1. **🎨 Pictionary**: HTML5 studio canvas, live drawing stream, 10 neon color swatches, brush sizing, eraser, secret word selection modal, speed scoring, and guess chat box with reaction emojis.
2. **🧠 Trivia**: Multi-choice question bank, category badges, countdown timer, speed multipliers, and score breakdown.
3. **💣 Bomb Defusal**: Co-op puzzle game with **Defuser Panel** (wire cutting, keypad, action buttons) and **Teammates Manual View** (step-by-step instructions over Teams).
4. **🔐 Escape Room**: Multi-stage room puzzles (cryptographic code cracker, anagram lock, logic matrix) with team clock.
5. **🤥 Two Truths & a Lie**: Statement submission form with lie radio selector, voting card grid, and lie reveal score calculator.
6. **📊 Guess the Crowd**: Secret survey prompt answers and group consensus predictions.
7. **🕵️ Who Said That?**: Anonymous text submission prompt, answer shuffling, and team author voting cards.
8. **🔤 Word Association**: Team members independently submit word associations with matching bonus multipliers.
9. **🏆 Family Feud-style**: Survey board with hidden flip cards, strike indicators (`X X X`), and total point accumulator.
10. **🎭 Charades**: Private actor prompt viewer and host scoring controls.
11. **🧩 Connections**: 4x4 interactive word grid selector, mistake counter dots, and category color reveals.
12. **📈 Higher or Lower**: Side-by-side card value comparison with live streaks.

---

## 👑 Host Isolation & Network Reconnection

- **Host Security Token (`hostToken`)**: Bound to room creator and saved in `localStorage`.
- **3-Minute Network Grace Period**: If network connection drops or VPN resets, room state & game progress stay frozen.
- **Seamless Host Re-authentication**: Automatic host re-authentication when reconnecting (`?room=CODE&hostKey=HT-XXXXX`).
- **Isolated Host Control Dock (`HostControlPanel.jsx`)**: Floating control dock at bottom right for host controls (Skip Round, Return to Lobby, Copy Host Key, End Session).

---

## 🚀 Quick Start with Docker

### Production (Pulls Pre-built Image from GHCR)
```bash
# Pull and start production image
docker compose pull
docker compose up -d
```

### Local Development Build
To build and test changes directly from your local source files:
```bash
docker compose -f docker-compose.dev.yml up --build
```

Open `http://localhost:3000` in your web browser!

---

## 🛠️ Local Node Setup

```bash
# Install dependencies
npm install

# Build frontend bundle
npm run build

# Start server
npm run server
```

---

## 📄 License
MIT License
