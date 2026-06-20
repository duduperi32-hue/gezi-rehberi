/* ═══════════════════════════════════════
   GezginYoldaş (Offline AI Simulation) Module
   ═══════════════════════════════════════ */

const Chatbot = (() => {
    let isOpen = false;

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

    function handleEnter(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

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
        
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage() {
        const input = document.getElementById('chatbot-input-field');
        const text = input.value.trim();
        
        if (!text) return;
        
        appendMessage(text, 'user');
        input.value = '';
        
        const typingId = 'typing-' + Date.now();
        const typingHtml = `<span class="typing-dots" id="${typingId}">GezginYoldaş felsefi bir analiz yapıyor...</span>`;
        appendMessage(typingHtml, 'bot');
        
        const messagesDiv = document.getElementById('chatbot-messages');
        let typingMsg = messagesDiv.lastElementChild;
        
        // Simulate thinking time
        setTimeout(() => {
            if (typingMsg && typingMsg.innerHTML.includes('felsefi bir analiz')) {
                typingMsg.remove();
            }
            const reply = generateOfflineReply(text.toLowerCase());
            appendMessage(reply, 'bot');
        }, 1500);
    }

    function generateOfflineReply(query) {
        // Basic QA
        if (query.includes('merhaba') || query.includes('selam')) {
            return `**Merhaba!** Ben GezginYoldaş. Dünyanın en bilgili seyahat filozofu ve yerel rehberiyim. Bana İstanbul'dan bir mekan adı söyleyin, size onun sadece turistik tarafını değil; felsefesini, matematiksel rotasını ve en iyi gastronomi sırlarını anlatayım!`;
        }

        // Search in places
        const allPlaces = [...places, ...foodPlaces];
        let foundPlace = null;
        for (const p of allPlaces) {
            const name = (p.name.tr || p.name).toLowerCase();
            const words = name.split(' ').filter(w => w.length > 3);
            if (query.includes(p.id) || words.some(word => query.includes(word))) {
                foundPlace = p;
                break;
            }
        }

        if (foundPlace) {
            const isFood = foodPlaces.includes(foundPlace);
            const name = foundPlace.name.tr || foundPlace.name;
            const desc = typeof foundPlace.shortDesc === 'object' ? foundPlace.shortDesc.tr : foundPlace.shortDesc;
            const fee = typeof foundPlace.entranceFee === 'object' ? foundPlace.entranceFee.tr : (foundPlace.entranceFee || (foundPlace.priceLevel === 0 ? 'Ücretsiz' : '₺'.repeat(foundPlace.priceLevel)));
            
            return `
### 🌌 1. ŞEHRİN RUHU VE FELSEFESİ
* **Tarihsel Doktrin:** ${name}, İstanbul'un karmaşık ve çok katmanlı kimliğinin bir yansımasıdır. Burası sadece bir mekan değil, ${desc}
* **Mimari ve Matematik:** Bu yapının/mekanın varoluşu, çevresindeki kaosa inat bir geometri ve düzen arayışıdır. İnsanlığın kalıcılık tutkusunun bir kanıtıdır.

### 📅 2. MATEMATİKSEL ROTA VE ZAMAN OPTİMİZASYONU
* **[1. GÜN: ${name} Keşfi]**
    * *Lojistik:* Minimum zaman kaybı için oraya toplu taşımayla sabah 09:00 civarı gitmeniz (kalabalık algoritmasına göre) en verimli olanıdır.
    * *Maliyet:* ${fee}

### 🍲 3. GASTRONOMİK SİMÜLASYON (YEMEK DURAKLARI)
* **Öğle Yemeği (Yerel & Ekonomik):** Eğer ${name} civarındaysanız, turistik tuzaklardan uzaklaşıp yerel halkın yediği arka sokak esnaf lokantalarını bulun. Deniz mahsülleri veya baharatın coğrafi sentezini mutlaka hissedin!

### 🛡️ 4. STRATEJİK İPUÇLARI VE RİSK YÖNETİMİ
* **Finansal Matematik:** Şehir içi ulaşımda kesinlikle bir "İstanbulkart" edinin; nakit ödemeden %50 daha karlıdır.
* **Olası Riskler:** Girişte size sıra atlatacağını iddia eden 'sahte rehberlere' matematiksel olarak inanmayın; resmi gişeyi kullanın.
            `;
        }

        // Generic fallback with persona
        return `
Dostum, bana bahsettiğin lokasyonu net olarak veritabanımda eşleştiremedim. Ancak Seyahat Filozofu olarak sana şu tavsiyeyi verebilirim:
**Rotasızlık da bazen en iyi rotadır.** Şehrin sokaklarında kaybolmak, mimarinin felsefesini anlamanın en iyi yoludur.

Bana doğrudan "Ayasofya", "Galata" veya "Kapalıçarşı" gibi net destinasyonlar söylersen, senin için o bölgenin derinlemesine *Yaşam ve Seyahat Simülasyonunu* hemen hesaplayabilirim!
        `;
    }

    return {
        toggle,
        handleEnter,
        sendMessage
    };
})();
