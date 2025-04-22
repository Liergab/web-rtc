# Bryan Gabriel FE Template

A modern React template featuring Tailwind CSS v4, React Router, and TanStack Query with a clean, responsive design and a complete dark mode implementation. This template includes reusable components, responsive utilities, and the elegant Vulcan color theme.

![Bryan Gabriel Template](https://your-screenshot-url.com/screenshot.png)

## Features

- ⚡️ [React](https://react.dev/) with [Vite](https://vitejs.dev/) for fast development
- 🎨 [Tailwind CSS v4](https://tailwindcss.com/) for modern styling
- 🔄 [TanStack Query](https://tanstack.com/query) for efficient data fetching
- 🧭 [React Router DOM](https://reactrouter.com/) for client-side routing
- 🌓 Dark mode with system preference detection and persistence
- 📱 Mobile-first responsive design utilities
- 🎭 Complete TypeScript support
- 🎯 Feature-based folder structure
- 🎠 Modern landing page with search functionality
- 🎨 Vulcan color theme with consistent design across light and dark modes

## Live Demo

Check out the live demo: [Bryan Gabriel Template Demo](https://your-demo-url.com)

## Screenshots

### Light Mode
![Light Mode](https://your-screenshot-url.com/light-mode.png)

### Dark Mode
![Dark Mode](https://your-screenshot-url.com/dark-mode.png)

## Project Structure

```
src/
├── assets/                 # Static assets
├── components/             # Reusable UI components
│   ├── examples/           # Example components
│   ├── layout/             # Layout components
│   └── ui/                 # UI elements
├── context/                # React Context providers
│   └── ThemeContext.tsx    # Dark mode context
├── hooks/                  # Custom React hooks
├── pages/                  # Page components
│   ├── auth/               # Authentication pages
│   └── examples/           # Example pages
├── shared/                 # Shared utilities
│   └── styles/             # Reusable Tailwind classes
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles and Tailwind setup
```

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bryan-fe-template.git
cd bryan-fe-template

# Install dependencies
npm install
# or
yarn

# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173.

## Key Components

### Responsive Utilities

The template includes a comprehensive set of responsive utilities:

- Responsive layouts: `stack-to-row`, `row-to-stack`
- Responsive widths: `half-on-tablet`, `third-on-desktop`
- Responsive visibility: `hide-on-mobile`, `show-only-on-desktop`
- Responsive text alignment: `text-center-left-on-tablet`
- Responsive spacing: `responsive-padding`, `responsive-margin`

### Dark Mode Implementation

Dark mode is implemented using:
- Tailwind's `darkMode: 'class'` strategy
- React Context for state management
- Local storage for persistence
- System preference detection
- Inverted Vulcan color palette for consistent design

### Vulcan Theme

The Vulcan theme provides a coherent color palette that works seamlessly in both light and dark modes:

- 10 shades from 50 to 900
- Consistent text and background contrast
- Adaptive component styling
- Beautiful purple-blue hues

## Page Examples

The template includes several example pages:

- **Home**: Modern landing page with search and feature showcase
- **Login**: Authentication page with the Vulcan theme
- **Responsive Demo**: Examples of responsive design patterns
- **Responsive Cards**: Card components that adapt to different screen sizes
- **Vulcan Theme**: Showcase of the Vulcan color palette
- **Tailwind Apply**: Examples of using the `@apply` directive

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [shadcn/ui](https://ui.shadcn.com/) for design inspiration
