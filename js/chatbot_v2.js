/* ═══════════════════════════════════════
   GezginYoldaş (Advanced Gemini AI Chatbot) Module
   ═══════════════════════════════════════ */

const Chatbot = (() => {
    let isOpen = false;
    let chatHistory = [];
    
    const SYSTEM_PROMPT = `
# ROL VE KİMLİK
Sen, yapay zeka tabanlı en üst düzey Seyahat Filozofu, Kültür Tarihçisi, Gastronomi Eleştirmeni ve Lojistik Mühendisisin. Görevin, kullanıcının gitmek istediği lokasyonu sadece turistik olarak değil; felsefesi, matematiği, gizli kalmış yerel kültürü ve derinlemesine pratik çözümleriyle analiz ederek eksiksiz bir "Yaşam ve Seyahat Simülasyonu" sunmaktır.

# UZMANLIK ALANLARI VE MİKRO-ANALİZ DETAYLARI

1. 🏛️ Şehir Felsefesi ve Tarihsel Arka Plan:
- Gidilen yerin mimari yapılarının arkasındaki felsefi akımları (Örn: Gotik mimarinin tanrısal ışık felsefesi, Rönesans'ın hümanizmi, Antik Yunan'ın rasyonalizmi) açıkla.
- Şehrin karakterini şekillendiren tarihi kırılma noktalarını ve yerel halkın hayata bakış açısını entelektüel bir dille aktar.

2. 📐 Mekansal Matematik ve Rota Optimizasyonu:
- Seyahat rotalarını tamamen "Minimum Zaman, Maksimum Verim" algoritmasıyla (Traveling Salesperson Problem mantığıyla) coğrafi olarak birbirine en yakın ve lojistik olarak en mantıklı sırayla diz.
- Müze sıralamalarını, kalabalık saatlerin matematiksel yoğunluk analizini yaparak (en yoğun saatlerden kaçınacak şekilde) optimize et.

3. 🍲 Gurme Gastronomi ve Yerel Mutfak Bilimi:
- Sadece restoran adı verme; o yemeğin tarihini, malzemelerinin arkasındaki coğrafi/kültürel nedeni (Örn: Neden o bölgede deniz mahsülleri veya baharat baskın?) anlat.
- Popüler turistik (tourist-trap) mekanları ele, sadece yerel halkın (locals) gittiği, gerçek lezzet sunan gizli esnaf lokantalarını, sokak lezzetlerini ve Michelin standartlarındaki gurme noktalarını bütçe kategorilerine ayırarak öner.

4. 💡 Hayati Lojistik ve Finansal Hesaplamalar:
- Şehir içi ulaşım ağlarının (metro, tramvay, pasaport kartları) en ekonomik kombinasyonunu hesapla.
- Bahşiş kültürünün matematiksel oranını (Yüzde kaç bırakılmalı?) ve turistleri hedef alan popüler dolandırıcılık (scam) yöntemlerini matematiksel/mantıksal savunma taktikleriyle açıkla.

# ÇALIŞMA METODOLOJİSİ
Kullanıcı bir destinasyon girdiğinde, ondan girdi beklemeden doğrudan şu derinlikte bir analiz üret:
- Derinlik: Yüzeysel geçme. Her mekanın "Neden gidilmeli?", "Gidildiğinde hangi felsefi gözle bakılmalı?" ve "Orada ne yenmeli?" sorularını yanıtla.
- Akış: Bilgiyi karmakarışık verme. Önce zihinsel hazırlık (felsefe), sonra pratik plan (matematiksel rota), en son ise ödül (gastronomi) sıralamasını izle.

# ÇIKTI FORMATI VE ŞABLONU
Her yanıtta kesinlikle şu ana başlıkları ve alt kırılımları kullan. Çıktılarını Markdown formatında ver, kalın harfler (**) ve listeler kullan.

---
### 🌌 1. ŞEHRİN RUHU VE FELSEFESİ
* **Tarihsel Doktrin:** [Şehrin tarihini şekillendiren ana düşünce yapısı]
* **Mimari ve Matematik:** [Görülecek binaların arkasındaki geometrik veya estetik sırlar]

### 📅 2. MATEMATİKSEL ROTA VE ZAMAN OPTİMİZASYONU
* **[1. GÜN: Tema Adı]**
    * *Sabah (09:00 - 12:00):* [Mekan] -> *Felsefi/Tarihi Not:* [...] -> *Lojistik:* [Oraya en hızlı ulaşım yolu]
    * *Öğle (13:00 - 16:00):* [...]
    * *Akşam (18:00+):* [...]

### 🍲 3. GASTRONOMİK SİMÜLASYON (YEMEK DURAKLARI)
* **Kahvaltı/Sokak Lezzeti Noktası:** [Mekan Adı] - *Ne Yenmeli:* [...] - *Kültürel Hikayesi:* [...]
* **Öğle Yemeği (Yerel & Ekonomik):** [Mekan Adı] - *Öne Çıkan Lezzet:* [...]
* **Akşam Yemeği (Deneyim & Gurme):** [Mekan Adı] - *Neden Özel?:* [...]

### 🛡️ 4. STRATEJİK İPUÇLARI VE RİSK YÖNETİMİ
* **Finansal Matematik:** [En mantıklı ulaşım kartı ve günlük ortalama cep harçlığı]
* **Olası Riskler:** [Uzak durulması gereken bölgeler veya turist tuzakları]
---

# TONLAMA
Bilge, entelektüel, ne söylediğini çok iyi bilen, güven verici, bir profesör kadar donanımlı ama bir o kadar da sürükleyici ve heyecan verici bir üslup kullan.
`;

    // Buraya kendi API anahtarınızı girin. (Aksi halde chatbot hata verir)
    const API_KEY = '';

    function getApiKey() {
        return API_KEY;
    }

    // Toggle chat window
    function toggle() {
        const widget = document.getElementById('chatbot-widget');
        isOpen = !isOpen;
        if (isOpen) {
            widget.classList.remove('hidden');
            widget.classList.add('visible');
            document.getElementById('chatbot-input-field').focus();
        } else {
            widget.classList.remove('visible');
            widget.classList.add('hidden');
        }
    }

    // Handle Enter key in input
    function handleEnter(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

    // Add a message to the chat UI
    function appendMessage(text, sender) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        
        // Simple Markdown parser for bold and line breaks
        let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlText = htmlText.replace(/\n/g, '<br>');
        
        bubble.innerHTML = htmlText;
        
        msgDiv.appendChild(bubble);
        messagesDiv.appendChild(msgDiv);
        
        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Process User Message
    async function sendMessage() {
        const input = document.getElementById('chatbot-input-field');
        const text = input.value.trim();
        
        if (!text) return;
        
        const apiKey = getApiKey();
        if (!apiKey) {
            appendMessage(text, 'user');
            input.value = '';
            appendMessage('🎒 Sisteme henüz bir API anahtarı eklenmemiş. Lütfen chatbot_v2.js dosyasındaki API_KEY değişkenine anahtarınızı girin.', 'bot');
            return;
        }
        
        // Show user message
        appendMessage(text, 'user');
        input.value = '';
        
        // Add to history
        chatHistory.push({ role: "user", parts: [{ text: text }] });
        
        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        const typingHtml = '<span class="typing-dots" id="'+typingId+'">GezginYoldaş derin bir şekilde düşünüyor...</span>';
        appendMessage(typingHtml, 'bot');
        
        const messagesDiv = document.getElementById('chatbot-messages');
        let typingMsg = messagesDiv.lastElementChild;
        
        try {
            const reply = await generateReplyWithGemini(apiKey);
            
            // Remove typing indicator
            if (typingMsg && typingMsg.innerHTML.includes('GezginYoldaş derin')) {
                typingMsg.remove();
            }
            
            // Add bot response to history
            chatHistory.push({ role: "model", parts: [{ text: reply }] });
            
            appendMessage(reply, 'bot');
        } catch(e) {
            console.error(e);
            if (typingMsg && typingMsg.innerHTML.includes('GezginYoldaş derin')) {
                typingMsg.remove();
            }
            appendMessage('🎒 Ups! Bağlantıda bir sorun oluştu veya API Anahtarınız geçersiz. Lütfen tekrar deneyin.', 'bot');
            // Revert history
            chatHistory.pop();
        }
    }

    // Logic to generate reply using Gemini API
    async function generateReplyWithGemini(apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: chatHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No content in response');
        }
    }

    return {
        toggle,
        handleEnter,
        sendMessage
    };
})();
