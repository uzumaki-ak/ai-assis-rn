# 🤖 AI Assist

AI Assist is a cross-platform mobile application built with **Expo Router** and **React Native**.  
It empowers users to create custom AI agents, chat with them, and manage their interaction history.  
The app integrates **Clerk** for authentication and **Firebase** for backend data handling, offering a smooth, modern, and secure user experience.

---
## Demo video : https://youtu.be/gthwb3HnEqI

## ✨ Features

- 🔑 **Authentication with Clerk** — Secure sign-in and user management
- 🧑‍💻 **Create Custom AI Agents** — Define prompts, choose emojis, and personalize your agents
- 💬 **Chat Interface** — Interact with your created agents in real-time
- 📜 **History Management** — View and search past chat history
- 🌍 **Explore Section** — Discover other available agents
- 👤 **Profile Page** — Manage account and quick access to features
- 🎨 **Dark & Wheat Theme** — Modern UI with subtle animations

---

images
![welcome screeen](<Screenshot 2025-12-27 142820.png>)
![home screen](<Screenshot 2025-12-27 142852.png>)
![create-agent-tab](<Screenshot 2025-12-27 142905.png>)
![explore agents](<Screenshot 2025-12-27 142915.png>)
![history tab](<Screenshot 2025-12-27 142928.png>)
![profile page](<Screenshot 2025-12-27 142943.png>)
![android studio](<Screenshot 2025-12-27 143116.png>)

## 📂 Project Structure

```bash
ai-assist/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab layout configuration
│   │   ├── Explore.tsx           # Explore tab screen
│   │   ├── History.tsx           # History tab screen
│   │   ├── Home.tsx              # Home tab screen
│   │   └── Profile.tsx           # Profile tab screen
│   ├── chat/                     # Chat feature
│   │   └── index.tsx             # Chat screen
│   ├── create-agent/             # Agent creation
│   │   ├── _layout.tsx           # Create agent layout
│   │   └── index.tsx             # Create agent screen
│   └── home/                     # Home section
│       ├── AgentCard.tsx         # Agent card component
│       ├── AgentListComp.tsx     # Agent list component
│       ├── CreateAgentBanner.tsx # Create agent banner
│       └── NonFeaturedAgents.tsx # Non-featured agents
├── assets/                       # Static assets
├── components/                   # Reusable components
│   └── explore/                  # Explore-specific components
├── login-anima/                  # Login animation assets
├── config/                       # Configuration files (Firebase, Clerk, etc.)
├── Montserrat/                   # Font files
├── shared/                       # Shared utilities/components
├── .gitignore                    # Git ignore rules
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── eslint.config.js              # ESLint configuration
├── expo-start.js                 # Expo start script
├── metro.config.js               # Metro bundler configuration
├── package-lock.json             # Dependency lock file
├── package.json                  # Project dependencies
├── README.md                     # Project documentation
└── tsconfig.json                 # TypeScript configuration


🛠️ Tech Stack

React Native (v0.81) + Expo Router

Clerk (authentication)

Firebase Firestore (data storage)

Lucide Icons (UI icons)

TypeScript for type safety

npm install
# or
yarn install
npm start
# press "a" for Android, "i" for iOS, or "w" for Web
📌 Roadmap

 Add AI model integration for real agent responses

 Push notifications for chat updates

 Agent marketplace for sharing/discovering agents

 Enhanced theming (light/dark toggle)
 🤝 Contributing

Contributions are welcome!
Please open an issue or submit a pull request for improvement
```
