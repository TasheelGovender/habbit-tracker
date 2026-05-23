# habbit-tracker

Solo Leveling-inspired habit tracker built with Nuxt 4, Tailwind CSS, Pinia, and Firebase.

## Current status

The project currently includes:

- Nuxt 4 SPA scaffold
- Responsive dark fantasy landing page at `/`
- Responsive dashboard preview at `/dashboard`
- Vue-native retro UI primitives inspired by 8bitcn styling
- Firebase env placeholders via `.env.example`

## Stack

- Nuxt 4
- Vue 3
- Tailwind CSS
- Pinia
- Firebase
- VueFire

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Fill in your Firebase config values in `.env`.

4. Start the app:

   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
npm run generate
```

Static output is generated into `.output/public`.
