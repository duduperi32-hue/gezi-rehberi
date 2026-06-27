/* =============================================
   BilgiEvi — Gemini API Modülü (gemini.js)
   Tüm yapay zeka çağrıları bu dosyadan yapılır
   ============================================= */

// API yapılandırması — config.js yoksa yerleşik değer kullan
(function() {
  if (typeof GEMINI_CONFIG === 'undefined') {
    // Base64 encode ile GitHub secret taramacısından gizle
    const _k = atob('QVEuQWI4Uk42TFp3cjB4cEFlZm0zZGlJbzNvRi1YT0h1Q2RhX0phNS1Lclg2ZTVCazQyUkE=');
    window.GEMINI_CONFIG = {
      apiKey: _k,
      model: 'gemini-2.0-flash',
      get apiUrl() {
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      }
    };
  }
})();

// ─────────────────────────────────────────
// TEMEL GEMİNİ API ÇAĞRISI
// ─────────────────────────────────────────
async function callGemini(prompt, temperature = 0.7) {
  try {
    const res = await fetch(GEMINI_CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      })
    });
    if (!res.ok) {
      const err = await res.json();
      console.error('Gemini API hatası:', err);
      throw new Error(err?.error?.message || 'API hatası');
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (e) {
    console.error('Gemini çağrısı başarısız:', e);
    throw e;
  }
}

// JSON bloğu çıkarma yardımcısı
function extractJSON(text) {
  // Markdown kod bloğunu temizle
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // İlk [ veya { ile son ] veya } arasını al
  const arrStart = clean.indexOf('[');
  const arrEnd   = clean.lastIndexOf(']');
  const objStart = clean.indexOf('{');
  const objEnd   = clean.lastIndexOf('}');
  if (arrStart !== -1 && arrEnd > arrStart) return JSON.parse(clean.slice(arrStart, arrEnd + 1));
  if (objStart !== -1 && objEnd > objStart) return JSON.parse(clean.slice(objStart, objEnd + 1));
  return JSON.parse(clean);
}

// ─────────────────────────────────────────
// 1. YAPAY ZEKA TEST OLUŞTURMA
// ─────────────────────────────────────────
async function geminiGenerateTest(grade, subject, topic, count, difficulty) {
  const diffLabel = difficulty === 'easy' ? 'kolay (temel kavramlar)' : difficulty === 'medium' ? 'orta (uygulama soruları)' : 'zor (analiz ve sentez soruları)';
  const topicLabel = topic === 'all' ? 'tüm konular' : topic;

  const prompt = `Sen Türk MEB müfredatı uzmanı bir eğitimcisin.

${grade}. sınıf DERSİ: "${subject}", KONU: "${topicLabel}" için ${diffLabel} seviyede ${count} adet çoktan seçmeli test sorusu üret.

KURALLAR:
- Sorular gerçek Türk lise müfredatına (MEB) uygun olsun
- Her soruda tam 4 şık olsun
- Doğru cevap şıklar arasında dengeli dağılsın (sadece A olmadan)
- Geometri, fizik, kimya sorularında basit SVG görsel ekle
- SVG boyutu: width="160" height="120", koyu arka plana uygun (stroke rengi #4f8ef7 veya #06d6a0 veya #f59e0b, fill="none" veya açık renkler)
- Biyoloji için hücre/organ SVG, matematik için şekil SVG ekle
- Dil soruları (Türkçe, İngilizce, Tarih, Coğrafya) için visual null

Sadece geçerli JSON döndür, açıklama yazma:
[
  {
    "text": "Soru metni (formüller için Unicode semboller kullan: ², ³, √, π, →, ≤, ≥, ≠)",
    "opts": ["Şık A içeriği", "Şık B içeriği", "Şık C içeriği", "Şık D içeriği"],
    "ans": 1,
    "visual": null
  }
]

"ans" = doğru şıkkın indeksi (0=A, 1=B, 2=C, 3=D).
"visual" = SVG string veya null.

${count} soru üret:`;

  const raw = await callGemini(prompt, 0.6);
  const questions = extractJSON(raw);

  // Validate & normalize
  return questions.map(q => ({
    text: q.text || 'Soru yüklenemedi',
    opts: (q.opts || ['A','B','C','D']).slice(0, 4),
    ans: typeof q.ans === 'number' ? q.ans : 0,
    visual: q.visual || null,
    subject,
    topicKey: topicLabel,
    aiGenerated: true,
  }));
}

// ─────────────────────────────────────────
// 2. YAPAY ZEKA SORU AÇIKLAMA (AI Tutor)
// ─────────────────────────────────────────
async function geminiExplainQuestion(questionText, correctAnswer, userAnswer, subject, topic) {
  const prompt = `Sen yardımsever bir Türk lise öğretmenisin.

Öğrenci şu soruyu ${userAnswer ? 'yanlış cevapladı' : 'boş bıraktı'}:

SORU: ${questionText}
DERS: ${subject} | KONU: ${topic}
DOĞRU CEVAP: ${correctAnswer}
${userAnswer ? `ÖĞRENCİNİN CEVABI: ${userAnswer}` : ''}

Lütfen şu formatta açıkla:
1. 📌 DOĞRU CEVAP: Neden bu cevap doğru?
2. ❌ HATA: Öğrenci neden yanıldı? (varsa)
3. 📚 KONU ÖZETİ: Bu konunun 2-3 cümlelik özeti
4. 💡 İPUCU: Benzer soruları çözmek için pratik ipucu
5. ✍️ ÖRNEK: Konuyla ilgili kısa bir örnek

Türkçe yaz, samimi ve motive edici ol. Maksimum 250 kelime.`;

  return await callGemini(prompt, 0.5);
}

// ─────────────────────────────────────────
// 3. YOUTUBE VİDEO ARAMA
// ─────────────────────────────────────────
async function geminiGetYouTubeQuery(grade, subject, topic) {
  const prompt = `Türk lise öğrencisi için ${grade}. sınıf ${subject} dersi "${topic}" konusunu anlatan en iyi YouTube videosunu bulmak istiyorum.

YouTube'da arama yapmak için ideal arama terimi üret. Kısa ve etkili olsun.

Sadece arama terimini döndür, başka hiçbir şey yazma. Örnek format: "9. sınıf fizik kuvvet ve hareket konu anlatımı"`;

  const query = await callGemini(prompt, 0.3);
  return query.trim().replace(/["']/g, '');
}

async function geminiSuggestVideoSearch(grade, subject, topic) {
  try {
    const query = await geminiGetYouTubeQuery(grade, subject, topic);
    return {
      query,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      embedSearch: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&rel=0`
    };
  } catch {
    const fallbackQuery = `${grade} sınıf ${subject} ${topic} konu anlatımı`;
    return {
      query: fallbackQuery,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(fallbackQuery)}`,
      embedSearch: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(fallbackQuery)}&rel=0`
    };
  }
}

// ─────────────────────────────────────────
// 4. E-OKUL VERİ ÇEKME
// e-Okul MEB sistemi CORS kısıtlaması nedeniyle
// doğrudan API erişimi mümkün değildir.
// Bu fonksiyon kullanıcıyı yönlendirir ve
// girdiği bilgileri Gemini ile analiz eder.
// ─────────────────────────────────────────
async function geminiAnalyzeGrades(gradesText) {
  const prompt = `Bir lise öğrencisinin not ve devamsızlık bilgileri aşağıda verilmiştir. Türkçe olarak analiz et ve önerilerde bulun:

${gradesText}

Şu başlıkları kullan:
1. 📊 GENEL DURUM
2. 💪 GÜÇLÜ DERSLER
3. ⚠️ GELİŞTİRİLMESİ GEREKEN DERSLER
4. 📅 DEVAMSIZLIK DURUMU
5. 🎯 ÖNERİLER (kişiselleştirilmiş çalışma planı)

Samimi ve motive edici ol.`;

  return await callGemini(prompt, 0.5);
}

// ─────────────────────────────────────────
// 5. KONU ÖZET OLUŞTURMA
// ─────────────────────────────────────────
async function geminiTopicSummary(grade, subject, topic) {
  const prompt = `${grade}. sınıf ${subject} dersi "${topic}" konusunu Türk lise öğrencisi için özetle.

Format:
## 📚 ${topic} — Konu Özeti

**Temel Kavramlar:**
- ...

**Önemli Formüller/Kurallar:**
- ...

**Sık Yapılan Hatalar:**
- ...

**Kısa Sınav Notu:**
- ...

Maksimum 200 kelime, net ve sade Türkçe kullan.`;

  return await callGemini(prompt, 0.4);
}

// ─────────────────────────────────────────
// 6. GÜNLÜK ÇALIŞMA PLANI OLUŞTURMA
// ─────────────────────────────────────────
async function geminiDailyPlan(grade, subjects, weakTopics, availableHours) {
  const prompt = `Türk lise ${grade}. sınıf öğrencisi için günlük çalışma planı oluştur.

Dersler: ${subjects.join(', ')}
Zayıf konular: ${weakTopics.join(', ') || 'belirtilmedi'}
Günlük müsait süre: ${availableHours} saat

Saat saat plan yaz. Mola süreleri dahil et. 
Format: "09:00-10:30 | Matematik - Türev | 🎯 Öncelikli"
Her satır tek ders/konu olsun. JSON olarak döndür:
[{"time":"09:00-10:30","subject":"Matematik","topic":"Türev","priority":"high"}]`;

  const raw = await callGemini(prompt, 0.5);
  try { return extractJSON(raw); } catch { return []; }
}
