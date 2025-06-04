# TicketBazaar - Peer-to-Peer Ticket Marketplace

A cutting-edge peer-to-peer ticket resale platform for the Indian market, featuring enhanced direct seller connections and social media integration.

## 🚀 Features

- **Peer-to-Peer Marketplace**: Direct ticket sales between users
- **Google OAuth Authentication**: Secure single sign-on
- **Real-time Communication**: WebSocket-powered messaging
- **Location Services**: Google Maps integration for venue locations
- **Payment Processing**: Stripe integration for secure transactions
- **Social Integration**: WhatsApp and Instagram connectivity
- **Mobile Responsive**: Optimized for all devices
- **Micro-animations**: Smooth Framer Motion interactions

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with Google OAuth
- **Payments**: Stripe
- **Real-time**: WebSocket (ws)
- **Maps**: Google Maps API
- **Forms**: React Hook Form with Zod validation

## 🌐 Heroku Deployment

### Prerequisites

1. Heroku CLI installed
2. Git repository initialized
3. Heroku account

### Deployment Steps

1. **Create Heroku App**

   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL Database**

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
   heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
   heroku config:set STRIPE_PUBLIC_KEY=your_stripe_public_key
   heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
   heroku config:set GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Deploy**

   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Initialize Database**
   ```bash
   heroku run npm run db:push
   ```

### Required Environment Variables

| Variable               | Description                                            | Required |
| ---------------------- | ------------------------------------------------------ | -------- |
| `DATABASE_URL`         | PostgreSQL connection string (auto-provided by Heroku) | Yes      |
| `SESSION_SECRET`       | Secret for session management                          | Yes      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                                 | Yes      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                             | Yes      |
| `STRIPE_PUBLIC_KEY`    | Stripe publishable key                                 | Yes      |
| `STRIPE_SECRET_KEY`    | Stripe secret key                                      | Yes      |
| `GOOGLE_MAPS_API_KEY`  | Google Maps API key                                    | Yes      |

### Optional API Keys (Future Features)

| Variable                       | Description                  |
| ------------------------------ | ---------------------------- |
| `WHATSAPP_ACCESS_TOKEN`        | WhatsApp Business API token  |
| `WHATSAPP_PHONE_NUMBER_ID`     | WhatsApp phone number ID     |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp business account ID |

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Route components
│   │   ├── lib/           # Utilities
│   │   └── hooks/         # Custom hooks
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── auth.ts           # Authentication
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema
├── scripts/             # Database scripts
├── Procfile            # Heroku process file
├── app.json           # Heroku app configuration
└── runtime.txt        # Node.js version
```

## 🔧 Local Development

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Push Database Schema**
   ```bash
   npm run db:push
   ```

## 🔒 Security Features

- Secure session management
- Google OAuth authentication
- Input validation with Zod
- SQL injection protection via Drizzle ORM
- CORS protection
- Environment variable security

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile-optimized navigation
- Geolocation services

## 🚀 Performance Optimizations

- Code splitting with Vite
- Optimized bundle size
- Efficient database queries
- Image optimization
- Caching strategies

## 📄 License

MIT License - see LICENSE file for details
