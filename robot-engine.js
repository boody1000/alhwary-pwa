/**
 * robot-engine.js - روبوت مكتب الهواري (v22.13.2)
 * 
 * ✅ FIX v22.13.2:
 *   - URLs كاملة للموقع الأصلي (InfinityFree)
 *   - إزالة credentials: same-origin (عشان CORS)
 *   - دعم GitHub Pages + InfinityFree Backend
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getDatabase, ref, get, set, update, push
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

console.log('[robot] v22.13.2 loaded');

const firebaseConfig = {
    apiKey: "AIzaSyCtf2ltWCvw6uW8LqpC2BCXKMoc76KjXVU",
    authDomain: "faceb-bb002.firebaseapp.com",
    databaseURL: "https://faceb-bb002-default-rtdb.firebaseio.com",
    projectId: "faceb-bb002",
    storageBucket: "faceb-bb002.firebasestorage.app",
    messagingSenderId: "456482622109",
    appId: "1:456482622109:web:32a45c12e5f1b2a210e274",
    measurementId: "G-5Y46BEF6V1"
};
const fbApp = initializeApp(firebaseConfig);
const fbdb = getDatabase(fbApp);
const HW_BASE = new URL('.', import.meta.url).href;

/* ═══════════════════════════════════════════════════════════════
 * ✅ روابط الـ Backend — كاملة للموقع الأصلي
 * ═══════════════════════════════════════════════════════════════ */
const HW_BACKEND = (window.HAWARY_BACKEND || 'https://alhwary.wuaze.com/robot').replace(/\/$/, '');

window.addEventListener('unhandledrejection', function (e) {
    console.warn('[robot] unhandled rejection:', e && e.reason && e.reason.message ? e.reason.message : e.reason);
    e.preventDefault();
});

const SOURCE_LABELS = {
    'ddg-lite': 'DDG-Lite', 'ddg-html': 'DDG-HTML', 'bing': 'Bing',
    'wikipedia': 'Wikipedia', 'firebase-brain': 'Brain', 'keywords-bank': 'Keywords',
    'conversation': 'Chat', 'knowledge-exact': 'Memory-Exact',
    'knowledge-similar': 'Memory-Similar', 'clarifying': 'Clarify'
};
function labelForSource(src) { return src ? (SOURCE_LABELS[src] || src) : ''; }

const EMOTION_EMOJI = {
    'happy': ':)', 'sad': ':(', 'angry': '>:(', 'confused': '?',
    'urgent': '!', 'curious': '?', 'neutral': ''
};

const SUPPORTED_LANGS = [
    { code: 'ar-EG', name: 'Arabic (Egypt)' }, { code: 'ar-SA', name: 'Arabic (Saudi)' },
    { code: 'en-US', name: 'English (US)' }, { code: 'en-GB', name: 'English (UK)' },
    { code: 'fr-FR', name: 'French' }, { code: 'de-DE', name: 'German' },
    { code: 'es-ES', name: 'Spanish' }, { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' }, { code: 'ru-RU', name: 'Russian' },
    { code: 'zh-CN', name: 'Chinese' }, { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' }, { code: 'hi-IN', name: 'Hindi' },
    { code: 'tr-TR', name: 'Turkish' }
];

let currentLang = localStorage.getItem('hw_lang') || 'ar-EG';

function stripEmojis(text) {
    if (!text) return '';
    let t = String(text);
    t = t.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
    t = t.replace(/[\u{2600}-\u{27BF}]/gu, '');
    t = t.replace(/[\u{1F000}-\u{1F2FF}]/gu, '');
    t = t.replace(/[\u{2190}-\u{21FF}]/gu, '');
    t = t.replace(/[\u{2B00}-\u{2BFF}]/gu, '');
    t = t.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
    t = t.replace(/[\u{200D}]/gu, '');
    t = t.replace(/[*_~`#>|]/g, ' ');
    t = t.replace(/\[\[AUDIO:[^\]]+\]\]/g, '');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}

function stripForSpeech(text) {
    if (!text) return '';
    let t = String(text);
    t = t.replace(/[\u{1F300}-\u{1FAFF}]/gu, ' ');
    t = t.replace(/[\u{2600}-\u{27BF}]/gu, ' ');
    t = t.replace(/[\u{1F000}-\u{1F2FF}]/gu, ' ');
    t = t.replace(/[\u{2190}-\u{21FF}]/gu, ' ');
    t = t.replace(/[\u{2B00}-\u{2BFF}]/gu, ' ');
    t = t.replace(/[\u{FE00}-\u{FE0F}]/gu, ' ');
    t = t.replace(/[\u{200D}]/gu, ' ');
    t = t.replace(/[*_~`#>|]/g, ' ');
    t = t.replace(/\[\[AUDIO:[^\]]+\]\]/g, ' ');
    t = t.replace(/[0-9\u0660-\u0669\u06F0-\u06F9]+/g, ' ');
    t = t.replace(/[\u060C\u061B\u061F\u066A\u066B\u066C\u066D\u06D4]/g, ' ');
    t = t.replace(/[,.!?؟:;؛\-–—_'"«»(){}<>\/\\|@#$%^&*+=]/g, ' ');
    t = t.replace(/\[/g, ' ').replace(/\]/g, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}

window.hwStripEmojis = stripEmojis;
window.hwStripForSpeech = stripForSpeech;

function isChatAvailable() { return !!(window.HawaryChat && typeof window.HawaryChat.buildAudioPlayer === 'function'); }
window.hwIsChatAvailable = isChatAvailable;

function normalizeArabic(text) {
    if (!text) return '';
    let t = String(text).trim();
    t = t.replace(/[\u064B-\u0652\u0670]/g, '');
    t = t.replace(/[أإآٱ]/g, 'ا');
    t = t.replace(/ة/g, 'ه');
    t = t.replace(/[ىی]/g, 'ي');
    t = t.replace(/ؤ/g, 'و');
    t = t.replace(/ئ/g, 'ي');
    t = t.replace(/\bبيك\b/g, 'بك');
    t = t.replace(/\bفيك\b/g, 'فك');
    t = t.replace(/\bليه\b/g, 'لي');
    t = t.replace(/\bإيه\b|\bايه\b/g, 'اي');
    t = t.replace(/\bإنت\b|\bانت\b/g, 'انت');
    t = t.replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}

function normalizeText(text, lang) {
    if (!text) return '';
    lang = lang || currentLang;
    let t = String(text).trim();
    if (lang.startsWith('ar')) return normalizeArabic(t);
    if (lang.startsWith('zh') || lang.startsWith('ja') || lang.startsWith('ko')) {
        return t.replace(/[^\p{L}\p{N}]/gu, '');
    }
    t = t.toLowerCase();
    t = t.replace(/[^\p{L}\p{N}\s]/gu, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}
window.hwNormalizeText = normalizeText;

function fixSpeechErrors(text, lang) {
    if (!text) return '';
    lang = lang || currentLang;
    let t = text;
    if (lang.startsWith('ar')) {
        t = t.replace(/\bكتاب مفتوح\b/g, '');
        t = t.replace(/\bنجمه\b/g, '');
        t = t.replace(/\bنجمة\b/g, '');
        t = t.replace(/\bرابط\b/g, '');
    }
    return t.replace(/\s+/g, ' ').trim();
}
window.hwFixSpeechErrors = fixSpeechErrors;

/* ═══════════════════════════════════════════════════════════════
 * ✅ BRAIN_CONFIG — URLs كاملة للموقع الأصلي
 * ═══════════════════════════════════════════════════════════════ */
const BRAIN_CONFIG = {
    brainApi: HW_BACKEND + '/firebase-api.php',
    webApi: HW_BACKEND + '/web-api.php',
    audioLibraryApi: HW_BACKEND + '/audio-library.php',
    geminiApi: HW_BACKEND + '/gemini-proxy.php',
    fastTimeout: 10000, webTimeout: 6000, totalTimeout: 13000,
    enabled: true, minCharsForSearch: 2, resultDelay: 200,
    bargeInEnabled: true, bargeInMinChars: 3, bargeInMinWords: 2,
    bargeInSettleMs: 1500, bargeInCooldownMs: 500,
    echoStrongWindowMs: 4000, echoNormalWindowMs: 45000, minNovelWords: 2,
    autoLangSwitch: true, minCharsForLangDetect: 6, langSwitchRequiredHits: 2,
    listenWatchdogEnabled: true, listenWatchdogMs: 1500, askUserMaxTries: 2,
    speakStartTimeoutMs: 2500, speakMaxDurationMs: 30000, recStartTimeoutMs: 2000,
    brainQueryTimeoutMs: 10000, pendingUserQTimeoutMs: 45000, humanizeEnabled: true,
    maxRecRestarts: 10, strongEchoThreshold: 0.6, knowledgeSearchMinScore: 0.7,
    knowledgeSaveMinConfidence: 0.6, knowledgeSaveMinLength: 10, knowledgeSaveMaxLength: 3000,
    ttsServiceUrl: 'https://alhwary-tts.hassanboody906.workers.dev/v1/audio/speech',
    ttsEnabled: true, ttsCacheEnabled: true, ttsTimeoutMs: 15000,
    greetingCooldownMs: 20000, duplicateHeardWindowMs: 2500,
    libraryTimeoutMs: 10000
};

const TTS_VOICE_MAP = {
    'ar-EG': 'ar-EG-ShakirNeural', 'ar-SA': 'ar-SA-HamedNeural',
    'en-US': 'en-US-GuyNeural', 'en-GB': 'en-GB-RyanNeural',
    'fr-FR': 'fr-FR-HenriNeural', 'de-DE': 'de-DE-ConradNeural',
    'es-ES': 'es-ES-AlvaroNeural', 'it-IT': 'it-IT-DiegoNeural',
    'pt-BR': 'pt-BR-AntonioNeural', 'ru-RU': 'ru-RU-DmitryNeural',
    'zh-CN': 'zh-CN-YunxiNeural', 'ja-JP': 'ja-JP-KeitaNeural',
    'ko-KR': 'ko-KR-InJoonNeural', 'hi-IN': 'hi-IN-MadhurNeural',
    'tr-TR': 'tr-TR-AhmetNeural'
};

function getTTSVoice(lang) {
    if (TTS_VOICE_MAP[lang]) return TTS_VOICE_MAP[lang];
    const base = lang.split('-')[0];
    const keys = Object.keys(TTS_VOICE_MAP);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].startsWith(base + '-')) return TTS_VOICE_MAP[keys[i]];
    }
    return 'en-US-GuyNeural';
}

function hwGetVisitorId() {
    let id = localStorage.getItem('hw_visitor_id');
    if (!id) {
        id = (crypto.randomUUID ? crypto.randomUUID() : ('v-' + Date.now() + '-' + Math.random().toString(16).slice(2)));
        localStorage.setItem('hw_visitor_id', id);
    }
    return id;
}
function hwGetVisitorName() { return localStorage.getItem('hw_visitor_name') || ''; }
function hwSetVisitorName(name) { localStorage.setItem('hw_visitor_name', name); }
const HW_VISITOR_ID = hwGetVisitorId();

async function hwTouchVisitor(nameToSave) {
    try {
        const page = (location.pathname.split('/').pop() || 'index.php');
        const payload = { lastSeen: Date.now(), lastPage: page, lastLang: currentLang };
        payload['pages/' + page.replace(/\./g, '_')] = Date.now();
        if (nameToSave) payload.name = nameToSave;
        const snap = await get(ref(fbdb, 'visitors/' + HW_VISITOR_ID + '/firstSeen'));
        if (!snap.exists()) payload.firstSeen = Date.now();
        await update(ref(fbdb, 'visitors/' + HW_VISITOR_ID), payload);
    } catch (e) {}
}

async function hwCheckKnowledge(question) {
    try {
        const qNorm = normalizeText(question, currentLang);
        if (!qNorm || qNorm.length < 3) return null;
        const snap = await get(ref(fbdb, 'knowledge'));
        if (!snap.exists()) return null;
        const data = snap.val();
        const entries = Object.entries(data);
        if (!entries.length) return null;
        let best = null, bestScore = 0, bestKey = null;
        const qWords = new Set(qNorm.split(/\s+/).filter(w => w.length > 2));
        for (const [key, item] of entries) {
            if (!item || !item.q || !item.a) continue;
            if (item.lang) {
                const itemBase = String(item.lang).split('-')[0];
                const currBase = currentLang.split('-')[0];
                if (itemBase !== currBase) continue;
            }
            const storedNorm = item.qNorm || normalizeText(item.q, currentLang);
            if (!storedNorm) continue;
            if (storedNorm === qNorm) return { answer: item.a, score: 1, source: 'knowledge-exact', key: key, item: item };
            const sWords = storedNorm.split(/\s+/).filter(w => w.length > 2);
            if (!sWords.length || !qWords.size) continue;
            const overlap = sWords.filter(w => qWords.has(w)).length;
            const score = overlap / Math.max(qWords.size, sWords.length);
            if (score > bestScore && score >= BRAIN_CONFIG.knowledgeSearchMinScore) {
                bestScore = score; best = item; bestKey = key;
            }
        }
        if (best) return { answer: best.a, score: bestScore, source: 'knowledge-similar', key: bestKey, item: best };
        return null;
    } catch (e) { return null; }
}

async function hwSaveKnowledge(question, answer, meta) {
    meta = meta || {};
    try {
        if (!question || !answer) return false;
        const cleanAnswer = stripEmojis(String(answer)).trim();
        if (!cleanAnswer) return false;
        if (cleanAnswer.length < BRAIN_CONFIG.knowledgeSaveMinLength) return false;
        if (cleanAnswer.length > BRAIN_CONFIG.knowledgeSaveMaxLength) return false;
        if (cleanAnswer.indexOf('ممكن توضحلي') !== -1) return false;
        if (cleanAnswer.indexOf('ممكن تقولي تفاصيل') !== -1) return false;
        const qNorm = normalizeText(question, currentLang);
        if (!qNorm || qNorm.length < 3) return false;
        const existing = await hwCheckKnowledge(question);
        if (existing && existing.score >= 0.95 && existing.key) {
            await update(ref(fbdb, 'knowledge/' + existing.key), {
                hits: (existing.item.hits || 1) + 1, lastUsed: Date.now(), a: cleanAnswer
            });
            return true;
        }
        await push(ref(fbdb, 'knowledge'), {
            q: question, qNorm: qNorm, a: cleanAnswer,
            source: meta.source || 'unknown', confidence: meta.confidence || 0,
            lang: currentLang, emotion: meta.emotion || null, intent: meta.intent || null,
            visitorId: HW_VISITOR_ID, hits: 1, ts: Date.now(), lastUsed: Date.now()
        });
        return true;
    } catch (e) { return false; }
}

async function hwLogQuestion(question, answer, source) {
    try {
        await push(ref(fbdb, 'questions'), {
            visitorId: HW_VISITOR_ID, visitorName: hwGetVisitorName(),
            question: question, answer: answer, source: source, lang: currentLang,
            page: (location.pathname.split('/').pop() || 'index.php'), ts: Date.now()
        });
    } catch (e) {}
}
async function hwLogUnanswered(question) {
    try {
        await push(ref(fbdb, 'unanswered'), {
            visitorId: HW_VISITOR_ID, visitorName: hwGetVisitorName(),
            question: question, lang: currentLang,
            page: (location.pathname.split('/').pop() || 'index.php'), ts: Date.now()
        });
    } catch (e) {}
}
async function hwSaveConversationTurn(role, text) {
    try {
        await push(ref(fbdb, 'conversations/' + HW_VISITOR_ID), {
            role: role, text: text, lang: currentLang, ts: Date.now()
        });
    } catch (e) {}
}

window.HawaryBrain = {
    checkKnowledge: hwCheckKnowledge, saveKnowledge: hwSaveKnowledge,
    logQuestion: hwLogQuestion, logUnanswered: hwLogUnanswered
};

const HUMAN_RESPONSES = {
    'ar': {
        thinking: ['لحظة أفكر...', 'ثانية واحدة...', 'خليني أشوف...'],
        ackOk: ['تمام.', 'ماشي.', 'حاضر.', 'طيب.'],
        greet: ['أهلاً بيك.', 'أهلاً وسهلاً.', 'منور يا فندم.'],
        unknown: ['معلش يا فندم، مش لاقي إجابة للسؤال ده.', 'للأسف مش عندي إجابة للسؤال ده دلوقتي.']
    },
    'en': {
        thinking: ['One moment...', 'Let me think...', 'Hmm...'],
        ackOk: ['Okay.', 'Got it.', 'Alright.', 'I see.'],
        greet: ['Welcome!', 'Hello!', 'Hi there!'],
        unknown: ['Sorry, I could not find an answer.', 'I do not have an answer for that.']
    }
};

function humanResp(kind) {
    if (!BRAIN_CONFIG.humanizeEnabled) return '';
    const langBase = currentLang.split('-')[0];
    const map = HUMAN_RESPONSES[langBase] || HUMAN_RESPONSES['en'];
    const arr = map[kind] || [];
    if (!arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
}

let speechState = { active: false, startedAt: 0, startConfirmed: false };
function resetSpeechState() { speechState.active = false; speechState.startedAt = 0; speechState.startConfirmed = false; }

let speechFailCount = 0;
let speechSuccessCount = 0;
let globalAudioPrimed = false;
let recState = { lastStartAttempt: 0, lastStartSuccess: 0, failedStarts: 0 };
let operationTimeouts = { speakHard: null, operation: null };

function clearAllOperationTimeouts() {
    if (operationTimeouts.speakHard) { clearTimeout(operationTimeouts.speakHard); operationTimeouts.speakHard = null; }
    if (operationTimeouts.operation) { clearTimeout(operationTimeouts.operation); operationTimeouts.operation = null; }
}

let pendingUserQuestion = { active: false, originalQuestion: '', tries: 0, timestamp: 0 };
function clearPendingUserQuestion() {
    pendingUserQuestion.active = false; pendingUserQuestion.originalQuestion = '';
    pendingUserQuestion.tries = 0; pendingUserQuestion.timestamp = 0;
}
function isUserQuestionExpired() {
    if (!pendingUserQuestion.active) return true;
    return (Date.now() - pendingUserQuestion.timestamp) > BRAIN_CONFIG.pendingUserQTimeoutMs;
}

let pendingClarification = { active: false, topic: '', options: [], timestamp: 0 };
function isClarificationExpired() {
    return !pendingClarification.active || (Date.now() - pendingClarification.timestamp) > 120000;
}

const ISLAMIC_ECHO_PHRASES = [
    'بسم الله الرحمن الرحيم', 'بسم الله الرحمن', 'الرحمن الرحيم',
    'الحمد لله رب العالمين', 'الحمد لله', 'صلى الله عليه وسلم',
    'سبحان الله وبحمده', 'سبحان الله', 'لا إله إلا الله', 'الله أكبر',
    'أعوذ بالله من الشيطان', 'أعوذ بالله', 'صدق الله العظيم',
    'رب العالمين', 'اللهم صل على محمد', 'اللهم', 'يا رب'
];

const LANG_SCRIPTS = {
    'ar': /[\u0600-\u06FF]/g, 'ru': /[\u0400-\u04FF]/g, 'zh': /[\u4E00-\u9FFF]/g,
    'ja': /[\u3040-\u30FF]/g, 'ko': /[\uAC00-\uD7AF]/g, 'hi': /[\u0900-\u097F]/g
};

function detectLanguageFromText(text) {
    if (!text || text.length < BRAIN_CONFIG.minCharsForLangDetect) return null;
    const t = String(text);
    const scriptScores = {};
    const scriptKeys = Object.keys(LANG_SCRIPTS);
    for (let i = 0; i < scriptKeys.length; i++) {
        const lang = scriptKeys[i];
        const matches = t.match(LANG_SCRIPTS[lang]);
        scriptScores[lang] = matches ? matches.length : 0;
    }
    let bestScript = null, bestCount = 0;
    const scoreKeys = Object.keys(scriptScores);
    for (let i = 0; i < scoreKeys.length; i++) {
        if (scriptScores[scoreKeys[i]] > bestCount) { bestScript = scoreKeys[i]; bestCount = scriptScores[scoreKeys[i]]; }
    }
    if (bestCount >= 3 && bestScript) {
        const map = { 'ar': 'ar-EG', 'ru': 'ru-RU', 'zh': 'zh-CN', 'ja': 'ja-JP', 'ko': 'ko-KR', 'hi': 'hi-IN' };
        return map[bestScript] || 'ar-EG';
    }
    const latinOnly = t.replace(/[^a-zA-Z\s]/g, '');
    if (latinOnly.length >= 5) return 'en-US';
    return null;
}

const LANG_SWITCH_KEYWORDS = {
    'en-US': ['speak english', 'in english', 'english please', 'switch to english'],
    'ar-EG': ['تكلم عربي', 'بالعربي', 'تكلم بالعربي', 'اتكلم عربي'],
    'fr-FR': ['parle francais', 'en francais', 'francais'],
    'es-ES': ['habla espanol', 'en espanol', 'espanol'],
    'de-DE': ['sprich deutsch', 'auf deutsch', 'deutsch'],
    'tr-TR': ['turkce konus', 'turkce']
};

function detectLangSwitchCommand(text) {
    const lower = String(text).toLowerCase().trim();
    const langs = Object.keys(LANG_SWITCH_KEYWORDS);
    for (let i = 0; i < langs.length; i++) {
        const kws = LANG_SWITCH_KEYWORDS[langs[i]];
        for (let j = 0; j < kws.length; j++) {
            if (lower.indexOf(kws[j].toLowerCase()) !== -1) return langs[i];
        }
    }
    return null;
}

/* ═══════════════════════════════════════════════════════════════
 * ✅ hwQueryEndpoint — بدون credentials + URL كامل
 * ═══════════════════════════════════════════════════════════════ */
async function hwQueryEndpoint(question, options, timeoutMs) {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const payload = {
            q: question, action: 'think', session: HW_VISITOR_ID, sessionId: HW_VISITOR_ID,
            lang: currentLang, detectedLang: currentLang, visitorName: hwGetVisitorName(),
            use_firebase: options.use_firebase !== false, use_web: options.use_web !== false,
            use_brain: options.use_brain !== false, combined: !!options.combined
        };
        /* ✅ fetch لـ URL كامل — بدون credentials */
        const resp = await fetch(BRAIN_CONFIG.brainApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: ctrl.signal
        });
        clearTimeout(tid);
        if (!resp.ok) return null;
        const json = await resp.json();
        if (!json || json.ok !== true) return null;
        const answer = (json.answer || '').trim();
        if (!answer || answer.length < 3) return null;
        return {
            answer: answer, confidence: json.confidence || 0,
            source: json.engine || json.source || 'brain', time_ms: json.elapsed_ms || 0,
            lang: json.lang || currentLang, options: Array.isArray(json.options) ? json.options : null,
            state: json.state || 'idle', pending_topic: json.pending_topic || '',
            emotion: json.emotion || null, intent: json.intent || null, decision: json.decision || null
        };
    } catch (e) { clearTimeout(tid); return null; }
}

async function hwQueryWebIndex() { return null; }

async function hwQueryBrain(question, options) {
    options = options || {};
    if (!BRAIN_CONFIG.enabled) return null;
    const startTime = Date.now();
    const totalTimeout = options.totalTimeout || BRAIN_CONFIG.totalTimeout;
    const fastPromise = hwQueryEndpoint(question, {
        use_firebase: true, use_web: true, use_brain: true, combined: true
    }, BRAIN_CONFIG.fastTimeout);
    try {
        const result = await Promise.race([
            fastPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('total-timeout')), totalTimeout))
        ]);
        if (result && result.answer) {
            console.log('[brain] answer in ' + (Date.now() - startTime) + 'ms from ' + labelForSource(result.source));
            return result;
        }
        return null;
    } catch (e) { return null; }
}

const HAWARY_CONFIG = {
    greeting: {
        'ar': 'أهلاً بيك يا فندم في مكتب الهواري.', 'en': 'Welcome to Al-Hawary office!',
        'fr': 'Bienvenue au bureau Al-Hawary!', 'de': 'Willkommen im Al-Hawary-Buro!',
        'es': 'Bienvenido a la oficina Al-Hawary!', 'it': 'Benvenuto!', 'pt': 'Bem-vindo!',
        'ru': 'Dobro pozhalovat!', 'zh': 'Welcome!', 'ja': 'Yokoso!',
        'ko': 'Hwanyeonghamnida!', 'hi': 'Aapka swagat hai!', 'tr': 'Hos geldiniz!'
    },
    nameQuestion: {
        'ar': 'بس الأول، حضرتك اسمك ايه؟', 'en': 'First, what is your name?',
        'fr': 'Quel est votre nom?', 'de': 'Wie heisst du?', 'es': 'Como te llamas?',
        'it': 'Come ti chiami?', 'pt': 'Qual e o seu nome?', 'ru': 'Kak vas zovut?',
        'zh': 'What is your name?', 'ja': 'Onamae wa?', 'ko': 'Ireumi?',
        'hi': 'Aapka naam?', 'tr': 'Adiniz?'
    },
    noAnswer: {
        'ar': 'معلش، مش لاقي إجابة للسؤال ده.', 'en': 'Sorry, no answer found.'
    },
    langChanged: {
        'ar': 'تمام، هكلمك بالعربي من دلوقتي.', 'en': 'OK, I will speak English now.',
        'fr': 'OK, francais.', 'de': 'OK, Deutsch.', 'es': 'OK, espanol.',
        'it': 'OK, italiano.', 'pt': 'OK, portugues.', 'ru': 'OK, russkiy.',
        'zh': 'OK, Chinese.', 'ja': 'OK, nihongo.', 'ko': 'OK, hangugeo.',
        'hi': 'OK, hindi.', 'tr': 'OK, turkce.'
    },
    didNotCatch: {
        'ar': 'معلش، مسمعتش كويس. قول تاني من فضلك.', 'en': 'Sorry, I did not catch that.',
        'fr': 'Desole, je n ai pas compris.', 'de': 'Bitte wiederholen.',
        'es': 'No entendi. Repitelo.', 'it': 'Non ho capito.', 'pt': 'Nao entendi.',
        'ru': 'Ne rasslyshal.', 'zh': 'Please say again.', 'ja': 'Mou ichido onegaishimasu.',
        'ko': 'Dasi malhaejuseyo.', 'hi': 'Phir se kahen.', 'tr': 'Tekrar soyleyin.'
    },
    askForInfo: {
        'ar': ['معلش يا فندم، ممكن توضحلي أكتر؟', 'ممكن تقولي تفاصيل أكتر؟', 'مش فاهم قصدك، ممكن تشرحلي؟', 'قولي تفاصيل أكتر.'],
        'en': ['Can you explain more?', 'Could you give more details?', 'Can you elaborate?']
    },
    stillNoAnswer: {
        'ar': 'معلش يا فندم، حاولت كتير بس مش لاقي إجابة.',
        'en': 'Sorry, I could not find an answer.'
    }
};

function t(key, replacements) {
    replacements = replacements || {};
    const langBase = currentLang.split('-')[0];
    const map = HAWARY_CONFIG[key] || {};
    let msg = map[langBase] || map['ar'] || '';
    const keys = Object.keys(replacements);
    for (let i = 0; i < keys.length; i++) {
        msg = msg.replace(new RegExp('\\{' + keys[i] + '\\}', 'g'), replacements[keys[i]]);
    }
    return msg;
}

function tAsk() {
    const langBase = currentLang.split('-')[0];
    const map = HAWARY_CONFIG.askForInfo || {};
    const arr = map[langBase] || map['ar'] || ['?'];
    return arr[Math.floor(Math.random() * arr.length)];
}

const SITE_MAP = [
    { keywords: ['تسجيل الدخول', 'الدخول', 'login', 'signin'], url: 'login.php', selector: 'input[name="username"]', label: 'صفحة تسجيل الدخول' },
    { keywords: ['تسجيل', 'حساب جديد', 'register', 'sign up'], url: 'regster.php', selector: 'input[name="name"]', label: 'صفحة إنشاء حساب جديد' },
    { keywords: ['الصفحة الرئيسية', 'الرئيسية', 'home', 'main'], url: 'main.php', selector: null, label: 'الصفحة الرئيسية' },
    { keywords: ['اختيار الشريك', 'البحث عن شريك', 'search'], url: 'formpeo.php', selector: '#search-form', label: 'صفحة اختيار الشريك' },
    { keywords: ['الملف الشخصي', 'بياناتي', 'profile'], url: 'cv.php', selector: null, label: 'صفحتك الشخصية' },
    { keywords: ['استماره', 'استمارة راغبي الزواج', 'form'], url: 'info.php', selector: '#marriageForm', label: 'استمارة راغبي الزواج' },
    { keywords: ['خدمة العملاء', 'الدعم الفني', 'support', 'contact', 'help'], url: 'call.php', selector: null, label: 'خدمة العملاء' },
    { keywords: ['واتساب', 'whatsapp'], url: 'login.php', selector: '.wa-widget', label: 'أرقام الواتساب' }
];

/* ═══════════════════════════════════════════════════════════════
 *  مكتبة الصوت
 * ═══════════════════════════════════════════════════════════════ */
const AUDIO_LIBRARY = [];
let libraryLoaded = false;
let libraryLoadPromise = null;

const AUDIO_PLAY_TRIGGERS = ['شغل', 'شغلي', 'شغللي', 'سمعني', 'اسمع', 'اسمعني', 'عايز اسمع', 'عاوز اسمع', 'نفسي اسمع', 'تلاوه', 'تلاوة', 'صوت', 'play', 'listen', 'ecouter', 'reproducir'];
const TEXT_INTENT_KEYWORDS = ['تفسير', 'تفسيرها', 'تفسيره', 'معنى', 'معناها', 'معناه', 'شرح', 'اشرح', 'اشرحلي', 'وضح', 'وضحلي', 'فسر', 'فسرلي', 'ايه', 'إيه', 'ما هو', 'ما هي', 'ما معنى', 'اقرأ', 'اكتب', 'اكتبلي', 'tafsir', 'meaning', 'explain', 'define', 'what is'];
const LOCATION_TRIGGERS = ['فين', 'وين', 'ازاي اروح', 'دلني على', 'وريني', 'وديني', 'روح بيا', 'خدني', 'عايز اروح', 'where', 'how to go', 'navigate'];

/* ✅ loadAudioLibraryFromServer — URL كامل + بدون credentials */
async function loadAudioLibraryFromServer() {
    if (libraryLoadPromise) return libraryLoadPromise;
    libraryLoadPromise = (async function () {
        try {
            const ctrl = new AbortController();
            const tid = setTimeout(function () { ctrl.abort(); }, BRAIN_CONFIG.libraryTimeoutMs);
            const resp = await fetch(BRAIN_CONFIG.audioLibraryApi, {
                method: 'GET',
                cache: 'no-store',
                signal: ctrl.signal
            });
            clearTimeout(tid);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const items = await resp.json();
            if (!Array.isArray(items) || !items.length) throw new Error('empty library');

            AUDIO_LIBRARY.length = 0;
            let withUrl = 0, withUrls = 0;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item) continue;
                if (item.url) { AUDIO_LIBRARY.push(item); withUrl++; }
                else if (item.urls && Array.isArray(item.urls) && item.urls.length) {
                    AUDIO_LIBRARY.push(item); withUrls++;
                }
            }

            _resetLibraryCache();

            libraryLoaded = true;
            console.log('[robot] ✅ library from server: ' + AUDIO_LIBRARY.length +
                        ' items (' + withUrl + ' single, ' + withUrls + ' playlists)');
            return AUDIO_LIBRARY.length;
        } catch (e) {
            console.warn('[robot] ⚠️ library fetch failed:', e.message);
            libraryLoaded = false;
            return 0;
        }
    })();
    return libraryLoadPromise;
}

function reloadAudioLibrary() {
    libraryLoadPromise = null;
    return loadAudioLibraryFromServer();
}

function buildFallbackLibrary() {
    if (AUDIO_LIBRARY.length) return;
    const fallback = [
        { title: 'سورة الفاتحة - مشاري العفاسي', keywords: ['سوره الفاتحه', 'الفاتحه'], url: 'https://server8.mp3quran.net/afs/001.mp3', reciter: 'مشاري العفاسي' },
        { title: 'سورة الإخلاص - مشاري العفاسي', keywords: ['سوره الاخلاص', 'الاخلاص'], url: 'https://server8.mp3quran.net/afs/112.mp3', reciter: 'مشاري العفاسي' },
        { title: 'سورة يس - مشاري العفاسي', keywords: ['سوره يس', 'يس'], url: 'https://server8.mp3quran.net/afs/036.mp3', reciter: 'مشاري العفاسي' },
        { title: 'سورة الرحمن - مشاري العفاسي', keywords: ['سوره الرحمن', 'الرحمن'], url: 'https://server8.mp3quran.net/afs/055.mp3', reciter: 'مشاري العفاسي' },
        { title: 'سورة الملك - مشاري العفاسي', keywords: ['سوره الملك', 'الملك'], url: 'https://server8.mp3quran.net/afs/067.mp3', reciter: 'مشاري العفاسي' },
        { title: 'الرقية الشرعية كاملة', keywords: ['الرقية الشرعية', 'رقية'], url: 'https://server11.mp3quran.net/ruqyah/ruqyah_complete.mp3' }
    ];
    for (let i = 0; i < fallback.length; i++) AUDIO_LIBRARY.push(fallback[i]);
    console.log('[robot] 🆘 fallback library: ' + AUDIO_LIBRARY.length + ' items');
}

loadAudioLibraryFromServer().then(function (n) {
    if (!n) buildFallbackLibrary();
});

function hasTextIntent(text) {
    const norm = normalizeText(text, currentLang);
    for (let i = 0; i < TEXT_INTENT_KEYWORDS.length; i++) {
        const nk = normalizeText(TEXT_INTENT_KEYWORDS[i], currentLang);
        if (nk && norm.indexOf(nk) !== -1) return true;
    }
    return false;
}

let _cachedSurahNames = null;
let _cachedReciterNames = null;

function _extractSurahFromTitle(title) {
    const m = String(title || '').match(/^سورة\s+(.+?)\s+-\s+/);
    return m ? m[1] : null;
}

function _extractReciterFromTitle(title) {
    const m = String(title || '').match(/\s+-\s+(.+)$/);
    return m ? m[1] : null;
}

function _getSurahNamesFromLibrary() {
    if (_cachedSurahNames) return _cachedSurahNames;
    const set = new Set();
    for (let i = 0; i < AUDIO_LIBRARY.length; i++) {
        const s = _extractSurahFromTitle(AUDIO_LIBRARY[i].title);
        if (s) set.add(normalizeText(s, currentLang));
    }
    _cachedSurahNames = Array.from(set).sort(function (a, b) { return b.length - a.length; });
    return _cachedSurahNames;
}

function _getReciterNamesFromLibrary() {
    if (_cachedReciterNames) return _cachedReciterNames;
    const set = new Set();
    for (let i = 0; i < AUDIO_LIBRARY.length; i++) {
        const item = AUDIO_LIBRARY[i];
        if (item.reciter) set.add(normalizeText(item.reciter, currentLang));
        const r = _extractReciterFromTitle(item.title);
        if (r) set.add(normalizeText(r, currentLang));
    }
    const shortSet = new Set();
    set.forEach(function (full) {
        const parts = full.split(/\s+/).filter(function (w) { return w.length >= 3; });
        if (parts.length > 1) {
            shortSet.add(parts[parts.length - 1]);
            shortSet.add(parts[0]);
        }
    });
    shortSet.forEach(function (s) { set.add(s); });
    _cachedReciterNames = Array.from(set).sort(function (a, b) { return b.length - a.length; });
    return _cachedReciterNames;
}

function _resetLibraryCache() {
    _cachedSurahNames = null;
    _cachedReciterNames = null;
}

const SLUG_TO_RECITER = {
    'afs': 'مشاري العفاسي',
    'rmsd': 'عبد الرحمن مسعد',
    'minsh': 'محمد صديق المنشاوي',
    'maher': 'ماهر المعيقلي',
    'sds': 'عبد الرحمن السديس',
    'husr': 'محمود خليل الحصري',
    'mustafa': 'مصطفى إسماعيل',
    'jbrl': 'محمد جبريل',
    'tblawi': 'محمد الطبلاوي',
    'abkr': 'إدريس أبكر',
    'balilah': 'بندر بليلة',
    'jleel': 'خالد الجليل',
    'wdae': 'وديع اليمني',
    'raad': 'رعد محمد الكردي',
    'akhdar': 'إبراهيم الأخضر',
    'lhdan': 'محمد اللحيدان',
    'mhsny': 'محمد المحيسني',
    'ayyoub': 'محمد أيوب',
    'aoun': 'عبدالإله بن عون',
    'Nufais': 'أحمد النفيس',
    'mqrnn': 'سعد المقرن',
    'qahtani': 'خالد القحطاني',
    'basit': 'عبد الباسط عبد الصمد',
    'jaber': 'علي جابر'
};

function _fixItemTitle(item) {
    const url = item.url || (item.urls && item.urls[0]) || '';
    const m = url.match(/mp3quran\.net\/([^\/]+)\//i);
    if (!m) return item.title;

    const slug = m[1];
    const realReciter = SLUG_TO_RECITER[slug];
    if (!realReciter) return item.title;

    const surahMatch = item.title.match(/^سورة\s+(.+?)\s+-\s+/);
    if (!surahMatch) return item.title;

    const surahName = surahMatch[1];
    const fixed = 'سورة ' + surahName + ' - ' + realReciter;
    if (fixed !== item.title) {
        console.log('[robot] 🔧 title fixed:', item.title, '→', fixed);
    }
    return fixed;
}

function findAudioItem(text) {
    if (hasTextIntent(text)) return null;
    if (!AUDIO_LIBRARY.length) return null;

    let norm = normalizeText(text, currentLang);
    norm = norm.replace(/\s+بصوت\s+/g, ' ');
    norm = norm.replace(/\s+للشيخ\s+/g, ' ');
    norm = norm.replace(/\s+الشيخ\s+/g, ' ');
    norm = norm.replace(/\s+بصوت الشيخ\s+/g, ' ');
    norm = norm.replace(/\s+بصوت القارئ\s+/g, ' ');
    norm = norm.trim();

    let hasTrigger = false;
    for (let i = 0; i < AUDIO_PLAY_TRIGGERS.length; i++) {
        if (norm.indexOf(normalizeText(AUDIO_PLAY_TRIGGERS[i], currentLang)) !== -1) {
            hasTrigger = true;
            break;
        }
    }
    if (!hasTrigger) return null;

    const padded = ' ' + norm + ' ';

    let foundSurah = null;
    const surahs = _getSurahNamesFromLibrary();
    for (let i = 0; i < surahs.length; i++) {
        if (padded.indexOf(' ' + surahs[i] + ' ') !== -1) {
            foundSurah = surahs[i];
            break;
        }
    }

    let foundReciter = null;
    const reciters = _getReciterNamesFromLibrary();
    for (let i = 0; i < reciters.length; i++) {
        if (padded.indexOf(' ' + reciters[i] + ' ') !== -1) {
            foundReciter = reciters[i];
            break;
        }
    }

    console.log('[robot] 🔎 surah:', foundSurah, '| reciter:', foundReciter);

    if (foundSurah && foundReciter) {
        for (let i = 0; i < AUDIO_LIBRARY.length; i++) {
            const item = AUDIO_LIBRARY[i];
            const tn = normalizeText(item.title, currentLang);
            const rn = item.reciter ? normalizeText(item.reciter, currentLang) : '';
            const both = tn.indexOf(foundSurah) !== -1 &&
                        (rn.indexOf(foundReciter) !== -1 || tn.indexOf(foundReciter) !== -1);
            if (both) {
                console.log('[robot] ✅ matched BOTH:', item.title);
                return item;
            }
        }
    }

    if (foundSurah) {
        for (let i = 0; i < AUDIO_LIBRARY.length; i++) {
            const item = AUDIO_LIBRARY[i];
            const tn = normalizeText(item.title, currentLang);
            if (tn.indexOf(foundSurah) !== -1) {
                console.log('[robot] ✅ matched SURAH only:', item.title);
                return item;
            }
        }
    }

    if (foundReciter) {
        for (let i = 0; i < AUDIO_LIBRARY.length; i++) {
            const item = AUDIO_LIBRARY[i];
            const rn = item.reciter ? normalizeText(item.reciter, currentLang) : '';
            const tn = normalizeText(item.title, currentLang);
            if (rn.indexOf(foundReciter) !== -1 || tn.indexOf(foundReciter) !== -1) {
                console.log('[robot] ✅ matched RECITER only:', item.title);
                return item;
            }
        }
    }

    let best = null, bestLen = 0;
    for (let i = 0; i < AUDIO_LIBRARY.length; i++) {
        const item = AUDIO_LIBRARY[i];
        const keywords = [item.title].concat(item.keywords || []);
        for (let j = 0; j < keywords.length; j++) {
            const nk = normalizeText(keywords[j], currentLang);
            if (nk && padded.indexOf(' ' + nk + ' ') !== -1 && nk.length > bestLen) {
                best = item;
                bestLen = nk.length;
            }
        }
    }
    if (best) console.log('[robot] ✅ matched KEYWORD:', best.title);
    return best;
}

window.HawaryEngineAudio = {
    find: findAudioItem, hasTextIntent: hasTextIntent,
    urls: function (item) { return (item.urls || [item.url]).filter(Boolean).map(function (u) { return new URL(u, HW_BASE).href; }); },
    size: function () { return AUDIO_LIBRARY.length; },
    list: function () { return AUDIO_LIBRARY.slice(); },
    reload: reloadAudioLibrary,
    isLoaded: function () { return libraryLoaded; }
};

function hwPermissionsGranted() { return localStorage.getItem('hw_perm_granted') === 'yes'; }

function showPermissionGate(onDone, onTap) {
    const overlay = document.createElement('div');
    overlay.id = 'hw-perm-gate';
    const box = document.createElement('div');
    box.className = 'hw-perm-box';
    box.innerHTML = '<div class="hw-perm-icon">MIC</div><h2>الروبوت محتاج إذن الميكروفون</h2><p>اضغط تفعيل للمتابعة.</p><button id="hw-perm-btn">تفعيل</button><button id="hw-perm-skip">تخطي</button>';
    overlay.appendChild(box);
    const gateStyle = document.createElement('style');
    gateStyle.textContent = [
        '#hw-perm-gate{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:999999;',
        'display:flex;align-items:center;justify-content:center;direction:rtl;font-family:Tahoma,sans-serif}',
        '#hw-perm-gate .hw-perm-box{background:#fff;padding:28px 24px;border-radius:18px;max-width:360px;',
        'text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4)}',
        '#hw-perm-gate h2{margin:8px 0 10px;color:#0d6efd;font-size:20px}',
        '#hw-perm-gate p{margin:0 0 18px;color:#444;line-height:1.7;font-size:14px}',
        '#hw-perm-gate button{display:block;width:100%;padding:12px;border:none;border-radius:10px;',
        'font-size:16px;cursor:pointer;margin-top:8px;font-family:inherit}',
        '#hw-perm-btn{background:#0d6efd;color:#fff;font-weight:bold}',
        '#hw-perm-skip{background:#f1f3f5;color:#555}'
    ].join('');
    document.head.appendChild(gateStyle);
    document.body.appendChild(overlay);

    document.getElementById('hw-perm-btn').onclick = async function () {
        if (onTap) onTap();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            window.localstream = stream;
            localStorage.setItem('hw_perm_granted', 'yes');
            overlay.remove();
            if (typeof onDone == 'function') onDone(true);
        } catch (e) { alert('لازم توافق على إذن الميكروفون.'); }
    };
    document.getElementById('hw-perm-skip').onclick = function () {
        overlay.remove();
        if (onDone) onDone(false);
    };
}

(function () {
    const style = document.createElement('style');
    style.innerHTML = [
        '@keyframes hawaryIdleBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.035); } }',
        '@keyframes hawaryListenGlow { 0%,100% { box-shadow: 0 0 0 4px rgba(46,204,113,.55); } 50% { box-shadow: 0 0 0 9px rgba(46,204,113,.18); } }',
        '@keyframes hawaryTalkGlow { 0% { box-shadow: 0 0 0 2px rgba(255,204,0,.65); } 100% { box-shadow: 0 0 0 13px rgba(255,204,0,0); } }',
        '@keyframes hawaryPulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(255,204,0,.65); } 50% { box-shadow: 0 0 0 12px rgba(255,204,0,0); } }',
        '@keyframes hawaryThink { 0%,100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.08) rotate(3deg); opacity: .85; } }',
        '@keyframes hawaryPulseBtn { 0%,100% { transform: scale(1); box-shadow: 0 2px 8px rgba(40,167,69,.4); } 50% { transform: scale(1.15); box-shadow: 0 4px 16px rgba(40,167,69,.7); } }',
        '#hawary-robot-box { position: fixed; bottom: 20px; right: 20px; z-index: 99999; }',
        '#hawary-bubble { display: none; position: absolute; bottom: 120px; right: 0; background: #fff; color: #333; padding: 12px 16px; border-radius: 14px; box-shadow: 0 5px 25px rgba(0,0,0,.25); max-width: 320px; font-size: 14px; direction: rtl; border-right: 4px solid #007bff; font-family: Tahoma, sans-serif; line-height: 1.6; white-space: pre-wrap; }',
        '#hawary-bubble .hw-emo { font-size: 12px; opacity: .7; margin-top: 6px; }',
        '.hw-avatar-wrap { position: relative; width: 100px; height: 100px; animation: hawaryIdleBreathe 3.2s ease-in-out infinite; }',
        '#hawary-robot-box.pointing .hw-avatar-wrap { animation: none !important; }',
        '#hawary-robot-box.thinking .hw-avatar-wrap { animation: hawaryThink 1s ease-in-out infinite; }',
        '.hw-avatar-img { position: relative; z-index: 2; width: 100px; height: 100px; border-radius: 50%; object-fit: cover; display: block; border: 3px solid #0d6efd; box-shadow: 0 6px 16px rgba(0,123,255,.35); }',
        '.hw-halo { position: absolute; inset: -6px; border-radius: 50%; z-index: 1; pointer-events: none; }',
        '#hawary-robot-box.listening .hw-halo { animation: hawaryListenGlow 1.5s ease-in-out infinite; }',
        '#hawary-robot-box.speaking .hw-halo { animation: hawaryTalkGlow .45s ease-in-out infinite alternate; }',
        '#hawary-robot-box.thinking .hw-avatar-img { border-color: #ff9800; }',
        '.hawary-point-target { outline: 4px solid #ffcc00 !important; outline-offset: 4px; border-radius: 12px; animation: hawaryPulseGlow 1s ease-in-out infinite; position: relative; z-index: 3; }',
        '#hawary-lang-badge { position: absolute; top: -6px; left: -6px; background: #0d6efd; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 10px; font-family: Tahoma, sans-serif; box-shadow: 0 3px 10px rgba(0,0,0,.25); transition: transform .2s; z-index: 5; }',
        '#hawary-lang-badge.flash { transform: scale(1.25); background: #28a745; }',
        '#hawary-speech-btn { position: absolute; top: -8px; right: -8px; width: 32px; height: 32px; border-radius: 50%; background: #28a745; color: #fff; border: 2px solid #fff; font-size: 16px; cursor: pointer; display: none; box-shadow: 0 2px 8px rgba(40,167,69,.5); z-index: 10; line-height: 1; padding: 0; animation: hawaryPulseBtn 1.5s ease-in-out infinite; }',
        '#hawary-speech-btn:hover { background: #1e7e34; animation: none; transform: scale(1.2); }'
    ].join('\n');
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'hawary-robot-box';
    container.innerHTML = [
        '<div id="hawary-bubble"></div>',
        '<button id="hawary-speech-btn" title="تفعيل الصوت">SND</button>',
        '<div class="hw-avatar-wrap">',
        '<div class="hw-halo"></div>',
        '<div id="hawary-lang-badge">' + currentLang + '</div>',
        '<img class="hw-avatar-img" src="' + HW_BASE + 'avatar.png" alt="robot">',
        '</div>'
    ].join('');
    document.body.appendChild(container);

    const bubble = document.getElementById('hawary-bubble');
    const langBadge = document.getElementById('hawary-lang-badge');
    const speechBtn = document.getElementById('hawary-speech-btn');

    function showSpeechButton() { if (speechBtn) speechBtn.style.display = 'block'; }
    function hideSpeechButton() { if (speechBtn) speechBtn.style.display = 'none'; }

    if (speechBtn) {
        speechBtn.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            speechFailCount = 0; globalAudioPrimed = false;
            primeSpeech(); unlockAudio();
            setTimeout(function () { window.HawaryEngine.health.testSpeech(); }, 300);
        });
    }

    function updateLangBadge(flash) {
        const short = currentLang.split('-')[0].toUpperCase();
        langBadge.textContent = short;
        if (flash) {
            langBadge.classList.add('flash');
            setTimeout(function () { langBadge.classList.remove('flash'); }, 900);
        }
    }
    updateLangBadge(false);

    function showMsg(t, emotion) {
        let html = stripEmojis(t);
        if (emotion && EMOTION_EMOJI[emotion]) html += '<div class="hw-emo">' + EMOTION_EMOJI[emotion] + ' ' + emotion + '</div>';
        bubble.innerHTML = html;
        bubble.style.display = 'block';
        bubble.style.direction = currentLang.indexOf('ar') === 0 ? 'rtl' : 'ltr';
        clearTimeout(showMsg.timer);
        showMsg.timer = setTimeout(function () { bubble.style.display = 'none'; }, 12000);
    }

    let isPlayingQuran = false;
    let playlist = [];
    let playlistIdx = 0;
    let playlistTitle = '';
    let awaitingNameCapture = false;
    let speakToken = 0;
    let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    let bargeInActive = false;
    let currentSpeakingText = '';
    let lastBargeInTime = 0;
    let currentSpeakingStartTime = 0;
    let lastSpeakingEndTime = 0;
    let recentlySpokenBuffer = [];

    let lastGreetingSpokenAt = 0;
    const GREETING_COOLDOWN_MS = BRAIN_CONFIG.greetingCooldownMs || 20000;

    let speakingLock = false;
    let recRestartCount = 0;
    let speakingLockReleaseTimer = null;
    let operationInProgress = false;
    let currentAudioElement = null;
    let currentQuranAudio = null;
    let quranWatchdog = null;

    function addToSpokenBuffer(text) {
        if (!text) return;
        const norm = normalizeText(text, currentLang);
        if (!norm || norm.length < 2) return;
        const words = norm.split(/\s+/).filter(function (w) { return w.length > 1; });
        if (!words.length) return;
        recentlySpokenBuffer.push({ words: words, time: Date.now() });
        const cutoff = Date.now() - BRAIN_CONFIG.echoNormalWindowMs;
        recentlySpokenBuffer = recentlySpokenBuffer.filter(function (b) { return b.time > cutoff; });
        if (recentlySpokenBuffer.length > 40) recentlySpokenBuffer = recentlySpokenBuffer.slice(-40);
    }

    function analyzeEcho(said) {
        const empty = { matchRatio: 1, novelWords: [], meaningfulNovel: [], isNovelEnough: false, totalWords: 0 };
        if (!said || said.length < 2) return empty;
        const a = normalizeText(said, currentLang);
        if (!a) return empty;
        const words = a.split(/\s+/).filter(function (w) { return w.length > 1; });
        if (!words.length) return empty;
        const recentWords = new Set();
        for (let i = 0; i < recentlySpokenBuffer.length; i++) {
            const buf = recentlySpokenBuffer[i];
            for (let j = 0; j < buf.words.length; j++) recentWords.add(buf.words[j]);
        }
        if (currentSpeakingText) {
            const b = normalizeText(currentSpeakingText, currentLang);
            b.split(/\s+/).filter(function (w) { return w.length > 1; }).forEach(function (w) { recentWords.add(w); });
        }
        const novelWords = words.filter(function (w) { return !recentWords.has(w); });
        const matchRatio = (words.length - novelWords.length) / words.length;
        const meaningfulNovel = novelWords.filter(function (w) { return w.length >= 3; });
        return {
            matchRatio: matchRatio, novelWords: novelWords, meaningfulNovel: meaningfulNovel,
            isNovelEnough: meaningfulNovel.length >= BRAIN_CONFIG.minNovelWords, totalWords: words.length
        };
    }

    function isIslamicEcho(said) {
        if (!said || said.length < 2) return false;
        const norm = normalizeText(said, currentLang);
        if (!norm) return false;
        let hasIslamic = false;
        for (let i = 0; i < ISLAMIC_ECHO_PHRASES.length; i++) {
            const np = normalizeText(ISLAMIC_ECHO_PHRASES[i], currentLang);
            if (np && norm.indexOf(np) !== -1) { hasIslamic = true; break; }
        }
        if (!hasIslamic) return false;
        if (recentlySpokenBuffer.length > 0) {
            const now = Date.now();
            const recent = recentlySpokenBuffer.filter(function (b) { return (now - b.time) < 10000; });
            if (recent.length > 0) return true;
        }
        return false;
    }

    function isLikelyEcho(said) {
        if (!said || said.length < 2) return false;
        if (isIslamicEcho(said)) return true;
        const analysis = analyzeEcho(said);
        if (analysis.isNovelEnough) return false;
        const now = Date.now();
        const msSinceSpeaking = lastSpeakingEndTime ? (now - lastSpeakingEndTime) : 999999;
        const isInStrongWindow = bargeInActive || msSinceSpeaking < BRAIN_CONFIG.echoStrongWindowMs;
        const threshold = isInStrongWindow ? 0.5 : 0.75;
        if (analysis.matchRatio >= threshold) return true;
        if (isInStrongWindow && recentlySpokenBuffer.length > 0) {
            const recentBufs = recentlySpokenBuffer.filter(function (b) { return (now - b.time) < BRAIN_CONFIG.echoStrongWindowMs; });
            const saidWords = normalizeText(said, currentLang).split(/\s+/).filter(function (w) { return w.length >= 3; });
            for (let i = 0; i < recentBufs.length; i++) {
                for (let j = 0; j < saidWords.length; j++) {
                    if (recentBufs[i].words.indexOf(saidWords[j]) !== -1) return true;
                }
            }
        }
        return false;
    }

    let currentVoice = null;
    let allVoices = [];

    function waitForVoices() {
        return new Promise(function (resolve) {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) { allVoices = voices; return resolve(voices); }
            window.speechSynthesis.addEventListener('voiceschanged', function () {
                const nv = window.speechSynthesis.getVoices();
                if (nv.length > 0) { allVoices = nv; resolve(nv); }
            }, { once: true });
            let attempts = 0;
            const interval = setInterval(function () {
                attempts++;
                const v = window.speechSynthesis.getVoices();
                if (v.length > 0) { clearInterval(interval); allVoices = v; resolve(v); }
                else if (attempts > 10) { clearInterval(interval); resolve([]); }
            }, 500);
        });
    }

    function selectVoiceForLang(lang) {
        if (!allVoices.length) return null;
        let voice = allVoices.find(function (v) { return v.lang === lang; });
        if (voice) return voice;
        const base = lang.split('-')[0];
        voice = allVoices.find(function (v) { return v.lang.indexOf(base + '-') === 0; });
        if (voice) return voice;
        voice = allVoices.find(function (v) { return v.lang.indexOf(base) === 0; });
        return voice || null;
    }

    function updateCurrentVoice() { currentVoice = selectVoiceForLang(currentLang); }

    if ('speechSynthesis' in window) {
        waitForVoices().then(function () { updateCurrentVoice(); });
    }

    let keepAliveTimer = null;
    function startKeepAlive() {
        stopKeepAlive();
        if (isIOS) return;
        keepAliveTimer = setInterval(function () {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 5000);
    }
    function stopKeepAlive() { if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; } }

    function primeSpeech() {
        if (globalAudioPrimed) return;
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(' ');
            u.volume = 0; u.rate = 1; u.pitch = 1;
            window.speechSynthesis.speak(u);
            setTimeout(function () { try { window.speechSynthesis.resume(); } catch (e) {} }, 50);
            globalAudioPrimed = true;
        } catch (e) {}
    }

    function forceUnstickSpeech() {
        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            setTimeout(function () { try { window.speechSynthesis.cancel(); } catch (e) {} }, 30);
        } catch (e) {}
    }

    async function speakText(txt, onDone) {
        txt = stripForSpeech(txt);
        if (!txt) { if (onDone) onDone(); return; }
        addToSpokenBuffer(txt);
        const cacheKey = 'hw_tts_' + currentLang + '_' +
            btoa(unescape(encodeURIComponent(txt))).replace(/[^a-zA-Z0-9]/g, '').substring(0, 60);
        if (BRAIN_CONFIG.ttsCacheEnabled) {
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) return playAudioUrl(cached, txt, onDone);
            } catch (e) {}
        }
        if (!BRAIN_CONFIG.ttsEnabled) return fallbackToSpeechSynthesis(txt, onDone);
        container.classList.add('speaking');
        bargeInActive = true;
        currentSpeakingText = txt;
        currentSpeakingStartTime = Date.now();
        const myToken = ++speakToken;
        const ttsCtrl = new AbortController();
        const ttsTid = setTimeout(function () { ttsCtrl.abort(); }, BRAIN_CONFIG.ttsTimeoutMs);
        try {
            const selectedVoice = getTTSVoice(currentLang);
            const response = await fetch(BRAIN_CONFIG.ttsServiceUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'tts-1', input: txt, voice: selectedVoice,
                    response_format: 'audio-24khz-48kbitrate-mono-mp3', speed: 1.0
                }),
                signal: ttsCtrl.signal
            });
            clearTimeout(ttsTid);
            if (!response.ok) throw new Error('TTS HTTP ' + response.status);
            const audioBlob = await response.blob();
            if (!audioBlob || audioBlob.size < 100) throw new Error('TTS empty');
            if (BRAIN_CONFIG.ttsCacheEnabled) {
                try {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        try { localStorage.setItem(cacheKey, reader.result); } catch (e) {
                            const keys = Object.keys(localStorage).filter(function (k) { return k.indexOf('hw_tts_') === 0; });
                            if (keys.length > 30) keys.slice(0, 10).forEach(function (k) { localStorage.removeItem(k); });
                        }
                    };
                    reader.readAsDataURL(audioBlob);
                } catch (e) {}
            }
            const audioUrl = URL.createObjectURL(audioBlob);
            return playAudioUrl(audioUrl, txt, onDone, myToken, true);
        } catch (error) {
            clearTimeout(ttsTid);
            console.warn('[robot] TTS fetch failed:', error && error.message);
            container.classList.remove('speaking');
            bargeInActive = false;
            currentSpeakingText = '';
            currentSpeakingStartTime = 0;
            resetSpeechState();
            return fallbackToSpeechSynthesis(txt, onDone);
        }
    }

    function playAudioUrl(url, txt, onDone, myToken, revokeWhenDone) {
        return new Promise(function (resolve) {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;
            currentAudioElement = audio;

            let finished = false;
            let watchdog = null;

            const finish = function (success, reason) {
                if (finished) return;
                finished = true;
                if (watchdog) { clearTimeout(watchdog); watchdog = null; }
                if (currentAudioElement === audio) currentAudioElement = null;
                try { audio.onended = null; audio.onerror = null; } catch (e) {}
                if (revokeWhenDone) { try { URL.revokeObjectURL(url); } catch (e) {} }
                if (myToken !== undefined && myToken !== speakToken) { resolve(); return; }
                container.classList.remove('speaking');
                bargeInActive = false;
                currentSpeakingText = '';
                currentSpeakingStartTime = 0;
                lastSpeakingEndTime = Date.now();
                resetSpeechState();
                if (success) { speechSuccessCount++; speechFailCount = 0; }
                else { speechFailCount++; }
                if (onDone) onDone();
                startListening();
                resolve();
            };

            audio.onended = function () { finish(true); };
            audio.onerror = function (e) {
                console.warn('[robot] audio error, fallback to speechSynthesis:', e);
                try { fallbackToSpeechSynthesis(txt, function () { finish(false, 'audio-error'); }); }
                catch (err) { finish(false, 'audio-error'); }
            };

            watchdog = setTimeout(function () {
                if (!finished && (!audio.duration || audio.duration === 0) && audio.paused) {
                    console.warn('[robot] audio playback stuck, fallback');
                    try { audio.pause(); } catch (e) {}
                    try { fallbackToSpeechSynthesis(txt, function () { finish(false, 'watchdog'); }); }
                    catch (err) { finish(false, 'watchdog'); }
                }
            }, 8000);

            const p = audio.play();
            if (p && p.catch) {
                p.catch(function (err) {
                    if (err && err.name === 'AbortError') return;
                    console.warn('[robot] audio.play() rejected:', err && err.name, err && err.message);
                    showSpeechButton();
                    try { fallbackToSpeechSynthesis(txt, function () { finish(false, 'play-rejected'); }); }
                    catch (e) { finish(false, 'play-rejected'); }
                });
            }
        });
    }

    function fallbackToSpeechSynthesis(txt, onDone) {
        if (!('speechSynthesis' in window)) { if (onDone) onDone(); return; }
        addToSpokenBuffer(txt);
        container.classList.add('speaking');
        bargeInActive = true;
        currentSpeakingText = txt;
        currentSpeakingStartTime = Date.now();
        const utterance = new SpeechSynthesisUtterance(txt);
        utterance.lang = currentLang;
        utterance.rate = 1.0; utterance.pitch = 1.0; utterance.volume = 1.0;
        if (currentVoice) utterance.voice = currentVoice;
        let done = false;
        const finish = function () {
            if (done) return;
            done = true;
            container.classList.remove('speaking');
            bargeInActive = false;
            currentSpeakingText = '';
            currentSpeakingStartTime = 0;
            lastSpeakingEndTime = Date.now();
            resetSpeechState();
            if (onDone) onDone();
            startListening();
        };
        utterance.onend = finish;
        utterance.onerror = finish;
        try { window.speechSynthesis.resume(); window.speechSynthesis.speak(utterance); }
        catch (e) { finish(); }
    }

    function forceReleaseSpeech() {
        speakToken++;
        speakingLock = false;
        if (speakingLockReleaseTimer) { clearTimeout(speakingLockReleaseTimer); speakingLockReleaseTimer = null; }
        forceUnstickSpeech();
        stopKeepAlive();
        stopQuranAudio();
        if (currentAudioElement) { try { currentAudioElement.pause(); } catch (e) {} currentAudioElement = null; }
        if (currentQuranAudio) { try { currentQuranAudio.pause(); } catch (e) {} currentQuranAudio = null; }
        container.classList.remove('speaking');
        bargeInActive = false;
        currentSpeakingText = '';
        currentSpeakingStartTime = 0;
        resetSpeechState();
        clearAllOperationTimeouts();
        setTimeout(function () { if (!listening) { try { rec && rec.start(); } catch (e) {} } }, 200);
    }

    function abortSpeaking(reason) {
        const wasSpeaking = window.speechSynthesis.speaking
            || container.classList.contains('speaking')
            || isPlayingQuran || currentAudioElement || currentQuranAudio || speakingLock;
        if (!wasSpeaking) return;
        speakToken++;
        speakingLock = false;
        if (speakingLockReleaseTimer) { clearTimeout(speakingLockReleaseTimer); speakingLockReleaseTimer = null; }
        forceUnstickSpeech();
        stopKeepAlive();
        stopQuranAudio();
        if (currentAudioElement) { try { currentAudioElement.pause(); } catch (e) {} currentAudioElement = null; }
        if (currentQuranAudio) { try { currentQuranAudio.pause(); } catch (e) {} currentQuranAudio = null; }
        container.classList.remove('speaking');
        bargeInActive = false;
        currentSpeakingText = '';
        currentSpeakingStartTime = 0;
        lastBargeInTime = Date.now();
        lastSpeakingEndTime = Date.now();
        resetSpeechState();
        try { rec && rec.start(); } catch (e) {}
    }

    function finishPlayback() {
        sharedAudio.onended = null;
        sharedAudio.onerror = null;
        try { sharedAudio.pause(); } catch (e) {}
        isPlayingQuran = false;
        container.classList.remove('speaking');
        lastSpeakingEndTime = Date.now();
        startListening();
    }

    function playCurrentTrack() {
        const url = playlist[playlistIdx];
        if (!url) { finishPlayback(); return; }

        if (currentQuranAudio) { try { currentQuranAudio.pause(); } catch (e) {} currentQuranAudio = null; }
        if (quranWatchdog) { clearTimeout(quranWatchdog); quranWatchdog = null; }

        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        currentQuranAudio = audio;

        let finished = false;
        let tried2Digit = false;

        const cleanup = function () {
            if (finished) return;
            finished = true;
            if (quranWatchdog) { clearTimeout(quranWatchdog); quranWatchdog = null; }
            try { audio.onended = null; audio.onerror = null; } catch (e) {}
            if (currentQuranAudio === audio) currentQuranAudio = null;
        };

        audio.onended = function () {
            cleanup();
            playlistIdx++;
            if (playlistIdx < playlist.length) playCurrentTrack();
            else finishPlayback();
        };

        audio.onerror = function (e) {
            console.warn('[robot] quran audio error:', audio.src);
            if (!tried2Digit) {
                const m = String(audio.src).match(/\/(\d{3})\.mp3$/);
                if (m && m[1].startsWith('0')) {
                    const twoDigit = String(parseInt(m[1], 10)) + '.mp3';
                    const altUrl = audio.src.replace(/\/\d{3}\.mp3$/, '/' + twoDigit);
                    console.log('[robot] retry with 2-digit:', altUrl);
                    tried2Digit = true;
                    audio.src = altUrl;
                    audio.load();
                    const p2 = audio.play();
                    if (p2 && p2.catch) p2.catch(function () {
                        cleanup();
                        showMsg('⚠️ القارئ ده مش عنده السورة دي.');
                        finishPlayback();
                    });
                    return;
                }
            }
            cleanup();
            showMsg('⚠️ القارئ ده مش عنده السورة دي على السيرفر.');
            finishPlayback();
        };

        quranWatchdog = setTimeout(function () {
            if (!finished && audio.paused && (!audio.duration || audio.duration === 0)) {
                console.warn('[robot] quran audio watchdog tripped');
                cleanup();
                showMsg('الشبكة بطيئة، جرب تاني.');
                finishPlayback();
            }
        }, 10000);

        audio.load();
        const p = audio.play();
        if (p && p.catch) {
            p.catch(function (err) {
                if (err && err.name === 'AbortError') return;
                console.warn('[robot] quran play() rejected:', err && err.name);
                unlockAudio();
                setTimeout(function () {
                    if (finished) return;
                    const p2 = audio.play();
                    if (p2 && p2.catch) p2.catch(function () {
                        cleanup();
                        showMsg('اضغط على الشاشة مرة لتشغيل الصوت.');
                        finishPlayback();
                    });
                }, 300);
            });
        }
    }

    function playQuranAudio(urlOrList, title) {
        forceUnstickSpeech();
        speakToken++;
        playlist = (Array.isArray(urlOrList) ? urlOrList : [urlOrList]).filter(Boolean);
        playlistIdx = 0;
        playlistTitle = title || '';
        if (!playlist.length) return;
        addToSpokenBuffer(playlistTitle || 'audio playback');
        isPlayingQuran = true;
        bargeInActive = true;
        container.classList.add('speaking');
        playCurrentTrack();
        showMsg('جاري تشغيل ' + (playlistTitle || 'الملف الصوتي') + '...');
    }

    function stopQuranAudio() {
        if (currentQuranAudio) { try { currentQuranAudio.pause(); } catch (e) {} currentQuranAudio = null; }
        if (quranWatchdog) { clearTimeout(quranWatchdog); quranWatchdog = null; }
        sharedAudio.onended = null;
        sharedAudio.onerror = null;
        try { sharedAudio.pause(); } catch (e) {}
        playlist = [];
        isPlayingQuran = false;
        container.classList.remove('speaking');
    }

    function playLibraryItem(item, said) {
        const urls = (item.urls || [item.url]).filter(Boolean).map(function (u) { return new URL(u, HW_BASE).href; });
        const fixedTitle = _fixItemTitle(item);
        const msg = 'تمام يا فندم، هشغل ' + fixedTitle + '.';

        hwLogQuestion(said, msg, 'audio-library-local');
        hwSaveConversationTurn('bot', msg);

        if (isChatAvailable()) {
            showMsg(msg);
            window.dispatchEvent(new CustomEvent('hawary:bot-replied', {
                detail: { question: said, reply: msg, source: 'audio-library', hasAudio: true, audioUrl: urls[0] }
            }));
        } else {
            speakText(msg, function () { playQuranAudio(urls, fixedTitle); });
        }
    }

    function handleAudioMarker(reply) {
        const m = String(reply || '').match(/\[\[AUDIO:(https?:\/\/[^\]]+)\]\]/);
        if (!m) return { clean: reply, hasAudio: false, url: null };
        return {
            clean: String(reply).replace(/\[\[AUDIO:[^\]]+\]\]/g, '').replace(/\n{3,}/g, '\n\n').trim(),
            hasAudio: true, url: m[1]
        };
    }

    const sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
    let audioUnlocked = false;
    const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

    function unlockAudio() {
        primeSpeech();
        if (audioUnlocked) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                try {
                    const ctx = new AudioCtx();
                    if (ctx.state === 'suspended') ctx.resume();
                    const buf = ctx.createBuffer(1, 1, 22050);
                    const src = ctx.createBufferSource();
                    src.buffer = buf;
                    src.connect(ctx.destination);
                    src.start(0);
                    setTimeout(function () { try { ctx.close(); } catch (e) {} }, 100);
                } catch (e) {}
            }
            sharedAudio.src = SILENT_WAV;
            const p = sharedAudio.play();
            if (p && p.then) {
                p.then(function () {
                    audioUnlocked = true;
                    if (sharedAudio.src === SILENT_WAV) {
                        try { sharedAudio.pause(); } catch (e) {}
                        try { sharedAudio.currentTime = 0; } catch (e) {}
                    }
                    ['touchend', 'click', 'keydown'].forEach(function (ev) { document.removeEventListener(ev, unlockAudio); });
                }).catch(function () {});
            }
        } catch (e) {}
    }
    ['touchend', 'click', 'keydown'].forEach(function (ev) {
        document.addEventListener(ev, unlockAudio, { passive: true });
    });

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec = null;
    let listening = false;
    let lastResultTime = 0;

    function createRecognition() {
        if (!SpeechRecognitionAPI) return null;
        const r = new SpeechRecognitionAPI();
        r.lang = currentLang;
        r.continuous = true;
        r.interimResults = true;
        r.maxAlternatives = 3;

        r.onstart = function () {
            listening = true; recRestartCount = 0;
            recState.lastStartSuccess = Date.now(); recState.failedStarts = 0;
            if (!container.classList.contains('speaking')) container.classList.add('listening');
        };
        r.onerror = function (e) {
            listening = false;
            if (!container.classList.contains('speaking')) container.classList.remove('listening');
            if (e.error !== 'no-speech' && e.error !== 'aborted') console.warn('[robot] recognition error:', e.error);
        };
        r.onend = function () {
            listening = false;
            if (!container.classList.contains('speaking')) container.classList.remove('listening');
            setTimeout(function () {
                if (!listening && !operationInProgress) { try { r.start(); } catch (e) {} }
            }, 100);
        };
        r.onresult = function (event) { handleRecognitionResult(event); };
        return r;
    }

    function handleRecognitionResult(event) {
        const results = event.results;
        const last = results[results.length - 1];

        if (isPlayingQuran) {
            if (last.isFinal) {
                const said = (last[0] ? last[0].transcript : '').trim();
                const norm = normalizeText(said, currentLang);
                const stopWords = ['وقف', 'اسكت', 'بس', 'كفايه', 'كفاية', 'ايقاف', 'stop', 'enough', 'quiet', 'pause'];
                let wantsStop = false;
                for (let i = 0; i < stopWords.length; i++) {
                    if (norm.indexOf(normalizeText(stopWords[i], currentLang)) !== -1) { wantsStop = true; break; }
                }
                if (wantsStop) {
                    stopQuranAudio();
                    bargeInActive = false;
                    container.classList.remove('speaking');
                    lastSpeakingEndTime = Date.now();
                    try { rec && rec.start(); } catch (e) {}
                }
            }
            return;
        }

        if (BRAIN_CONFIG.bargeInEnabled && bargeInActive && !last.isFinal) {
            const interimText = (last[0] ? last[0].transcript : '').trim();
            const timeSinceSpeechStart = Date.now() - currentSpeakingStartTime;
            if (timeSinceSpeechStart < 1500) return;
            const enoughText = interimText.length >= BRAIN_CONFIG.bargeInMinChars;
            const realWords = interimText.split(/\s+/).filter(function (w) { return w.length > 1; });
            const enoughWords = realWords.length >= BRAIN_CONFIG.bargeInMinWords;
            const settlePassed = timeSinceSpeechStart > BRAIN_CONFIG.bargeInSettleMs;
            const cooldownPassed = (Date.now() - lastBargeInTime) > BRAIN_CONFIG.bargeInCooldownMs;
            if (enoughText && enoughWords && settlePassed && cooldownPassed) {
                if (!isLikelyEcho(interimText)) {
                    const echoCheck = analyzeEcho(interimText);
                    if (echoCheck.matchRatio > BRAIN_CONFIG.strongEchoThreshold) return;
                    abortSpeaking('interim');
                }
            }
            return;
        }

        if (!last.isFinal) return;

        let bestTranscript = '';
        let bestConfidence = 0;
        for (let i = 0; i < last.length; i++) {
            const alt = last[i];
            if (alt.confidence > bestConfidence) { bestConfidence = alt.confidence; bestTranscript = alt.transcript; }
        }
        if (!bestTranscript) bestTranscript = last[0].transcript;

        const said = (bestTranscript || '').trim();
        if (!said) return;

        const now = Date.now();
        window._hwRecentSaid = window._hwRecentSaid || {};
        if (window._hwRecentSaid[said] && (now - window._hwRecentSaid[said]) < BRAIN_CONFIG.duplicateHeardWindowMs) {
            console.log('[robot] dup ignored:', said);
            return;
        }
        window._hwRecentSaid[said] = now;
        const saidKeys = Object.keys(window._hwRecentSaid);
        if (saidKeys.length > 20) {
            const cutoff = now - 30000;
            saidKeys.forEach(function (k) {
                if (window._hwRecentSaid[k] < cutoff) delete window._hwRecentSaid[k];
            });
        }

        if (now - lastResultTime < 1200 && said === window._hwLastSaid) return;
        lastResultTime = now;
        window._hwLastSaid = said;

        console.log('[robot] heard:', said);

        if (bargeInActive) {
            const timeSinceSpeechStart = Date.now() - currentSpeakingStartTime;
            if (timeSinceSpeechStart < 1200) return;
        }

        if (isLikelyEcho(said)) { console.log('[robot] echo ignored:', said); return; }
        const echoCheck = analyzeEcho(said);
        if (echoCheck.matchRatio > 0.7) { console.log('[robot] echo(ratio) ignored:', said); return; }

        if (bargeInActive || window.speechSynthesis.speaking || isPlayingQuran || currentAudioElement || currentQuranAudio) {
            abortSpeaking('final');
        }

        const switchTo = detectLangSwitchCommand(said);
        if (switchTo && switchTo !== currentLang) {
            applyLanguageSwitch(switchTo, { announce: true });
            return;
        }

        if (BRAIN_CONFIG.autoLangSwitch) detectLanguageWithConfirmation(said);

        clearTimeout(window._hwResultTimeout);
        window._hwResultTimeout = setTimeout(function () { handleUserSpeech(said); }, BRAIN_CONFIG.resultDelay);
    }

    function applyLanguageSwitch(newLang, opts) {
        opts = opts || {};
        if (!newLang || newLang === currentLang) return false;
        currentLang = newLang;
        localStorage.setItem('hw_lang', newLang);
        updateCurrentVoice();
        if (rec) rec.lang = newLang;
        updateLangBadge(true);
        if (opts.announce) {
            const base = newLang.split('-')[0];
            const msg = HAWARY_CONFIG.langChanged[base] || HAWARY_CONFIG.langChanged['en'];
            showMsg(msg);
            setTimeout(function () { speakText(msg); }, 50);
        }
        return true;
    }

    let langDetectBuffer = [];

    function detectLanguageWithConfirmation(text) {
        const detected = detectLanguageFromText(text);
        if (!detected) { langDetectBuffer = []; return; }
        if (detected === currentLang) { langDetectBuffer = []; return; }
        const now = Date.now();
        langDetectBuffer.push({ lang: detected, time: now });
        langDetectBuffer = langDetectBuffer.filter(function (b) { return (now - b.time) < 20000; }).slice(-3);
        const required = BRAIN_CONFIG.langSwitchRequiredHits || 2;
        const sameLangCount = langDetectBuffer.filter(function (b) { return b.lang === detected; }).length;
        if (sameLangCount >= required) {
            applyLanguageSwitch(detected, { announce: false });
            langDetectBuffer = [];
        }
    }

    rec = createRecognition();

    function recreateRecognition() {
        if (recRestartCount >= BRAIN_CONFIG.maxRecRestarts) recRestartCount = 0;
        recRestartCount++;
        try { rec && rec.abort(); } catch (e) {}
        rec = createRecognition();
        recState.lastStartAttempt = Date.now();
        setTimeout(function () { try { rec && rec.start(); } catch (e) {} }, 200);
    }

    function startListening() {
        if (!rec) { recreateRecognition(); return; }
        if (listening) return;
        recState.lastStartAttempt = Date.now();
        try {
            rec.start();
        } catch (e) {
            const msg = (e && e.message) || '';
            if (msg.toLowerCase().indexOf('already') !== -1 || msg.toLowerCase().indexOf('start') !== -1) {
                try { rec.stop(); } catch (e2) {}
                setTimeout(function () {
                    if (!listening) {
                        try { rec.start(); } catch (e3) {
                            recState.failedStarts++;
                            if (recState.failedStarts >= 2) recreateRecognition();
                        }
                    }
                }, 150);
            } else {
                recState.failedStarts++;
                if (recState.failedStarts >= 2) recreateRecognition();
            }
        }
    }
    function stopListening() { if (!rec) return; try { rec.stop(); } catch (e) {} }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopListening(); else startListening();
    });

    let listenWatchdog = null;
    function startListenWatchdog() {
        if (!BRAIN_CONFIG.listenWatchdogEnabled) return;
        if (listenWatchdog) return;
        listenWatchdog = setInterval(function () {
            try {
                if (speechState.active) {
                    const elapsed = Date.now() - speechState.startedAt;
                    if (elapsed > BRAIN_CONFIG.speakMaxDurationMs) forceReleaseSpeech();
                }
                if (speakingLock && !window.speechSynthesis.speaking && !window.speechSynthesis.pending && !currentAudioElement && !currentQuranAudio) {
                    const sinceStart = Date.now() - (speechState.startedAt || Date.now());
                    if (sinceStart > 6000) forceReleaseSpeech();
                }
                if (operationInProgress) {
                    const elapsed = Date.now() - (window._opStartTime || 0);
                    if (elapsed > 15000) {
                        operationInProgress = false;
                        container.classList.remove('thinking');
                        startListening();
                    }
                }
                if (!isPlayingQuran && !speakingLock && !listening && !operationInProgress && !currentAudioElement && !currentQuranAudio) {
                    try { rec && rec.start(); } catch (e) {
                        try { rec && rec.stop(); } catch (e2) {}
                        setTimeout(function () {
                            if (!listening) { try { rec && rec.start(); } catch (e3) { recreateRecognition(); } }
                        }, 150);
                    }
                }
            } catch (e) {}
        }, BRAIN_CONFIG.listenWatchdogMs);
    }

    function findDestination(text) {
        const norm = normalizeText(text, currentLang);
        let best = null, bestLen = 0;
        SITE_MAP.forEach(function (entry) {
            entry.keywords.forEach(function (k) {
                const nk = normalizeText(k, currentLang);
                if (nk && norm.indexOf(nk) !== -1 && nk.length > bestLen) { best = entry; bestLen = nk.length; }
            });
        });
        return best;
    }

    function isLocationQuestion(text) {
        const norm = normalizeText(text, currentLang);
        return LOCATION_TRIGGERS.some(function (tr) { return norm.indexOf(normalizeText(tr, currentLang)) !== -1; });
    }

    function extractNameFromSpeech(said) {
        return said.replace(/^(اسمي|انا اسمي|أنا اسمي|انا|أنا|my name is|i am)\s+/i, '').trim();
    }

    function detectClarificationReply(said) {
        if (!pendingClarification.active) return null;
        if (isClarificationExpired()) { pendingClarification.active = false; return null; }
        const raw = String(said).trim();
        const norm = normalizeText(raw, currentLang);
        const nums = { 'واحد': 1, 'اتنين': 2, 'اثنين': 2, 'تلاته': 3, 'ثلاثة': 3, 'اربعه': 4, 'أربعة': 4, 'خمسه': 5, 'خمسة': 5 };
        const numKeys = Object.keys(nums);
        for (let i = 0; i < numKeys.length; i++) {
            if (norm.indexOf(numKeys[i]) !== -1) return { type: 'option', index: nums[numKeys[i]] - 1 };
        }
        const m = raw.match(/^\s*([1-9])\s*$/);
        if (m) return { type: 'option', index: parseInt(m[1], 10) - 1 };
        if (norm.length >= 3) return { type: 'clarify', text: raw };
        return null;
    }

    async function handleUserSpeech(said) {
        window.dispatchEvent(new CustomEvent('hawary:user-spoke', { detail: { text: said } }));
        hwSaveConversationTurn('user', said);
        operationInProgress = true;
        window._opStartTime = Date.now();

        clearAllOperationTimeouts();
        operationTimeouts.operation = setTimeout(function () {
            operationInProgress = false;
            container.classList.remove('thinking');
            startListening();
        }, 20000);

        try {
            if (awaitingNameCapture) {
                awaitingNameCapture = false;
                const name = extractNameFromSpeech(said);
                if (name) {
                    hwSetVisitorName(name);
                    hwTouchVisitor(name);
                    const langBase = currentLang.split('-')[0];
                    const msg = langBase === 'ar' ? 'تشرفت يا ' + name + '، اتفضل اسألني.' : 'Nice to meet you, ' + name + '!';
                    showMsg(msg);
                    operationInProgress = false;
                    clearAllOperationTimeouts();
                    speakText(msg);
                    hwSaveConversationTurn('bot', msg);
                } else {
                    operationInProgress = false;
                    clearAllOperationTimeouts();
                }
                return;
            }

            if (pendingUserQuestion.active && isUserQuestionExpired()) clearPendingUserQuestion();

            if (pendingUserQuestion.active) {
                const prevNorm = normalizeText(pendingUserQuestion.originalQuestion, currentLang);
                const newNorm = normalizeText(said, currentLang);
                const prevWords = new Set(prevNorm.split(/\s+/).filter(function (w) { return w.length > 2; }));
                const newWords = newNorm.split(/\s+/).filter(function (w) { return w.length > 2; });
                const overlap = newWords.filter(function (w) { return prevWords.has(w); }).length;
                const overlapRatio = newWords.length > 0 ? overlap / newWords.length : 0;
                if (overlapRatio < 0.2 && pendingUserQuestion.tries >= 1) clearPendingUserQuestion();
                else if (overlapRatio < 0.15) clearPendingUserQuestion();
                else {
                    const merged = pendingUserQuestion.originalQuestion + ' ' + said;
                    pendingUserQuestion.tries++;
                    pendingUserQuestion.originalQuestion = merged;
                    pendingUserQuestion.timestamp = Date.now();
                    await sendToProxy(merged, true);
                    return;
                }
            }

            const clarify = detectClarificationReply(said);
            if (clarify && clarify.type === 'option') {
                const idx = clarify.index;
                if (idx >= 0 && idx < pendingClarification.options.length) {
                    const merged = pendingClarification.topic + ' ' + pendingClarification.options[idx];
                    pendingClarification.active = false;
                    await sendToProxy(merged);
                    return;
                }
            }
            if (clarify && clarify.type === 'clarify') {
                const merged = pendingClarification.topic + ' ' + clarify.text;
                pendingClarification.active = false;
                await sendToProxy(merged);
                return;
            }

            if (!libraryLoaded && !AUDIO_LIBRARY.length) {
                await loadAudioLibraryFromServer();
            }

            const audioItem = findAudioItem(said);
            if (audioItem) {
                operationInProgress = false;
                clearAllOperationTimeouts();
                playLibraryItem(audioItem, said);
                return;
            }

            const dest = findDestination(said);
            if (dest && isLocationQuestion(said)) {
                operationInProgress = false;
                clearAllOperationTimeouts();
                goToDestination(dest);
                return;
            }

            const cleanedQuestion = normalizeText(said, currentLang);
            const fixed = fixSpeechErrors(said, currentLang);

            if (cleanedQuestion.length < BRAIN_CONFIG.minCharsForSearch) {
                const msg = t('didNotCatch');
                showMsg(msg);
                operationInProgress = false;
                clearAllOperationTimeouts();
                speakText(msg);
                return;
            }

            await sendToProxy(fixed);

        } catch (e) {
            operationInProgress = false;
            clearAllOperationTimeouts();
            container.classList.remove('thinking');
            startListening();
        }
    }

    async function sendToProxy(q, fromPending) {
        fromPending = !!fromPending;
        container.classList.add('thinking');

        const searchTimeoutPromise = new Promise(function (_, reject) {
            setTimeout(function () { reject(new Error('search-hard-timeout')); }, BRAIN_CONFIG.brainQueryTimeoutMs);
        });
        searchTimeoutPromise.catch(function () {});

        try {
            const knowledgeResult = await hwCheckKnowledge(q);
            if (knowledgeResult && knowledgeResult.answer) {
                container.classList.remove('thinking');
                clearPendingUserQuestion();
                operationInProgress = false;
                clearAllOperationTimeouts();
                const cleanReply = stripEmojis(knowledgeResult.answer);
                if (knowledgeResult.key) {
                    try {
                        update(ref(fbdb, 'knowledge/' + knowledgeResult.key), {
                            hits: (knowledgeResult.item.hits || 1) + 1, lastUsed: Date.now()
                        });
                    } catch (e) {}
                }
                showMsg(cleanReply);
                speakText(cleanReply);
                hwSaveConversationTurn('bot', cleanReply);
                hwLogQuestion(q, cleanReply, knowledgeResult.source);
                return;
            }

            const brainResult = await Promise.race([hwQueryBrain(q), searchTimeoutPromise]);

            if (brainResult && brainResult.answer) {
                container.classList.remove('thinking');
                const isGreeting = (brainResult.source === 'brain_greeting' || brainResult.intent === 'greeting' || brainResult.intent === 'greet');
                if (isGreeting) {
                    const sinceLastGreet = Date.now() - lastGreetingSpokenAt;
                    if (sinceLastGreet < GREETING_COOLDOWN_MS) {
                        console.log('[robot] greeting suppressed (cooldown)');
                        clearPendingUserQuestion();
                        operationInProgress = false;
                        clearAllOperationTimeouts();
                        startListening();
                        return;
                    }
                    lastGreetingSpokenAt = Date.now();
                }

                const parsed = handleAudioMarker(brainResult.answer);
                const cleanReply = stripEmojis(parsed.clean);
                clearPendingUserQuestion();
                operationInProgress = false;
                clearAllOperationTimeouts();

                if (brainResult.state === 'clarifying' && brainResult.options && brainResult.options.length) {
                    pendingClarification = { active: true, topic: brainResult.pending_topic || q, options: brainResult.options, timestamp: Date.now() };
                } else {
                    pendingClarification.active = false;
                }

                showMsg(cleanReply, brainResult.emotion);

                if (parsed.hasAudio) {
                    if (isChatAvailable()) showMsg('جاري تشغيل التلاوة في الشات...');
                    else playQuranAudio(parsed.url);
                } else {
                    speakText(cleanReply);
                }

                hwSaveConversationTurn('bot', cleanReply);
                hwLogQuestion(q, cleanReply, brainResult.source);

                if (brainResult.state !== 'clarifying' &&
                    (brainResult.confidence >= BRAIN_CONFIG.knowledgeSaveMinConfidence ||
                     brainResult.source === 'keywords-bank' || brainResult.source === 'firebase-brain')) {
                    hwSaveKnowledge(q, cleanReply, {
                        source: brainResult.source, confidence: brainResult.confidence,
                        emotion: brainResult.emotion, intent: brainResult.intent
                    });
                }
                return;
            }
        } catch (brainErr) { container.classList.remove('thinking'); }

        try {
            const page = (location.pathname.split('/').pop() || 'index.php');
            const geminiCtrl = new AbortController();
            const geminiTid = setTimeout(function () { geminiCtrl.abort(); }, 8000);

            /* ✅ fetch لـ URL كامل — بدون credentials */
            const res = await fetch(BRAIN_CONFIG.geminiApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: q, context: page, visitorName: hwGetVisitorName(),
                    lang: currentLang, detectedLang: currentLang
                }),
                signal: geminiCtrl.signal
            });
            clearTimeout(geminiTid);

            const json = await res.json();
            container.classList.remove('thinking');
            operationInProgress = false;
            clearAllOperationTimeouts();

            const rawReply = json.answer || json.error || '';
            const parsed = handleAudioMarker(rawReply);
            const reply = stripEmojis(parsed.clean);

            if (reply && reply.length >= 5 && !json.needs_support && !json.error) {
                clearPendingUserQuestion();
                showMsg(reply);
                if (parsed.hasAudio) {
                    if (isChatAvailable()) showMsg('جاري تشغيل التلاوة في الشات...');
                    else playQuranAudio(parsed.url);
                } else {
                    speakText(reply);
                }
                hwSaveConversationTurn('bot', reply);
                hwSaveKnowledge(q, reply, { source: json.source || 'ai', confidence: 0.7 });
                hwLogQuestion(q, reply, 'ai');
                return;
            }

            askUserForMoreInfo(q, fromPending);
        } catch (err) {
            container.classList.remove('thinking');
            operationInProgress = false;
            clearAllOperationTimeouts();
            askUserForMoreInfo(q, fromPending);
        }
    }

    function askUserForMoreInfo(originalQ, fromPending) {
        const maxTries = BRAIN_CONFIG.askUserMaxTries;
        if (fromPending && pendingUserQuestion.tries >= maxTries) {
            const msg = humanResp('unknown') || HAWARY_CONFIG.stillNoAnswer[currentLang.split('-')[0]] || HAWARY_CONFIG.stillNoAnswer['ar'];
            showMsg(msg);
            speakText(msg);
            hwSaveConversationTurn('bot', msg);
            hwLogUnanswered(originalQ);
            clearPendingUserQuestion();
            return;
        }
        pendingUserQuestion.active = true;
        if (!fromPending) {
            pendingUserQuestion.originalQuestion = originalQ;
            pendingUserQuestion.tries = 0;
        }
        pendingUserQuestion.timestamp = Date.now();
        const askMsg = tAsk();
        showMsg(askMsg);
        speakText(askMsg);
        hwSaveConversationTurn('bot', askMsg);
    }

    function goToDestination(entry) {
        const currentFile = (location.pathname.split('/').pop() || 'index.php');
        const sameFile = !entry.url || entry.url === currentFile;
        const langBase = currentLang.split('-')[0];
        if (sameFile && entry.selector) {
            const msg = langBase === 'ar' ? 'تعالى معايا يا فندم.' : 'Come with me.';
            speakText(msg, function () { pointToElement(entry.selector); });
        } else if (sameFile) {
            const msg = langBase === 'ar' ? 'أنت أصلاً هنا.' : 'You are already here.';
            speakText(msg);
        } else {
            const goUrl = entry.url + (entry.selector ? ('?robot_goto=' + encodeURIComponent(entry.selector)) : '');
            const msg = langBase === 'ar' ? 'تمام، هوديك دلوقتي.' : 'OK, I will take you.';
            speakText(msg, function () { setTimeout(function () { window.location.href = goUrl; }, 200); });
        }
    }

    function pointToElement(selector) {
        const el = document.querySelector(selector);
        if (!el) { speakText('معلش، مش لاقي المكان ده.'); return; }
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('hawary-point-target');
        setTimeout(function () {
            el.classList.remove('hawary-point-target');
            startListening();
        }, 4500);
    }

    const params = new URLSearchParams(location.search);
    const gotoSelector = params.get('robot_goto');
    if (gotoSelector) {
        history.replaceState(null, '', location.pathname + location.hash);
        setTimeout(function () { pointToElement(decodeURIComponent(gotoSelector)); }, 900);
    }

    window.addEventListener('hawary:speak', function (e) {
        const text = e.detail && e.detail.text;
        if (text) speakText(text);
    });
    window.addEventListener('hawary:start-voice', function () { startListening(); });
    window.addEventListener('hawary:audio-play', function () {
        isPlayingQuran = true; bargeInActive = true; container.classList.add('speaking');
    });
    window.addEventListener('hawary:audio-ended', function () {
        isPlayingQuran = false; bargeInActive = false;
        container.classList.remove('speaking');
        lastSpeakingEndTime = Date.now();
        startListening();
    });

    window.HawaryAudio = {
        play: playQuranAudio, stop: stopQuranAudio, parseMarker: handleAudioMarker,
        library: AUDIO_LIBRARY, find: findAudioItem,
        list: function () { return AUDIO_LIBRARY.slice(); },
        reload: reloadAudioLibrary
    };

    function startGreeting(hasPermission) {
        recentlySpokenBuffer = [];
        langDetectBuffer = [];
        clearPendingUserQuestion();
        lastGreetingSpokenAt = Date.now();
        hwTouchVisitor();
        const savedName = hwGetVisitorName();
        const langBase = currentLang.split('-')[0];
        let greeting;
        if (savedName) {
            greeting = langBase === 'ar' ? 'أهلاً بيك تاني يا ' + savedName + '.' : 'Welcome back, ' + savedName + '!';
        } else {
            const base = HAWARY_CONFIG.greeting[langBase] || HAWARY_CONFIG.greeting['ar'];
            const nameQ = HAWARY_CONFIG.nameQuestion[langBase] || HAWARY_CONFIG.nameQuestion['ar'];
            greeting = base + ' ' + nameQ;
            awaitingNameCapture = true;
        }
        showMsg(greeting);
        hwSaveConversationTurn('bot', greeting);
        startListening();
        startListenWatchdog();
        if (hasPermission) setTimeout(function () { speakText(greeting); }, 200);
    }

    let hasBooted = false;
    async function bootNow() {
        if (hasBooted) return;
        hasBooted = true;
        primeSpeech();
        unlockAudio();

        await loadAudioLibraryFromServer();
        if (!AUDIO_LIBRARY.length) buildFallbackLibrary();
        console.log('[robot] ✅ boot: library=' + AUDIO_LIBRARY.length + ' items, loaded=' + libraryLoaded);

        setTimeout(function () {
            waitForVoices().then(function () {
                updateCurrentVoice();
                startGreeting(true);
            });
        }, 300);
    }

    function boot() {
        if (hwPermissionsGranted()) {
            setTimeout(bootNow, 400);
            const firstTouch = function () {
                ['click', 'touchstart', 'keydown'].forEach(function (ev) { document.removeEventListener(ev, firstTouch); });
                primeSpeech();
                unlockAudio();
                if (!hasBooted) bootNow();
                else startListening();
            };
            ['click', 'touchstart', 'keydown'].forEach(function (ev) {
                document.addEventListener(ev, firstTouch, { passive: true });
            });
            return;
        }
        const show = function () {
            if (document.getElementById('hw-perm-gate')) return;
            showPermissionGate(function (granted) {
                primeSpeech();
                unlockAudio();
                hasBooted = true;
                startGreeting(granted);
                loadAudioLibraryFromServer();
            }, function () { unlockAudio(); });
            ['click', 'touchstart', 'keydown'].forEach(function (ev) { document.removeEventListener(ev, show); });
        };
        setTimeout(show, 600);
        ['click', 'touchstart', 'keydown'].forEach(function (ev) {
            document.addEventListener(ev, show, { passive: true });
        });
    }

    boot();

    window.HawaryEngine = {
        version: '22.13.2',
        backend: HW_BACKEND,
        brain: {
            enabled: true, query: hwQueryBrain, queryWeb: hwQueryWebIndex,
            queryEndpoint: hwQueryEndpoint,
            setEnabled: function (v) { BRAIN_CONFIG.enabled = v; },
            isEnabled: function () { return BRAIN_CONFIG.enabled; },
            config: BRAIN_CONFIG, checkKnowledge: hwCheckKnowledge, saveKnowledge: hwSaveKnowledge
        },
        audio: window.HawaryAudio,
        ask: sendToProxy,
        stripEmojis: stripEmojis, stripForSpeech: stripForSpeech, normalizeText: normalizeText,
        getLang: function () { return currentLang; },
        setLang: function (lang) { return applyLanguageSwitch(lang, { announce: false }); },
        detectLanguage: function (text) { return detectLanguageFromText(text); },
        sourceLabel: labelForSource, languages: SUPPORTED_LANGS,
        listen: {
            start: function () { startListening(); },
            stop: function () { stopListening(); },
            isActive: function () { return listening; }
        },
        health: {
            check: function () {
                return {
                    version: '22.13.2', backend: HW_BACKEND,
                    listening: listening,
                    audioLibraryCount: AUDIO_LIBRARY.length,
                    libraryLoaded: libraryLoaded
                };
            },
            fix: function () {
                forceReleaseSpeech();
                operationInProgress = false;
                container.classList.remove('speaking', 'thinking');
                recreateRecognition();
                setTimeout(function () { startListening(); }, 300);
            },
            testSpeech: function () { speakText('اختبار الصوت.'); },
            reloadLibrary: reloadAudioLibrary,
            fixItemTitle: _fixItemTitle
        },
        audioLibrary: {
            size: function () { return AUDIO_LIBRARY.length; },
            list: function () { return AUDIO_LIBRARY.slice(); },
            find: findAudioItem, hasTextIntent: hasTextIntent,
            reload: reloadAudioLibrary,
            isLoaded: function () { return libraryLoaded; }
        },
        tts: {
            enable: function () { BRAIN_CONFIG.ttsEnabled = true; },
            disable: function () { BRAIN_CONFIG.ttsEnabled = false; },
            isEnabled: function () { return BRAIN_CONFIG.ttsEnabled; },
            setUrl: function (url) { BRAIN_CONFIG.ttsServiceUrl = url; },
            clearCache: function () {
                const keys = Object.keys(localStorage).filter(function (k) { return k.indexOf('hw_tts_') === 0; });
                keys.forEach(function (k) { localStorage.removeItem(k); });
                return keys.length;
            }
        }
    };

    console.log('[robot] v22.13.2 loaded');
    console.log('[robot] Backend: ' + HW_BACKEND);
    console.log('[robot] Audio library: ' + AUDIO_LIBRARY.length + ' items');

})();
