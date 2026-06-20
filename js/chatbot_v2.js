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
        setTimeout(async () => {
            if (typingMsg && typingMsg.innerHTML.includes('felsefi bir analiz')) {
                typingMsg.remove();
            }
            const reply = await generateOfflineReply(text.toLowerCase(), text);
            appendMessage(reply, 'bot');
        }, 1500);
    }

    async function fetchWikipediaSummary(query) {
        try {
            // Clean up common question words
            let subject = query.replace(/nedir|kimdir|kim|nerede|hakkında|bilgi|ver|anlat|öner/gi, '').trim();
            if (subject.length < 3) return null;

            // Search for best matching title
            const searchUrl = `https://tr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(subject)}&utf8=&format=json&origin=*`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            
            if (!searchData.query.search || searchData.query.search.length === 0) return null;
            
            const bestTitle = searchData.query.search[0].title;
            
            // Fetch summary of that title
            const url = `https://tr.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exintro&explaintext&titles=${encodeURIComponent(bestTitle)}&format=json&origin=*`;
            const res = await fetch(url);
            const data = await res.json();
            
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId === "-1") return null;
            
            return {
                title: bestTitle,
                extract: pages[pageId].extract
            };
        } catch (e) {
            console.error("Wiki Fetch Error:", e);
            return null;
        }
    }

    async function generateOfflineReply(query, originalText) {
        // Basic QA
        if (query.includes('merhaba') || query.includes('selam')) {
            return `**Merhaba!** Ben GezginYoldaş. Dünyanın en bilgili seyahat filozofu ve yerel rehberiyim. Bana İstanbul'dan bir mekan adı söyleyin, size onun sadece turistik tarafını değil; felsefesini, matematiksel rotasını ve en iyi gastronomi sırlarını anlatayım!`;
        }

        // --- DYNAMIC FOOD & DISTRICT ENGINE ---
        const q = query.toLowerCase();
        const allPlaces = [...places, ...foodPlaces];

        // 1. Extract District
        const uniqueDistricts = [...new Set(allPlaces.map(p => (p.district || '').toLowerCase()))].filter(Boolean);
        // Map common aliases
        const districtAliases = { 'istiklal': 'beyoğlu', 'taksim': 'beyoğlu', 'eminönü': 'eminönü', 'sultanahmet': 'sultanahmet', 'moda': 'kadıköy' };
        let reqDistrict = null;
        let reqDistrictName = null;

        for (const d of uniqueDistricts) {
            if (q.includes(d)) { reqDistrict = d; reqDistrictName = d; break; }
        }
        if (!reqDistrict) {
            for (const [alias, realDist] of Object.entries(districtAliases)) {
                if (q.includes(alias)) { reqDistrict = realDist; reqDistrictName = alias; break; }
            }
        }

        // 2. Extract Food Type
        const foodMap = {
            'sushi': ['sushi', 'suşi', 'japon', 'asya'],
            'döner': ['döner', 'doner'],
            'tantuni': ['tantuni'],
            'lahmacun': ['lahmacun'],
            'burger': ['burger', 'hamburger'],
            'pizza': ['pizza', 'italyan'],
            'kebap': ['kebap', 'kebab', 'et'],
            'tatlı': ['tatlı', 'baklava', 'lokum', 'künefe', 'dondurma'],
            'kahve': ['kahve', 'coffee', 'kafe'],
            'balık': ['balık', 'deniz ürünleri', 'seafood']
        };

        let reqFoodType = null;
        for (const [fType, keywords] of Object.entries(foodMap)) {
            if (keywords.some(k => q.includes(k))) {
                reqFoodType = fType;
                break;
            }
        }

        // 3. Dynamic Matching
        if (reqFoodType) {
            let matches = foodPlaces.filter(p => {
                const tags = (p.tags || []).join(' ').toLowerCase();
                const cuisineTr = p.cuisine && p.cuisine.tr ? p.cuisine.tr.toLowerCase() : '';
                return tags.includes(reqFoodType) || cuisineTr.includes(reqFoodType);
            });

            if (reqDistrict) {
                const districtMatches = matches.filter(p => p.district.toLowerCase() === reqDistrict);
                if (districtMatches.length > 0) {
                    districtMatches.sort((a, b) => b.rating - a.rating);
                    const best = districtMatches[0];
                    const name = best.name.tr || best.name;
                    const desc = best.longDesc ? (best.longDesc.tr || best.longDesc) : (best.shortDesc ? (best.shortDesc.tr || best.shortDesc) : '');
                    return `### 🍲 ${reqDistrictName.charAt(0).toUpperCase() + reqDistrictName.slice(1)}'de Gastronomik Simülasyon\n* **Önerilen Mekan (Puan: ${best.rating} ⭐):** ${name}\n* **Neden Burası?:** Lojistik olarak ${reqDistrictName} bölgesinde ${reqFoodType} yemek için en yüksek puana sahip, fiyat/performans algoritması en iyi yer burasıdır. ${desc}`;
                } else {
                    // Fallback to best overall for this food
                    if (matches.length > 0) {
                        matches.sort((a, b) => b.rating - a.rating);
                        const best = matches[0];
                        const name = best.name.tr || best.name;
                        return `### 🍲 Alternatif Gastronomik Rota\nDostum, **${reqDistrictName}** ilçesinde veritabanımda sana önerebileceğim harika bir **${reqFoodType}** mekanı bulamadım. Ancak İstanbul çapındaki en iyi alternatif şurası:\n\n* **Mekan:** ${name} (${best.district})\n* **Puanı:** ${best.rating} ⭐\n* **Neden Burası?:** Rotanı ${best.district}'ne çevirmeye kesinlikle değecek birinci sınıf bir deneyim sunar.`;
                    }
                }
            } else {
                // Food type asked but no district specified -> Best overall
                if (matches.length > 0) {
                    matches.sort((a, b) => b.rating - a.rating);
                    const best = matches[0];
                    const name = best.name.tr || best.name;
                    return `### 🍲 İstanbul'da En İyi ${reqFoodType.charAt(0).toUpperCase() + reqFoodType.slice(1)}\n* **Önerilen Mekan:** ${name} (${best.district})\n* **Puan:** ${best.rating} ⭐\n* **Neden Burası?:** Belirli bir ilçe söylemediğin için İstanbul genelinde ${reqFoodType} üzerine en yüksek puana sahip mekanı senin için analiz ettim.`;
                }
            }
        }

        // --- END OF DYNAMIC ENGINE ---

        // --- HISTORICAL & CULTURAL QUERY ENGINE ---
        const historyMap = {
            'sinan': {
                keywords: ['mimar sinan', 'sinanın', 'sinan', 'süleymaniye', 'mimar'],
                reply: `### 🏛️ Mimar Sinan'ın Matematiksel Dehası\nSüleymaniye Camii başta olmak üzere, Şehzadebaşı, Mihrimah Sultan ve Rüstem Paşa Camileri onun en büyük eserlerindendir. Sinan sadece bir mimar değil, yapıların akustiğini ve hava sirkülasyonunu asırlar öncesinden çözen bir mühendislik filozofudur. Şehirdeyseniz **Süleymaniye Camii**'ne gitmek lojistik ve kültürel açıdan en büyük önceliğiniz olmalıdır.`
            },
            'osmanli': {
                keywords: ['osmanlı', 'osmanli', 'osmanlıdan kalma', 'padişah', 'saray'],
                reply: `### 🏛️ Osmanlı'nın Tarihsel Doktrini\nİstanbul'daki Osmanlı mirası devasadır ve imparatorluğun psikolojik evrimini yansıtır:\n- **Klasik Dönem:** Topkapı Sarayı, Süleymaniye ve Sultanahmet Camii (Güç ve Asalet)\n- **Geç Dönem:** Dolmabahçe ve Çırağan Sarayı (Batılılaşma ve İhtişam)`
            },
            'bizans': {
                keywords: ['bizans', 'roma', 'bizanstan kalma', 'sarnıç', 'yerebatan'],
                reply: `### 🏛️ Bizans'ın Çok Katmanlı Ruhu\nİstanbul'da Roma/Bizans dönemine ait en ihtişamlı mühendislik kalıntıları şunlardır:\n- **Ayasofya (M.S. 537):** Dünya mimarlık tarihini değiştiren şaheser.\n- **Yerebatan Sarnıcı:** Suyun matematiğini yeraltına taşıyan efsanevi saray.\n- **Galata Kulesi:** Ceneviz/Bizans döneminin silüet harikası.`
            },
            'ataturk': {
                keywords: ['atatürk', 'mustafa kemal', 'ata'],
                reply: `### 🏛️ Cumhuriyet'in İzleri\nUlu Önder Mustafa Kemal Atatürk'ün İstanbul'daki en önemli izlerinden biri **Dolmabahçe Sarayı**'dır. 10 Kasım 1938'de hayata gözlerini yumduğu 71 numaralı oda, tarihi ve felsefi olarak ziyaret edilmesi gereken en özel noktalardandır.`
            }
        };

        for (const [key, data] of Object.entries(historyMap)) {
            if (data.keywords.some(k => q.includes(k))) {
                return data.reply;
            }
        }
        // --- END OF HISTORICAL ENGINE ---

        // Search in places (fallback for general location names)
        let foundPlace = null;
        for (const p of allPlaces) {
            const name = (p.name.tr || p.name).toLowerCase();
            const words = name.split(' ').filter(w => w.length > 3);
            if (q.includes(p.id) || words.some(word => q.includes(word))) {
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

        // --- WIKIPEDIA FALLBACK ENGINE ---
        const wikiData = await fetchWikipediaSummary(originalText);
        if (wikiData) {
            return `### 🏛️ Kültür ve Tarih Arşivi: ${wikiData.title}\n\n${wikiData.extract}\n\n*Not: Bu bilgiyi sana sunabilmek için devasa açık kütüphane arşivime (Wikipedia) bağlanıp okudum. Başka tarihi figürler, anıtlar veya yapılar sormaktan çekinme.*`;
        }

        // Generic fallback with persona
        return `
Dostum, bana bahsettiğin yeri, yemeği veya tarihi karakteri tam çıkaramadım. Ancak Seyahat Uzmanı olarak sana en net tavsiyem şudur:
**Rotasızlık da bazen iyi bir rotadır.** 

Ama benden tam verim almak istersen bana doğrudan:
- "Boğa heykeli", "Teoman kimdir" gibi **genel kültür** soruları sor.
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
