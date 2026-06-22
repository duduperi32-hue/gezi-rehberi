// ═══════════════════════════════════════════
//  Firebase Authentication — Istanbul Guide
// ═══════════════════════════════════════════

// ⚠️  Firebase projenizi https://console.firebase.google.com adresinden oluşturun
// ve aşağıdaki config değerlerini kendi projenizin değerleriyle değiştirin.
// Şu an localStorage tabanlı yedek sistem aktiftir.
const firebaseConfig = {
  apiKey: "AIzaSyCrVqcaLf0ZaMo6kJy5c1BywKTFxT-V5Aw",
  authDomain: "istanbul-guide-app.firebaseapp.com",
  projectId: "istanbul-guide-app",
  storageBucket: "istanbul-guide-app.appspot.com",
  messagingSenderId: "1062347819284",
  appId: "1:1062347819284:web:0a4e5f6c7b8d9e0f1a2b3c"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseUser = null;
let useFirebase = false; // Will be set true if Firebase initializes OK


function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseAuth = firebase.auth();
      firebaseDb = firebase.firestore ? firebase.firestore() : null;
      useFirebase = true;

      // Listen to auth state changes
      firebaseAuth.onAuthStateChanged(function(user) {
        firebaseUser = user;
        if (user) {
          onFirebaseLogin(user);
        } else {
          onFirebaseLogout();
        }
      });
      console.log('✅ Firebase initialized');
      return true;
    }
  } catch (e) {
    console.warn('⚠️ Firebase not available, using localStorage fallback:', e.message);
    useFirebase = false;
  }
  return false;
}

function onFirebaseLogin(user) {
  const displayName = user.displayName || user.email.split('@')[0];
  const greeting = document.getElementById('user-greeting');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');

  if (greeting) {
    greeting.textContent = `👤 ${displayName}`;
    greeting.style.display = 'inline-block';
  }
  if (btnLogin) btnLogin.style.display = 'none';
  if (btnLogout) btnLogout.style.display = 'inline-flex';

  localStorage.setItem('istanbul_user', displayName);
}

function onFirebaseLogout() {
  const greeting = document.getElementById('user-greeting');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');

  if (greeting) {
    greeting.textContent = '';
    greeting.style.display = 'none';
  }
  if (btnLogin) btnLogin.style.display = 'inline-flex';
  if (btnLogout) btnLogout.style.display = 'none';

  localStorage.removeItem('istanbul_user');
}

// ── Firebase Register ──
App.doRegister = async function() {
  const user = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value.trim();

  if (!user || !email || !pass) {
    App.showAuthAlert('Lütfen tüm alanları doldurun.');
    return;
  }

  if (pass.length < 6) {
    App.showAuthAlert('Şifre en az 6 karakter olmalıdır.');
    return;
  }

  if (firebaseAuth) {
    // Firebase registration
    try {
      const registerBtn = document.querySelector('#view-register .btn-primary');
      if (registerBtn) { registerBtn.disabled = true; registerBtn.textContent = 'Kayıt olunuyor...'; }

      const cred = await firebaseAuth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: user });

      // Save to Firestore if available
      if (firebaseDb) {
        await firebaseDb.collection('users').doc(cred.user.uid).set({
          username: user,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      App.closeLogin();
      App.showAuthAlert('');
      if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = 'Kayıt Ol'; }
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Bu e-posta adresi zaten kayıtlı.',
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter olmalı.'
      };
      App.showAuthAlert(msgs[err.code] || err.message);
      const registerBtn = document.querySelector('#view-register .btn-primary');
      if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = 'Kayıt Ol'; }
    }
  } else {
    // Fallback to localStorage
    const db = App.getUsersDb ? App.getUsersDb() : JSON.parse(localStorage.getItem('istanbul_users') || '{}');
    if (db[user]) { App.showAuthAlert('Bu kullanıcı adı zaten alınmış.'); return; }
    db[user] = { email, password: pass };
    localStorage.setItem('istanbul_users', JSON.stringify(db));
    localStorage.setItem('istanbul_user', user);
    App.closeLogin();
    App.checkLogin && App.checkLogin();
  }
};

// ── Firebase Login ──
App.doLogin = async function() {
  const emailOrUser = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();

  if (!emailOrUser || !pass) {
    App.showAuthAlert('Lütfen kullanıcı adı/e-posta ve şifre girin.');
    return;
  }

  if (firebaseAuth) {
    try {
      const loginBtn = document.querySelector('#view-login .btn-primary');
      if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'Giriş yapılıyor...'; }

      // If it's not an email, try to find email from Firestore
      let email = emailOrUser;
      if (!emailOrUser.includes('@')) {
        // Try localStorage fallback first
        const db = JSON.parse(localStorage.getItem('istanbul_users') || '{}');
        if (db[emailOrUser]) {
          email = db[emailOrUser].email;
        } else {
          // Try Firestore
          if (firebaseDb) {
            const snap = await firebaseDb.collection('users').where('username', '==', emailOrUser).limit(1).get();
            if (!snap.empty) {
              email = snap.docs[0].data().email;
            } else {
              App.showAuthAlert('Kullanıcı bulunamadı.');
              if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Giriş Yap'; }
              return;
            }
          } else {
            App.showAuthAlert('Kullanıcı bulunamadı. E-posta adresiyle deneyin.');
            if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Giriş Yap'; }
            return;
          }
        }
      }

      await firebaseAuth.signInWithEmailAndPassword(email, pass);
      App.closeLogin();
      if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Giriş Yap'; }
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'Bu e-posta ile kayıtlı hesap bulunamadı.',
        'auth/wrong-password': 'Hatalı şifre!',
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/too-many-requests': 'Çok fazla deneme. Lütfen bir süre bekleyin.'
      };
      App.showAuthAlert(msgs[err.code] || err.message);
      const loginBtn = document.querySelector('#view-login .btn-primary');
      if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Giriş Yap'; }
    }
  } else {
    // Fallback to localStorage
    const db = JSON.parse(localStorage.getItem('istanbul_users') || '{}');
    if (!db[emailOrUser]) { App.showAuthAlert('Kullanıcı bulunamadı. Lütfen kayıt olun.'); return; }
    if (db[emailOrUser].password !== pass) { App.showAuthAlert('Hatalı şifre!'); return; }
    localStorage.setItem('istanbul_user', emailOrUser);
    App.closeLogin();
    App.checkLogin && App.checkLogin();
  }
};

// ── Firebase Logout ──
App.doLogout = async function() {
  if (firebaseAuth && firebaseAuth.currentUser) {
    await firebaseAuth.signOut();
  } else {
    localStorage.removeItem('istanbul_user');
    onFirebaseLogout();
  }
};

// ── Initialize on load ──
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initFirebase, 100);
});
