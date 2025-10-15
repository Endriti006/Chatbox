# AI Chatbot Builder - Frontend Dashboard

A modern React dashboard for managing AI-powered chatbots for small businesses.

## Features

- 🤖 **Chatbot Management** - Create, edit, and delete chatbots
- 🎓 **Training** - Train chatbots with website content
- 📊 **Analytics** - View chat history and performance metrics
- ⚙️ **Customization** - Customize chatbot appearance, colors, and behavior
- 💳 **Billing** - Manage subscriptions and view billing history
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Built with Tailwind CSS

## Tech Stack

- **React 19** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL:
```
VITE_API_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable components
├── context/            # React context providers
├── layouts/            # Page layouts
├── pages/              # Page components
├── services/           # API services
├── App.jsx             # Main app component
└── main.jsx           # Entry point
```

## Deployment

Build the project and deploy the `dist` directory to Vercel, Netlify, or any static hosting service.
