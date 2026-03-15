# **App Name**: FitCoin

## Core Features:

- Wallet Connection & Authentication: Securely connect user's MetaMask wallet, detect if installed/on correct network, and display their FIT token balance from the Sepolia testnet.
- Workout Logging & Reward Calculation: Allow users to log workout type and duration using an interactive modal, with real-time preview of potential FIT token rewards based on a defined rule set (duration, streaks, bonuses).
- On-chain FIT Token Distribution: Upon workout confirmation, trigger a smart contract transaction to mint and transfer earned FIT tokens to the user's connected wallet on the Ethereum Sepolia testnet, confirmed via MetaMask.
- Decentralized Rewards Marketplace: Users can browse and 'purchase' physical or digital rewards from a categorized shop using their FIT tokens, with a purchase confirmation workflow.
- Personalized Dashboard & Statistics: A dynamic dashboard displaying user-specific workout metrics, FIT token balance, streak calendar, challenge progress, and a feed of recent activities.
- AI-Powered Workout Motivation Tool: Utilize an AI tool to generate personalized motivational messages or workout suggestions based on user activity patterns and historical data to encourage continuous fitness engagement.
- Community Leaderboard & Profile: Display global and time-bound rankings of users based on earned FIT tokens, alongside a personal profile page showing an avatar, full stats, and achievement badges.

## Style Guidelines:

- Light color scheme. Primary color (H:145, S:85%, L:45%): #18D156 (a vibrant, active green), conveying energy and rewards. Background color (H:145, S:20%, L:95%): #EBF9EF (a soft, desaturated green) for a clean and spacious feel. Accent color (H:115, S:95%, L:55%): #BCFA22 (a bright, energetic lime green) for interactive elements and highlights.
- Headlines and prominent text: 'Space Grotesk' (sans-serif) for a modern, tech-forward, and bold appearance. Body text: 'Inter' (sans-serif) for high legibility, neutrality, and clean aesthetics in detailed information.
- Utilize a consistent set of crisp, modern, line-based icons for workout types, navigation, and features. Integrate vibrant, fitness-themed emojis for product listings in the shop and use distinct graphical elements like a crown for leaderboard and engaging badges for achievements.
- Implement responsive, multi-column layouts using a grid system, inspired by the '3D website' concept, providing visual depth and clear hierarchy. Prioritize mobile-first design, ensuring optimal experience across all devices, with spacious padding and clear content separation for readability.
- Incorporate subtle, performance-optimized animations including animated logo elements, glowing effects on interactive buttons (e.g., 'Connect Wallet'), page fade transitions for smooth navigation, animated number count-ups for stats, and celebratory confetti upon token rewards to enhance user engagement and provide positive feedback. Skeleton loading screens should be used to improve perceived performance during data fetching.