/* ═══════════════════════════════════════
   Quiz Module — 15 Question Personality Test
   ═══════════════════════════════════════ */

const Quiz = (() => {
    // ── State ──
    let currentQuestion = 0;
    let answers = new Array(15).fill(-1);

    // ── Category scoring weights ──
    // Categories: history, food, nature, shopping, adventure
    // Each option distributes points across categories
    const questionScoring = [
        // Q1: What do you enjoy most on vacation?
        { a: [3,0,0,0,1], b: [0,3,0,0,1], c: [0,0,3,0,1], d: [0,0,0,3,1] },
        // Q2: Food preference?
        { a: [1,3,0,0,0], b: [0,3,0,0,1], c: [0,2,1,0,1], d: [0,2,0,0,2] },
        // Q3: Budget level?
        { a: [1,1,1,0,1], b: [1,1,1,1,1], c: [1,1,1,1,1], d: [1,2,0,2,0] },
        // Q4: Walking tolerance?
        { a: [0,1,0,1,0], b: [1,1,1,1,1], c: [2,0,2,0,1], d: [2,0,2,0,3] },
        // Q5: Travel companion?
        { a: [2,1,1,0,3], b: [1,2,2,1,0], c: [1,1,1,2,0], d: [0,1,0,2,2] },
        // Q6: Time of day preference?
        { a: [3,0,2,0,1], b: [1,2,1,1,0], c: [1,2,1,1,1], d: [0,1,0,2,3] },
        // Q7: Photography importance?
        { a: [2,0,2,0,2], b: [2,0,1,0,1], c: [0,1,0,1,1], d: [0,2,2,0,0] },
        // Q8: History & architecture interest?
        { a: [3,0,0,0,1], b: [2,0,0,0,1], c: [1,0,1,0,1], d: [0,1,1,2,1] },
        // Q9: Trying local cuisine?
        { a: [0,3,0,0,2], b: [0,2,0,0,1], c: [0,1,0,1,0], d: [0,0,0,1,0] },
        // Q10: Sea and Bosphorus activities?
        { a: [1,1,3,0,1], b: [0,1,2,0,1], c: [0,0,0,1,0], d: [1,0,0,1,0] },
        // Q11: Shopping?
        { a: [0,0,0,3,1], b: [0,0,0,2,0], c: [0,0,0,1,0], d: [1,1,1,0,1] },
        // Q12: How many days?
        { a: [1,1,0,0,0], b: [1,1,1,1,1], c: [2,2,2,1,2], d: [2,2,2,2,3] },
        // Q13: Crowded or calm?
        { a: [1,1,0,2,0], b: [1,1,0,1,0], c: [1,0,3,0,1], d: [0,0,1,0,3] },
        // Q14: Art and museums?
        { a: [3,0,0,0,1], b: [2,0,0,0,0], c: [1,0,0,0,1], d: [0,1,1,1,1] },
        // Q15: Travel style?
        { a: [2,1,0,1,0], b: [1,1,1,1,1], c: [0,1,1,0,3], d: [0,1,2,1,0] }
    ];

    // ── Profile types based on highest category ──
    const profileTypes = [
        { key: 'historian', icon: '🏛️', color: '#E8A838' },    // history
        { key: 'foodie', icon: '🍽️', color: '#E85D4A' },       // food
        { key: 'nature', icon: '🌿', color: '#2ECC71' },        // nature
        { key: 'shopper', icon: '🛍️', color: '#AB47BC' },       // shopping
        { key: 'explorer', icon: '🧭', color: '#1CB5E0' }       // adventure
    ];

    const categoryKeys = ['history', 'food', 'nature', 'shopping', 'adventure'];

    // ── Get translated text ──
    function t(key) {
        const lang = App.getCurrentLang();
        return (translations[lang] && translations[lang][key]) || translations.tr[key] || key;
    }

    // ── Initialize quiz ──
    function init() {
        currentQuestion = 0;
        answers = new Array(15).fill(-1);
        renderQuestion();
    }

    // ── Render current question ──
    function renderQuestion() {
        const qIndex = currentQuestion;
        const qNum = String(qIndex + 1).padStart(2, '0');
        const letters = ['A', 'B', 'C', 'D'];
        const optionKeys = ['a', 'b', 'c', 'd'];

        // Update progress
        const progress = ((qIndex + 1) / 15) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-text').textContent = `${qIndex + 1} / 15`;
        document.getElementById('question-number').textContent = qNum;

        // Update question text
        const questionKey = `q${qIndex + 1}_text`;
        document.getElementById('question-text').textContent = t(questionKey);

        // Render options
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        optionKeys.forEach((key, i) => {
            const optionKey = `q${qIndex + 1}_${key}`;
            const btn = document.createElement('button');
            btn.className = 'quiz-option' + (answers[qIndex] === i ? ' selected' : '');
            btn.onclick = () => selectOption(i);
            btn.innerHTML = `
                <span class="option-letter">${letters[i]}</span>
                <span class="option-text">${t(optionKey)}</span>
            `;
            optionsContainer.appendChild(btn);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('btn-quiz-prev');
        const nextBtn = document.getElementById('btn-quiz-next');

        prevBtn.disabled = qIndex === 0;
        nextBtn.disabled = answers[qIndex] === -1;

        // Change next button text on last question
        const nextBtnText = nextBtn.querySelector('span');
        if (qIndex === 14) {
            nextBtnText.textContent = t('quiz_finish');
        } else {
            nextBtnText.textContent = t('quiz_next');
        }

        // Trigger animation
        const quizBody = document.getElementById('quiz-body');
        quizBody.style.animation = 'none';
        quizBody.offsetHeight; // Force reflow
        quizBody.style.animation = '';
    }

    // ── Select option ──
    function selectOption(index) {
        answers[currentQuestion] = index;

        // Update visual state
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((opt, i) => {
            opt.classList.toggle('selected', i === index);
        });

        // Enable next button
        document.getElementById('btn-quiz-next').disabled = false;

        // Auto-advance after a short delay
        setTimeout(() => {
            if (currentQuestion < 14) {
                nextQuestion();
            }
        }, 400);
    }

    // ── Next question ──
    function nextQuestion() {
        if (answers[currentQuestion] === -1) return;

        if (currentQuestion < 14) {
            currentQuestion++;
            renderQuestion();
        } else {
            // Finish quiz
            calculateResults();
        }
    }

    // ── Previous question ──
    function prevQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    }

    // ── Calculate results ──
    function calculateResults() {
        const scores = [0, 0, 0, 0, 0]; // history, food, nature, shopping, adventure

        answers.forEach((answer, qIndex) => {
            if (answer === -1) return;
            const optKey = ['a', 'b', 'c', 'd'][answer];
            const scoring = questionScoring[qIndex][optKey];
            scoring.forEach((pts, catIndex) => {
                scores[catIndex] += pts;
            });
        });

        // Find max category
        let maxIndex = 0;
        let maxScore = scores[0];
        scores.forEach((score, i) => {
            if (score > maxScore) {
                maxScore = score;
                maxIndex = i;
            }
        });

        // Normalize scores to percentages
        const totalMax = Math.max(...scores);
        const normalizedScores = scores.map(s => totalMax > 0 ? Math.round((s / totalMax) * 100) : 0);

        const result = {
            profileIndex: maxIndex,
            profile: profileTypes[maxIndex],
            scores: normalizedScores,
            rawScores: scores,
            categories: categoryKeys
        };

        App.showResult(result);
    }

    // ── Re-render for language change ──
    function refreshLanguage() {
        if (document.getElementById('screen-quiz').classList.contains('active')) {
            renderQuestion();
        }
    }

    // ── Public API ──
    return {
        init,
        nextQuestion,
        prevQuestion,
        refreshLanguage,
        getProfileTypes: () => profileTypes,
        getCategoryKeys: () => categoryKeys
    };
})();
