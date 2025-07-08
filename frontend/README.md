# AI for Second Lives

A full-stack app for Walmart users to scan products and get Gemini-generated reuse or recycle ideas. Built with Next.js (App Router), TailwindCSS, shadcn/ui, Express, and Firebase Firestore.

## Features
- Scan/upload product (barcode/image/receipt)
- Gemini Vision API for reuse/recycle suggestions
- Save/share DIYs, local recycling info
- Clean Walmart-style UI (blue/yellow/white)

## Tech Stack
- Next.js (App Router), TailwindCSS, shadcn/ui, lucide-react
- Express API (Node.js)
- Gemini Vision API, Open Food Facts API
- Firebase Firestore

## Setup
1. `cd frontend && npm install && npm run dev` (for frontend)
2. `cd backend && npm install && npm run start` (for backend)
3. Add required environment variables in `.env.local` and `.env` as needed.

## Usage

```bash
npx create-next-app -e https://github.com/shadcn/next-template
```

## License

Licensed under the [MIT license](https://github.com/shadcn/ui/blob/main/LICENSE.md).
