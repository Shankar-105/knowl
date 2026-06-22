// Brand color - used in JS files where CSS variables aren't available
export const BRAND_COLOR = '#212a3b'; // Dark blue-gray
export const BRAND_COLOR_HOVER = '#3d485e'; // Medium blue-gray

// Sample books for the homepage (using Open Library covers)
export const sampleBooks = [
    {
        _id: '1',
        title: 'Clean Code',
        author: 'Robert Cecil Martin',
        slug: 'clean-code',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '2',
        title: 'JavaScript: The Definitive Guide',
        author: 'David Flanagan',
        slug: 'javascript-the-definitive-guide',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780596805524-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '3',
        title: 'Brave New World',
        author: 'Aldous Huxley',
        slug: 'brave-new-world',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '4',
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        slug: 'rich-dad-poor-dad',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '5',
        title: 'Deep Work',
        author: 'Cal Newport',
        slug: 'deep-work',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '6',
        title: 'How to Win Friends and Influence People',
        author: 'Dale Carnegie',
        slug: 'how-to-win-friends-and-influence-people',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '7',
        title: 'The Power of Habit',
        author: 'Charles Duhigg',
        slug: 'the-power-of-habit',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781400069286-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '8',
        title: 'Atomic Habits',
        author: 'James Clear',
        slug: 'atomic-habits',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '9',
        title: 'The Courage to Be Disliked',
        author: 'Fumitake Koga & Ichiro Kishimi',
        slug: 'the-courage-to-be-disliked',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9781501197274-L.jpg',
        coverColor: '#f8f4e9',
    },
    {
        _id: '10',
        title: '1984',
        author: 'George Orwell',
        slug: '1984',
        coverURL: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
        coverColor: '#f8f4e9',
    },
];

// File validation helpers
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'image/jpeg',
    'image/png',
    'image/webp'
];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Pre-configured VAPI assistant ID (hardcoded for this app)
export const ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID || '';

// Voice provider identifiers.
// '11labs'  -> handled natively by Vapi (voice runs inside the Vapi pipeline)
// '60db'    -> routed through our custom-voice proxy (/api/tts/60db) which streams
//              raw PCM from 60db's WebSocket TTS back to Vapi. See useVapi.start().
export type VoiceProvider = '11labs' | '60db';

export type VoiceOption = {
    id: string;
    name: string;
    description: string;
    category: 'Male' | 'Female';
    language: string;
    provider: VoiceProvider;
};

// Unified voice catalog. Each entry is tagged with a `provider` so the picker can
// show a provider badge and useVapi can build the correct Vapi voice config.
// Voices selected for natural, engaging book conversations.
export const voiceOptions: Record<string, VoiceOption> = {
    // --- ElevenLabs (provider: '11labs') ---
    // English Male
    dave: { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', description: 'Young male, British-Essex, casual & conversational', category: 'Male', language: 'en', provider: '11labs' },
    daniel: { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Middle-aged male, British, authoritative but warm', category: 'Male', language: 'en', provider: '11labs' },
    chris: { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', description: 'Male, casual & easy-going', category: 'Male', language: 'en', provider: '11labs' },

    // English Female
    rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Young female, American, calm & clear', category: 'Female', language: 'en', provider: '11labs' },
    sarah: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Young female, American, soft & approachable', category: 'Female', language: 'en', provider: '11labs' },

    // --- 60db (provider: '60db') ---
    // These IDs are 60db `voice_id`s. The first is 60db's documented default voice.
    // To add more: call `GET https://api.60db.ai/myvoices` (Bearer SIXTYDB_API_KEY),
    // copy each `voice_id`, and add an entry below + a key in `voiceCategories`.
    sixtydb_default: { id: 'fbb75ed2-975a-40c7-9e06-38e30524a9a1', name: 'Aria (60db)', description: '60db neural voice — multilingual (English + Indian languages), low latency', category: 'Female', language: 'en', provider: '60db' },
    // sixtydb_custom: { id: 'PASTE_VOICE_ID_HERE', name: 'My Voice (60db)', description: '...', category: 'Male', language: 'en', provider: '60db' },
};

// Voice categories for the selector UI
export const voiceCategories: Record<string, string[]> = {
    male: ['dave', 'daniel', 'chris'],
    female: ['rachel', 'sarah', 'sixtydb_default'],
};

// Human-readable provider labels for the picker badge
export const VOICE_PROVIDER_LABELS: Record<VoiceProvider, string> = {
    '11labs': 'ElevenLabs',
    '60db': '60db',
};

// Default voice
export const DEFAULT_VOICE = 'rachel';

// ElevenLabs fallback used by the 60db custom-voice config (if 60db is unreachable,
// Vapi automatically falls back to this ElevenLabs voice mid-call).
export const ELEVEN_FALLBACK_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

// ElevenLabs voice settings optimized for conversational AI
export const VOICE_SETTINGS = {
    stability: 0.45, // Lower for more emotional, dynamic delivery (0.30-0.50 is natural)
    similarityBoost: 0.75, // Enhances clarity without distortion
    style: 0, // Keep at 0 for conversational AI (higher = more latency, less stable)
    useSpeakerBoost: true, // Improves voice quality
    speed: 1.0, // Natural conversation speed
};

// 60db voice settings (0-100 scale, mirrors VOICE_SETTINGS intent).
// Forwarded to the proxy as query params and on to 60db's WebSocket create_context.
export const SIXTYDB_VOICE_SETTINGS = {
    stability: 50, // 0-100, lower = more expressive, higher = more consistent
    similarity: 75, // 0-100, how closely output matches the source voice
    speed: 1.0, // 0.5-2.0 speech rate multiplier
};

// VAPI configuration for natural conversation
// NOTE: These settings should be configured in the VAPI Dashboard for the assistant
// They are kept here for reference and documentation purposes
export const VAPI_DASHBOARD_CONFIG = {
    // Turn-taking settings
    startSpeakingPlan: {
        smartEndpointingEnabled: true,
        waitSeconds: 0.1,
    },
    stopSpeakingPlan: {
        numWords: 2,
        voiceSeconds: 0.2,
        backoffSeconds: 1.0,
    },
    // Timing settings
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 0.2,
    llmRequestDelaySeconds: 0.1,
    // Conversation features
    backgroundDenoisingEnabled: true,
    backchannelingEnabled: true,
    fillerInjectionEnabled: false,
};

// Clerk appearance overrides - Warm Literary Style
// Note: Tailwind requires static class names at build time, so we hardcode color values here
export const CLERK_AUTH_APPEARANCE_OVERRIDE = {
    rootBox: 'mx-auto',
    card: 'shadow-none border-none rounded-xl bg-transparent',
    headerTitle: '!text-2xl font-bold text-[#212a3b]',
    headerSubtitle: '!mt-3 !text-sm text-[#3d485e]',
    socialButtonsBlockButton:
        '!border border-[rgba(33,42,59,0.12)] hover:bg-[#212a3b]/10 transition-all h-12 text-lg !rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)]',
    socialButtonsBlockButtonText: 'font-medium !text-[#212a3b] !text-lg',
    formButtonPrimary:
        'bg-[#212a3b] hover:bg-[#3d485e] text-white font-medium !border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)] normal-case !h-12 !text-lg !rounded-xl',
    formFieldInput:
        '!border !border-[rgba(33,42,59,0.12)] !rounded-xl focus:ring-[#212a3b] focus:border-[#212a3b] !h-12 !min-h-12 !text-lg !bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]',
    formFieldLabel: 'text-[#212a3b] font-medium text-lg',
    footerActionLink: 'text-[#212a3b] hover:text-[#3d485e] text-base font-medium',
};


