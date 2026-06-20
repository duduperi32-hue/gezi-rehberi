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

        // Custom Food & District Engine
        const q = query.toLowerCase();
        
        // Fatih + Döner
        if (q.includes('fatih') && (q.includes('döner') || q.includes('doner'))) {
            return `### 🍲 Fatih'te Gastronomik Simülasyon\n* **Önerilen Mekan:** Tarihi Karadeniz Dönercisi (Asım Usta) veya Dönerci Şahin Usta.\n* **Neden Burası?:** Fatih'in tarihi dokusunda, eti odun ateşinde ağır ağır pişen gerçek İstanbul dönerini bulabileceğiniz nadir noktalardandır. Turistik tuzaklardan uzak, tamamen yerel bir deneyim.`;
        }
        
        // İstiklal + Tantuni
        if ((q.includes('istiklal') || q.includes('beyoğlu') || q.includes('taksim')) && q.includes('tantuni')) {
            return `### 🍲 İstiklal'de Gastronomik Simülasyon\n* **Önerilen Mekan:** Suat Usta Mersin Tantuni (İstiklal Caddesi Ara Sokakları).\n* **Neden Burası?:** İstiklal Caddesi'nin kalabalık matematiğinden kaçıp, hızlı, lezzetli ve bütçe dostu gerçek Mersin usulü tantuni yiyebileceğiniz en iyi saklı duraklardan biridir.`;
        }

        // Kadıköy + Lahmacun
        if (q.includes('kadıköy') && q.includes('lahmacun')) {
            return `### 🍲 Kadıköy'de Gastronomik Simülasyon\n* **Önerilen Mekan:** Borsam Taşfırın veya Halil Lahmacun.\n* **Neden Burası?:** Çıtır hamuru ve odun ateşi kokusuyla Kadıköy sokak kültürünün temel taşlarındandır.`;
        }

        // Genel Kebap
        if (q.includes('kebap') || q.includes('et yeme')) {
            return `### 🍲 İstanbul'da Gurme Kebap\n* **Önerilen Mekan:** Şehzade Cağ Kebap (Sirkeci) veya Hamdi Restoran (Eminönü).\n* **Neden Burası?:** Geleneksel anadolu et kültürünü İstanbul'un en merkezi lojistik noktalarında en saf haliyle sunarlar.`;
        }

        // Genel Tatlı
        if (q.includes('tatlı') || q.includes('baklava') || q.includes('lokum')) {
            return `### 🍲 İstanbul'da Tatlı Matematiği\n* **Önerilen Mekan:** Karaköy Güllüoğlu (Baklava) veya Hafız Mustafa (Lokum/Sütlü Tatlı).\n* **Neden Burası?:** Yüzyıllık şeker ve şerbet formüllerini bozmadan günümüze taşıyan en güvenilir lezzet duraklarıdır.`;
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
### 🌌 1. ŞEHRİN RUHU VE TARİHİ
* **Kültürel Önemi:** ${name}, İstanbul'un çok katmanlı kimliğinin en güzel örneklerinden biridir. Kısaca: ${desc}
* **Gözlem Noktası:** Burayı gezerken sadece bir bina veya mekan olarak görmeyin; etrafınızdaki yerel halkın akışına ve yüzyıllık mimari detaylara odaklanın.

### 📅 2. MATEMATİKSEL ROTA VE LOJİSTİK
* **[Pratik Plan: ${name}]**
    * *Zamanlama:* Kalabalıktan kaçınmak için sabah 09:00 - 10:00 arası veya akşamüzeri gitmek zaman optimizasyonu açısından en iyisidir.
    * *Maliyet:* ${fee}

### 🍲 3. GASTRONOMİK SİMÜLASYON (YEMEK DURAKLARI)
* **Yerel Lezzet Önerisi:** ${name} civarındayken ana caddedeki turistik restoranlar yerine her zaman bir arka sokağa girin. Eğer bana "${name} etrafında ne yenir?" derseniz veya özel bir ilçe/yemek söylerseniz (Örn: Fatih'te döner) size nokta atışı yerler önerebilirim.

### 🛡️ 4. STRATEJİK İPUÇLARI VE RİSK YÖNETİMİ
* **Finansal Taktik:** Şehir içi ulaşımda İstanbulkart kullanın. Eğer çok yürüyecekseniz rahat ayakkabılar tercih edin.
* **Olası Riskler:** Aşırı turistik noktalarda menüsünde fiyat yazmayan yerlere oturmaktan kaçının.
            `;
        }

        // Generic fallback with persona
        return `
Dostum, bana bahsettiğin yeri veya yemeği tam çıkaramadım. Ancak Seyahat Uzmanı olarak sana en net tavsiyem şudur:
**Rotasızlık da bazen iyi bir rotadır.** 

Ama benden tam verim almak istersen bana doğrudan:
- "Ayasofya", "Galata" veya "Kapalıçarşı" gibi **mekan adları** söyle.
- "Fatih'te döner", "İstiklal'de tantuni", "Kadıköy'de lahmacun" veya "Kebap nerede yenir" gibi **ilçe ve yemek adları** söyle.

Sana en pratik ve bütçe dostu Yaşam Simülasyonunu hemen çizeyim!
        `;
    }

    return {
        toggle,
        handleEnter,
        sendMessage
    };
})();
