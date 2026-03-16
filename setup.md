# 🛠️ Setting Up Knowl

Follow this comprehensive guide to get **Knowl** running on your local machine for development and research.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Git**: [Download Git](https://git-scm.com/)
- **Node.js**: [Download Node.js](https://nodejs.org/) (Version 18.x or higher recommended)
- **npm**: Comes bundled with Node.js.

---

## 🤸 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Shankar-105/bookified.git
cd bookified
```

### 2. Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Knowl requires several API keys to power its AI and voice features. Create a file named `.env.local` in the root directory and add the following:

```env
# --- General ---
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# --- Clerk (Authentication) ---
# Get these from https://clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# --- MongoDB (Database) ---
# Get your connection string from https://www.mongodb.com/
MONGODB_URI=mongodb+srv://...

# --- Vapi (Voice AI Engine) ---
# Get these from https://vapi.ai/
NEXT_PUBLIC_VAPI_API_KEY=...
VAPI_SERVER_SECRET=...

# --- ElevenLabs (Lifelike Voices) ---
# Get your key from https://elevenlabs.io/
ELEVENLABS_API_KEY=...

# --- Google Gemini (Embeddings & AI Analysis) ---
# Get your key from https://aistudio.google.com/
GOOGLE_GEMINI_API_KEY=...

# --- Vercel Blob (PDF & Image Storage) ---
# Get this from your Vercel project dashboard
BLOB_READ_WRITE_TOKEN=...
```

---

## 🚀 Running the App

After configuring your environment variables, start the development server:

```bash
npm run dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Troubleshooting

- **Database Connection**: Ensure your MongoDB IP whitelist includes your current IP address.
- **API Errors**: Double-check that all environment variable names exactly match the template above.
- **Node Version**: If you encounter issues, try using the latest LTS version of Node.js.
