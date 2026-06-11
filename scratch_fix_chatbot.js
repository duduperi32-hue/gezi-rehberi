const fs = require('fs');

let c = fs.readFileSync('js/chatbot.js', 'utf8');

// Fix unicode
c = c.replace(/Oyi dǬYǬnǬyor\.\.\./g, 'Oyi düşünüyor...');
c = c.replace(/Y- /g, '🤖 ');
c = c.replace(/AraYtrd/g, 'Araştırdı');
c = c.replace(/anlayamadm/g, 'anlayamadım');
c = c.replace(/bulamadm/g, 'bulamadım');
c = c.replace(/stersen/g, 'İstersen');
c = c.replace(/mekann adn/g, 'mekanın adını');
c = c.replace(/Ǭcret/g, 'ücret');
c = c.replace(/ak/g, 'açık');
c = c.replace(/kapal/g, 'kapalı');
c = c.replace(/ulaYm/g, 'ulaşım');
c = c.replace(/nasl/g, 'nasıl');
c = c.replace(/ile/g, 'ilçe');
c = c.replace(/detayl/g, 'detaylı');
c = c.replace(/tatl/g, 'tatlı');
c = c.replace(/ay/g, 'çay');
c = c.replace(/dǬrǬm/g, 'dürüm');
c = c.replace(/hzl/g, 'hızlı');
c = c.replace(/SǬleymaniye/g, 'Süleymaniye');
c = c.replace(/grmelisiniz/g, 'görmelisiniz');
c = c.replace(/iin/g, 'için');
c = c.replace(/amlca/g, 'Çamlıca');
c = c.replace(/seeneklerdir/g, 'seçeneklerdir');
c = c.replace(/nerebilirim/g, 'önerebilirim');
c = c.replace(/Yuralar/g, 'şuraları');
c = c.replace(/nerim/g, 'önerim');
c = c.replace(/oluYtu/g, 'oluştu');
c = c.replace(/ocretsiz/g, 'Ücretsiz');

// Fix lastChild bug
c = c.replace('const typingMsg = messagesDiv.lastChild;', 'const typingMsg = messagesDiv.lastElementChild;');

fs.writeFileSync('js/chatbot.js', c);
