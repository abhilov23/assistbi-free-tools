# Local Deployment Guide

This guide explains how to deploy and run the AssistBI Tools app locally with your own API keys.

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- API keys for AI services

## Required API Keys

### 1. Gemini API Key (Google AI)
**Used by:** Business Card Creator, Language Translator, Content Generator

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Perplexity API Key
**Used by:** Grammar Checker

1. Visit [Perplexity API Settings](https://www.perplexity.ai/settings/api)  
2. Sign up/login to your Perplexity account
3. Generate an API key
4. Copy the key

## Setup Instructions

### 1. Clone/Download the Project
```bash
# If using git
git clone <your-repo-url>
cd assistbi-tools

# Or download and extract the ZIP file
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API keys
nano .env.local  # or use your preferred editor
```

**Add your API keys to .env.local:**
```bash
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_PERPLEXITY_API_KEY=your_actual_perplexity_api_key
```

### 4. Run the Development Server
```bash
npm run dev
# or  
yarn dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
# or
yarn build
```

## Tool Features & API Usage

### AI-Powered Tools:
- ✅ **Business Card Creator** - Generate professional content with AI
- ✅ **Language Translator** - 60+ languages with speech features
- ✅ **Content Generator** - Blogs, emails, social media posts
- ✅ **Grammar Checker** - Advanced grammar and style analysis

### Standard Tools (No API needed):
- PDF Converter & Exporter
- Invoice Generator  
- QR Code Generator
- URL Shortener
- Resume Builder
- Image Background Remover

## Troubleshooting

### Common Issues:

1. **"API Key Missing" errors:**
   - Ensure your .env.local file has the correct variable names
   - Restart the development server after adding API keys
   - Check that variable names start with `VITE_`

2. **Build errors:**
   - Delete `node_modules` and run `npm install` again
   - Make sure you're using Node.js 18+

3. **API rate limits:**
   - Gemini: Check your quota in Google AI Studio
   - Perplexity: Check your usage in Perplexity settings

## Security Notes

- Never commit your actual API keys to version control
- Keep your .env.local file in .gitignore
- Use different API keys for development and production
- Monitor your API usage to avoid unexpected charges

## Deployment to Production

For production deployment, set the environment variables in your hosting platform:
- Vercel: Add in Project Settings → Environment Variables
- Netlify: Add in Site Settings → Environment Variables  
- Heroku: Use `heroku config:set VITE_GEMINI_API_KEY=your_key`

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are valid and have sufficient quota
3. Ensure all dependencies are properly installed