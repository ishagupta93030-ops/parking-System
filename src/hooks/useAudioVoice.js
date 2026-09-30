import { useState, useRef, useCallback } from 'react';

export function useAudioVoice() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState('en'); // 'en' or 'hi'
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioCtxRef = useRef(null);
  const lastSpokenRef = useRef({ type: null, time: 0 });

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playChime = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'occupied') {
        // Warning alert tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(587, now + 0.09);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'vacant') {
        // Welcoming clear tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  }, [soundEnabled]);

  const speakAlert = useCallback((type, customText = null) => {
    if (!voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    if (lastSpokenRef.current.type === type && (now - lastSpokenRef.current.time < 3500)) {
      return;
    }
    lastSpokenRef.current = { type, time: now };

    let text = customText;
    if (!text) {
      if (voiceLanguage === 'hi') {
        if (type === 'arrival') {
          text = 'नमस्ते! पार्किंग बे में गाड़ी डिटेक्ट हुई है। बैरियर खुल रहा है।';
        } else if (type === 'danger') {
          text = 'सावधान! गाड़ी बहुत पास है, कृपया रुकें।';
        } else if (type === 'departure') {
          text = 'गाड़ी प्रस्थान कर चुकी है। स्लॉट अब खाली है। धन्यवाद!';
        }
      } else {
        if (type === 'arrival') {
          text = 'Welcome! Vehicle detected in bay. Barrier opening.';
        } else if (type === 'danger') {
          text = 'Warning: Obstacle within 10 centimeters. Please stop.';
        } else if (type === 'departure') {
          text = 'Vehicle departed. Parking slot is now vacant. Thank you!';
        }
      }
    }

    if (!text) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = voiceLanguage === 'hi' ? 'hi-IN' : 'en-US';

      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
      setIsSpeaking(false);
    }
  }, [voiceEnabled, voiceLanguage]);

  return {
    soundEnabled,
    setSoundEnabled,
    voiceEnabled,
    setVoiceEnabled,
    voiceLanguage,
    setVoiceLanguage,
    isSpeaking,
    playChime,
    speakAlert
  };
}
