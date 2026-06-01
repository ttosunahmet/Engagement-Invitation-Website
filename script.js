(() => {
    'use strict';

    const CONFIG = {
        VALID_TOKEN: '[DAVET_KODU]',
        EVENT_DATE: new Date('[AY GÜN, YIL SS:DD:SN]').getTime(),
        HOLD_DURATION: 2000,
        SCRATCH_THRESHOLD: 0.45,
        EVENT_TITLE: '[İSİM_1] & [İSİM_2] Nişan Töreni',
        EVENT_LOCATION: '[MEKAN_ADI], [MEKAN_ADRESİ], [MEKAN_ŞEHİR]',
        EVENT_DESCRIPTION: '[İSİM_1] & [İSİM_2]\'ın nişan törenine davetlisiniz.',
        EVENT_DATE_ISO: '[YYYYAAGGTSSMM]',
        EVENT_DATE_END_ISO: '[YYYYAAGGTSSMM_BİTİŞ]'
    };

    const params = new URLSearchParams(window.location.search);
    const token = params.get('davetiye');
    const isMasaPage = params.get('masa') === 'qr';

    // 1. MASA SAYFASI
    if (isMasaPage) {
        document.getElementById('gatekeeper').style.display = 'none';
        document.getElementById('app').style.display = 'none';
        document.getElementById('masaApp').style.display = 'flex';
        document.body.classList.remove('locked-scroll');
        return;
    }

    const isValidToken = token === CONFIG.VALID_TOKEN;

    document.addEventListener('DOMContentLoaded', initGatekeeper);

    // ═════════════════════════════════════════════════════════════════════════
    //  GATEKEEPER
    // ═════════════════════════════════════════════════════════════════════════

    function initGatekeeper() {
        const gatekeeper = document.getElementById('gatekeeper');
        const enterBtn = document.getElementById('enterBtn');
        const app = document.getElementById('app');

        if (!enterBtn) return;

        const triggerEnter = () => {
            if (!isValidToken) {
                gsap.fromTo(enterBtn, { x: 0 }, {
                    x: 0,
                    keyframes: [
                        { x: -8, duration: 0.06 },
                        { x: 8, duration: 0.06 },
                        { x: -6, duration: 0.06 },
                        { x: 6, duration: 0.06 },
                        { x: 0, duration: 0.06 }
                    ]
                });
                return;
            }
            openGarden(gatekeeper, app);
        };

        enterBtn.addEventListener('click', triggerEnter);
        enterBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerEnter();
            }
        });
    }

    function openGarden(gatekeeper, app) {
        spawnFallingPetals(40);

        if (window.confetti) {
            setTimeout(() => {
                confetti({
                    particleCount: 80,
                    spread: 100,
                    origin: { y: 0.5 },
                    colors: ['#c9818c', '#e8b8c0', '#d4b87a', '#a8b29c'],
                    shapes: ['circle'],
                    gravity: 0.4,
                    ticks: 200
                });
            }, 200);
        }

        gatekeeper.classList.add('open');
        app.style.display = 'block';

        gsap.to(app, {
            opacity: 1,
            duration: 1.4,
            delay: 1.0,
            ease: 'power2.out'
        });

        setTimeout(() => {
            document.body.classList.remove('locked-scroll');
        }, 1800);

        setTimeout(() => {
            gatekeeper.classList.add('fully-open');
            initInvitationSystem();
        }, 3000);
    }

    function spawnFallingPetals(count) {
        const container = document.getElementById('fallingPetals');
        if (!container) return;

        const colors = ['#c9818c', '#e8b8c0', '#fce4e7', '#d4b87a', '#a8b29c'];

        for (let i = 0; i < count; i++) {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.background = colors[Math.floor(Math.random() * colors.length)];
            petal.style.transform = `rotate(${Math.random() * 360}deg)`;
            petal.style.opacity = (0.5 + Math.random() * 0.4).toString();
            const size = 8 + Math.random() * 12;
            petal.style.width = size + 'px';
            petal.style.height = size + 'px';
            container.appendChild(petal);

            const duration = 3 + Math.random() * 4;
            const drift = (Math.random() - 0.5) * 200;

            gsap.to(petal, {
                y: window.innerHeight + 50,
                x: drift,
                rotation: '+=' + (Math.random() * 720 - 360),
                duration: duration,
                delay: Math.random() * 1.5,
                ease: 'sine.in',
                onComplete: () => petal.remove()
            });
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  ANA SİSTEM
    // ═════════════════════════════════════════════════════════════════════════

    function initInvitationSystem() {
        if (!window.gsap) return;

        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll('[data-reveal]').forEach(elem => {
            gsap.to(elem, {
                scrollTrigger: { trigger: elem, start: 'top 85%', toggleActions: 'play none none none' },
                opacity: 1, y: 0, duration: 1.1, ease: 'power2.out'
            });
        });

        initScratchCard();
        initCountdown();
        initInvitationUnfold();
        initHoldButton();
        initParallaxBackground();
        initMusicControl();
        initShareControl();
        initCalendarBtn();
        initGallery();
        showFloatingControls();

        ScrollTrigger.refresh();
    }

    function showFloatingControls() {
        const controls = document.querySelector('.floating-controls');
        if (controls) {
            setTimeout(() => controls.classList.add('visible'), 1500);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  MÜZİK KONTROLÜ — DÜZELTİLDİ (3 fallback kaynak)
    // ═════════════════════════════════════════════════════════════════════════

    function initMusicControl() {
        const btn = document.getElementById('musicToggle');
        const audio = document.getElementById('bgMusic');
        if (!btn || !audio) return;

        let isPlaying = false;
        let isLoaded = false;

        // Audio load events
        audio.addEventListener('canplay', () => {
            isLoaded = true;
        });

        audio.addEventListener('error', (e) => {
            console.warn('Müzik yüklenemedi:', e);
        });

        // Force load
        audio.load();

        const toggle = async () => {
            if (isPlaying) {
                audio.pause();
                btn.classList.remove('playing');
                isPlaying = false;
            } else {
                try {
                    audio.volume = 0.3;
                    audio.currentTime = audio.currentTime || 0;
                    const playPromise = audio.play();

                    if (playPromise !== undefined) {
                        await playPromise;
                        btn.classList.add('playing');
                        isPlaying = true;
                    }
                } catch (err) {
                    console.warn('Müzik başlatılamadı:', err);
                    // Visual feedback ki kullanıcı durumu anlasın
                    gsap.fromTo(btn, { scale: 1 }, {
                        scale: 1.1,
                        duration: 0.15,
                        yoyo: true,
                        repeat: 3
                    });
                }
            }
        };

        btn.addEventListener('click', toggle);
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  PAYLAŞ KONTROLÜ
    // ═════════════════════════════════════════════════════════════════════════

    function initShareControl() {
        const shareBtn = document.getElementById('shareBtn');
        const modal = document.getElementById('shareModal');
        const closeBtn = document.getElementById('shareClose');
        const waBtn = document.getElementById('shareWhatsapp');
        const copyBtn = document.getElementById('shareCopy');
        const copyLabel = document.getElementById('copyLabel');

        if (!shareBtn || !modal) return;

        const shareUrl = window.location.href;
        const shareText = `[İSİM_1] & [İSİM_2]'ın nişan davetiyesini açmak için bu özel bağlantıyı kullanın:\n\n${shareUrl}\n\n[TARİH] · [MEKAN_ADI], [MEKAN_ŞEHİR]`;

        if (waBtn) {
            waBtn.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        }

        const openModal = () => {
            if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                navigator.share({
                    title: '[İSİM_1] & [İSİM_2] · Nişan Davetiyesi',
                    text: shareText,
                    url: shareUrl
                }).catch(() => showModal());
            } else {
                showModal();
            }
        };

        const showModal = () => {
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.classList.add('visible'));
        };

        const closeModal = () => {
            modal.classList.remove('visible');
            setTimeout(() => modal.style.display = 'none', 300);
        };

        shareBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    copyBtn.classList.add('copied');
                    if (copyLabel) copyLabel.textContent = '✓ Kopyalandı!';
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        if (copyLabel) copyLabel.textContent = 'Bağlantıyı Kopyala';
                    }, 2000);
                } catch (err) {
                    const ta = document.createElement('textarea');
                    ta.value = shareUrl;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    copyBtn.classList.add('copied');
                    if (copyLabel) copyLabel.textContent = '✓ Kopyalandı!';
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        if (copyLabel) copyLabel.textContent = 'Bağlantıyı Kopyala';
                    }, 2000);
                }
            });
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  TAKVİME EKLE
    // ═════════════════════════════════════════════════════════════════════════

    function initCalendarBtn() {
        const btn = document.getElementById('addToCalendarBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//[İSİM_1] & [İSİM_2]//Nisan//TR',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                `UID:${Date.now()}@[DAVET_KODU]`,
                `DTSTAMP:${formatDateUTC(new Date())}`,
                `DTSTART:${CONFIG.EVENT_DATE_ISO}`,
                `DTEND:${CONFIG.EVENT_DATE_END_ISO}`,
                `SUMMARY:${CONFIG.EVENT_TITLE}`,
                `DESCRIPTION:${CONFIG.EVENT_DESCRIPTION}`,
                `LOCATION:${CONFIG.EVENT_LOCATION}`,
                'STATUS:CONFIRMED',
                'BEGIN:VALARM',
                'TRIGGER:-P1D',
                'ACTION:DISPLAY',
                'DESCRIPTION:Yarın [İSİM_1] & [İSİM_2]\'ın nişan töreni var!',
                'END:VALARM',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');

            const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'isim1-isim2-nisan.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            const orig = btn.innerHTML;
            btn.innerHTML = '<span>✓ Takvime Eklendi</span>';
            setTimeout(() => btn.innerHTML = orig, 2000);
        });
    }

    function formatDateUTC(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  PARALLAX
    // ═════════════════════════════════════════════════════════════════════════

    function initParallaxBackground() {
        document.querySelectorAll('.bg-photo').forEach((photo, idx) => {
            const speed = 0.3 + (idx * 0.1);
            gsap.to(photo, {
                y: () => -window.innerHeight * speed * 0.4,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  KAZIMA — DÜZELTİLDİ (DOM tarihi + canvas üstte)
    // ═════════════════════════════════════════════════════════════════════════

    function initScratchCard() {
        const canvas = document.getElementById('scratchCanvas');
        const container = document.getElementById('scratchContainer');
        const progressLabel = document.getElementById('scratchProgress');
        if (!canvas || !container) return;

        let isDrawing = false;
        let isCompleted = false;
        let lastCheckTime = 0;
        let dpr = 1;

        // Yeni context state için resize'da context'i yeniden oluştur
        const setupCanvas = () => {
            const ctx = canvas.getContext('2d');
            dpr = window.devicePixelRatio || 1;
            const w = container.offsetWidth;
            const h = container.offsetHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';

            // ÖNEMLİ: scale'i SADECE BİR KEZ uygula
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Kazıma yüzeyini çiz (altın renkli)
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#d4b87a');
            grad.addColorStop(0.5, '#c9a961');
            grad.addColorStop(1, '#a08642');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Hafif benek dokusu
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            for (let i = 0; i < 80; i++) {
                ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
            }

            // Üzerinde kazıma talimatı
            ctx.font = "italic 22px 'Cormorant Garamond', serif";
            ctx.fillStyle = 'rgba(255,250,240,0.92)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✦ Kazıyın ✦', w / 2, h / 2 - 10);

            ctx.font = "12px 'Cinzel', serif";
            ctx.fillStyle = 'rgba(255,250,240,0.7)';
            ctx.fillText('TARİHİ KEŞFEDİN', w / 2, h / 2 + 18);

            // Kazıma için destination-out
            ctx.globalCompositeOperation = 'destination-out';

            return ctx;
        };

        let ctx = setupCanvas();

        const checkScratchProgress = () => {
            const now = Date.now();
            if (now - lastCheckTime < 200) return;
            lastCheckTime = now;

            try {
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let transparentPixels = 0;
                const total = data.length / 4;
                // Sample her 16 pixel'de bir
                let sampleCount = 0;
                for (let i = 3; i < data.length; i += 64) {
                    if (data[i] < 50) transparentPixels++;
                    sampleCount++;
                }
                const ratio = transparentPixels / sampleCount;

                if (progressLabel) {
                    const pct = Math.min(Math.round(ratio * 100), 100);
                    progressLabel.textContent = pct > 5 ? `${pct}% Keşfedildi` : '';
                }

                if (!isCompleted && ratio >= CONFIG.SCRATCH_THRESHOLD) {
                    isCompleted = true;
                    completeScratch();
                }
            } catch (e) {
                console.warn('Scratch progress check failed:', e);
            }
        };

        const completeScratch = () => {
            gsap.to(canvas, { opacity: 0, duration: 0.6, ease: 'power2.out' });

            if (progressLabel) {
                progressLabel.textContent = '✦ Tarih Açığa Çıktı ✦';
                gsap.fromTo(progressLabel, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 });
            }

            if (window.confetti) {
                const rect = container.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;

                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { x, y },
                    colors: ['#8b3a3a', '#c9818c', '#c9a961', '#a8b29c', '#fefcf8'],
                    ticks: 250
                });

                setTimeout(() => {
                    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: x - 0.1, y }, colors: ['#8b3a3a', '#c9818c', '#c9a961'] });
                    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: x + 0.1, y }, colors: ['#a8b29c', '#fefcf8', '#d4b87a'] });
                }, 250);
            }

            const content = container.querySelector('.scratch-content');
            if (content) {
                gsap.fromTo(content, { scale: 0.95 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
            }
        };

        // Resize'da context'i yeniden setup et
        const handleResize = () => {
            if (isCompleted) return;
            ctx = setupCanvas();
        };
        window.addEventListener('resize', handleResize);

        const getPos = (e) => {
            const r = canvas.getBoundingClientRect();
            const t = e.touches ? e.touches[0] : e;
            return { x: t.clientX - r.left, y: t.clientY - r.top };
        };

        const scratch = (e) => {
            if (!isDrawing || isCompleted) return;
            e.preventDefault();
            const p = getPos(e);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
            ctx.fill();
            checkScratchProgress();
        };

        canvas.addEventListener('mousedown', e => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseleave', () => isDrawing = false);
        canvas.addEventListener('touchstart', e => { isDrawing = true; scratch(e); }, { passive: false });
        canvas.addEventListener('touchmove', scratch, { passive: false });
        canvas.addEventListener('touchend', () => isDrawing = false);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  COUNTDOWN
    // ═════════════════════════════════════════════════════════════════════════

    function initCountdown() {
        const target = CONFIG.EVENT_DATE;
        const el = {
            d: document.getElementById('cd-days'),
            h: document.getElementById('cd-hours'),
            m: document.getElementById('cd-mins'),
            s: document.getElementById('cd-secs')
        };
        if (!el.d) return;

        const update = () => {
            const diff = target - Date.now();
            if (diff < 0) { el.d.textContent = el.h.textContent = el.m.textContent = el.s.textContent = '00'; return; }
            el.d.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
            el.h.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
            el.m.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
            el.s.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        };
        update();
        setInterval(update, 1000);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  GALERİ — 3D KART YIĞINI
    // ═════════════════════════════════════════════════════════════════════════

    function initGallery() {
        const cards = document.querySelectorAll('.gallery-card');
        if (!cards.length) return;

        cards.forEach((card, idx) => {
            card.addEventListener('click', () => {
                // Tıklayan kart yığının önüne ve büyüt
                cards.forEach(c => c.classList.remove('flying'));
                card.classList.add('flying');

                // 3 saniye sonra geri al
                setTimeout(() => {
                    card.classList.remove('flying');
                }, 3000);
            });
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  DAVETİYE AÇILIM
    // ═════════════════════════════════════════════════════════════════════════

    function initInvitationUnfold() {
        const wrapper = document.getElementById('inviteWrapper');
        if (!wrapper) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.invite-section',
                start: 'center center',
                end: '+=1400',
                scrub: 1.2,
                pin: true,
                anticipatePin: 1,
                pinSpacing: true,
                onLeave: () => {
                    if (window.confetti) {
                        confetti({
                            particleCount: 100,
                            spread: 90,
                            origin: { y: 0.5 },
                            colors: ['#c9818c', '#e8b8c0', '#c9a961', '#a8b29c'],
                            shapes: ['circle'],
                            ticks: 200
                        });
                    }
                }
            }
        });

        tl.to('.wax-seal', { scale: 1.15, duration: 0.3, ease: 'power2.in' })
          .to('.wax-seal', { scale: 0, opacity: 0, rotate: 25, duration: 0.4, ease: 'power3.in' }, '+=0.05');

        tl.to('.bow-knot', { scale: 0, opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.2')
          .to('.bow-loop-left', { scaleX: 0.3, x: -30, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '<')
          .to('.bow-loop-right', { scaleX: 0.3, x: 30, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '<')
          .to(['.bow-tail-left', '.bow-tail-right'], { y: 30, opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.05 }, '<+0.1')
          .to('.ribbon-left-strip', { scaleX: 0, opacity: 0, duration: 0.7, ease: 'power2.inOut', transformOrigin: 'left center' }, '<')
          .to('.ribbon-right-strip', { scaleX: 0, opacity: 0, duration: 0.7, ease: 'power2.inOut', transformOrigin: 'right center' }, '<');

        tl.to('.flap-left', { rotateY: -165, duration: 1.5, ease: 'power3.inOut' }, 'open')
          .to('.flap-right', { rotateY: 165, duration: 1.5, ease: 'power3.inOut' }, 'open')
          .from('.invite-inside', { scale: 0.92, opacity: 0.4, duration: 1.3, ease: 'power2.out' }, '-=1.2');

        ScrollTrigger.create({
            trigger: '.invite-section',
            start: 'top center',
            onEnter: () => gsap.to('.invite-scroll-hint', { opacity: 0.6, duration: 0.5 }),
            onLeave: () => gsap.to('.invite-scroll-hint', { opacity: 0, duration: 0.4 })
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  RSVP HOLD BUTONU
    // ═════════════════════════════════════════════════════════════════════════

    function initHoldButton() {
        const btn = document.getElementById('holdBtn');
        const fill = document.getElementById('progressBar');
        const label = document.querySelector('.button-text');
        const successMsg = document.getElementById('successMessage');
        if (!btn) return;

        let isConfirmed = false, isProcessing = false;
        let startTime = null, rafId = null, timeoutId = null, isTouch = false;

        const onStart = (e) => {
            if (isConfirmed || isProcessing) return;
            if (e.type === 'touchstart') isTouch = true;
            else if (e.type === 'mousedown' && isTouch) return;

            e.preventDefault();
            startTime = Date.now();

            gsap.to(btn, {
                scale: 1.05,
                boxShadow: '0 10px 35px rgba(139,58,58,0.5)',
                duration: CONFIG.HOLD_DURATION / 1000,
                ease: 'power1.in'
            });

            const tick = () => {
                const elapsed = Date.now() - startTime;
                const pct = Math.min(elapsed / CONFIG.HOLD_DURATION, 1);
                fill.style.width = (pct * 100) + '%';
                label.style.color = pct > 0.5 ? '#fefcf8' : 'var(--burgundy)';
                if (pct < 1) rafId = requestAnimationFrame(tick);
            };
            rafId = requestAnimationFrame(tick);
            timeoutId = setTimeout(onConfirm, CONFIG.HOLD_DURATION);
        };

        const onStop = () => {
            if (isConfirmed || isProcessing) return;
            clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
            gsap.to(btn, { scale: 1, boxShadow: '0 6px 18px rgba(74,26,28,0.15)', duration: 0.3 });
            gsap.to(fill, { width: '0%', duration: 0.4 });
            label.style.color = 'var(--burgundy)';
        };

        const onConfirm = () => {
            if (isConfirmed) return;
            isProcessing = true;
            isConfirmed = true;
            cancelAnimationFrame(rafId);

            fill.style.width = '100%';
            label.style.color = '#fefcf8';
            label.textContent = 'Onaylandı ✦';
            btn.style.cursor = 'default';

            gsap.to(btn, {
                scale: 1,
                boxShadow: '0 8px 25px rgba(139,58,58,0.35)',
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            });

            if (window.confetti) {
                confetti({
                    particleCount: 200,
                    spread: 120,
                    origin: { y: 0.65 },
                    colors: ['#8b3a3a', '#c9818c', '#c9a961', '#7a8471', '#fefcf8']
                });
                setTimeout(() => {
                    confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0.1, y: 0.7 }, colors: ['#c9818c', '#c9a961'] });
                    confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 0.9, y: 0.7 }, colors: ['#8b3a3a', '#a8b29c'] });
                }, 300);
            }

            if (successMsg) successMsg.style.display = 'block';
        };

        btn.addEventListener('mousedown', onStart);
        btn.addEventListener('mouseup', onStop);
        btn.addEventListener('mouseleave', onStop);
        btn.addEventListener('touchstart', onStart, { passive: false });
        btn.addEventListener('touchend', onStop);
        btn.addEventListener('touchcancel', onStop);
    }

})();