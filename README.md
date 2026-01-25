<div align="center">

# 🏛️ FounderMode: EMPIRE

### Stop playing house with ChatGPT. Start running an empire.
### 别再用 ChatGPT 过家家了。来建立你的商业帝国。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/Powered%20by-Google%20Gemini-orange.svg)
![Build](https://img.shields.io/badge/build-React%20%7C%20Vite%20%7C%20Tailwind-cyan.svg)
![Status](https://img.shields.io/badge/status-Public%20Beta-emerald.svg)

[**Live Demo**](#) · [**Report Bug**](../../issues) · [**Request Feature**](../../issues)

</div>

---

## ⚡ Introduction / 介绍

**FounderMode** is not just another chatbot wrapper. It is a fully immersive, **LLM-driven startup simulator** that gamifies the chaos of being a CEO.
**FounderMode** 不仅仅是一个套壳聊天机器人。它是一个完全沉浸式的、**由大模型驱动的创业模拟器**，将 CEO 的混乱日常游戏化。

You don't just prompt; you **command**. You hire AI agents with distinct personalities, manage morale, burn cash, and make high-stakes strategic decisions using a deck-building mechanic.
你不再是简单地输入提示词，而是在**下达指令**。你雇佣拥有独特人格的 AI 员工，管理士气、燃烧资金，并通过卡牌构筑机制制定高风险的战略决策。

From a garage in Silicon Valley to a skyscraper on Wall Street. Can you survive the burn rate?
从硅谷的车库到华尔街的摩天大楼。你能扛得住资金燃烧的速度吗？

---

## 🎮 Core Systems / 核心系统

### 🧠 The Wharton-Logic Engine (逻辑引擎)
> Powered by **Google Gemini 2.5/3.0**, the game simulates complex market feedback loops. Your decisions have real financial consequences.
>
> 由 **Google Gemini** 驱动，游戏模拟了复杂的市场反馈回路。你的每一个决策都会产生真实的财务后果。

### 🎴 Strategy Deck (策略卡牌)
> Don't know what to type? Use the **Action Deck**. Play cards like *"Viral Marketing"* or *"Code Sprint"* to direct your resources. It's a resource management game at its core.
>
> 不知道该输入什么？使用 **行动卡牌**。打出“病毒营销”或“代码冲刺”等卡牌来调度资源。其核心是一个硬核的资源管理游戏。

### 👁️ HQ Visualization (沉浸式总部)
> **HTML5 Canvas Particle System**. Watch your empire grow from a few dots in a garage to a massive data stream in a skyscraper. The visualizer reacts to your cash flow, user growth, and agent status in real-time.
>
> **HTML5 Canvas 粒子系统**。看着你的帝国从车库里的几个光点，成长为摩天大楼中的庞大数据流。可视化效果会根据你的现金流、用户增长和员工状态实时反应。

### 🤖 Autonomous Agent Army (自主代理军团)
> Your employees aren't static. They get stressed, they have morale, and they talk back.
> *   **Engineers** fix bugs (or create them).
> *   **Designers** generate assets using **Imagen**.
> *   **Marketers** burn cash to get users.
>
> 你的员工不是静止的。他们会感到压力，有士气值，甚至会顶嘴。工程师修 Bug，设计师画图，市场人员烧钱换用户。

---

## 🕹️ Game Modules / 游戏模块

### 1. The Command Center (指挥中心)
Real-time metrics dashboard monitoring Cash Flow, User Growth, and Server Load. Includes a news ticker for market events.
实时监控现金流、用户增长和服务器负载的仪表盘。包含滚动新闻条以播报市场事件。

### 2. Agent 1:1 Meetings (1对1谈话)
Click on any agent to open a private chat channel. Motivate them to boost morale, or fire them if they are burning too much cash.
点击任何代理即可开启私聊频道。激励他们以提升士气，或者在他们烧钱太快时将其解雇。

### 3. Creative Studio (创意工坊)
Integrated with **Gemini Flash Image** and **Veo 3.1**. Generate marketing assets, concept art, and viral video ads directly within the game interface to boost your product quality.
集成 Gemini 图像生成与 Veo 视频生成模型。在游戏内直接生成营销素材、概念图和病毒视频广告，以提升产品质量。

---

## 🛠️ Tech Stack / 技术栈

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** TailwindCSS, Lucide Icons
*   **Visuals:** HTML5 Canvas (Custom Particle Engine), Recharts
*   **AI Core:** `@google/genai` SDK
    *   **Logic:** `gemini-3-flash-preview` (Reasoning & Simulation)
    *   **Creative:** `gemini-2.5-flash-image` (Concept Art) & `veo-3.1` (Video Ads)

---

## 🚀 Quick Start / 快速开始

**1. Clone the repository**
```bash
git clone https://github.com/FounderMode/Empire.git
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up API Key**
Get your key from [Google AI Studio](https://aistudio.google.com/) and export it:
```bash
export API_KEY="your_gemini_api_key"
```

**4. Run the Empire**
```bash
npm run dev
```

---

## 🔮 Roadmap / 路线图

- [x] **Garage Stage:** Basic loop, hiring, cash management.
- [x] **Visual HQ:** Particle system implementation.
- [x] **Action Cards:** UI and Logic integration.
- [ ] **IPO Stage:** Stock market simulation.
- [ ] **Multi-Agent Debates:** Agents arguing with each other in meetings.
- [ ] **Voice Mode:** Shout at your employees (literally) via Gemini Live API.

---

<div align="center">

**Star this repo if you want to run your own empire.** 🌟
**如果你想建立自己的商业帝国，请给个 Star。** 🌟

Designed with ❤️ by **FounderMode Team**

</div>
