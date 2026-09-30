<div align="center">

# ⚡ GitHub Profile Visualizer

### The ultimate all-in-one developer telemetry & 3D contribution visualizer suite: 3D Isometric City Skylines, Developer Achievements, Commit Velocity Wave, Coding Habits, Competency Radar, Language Distribution, LeetCode, GeeksforGeeks, HackerRank, and Duolingo cards.

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-GitHub%20Profile%20Visualizer-purple?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/marketplace/actions/github-profile-visualizer)
[![GitHub release](https://img.shields.io/github/v/release/Tharun4743/github-profile-visualizer?color=7aa2f7&style=for-the-badge)](https://github.com/Tharun4743/github-profile-visualizer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-00f0ff?style=for-the-badge)](LICENSE)
[![Node 20](https://img.shields.io/badge/Runtime-Node.js%2020-00d26a?style=for-the-badge&logo=nodedotjs&logoColor=white)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff79c6?style=for-the-badge)](https://github.com/Tharun4743/github-profile-visualizer/pulls)

<br/>

<!-- Flagship 3D City Preview -->
<img src="examples/profile-3d-pearl-neon.svg" alt="3D Isometric Contribution City" width="100%" />

</div>

---

## 🌟 The 12-in-1 Visualizer Suite

Generate **any or all developer telemetry cards in a single, ultra-fast action pass**:

### 1. 🏙️ 3D Isometric Contribution City
* **Pure Mathematical Projection Engine:** Renders 365 days of contribution depth using deterministic isometric math (`isoX = (x - y) * cos(30°)`, `isoY = (x + y) * sin(30°) - height`) with 0 headless-browser dependencies.
* **Auto-Adaptive High-Contrast Themes:** Pure White Pearl Neon, Solar Sunrise, Ocean Breeze, and Emerald Light. Legacy/dark requests are automatically adapted into bright, high-contrast aesthetics.
* **5-Axis Radar & Accurate Donut Progress:** Multi-metric activity radar (Commit, Issue, PR, Review, Repo) and language percentage ring.

---

### 2. 🎛️ Executive Summary Banner
<img src="examples/executive-summary.svg" alt="Executive Summary" width="100%" />

---

### 3. 🏆 Achievements & 📈 Velocity Wave
| 🏆 Developer Achievements & Medals | 📈 Commit Velocity Wave Chart |
| :---: | :---: |
| ![Achievements](examples/achievements.svg) | ![Commit Velocity](examples/commit-velocity.svg) |

---

### 4. 🎯 Engineering Radar & 🕒 Coding Habits
| 🎯 Engineering Competency Radar | 🕒 Productive Coding Habits |
| :---: | :---: |
| ![Competency Radar](examples/skills-radar.svg) | ![Coding Habits](examples/coding-habits.svg) |

---

### 5. 💻 Language Matrix & ⚡ Live Activity Stream
| 💻 Language Distribution Matrix | ⚡ Live Activity Stream |
| :---: | :---: |
| ![Languages Matrix](examples/languages-matrix.svg) | ![Recent Activity](examples/activity-timeline.svg) |

---

### 6. 🧩 Multi-Platform Problem Solving & Learning Telemetry
<div align="center">

| 🧩 LeetCode Card | 🌿 GeeksforGeeks Card |
| :---: | :---: |
| ![LeetCode Card](examples/leetcode-card.svg) | ![GeeksforGeeks Card](examples/gfg-card.svg) |

| 🎖️ HackerRank Card | 🦉 Duolingo Learning Streak |
| :---: | :---: |
| ![HackerRank Card](examples/hackerrank-card.svg) | ![Duolingo Card](examples/duolingo-card.svg) |

</div>

---

## 📖 Step-by-Step Setup Guide for Your Profile ("Magic") Repo

Transform your special profile repository (`github.com/username/username`) in **4 simple steps**:

### Step 1: Create Workflow Directory
In your GitHub profile repository (`username/username`), create a new directory and workflow file:
```
.github/workflows/profile-visualizers.yml
```

### Step 2: Paste the GitHub Action Workflow
Paste the following complete workflow into `.github/workflows/profile-visualizers.yml`:

```yaml
name: Update Profile Visualizers

on:
  schedule:
    - cron: "0 0,6,12,18 * * *" # Runs automatically every 6 hours
  push:
    branches: [main]
  workflow_dispatch: # Allows manual one-click trigger

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    name: Generate Multi-Platform Visualizers
    timeout-minutes: 10

    steps:
      - name: 📥 Checkout Profile Repository
        uses: actions/checkout@v4

      - name: ⚡ Generate All Profile Visualizers
        uses: Tharun4743/github-profile-visualizer@v1
        with:
          username: ${{ github.repository_owner }}
          visualizers: 'all' # Generates all 12 cards in 1 pass
          theme: 'pearl-neon' # Auto-configured with high-contrast white aesthetic
          leetcode-username: ${{ github.repository_owner }} # Or custom LeetCode handle
          gfg-username: ${{ github.repository_owner }}      # Or custom GFG handle
          hackerrank-username: ${{ github.repository_owner }} # Or custom HackerRank handle
          duolingo-username: ${{ github.repository_owner }}  # Or custom Duolingo handle
          output-dir: 'assets'
          filename: 'profile-3d-city.svg'

      - name: 🚀 Commit & Push Generated Visualizers
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add assets/
          if git diff --cached --quiet; then
            echo "No visualizer changes to commit."
          else
            git commit -m "chore(telemetry): update profile visualizers [skip ci]"
            git pull --rebase origin main
            git push origin main
          fi
```

### Step 3: Enable Workflow Permissions
1. Go to your profile repository on GitHub: `Settings` → `Actions` → `General`.
2. Scroll to **Workflow permissions**.
3. Select **Read and write permissions**.
4. Check **Allow GitHub Actions to create and approve pull requests**.
5. Click **Save**.

### Step 4: Embed the Cards in your `README.md`
Add the following layout snippet to your profile `README.md`:

```html
<!-- 3D Contribution Skyline -->
<div align="center">
  <img src="assets/profile-3d-city.svg" width="100%" alt="3D Contribution City" />
</div>

<!-- Executive Summary -->
<img src="assets/executive-summary.svg" width="100%" alt="Executive Summary" />

<!-- 2-Column Telemetry Grid -->
<table border="0" width="100%">
  <tr>
    <td width="50%"><img src="assets/achievements.svg" width="100%" alt="Achievements" /></td>
    <td width="50%"><img src="assets/commit-velocity.svg" width="100%" alt="Commit Velocity" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="assets/skills-radar.svg" width="100%" alt="Skills Radar" /></td>
    <td width="50%"><img src="assets/coding-habits.svg" width="100%" alt="Coding Habits" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="assets/languages-matrix.svg" width="100%" alt="Languages Matrix" /></td>
    <td width="50%"><img src="assets/leetcode-card.svg" width="100%" alt="LeetCode Card" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="assets/gfg-card.svg" width="100%" alt="GeeksforGeeks Card" /></td>
    <td width="50%"><img src="assets/duolingo-card.svg" width="100%" alt="Duolingo Streak" /></td>
  </tr>
</table>
```

---

## 🤖 One-Click AI / Antigravity Prompt

Want an AI coding assistant (like **Google Antigravity**, **Cursor**, **ChatGPT**, or **Claude**) to automatically set up and enhance your profile repository with this action?

Copy and paste this prompt into your assistant:

```text
Please build and upgrade my GitHub Profile Magic Repository (username/username) into a stunning, world-class developer profile.

STRICT INSTRUCTION:
Do NOT write custom SVG generators, headless scrapers, or ad-hoc scripts from scratch.
You MUST strictly configure and use the official published GitHub Marketplace Action: `Tharun4743/github-profile-visualizer@v1`.

Requirements:
1. Create/update `.github/workflows/profile-visualizers.yml` using `uses: Tharun4743/github-profile-visualizer@v1` with `visualizers: 'all'` and `theme: 'pearl-neon'`.
2. Configure my platform usernames (GitHub, LeetCode, GeeksforGeeks, HackerRank, Duolingo) in the action parameters.
3. Update `README.md` to embed the generated 3D City (`profile-3d-city.svg`), Executive Summary (`executive-summary.svg`), Achievements, Commit Velocity Wave, Engineering Radar, Coding Habits, Language Matrix, and Multi-Platform Cards inside clean responsive tables.
4. Verify that all SVGs sync cleanly into `assets/` on every push and scheduled run.
```

---

## ⚙️ Configuration Inputs & Auto-Fallback

| Input | Description | Default |
| :--- | :--- | :--- |
| `username` | Target GitHub username | `${{ github.repository_owner }}` |
| `visualizers`| Choice of visualizers: `'all'` or comma-separated list (`'3d-city,activity,habits,languages,leetcode,gfg,hackerrank,duolingo,achievements,velocity,radar,summary'`) | `'all'` |
| `theme` | Built-in palette: `pearl-neon`, `solar-light`, `ocean-light`, `github-light` *(Any dark/legacy theme name automatically adapts to bright pearl aesthetic)* | `'pearl-neon'` |
| `custom-colors` | 5 comma-separated hex codes for custom tower levels | `''` |
| `border-radius`| Corner radius in pixels (`0`, `8`, `14`, `20`) | `''` |
| `show-border` | Display card borders (`true`/`false`) | `'true'` |
| `title` | Custom header title for the 3D City | `⚡ {username}'s 3D Contribution City` |
| `height-scale`| Multiplier for 3D tower elevation (`1.0`, `1.5`, `2.0`) | `'1.0'` |
| `animate` | Enable neon lighting reflection animation (`true`/`false`) | `'true'` |
| `year` | Specific calendar year (e.g. `2025`) or `'last-year'` | `'last-year'` |
| `leetcode-username`| LeetCode handle for problem solving telemetry | `${{ github.repository_owner }}` |
| `gfg-username` | GeeksforGeeks handle for problem solving telemetry | `${{ github.repository_owner }}` |
| `hackerrank-username`| HackerRank handle for badges and achievements | `${{ github.repository_owner }}` |
| `duolingo-username`| Duolingo handle for streak and course telemetry | `${{ github.repository_owner }}` |
| `output-dir` | Output folder where SVGs will be saved | `'assets'` |
| `filename` | Output filename for primary 3D city SVG | `'profile-3d-city.svg'` |

---

## 💻 CLI Usage

You can also run the visualizer directly from your terminal or CI runner:

```bash
# Generate all visualizers in Pearl Neon Light theme
npx github-profile-visualizer --username Tharun4743 --visualizers all --output ./assets

# Generate specific cards with custom border radius
npx github-profile-visualizer --username Tharun4743 --visualizers "achievements,velocity,radar,summary" --border-radius 16

# Generate Solar Sunrise Light theme
npx github-profile-visualizer --username Tharun4743 --theme solar-light
```

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built with ❤️ by [@Tharun4743](https://github.com/Tharun4743).
