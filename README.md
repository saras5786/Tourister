# 🌍 Tourister - AI-Powered Travel Assistant & Planner

Tourister is an interactive, full-stack web application designed to help travelers explore destinations, generate AI-powered travel itineraries, discover hidden gems, access tourist safety advisories, and use an integrated phrasebook.

---

## ✨ Key Features

- 🤖 **Tourister AI Assistant**: Real-time travel recommendations and itinerary planning powered by OpenAI.
- 🗺️ **Interactive Trip Planner**: Create customized travel plans tailored to your preferences.
- 💎 **Hidden Gems Discovery**: Uncover off-the-beaten-path locations and local attractions.
- 🛡️ **Tourist Safety SOS & Advisories**: Quick emergency access and seasonal travel guidance.
- 🎧 **Audio Guide & Phrasebook**: Instant language assistance and local phrases.
- ✈️ **Fast-Track Airport Pass**: Travel readiness checklist and pass generator.
- 💼 **Tourister Wallet & Community**: Earn rewards, points, and share travel stories.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Framer Motion, React Icons, CSS3
- **Backend:** Node.js, Express, OpenAI API, CORS, Dotenv

---

## 🚀 Getting Started

Follow these steps to run Tourister locally on your machine:

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [Git](https://git-scm.com/)
- An [OpenAI API Key](https://platform.openai.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/saras5786/tourister.git
cd tourister
```

---

### 2. Set Up the Backend Server

```bash
# Navigate to the server folder
cd server

# Install backend dependencies
npm install

# Create your .env file
cp .env.example .env
```

Open `server/.env` and add your OpenAI API key:
```env
PORT=5000
OPENAI_API_KEY=your_actual_openai_api_key_here
```

Start the backend server:
```bash
npm run dev
```
> The server will start on `http://localhost:5000`.

---

### 3. Set Up the Frontend Client

Open a **new terminal window** in the root `tourister` folder:

```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📁 Project Structure

```
tourister/
├── public/                 # Static assets
├── server/                 # Express backend
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express & OpenAI API endpoints
├── src/                    # React frontend
│   ├── assets/             # Images, icons, and logos
│   ├── components/         # UI components (AI Chat, SOS, Wallet, etc.)
│   ├── data/               # Static data and recommendations
│   ├── App.jsx             # Main application layout
│   └── main.jsx            # React root mount
├── .gitignore              # Ignored files (node_modules, .env, dist)
├── package.json            # Frontend dependencies
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
