# Interactive Text-to-Speech Application

This is a prototype demonstration of an interactive text-to-speech application. The application allows users to convert text to speech with customizable voice settings and save generated audio files to a library.

## Features

- Text input with character count
- Voice selection with different accents
- Adjustable speed and pitch
- Audio preview with playback controls
- Library for saved texts and generated audio files
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository or unzip the provided file

2. Install dependencies
   \`\`\`bash
   npm install
   # or
   yarn
   # or
   pnpm install
   \`\`\`

3. Create a `.env.local` file with the following variables
   \`\`\`
   # This will be replaced with the actual Kokoro TTS API key in production
   KOKORO_API_KEY=your_api_key_here
   \`\`\`

4. Start the development server
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Mode

The application is currently in prototype mode, using simulated responses for the text-to-speech functionality. In the production version, it will connect to Kokoro TTS for real speech synthesis.

## Building for Production

\`\`\`bash
npm run build
# or
yarn build
# or
pnpm build
\`\`\`

## Deployment

The application can be deployed to Vercel with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Finteractive-text-to-speech)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
