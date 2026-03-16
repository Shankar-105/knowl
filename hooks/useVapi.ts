'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Vapi from '@vapi-ai/web';
import { useAuth } from '@clerk/nextjs';

import { useSubscription } from '@/hooks/useSubscription';
import { ASSISTANT_ID, DEFAULT_VOICE, voiceOptions, VOICE_SETTINGS, VAPI_DASHBOARD_CONFIG } from '@/lib/constants';
import { getVoice } from '@/lib/utils';
import { IBook, Messages } from '@/types';
import { startVoiceSession, endVoiceSession } from '@/lib/actions/session.actions';
import { getMessagesForBook, saveMessage, deleteMessagesBySession, updateSessionTitle, deleteMessagesWithoutSession } from '@/lib/actions/message.actions';
import { chatWithBook } from '@/lib/actions/chat.actions';
import { toast } from 'sonner';

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const TIMER_INTERVAL_MS = 1000;

// Suppress known Daily.co / Vapi lifecycle noise
const SUPPRESSED_ERRORS = ['Meeting has ended', 'ejection', 'Meeting ended', 'daily-js'];
if (typeof window !== 'undefined') {
  const _origError = console.error.bind(console);
  if (!(console as any).__vapi_patched) {
    (console as any).__vapi_patched = true;
    console.error = (...args: any[]) => {
      const msg = args.map(a => String(a)).join(' ');
      if (SUPPRESSED_ERRORS.some(s => msg.includes(s))) return;
      _origError(...args);
    };
  }
}

let vapiInstance: any = null;
function getVapi() {
  if (typeof window === 'undefined') return null;
  if (!vapiInstance) {
    if (!VAPI_API_KEY) return null;
    try { vapiInstance = new Vapi(VAPI_API_KEY); } catch (_) { return null; }
  }
  return vapiInstance;
}

// Generate a simple thread ID (not a DB entity, just a grouping key for messages)
function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useVapi(book: IBook) {
  const { userId } = useAuth();
  const { limits } = useSubscription();

  const [status, setStatus] = useState<'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [isBillingError, setIsBillingError] = useState(false);
  const [persona, setPersona] = useState("Default AI");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    getVoice(book.persona || DEFAULT_VOICE).id
  );
  const [isTextLoading, setIsTextLoading] = useState(false);

  // selectedThreadId: which thread the user has clicked in the sidebar (null = current/new)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // currentThreadIdRef: the active thread for new messages. null = no thread yet (fresh screen).
  // Created lazily on first message. Reset when user clicks "+".
  const currentThreadIdRef = useRef<string | null>(null);

  // Billing session ref (separate from message thread ID)
  const billingSessionRef = useRef<string | null>(null);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);
  const isStoppingRef = useRef(false);
  const durationRef = useRef(0);
  const lastSavedTranscriptRef = useRef<string | null>(null);

  useEffect(() => { durationRef.current = duration; }, [duration]);
  const maxDurationSeconds = (limits?.maxDurationPerSession || 15) * 60;

  // Load all messages for the book on mount
  useEffect(() => {
    if (!book._id) return;
    getMessagesForBook(book._id).then(res => {
      if (res.success && res.data) {
        setMessages(res.data.map((m: any) => ({
          role: m.role,
          content: m.content,
          sessionId: m.sessionId,
          createdAt: new Date(m.createdAt)
        })));
      }
    }).catch(() => {});
  }, [book._id]);

  // Get or create the current thread ID (lazy init on first message)
  const getOrCreateThreadId = useCallback(() => {
    if (!currentThreadIdRef.current) {
      currentThreadIdRef.current = generateThreadId();
    }
    return currentThreadIdRef.current;
  }, []);

  // Messages for current view
  const currentViewMessages = useMemo(() => {
    if (selectedThreadId === null) {
      const tid = currentThreadIdRef.current;
      if (!tid) return [];
      return messages.filter(m => m.sessionId === tid);
    }
    if (selectedThreadId === 'legacy') return messages.filter(m => !m.sessionId);
    return messages.filter(m => m.sessionId === selectedThreadId);
  }, [messages, selectedThreadId]);

  // Messages for selected thread (for voice context)
  const selectedMessages = useMemo(() => {
    if (!selectedThreadId) return [];
    if (selectedThreadId === 'legacy') return messages.filter(m => !m.sessionId);
    return messages.filter(m => m.sessionId === selectedThreadId);
  }, [messages, selectedThreadId]);

  useEffect(() => {
    const v = getVapi();
    if (!v) return;

    const handlers = {
      'call-start': () => {
        isStoppingRef.current = false;
        setStatus('starting');
        setDuration(0);
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
          if (startTimeRef.current) {
            const d = Math.floor((Date.now() - startTimeRef.current) / TIMER_INTERVAL_MS);
            setDuration(d);
            if (d >= maxDurationSeconds) {
              v.stop();
              setLimitError("Session time limit reached.");
            }
          }
        }, TIMER_INTERVAL_MS);
      },
      'call-end': () => {
        setStatus('idle');
        setCurrentMessage('');
        setCurrentUserMessage('');
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (billingSessionRef.current) {
          endVoiceSession(billingSessionRef.current, durationRef.current).catch(() => {});
          billingSessionRef.current = null;
        }
        startTimeRef.current = null;
        isStoppingRef.current = false;
      },
      'speech-start': () => { if (!isStoppingRef.current) setStatus('speaking'); },
      'speech-end': () => { if (!isStoppingRef.current) setStatus('listening'); },
      'message': (message: any) => {
        if (message.type !== 'transcript') return;
        if (message.role === 'user' && message.transcriptType === 'final' && !isStoppingRef.current) setStatus('thinking');
        if (message.role === 'user' && message.transcriptType === 'partial') setCurrentUserMessage(message.transcript);
        if (message.role === 'assistant' && message.transcriptType === 'partial') setCurrentMessage(message.transcript);

        if (message.transcriptType === 'final') {
          if (message.role === 'assistant') setCurrentMessage('');
          if (message.role === 'user') setCurrentUserMessage('');

          const tid = getOrCreateThreadId();

          setMessages(prev => {
            const isDupe = prev.some(m => m.role === message.role && m.content === message.transcript && m.sessionId === tid);
            if (isDupe) return prev;
            return [...prev, { role: message.role, content: message.transcript, sessionId: tid, createdAt: new Date() }];
          });

          if (lastSavedTranscriptRef.current !== message.transcript) {
            lastSavedTranscriptRef.current = message.transcript;
            saveMessage(book._id, message.role, message.transcript, tid).catch(() => {});
          }
        }
      },
      'error': (err: any) => {
        const errStr = typeof err === 'object' ? JSON.stringify(err) : String(err ?? '');
        if (!errStr || errStr === '{}' || SUPPRESSED_ERRORS.some(s => errStr.includes(s))) {
          setStatus('idle'); return;
        }
        setStatus('idle');
        if (!isStoppingRef.current) toast.error("Voice connection lost. Please try again.");
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => v.on(event as any, handler));
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => v.off(event as any, handler));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [book._id, maxDurationSeconds, getOrCreateThreadId]);

  const start = useCallback(async () => {
    if (!userId) { toast.error("Please sign in."); return; }
    setLimitError(null);
    setIsBillingError(false);
    setStatus('connecting');
    try {
      // startVoiceSession is only for BILLING purposes — not for message grouping
      const result = await startVoiceSession(userId, book._id);
      if (!result.success) {
        setLimitError(result.error || "Limit reached.");
        setIsBillingError(!!result.isBillingError);
        setStatus('idle');
        return;
      }
      billingSessionRef.current = result.sessionId || null;
      lastSavedTranscriptRef.current = null;

      // Ensure we have a thread ID ready (may already exist from prior text chat)
      const tid = getOrCreateThreadId();

      const vapi = getVapi();
      if (!vapi) { 
        setStatus('idle'); 
        toast.error("Voice service unavailable. Check your API key.");
        return; 
      }

      // --- Resolve voice metadata ---
      // selectedVoiceId is the 11labs voice ID (e.g. "21m00Tcm4TlvDq8ikWAM")
      // We need to find the matching voiceOptions entry to get language
      const voiceMeta = Object.values(voiceOptions).find(v => v.id === selectedVoiceId)
        || Object.values(voiceOptions).find(v => v.id === getVoice(book.persona || DEFAULT_VOICE).id)
        || voiceOptions.rachel;

      const lang = voiceMeta.language || 'en';
      const activeVoiceId = voiceMeta.id;

      // Build context from current thread messages (last 20)
      const threadCtxStr = messages
        .filter(m => m.sessionId === tid)
        .slice(-20)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      const hasContext = !!threadCtxStr;

      // --- Build system prompt ---
      const sysPrompts: Record<string, string> = {
        "Default AI": `You are a knowledgeable AI assistant for the node titled "${book.title}". Help the user understand this node deeply. Keep responses concise and conversational.`,
        "Author": `You are the author of the node "${book.title}". Speak in first person with authority and passion.`,
        "Summarizer": `You specialize in summarizing the node "${book.title}". Be clear, concise, and structured.`,
        "Questioner": `You ask thought-provoking questions about the node "${book.title}" to help the user think critically.`,
      };

      let sys = sysPrompts[persona] || sysPrompts["Default AI"];

      // --- Build first message & language override ---
      let firstMessage = hasContext
        ? "I remember our conversation. Let me continue from where we left off."
        : `Hi! I'd love to discuss "${book.title}" with you. What would you like to explore?`;

      if (lang === 'hi') {
        sys += "\n\nIMPORTANT: You MUST respond primarily in Hindi. The user has selected a Hindi voice.";
        firstMessage = hasContext
          ? "मुझे याद है कि हम क्या चर्चा कर रहे थे। चलिए जारी रखते हैं।"
          : `नमस्ते! मुझे आपके साथ "${book.title}" पर चर्चा करना अच्छा लगेगा। आप क्या जानना चाहेंगे?`;
      } else if (lang === 'te') {
        sys += "\n\nIMPORTANT: You MUST respond primarily in Telugu. The user has selected a Telugu voice.";
        firstMessage = hasContext
          ? "మనం ఏమి చర్చిస్తున్నామో నాకు గుర్తుంది. కొనసాగిద్దాం."
          : `నమస్కారం! మీతో "${book.title}" గురించి చర్చించడం నాకు చాలా ఇష్టం. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?`;
      }

      if (hasContext) {
        sys += `\n\nCURRENT THREAD CONTEXT:\n${threadCtxStr}`;
      }

      // --- Determine Deepgram language code ---
      const deepgramLang = lang === 'hi' ? 'hi' : lang === 'te' ? 'te' : 'en-US';

      await vapi.start(ASSISTANT_ID, {
        firstMessage,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: deepgramLang,
        },
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: sys,
          }]
        },
        voice: {
          provider: '11labs',
          voiceId: activeVoiceId,
          model: 'eleven_turbo_v2_5',
          ...VOICE_SETTINGS,
        },
        ...VAPI_DASHBOARD_CONFIG,
      });
    } catch (e: any) {
      console.error('[useVapi] start error:', e?.message || e);
      setStatus('idle');
      toast.error("Failed to start voice. Please try again.");
    }
  }, [userId, book._id, book.title, book.persona, persona, messages, selectedVoiceId, getOrCreateThreadId]);

  // Instant stop
  const stop = useCallback(() => {
    isStoppingRef.current = true;
    setStatus('idle');
    setCurrentMessage('');
    setCurrentUserMessage('');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { getVapi()?.stop(); } catch (_) {}
  }, []);

  const sendText = useCallback(async (text: string) => {
    try {
      const tid = getOrCreateThreadId();

      setMessages(prev => [...prev, { role: 'user', content: text, sessionId: tid, createdAt: new Date() }]);
      saveMessage(book._id, 'user', text, tid).catch(() => {});

      if (status !== 'idle') {
        try { getVapi()?.send({ type: 'add-message', message: { role: 'user', content: text } }); } catch (_) {}
      } else {
        setIsTextLoading(true);
        try {
          const res = await chatWithBook(book._id, text, tid);
          if (res?.success && res.response) {
            setMessages(prev => [...prev, { role: 'assistant', content: res.response!, sessionId: tid, createdAt: new Date() }]);
          } else {
            const errMsg = res?.error?.includes('API key') ? "AI service unavailable. Check your API key." : "Couldn't get a response. Please try again.";
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg, sessionId: tid, createdAt: new Date() }]);
          }
        } catch (e: any) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please try again.", sessionId: tid, createdAt: new Date() }]);
        } finally {
          setIsTextLoading(false);
        }
      }
    } catch (e: any) {
      console.error('sendText error:', e?.message);
    }
  }, [status, book._id, getOrCreateThreadId]);

  const startNewThread = useCallback(() => {
    currentThreadIdRef.current = null;
    setSelectedThreadId(null);
    setCurrentMessage('');
    setCurrentUserMessage('');
    lastSavedTranscriptRef.current = null;
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      if (sessionId === 'legacy') {
        await deleteMessagesWithoutSession(book._id);
        setMessages(prev => prev.filter(m => !!m.sessionId));
        if (selectedThreadId === 'legacy') setSelectedThreadId(null);
        toast.success("Thread deleted.");
        return;
      }
      const res = await deleteMessagesBySession(sessionId);
      if (res?.success) {
        setMessages(prev => prev.filter(m => m.sessionId !== sessionId));
        if (selectedThreadId === sessionId) setSelectedThreadId(null);
        if (currentThreadIdRef.current === sessionId) {
          currentThreadIdRef.current = null;
        }
        toast.success("Thread deleted.");
      } else {
        toast.error("Failed to delete thread.");
      }
    } catch (e: any) {
      toast.error("Failed to delete thread.");
    }
  }, [book._id, selectedThreadId]);

  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    try {
      const res = await updateSessionTitle(sessionId, newTitle);
      if (res?.success) {
        toast.success("Thread renamed.");
      }
    } catch (_) {
      toast.error("Failed to rename thread.");
    }
  }, []);

  const clearError = useCallback(() => {
    setLimitError(null);
    setIsBillingError(false);
  }, []);

  const threadArchive = useMemo(() => {
    try {
      const groups: Record<string, Messages[]> = {};
      const timestamps: Record<string, Date> = {};
      const untracked: Messages[] = [];

      messages.forEach(m => {
        if (!m.sessionId) { untracked.push(m); return; }
        if (!groups[m.sessionId]) {
          groups[m.sessionId] = [];
          timestamps[m.sessionId] = m.createdAt ? new Date(m.createdAt) : new Date(0);
        }
        groups[m.sessionId].push(m);
        if (m.createdAt && new Date(m.createdAt) > timestamps[m.sessionId]) {
          timestamps[m.sessionId] = new Date(m.createdAt);
        }
      });

      const sortedIds = Object.keys(groups).sort((a, b) =>
        timestamps[b].getTime() - timestamps[a].getTime()
      );

      if (untracked.length > 0) {
        groups['legacy'] = untracked;
        timestamps['legacy'] = untracked[0]?.createdAt ? new Date(untracked[0].createdAt) : new Date(0);
        if (!sortedIds.includes('legacy')) sortedIds.push('legacy');
      }

      return sortedIds.map(id => {
        const firstUserMsg = groups[id]?.find(m => m.role === 'user')?.content || "";
        const title = firstUserMsg.length > 45 ? firstUserMsg.slice(0, 45) + "..." : (firstUserMsg || "New conversation");
        return { threadId: id, timestamp: timestamps[id], title };
      });
    } catch (_) { return []; }
  }, [messages]);

  return {
    status,
    isActive: status !== 'idle',
    isTextLoading,
    messages,
    currentViewMessages,
    selectedMessages,
    currentMessage,
    currentUserMessage,
    duration,
    start,
    stop,
    sendText,
    startNewThread,
    deleteSession,
    renameSession,
    limitError,
    isBillingError,
    clearError,
    maxDurationSeconds,
    persona,
    setPersona,
    selectedVoiceId,
    setSelectedVoiceId,
    threadArchive,
    selectedThreadId,
    setSelectedThreadId,
    hasArchive: messages.length > 0,
  };
}

export default useVapi;
