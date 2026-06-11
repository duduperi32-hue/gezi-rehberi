/* ═══════════════════════════════════════
   Chatbot Module — Soru-Cevap Asistanı
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
    function sendMessage() {
        const input = document.getElementById('chatbot-input-field');
        const text = input.value.trim();
        
        if (!text) return;
        
        // Show user message
        appendMessage(text, 'user');
        input.value = '';
        
        // Simulate bot thinking time
        setTimeout(() => {
            const reply = generateReply(text.toLowerCase());
            appendMessage(reply, 'bot');
        }, 500);
    }

    // Logic to generate reply based on user input
    function generateReply(query) {
        const allPlaces = [...places, ...foodPlaces];
        let foundPlace = null;

        // Let's do a smarter word-based match on the TR names and ID
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
                return `<strong>${name}</strong> için fiyat/ücret bilgisi: ${fee}`;
            }
            
            if (query.includes('saat') || query.includes('açık') || query.includes('kapalı') || query.includes('zaman')) {
                const hours = typeof foundPlace.visitHours === 'object' ? foundPlace.visitHours.tr : foundPlace.visitHours;
                return `<strong>${name}</strong> ziyaret saatleri: ${hours}`;
            }
            
            if (query.includes('nerede') || query.includes('ulaşım') || query.includes('nasıl') || query.includes('ilçe')) {
                const dist = foundPlace.district || '';
                const trans = typeof foundPlace.transport === 'object' ? foundPlace.transport.tr : (foundPlace.transport || '');
                return `<strong>${name}</strong>, ${dist} ilçesinde yer alıyor. Ulaşım: ${trans}`;
            }

            // General Info
            const desc = typeof foundPlace.shortDesc === 'object' ? foundPlace.shortDesc.tr : foundPlace.shortDesc;
            return `<strong>${name}:</strong> ${desc}<br><small>Daha detaylı bilgi (saat, ücret, ulaşım) sorabilirsiniz.</small>`;
        }

        // 2. Is the user asking for recommendations?
        if (query.includes('kebap') || query.includes('et')) {
            return recommend('kebap');
        }
        if (query.includes('tatlı') || query.includes('lokum') || query.includes('baklava')) {
            return recommend('tatlı');
        }
        if (query.includes('kahve') || query.includes('çay')) {
            return recommend('kafe');
        }
        if (query.includes('fast food') || query.includes('dürüm') || query.includes('hamburger')) {
            return recommend('hızlı');
        }
        if (query.includes('cami')) {
            return "Sultanahmet Camii veya Süleymaniye Camii'ni kesinlikle görmelisiniz!";
        }
        if (query.includes('manzara') || query.includes('tepe')) {
            return "Manzara için Galata Kulesi, Çamlıca Tepesi veya Pierre Loti Tepesi harika seçeneklerdir.";
        }

        // 3. Fallback
        return "Üzgünüm, sorunuzu tam anlayamadım. Bir mekanın adını söyleyerek 'Ayasofya nerede?' veya 'En iyi kebap nerede?' gibi sorular sorabilirsiniz.";
    }

    // Helper for recommendations
    function recommend(type) {
        let matches = [];
        if (type === 'kebap') {
            matches = foodPlaces.filter(p => (typeof p.cuisine === 'object' ? p.cuisine.tr : p.cuisine).toLowerCase().includes('kebap') || p.tier === 1);
        } else if (type === 'tatlı') {
            matches = foodPlaces.filter(p => p.tier === 4);
        } else if (type === 'kafe') {
            matches = foodPlaces.filter(p => p.tier === 3);
        } else if (type === 'hızlı') {
            matches = foodPlaces.filter(p => p.tier === 2);
        }

        if (matches.length > 0) {
            const names = matches.slice(0, 3).map(m => `<strong>${m.name.tr || m.name}</strong>`).join(', ');
            return `Size şuraları önerebilirim: ${names}.`;
        }
        return "Bu kategoride bir önerim yok maalesef.";
    }

    return {
        toggle,
        handleEnter,
        sendMessage
    };
})();
