// Extra Features: Login, Theme, Draggable Chatbot

// --- LOGIN SYSTEM ---
App.openLogin = function() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('login-modal').classList.add('visible');
};

App.closeLogin = function() {
    document.getElementById('login-modal').classList.remove('visible');
    document.getElementById('login-modal').classList.add('hidden');
};

App.doLogin = function() {
    const user = document.getElementById('login-username').value.trim();
    if (user) {
        localStorage.setItem('istanbul_user', user);
        App.closeLogin();
        App.checkLogin();
    }
};

App.doLogout = function() {
    localStorage.removeItem('istanbul_user');
    App.checkLogin();
};

App.checkLogin = function() {
    const user = localStorage.getItem('istanbul_user');
    if (user) {
        document.getElementById('user-greeting').innerText = `Merhaba, ${user}`;
        document.getElementById('user-greeting').style.display = 'inline';
        document.getElementById('btn-login').style.display = 'none';
        document.getElementById('btn-logout').style.display = 'inline-block';
    } else {
        document.getElementById('user-greeting').style.display = 'none';
        document.getElementById('btn-login').style.display = 'inline-block';
        document.getElementById('btn-logout').style.display = 'none';
    }
};

// --- THEME SYSTEM ---
App.changeTheme = function(theme) {
    localStorage.setItem('istanbul_theme', theme);
    const root = document.documentElement;
    
    // Reset to default before applying new
    root.style.removeProperty('--bg-primary');
    root.style.removeProperty('--bg-secondary');
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-secondary');
    root.style.removeProperty('--color-accent');

    // Reset text colors to defaults if we switch out of coffee
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--bg-glass');
    root.style.removeProperty('--border-subtle');

    if (theme === 'sunset') {
        root.style.setProperty('--bg-primary', '#2D142C');
        root.style.setProperty('--bg-secondary', '#510A32');
        root.style.setProperty('--color-primary', '#EE4540');
        root.style.setProperty('--color-secondary', '#C026D3');
        root.style.setProperty('--color-accent', '#801336');
    } else if (theme === 'forest') {
        root.style.setProperty('--bg-primary', '#0A1C16');
        root.style.setProperty('--bg-secondary', '#112B22');
        root.style.setProperty('--color-primary', '#2ECC71');
        root.style.setProperty('--color-secondary', '#F1C40F');
        root.style.setProperty('--color-accent', '#27AE60');
    } else if (theme === 'ocean') {
        root.style.setProperty('--bg-primary', '#001B2E');
        root.style.setProperty('--bg-secondary', '#012A4A');
        root.style.setProperty('--color-primary', '#01497C');
        root.style.setProperty('--color-secondary', '#2A6F97');
        root.style.setProperty('--color-accent', '#468FAF');
    } else if (theme === 'midnight') {
        root.style.setProperty('--bg-primary', '#0D0D0D');
        root.style.setProperty('--bg-secondary', '#1A1A1A');
        root.style.setProperty('--color-primary', '#707070');
        root.style.setProperty('--color-secondary', '#A0A0A0');
        root.style.setProperty('--color-accent', '#404040');
    } else if (theme === 'coffee') {
        root.style.setProperty('--bg-primary', '#FDFBF7');
        root.style.setProperty('--bg-secondary', '#F5EBE0');
        root.style.setProperty('--color-primary', '#8B5A2B'); // Brown
        root.style.setProperty('--color-secondary', '#CD853F'); // Peru
        root.style.setProperty('--color-accent', '#D2B48C'); // Tan
        root.style.setProperty('--text-primary', '#3E2723'); // Dark Brown
        root.style.setProperty('--text-secondary', '#5D4037');
        root.style.setProperty('--bg-glass', 'rgba(139, 90, 43, 0.1)'); // light brown glass
        root.style.setProperty('--border-subtle', 'rgba(139, 90, 43, 0.2)');
    }
};

App.checkTheme = function() {
    const theme = localStorage.getItem('istanbul_theme') || 'default';
    document.getElementById('theme-selector').value = theme;
    App.changeTheme(theme);
};

// --- DRAGGABLE CHATBOT (OYI) ---
const makeDraggable = (element, handle) => {
    let isDragging = false;
    let offsetX, offsetY;

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        // Fix the absolute position so it stays exactly where it is initially
        if (getComputedStyle(element).position !== 'absolute') {
            const rect = element.getBoundingClientRect();
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
        }
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.transition = 'all var(--dur) var(--ease-bounce)';
            // Disable transition for top/left to avoid sliding animations on drag
            element.style.transitionProperty = 'opacity, transform';
        }
    });
};

// Initialization hook
document.addEventListener('DOMContentLoaded', () => {
    App.checkLogin();
    App.checkTheme();
    
    const widget = document.getElementById('chatbot-widget');
    const header = document.getElementById('chatbot-header');
    if (widget && header) {
        makeDraggable(widget, header);
    }
});
