/* ═══════════════════════════════════════
   Oyi (Advanced AI Chatbot) Module
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
        bubble.innerHTML = text; // Allow HTML in bot responses
        
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
        
        // Show user message
        appendMessage(text, 'user');
        input.value = '';
        
        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        const typingHtml = '<span class="typing-dots">Oyi derin bir şekilde düşünüyor...</span>';
        appendMessage(typingHtml, 'bot');
        
        const messagesDiv = document.getElementById('chatbot-messages');
        const typingMsg = messagesDiv.lastElementChild;
        
        try {
            const reply = await generateReply(text.toLowerCase(), text);
            if (typingMsg) typingMsg.remove();
            appendMessage(reply, 'bot');
        } catch(e) {
            console.error(e);
            if (typingMsg) typingMsg.remove();
            appendMessage('🤖 Beklenmeyen bir ağ hatası oluştu, lütfen tekrar deneyin.', 'bot');
        }
    }

    // Logic to generate reply based on user input
    async function generateReply(query, originalQuery) {
        
        // 1. Math Evaluator (If user asks basic math)
        try {
            const mathMatch = query.match(/^([0-9\s\+\-\*\/\(\)\.]+)$/);
            if (mathMatch && query.match(/\d/)) {
                // Warning: eval is used only on strict mathematical strings
                const result = Function('"use strict";return (' + mathMatch[1] + ')')();
                if (!isNaN(result)) return `🤖 Matematik hesabım: <strong>${result}</strong>`;
            }
        } catch(e) {}

        // 2. Date and Time
        if (query.includes('saat kaç')) {
            return `🤖 Şu an saat: <strong>${new Date().toLocaleTimeString('tr-TR')}</strong>`;
        }
        if (query.includes('bugün günlerden ne') || query.includes('tarih ne')) {
            return `🤖 Bugünün tarihi: <strong>${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>`;
        }

        // 3. Conversation & Predefined FAQ Brain
        const faqBrain = {
            "(nasılsın|naber|ne haber)": "Ben yapay bir zeka asistanıyım, dolayısıyla her zaman mükemmelim! Sana İstanbul'u anlatmak veya aklındaki herhangi bir soruyu cevaplamak için buradayım. Sen nasılsın?",
            "(adın ne|sen kimsin|ismin ne)": "Benim adım <strong>Oyi</strong>! Ben İstanbul Gezi Rehberi'nin özel ve süper zeki asistanıyım. Sorularını cevaplamak için varım.",
            "(teşekkür|sağol|eyvallah)": "Rica ederim! Başka yardım edebileceğim bir konu varsa buradayım.",
            "(şaka yap|beni güldür|espri)": "Sana bir fıkra anlatayım: İki domates karşıdan karşıya geçiyormuş, biri diğerine 'dikkat et ezileceksin' demiş, diğeri 'hangimiiiiiiz splat!' 😂",
            "(havalimanından nasıl gidilir|havalimanı ulaşım)": "İstanbul Havalimanı'ndan (IST) Havaist otobüsleriyle (örneğin Aksaray, Taksim, Beşiktaş yönüne) veya M11 metrosuyla Gayrettepe'ye geçip oradan şehrin her yerine ulaşabilirsiniz. Sabiha Gökçen'den (SAW) ise Havabüs veya M4 metrosu en iyi seçenektir.",
            "(müze kart geçerli mi|müzekart)": "Topkapı Sarayı, İstanbul Arkeoloji Müzeleri, Galata Kulesi gibi Kültür Bakanlığı'na bağlı birçok yerde Müze Kart geçerlidir. Ancak Yerebatan Sarnıcı, Dolmabahçe Sarayı veya Galata Mevlevihanesi gibi belediye/Milli Saraylar işletmelerinde geçerli DEĞİLDİR.",
            "(nöbetçi eczane|hastane)": "Acil durumlar için eczanelerin camlarında bulunan nöbetçi eczane listelerine bakabilir veya internetten aratabilirsiniz. Acil durumlarda 112'yi aramalısınız.",
            "(taksi bulamıyorum|taksi uygulaması)": "İstanbul'da taksi bulmak bazen zordur. Mümkünse BiTaksi, Uber veya iTaksi gibi uygulamaları kullanmanızı, kısa mesafeler için metro ve tramvayı tercih etmenizi şiddetle tavsiye ederim.",
            "(akbil|istanbulkart)": "İstanbulkart'ı metro, tramvay, vapur iskelelerinde bulunan Biletmatik cihazlarından satın alabilir ve bakiye yükleyebilirsiniz. Kredi kartı geçen makinelere dikkat ediniz.",
            "(nereleri gez|nereye git|tavsiye ver|ne yap)": "İstanbul'da kesinlikle görmeniz gereken başyapıtlar şunlar: Sultanahmet bölgesindeki Ayasofya, Topkapı Sarayı ve Yerebatan Sarnıcı. Manzara için Galata Kulesi ve Çamlıca Tepesi. Eğer acıkırsanız 'kebap nerede yenir' diye sorabilirsiniz!",
            "(kebap|et yemek)": "Sizi harika lezzetlere yönlendireyim! Hamdi Restoran, Dürümzade veya Şehzade Cağ Kebap mükemmel seçeneklerdir.",
            "(tatlı|lokum|baklava)": "Tatlı kriziniz geldiyse Karaköy Güllüoğlu'nda baklava yiyebilir, Hafız Mustafa'dan lokum alabilir veya Saray Muhallebicisi'nde sütlü tatlı deneyebilirsiniz.",
            "(kahve|çay)": "Geleneksel Türk kahvesi için Mandabatmaz veya Fazıl Bey'in Türk Kahvesi şahanedir. Manzaralı bir çay isterseniz Pierre Loti Tepesi sizi bekliyor.",
            "(fast food|hızlı yemek|dürüm|hamburger)": "Hızlı ve lezzetli bir şeyler arıyorsanız Kızılkayalar'da Islak Hamburger, Borsam Taşfırın'da lahmacun veya Eminönü'nde meşhur Balık Ekmek yiyebilirsiniz."
        };

        for (const [pattern, answer] of Object.entries(faqBrain)) {
            const regex = new RegExp(pattern, "i");
            if (regex.test(query)) {
                return `🤖 ${answer}`;
            }
        }

        // 4. Local Places Database Match
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
            const name = foundPlace.name.tr || foundPlace.name;
            if (query.includes('ücret') || query.includes('fiyat') || query.includes('ne kadar') || query.includes('para')) {
                const fee = typeof foundPlace.entranceFee === 'object' ? foundPlace.entranceFee.tr : (foundPlace.entranceFee || (foundPlace.priceLevel === 0 ? 'Ücretsiz' : '₺'.repeat(foundPlace.priceLevel)));
                return `🤖 <strong>${name}</strong> için fiyat/ücret bilgisi: ${fee}`;
            }
            if (query.includes('saat') || query.includes('açık') || query.includes('kapalı') || query.includes('zaman')) {
                const hours = typeof foundPlace.visitHours === 'object' ? foundPlace.visitHours.tr : foundPlace.visitHours;
                return `🤖 <strong>${name}</strong> ziyaret saatleri: ${hours}`;
            }
            if (query.includes('nerede') || query.includes('ulaşım') || query.includes('nasıl') || query.includes('ilçe')) {
                const dist = foundPlace.district || '';
                const trans = typeof foundPlace.transport === 'object' ? foundPlace.transport.tr : (foundPlace.transport || '');
                return `🤖 <strong>${name}</strong>, ${dist} ilçesinde yer alıyor. Ulaşım: ${trans}`;
            }
            const desc = typeof foundPlace.shortDesc === 'object' ? foundPlace.shortDesc.tr : foundPlace.shortDesc;
            return `🤖 <strong>${name}:</strong> ${desc}<br><small>Daha detaylı bilgi (saat, ücret, ulaşım) sorabilirsiniz.</small>`;
        }

        // 5. DEEP WIKIPEDIA KNOWLEDGE RETRIEVAL (The Advanced AI Engine)
        try {
            // Using generator=search to get extracts for the top matches in a single request
            const searchUrl = `https://tr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(originalQuery)}&prop=extracts&exintro&explaintext&format=json&origin=*`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            
            if (searchData.query && searchData.query.pages) {
                const pages = Object.values(searchData.query.pages);
                // Sort by search rank index
                pages.sort((a, b) => a.index - b.index);
                
                // Get the top result (or top 2 if we want more detail)
                const topResult = pages[0];
                
                if (topResult && topResult.extract) {
                    let text = topResult.extract;
                    
                    // If the extract is extremely long, we crop it nicely at the end of a sentence
                    if (text.length > 500) {
                        const cropPos = text.indexOf('.', 450);
                        text = text.substring(0, cropPos > -1 ? cropPos + 1 : 500) + '..';
                    }
                    
                    return `🤖 <strong>Oyi'nin Geniş Veritabanı Araştırması (${topResult.title}):</strong><br><br>${text}<br><br><a href="https://tr.wikipedia.org/wiki/${encodeURIComponent(topResult.title)}" target="_blank" style="color:var(--accent-primary);font-size:13px;text-decoration:underline;font-weight:bold;">🔗 Vikipedi'de Daha Fazla Oku</a>`;
                }
            }
        } catch (e) {
            console.error('Advanced Wikipedia Retrieval Error:', e);
        }

        // 6. Absolute Fallback
        return "🤖 Ben Oyi! Bu soruyu devasa bilgi ağımda eşleştiremedim. Lütfen sorunuzu farklı kelimelerle ifade edin (örneğin '1453 yılında ne oldu' veya 'Ayasofya nerede')!";
    }

    return {
        toggle,
        handleEnter,
        sendMessage
    };
})();
