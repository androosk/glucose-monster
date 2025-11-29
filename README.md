# Glucose Monster

<p align="center">
  <img src="assets/images/mascot.png" alt="Glucose Monster Mascot" width="300">
</p>

<p align="center">
  <strong>Tame the monster. Track your glucose.</strong>
</p>

---

Diabetes is a monster. There is a lack of mobile apps that really allow diabetics to track their glucose in a clean, useful and relatable way, so I created the Glucose Monster mobile app with the intent of helping them tame it.

## Features

- Log blood glucose readings with notes and meal context
- Visualize trends with interactive charts
- Dark mode UI designed for quick, easy logging
- Secure authentication with Supabase
- Cross-platform (iOS & Android)

## Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **Backend:** Supabase (Auth & Database)
- **State Management:** Zustand
- **Charts:** Victory Native
- **Styling:** NativeWind (Tailwind CSS)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/glucose-monster.git
   cd glucose-monster
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server
   ```bash
   npx expo start
   ```

5. Press `i` for iOS or `a` for Android

## Project Structure

```
├── app/                  # Expo Router screens
│   ├── (auth)/          # Authentication screens
│   ├── (tabs)/          # Main tab navigation
│   └── edit/            # Edit reading screen
├── components/          # Reusable components
├── context/             # React context providers
├── lib/                 # Utilities (Supabase client)
├── store/               # Zustand stores
└── types/               # TypeScript definitions
```

## License

MIT
