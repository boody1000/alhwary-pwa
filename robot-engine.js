/* ==========================================================
 * hawary-handler.js v33.0 — AI-First + Smart Backend Detection
 * ==========================================================
 *  🆕 v33.0:
 *     ✅ اكتشاف تلقائي للـ Backend (GitHub ↔ InfinityFree)
 *     ✅ روابط كاملة للـ Backend على InfinityFree
 *     ✅ CORS mode صريح + credentials: omit
 *     ✅ رسائل خطأ واضحة (CORS/Network/Cache)
 *     ✅ AI يدير كل الحوار
 *     ✅ مشاركة session مع robot-engine.js
 * ========================================================== */
(function () {
    'use strict';

    function detectScriptBase() {
        if (document.currentScript && document.currentScript.src) {
            return document.currentScript.src.replace(/[^\/]*$/, '');
        }
        const scripts = document.querySelectorAll('script[src*="hawary-handler"]');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src) return scripts[i].src.replace(/[^\/]*$/, '');
        }
        return new URL('.', location.href).href;
    }

    const SCRIPT_BASE = detectScriptBase();
    console.log('[Hawary] المسار:', SCRIPT_BASE);

    /* ═══════════════════════════════════════════════════════════
     * ✅ v33.0: كشف تلقائي للـ Backend
     * ═══════════════════════════════════════════════════════════
     * - لو شغال على InfinityFree → نفس الدومين (أسرع + من غير CORS)
     * - لو شغال على GitHub / أي مكان تاني → دومين InfinityFree الكامل
     * - لو window.HAWARY_BACKEND مضبوط يدويًا → استخدمه هو
     * ═══════════════════════════════════════════════════════════ */
    const INFINITY_HOSTS = /(infinityfreeapp\.com|rf\.gd|epizy\.com|wuaze\.com|infinityfree\.com)$/i;
    const BACKEND_HOST  = 'https://alhwary.wuaze.com/robot'; // ← بدّل ده لدومينك على InfinityFree

    function detectBackend() {
        /* 1) لو المستخدم ضبطه يدويًا */
        if (window.HAWARY_BACKEND) {
            const b = String(window.HAWARY_BACKEND).replace(/\/$/, '');
            console.log('[Hawary] Backend (يدوي):', b);
            return b;
        }

        const host = window.location.hostname || '';

        /* 2) على InfinityFree → نفس الدومين (نسبي) */
        if (INFINITY_HOSTS.test(host)) {
            const b = window.location.origin + '/robot';
            console.log('[Hawary] Backend (InfinityFree - same origin):', b);
            return b;
        }

        /* 3) أي مكان تاني (GitHub Pages، localhost، إلخ) → InfinityFree */
        console.log('[Hawary] Backend (cross-domain → InfinityFree):', BACKEND_HOST);
        return BACKEND_HOST;
    }

    const HW_BACKEND = detectBackend();

    /* ═══ الثيم ═══ */
    (function injectHawaryTheme() {
        if (document.getElementById('hawary-theme-style')) return;
        const st = document.createElement('style');
        st.id = 'hawary-theme-style';
        st.textContent = `
            #chat-messages{background:radial-gradient(circle at 12% 8%,rgba(201,164,92,.06),transparent 30%),radial-gradient(circle at 88% 18%,rgba(31,91,75,.05),transparent 30%),linear-gradient(135deg,#f5f0e6 0%,#faf7ef 100%)!important;}
            .chat-row{display:flex;margin:12px 0;animation:hwFadeIn .35s ease-out;}
            .chat-user{justify-content:flex-start;}
            .chat-bot{justify-content:flex-end;}
            @keyframes hwFadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
            .chat-bubble{max-width:min(85%,620px);padding:14px 20px;border-radius:18px;font-size:15px;line-height:1.85;word-wrap:break-word;position:relative;transition:all .3s ease;direction:rtl;text-align:right;}
            .chat-user .chat-bubble{background:linear-gradient(135deg,#c9a45c 0%,#b58e3e 100%);color:#0b1726;border:1px solid rgba(11,23,38,.15);border-bottom-right-radius:4px;box-shadow:0 6px 20px rgba(201,164,92,.30);font-weight:600;}
            .chat-bot .chat-bubble{background:linear-gradient(135deg,#102238 0%,#17314a 100%);color:#f4ead3;border:1px solid rgba(201,164,92,.35);border-top:3px solid #c9a45c;border-bottom-left-radius:4px;box-shadow:0 8px 28px rgba(11,23,38,.35);}
            .chat-bot .chat-bubble strong{color:#e0c27a;font-weight:800;}
            .chat-bot .chat-bubble::before{content:'◆';position:absolute;top:8px;right:10px;color:#c9a45c;font-size:10px;opacity:.6;}
            .chat-bubble.thinking{background:linear-gradient(135deg,#17314a 0%,#1e3a5f 100%)!important;color:#e0c27a!important;border-color:rgba(201,164,92,.55)!important;animation:hwPulse 1.6s ease-in-out infinite;font-style:italic;}
            @keyframes hwPulse{0%,100%{box-shadow:0 8px 28px rgba(11,23,38,.35),0 0 0 0 rgba(201,164,92,.55);}50%{box-shadow:0 8px 28px rgba(11,23,38,.45),0 0 0 12px rgba(201,164,92,0);}}
            .chat-bubble button{font-family:inherit;transition:all .2s ease;}
            .chat-bubble button:hover{border-color:#c9a45c!important;color:#e0c27a!important;background:rgba(201,164,92,.08)!important;}
            .chat-bubble audio{border-radius:12px;background:rgba(11,23,38,.5);padding:4px;margin-top:10px;border:1px solid rgba(201,164,92,.35);}
            #user-input{background:#faf7ef!important;border-color:rgba(201,164,92,.4)!important;color:#102238!important;}
            #user-input:focus{border-color:#c9a45c!important;box-shadow:0 0 0 3px rgba(201,164,92,.18)!important;outline:none;}
            #send-btn{background:linear-gradient(135deg,#c9a45c 0%,#b58e3e 100%)!important;color:#0b1726!important;border:none!important;box-shadow:0 4px 14px rgba(201,164,92,.35);}
            #send-btn:hover{background:linear-gradient(135deg,#e0c27a 0%,#c9a45c 100%)!important;transform:translateY(-1px);}
            .action-icon-btn{transition:all .2s ease;border-radius:50%;}
            .action-icon-btn:hover{background:rgba(201,164,92,.12);color:#c9a45c;}
            .hw-sources{font-size:11px;color:#c9a45c;opacity:.75;margin-top:10px;line-height:1.7;direction:ltr;text-align:left;padding-top:8px;border-top:1px dashed rgba(201,164,92,.25);}
            .hw-sources b{direction:rtl;display:block;text-align:right;margin-bottom:4px;}
            .hw-sources a{color:#c9a45c;text-decoration:none;border-bottom:1px dotted rgba(201,164,92,.4);margin-right:6px;}
            .hw-sources a:hover{color:#e0c27a;border-bottom-color:#e0c27a;}
            .hw-emotion-line{font-size:11px;color:#c9a45c;opacity:.7;margin-top:6px;font-style:italic;}
        `;
        document.head.appendChild(st);
    })();

    /* ═══ ردود بشرية (فقط للتحيات السريعة) ═══ */
    const HUMAN = {
        thinking: [
            'لحظة أفكر...','ثانية واحدة...','خليني أشوف...','بفكر في سؤالك...',
            'هممم...','دقيقة...','بجهز الإجابة...','بقرأ المصادر...',
            'بجمع المعلومات...'
        ],
        ackOk: ['تمام،','ماشي،','حاضر،','طيب،','مظبوط،','فهمت،'],
        greetings: {
            'ar': ['أهلاً بيك! اسألني عن أي حاجة.','أهلاً وسهلاً! تحت أمرك.','السلام عليكم ورحمة الله! كيف أساعدك؟','منور يا فندم!'],
            'en': ['Hello! Ask me anything.','Hi there! How can I help?'],
        },
        thanks: {
            'ar': ['العفو يا فندم! أنا هنا في أي وقت.','تسلم! اسألني تاني.','ربنا يكرمك!'],
            'en': ["You're welcome!",'Anytime!'],
        },
        goodbye: {
            'ar': ['في أمان الله! ارجع في أي وقت.','مع السلامة!','باي! يومك سعيد.'],
            'en': ['Goodbye! Come back anytime.'],
        },
    };

    const EMOTION_EMOJI = {
        'happy': '😊', 'sad': '🤍', 'angry': '🤝', 'confused': '🤔',
        'urgent': '⚡', 'curious': '🔎', 'tired': '💤',
        'lonely': '🫂', 'scared': '🫂', 'neutral': '',
    };
    const EMOTION_LABEL = {
        'happy': 'مبسوط', 'sad': 'حزين', 'angry': 'متضايق',
        'confused': 'محتار', 'urgent': 'مستعجل', 'curious': 'فضولي',
        'tired': 'تعبان', 'lonely': 'وحيد', 'scared': 'خايف', 'neutral': '',
    };

    function pickRandom(arr) { return (!Array.isArray(arr) || !arr.length) ? '' : arr[Math.floor(Math.random() * arr.length)]; }
    function getLang() { return (window.HawaryEngine && window.HawaryEngine.getLang) ? window.HawaryEngine.getLang().split('-')[0] : 'ar'; }
    function humanThinking() { return pickRandom(HUMAN.thinking); }
    function humanAck() { return pickRandom(HUMAN.ackOk); }

    function detectFastReply(text) {
        const raw = String(text || '').trim();
        if (!raw) return null;
        const clean = raw.replace(/[!؟.،,؛;:]+$/g, '').trim();
        if (clean.length > 30) return null;
        const L = HUMAN; const lang = getLang();
        if (/^(السلام عليكم|سلام عليكم|اهلا|أهلا|هلا|مرحبا|مرحباً|صباح الخير|مساء الخير|هاي|هاى|hi|hello|hey)$/i.test(clean)) return pickRandom(L.greetings[lang] || L.greetings.ar);
        if (/^(شكرا|شكراً|تسلم|جزاك الله|ربنا يكرمك|بارك الله|متشكر|thanks|thank you|thx)$/i.test(clean)) return pickRandom(L.thanks[lang] || L.thanks.ar);
        if (/^(وداعا|وداعاً|باي|bye|goodbye|تصبح على خير)$/i.test(clean)) return pickRandom(L.goodbye[lang] || L.goodbye.ar);
        return null;
    }

    let thinkingRotator = null;
    let thinkingStartTime = 0;

    function startThinkingRotation(bubble) {
        stopThinkingRotation();
        thinkingStartTime = Date.now();
        bubble.textContent = pickRandom(HUMAN.thinking);
        thinkingRotator = setInterval(() => {
            if (!bubble.classList.contains('thinking')) { stopThinkingRotation(); return; }
            const elapsed = Math.floor((Date.now() - thinkingStartTime) / 1000);
            if (elapsed < 3) bubble.textContent = pickRandom(HUMAN.thinking);
            else if (elapsed < 8) bubble.textContent = 'بقرأ المصادر... (' + elapsed + 's)';
            else if (elapsed < 15) bubble.textContent = 'بجهز الرد... (' + elapsed + 's)';
            else if (elapsed < 25) bubble.textContent = 'لسه بجمع المعلومات... (' + elapsed + 's)';
            else bubble.textContent = 'لسه بحاول... (' + elapsed + 's)';
        }, 1500);
    }
    function stopThinkingRotation() { if (thinkingRotator) { clearInterval(thinkingRotator); thinkingRotator = null; } }

    /* ═══════════════════════════════════════════════════════════
     * ✅ CFG — v33.0
     * ═══════════════════════════════════════════════════════════ */
    const CFG = {
        apiUrl: HW_BACKEND + '/firebase-api.php',
        apiTimeout: 65000,
        maxFileKB: 200,
        maxBubbles: 200,
    };

    console.log('[Hawary] 🔗 API URL:', CFG.apiUrl);

    /* ═══ Session مشترك مع robot-engine.js ═══ */
    function getSessionId() {
        if (window.HAWARY_SESSION_ID) return window.HAWARY_SESSION_ID;
        try {
            const k = 'hawary_sid';
            let s = localStorage.getItem(k);
            if (!s) {
                s = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                localStorage.setItem(k, s);
            }
            window.HAWARY_SESSION_ID = s;
            return s;
        } catch (e) {
            const s = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
            window.HAWARY_SESSION_ID = s;
            return s;
        }
    }

    /* ═══ History محلية ═══ */
    function getLocalHistory() {
        try {
            const raw = localStorage.getItem('hawary_history');
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.slice(-8) : [];
        } catch (e) { return []; }
    }
    function pushLocalHistory(role, text) {
        try {
            let arr = getLocalHistory();
            arr.push({ role, text: String(text).slice(0, 500), ts: Date.now() });
            if (arr.length > 20) arr = arr.slice(-20);
            localStorage.setItem('hawary_history', JSON.stringify(arr));
        } catch (e) {}
    }
    function clearLocalHistory() {
        try { localStorage.removeItem('hawary_history'); } catch (e) {}
    }

    const $ = (id) => document.getElementById(id);
    const els = {
        chatBox: $('chat-messages'), welcome: $('welcome-box'),
        input: $('user-input'), sendBtn: $('send-btn'),
        newChatBtn: $('new-chat-btn'), attachBtn: $('attach-btn'),
        fileInput: $('file-input'),
    };
    if (!els.chatBox || !els.input) {
        console.warn('[Hawary] ❌ لم يتم العثور على عناصر الشات');
        return;
    }

    const state = { busy: false, sessionId: getSessionId() };

    function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function escB(s) { return esc(s).replace(/\n/g, '<br>'); }

    function scrollBottom(force) {
        const el = els.chatBox;
        if (force || (el.scrollHeight - el.scrollTop - el.clientHeight) < 120) el.scrollTop = el.scrollHeight;
    }
    function hideWelcome() { if (els.welcome && els.welcome.style.display !== 'none') els.welcome.style.display = 'none'; }
    function trimBubbles() {
        const rows = els.chatBox.querySelectorAll('.chat-row');
        if (rows.length <= CFG.maxBubbles) return;
        for (let i = 0; i < rows.length - CFG.maxBubbles; i++) rows[i].remove();
    }

    function addBubble(text, who, opts) {
        opts = opts || {};
        hideWelcome();
        const row = document.createElement('div');
        row.className = 'chat-row chat-' + (who === 'user' ? 'user' : 'bot');
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        if (opts.thinking) bubble.classList.add('thinking');
        bubble.innerHTML = opts.html ? text : escB(text);
        row.appendChild(bubble);
        els.chatBox.appendChild(row);
        trimBubbles();
        scrollBottom(true);
        return bubble;
    }

    function handleAudioTags(bubble, text) {
        const re = /\[\[AUDIO:([^\]]+)\]\]/g;
        let m; const urls = [];
        while ((m = re.exec(text)) !== null) urls.push(m[1].trim());
        if (!urls.length) return;
        let html = bubble.innerHTML;
        urls.forEach(url => {
            const safe = esc(url);
            const reEsc = new RegExp('\\[\\[AUDIO:' + url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\]\\]', 'g');
            html = html.replace(reEsc, '<audio controls preload="none" style="width:100%;margin-top:8px;" src="' + safe + '"></audio>');
        });
        bubble.innerHTML = html;
    }

    function addCopyButton(bubble, text) {
        const btn = document.createElement('button');
        btn.textContent = 'نسخ';
        btn.style.cssText = 'margin-top:10px;background:transparent;border:1px solid rgba(201,164,92,.35);color:#c9a45c;border-radius:14px;padding:3px 12px;cursor:pointer;font-size:12px;font-weight:600;';
        btn.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(text); btn.textContent = 'تم'; setTimeout(() => { btn.textContent = 'نسخ'; }, 1500); }
            catch (e) { btn.textContent = 'فشل'; setTimeout(() => { btn.textContent = 'نسخ'; }, 1500); }
        });
        bubble.appendChild(btn);
    }

    function addFeedbackButtons(bubble, q, a) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'margin-top:10px;display:flex;gap:8px;align-items:center;font-size:12px;opacity:.85;';
        const up = document.createElement('button'); up.textContent = 'مفيد';
        up.style.cssText = 'background:transparent;border:1px solid rgba(201,164,92,.35);color:#c9a45c;border-radius:14px;padding:3px 10px;cursor:pointer;font-size:13px;';
        const down = document.createElement('button'); down.textContent = 'غير مفيد';
        down.style.cssText = up.style.cssText;
        const note = document.createElement('span'); note.style.cssText = 'color:#c9a45c;opacity:.7;';
        up.addEventListener('click', () => { sendFeedback(q, 1); up.disabled = down.disabled = true; note.textContent = 'شكرًا!'; });
        down.addEventListener('click', () => { sendFeedback(q, -1); up.disabled = down.disabled = true; note.textContent = 'شكرًا.'; });
        wrap.appendChild(up); wrap.appendChild(down); wrap.appendChild(note);
        bubble.appendChild(wrap);
    }

    function addRetryButton(bubble, q) {
        const btn = document.createElement('button');
        btn.textContent = '🔄 جرّب تاني';
        btn.style.cssText = 'margin-top:10px;background:transparent;border:1px solid rgba(201,164,92,.6);color:#e0c27a;border-radius:14px;padding:5px 14px;cursor:pointer;font-size:13px;font-weight:600;';
        btn.addEventListener('click', () => { btn.disabled = true; btn.textContent = '...'; askBrain(q); });
        bubble.appendChild(btn);
    }

    function addEmotionBadge(bubble, emotion) {
        if (!emotion || emotion === 'neutral') return;
        const emoji = EMOTION_EMOJI[emotion] || '';
        const label = EMOTION_LABEL[emotion] || '';
        if (!emoji) return;
        const line = document.createElement('div');
        line.className = 'hw-emotion-line';
        line.textContent = emoji + ' ' + label;
        bubble.appendChild(line);
    }

    /* ═══════════════════════════════════════════════════════════
     * ✅ v33.0: callBrain — CORS mode صريح + credentials omit
     * ═══════════════════════════════════════════════════════════ */
    async function callBrain(payload, timeout) {
        timeout = timeout || CFG.apiTimeout;
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), timeout);
        try {
            const resp = await fetch(CFG.apiUrl, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: ctrl.signal
            });
            clearTimeout(tid);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const text = await resp.text();
            try { return JSON.parse(text); }
            catch (e) {
                console.error('[Hawary] bad JSON. أول 200 حرف:', text.slice(0, 200));
                throw new Error('bad_json');
            }
        } catch (e) {
            clearTimeout(tid);
            throw e;
        }
    }

    function fullLang() {
        return (window.HawaryEngine && window.HawaryEngine.getLang)
            ? window.HawaryEngine.getLang()
            : (localStorage.getItem('hw_lang') || 'ar-EG');
    }

    /* ═══════════════════════════════════════════════════════════
     * askBrain
     * ═══════════════════════════════════════════════════════════ */
    async function askBrain(question, extraContext) {
        const q = (question || '').trim();
        if (!q && !extraContext) return;
        if (state.busy) return;
        state.busy = true;
        setInputDisabled(true);
        addBubble(q || '(ملف مرفق)', 'user');
        pushLocalHistory('user', q);

        /* 1) تحية/شكر سريع */
        const fastReply = !extraContext ? detectFastReply(q) : null;
        if (fastReply) {
            setTimeout(() => {
                const b = addBubble(fastReply, 'bot');
                addCopyButton(b, fastReply);
                pushLocalHistory('assistant', fastReply);
                state.busy = false; setInputDisabled(false);
                if (els.input) els.input.focus();
            }, 250);
            return;
        }

        /* 2) API */
        const thinking = addBubble(humanThinking(), 'bot', { thinking: true });
        startThinkingRotation(thinking);

        try {
            const payload = {
                action: 'think',
                q: extraContext ? (q + '\n\n--- محتوى الملف ---\n' + extraContext) : q,
                session: state.sessionId,
                user_id: state.sessionId,
                lang: fullLang(),
                history: getLocalHistory(),
            };

            console.log('[Hawary v33.0] 📡 →', CFG.apiUrl, '| Q:', q.substring(0, 80));

            let result = null;
            let connErr = null;
            try { result = await callBrain(payload, CFG.apiTimeout); }
            catch (e) {
                connErr = e;
                console.warn('[Hawary] ❌ فشل الاتصال:', e.message, e);
            }

            stopThinkingRotation();
            thinking.classList.remove('thinking');

            if (result && result.ok && result.answer && result.answer.trim().length > 0) {
                const answer = result.answer;
                const ack = (result.engine && String(result.engine).includes('ai') && Math.random() < 0.25)
                    ? (humanAck() + ' ') : '';

                thinking.innerHTML = escB(ack + answer);
                handleAudioTags(thinking, answer);
                if (result.emotion) addEmotionBadge(thinking, result.emotion);

                if (result.engine) {
                    const meta = document.createElement('div');
                    meta.style.cssText = 'font-size:11px;opacity:.55;margin-top:8px;color:#c9a45c;';
                    const conf = Math.round((result.confidence || 0) * 100);
                    let src = result.engine || '';
                    const labelMap = {
                        'ai-emotional': '💭 AI عاطفي',
                        'ai-conversation': '💬 AI حواري',
                        'ai-summarized': '📄 AI ملخّص',
                        'ai-general': '🤖 AI',
                        'emotional-fallback': '❤️ رد دعم',
                        'local-fallback': '💬 رد محلي',
                        'keywords-bank': '📚 بنك الكلمات',
                        'islamic-faq': '🕌 إسلامي',
                        'islamic-fiqh': '🕌 فقه',
                        'islamic-hadith': '🕌 حديث',
                        'islamic-tafsir': '🕌 تفسير',
                        'ddg-lite': '🦆 DDG',
                        'greeting': '👋 ترحيب',
                        'thanks': '🙏 شكر',
                        'stop': '👋',
                    };
                    if (labelMap[src]) src = labelMap[src];
                    let metaText = src;
                    if (result.confidence) metaText += ` • دقة ${conf}`;
                    if (result.elapsed_ms) metaText += ` • ${(result.elapsed_ms/1000).toFixed(1)}s`;
                    if (result.source) metaText += ` • ${result.source}`;
                    meta.textContent = metaText;
                    thinking.appendChild(meta);
                }

                addCopyButton(thinking, answer);
                addFeedbackButtons(thinking, q, answer);
                pushLocalHistory('assistant', answer);
                scrollBottom(true);

            } else if (connErr) {
                /* ═══ مشكلة اتصال / CORS ═══ */
                console.error('[Hawary] 🚨 Network/CORS error:', connErr);
                let msg = 'معلش، حصلت مشكلة في الاتصال. جرّب تاني.';
                const em = String(connErr.message || '');
                if (em.includes('Failed to fetch') || em.includes('NetworkError')) {
                    msg = '⚠️ مش قادر أوصل للسيرفر.\n\n' +
                          'الأسباب المحتملة:\n' +
                          '• CORS — السيرفر مش بيسمح للدومين ده\n' +
                          '• السيرفر واقف مؤقتًا\n' +
                          '• عندك AdBlock/Extension بيمنع الطلب\n\n' +
                          'افتح الـ Console (F12) لتفاصيل أكتر.';
                } else if (em.includes('aborted') || em.includes('AbortError')) {
                    msg = '⏱️ السيرفر أخد وقت طويل. جرّب تاني.';
                } else if (em.startsWith('HTTP')) {
                    msg = '⚠️ السيرفر رد بخطأ: ' + em + '\n\nجرّب تاني بعد شوية.';
                }
                thinking.innerHTML = escB(msg);
                addRetryButton(thinking, q);
                scrollBottom(true);

            } else {
                /* ═══ رد من السيرفر بس مش ok ═══ */
                console.warn('[Hawary] ⛔ لا يوجد رد:', result);
                let msg = 'معلش، مش لاقي رد دلوقتي. جرّب تاني.';
                if (result && result.error === 'minute_limit') {
                    msg = result.answer || 'استنى شوية، في ناس كتير بتكلمني.';
                } else if (result && result.error === 'daily_limit') {
                    msg = 'وصلت الحد اليومي، جرب تاني بكرة.';
                } else if (result && result.error === 'no_answer') {
                    msg = result.answer || 'معلش، محتاج توضيح أكتر.';
                } else if (result && result.error) {
                    msg = 'معلش، حصلت مشكلة: ' + result.error;
                }
                thinking.innerHTML = escB(msg);
                addRetryButton(thinking, q);
                scrollBottom(true);
            }

        } catch (err) {
            stopThinkingRotation();
            thinking.classList.remove('thinking');
            console.error('[Hawary] fatal:', err);
            thinking.innerHTML = escB('معلش، حصلت مشكلة غير متوقعة. جرّب تاني.');
            addRetryButton(thinking, q);
            scrollBottom(true);
        } finally {
            state.busy = false; setInputDisabled(false);
            if (els.input) els.input.focus();
        }
    }

    async function sendFeedback(q, delta) {
        try { await callBrain({ action: 'rate', q, session: state.sessionId, delta }, 8000); } catch (e) {}
    }

    function setInputDisabled(d) {
        if (els.input) els.input.disabled = d;
        if (els.sendBtn) els.sendBtn.disabled = d;
        if (els.attachBtn) els.attachBtn.disabled = d;
    }
    function handleSend() {
        const v = els.input.value.trim();
        if (!v) return;
        els.input.value = '';
        askBrain(v);
    }

    function handleFile(file) {
        if (!file) return;
        if (file.size / 1024 > CFG.maxFileKB) return alert('الحد الأقصى ' + CFG.maxFileKB + ' KB');
        if (!/\.(txt|md|json|csv|log)$/i.test(file.name)) return alert('ملفات نصية فقط');
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = String(ev.target.result || '').slice(0, 20000);
            const q = els.input.value.trim() || ('حلّل الملف: ' + file.name);
            els.input.value = '';
            askBrain(q, content);
        };
        reader.readAsText(file, 'utf-8');
    }

    function setupVoiceInput() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const recog = new SR();
        recog.lang = 'ar-EG'; recog.interimResults = false; recog.maxAlternatives = 1;
        recog.onresult = (ev) => { const t = ev.results[0][0].transcript; if (t) { els.input.value = t; handleSend(); } };
        const actions = document.querySelector('.input-actions');
        if (!actions) return;
        const mic = document.createElement('button');
        mic.className = 'action-icon-btn'; mic.type = 'button'; mic.title = 'تحدث';
        mic.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
        mic.addEventListener('click', () => { try { recog.start(); mic.style.color = '#d93025'; } catch (e) {} });
        recog.onend = () => { mic.style.color = ''; };
        actions.insertBefore(mic, actions.firstChild);
    }

    if (els.sendBtn) els.sendBtn.addEventListener('click', (e) => { e.preventDefault(); handleSend(); });
    if (els.input) {
        els.input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
        els.input.addEventListener('input', () => { els.input.style.height = 'auto'; els.input.style.height = Math.min(els.input.scrollHeight, 140) + 'px'; });
        els.input.focus();
    }
    if (els.newChatBtn) {
        els.newChatBtn.addEventListener('click', () => {
            els.chatBox.innerHTML = '';
            if (els.welcome) { els.welcome.style.display = ''; els.chatBox.appendChild(els.welcome); }
            try {
                state.sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                localStorage.setItem('hawary_sid', state.sessionId);
                window.HAWARY_SESSION_ID = state.sessionId;
            } catch (e) {}
            clearLocalHistory();
            if (els.input) els.input.focus();
        });
    }
    if (els.attachBtn && els.fileInput) {
        els.attachBtn.addEventListener('click', (e) => { e.preventDefault(); els.fileInput.click(); });
        els.fileInput.addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (f) handleFile(f); e.target.value = ''; });
    }

    setupVoiceInput();

    /* ═══════════════════════════════════════════════════════════
     * ✅ v33.0: اختبار الاتصال — مع تشخيص واضح
     * ═══════════════════════════════════════════════════════════ */
    (async function testApi() {
        const pingUrl = CFG.apiUrl + '?action=ping';
        console.log('[Hawary] 🧪 اختبار الاتصال:', pingUrl);
        try {
            const r = await fetch(pingUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                cache: 'no-store'
            });
            console.log('[Hawary] 📥 رد السيرفر:', r.status, r.statusText);
            if (!r.ok) {
                console.error('[Hawary] ❌ السيرفر رد ' + r.status + ' على ' + pingUrl);
                return;
            }
            const j = await r.json();
            if (j && j.ok) {
                console.info(
                    '%c✅ firebase-api.php شغال — نسخة: ' + (j.version || '?') +
                    ' | providers: ' + (Array.isArray(j.providers) ? j.providers.join(' → ') : '?'),
                    'color:#0f9d58;font-weight:bold;'
                );
            } else {
                console.warn('[Hawary] ⚠️ رد غريب:', j);
            }
        } catch (e) {
            console.error(
                '%c❌ API مش شغال — ' + e.message +
                '\n   URL: ' + pingUrl +
                '\n   الأسباب المحتملة:' +
                '\n   1) CORS — الـ PHP مش بيسمح بالدومين ده' +
                '\n   2) Service Worker بيعمل cache للرد القديم' +
                '\n   3) InfinityFree JS Challenge' +
                '\n   4) AdBlock/Extension بيمنع الطلب',
                'color:#d93025;font-weight:bold;'
            );
        }
    })();

    /* استماع لحدث رد الروبوت الصوتي */
    window.addEventListener('hawary:bot-replied', (e) => {
        const d = e.detail || {};
        if (!d.reply) return;
        const lastBot = els.chatBox.querySelector('.chat-bot:last-child .chat-bubble');
        if (lastBot && lastBot.textContent.includes(d.reply.slice(0, 30))) return;
        const b = addBubble(d.reply, 'bot');
        if (d.emotion) addEmotionBadge(b, d.emotion);
        addCopyButton(b, d.reply);
        pushLocalHistory('assistant', d.reply);
    });

    window.HawaryHandler = {
        ask: askBrain,
        feedback: sendFeedback,
        newChat: () => els.newChatBtn && els.newChatBtn.click(),
        sessionId: () => state.sessionId,
        apiUrl: CFG.apiUrl,
        backend: HW_BACKEND,
        version: '33.0-smart-backend',
        getHistory: getLocalHistory,
        clearHistory: clearLocalHistory,
    };

    console.log('%c[Hawary Handler] v33.0 ready', 'color:#c9a45c;font-weight:bold');
    console.log('[Hawary] Backend:', HW_BACKEND);
    console.log('[Hawary] API:', CFG.apiUrl);
})();
