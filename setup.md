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
| `NEXT_PUBLIC_VAPI_API_KEY` | Public key for Vapi.ai (drives the voice loop) | [Vapi Dashboard](https://dashboard.vapi.ai/account) |
| `NEXT_PUBLIC_ASSISTANT_ID` | The pre-configured Vapi assistant ID | [Vapi Dashboard](https://dashboard.vapi.ai/) |

> **ElevenLabs voices** run *inside* Vapi — set your ElevenLabs key in the **Vapi dashboard**, not here. The app only selects the voice ID + settings.

#### 🗣️ 60db Voices (optional — second TTS provider)
60db is wired as a Vapi **custom-voice** provider via a server proxy (`/api/tts/60db`) that
streams raw PCM from 60db's WebSocket TTS. Configure these to enable 60db voices in the picker:

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `SIXTYDB_API_KEY` | **Server-side** 60db API key (Bearer). Never `NEXT_PUBLIC_`. | [60db dashboard](https://docs.60db.ai) |
| `SIXTYDB_PROXY_SECRET` | Optional shared secret; gates the proxy route. Must match `NEXT_PUBLIC_TTS_PROXY_SECRET`. | You choose it |
| `NEXT_PUBLIC_TTS_PROXY_SECRET` | Client copy of the secret sent to Vapi as the webhook secret. | Same value as above |
| `NEXT_PUBLIC_TTS_PROXY_URL` | Public base URL Vapi calls for TTS. Local dev: an [ngrok](https://ngrok.com) tunnel URL. Prod: your deployed origin (or leave unset to use `window.location.origin`). | Tunnel / deployment |

> **Local dev note:** Vapi calls the proxy from its own servers, so `localhost` is unreachable.
> Run a tunnel (`ngrok http 3000`) and set `NEXT_PUBLIC_TTS_PROXY_URL` to the tunnel URL to test 60db voices locally. ElevenLabs voices need no tunnel.
>
> **Adding more 60db voices:** `curl -H "Authorization: Bearer $SIXTYDB_API_KEY" https://api.60db.ai/myvoices`, then paste each `voice_id` into `voiceOptions` in `lib/constants.ts`.

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
