# 🛠️ Knowl Setup & Installation Guide

Welcome to the future of conversational research. This guide will help you get your **Knowl Voice Agents** up and running on your local machine.

## 📌 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js 20.x](https://nodejs.org/) or later
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Shankar-105/knowl.git
cd knowl
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following keys.

#### 🎙️ Voice AI Configuration (Critical)
| Variable | Description | Where to find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Public key for Vapi.ai | [Vapi Dashboard](https://dashboard.vapi.ai/account) |
| `ELEVEN_LABS_API_KEY` | API key for high-fidelity voices | [ElevenLabs Profile](https://elevenlabs.io/app/settings/profile) |

#### 🧠 Brain & Database
| Variable | Description | Where to find |
|----------|-------------|---------------|
| `GEMINI_API_KEY` | Powers AI research & synthesis | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `MONGODB_URL` | Database for your research nodes | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |

#### 🔐 Auth & Storage
| Variable | Description | Where to find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth provider | [Clerk Dashboard](https://dashboard.clerk.com/) |
| `CLERK_SECRET_KEY` | Secret auth key | [Clerk Dashboard](https://dashboard.clerk.com/) |
| `BLOB_READ_WRITE_TOKEN` | For PDF & image storage | [Vercel Blob](https://vercel.com/storage/blob) |

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to start building.

## 🛠️ Troubleshooting

- **Voice Agent Not Connecting**: Ensure your Vapi,ElevenLabs public key is correct
- **Microphone Permissions**: Browsers often block mic access on non-HTTPS local dev environments. Use `localhost` or set up a local proxy if needed.
- **Database Errors**: Verify that your MongoDB IP whitelist includes your current IP address.

---

Developed with ❤️ for the future of live research with voice agents.
