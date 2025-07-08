# AI for Second Lives

A full-stack sustainability application designed to support Walmart's supermarket sustainability model by enhancing customer retention, promoting refillable/eco products, and increasing in-store visits through intelligent product reuse and recycling suggestions.
<img width="1686" alt="Screenshot 2025-07-08 at 11 07 08 AM" src="https://github.com/user-attachments/assets/ec6255ec-129c-412f-8f91-848c944fe916" />
<img width="1661" alt="Screenshot 2025-07-08 at 11 07 21 AM" src="https://github.com/user-attachments/assets/22121fcc-f504-41ff-99d9-4c14237a862d" />
<img width="1657" alt="Screenshot 2025-07-08 at 11 07 52 AM" src="https://github.com/user-attachments/assets/53a0892d-6e90-4f77-812b-ac6ed7bd2f99" />
<img width="1650" alt="Screenshot 2025-07-08 at 11 08 08 AM" src="https://github.com/user-attachments/assets/62073139-ef3a-4b9d-bdf6-4aca3243b755" />
<img width="1671" alt="Screenshot 2025-07-08 at 11 08 58 AM" src="https://github.com/user-attachments/assets/f94b9698-eed8-4b28-a04a-10d3521a47e9" />
<img width="1671" alt="Screenshot 2025-07-08 at 11 09 11 AM" src="https://github.com/user-attachments/assets/73147ba8-4cf4-4495-b579-e51eeafaf034" />
<img width="1436" alt="Screenshot 2025-07-08 at 11 09 32 AM" src="https://github.com/user-attachments/assets/5f81595f-937f-47b1-9c54-a59b4c72107d" />

## Tech Stack

### Frontend
- **Next.js 13** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Multer** for file uploads
- **Tesseract.js** for OCR processing

### APIs & Services
- **Google Gemini Vision API** for AI-powered product analysis
- **Open Food Facts API** for product information
- **File-based storage** for user data and eco stats

## Features

### Core Functionality
- **Product Analysis**: Upload images, scan barcodes, or enter product names
- **AI-Powered Suggestions**: Get creative reuse, recycle, and upcycle ideas using Gemini Vision API
- **Receipt Processing**: OCR-powered receipt upload and product extraction
- **Eco Reward System**: Track green score, reused/recycled items, and earn coupons
- **Refill Reminders**: Set customizable reminders for product refills

### Walmart Integration
- **Local Store Finder**: Find nearby Walmart stores by ZIP code
- **Recycling Policies**: View store-specific recycling information
- **Local Events**: Discover sustainability events at local stores
- **Smart Suggestions**: "Buy eco-refill instead" and "Add to reuse list" buttons

### User Experience
- **Responsive Design**: Mobile-first approach with Walmart branding
- **Real-time Updates**: Live progress tracking and stats updates
- **Intuitive Navigation**: Clean, accessible interface
- **Performance Optimized**: Fast loading and smooth interactions

## Project Structure

```
sparkathon/
├── frontend/          # Next.js application
│   ├── app/          # App Router pages
│   ├── components/   # Reusable UI components
│   └── lib/          # Utilities and configurations
├── backend/          # Express.js API server
│   ├── routes/       # API endpoints
│   ├── dist/         # Compiled TypeScript
│   └── public/       # Static files
└── package.json      # Root package management
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sparkathon
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   - Create `.env` in backend directory with:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     ```
   - Create `.env.local` in frontend directory with:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:3002
     ```

4. **Build and Start**
   ```bash
   # Build backend
   npm run build:backend
   
   # Start backend (port 3002)
   npm run start:backend
   
   # Start frontend (port 3001)
   npm run start:frontend
   ```

### Development

```bash
# Backend development
npm run dev:backend

# Frontend development  
npm run dev:frontend

# Type checking
npm run typecheck
```

## API Endpoints

### Analysis
- `POST /analyze` - Analyze products with AI
- `POST /analyze/receipt` - Process receipt uploads

### User Management
- `GET /users/:id/eco-stats` - Get user eco statistics
- `POST /users/:id/eco-action` - Record eco actions
- `GET /users/:id/reminders` - Get refill reminders
- `POST /users/:id/reminders` - Create new reminder
- `DELETE /users/:id/reminders/:id` - Delete reminder

### Store Information
- `GET /stores?zip=12345` - Get local Walmart store info

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

MIT License - see LICENSE file for details 
