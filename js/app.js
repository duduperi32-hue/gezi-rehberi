/* ═══════════════════════════════════════
   App Module — Main application logic
   ═══════════════════════════════════════ */

const App = (() => {
    // ── State ──
    let currentLang = 'tr';
    let currentScreen = 'welcome';
    let quizResult = null;

    // ── Initialize ──
    function init() {
        // Load saved language
        const savedLang = localStorage.getItem('istanbul-guide-lang');
        if (savedLang && translations[savedLang]) {
            currentLang = savedLang;
        }

        // Apply language
        setLanguage(currentLang);

        // Create background particles
        createParticles();

        // Close language menu on outside click
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('lang-dropdown');
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (currentScreen === 'quiz') {
                if (e.key === 'ArrowRight' || e.key === 'Enter') {
                    Quiz.nextQuestion();
                } else if (e.key === 'ArrowLeft') {
                    Quiz.prevQuestion();
                }
            }
        });
    }

    // ── Screen management ──
    function switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active');
            currentScreen = screenId;
            window.scrollTo(0, 0);
        }
    }

    // ── Go to home ──
    function goHome() {
        switchScreen('welcome');
    }

    // ── Start quiz ──
    function startQuiz() {
        switchScreen('quiz');
        Quiz.init();
    }

    // ── Show result ──
    function showResult(result) {
        quizResult = result;
        switchScreen('result');
        renderResult(result);
    }

    // ── Render result screen ──
    function renderResult(result) {
        const profile = result.profile;
        const lang = currentLang;

        // Icon
        document.getElementById('result-icon').textContent = profile.icon;

        // Title
        const titleKey = `profile_${profile.key}_name`;
        document.getElementById('result-title').textContent = t(titleKey);

        // Description
        const descKey = `profile_${profile.key}_desc`;
        document.getElementById('result-desc').textContent = t(descKey);

        // Score bars
        const scoresContainer = document.getElementById('result-scores');
        const catLabels = ['cat_history', 'cat_food', 'cat_nature', 'cat_shopping', 'cat_adventure'];
        const catClasses = ['cat-history', 'cat-food', 'cat-nature', 'cat-shopping', 'cat-adventure'];

        scoresContainer.innerHTML = result.scores.map((score, i) => `
            <div class="score-row">
                <span class="score-label">${t(catLabels[i])}</span>
                <div class="score-bar-bg">
                    <div class="score-bar-fill ${catClasses[i]}" style="width: 0%"></div>
                </div>
                <span class="score-value">${score}%</span>
            </div>
        `).join('');

        // Animate score bars
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.querySelectorAll('.score-bar-fill').forEach((bar, i) => {
                    bar.style.width = result.scores[i] + '%';
                });
            }, 300);
        });
    }

    // ── Show guide ──
    function showGuide() {
        if (quizResult) {
            Guide.setProfile(quizResult);
        }
        switchScreen('guide');
        Guide.init();
    }

    // ── Language management ──
    function setLanguage(lang) {
        if (!translations[lang]) return;

        currentLang = lang;
        localStorage.setItem('istanbul-guide-lang', lang);

        // Update HTML dir for RTL
        const meta = langMeta[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = meta.dir;

        // Update navbar language display
        document.getElementById('current-flag').textContent = meta.flag;
        document.getElementById('current-lang-name').textContent = meta.code;

        // Update active states in dropdown
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === lang);
        });

        // Update active states in welcome grid
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Apply all translations
        applyTranslations();

        // Close dropdown
        document.getElementById('lang-dropdown').classList.remove('open');

        // Refresh active modules
        Quiz.refreshLanguage();
        Guide.refreshLanguage();
    }

    // ── Apply translations to DOM ──
    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = t(key);
            if (text) {
                el.textContent = text;
            }
        });
    }

    // ── Translation helper ──
    function t(key) {
        return (translations[currentLang] && translations[currentLang][key])
            || translations.tr[key]
            || key;
    }

    // ── Toggle language menu ──
    function toggleLangMenu() {
        document.getElementById('lang-dropdown').classList.toggle('open');
    }

    // ── Get current language ──
    function getCurrentLang() {
        return currentLang;
    }

    // ── Background particles ──
    function createParticles() {
        const container = document.getElementById('bg-particles');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 10;
            const opacity = Math.random() * 0.3 + 0.1;

            particle.style.cssText = `
                width: ${size}px; height: ${size}px;
                left: ${left}%; opacity: ${opacity};
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;

            // Randomize color
            const colors = [
                'rgba(28, 181, 224, 0.15)',
                'rgba(171, 71, 188, 0.12)',
                'rgba(232, 168, 56, 0.12)',
                'rgba(46, 204, 113, 0.1)'
            ];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(particle);
        }
    }

    // ── Public API ──
    return {
        init,
        switchScreen,
        goHome,
        startQuiz,
        showResult,
        showGuide,
        setLanguage,
        toggleLangMenu,
        getCurrentLang
    };
})();

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
