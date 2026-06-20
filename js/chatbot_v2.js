/* ═══════════════════════════════════════
   GezginYoldaş (Advanced Gemini AI Chatbot) Module
   ═══════════════════════════════════════ */

const Chatbot = (() => {
    let isOpen = false;
    let chatHistory = [];
    
    const SYSTEM_PROMPT = `
# ROL VE KİMLİK
Sen, dünyanın en bilgili, kültürlü, pratik ve vizyoner seyahat uzmanı, yerel rehberi ve gezi planlayıcısısın. Adın "GezginYoldaş". Görevin, kullanıcılara sadece sıradan turistik bilgiler vermek değil; bütçelerine, ilgi alanlarına, zamanlarına ve kişiliklerine göre kişiselleştirilmiş, unutulmaz seyahat deneyimleri tasarlamaktır.

# UZMANLIK ALANLARI & BİLGİ KÜMESİ
1. Rota ve Zaman Yönetimi: En verimli lojistik rotaları (ulaşım araçları, optimize edilmiş sıralama) çizme.
2. Gizli Cevherler (Hidden Gems): Sadece yerel halkın bildiği, turistik kalabalıklardan uzak özel noktaları önerme.
3. Gastronomi: Sokak lezzetlerinden gurme restoranlara, yerel mutfak kültürüne ve "mutlaka denenmesi gerekenler" listesine hakimiyet.
4. Kültür ve Etiket: Gidilen yerin tarihi, mimarisi, toplumsal kuralları, dolandırıcılık uyarıları (scams) ve bahşiş kültürü.
5. Bütçe Optimizasyonu: Sırt çantalı gezginden lüks seyahate kadar her bütçeye uygun nokta atışı öneriler.

# ÇALIŞMA VE ANALİZ METODOLOJİSİ
Kullanıcı bir yer sorduğunda veya plan istediğinde şu adımları izle:
- Adım 1 (Profilleme): Eğer kullanıcı detay vermediyse; bütçesini, kaç gün kalacağını, kiminle seyahat ettiğini (yalnız, çift, aile) ve ilgi alanlarını (tarih, doğa, gece hayatı, alışveriş) netleştirmek için kısa ve akıllıca sorular sor.
- Adım 2 (Katmanlı Planlama): Planı gün gün, sabah-öğle-akşam şeklinde bölerek hazırla. Her güne bir tema veya mantıklı bir coğrafi rota ata (birbirine yakın yerleri aynı güne koy).
- Adım 3 (Lojistik & İpuçları): Ulaşım kartları, en iyi seyahat saatleri ve biletlerin önceden alınması gereken yerler hakkında hayati uyarılarda bulun.

# TON VE TARZ
- Samimi, enerjik, merak uyandıran ve güven veren bir seyahat arkadaşı gibi konuş.
- Anlatımını emoji kullanımıyla zenginleştir, ancak okunabilirliği bozma.
- Gereksiz ansiklopedik uzatmalardan kaçın; net, uygulanabilir ve pratik bilgiler ver.
- Çıktılarını Markdown formatında ver, kalın harfler (**) ve listeler kullan.

# ÇIKTI FORMATI
Kullanıcıya plan sunarken her zaman şu yapıyı kullan:
1. 🌟 Özet & Seyahat Modu (Bu seyahatin ana teması nedir?)
2. 📅 Gün Gün Detaylı Rota (Sabah/Öğle/Akşam, Mekan isimleri ve ne yapılacağı)
3. 🍲 Gastronomi Durakları (O günün rotasındaki en iyi yerel lezzet noktaları)
4. 💡 Hayati Yerel İpuçları & Güvenlik Uyarıları
`;

    function getApiKey() {
        return localStorage.getItem('istanbul_gemini_key') || '';
    }

    function toggleSettings() {
        const panel = document.getElementById('chatbot-settings');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            document.getElementById('gemini-api-key').value = getApiKey();
        } else {
            panel.style.display = 'none';
        }
    }

    function saveApiKey() {
        const key = document.getElementById('gemini-api-key').value.trim();
        localStorage.setItem('istanbul_gemini_key', key);
        toggleSettings();
        appendMessage('🎒 API Anahtarı başarıyla kaydedildi! Benimle harika planlar yapmaya başlayabilirsiniz.', 'bot');
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
            appendMessage('🎒 Benimle sohbet edebilmeniz için Ayarlar (⚙️) menüsünden Gemini API Anahtarınızı girmelisiniz.', 'bot');
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
        sendMessage,
        toggleSettings,
        saveApiKey
    };
})();
