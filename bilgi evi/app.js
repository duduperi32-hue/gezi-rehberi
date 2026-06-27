/* =============================================
   BilgiEvi — App Logic (app.js)
   ============================================= */

// ─────────────────────────────────────────
// ROZET VERİSİ
// ─────────────────────────────────────────
const BADGES = [
  { id:'starter',  emoji:'🌱', name:'Çömez',          req:'Sisteme kayıt ol'                     },
  { id:'daily',    emoji:'☀️', name:'Günün Bilgesi',   req:'Günlük görevi tamamla'                },
  { id:'streak7',  emoji:'🔥', name:'7 Günlük Seri',   req:'7 gün üst üste çalış'                 },
  { id:'tests100', emoji:'📝', name:'Testkolik',       req:'100 test bitir'                        },
  { id:'top10',    emoji:'🥇', name:'Elit',            req:'İlk 10\'a gir',    threshold:10        },
  { id:'top30',    emoji:'🥈', name:'Gümüş Yıldız',   req:'İlk 30\'a gir',    threshold:30        },
  { id:'top50',    emoji:'🥉', name:'Bronz Kalkan',    req:'İlk 50\'ye gir',   threshold:50        },
  { id:'ai',       emoji:'🤖', name:'AI Avcısı',       req:'Yapay Zekaya Sor özelliğini kullan'   },
  { id:'perfect',  emoji:'💯', name:'Mükemmelci',      req:'Testten tam puan al'                  },
  { id:'founder',  emoji:'🏗️', name:'Kurucu',          req:'Temel atma modülünü tamamla'           },
];

// ─────────────────────────────────────────
// DERS & KONU HARİTASI (Sınıf seviyesine göre)
// ─────────────────────────────────────────
const GRADE_SUBJECTS = {
  '9': {
    'Matematik':  ['Kümeler ve Mantık', 'Gerçek Sayılar', 'Üçgenler', 'Dönüşüm Geometrisi', 'Veri Analizi'],
    'Fizik':      ['Fizik Bilimine Giriş', 'Madde ve Özellikleri', 'Kuvvet ve Hareket'],
    'Kimya':      ['Kimyaya Giriş', 'Atom Modelleri', 'Periyodik Sistem'],
    'Biyoloji':   ['Yaşam Bilimi', 'Hücre', 'Canlıların Sınıflandırılması'],
    'Türk Dili':  ['Güzel Sanatlarda Dil', 'Sözcükte Anlam', 'Cümle Yapısı'],
    'Tarih':      ['Tarih ve Zaman', 'Uygarlığın Doğuşu', 'İlk Türk Devletleri'],
    'Coğrafya':   ['Coğrafyanın Konusu', 'Harita Bilgisi', 'Dünya\'nın Şekli'],
    'İngilizce':  ['Simple Tenses', 'Vocabulary - Daily Life', 'Reading Skills'],
  },
  '10': {
    'Matematik':  ['2. Dereceden Denklemler', 'Polinomlar', 'Trigonometri', 'Analitik Geometri', 'İstatistik'],
    'Fizik':      ['Elektrik ve Manyetizma', 'Dalgalar', 'Optik', 'Basit Harmonik Hareket'],
    'Kimya':      ['Kimyasal Tepkimeler', 'Asitler ve Bazlar', 'Kimyasal Hesaplamalar'],
    'Biyoloji':   ['Sinir Sistemi', 'Endokrin Sistem', 'Üreme Sistemi', 'Fotosentez'],
    'Türk Dili':  ['Noktalama İşaretleri', 'Yazım Kuralları', 'Paragraf Analizi'],
    'Tarih':      ['Osmanlı Tarihi', 'Dünya Savaşları', 'Kurtuluş Savaşı'],
    'Coğrafya':   ['Türkiye\'nin Yer Şekilleri', 'İklim Tipleri', 'Nüfus'],
    'İngilizce':  ['Perfect Tenses', 'Conditionals', 'Passive Voice'],
  },
  '11': {
    'Matematik':  ['Türev', 'Uygulamalı Türev', 'İntegral\'e Giriş', 'Diziler', 'Logaritma'],
    'Fizik':      ['Çembersel Hareket', 'Tork ve Denge', 'Elektrik Akımı', 'Manyetizma'],
    'Kimya':      ['Organik Kimya', 'Elektrokimya', 'Reaksiyon Hızı'],
    'Biyoloji':   ['Kalıtım', 'DNA ve Gen', 'Ekosistem', 'Evrim'],
    'Türk Dili':  ['Sözcük Türleri', 'Anlatım Bozuklukları', 'Metin Türleri'],
    'Tarih':      ['Atatürk İlkeleri', 'Cumhuriyet Tarihi', 'Soğuk Savaş'],
    'Coğrafya':   ['Tarım', 'Sanayi ve Enerji', 'Ulaşım'],
    'İngilizce':  ['Modals', 'Reported Speech', 'Relative Clauses'],
  },
  '12': {
    'Matematik':  ['İntegral', 'Olasılık', 'İstatistik ve Dağılımlar', 'Limit', 'Karmaşık Sayılar'],
    'Fizik':      ['Modern Fizik', 'Atom Fiziği', 'Dalga-Parçacık İkilemi', 'Nükleer Fizik'],
    'Kimya':      ['Kimyasal Denge', 'Çözünürlük', 'Termokimya'],
    'Biyoloji':   ['Biyoteknoloji', 'Genetik Mühendisliği', 'Popülasyon Ekolojisi'],
    'Türk Dili':  ['Edebiyat Akımları', 'Yazılı Anlatım', 'Dil Bilgisi Testi'],
    'Tarih':      ['Yakın Dönem Türk Tarihi', 'Uluslararası İlişkiler', 'AİHM ve Demokrasi'],
    'Coğrafya':   ['Küresel Çevre Sorunları', 'Doğal Afetler', 'Jeopolitik'],
    'İngilizce':  ['Advanced Grammar', 'Essay Writing', 'Reading Comprehension'],
  },
};

// ─────────────────────────────────────────
// SORU BANKASI (Sınıf → Ders → Konu → Sorular)
// ─────────────────────────────────────────
const SVG = {
  triangle: `<svg width="120" height="100" viewBox="0 0 120 100" style="display:block;margin:12px auto">
    <polygon points="60,8 110,92 10,92" fill="none" stroke="#4f8ef7" stroke-width="2.5"/>
    <text x="55" y="5" fill="#06d6a0" font-size="12">A</text>
    <text x="112" y="97" fill="#06d6a0" font-size="12">B</text>
    <text x="2" y="97" fill="#06d6a0" font-size="12">C</text>
    <text x="50" y="60" fill="#f59e0b" font-size="11">5 cm</text>
  </svg>`,
  rightTriangle: `<svg width="120" height="100" viewBox="0 0 120 100" style="display:block;margin:12px auto">
    <polygon points="10,90 110,90 10,10" fill="none" stroke="#4f8ef7" stroke-width="2.5"/>
    <rect x="10" y="78" width="12" height="12" fill="none" stroke="#4f8ef7" stroke-width="2"/>
    <text x="50" y="100" fill="#06d6a0" font-size="11">a</text>
    <text x="0" y="50" fill="#f59e0b" font-size="11">b</text>
    <text x="58" y="48" fill="#8b5cf6" font-size="11">c</text>
  </svg>`,
  circle: `<svg width="110" height="110" viewBox="0 0 110 110" style="display:block;margin:12px auto">
    <circle cx="55" cy="55" r="44" fill="none" stroke="#4f8ef7" stroke-width="2.5"/>
    <line x1="55" y1="55" x2="99" y2="55" stroke="#06d6a0" stroke-width="2"/>
    <text x="70" y="50" fill="#06d6a0" font-size="12">r = 7</text>
    <circle cx="55" cy="55" r="3" fill="#8b5cf6"/>
  </svg>`,
  atom: `<svg width="120" height="100" viewBox="0 0 120 100" style="display:block;margin:12px auto">
    <ellipse cx="60" cy="50" rx="50" ry="20" fill="none" stroke="#4f8ef7" stroke-width="1.8"/>
    <ellipse cx="60" cy="50" rx="50" ry="20" fill="none" stroke="#8b5cf6" stroke-width="1.8" transform="rotate(60 60 50)"/>
    <ellipse cx="60" cy="50" rx="50" ry="20" fill="none" stroke="#06d6a0" stroke-width="1.8" transform="rotate(120 60 50)"/>
    <circle cx="60" cy="50" r="8" fill="#f59e0b"/>
    <circle cx="108" cy="50" r="4" fill="#4f8ef7"/>
    <circle cx="35" cy="17" r="4" fill="#8b5cf6"/>
    <circle cx="35" cy="83" r="4" fill="#06d6a0"/>
  </svg>`,
  cell: `<svg width="130" height="100" viewBox="0 0 130 100" style="display:block;margin:12px auto">
    <ellipse cx="65" cy="50" rx="58" ry="42" fill="none" stroke="#06d6a0" stroke-width="2"/>
    <ellipse cx="65" cy="50" rx="20" ry="16" fill="none" stroke="#8b5cf6" stroke-width="2"/>
    <text x="54" y="53" fill="#8b5cf6" font-size="10">Çekirdek</text>
    <circle cx="30" cy="35" r="4" fill="#4f8ef7" opacity="0.7"/>
    <circle cx="95" cy="60" r="4" fill="#4f8ef7" opacity="0.7"/>
    <circle cx="40" cy="72" r="3" fill="#f59e0b" opacity="0.7"/>
  </svg>`,
  forceArrow: `<svg width="140" height="80" viewBox="0 0 140 80" style="display:block;margin:12px auto">
    <rect x="40" y="28" width="44" height="24" rx="4" fill="rgba(79,142,247,0.2)" stroke="#4f8ef7" stroke-width="2"/>
    <text x="52" y="44" fill="#f0f4ff" font-size="12">Cisim</text>
    <line x1="84" y1="40" x2="126" y2="40" stroke="#06d6a0" stroke-width="2.5" marker-end="url(#arr)"/>
    <line x1="40" y1="40" x2="8" y2="40" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr2)"/>
    <text x="97" y="33" fill="#06d6a0" font-size="11">F₁=20N</text>
    <text x="10" y="33" fill="#f43f5e" font-size="11">F₂=8N</text>
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#06d6a0"/>
      </marker>
      <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#f43f5e"/>
      </marker>
    </defs>
  </svg>`,
  numberLine: `<svg width="200" height="50" viewBox="0 0 200 50" style="display:block;margin:12px auto">
    <line x1="10" y1="25" x2="190" y2="25" stroke="#4f8ef7" stroke-width="2"/>
    ${[-2,-1,0,1,2,3,4].map((n,i)=>`<line x1="${28+i*24}" y1="18" x2="${28+i*24}" y2="32" stroke="#4f8ef7" stroke-width="1.5"/><text x="${24+i*24}" y="15" fill="#f0f4ff" font-size="11">${n}</text>`).join('')}
    <circle cx="100" cy="25" r="5" fill="#06d6a0"/>
    <circle cx="76" cy="25" r="5" fill="#f43f5e"/>
  </svg>`,
  circuit: `<svg width="150" height="100" viewBox="0 0 150 100" style="display:block;margin:12px auto">
    <rect x="10" y="10" width="130" height="80" fill="none" stroke="#4f8ef7" stroke-width="2" rx="4"/>
    <text x="55" y="28" fill="#f59e0b" font-size="12">+ | −</text>
    <rect x="48" y="16" width="54" height="18" rx="3" fill="none" stroke="#f59e0b" stroke-width="1.8"/>
    <text x="18" y="56" fill="#06d6a0" font-size="10">R=10Ω</text>
    <line x1="10" y1="50" x2="40" y2="50" stroke="#06d6a0" stroke-width="2"/>
    <line x1="40" y1="40" x2="40" y2="60" stroke="#06d6a0" stroke-width="2"/>
    <line x1="60" y1="40" x2="60" y2="60" stroke="#06d6a0" stroke-width="2"/>
    <line x1="40" y1="40" x2="60" y2="40" stroke="#06d6a0" stroke-width="2"/>
    <line x1="40" y1="60" x2="60" y2="60" stroke="#06d6a0" stroke-width="2"/>
    <line x1="60" y1="50" x2="140" y2="50" stroke="#06d6a0" stroke-width="2"/>
  </svg>`,
};

const QUESTION_BANK = {
  '9': {
    'Matematik': {
      'Kümeler ve Mantık': [
        { text:'A = {1, 2, 3, 4} ve B = {3, 4, 5, 6} kümeleri verilmiştir. A ∩ B = ?', opts:['{ }','{ 3, 4 }','{ 1, 2, 5, 6 }','{ 1, 2, 3, 4, 5, 6 }'], ans:1 },
        { text:'A = {2, 4, 6, 8} ve B = {1, 2, 3, 4} kümelerinin birleşimi A ∪ B kaç elemanlıdır?', opts:['6','7','8','5'], ans:0 },
        { text:'"p ise q" önermesinin karşıt önermesi hangisidir?', opts:['q ise p','p değilse q değil','p değilse q','q değilse p değil'], ans:3 },
        { text:'Boş küme kaç kümesinin altkümesidir?', opts:['0','1','Sonsuz sayıda','Belirsiz'], ans:2 },
        { text:'Evrensel küme U = {1,2,3,4,5,6,7,8} ve A = {1,3,5,7} ise A\' (tümleyen) nedir?', opts:['{2,4,6,8}','{1,2,3,4}','{3,5,7}','{1,3,5}'], ans:0 },
        { text:'n(A) = 8, n(B) = 5, n(A∩B) = 3 ise n(A∪B) = ?', opts:['10','13','16','11'], ans:0 },
        { text:'"p ve q" önermesi ne zaman doğrudur?', opts:['p yanlış, q doğru','p doğru, q yanlış','Her ikisi de yanlış','Her ikisi de doğru'], ans:3 },
        { text:'A ⊆ B ve B ⊆ A ise ne söylenebilir?', opts:['A = B','A boş kümedir','B boş kümedir','A ve B birbirini kapsamaz'], ans:0 },
      ],
      'Gerçek Sayılar': [
        { text:'√18 + √8 - √2 = ?', opts:['4√2','5√2','6√2','3√2'], ans:0 },
        { text:'|−7| + |3| − |−4| = ?', opts:['6','8','14','10'], ans:0 },
        { text:'(√3 + √2)² = ?', opts:['5','5 + 2√6','7','5 - 2√6'], ans:1 },
        { text:'2³ × 2⁴ = ?', opts:['2⁷','2¹²','4⁷','2⁶'], ans:0 },
        { text:'Aşağıdakilerden hangisi irrasyonel sayıdır?', opts:['√9','√16','√25','√7'], ans:3 },
        { text:'3⁻² = ?', opts:['9','1/9','-9','-1/9'], ans:1 },
        { text:'(2³)² = ?', opts:['2⁵','2⁶','2⁸','64'], ans:1, note:'(2³)² = 2^(3×2) = 2⁶ = 64 (iki seçenek eş değer)' },
        { text:'4^(3/2) = ?', opts:['6','8','12','16'], ans:1 },
      ],
      'Üçgenler': [
        { text:'Bir üçgende en küçük kenar, en küçük açının karşısındadır. Bu kural adı nedir?', visual: SVG.triangle, opts:['Öklid Teoremi','Kenar-Açı Bağlantısı','Sinüs Teoremi','Kosinüs Teoremi'], ans:1 },
        { text:'İki kenarı 5 cm ve 8 cm olan üçgenin üçüncü kenarı kaç cm olabilir?', opts:['13 cm','3 cm','7 cm','15 cm'], ans:2 },
        { text:'Dik üçgende dik açıya karşı gelen kenar nasıl adlandırılır?', visual: SVG.rightTriangle, opts:['Dik kenar','Hipotenüs','Orta kenar','Küçük kenar'], ans:1 },
        { text:'Bir dik üçgende dik kenarlar 3 cm ve 4 cm ise hipotenüs kaç cm?', visual: SVG.rightTriangle, opts:['5 cm','7 cm','6 cm','4 cm'], ans:0 },
        { text:'Eşkenar üçgenin her iç açısı kaç derecedir?', opts:['45°','60°','90°','120°'], ans:1 },
        { text:'İkizkenar üçgendeki eşit açılar hangileridir?', opts:['Tavan açısı','Taban açıları','Tüm açılar','Hiçbiri'], ans:1 },
        { text:'Bir üçgenin dış açıları toplamı kaç derecedir?', opts:['180°','270°','360°','540°'], ans:2 },
        { text:'Üçgende medyan nedir?', opts:['Açıortay','Orta noktadan karşı köşeye çizilen doğru','İki açının tam ortasından geçen doğru','Yükseklik'], ans:1 },
      ],
    },
    'Fizik': {
      'Kuvvet ve Hareket': [
        { text:'Şekilde bir cisme 20 N sağa, 8 N sola kuvvet uygulanıyor. Bileşke kuvvet nedir?', visual: SVG.forceArrow, opts:['28 N sola','12 N sağa','12 N sola','28 N sağa'], ans:1 },
        { text:'Sürat ile hız arasındaki fark nedir?', opts:['İkisi aynıdır','Hız yönlüdür, sürat yönsüzdür','Sürat yönlüdür','Hız skaler büyüklüktür'], ans:1 },
        { text:'Sabit hızla giden bir cismin ivmesi kaçtır?', opts:['Maksimum','Artıyor','Sıfır','1 m/s²'], ans:2 },
        { text:'60 km/h sabit hızla giden araç 30 dakikada kaç km yol alır?', opts:['30 km','60 km','90 km','20 km'], ans:0 },
        { text:'Bir taşın 2 sn sonra hızı 20 m/s oluyorsa, ivmesi nedir? (v₀=0)', opts:['10 m/s²','20 m/s²','40 m/s²','5 m/s²'], ans:0 },
        { text:'Serbestçe düşen cismin hareketi nasıl adlandırılır?', opts:['Sabit hızlı','Eşit ivmeli','Değişken ivmeli','Dönüşlü hareket'], ans:1 },
        { text:'Yer çekimi ivmesi yaklaşık kaç m/s²\'dir?', opts:['6 m/s²','9,8 m/s²','10,8 m/s²','8 m/s²'], ans:1 },
        { text:'v = v₀ + a.t formülünde "a" neyi temsil eder?', opts:['Hız','İvme','Uzaklık','Zaman'], ans:1 },
      ],
      'Fizik Bilimine Giriş': [
        { text:'Aşağıdakilerden hangisi fiziksel büyüklük değildir?', opts:['Kütle','Hacim','Güzellik','Sıcaklık'], ans:2 },
        { text:'SI birim sisteminde uzunluğun birimi nedir?', opts:['Santimetre','Kilometre','Metre','Milimetre'], ans:2 },
        { text:'1 km = ? m', opts:['10 m','100 m','1000 m','10000 m'], ans:2 },
        { text:'Fizik biliminin temel amacı nedir?', opts:['Canlıları incelemek','Doğayı ve olayları incelemek','Maddelerin yapısını analiz etmek','Tarihi araştırmak'], ans:1 },
        { text:'Aşağıdakilerden hangisi vektörel büyüklüktür?', opts:['Kütle','Hacim','Sıcaklık','Kuvvet'], ans:3 },
        { text:'Ölçme yapılırken hata olabilir. Sistematik hata nedir?', opts:['Rastgele olan hatalar','Her ölçümde aynı yönde olan hatalar','Doğru sonuç veren ölçümler','Hesap hataları'], ans:1 },
      ],
      'Madde ve Özellikleri': [
        { text:'Maddenin ısıtılması ile hangi hal değişimi gerçekleşebilir?', opts:['Katı → Sıvı','Sıvı → Katı','Gaz → Sıvı','Katı → Gaz olmaz'], ans:0 },
        { text:'Kütle ve hacim arasındaki oran nedir?', opts:['Ağırlık','Özkütle','Basınç','Kuvvet'], ans:1 },
        { text:'Özkütle birimi nedir?', opts:['kg/m','kg/m²','kg/m³','g/L farklıdır'], ans:2 },
        { text:'Aşağıdakilerden hangisi maddenin fiziksel özelliğidir?', opts:['Yanma ısısı','Yoğunluk','Çürüme','Paslanma'], ans:1 },
        { text:'Bozuşmayan madde hangisidir?', opts:['Ahşap','Altın','Demir','Bakır'], ans:1 },
      ],
    },
    'Kimya': {
      'Atom Modelleri': [
        { text:'Atomun çekirdeğinde hangi parçacıklar bulunur?', visual: SVG.atom, opts:['Elektron ve proton','Proton ve nötron','Elektron ve nötron','Sadece proton'], ans:1 },
        { text:'Bir elementin atom numarası neyi ifade eder?', opts:['Nötron sayısını','Proton sayısını','Kütle sayısını','Elektron açığını'], ans:1 },
        { text:'Kütlesi en küçük olan atom parçacığı hangisidir?', opts:['Proton','Nötron','Elektron','Çekirdek'], ans:2 },
        { text:'Dalton atom modeline göre atom nasıl tanımlanır?', opts:['Bölünebilir, negatif yüklü küre','Bölünemez, katı küre','Elektronların çevrelediği çekirdek','Sadece elektron bulutu'], ans:1 },
        { text:'Bir nötr atomda proton sayısı ile elektron sayısı nasıl bir ilişkidedir?', opts:['Proton daha fazladır','Elektron daha fazladır','Birbirine eşittir','İlişki yoktur'], ans:2 },
        { text:'¹²₆C atomunun nötron sayısı kaçtır?', opts:['6','12','18','0'], ans:0 },
        { text:'Elektron bulutunu ilk öneren bilim insanı kimdir?', opts:['Dalton','Thomson','Rutherford','Bohr'], ans:1 },
        { text:'Rutherford deneyinde alfa parçacıkları altın levhaya gönderildi. Çoğu parçacığın levhadan geçmesi neyi kanıtlamıştır?', opts:['Atom içi boştur','Atomun kütlesi yayılmıştır','Atom yük taşımaz','Elektron kütlelidir'], ans:0 },
      ],
      'Periyodik Sistem': [
        { text:'Periyodik cetvelde bir dönemde soldan sağa gidildikçe atom numarası nasıl değişir?', opts:['Azalır','Artar','Değişmez','Önce artar sonra azalır'], ans:1 },
        { text:'Asil gazlar periyodik tablonun hangi grubundadır?', opts:['Grup 1','Grup 7','Grup 8 (18)','Grup 2'], ans:2 },
        { text:'Metallerin genel özellikleri için hangisi yanlıştır?', opts:['Isı iletirler','Elektriği iletirler','Kırılgandırlar','Parlak görünümlüdürler'], ans:2 },
        { text:'Hidrojen hangi periyotta yer alır?', opts:['1. Periyot','2. Periyot','3. Periyot','4. Periyot'], ans:0 },
        { text:'Sodyumun (Na) atom numarası 11\'dir. Buna göre kaç valans elektronu vardır?', opts:['1','2','3','11'], ans:0 },
        { text:'Halojenler grubu hangi gruba karşılık gelir?', opts:['Grup 1','Grup 2','Grup 17','Grup 18'], ans:2 },
        { text:'Periyodik cetveli ilk düzenleyen bilim insanı kimdir?', opts:['Marie Curie','Mendeleev','Dalton','Avogadro'], ans:1 },
      ],
    },
    'Biyoloji': {
      'Hücre': [
        { text:'Şekildeki yapıda çekirdek hangi işlevi üstlenir?', visual: SVG.cell, opts:['Enerji üretimi','Genetik bilgiyi saklar','Hücreyi çevreler','Besin depolar'], ans:1 },
        { text:'Hücre zarının temel görevi nedir?', opts:['Enerji üretmek','Madde alışverişini kontrol etmek','Protein sentezlemek','Fotosentez yapmak'], ans:1 },
        { text:'Mitokondri hangi işlevi gerçekleştirir?', opts:['Protein sentezi','Fotosentez','ATP (enerji) üretimi','Hücre bölünmesi'], ans:2 },
        { text:'Prokaryot hücreden farkı olarak ökaryot hücrede ne bulunur?', opts:['Hücre zarı','Zarlı çekirdek','DNA','Ribozom'], ans:1 },
        { text:'Kloroplast hangi hücre türünde bulunur?', opts:['Hayvan hücresi','Bakteri','Bitki hücresi','Mantar'], ans:2 },
        { text:'Ribozomun görevi nedir?', opts:['Lipid sentezi','Protein sentezi','Enerji üretimi','Hücre hareketliliği'], ans:1 },
        { text:'Hücre çekirdeğinin içindeki kalıtım materyali nedir?', opts:['RNA','Lipid','DNA','Protein'], ans:2 },
        { text:'Hücre duvarı hangi hücrelerde bulunmaz?', opts:['Bakteri','Bitki','Mantar','Hayvan'], ans:3 },
      ],
    },
    'Tarih': {
      'Tarih ve Zaman': [
        { text:'Tarihin başlangıcı olarak kabul edilen olay nedir?', opts:['Ateşin bulunması','Yazının icadı','Tarımın başlaması','Tekerleğin icadı'], ans:1 },
        { text:'MÖ 3000 yılı, MS 1000 yılından kaç yıl öncedir?', opts:['2000','3000','4000','1000'], ans:2 },
        { text:'Prehistorya (tarih öncesi) hangi dönemi kapsar?', opts:['Yazının icadından günümüze','Yazının icadından önceki dönem','MS 1. yüzyıldan itibaren','Sanayi Devriminden itibaren'], ans:1 },
        { text:'Taş Devri hangi dönemle başlar?', opts:['Tunç Çağı','Neolitik Çağ','Paleolitik Çağ','Kalkolitik Çağ'], ans:2 },
        { text:'Tarih biliminin birincil kaynağı hangisidir?', opts:['Romanlar','Sözlü aktarımlar','Arşiv belgeleri','Filmler'], ans:2 },
        { text:'Anadolu\'nun ilk büyük uygarlığı olarak kabul edilen nedir?', opts:['Sümerler','Hititler','Frigler','Urartular'], ans:1 },
      ],
    },
    'İngilizce': {
      'Simple Tenses': [
        { text:'Choose the correct form: "She ___ to school every day."', opts:['go','goes','going','gone'], ans:1 },
        { text:'"I ___ my homework yesterday." Fill in the blank.', opts:['do','does','did','done'], ans:2 },
        { text:'Which sentence is in Present Simple?', opts:['I am eating.','I ate.','I eat breakfast daily.','I will eat.'], ans:2 },
        { text:'"They will ___ the match tomorrow."', opts:['watch','watches','watched','watching'], ans:0 },
        { text:'What is the negative form of "He plays football"?', opts:["He doesn't plays football","He don't play football","He doesn't play football","He isn't play football"], ans:2 },
        { text:'"___ you speak English?" Fill the blank.', opts:['Are','Do','Does','Is'], ans:1 },
        { text:'Which is Past Simple?', opts:['She is running.','She runs.','She ran.','She will run.'], ans:2 },
        { text:'The verb "to be" in Past Simple for "I" is:', opts:['am','is','are','was'], ans:3 },
      ],
    },
    'Coğrafya': {
      'Harita Bilgisi': [
        { text:'Haritada küçük alanlar büyük gösterilmek istendiğinde ne yapılır?', opts:['Ölçek küçültülür','Ölçek büyütülür','Projeksiyon değiştirilir','Eş yükselti eğrileri kaldırılır'], ans:1 },
        { text:'1/100.000 ölçekli haritada 2 cm gerçekte kaç km\'ye eşittir?', opts:['2 km','20 km','200 km','0,2 km'], ans:0 },
        { text:'Eş yükselti eğrileri (izohips) ne anlama gelir?', opts:['Aynı sıcaklıktaki yerler','Denizden aynı yükseklikteki noktalar','Aynı basınç bölgeleri','Aynı yağış miktarındaki yerler'], ans:1 },
        { text:'Haritada ölçek ne anlama gelir?', opts:['Gerçek uzunluğun haritadaki karşılığı','Harita renkleri','Eğim derecesi','Yükseklik farkı'], ans:0 },
        { text:'Hangisi fiziki harita özelliklerine dahil değildir?', opts:['Dağlar','Nehirler','Nüfus dağılımı','Denizler'], ans:2 },
      ],
    },
    'Türk Dili': {
      'Sözcükte Anlam': [
        { text:'"Baş" sözcüğü aşağıdaki cümlelerin hangisinde mecaz anlamda kullanılmıştır?', opts:['"Başını taradı"','"Başı ağrıdı"','"Grubun başı o"','"Başına şapka geçirdi"'], ans:2 },
        { text:'"Kılıç gibi keskin bir zekâsı var" cümlesinde hangi söz sanatı kullanılmıştır?', opts:['Teşhis','Benzetme','Abartma','İroni'], ans:1 },
        { text:'Eş anlamlı sözcük çifti hangisidir?', opts:['Açık – Kapalı','Hızlı – Yavaş','Güzel – Hoş','Büyük – Küçük'], ans:2 },
        { text:'"Çok kitap okuyan çok şey öğrenir." cümlesindeki sözcüklerin anlam ilişkisi nedir?', opts:['Eş anlamlılık','Zıt anlamlılık','Dolaylı anlam','Terim anlamlılık'], ans:0 },
        { text:'"Gözünden yaş akmak" deyiminin anlamı nedir?', opts:['Göz ağrısı çekmek','Ağlamak','Uykusuzluktan gözler kızarmak','Merak etmek'], ans:1 },
        { text:'Aşağıdaki cümlelerin hangisinde terim anlamlı bir sözcük kullanılmıştır?', opts:['"Yüzü güldü"','"Akışkan maddeler"','"İnce zekâlı biri"','"Sıcak bir gülümseme"'], ans:1 },
      ],
    },
  },
  '10': {
    'Matematik': {
      '2. Dereceden Denklemler': [
        { text:'x² − 5x + 6 = 0 denkleminin kökleri hangileridir?', opts:['x=2 ve x=3','x=1 ve x=6','x=−2 ve x=−3','x=5 ve x=−1'], ans:0 },
        { text:'x² − 7x + 12 = 0 denkleminin kökleri toplamı kaçtır?', opts:['5','7','12','−7'], ans:1 },
        { text:'x² + 4x + 4 = 0 denkleminin diskriminantı (Δ) nedir?', opts:['16','8','0','−8'], ans:2 },
        { text:'Kökleri 2 ve 5 olan 2. derece denklem hangisidir?', opts:['x²−7x+10=0','x²+7x+10=0','x²−10x+7=0','x²−3x+10=0'], ans:0 },
        { text:'2x² − 8 = 0 denkleminin çözüm kümesi nedir?', opts:['{4}','{2, −2}','{4, −4}','{√2, −√2}'], ans:1 },
        { text:'x² + x − 6 = 0 denkleminin köklerinin çarpımı nedir?', opts:['1','−6','6','−1'], ans:1 },
        { text:'x² − 9 = 0 denkleminin kökleri?', opts:['x=3 ve x=0','x=3 ve x=−3','x=9 ve x=0','x=−3 ve x=0'], ans:1 },
        { text:'Δ < 0 iken 2. derece denklem için ne söylenir?', opts:['İki gerçek kök var','İki eşit kök var','Gerçek sayılarda kök yok','Bir kök sıfırdır'], ans:2 },
      ],
      'Trigonometri': [
        { text:'sin²(x) + cos²(x) = ?', opts:['0','1','2','sin(2x)'], ans:1 },
        { text:'sin(30°) = ?', opts:['1','√3/2','1/2','√2/2'], ans:2 },
        { text:'cos(60°) = ?', opts:['1/2','√3/2','1','0'], ans:0 },
        { text:'tan(45°) = ?', opts:['0','1','√3','1/2'], ans:1 },
        { text:'sin(90°) = ?', opts:['0','1/2','√2/2','1'], ans:3 },
        { text:'cos(0°) = ?', opts:['0','1/2','1','−1'], ans:2 },
        { text:'1 + tan²(x) = ?', opts:['sin²(x)','sec²(x)','cos²(x)','csc²(x)'], ans:1 },
        { text:'sin(180°) = ?', opts:['1','−1','0','½'], ans:2 },
      ],
      'Analitik Geometri': [
        { text:'A(2, 3) ve B(6, 7) noktaları arasındaki uzaklık kaçtır?', opts:['4√2','4','8','5'], ans:0 },
        { text:'Orijin ile A(3, 4) noktası arasındaki uzaklık kaçtır?', opts:['3','4','5','7'], ans:2 },
        { text:'Eğim formülü m = (y₂−y₁)/(x₂−x₁) ile A(1,2) ve B(3,6) için eğim nedir?', opts:['1','2','3','4'], ans:1 },
        { text:'y = 2x + 3 doğrusunun y ekseniyle kesim noktası nedir?', opts:['(0,2)','(0,3)','(3,0)','(2,0)'], ans:1 },
        { text:'y = x + 5 doğrusunun eğimi nedir?', opts:['5','1','0','−1'], ans:1 },
        { text:'İki paralel doğrunun eğimleri nasıl bir ilişkidedir?', opts:['Eşittir','Çarpımları −1\'dir','Toplamları 0\'dır','Hiç bağlantıları yoktur'], ans:0 },
      ],
    },
    'Fizik': {
      'Dalgalar': [
        { text:'Bir dalganın frekansı 50 Hz, hızı 300 m/s ise dalga boyu nedir?', opts:['6 m','15000 m','0.17 m','6000 m'], ans:0 },
        { text:'Ses dalgaları nasıl bir dalga türüdür?', opts:['Enine dalga','Boyuna dalga','Elektromanyetik dalga','Su dalgası'], ans:1 },
        { text:'Dalga boyu (λ), frekans (f) ve hız (v) arasındaki bağıntı nedir?', opts:['v = f + λ','v = f × λ','v = f / λ','λ = v × f'], ans:1 },
        { text:'Deprem dalgaları hangi ortamda yayılabilir?', opts:['Yalnız havada','Yalnız sıvıda','Hem katı hem sıvıda','Boşlukta'], ans:2 },
        { text:'Rezonans ne demektir?', opts:['Dalganın kırılması','Titreşim frekanslarının eşleşmesi','Dalganın yansıması','Ses şiddetinin artması'], ans:1 },
        { text:'Bir dalganın periyodu 0.01 s ise frekansı nedir?', opts:['10 Hz','100 Hz','0.01 Hz','1000 Hz'], ans:1 },
      ],
      'Optik': [
        { text:'Işığın vakumdaki hızı yaklaşık kaçtır?', opts:['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], ans:1 },
        { text:'Tam yansıma olayı hangi durumlarda gerçekleşir?', opts:['Işık yoğun ortamdan seyrek ortama geçer ve kırılma açısı 90°\'yi aşar','Işık seyrek ortamdan yoğun ortama geçer','Işık iki ayna arasında kalır','Işık sadece camdan geçer'], ans:0 },
        { text:'Çukur aynada paralel gelen ışınlar nereye yönelir?', opts:['Odak noktasından uzağa','Odak noktasında toplanır','Paralel devam eder','Dağılır'], ans:1 },
        { text:'Konveks (iri yüzlü) mercek nedir?', opts:['Kenar kalın, orta ince','Orta kalın, kenar ince','Her yeri eşit kalın','İçi boş'], ans:1 },
        { text:'Gökkuşağı hangi optik olay sonucu oluşur?', opts:['Kırılma + Dağılma','Yansıma','Kırınım','Girişim'], ans:0 },
      ],
      'Elektrik ve Manyetizma': [
        { text:'Şekildeki devrede direnç R=10 Ω, gerilim V=20 V ise akım nedir?', visual: SVG.circuit, opts:['0.5 A','2 A','200 A','10 A'], ans:1 },
        { text:'Ohm kanunu nedir?', opts:['V = I + R','V = I × R','I = V × R','R = V × I'], ans:1 },
        { text:'Seri bağlı dirençlerde toplam direnç nasıl bulunur?', opts:['R_toplam = R₁ × R₂','R_toplam = R₁ + R₂','1/R_t = 1/R₁ + 1/R₂','R_toplam = R₁ / R₂'], ans:1 },
        { text:'Elektrik enerjisi hangi birimle ölçülür?', opts:['Watt','Amper','Joule (Watt×sn)','Ohm'], ans:2 },
        { text:'Manyetik alan şiddetinin birimi nedir?', opts:['Amper','Tesla','Volt','Newton'], ans:1 },
      ],
    },
    'Kimya': {
      'Asitler ve Bazlar': [
        { text:'pH değeri 7\'den küçük olan çözeltiler nasıl sınıflandırılır?', opts:['Bazik','Nötr','Asidik','Tuzlu'], ans:2 },
        { text:'HCl hangi tür maddedir?', opts:['Baz','Nötr tuz','Kuvvetli asit','Zayıf asit'], ans:2 },
        { text:'Asit + Baz reaksiyonu ne üretir?', opts:['Oksit + su','Tuz + su','Sadece tuz','Gaz + su'], ans:1 },
        { text:'pH = 7 olan çözelti ne anlama gelir?', opts:['Asidik','Nötr','Bazik','Tuzlu'], ans:1 },
        { text:'NaOH hangi tür maddedir?', opts:['Kuvvetli asit','Zayıf asit','Kuvvetli baz','Zayıf baz'], ans:2 },
        { text:'Fenolftalein indikatörü bazik ortamda hangi rengi alır?', opts:['Sarı','Mavi','Renksiz','Pembe'], ans:3 },
        { text:'Suyun pH değeri nedir?', opts:['0','7','14','5'], ans:1 },
        { text:'Limon suyu asidik mi bazik midir?', opts:['Bazik','Nötr','Asidik','Belirsiz'], ans:2 },
      ],
    },
    'Biyoloji': {
      'Fotosentez': [
        { text:'Fotosentez sonucunda oluşan ürünler nelerdir?', opts:['CO₂ + H₂O','O₂ + Glikoz','O₂ + CO₂','H₂O + Glikoz'], ans:1 },
        { text:'Fotosentez hangi organelde gerçekleşir?', opts:['Mitokondri','Ribozom','Kloroplast','Çekirdek'], ans:2 },
        { text:'Fotosentezde hammadde olarak ne kullanılır?', opts:['O₂ + Glikoz','CO₂ + H₂O','N₂ + H₂O','O₂ + CO₂'], ans:1 },
        { text:'Klorofil hangi ışık rengini en iyi soğurur?', opts:['Sarı ve turuncu','Mavi ve kırmızı','Yeşil ve sarı','Mor ve mavi'], ans:1 },
        { text:'Fotosentez için ışık şart mıdır?', opts:['Hayır, gerek yoktur','Sadece karanlıkta olur','Evet, ışık enerjisi gerekir','Sadece gece olur'], ans:2 },
      ],
      'Sinir Sistemi': [
        { text:'Sinir sisteminin temel birimi nedir?', opts:['Nöron','Akson','Dendrit','Miyelin'], ans:0 },
        { text:'Beynin hangi bölümü solunum ve kalp atışını kontrol eder?', opts:['Serebrum','Beyincik','Beyin sapı','Talamus'], ans:2 },
        { text:'Uyarıyı alıp merkeze ileten nöronlar hangisidir?', opts:['Motor nöronlar','Duyusal nöronlar','Ara nöronlar','Efektör nöronlar'], ans:1 },
        { text:'Otonom sinir sistemi hangi işlemleri kontrol eder?', opts:['İstemli kas hareketleri','İstemsiz organlar (kalp, bağırsak)','Bilinçli düşünme','Görme ve duyma'], ans:1 },
      ],
    },
    'Tarih': {
      'Osmanlı Tarihi': [
        { text:'Osmanlı Devleti hangi tarihte kurulmuştur?', opts:['1071','1299','1453','1517'], ans:1 },
        { text:'İstanbul hangi Osmanlı padişahı tarafından fethédilmiştir?', opts:['Yıldırım Bayezid','Murat II','Fatih Sultan Mehmed','Kanuni Sultan Süleyman'], ans:2 },
        { text:'Tanzimat Fermanı hangi yılda ilan edilmiştir?', opts:['1839','1856','1876','1908'], ans:0 },
        { text:'Osmanlı\'da ilk meşrutiyet ne zaman ilan edilmiştir?', opts:['1856','1876','1908','1920'], ans:1 },
        { text:'Osmanlı Devleti\'nin çöküşünü hızlandıran savaş hangisidir?', opts:['Kırım Savaşı','Balkan Savaşları','Çanakkale Savaşı','Kurtuluş Savaşı'], ans:1 },
        { text:'Osmanlı yönetiminde "Divan" ne anlama gelir?', opts:['Vergi toplama kurumu','Devlet yönetim meclisi','Askeri mahkeme','Din işleri kurumu'], ans:1 },
      ],
      'Kurtuluş Savaşı': [
        { text:'Kurtuluş Savaşı hangi tarihte başlamıştır?', opts:['19 Mayıs 1919','30 Ağustos 1922','29 Ekim 1923','23 Nisan 1920'], ans:0 },
        { text:'Sakarya Savaşı\'nın önemi nedir?', opts:['İlk Türk zaferi','Yunanlıların durdurulduğu kritik zafer','İstanbul\'un kurtuluşu','İzmir\'in geri alınması'], ans:1 },
        { text:'Büyük Taarruz hangi tarihte başladı?', opts:['19 Mayıs 1919','26 Ağustos 1922','29 Ekim 1923','30 Ağustos 1922'], ans:1 },
        { text:'Lozan Antlaşması hangi yılda imzalanmıştır?', opts:['1920','1921','1923','1924'], ans:2 },
        { text:'Mustafa Kemal hangi unvanı Kurtuluş Savaşı döneminde almıştır?', opts:['Padişah','Başkomutan','Halife','Sultan'], ans:1 },
      ],
    },
    'İngilizce': {
      'Perfect Tenses': [
        { text:'"I ___ this movie before." Fill in the blank.', opts:['see','saw','have seen','am seeing'], ans:2 },
        { text:'Which sentence uses Present Perfect?', opts:['She was here.','She has been here.','She is here.','She will be here.'], ans:1 },
        { text:'"They ___ their homework by 8 PM." (Future Perfect)', opts:['will finish','will have finished','have finished','finished'], ans:1 },
        { text:'Past Perfect is used to describe:', opts:['Future actions','An action before another past action','Present habits','Ongoing actions'], ans:1 },
        { text:'"He ___ never ___ sushi before." Fill in the blanks.', opts:['has / eaten','is / eating','was / eaten','did / eat'], ans:0 },
      ],
      'Passive Voice': [
        { text:'Active: "The chef cooked the meal." → Passive:', opts:['The meal cooked the chef.','The meal was cooked by the chef.','The meal is cooked.','The meal cooked.'], ans:1 },
        { text:'"This bridge ___ in 1980." Fill the blank (Passive).', opts:['built','build','was built','is built'], ans:2 },
        { text:'Which sentence is in Passive Voice?', opts:['She writes letters.','Letters are written by her.','She is writing.','She wrote letters.'], ans:1 },
        { text:'"The book ___ by millions of people." Fill (Present Passive).', opts:['read','reads','is read','was read'], ans:2 },
      ],
    },
    'Coğrafya': {
      'İklim Tipleri': [
        { text:'Akdeniz ikliminde yazlar nasıldır?', opts:['Soğuk ve yağışlı','Sıcak ve kurak','Serin ve nemli','Çok karlı'], ans:1 },
        { text:'Karadeniz ikliminin özelliği nedir?', opts:['Yaz yağışlı, kış kurak','Her mevsim yağışlı','Çok kurak','Yazlar kar yağışlı'], ans:1 },
        { text:'Hangi iklim tipi Türkiye\'nin iç kesimlerinde görülür?', opts:['Akdeniz iklimi','Karadeniz iklimi','Karasal iklim','Okyanusal iklim'], ans:2 },
        { text:'Karasal iklimde yaz ve kış sıcaklıkları arasındaki fark nasıldır?', opts:['Çok küçük','Orta düzeyde','Çok büyük','Yoktur'], ans:2 },
        { text:'Muson iklimi en çok hangi kıtada görülür?', opts:['Avrupa','Asya','Amerika','Afrika'], ans:1 },
      ],
    },
    'Türk Dili': {
      'Noktalama İşaretleri': [
        { text:'Aşağıdaki cümlelerden hangisinde noktalama işareti yanlış kullanılmıştır?', opts:['"Gel, otur, dinlen."','"Ali, Ayşe ve Mehmet geldi."','"Sana bir sorum var?"','"Söz, düşüncenin aynasıdır."'], ans:2 },
        { text:'Üç nokta (…) hangi durumlarda kullanılır?', opts:['Cümle sonu','Anlatım kesildiğinde','Soru sorulduğunda','Liste yazarken'], ans:1 },
        { text:'Virgül hangi durumda kullanılmaz?', opts:['Sıralama yaparken','Bağlaçla bağlanan iki yargı arasında','Uzun cümlede özne-yüklem arasına','Hitap ifadesinden sonra'], ans:2 },
        { text:'"Ankara, Türkiye\'nin başkentidir." cümlesinde virgül neden kullanılmıştır?', opts:['Sıralama için','Açıklama için','Hitap için','Koşul için'], ans:1 },
      ],
    },
  },
  '11': {
    'Matematik': {
      'Türev': [
        { text:'f(x) = x³ fonksiyonunun türevi nedir?', opts:['3x','x²','3x²','x³'], ans:2 },
        { text:'f(x) = 5x² + 3x − 2 fonksiyonunun türevi f\'(x) nedir?', opts:['5x + 3','10x + 3','10x − 2','5x − 2'], ans:1 },
        { text:'Sabit bir fonksiyonun türevi nedir?', opts:['1','Fonksiyonun kendisi','0','Belirsiz'], ans:2 },
        { text:'(u.v)\' = ? (Çarpım kuralı)', opts:["u'.v","u.v'","u'.v + u.v'","u'.v - u.v'"], ans:2 },
        { text:'f(x) = sin(x) ise f\'(x) = ?', opts:['cos(x)','-sin(x)','-cos(x)','tan(x)'], ans:0 },
        { text:'Bir fonksiyonun maksimum noktasında f\'(x) = ?', opts:['1','-1','0','Belirsiz'], ans:2 },
        { text:'f(x) = eˣ ise f\'(x) = ?', opts:['eˣ','xeˣ','eˣ⁻¹','1/eˣ'], ans:0 },
        { text:'Türev, geometrik olarak neyi ifade eder?', opts:['Eğrinin uzunluğunu','Eğriye teğet doğrunun eğimini','Eğrinin alanını','Eğrinin y kesişimini'], ans:1 },
      ],
      'Logaritma': [
        { text:'log₁₀(100) = ?', opts:['1','2','10','100'], ans:1 },
        { text:'log₂(8) = ?', opts:['2','3','4','8'], ans:1 },
        { text:'log(a × b) = ?', opts:['log(a) × log(b)','log(a) + log(b)','log(a) − log(b)','log(a/b)'], ans:1 },
        { text:'log(a/b) = ?', opts:['log(a) × log(b)','log(a) + log(b)','log(a) − log(b)','log(b) − log(a)'], ans:2 },
        { text:'log(1) = ?', opts:['1','0','−1','Belirsiz'], ans:1 },
        { text:'ln(e) = ?', opts:['0','1','e','1/e'], ans:1 },
        { text:'log_a(aⁿ) = ?', opts:['a','n','aⁿ','1'], ans:1 },
        { text:'log₂(32) = ?', opts:['4','5','6','3'], ans:1 },
      ],
      'Diziler': [
        { text:'Aritmetik dizide a₁=3, d=4 ise a₅ = ?', opts:['15','19','23','11'], ans:1 },
        { text:'Geometrik dizide a₁=2, r=3 ise a₄ = ?', opts:['18','54','27','162'], ans:1 },
        { text:'1, 3, 5, 7, ... dizisinin ortak farkı nedir?', opts:['1','2','3','4'], ans:1 },
        { text:'2, 6, 18, 54, ... dizisinin ortak çarpanı nedir?', opts:['2','3','4','6'], ans:1 },
        { text:'Aritmetik dizinin n. terimi formülü nedir?', opts:['aₙ = a₁ × rⁿ⁻¹','aₙ = a₁ + (n−1)d','aₙ = n × d','aₙ = a₁ + n'], ans:1 },
        { text:'1+2+3+...+100 toplamı nedir?', opts:['5000','5050','4950','5100'], ans:1 },
      ],
    },
    'Fizik': {
      'Elektrik Akımı': [
        { text:'Elektrik akımının birimi nedir?', opts:['Volt','Ohm','Amper','Watt'], ans:2 },
        { text:'Elektrik direncinin birimi nedir?', opts:['Amper','Volt','Watt','Ohm'], ans:3 },
        { text:'P = V × I formülü neyi verir?', opts:['Direnç','Güç','Enerji','Yük'], ans:1 },
        { text:'İletkenin direncini artıran faktör hangisidir?', opts:['Kesit alanını artırmak','Uzunluğu artırmak','Sıcaklığı azaltmak','Metalik yapı'], ans:1 },
        { text:'Paralel bağlı iki 10 Ω direnç eşdeğer direnci nedir?', opts:['20 Ω','10 Ω','5 Ω','2 Ω'], ans:2 },
        { text:'Q = I × t formülünde Q neyi temsil eder?', opts:['Güç','Enerji','Yük miktarı','Direnç'], ans:2 },
      ],
      'Manyetizma': [
        { text:'Manyetik alan birimi nedir?', opts:['Amper','Volt','Tesla','Watt'], ans:2 },
        { text:'Doğu-Batı doğrultusunda akan bir telden geçen akım manyetik alan oluşturur mu?', opts:['Hayır, oluşturmaz','Evet, oluşturur','Sadece AC akımda oluşur','Sadece DC akımda oluşur'], ans:1 },
        { text:'Elektromanyetik indüksiyon kim tarafından keşfedilmiştir?', opts:['Maxwell','Faraday','Ohm','Tesla'], ans:1 },
        { text:'Solenoid ne işe yarar?', opts:['Elektrik üretir','Manyetik alan oluşturur','Direnç ölçer','Akımı keser'], ans:1 },
      ],
    },
    'Kimya': {
      'Organik Kimya': [
        { text:'Karbon atomunun valansı (bağ yapabilme sayısı) kaçtır?', opts:['2','3','4','6'], ans:2 },
        { text:'Metan (CH₄) hangi gruba girer?', opts:['Alken','Alkin','Alkan','Aromat'], ans:2 },
        { text:'Etanol (C₂H₅OH) hangi organik bileşik sınıfındandır?', opts:['Aldehit','Keton','Alkol','Asit'], ans:2 },
        { text:'"−OH" fonksiyonel grubu hangi bileşik sınıfını gösterir?', opts:['Keton','Alkol','Eter','Ester'], ans:1 },
        { text:'Benzen (C₆H₆) hangi türden bir bileşiktir?', opts:['Alkan','Alken','Aromatik bileşik','Alkin'], ans:2 },
        { text:'Doğal gaz\'ın ana bileşeni nedir?', opts:['Etan','Bütan','Metan','Propan'], ans:2 },
        { text:'Fermentasyon (mayalanma) hangi bileşiği üretir?', opts:['Aseton','Etanol','Metanol','Propanol'], ans:1 },
      ],
    },
    'Biyoloji': {
      'Kalıtım': [
        { text:'Mendel\'in 1. yasası nedir?', opts:['Ayrılma yasası','Bağımsız dağılım yasası','Çaprazlama yasası','Dominans yasası'], ans:0 },
        { text:'Homozigot dominant genotipi hangisidir?', opts:['Aa','aa','AA','aA'], ans:2 },
        { text:'Hangi kan grubu hem A hem B antijenine sahiptir?', opts:['0','A','B','AB'], ans:3 },
        { text:'Cinsiyet kromozomlarında erkek bireyin kromozom kombinasyonu nedir?', opts:['XX','XY','YY','XXY'], ans:1 },
        { text:'Renk körü geni neden erkeklerde daha sık görülür?', opts:['Erkekler daha az immün','Gen X kromozomundadır, erkeklerde tek kopya','Gen Y\'de bulunur','Hormonal fark'], ans:1 },
        { text:'Fenotip ne demektir?', opts:['Gizli kalıtım bilgisi','Gözlemlenebilir özellik','Gen dizilimi','Kromozom sayısı'], ans:1 },
      ],
    },
    'Tarih': {
      'Atatürk İlkeleri': [
        { text:'Cumhuriyetçilik ilkesinin önemi nedir?', opts:['Dini yönetime geçiş','Milletin kendi kendini yönetmesi','Ekonomik bağımsızlık','Toprak bütünlüğü'], ans:1 },
        { text:'Laiklik ilkesi neyi ifade eder?', opts:['Dini devlet kurulması','Din ve devlet işlerinin birbirinden ayrılması','Tek dinin kabul edilmesi','Diyanet\'in kaldırılması'], ans:1 },
        { text:'İnkılapçılık (Devrimcilik) ilkesi neyi simgeler?', opts:['Geçmişe dönüş','Sürekli değişim ve modernleşme','Yalnızca ekonomik yenilikler','Yalnızca eğitim reformu'], ans:1 },
        { text:'Milliyetçilik ilkesi hangi tutumu benimsemez?', opts:['Milli birlik','Türk kimliğine bağlılık','Irkçılık ve ayrımcılık','Ulusal çıkarları ön plana alma'], ans:2 },
        { text:'Halkçılık ilkesine göre devlet kime hizmet eder?', opts:['Devlet seçkinlerine','Askeri sınıfa','Tüm halka eşit biçimde','Yalnızca büyük şehirlere'], ans:2 },
      ],
    },
    'İngilizce': {
      'Modals': [
        { text:'"You ___ wear a seatbelt. It\'s the law." Fill the blank.', opts:['might','should','must','could'], ans:2 },
        { text:'"She ___ be at home; I saw her car outside."', opts:['must','can\'t','might','should'], ans:0 },
        { text:'Which modal expresses possibility?', opts:['must','should','might','would'], ans:2 },
        { text:'"___ I borrow your pen?" (polite request)', opts:['Must','Should','Could','Would rather'], ans:2 },
        { text:'"You ___ smoke here." (prohibition)', opts:['should not','must not','might not','could not'], ans:1 },
      ],
    },
    'Coğrafya': {
      'Tarım': [
        { text:'Türkiye\'de en fazla tarım arazisi hangi bölgede bulunur?', opts:['Karadeniz','İç Anadolu','Marmara','Doğu Anadolu'], ans:1 },
        { text:'Akdeniz ikliminde en yaygın tarım ürünü hangisidir?', opts:['Mısır','Buğday','Pamuk ve narenciye','Çay'], ans:2 },
        { text:'Monokültür tarım ne demektir?', opts:['Birden fazla ürün yetiştirme','Tek ürün üretimine odaklanma','Tarımın makineleşmesi','Sulama ile tarım'], ans:1 },
        { text:'Seracılık hangi illerde yaygındır?', opts:['Artvin, Rize','Konya, Ankara','Antalya, Mersin','Erzurum, Kars'], ans:2 },
      ],
    },
    'Türk Dili': {
      'Anlatım Bozuklukları': [
        { text:'"Bu konuyu hem Ali hem de Veli biliyor." cümlesinde anlatım bozukluğu var mıdır?', opts:['Evet, özne yanlış','Evet, bağlaç yanlış','Hayır, bozukluk yok','Evet, eylem yanlış'], ans:2 },
        { text:'"Ekmek fırından çıktı." cümlesinde hangi anlatım bozukluğu vardır?', opts:['Belirsizlik','Yanlış sözcük seçimi','Özne eksikliği','Bozukluk yok'], ans:3 },
        { text:'Aşağıdaki cümlelerin hangisinde anlatım bozukluğu vardır?', opts:['"Kitabı okuyacak."','"Gelip geçenlere baktı."','"Çocuklar parkta oynuyor."','"Ben ve Ayşe gittik."'], ans:3 },
        { text:'"Bana kitap ve kalem al." cümlesinde bozukluk nedir?', opts:['Eksik özne','Yüklem uyumsuzluğu','Bozukluk yok','Gereksiz sözcük'], ans:2 },
      ],
    },
  },
  '12': {
    'Matematik': {
      'İntegral': [
        { text:'∫ x dx = ?', opts:['x','x²','x²/2 + C','2x + C'], ans:2 },
        { text:'∫ 2x dx = ?', opts:['2','x²','x² + C','2x² + C'], ans:2 },
        { text:'∫ cos(x) dx = ?', opts:['sin(x) + C','-sin(x) + C','cos(x) + C','-cos(x) + C'], ans:0 },
        { text:'∫₀² x dx = ? (Belirli integral)', opts:['1','2','4','0'], ans:1 },
        { text:'∫ eˣ dx = ?', opts:['eˣ + C','xeˣ + C','eˣ/x + C','eˣ⁺¹ + C'], ans:0 },
        { text:'∫ 1/x dx = ?', opts:['x⁻² + C','ln|x| + C','1/x² + C','-1/x² + C'], ans:1 },
        { text:'∫ sin(x) dx = ?', opts:['cos(x) + C','-cos(x) + C','sin(x) + C','-sin(x) + C'], ans:1 },
        { text:'İntegral geometride ne anlama gelir?', opts:['Eğrinin türevi','Eğri altında kalan alan','Teğet eğimi','Eğrinin uzunluğu'], ans:1 },
      ],
      'Olasılık': [
        { text:'Bir zar atıldığında çift sayı gelme olasılığı nedir?', opts:['1/6','1/3','1/2','2/3'], ans:2 },
        { text:'Bir sikkeyi iki kez atınca iki tura gelme olasılığı?', opts:['1/2','1/4','3/4','1/8'], ans:1 },
        { text:'52 kartlık desteden as gelme olasılığı nedir?', opts:['1/52','1/13','1/4','4/52 (aynı şey)'], ans:1 },
        { text:'Bir çantada 3 kırmızı 5 mavi bilye var. Kırmızı çekme olasılığı?', opts:['3/5','3/8','5/8','1/3'], ans:1 },
        { text:'Bağımsız iki olayın birlikte gerçekleşme olasılığı nasıl hesaplanır?', opts:['P(A) + P(B)','P(A) − P(B)','P(A) × P(B)','P(A) / P(B)'], ans:2 },
        { text:'Kesin olayın olasılığı nedir?', opts:['0','0.5','1','Belirsiz'], ans:2 },
        { text:'İmkânsız olayın olasılığı nedir?', opts:['0','0.5','1','Belirsiz'], ans:0 },
        { text:'5 kişiden 2\'si seçilecek. Kaç farklı seçim yapılabilir? (Kombinasyon)', opts:['10','20','25','5'], ans:0 },
      ],
      'Limit': [
        { text:'lim(x→2) (x² − 4) / (x − 2) = ?', opts:['0','2','4','Tanımsız'], ans:2 },
        { text:'lim(x→∞) 1/x = ?', opts:['1','∞','0','−1'], ans:2 },
        { text:'lim(x→0) sin(x)/x = ?', opts:['0','∞','1','sin(1)'], ans:2 },
        { text:'lim(x→3) (x² − 9)/(x − 3) = ?', opts:['3','6','9','0'], ans:1 },
        { text:'Bir fonksiyon noktada sürekli olması için ne gerekir?', opts:['Türevi olmalı','Sınır değer = fonksiyon değeri','Integral alınabilir olmalı','Polinomsal olmalı'], ans:1 },
      ],
    },
    'Fizik': {
      'Modern Fizik': [
        { text:'Fotoelektrik olayı hangi teori ile açıklanmıştır?', opts:['Dalga teorisi','Görelilik teorisi','Foton (kuantum) teorisi','Faraday yasası'], ans:2 },
        { text:'Einstein\'ın ünlü E = mc² formülünde "c" neyi temsil eder?', opts:['Yük','Işık hızı','Frekans','Dalga boyu'], ans:1 },
        { text:'Plank sabiti hangi birimle ifade edilir?', opts:['Joule','Joule·saniye','Watt','Newton'], ans:1 },
        { text:'Foton nedir?', opts:['Elektron demeti','Manyetik alan birimi','Işık enerjisinin kuantumu','Atom çekirdeği'], ans:2 },
        { text:'De Broglie hipotezine göre elektronlar hangi özelliği gösterir?', opts:['Yalnızca parçacık','Yalnızca dalga','Hem dalga hem parçacık','Ne dalga ne parçacık'], ans:2 },
      ],
      'Atom Fiziği': [
        { text:'Bohr atom modelinde elektron hangi yörüngelerde döner?', opts:['Rastgele','Yalnızca enerji kaybeden','Belirli enerji seviyelerinde','Çekirdeğe bitişik'], ans:2 },
        { text:'Atomdan foton yayılması (emisyon) ne zaman olur?', opts:['Elektron üst yörüngeden alt yörüngeye geçince','Elektron alt yörüngeden üst yörüngeye geçince','Çekirdek bölününce','İki elektron çarpışınca'], ans:0 },
        { text:'Radyoaktivite nedir?', opts:['Atomların ışık saçması','Kararsız çekirdeklerin kendiliğinden bozunması','Elektronların yörünge değiştirmesi','Kimyasal tepkime'], ans:1 },
        { text:'Alfa parçacığı neyle özdeştir?', opts:['Elektron demeti','Helyum-4 çekirdeği','Proton demeti','Foton demeti'], ans:1 },
      ],
    },
    'Kimya': {
      'Kimyasal Denge': [
        { text:'Le Chatelier ilkesine göre denge sistemi baskıya nasıl tepki gösterir?', opts:['Baskıyı artıran yönde','Baskıyı azaltan yönde','Hiç tepki vermez','Tamamen dağılır'], ans:1 },
        { text:'Denge sabiti K_c ne zaman büyük olur?', opts:['Ürünler azdır','Ürünler baskındır','Reaktifler baskındır','Denge yoktur'], ans:1 },
        { text:'Bir tepkimede sıcaklık arttırıldığında denge hangi yönde kayar?', opts:['Her zaman ileri','Her zaman geri','Endotermik yönde','Ekzotermik yönde'], ans:2 },
        { text:'Haber-Bosch yöntemi neyi üretir?', opts:['H₂SO₄','HNO₃','NH₃ (Amonyak)','HCl'], ans:2 },
        { text:'Denge sabiti K ifadesinde hangi maddeler yer almaz?', opts:['Gaz maddeler','Sıvı çözeltiler','Katılar ve saf sıvılar','İyon konsantrasyonları'], ans:2 },
      ],
    },
    'Biyoloji': {
      'Biyoteknoloji': [
        { text:'DNA parmak izi analizinde hangi teknik kullanılır?', opts:['PCR','ELISA','Western Blot','Elektroforez + PCR'], ans:3 },
        { text:'Klonlama nedir?', opts:['Canlıların yeni türler oluşturması','Genetik olarak özdeş kopyalar üretme','Mutasyon oluşturma','Aşı üretme'], ans:1 },
        { text:'PCR (Polimeraz Zincir Reaksiyonu) ne işe yarar?', opts:['Protein sentezler','DNA\'yı çoğaltır','RNA\'yı parçalar','Enzim üretir'], ans:1 },
        { text:'Gen terapisi nedir?', opts:['Hastalıklı genin ilaçla tedavisi','Hastalıklı genin sağlıklı kopya ile değiştirilmesi','Hastalıklı bölgenin ameliyatla çıkarılması','Gen mutasyonu oluşturma'], ans:1 },
      ],
    },
    'Tarih': {
      'Yakın Dönem Türk Tarihi': [
        { text:'Türkiye\'de çok partili hayata geçiş hangi yılda gerçekleşti?', opts:['1923','1938','1946','1950'], ans:2 },
        { text:'1950 seçimlerinde iktidara gelen parti hangisidir?', opts:['CHP','DP (Demokrat Parti)','MHP','AKP'], ans:1 },
        { text:'Türkiye NATO\'ya hangi yılda katılmıştır?', opts:['1945','1949','1952','1960'], ans:2 },
        { text:'1960 askeri darbesi sonucunda ne yapılmıştır?', opts:['Cumhuriyet ilan edildi','Yeni anayasa hazırlandı','Osmanlı yeniden kuruldu','Ekonomi millileştirildi'], ans:1 },
        { text:'Türkiye Avrupa Birliği\'ne üyelik başvurusunu hangi yılda yaptı?', opts:['1959','1987','1999','2005'], ans:1 },
      ],
    },
    'İngilizce': {
      'Advanced Grammar': [
        { text:'"If I ___ rich, I would travel the world." (Type 2 conditional)', opts:['am','was/were','will be','had been'], ans:1 },
        { text:'"Had she studied, she ___ passed." (Type 3 conditional)', opts:['would pass','would have passed','will have passed','had passed'], ans:1 },
        { text:'"She insisted that he ___ early." (Subjunctive)', opts:['leaves','left','leave','is leaving'], ans:2 },
        { text:'"___ the weather, we had a great time." (Despite/Although)', opts:['Despite of','In spite','Despite','Although'], ans:2 },
        { text:'"No sooner ___ he arrived than it started raining." (Inversion)', opts:['did','had','was','has'], ans:1 },
      ],
      'Essay Writing': [
        { text:'What is the main purpose of a thesis statement?', opts:['To summarize the essay','To introduce the topic and main argument','To conclude the essay','To list evidence'], ans:1 },
        { text:'Which transition word shows contrast?', opts:['Furthermore','Therefore','However','In addition'], ans:2 },
        { text:'A body paragraph should begin with:', opts:['A quotation','A topic sentence','A conclusion','A question'], ans:1 },
        { text:'Which is NOT a feature of academic writing?', opts:['Formal language','Slang and colloquial expressions','Evidence-based claims','Structured paragraphs'], ans:1 },
      ],
    },
    'Coğrafya': {
      'Küresel Çevre Sorunları': [
        { text:'Küresel ısınmanın temel nedeni nedir?', opts:['Güneş aktivitesi','Sera gazı salımları (CO₂ vb.)','Okyanus akıntıları','Volkan patlamaları'], ans:1 },
        { text:'Ozon tabakasını incelten başlıca madde nedir?', opts:['CO₂','NO₂','CFC (Kloroflorokarbon)','SO₂'], ans:2 },
        { text:'Asit yağmurlarının temel nedeni nedir?', opts:['Karbondioksit','Kükürt dioksit ve azot oksitler','Metan','Freon gazları'], ans:1 },
        { text:'Biyoçeşitlilik kaybının en önemli nedeni nedir?', opts:['Doğal afetler','Habitat yıkımı','İklim değişikliği tek başına','Göç'], ans:1 },
        { text:'Sürdürülebilir kalkınma kavramı neyi hedefler?', opts:['Hızlı sanayileşme','Mevcut neslin ihtiyaçlarını gelecek nesillere zarar vermeden karşılamak','Nüfusu azaltmak','Ormansızlaşmayı hızlandırmak'], ans:1 },
      ],
    },
    'Türk Dili': {
      'Edebiyat Akımları': [
        { text:'Romantizm akımının temel özelliği nedir?', opts:['Akıl ve bilim ön planda','Duygu, hayal ve doğa ön planda','Toplumsal gerçekçilik','Siyasi eleştiri'], ans:1 },
        { text:'Realizm akımı hangi döneme karşı bir tepki olarak doğmuştur?', opts:['Klasizm','Romantizm','Sembolizm','Sürrealizm'], ans:1 },
        { text:'Türk edebiyatında Tanzimat dönemi hangi yılda başlar?', opts:['1839','1860','1876','1908'], ans:0 },
        { text:'Servet-i Fünun dönemi Türk edebiyatında hangi akım egemendir?', opts:['Klasizm','Romantizm ve Realizm etkisi','Gerçeküstücülük','Dadaizm'], ans:1 },
      ],
    },
  },
};

// ─────────────────────────────────────────
// YOUTUBE VİDEO VERİTABANI
// ─────────────────────────────────────────
const VIDEO_DB = {
  'Sayılar ve Kümeler':    { id:'VHZ-xh5O4pI', title:'Sayılar ve Kümeler', ch:'Tonguç Akademi' },
  'Kümeler ve Mantık':     { id:'VHZ-xh5O4pI', title:'Kümeler ve Mantık', ch:'Tonguç Akademi' },
  '2. Dereceden Denklemler':{ id:'6WJ-9K7e6PE', title:'2. Dereceden Denklemler', ch:'Hocalara Geldik' },
  'Fonksiyonlar':          { id:'kvGsIo1TmsM', title:'Fonksiyonlar Konu Anlatımı', ch:'Tonguç Akademi' },
  'Türev':                 { id:'LRc43lTp_Bs', title:'Türev - Temel Kavramlar', ch:'Hocalara Geldik' },
  'İntegral':              { id:'rfG8ce4nNh0', title:'İntegral Konu Anlatımı', ch:'Hocalara Geldik' },
  'Trigonometri':          { id:'VtNzbbOQ7Xg', title:'Trigonometri - Sin Cos Tan', ch:'Tonguç Akademi' },
  'Newton Yasaları':       { id:'ou7-wBeq6lQ', title:"Newton'un Hareket Yasaları", ch:'Hocalara Geldik' },
  'Kuvvet ve Hareket':     { id:'ou7-wBeq6lQ', title:'Kuvvet ve Hareket', ch:'Hocalara Geldik' },
  'Enerji':                { id:'2H0bS0CRJWY', title:'Enerji ve İş - Güç', ch:'Tonguç Akademi' },
  'Atom Modelleri':        { id:'jz95RTzZAu8', title:'Atom Modelleri ve Yapısı', ch:'Hocalara Geldik' },
  'Periyodik Sistem':      { id:'jz95RTzZAu8', title:'Periyodik Sistem', ch:'Hocalara Geldik' },
  'Kalıtım':               { id:'CBezq1fFUEA', title:'Kalıtım ve Genetik', ch:'Biyoloji Lise' },
  'Hücre':                 { id:'7K45LBH1I6I', title:'Hücre ve Organeller', ch:'Biyoloji Lise' },
  'Fotosentez':            { id:'oxcNbMlCMEI', title:'Fotosentez Konu Anlatımı', ch:'Biyoloji Lise' },
  'Osmanlı Tarihi':        { id:'rD8SmacBUl0', title:'Osmanlı Devleti', ch:'Tarih Platformu' },
  'Kurtuluş Savaşı':       { id:'MoFhT3WDLG8', title:'Kurtuluş Savaşı Kronolojisi', ch:'Hocalara Geldik' },
  'Atatürk İlkeleri':      { id:'XHFbT6bIFEo', title:"Atatürk'ün İlkeleri", ch:'Tarih Platformu' },
  'Logaritma':             { id:'Z5myJ8dg_rM', title:'Logaritma Konu Anlatımı', ch:'Tonguç Akademi' },
  'Olasılık':              { id:'KzfWUEJjG18', title:'Olasılık Konu Anlatımı', ch:'Tonguç Akademi' },
  'Modern Fizik':          { id:'8Q-KgfO9b5o', title:'Modern Fizik', ch:'Hocalara Geldik' },
  'Organik Kimya':         { id:'w1qLTHPiNqc', title:'Organik Kimya Temelleri', ch:'Hocalara Geldik' },
};

// ─────────────────────────────────────────
// MESLEK LİSESİ BÖLÜM VERİSİ
// ─────────────────────────────────────────
const VOCATIONAL = {
  anadolu:  { label:'Anadolu Lisesi',           kulturDersleri:['Matematik','Fizik','Kimya','Biyoloji','Türk Dili','İngilizce','Tarih','Coğrafya'], meslekDersleri:[] },
  fen:      { label:'Fen Lisesi',                kulturDersleri:['Matematik','Fizik','Kimya','Biyoloji','İngilizce','Bilgisayar'],                  meslekDersleri:[] },
  elektrik: { label:'Elektrik-Elektronik',       kulturDersleri:['Matematik','Fizik','Türk Dili','İngilizce'],                                      meslekDersleri:['Elektrik Devre Analizi','Elektronik','Elektrik Tesisatı','PLC Programlama','Otomasyon'] },
  bilisim:  { label:'Bilişim Teknolojileri',     kulturDersleri:['Matematik','Türk Dili','İngilizce','Fizik'],                                      meslekDersleri:['Algoritmalar','Web Tasarımı','Veritabanı','Ağ Sistemleri','Programlama (Python)'] },
  makine:   { label:'Makine Teknolojisi',        kulturDersleri:['Matematik','Fizik','Türk Dili','İngilizce'],                                      meslekDersleri:['Teknik Resim','CNC Tezgahları','Hidrolik & Pnömatik','Malzeme Bilgisi','Kaynak Teknolojisi'] },
  insaat:   { label:'İnşaat Teknolojisi',        kulturDersleri:['Matematik','Fizik','Türk Dili','Coğrafya'],                                       meslekDersleri:['Yapı Bilgisi','Statik','Mimari Çizim','Zemin Mekaniği','İnşaat Uygulamaları'] },
  saglik:   { label:'Sağlık Hizmetleri',         kulturDersleri:['Biyoloji','Kimya','Türk Dili','İngilizce'],                                      meslekDersleri:['Anatomi','Fizyoloji','Hasta Bakımı','Tıbbi Terminoloji','İlk Yardım'] },
  mutfak:   { label:'Aşçılık & Gastronomi',      kulturDersleri:['Matematik','Türk Dili','İngilizce','Tarih'],                                      meslekDersleri:['Mutfak Tekniği','Pastane Ürünleri','Beslenme Bilimi','Mutfak Yönetimi','Dünya Mutfakları'] },
  muhasebe: { label:'Muhasebe & Finans',          kulturDersleri:['Matematik','Türk Dili','İngilizce','Tarih'],                                      meslekDersleri:['Muhasebe Temelleri','Bilanço','Vergi Hukuku','Girişimcilik','Ekonomi'] },
};

const FOUNDATION_GRADES = [
  { grade:'5. Sınıf', topics:['Kesirler','Ondalıklar','Oran Orantı','Temel Geometri','Veri Analizi'] },
  { grade:'6. Sınıf', topics:['Tam Sayılar','Hız-Mesafe-Zaman','Olasılık','Çevre ve Alan','Karışımlar'] },
  { grade:'7. Sınıf', topics:['Cebirsel İfadeler','Eşitsizlikler','Pi Sayısı','Benzerlik','Üslü İfadeler'] },
  { grade:'8. Sınıf', topics:['Denklem Sistemleri','Pitagoras','Dönüşüm Geometrisi','Veri','Çarpanlara Ayırma'] },
  { grade:'9. Sınıf', topics:['Kümeler','Fonksiyonlar','Polinomlar','Trigonometri Giriş','Dönüşümler'] },
  { grade:'10. Sınıf',topics:['Türev Giriş','İntegral Giriş','İstatistik','Analitik Geometri','Kompleks Sayılar'] },
];

// Oyun ödül merdiveni (puan)
const PRIZE_LADDER = [100,250,500,1000,2000,3500,5000,7500,10000,15000,20000,30000,50000,75000,100000];

// ─────────────────────────────────────────
// DURUM YÖNETİMİ
// ─────────────────────────────────────────
const state = {
  currentClass: null,
  currentNav: 'dashboard',
  profile: { name:'', school:'', schoolNo:'', email:'', initials:'?' },
  earnedBadges: ['starter'],
  testHistory: [],         // Başlangıçta boş
  currentTest: null,
  timerInterval: null,
  timerSeconds: 0,
  notes: [],
  planItems: [],
  selectedBranch: null,
  gameQuestions: [],
  gameCurrent: 0,
  gameScore: 0,
  gameActive: false,
  foundationProgress: [],
  registeredUsers: [],     // Gerçek kullanıcılar burada birikecek
};

// ─────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────
function showToast(msg, isError=false) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.background = isError ? 'rgba(244,63,94,0.15)' : 'rgba(6,214,160,0.15)';
  t.style.borderColor = isError ? '#f43f5e' : '#06d6a0';
  t.style.color = isError ? '#f43f5e' : '#06d6a0';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'correct') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq; o.type = 'sine';
        g.gain.setValueAtTime(0.25, ctx.currentTime + i*0.13);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.13 + 0.32);
        o.start(ctx.currentTime + i*0.13); o.stop(ctx.currentTime + i*0.13 + 0.32);
      });
    } else if (type === 'wrong') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 180; o.type = 'sawtooth';
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      o.start(); o.stop(ctx.currentTime + 0.45);
    } else if (type === 'level') {
      [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq; o.type = 'triangle';
        g.gain.setValueAtTime(0.2, ctx.currentTime + i*0.11);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.11 + 0.38);
        o.start(ctx.currentTime + i*0.11); o.stop(ctx.currentTime + i*0.11 + 0.38);
      });
    }
  } catch(e) {}
}

function openModal(html, title) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal-box"><div class="modal-header"><span class="modal-title">${title}</span><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button></div>${html}</div>`;
  overlay.addEventListener('click', e => { if(e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

// ─────────────────────────────────────────
// GİRİŞ EKRANI
// ─────────────────────────────────────────
function initLogin() {
  document.querySelectorAll('.class-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.currentClass = btn.dataset.class;
    });
  });
  renderLeagueMiniLogin();
}

function renderLeagueMiniLogin() {
  const el = document.getElementById('league-mini-preview');
  if (!el) return;
  if (state.registeredUsers.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:2rem 1rem;color:var(--text-muted);font-size:0.88rem;">
      <div style="font-size:2.5rem;margin-bottom:0.75rem">🏆</div>
      Lig tablosu henüz boş.<br>İlk kaydolan sen ol!
    </div>`;
    return;
  }
  el.innerHTML = state.registeredUsers.slice(0,3).map((u,i) => `
    <div class="league-mini-item">
      <span class="mini-rank ${['gold','silver','bronze'][i]}">${['🥇','🥈','🥉'][i]}</span>
      <div class="mini-avatar">${u.initials}</div>
      <span class="mini-name">${u.name}</span>
      <span class="mini-pts">${u.points.toLocaleString('tr-TR')} pt</span>
    </div>`).join('');
}

function goToDashboard() {
  if (!state.currentClass) { showToast('Lütfen önce sınıfını seç!', true); return; }
  const nameVal = document.getElementById('login-email').value;
  if (nameVal) {
    const namePart = nameVal.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    state.profile.name = namePart;
    state.profile.email = nameVal;
    state.profile.initials = namePart.split(' ').map(w => w[0]||'').join('').toUpperCase().slice(0,2) || '??';
  }
  // Bu kullanıcıyı lig için kaydet
  const existing = state.registeredUsers.find(u => u.email === state.profile.email);
  if (!existing) {
    state.registeredUsers.push({
      name: state.profile.name || 'Öğrenci',
      initials: state.profile.initials,
      email: state.profile.email,
      grade: state.currentClass,
      points: 0,
      badge: BADGES[0],
    });
  }
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-login').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  document.getElementById('app-shell').style.display = 'flex';
  document.getElementById('sidebar-name').textContent = state.profile.name || 'Öğrenci';
  document.getElementById('sidebar-class').textContent = state.currentClass + '. Sınıf';
  document.getElementById('sidebar-avatar').textContent = state.profile.initials;
  navigate('dashboard');
  initDashboard();
  initLeague();
  initClassroom();
  initTopics();
  initTests();
  initGame();
}

function showForgotPassword() { document.getElementById('forgot-panel').classList.remove('hidden'); }
function hideForgotPassword() { document.getElementById('forgot-panel').classList.add('hidden'); }
function sendResetEmail() {
  const email = document.getElementById('reset-email').value;
  const msg = document.getElementById('reset-msg');
  if (!email) { msg.textContent = '⚠️ E-posta adresini gir.'; msg.style.color = '#f43f5e'; return; }
  msg.style.color = '#06d6a0';
  msg.textContent = `✅ Şifre sıfırlama bağlantısı ${email} adresine gönderildi.`;
}

// ─────────────────────────────────────────
// NAVİGASYON
// ─────────────────────────────────────────
function navigate(section) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`[data-nav="${section}"]`);
  if (navItem) navItem.classList.add('active');
  document.querySelectorAll('.screen-inner').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById(`screen-${section}`);
  if (screen) screen.classList.remove('hidden');
  state.currentNav = section;
  if (section === 'profile') initProfile();
}

// ─────────────────────────────────────────
// ANA SAYFA
// ─────────────────────────────────────────
function initDashboard() {
  document.getElementById('dash-name').textContent = (state.profile.name || 'Öğrenci').split(' ')[0];
  renderDashBadges();
  renderDashPlan();
}

function renderDashBadges() {
  const el = document.getElementById('dash-badge-row');
  el.innerHTML = BADGES.slice(0,6).map(b => `
    <div class="badge-item ${state.earnedBadges.includes(b.id)?'':'locked'}" title="${b.req}">
      <span class="badge-emoji">${b.emoji}</span>
      <span>${b.name}</span>
    </div>`).join('');
}

function renderDashPlan() {
  const el = document.getElementById('dash-plan-list');
  if (!state.planItems.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;">Henüz plan eklenmedi.</div>'; return; }
  el.innerHTML = state.planItems.slice(0,4).map(p => `
    <div class="plan-item-dash">
      <span class="plan-time-badge">${p.time}</span>
      <span class="plan-subject">${p.subject}</span>
      <span class="plan-dur">${p.duration} dk</span>
    </div>`).join('');
}

// ─────────────────────────────────────────
// LİG TABLOSU
// ─────────────────────────────────────────
let currentTier = 10;

function initLeague() {
  renderLeagueTable(10);
  renderBadgeShowcase();
}

function switchLeagueTier(tier, btn) {
  document.querySelectorAll('#league-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTier = tier;
  renderLeagueTable(tier);
}

function renderLeagueTable(tier) {
  const tbody = document.getElementById('league-tbody');
  const sorted = [...state.registeredUsers].sort((a,b) => b.points - a.points);
  const users = sorted.slice(0, tier);
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--text-muted)">
      <div style="font-size:2.5rem;margin-bottom:0.75rem">🏆</div>
      Henüz kayıtlı öğrenci yok.<br>Test çöz, puan kazan, tabloya gir!
    </td></tr>`;
    return;
  }
  tbody.innerHTML = users.map((u,i) => {
    const rank = i+1;
    const isMe = u.email === state.profile.email;
    return `<tr class="${isMe ? 'current-user' : ''}">
      <td><span class="league-rank ${rank<=3?'rank-'+rank:''}">${rank<=3?['🥇','🥈','🥉'][rank-1]:rank}</span></td>
      <td><div class="league-name-cell"><div class="league-avatar">${u.initials}</div>${u.name}${isMe?' (Sen)':''}</div></td>
      <td style="color:var(--text-muted);font-size:0.82rem">${u.grade}. Sınıf</td>
      <td>${u.badge.emoji}</td>
      <td><span class="league-pts">${u.points.toLocaleString('tr-TR')}</span></td>
    </tr>`;
  }).join('');
}

function renderBadgeShowcase() {
  const el = document.getElementById('badge-showcase-grid');
  el.innerHTML = BADGES.map(b => `
    <div class="badge-showcase-item ${state.earnedBadges.includes(b.id)?'':'locked'}">
      <div class="badge-showcase-emoji">${b.emoji}</div>
      <div class="badge-showcase-name">${b.name}</div>
      <div class="badge-showcase-req">${b.req}</div>
    </div>`).join('');
}

// ─────────────────────────────────────────
// PROFİL
// ─────────────────────────────────────────
function initProfile() {
  document.getElementById('profile-name').value = state.profile.name;
  document.getElementById('profile-school').value = state.profile.school;
  document.getElementById('profile-schoolno').value = state.profile.schoolNo;
  document.getElementById('profile-email').value = state.profile.email;
  updateProfileAvatar();
  renderVirtualClass();
  renderNotes();
  renderSkillTree();
}

function updateProfileAvatar() {
  const a = document.getElementById('profile-avatar-display');
  if (state.profile.photo) a.innerHTML = `<img src="${state.profile.photo}" alt="Profil" />`;
  else a.textContent = state.profile.initials || '?';
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.profile.photo = e.target.result;
    updateProfileAvatar();
    const sm = document.getElementById('sidebar-avatar');
    if (sm) { sm.style.background = 'none'; sm.innerHTML = `<img src="${e.target.result}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" />`; }
    showToast('Profil fotoğrafı güncellendi!');
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  state.profile.name = document.getElementById('profile-name').value;
  state.profile.school = document.getElementById('profile-school').value;
  state.profile.schoolNo = document.getElementById('profile-schoolno').value;
  state.profile.email = document.getElementById('profile-email').value;
  const parts = state.profile.name.split(' ');
  state.profile.initials = ((parts[0]?.[0]||'') + (parts[parts.length-1]?.[0]||'')).toUpperCase();
  document.getElementById('sidebar-name').textContent = state.profile.name;
  document.getElementById('sidebar-avatar').textContent = state.profile.initials;
  document.getElementById('dash-name').textContent = state.profile.name.split(' ')[0];
  // Kayıtlı kullanıcı bilgilerini güncelle
  const u = state.registeredUsers.find(u => u.email === state.profile.email);
  if (u) { u.name = state.profile.name; u.initials = state.profile.initials; }
  showToast('Profil kaydedildi! ✅');
}

function openEOkul() {
  openModal(`
    <div style="text-align:center;padding:0.5rem 0">
      <div style="font-size:2.8rem;margin-bottom:0.75rem">🏫</div>
      <h3 style="font-family:'Outfit',sans-serif;font-weight:800;margin-bottom:0.5rem;color:var(--accent-cyan)">e-Okul Entegrasyonu</h3>
      <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:1.5rem">Not ve devamsızlık bilgilerinizi aşağıya yapıştırın, Yapay Zeka analiz etsin!</p>
      <div class="form-group">
        <label style="text-align:left">e-Okul'dan aldığınız not/devamsızlık bilgileri:</label>
        <textarea id="eokul-data" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:1rem;color:#f0f4ff;font-size:0.88rem;min-height:140px;width:100%;resize:vertical;font-family:'Inter',sans-serif" placeholder="Örnek: Matematik: 75, Fizik: 82, Devamsızlık: 4 gün..."></textarea>
      </div>
      <button class="btn-primary" onclick="analyzeEOkul()" style="margin-bottom:1rem">🤖 Yapay Zeka ile Analiz Et</button>
      <div id="eokul-analysis" style="text-align:left;display:none;background:rgba(6,214,160,0.05);border:1px solid rgba(6,214,160,0.2);border-radius:12px;padding:1.25rem;font-size:0.88rem;line-height:1.7"></div>
      <hr style="border-color:rgba(255,255,255,0.1);margin:1rem 0">
      <a href="https://e-okul.meb.gov.tr" target="_blank" rel="noopener" style="text-decoration:none">
        <button class="btn-outline">🔗 e-Okul Sitesine Git</button>
      </a>
    </div>`, '🏫 e-Okul Entegrasyonu');
}

function switchProfileTab(tab, btn) {
  document.querySelectorAll('.profile-tab-content').forEach(t => t.classList.add('hidden'));
  document.getElementById(`profile-tab-${tab}`).classList.remove('hidden');
  document.querySelectorAll('.profile-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function renderVirtualClass() {
  const el = document.getElementById('virtual-class-list');
  const classmates = state.registeredUsers
    .filter(u => u.grade === state.currentClass && u.email !== state.profile.email)
    .sort((a,b) => b.points - a.points);
  if (!classmates.length) {
    el.innerHTML = `<div style="text-align:center;padding:2.5rem;color:var(--text-muted)">
      <div style="font-size:2.5rem;margin-bottom:0.75rem">👥</div>
      ${state.currentClass}. sınıfta henüz başka öğrenci yok.<br>
      <span style="font-size:0.82rem">Arkadaşlarını platforma davet et!</span>
    </div>`;
    return;
  }
  el.innerHTML = classmates.map((u,i) => `
    <div class="virtual-student-item">
      <span class="vs-rank">#${i+1}</span>
      <div class="vs-avatar">${u.initials}</div>
      <span class="vs-name">${u.name}</span>
      <span class="vs-score">${u.points} pt</span>
      <span class="vs-badge">${u.badge.emoji}</span>
    </div>`).join('');
}

// Sanal Defter
function renderNotes() {
  const el = document.getElementById('notebook-notes');
  if (!state.notes.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:0.5rem;">Henüz not yok. Aşağıdan ekle.</div>'; return; }
  el.innerHTML = state.notes.map((n,i) => `
    <div class="note-card">
      <div class="note-card-date">${n.date}</div>
      <div class="note-card-content">${n.content}</div>
    </div>`).join('');
}
function formatNote(cmd) { document.getElementById('note-editor').focus(); document.execCommand(cmd, false, null); }
function saveNote() {
  const editor = document.getElementById('note-editor');
  const content = editor.innerHTML.trim();
  if (!content) { showToast('Not boş olamaz!', true); return; }
  state.notes.unshift({ content, date: new Date().toLocaleDateString('tr-TR') });
  editor.innerHTML = '';
  renderNotes();
  showToast('Not kaydedildi! 📓');
}
function addNote() { document.getElementById('note-editor').focus(); }

// Skill Tree
function renderSkillTree() {
  const el = document.getElementById('skill-tree');
  el.innerHTML = FOUNDATION_GRADES.map((g, gi) => {
    const prog = state.foundationProgress.find(p => p.grade === g.grade);
    const completed = prog ? prog.completed : [];
    const prevDone = gi === 0 || (state.foundationProgress.find(p => p.grade === FOUNDATION_GRADES[gi-1].grade)?.completed.length >= FOUNDATION_GRADES[gi-1].topics.length);
    return `<div class="skill-grade">
      <span class="skill-grade-label">${g.grade}</span>
      <div class="skill-chips">
        ${g.topics.map((t, ti) => {
          const done = completed.includes(ti);
          const locked = !prevDone || (!done && ti > 0 && !completed.includes(ti-1));
          const cls = done ? 'completed' : locked ? 'locked' : 'unlocked';
          return `<button class="skill-chip ${cls}" onclick="doFoundationTopic(${gi},${ti},'${t}')">${done?'✅ ':locked?'🔒 ':'▶ '}${t}</button>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}
function doFoundationTopic(gi, ti, topic) {
  const g = FOUNDATION_GRADES[gi];
  let prog = state.foundationProgress.find(p => p.grade === g.grade);
  if (!prog) { prog = { grade: g.grade, completed: [] }; state.foundationProgress.push(prog); }
  if (!prog.completed.includes(ti)) { prog.completed.push(ti); showToast(`${topic} tamamlandı! 🎉`); }
  renderSkillTree();
}

// ─────────────────────────────────────────
// DERSLİK
// ─────────────────────────────────────────
function initClassroom() {
  const gradeSubjects = GRADE_SUBJECTS[state.currentClass] || GRADE_SUBJECTS['9'];
  const subjectOpts = Object.keys(gradeSubjects).map(s => `<option value="${s}">${s}</option>`).join('');
  document.getElementById('plan-subject').innerHTML = '<option value="">Ders Seç</option>' + subjectOpts;
  renderPlanSchedule();
}

function onBranchChange() {
  const val = document.getElementById('vocational-branch').value;
  state.selectedBranch = val;
  const el = document.getElementById('my-courses');
  if (!val) { el.innerHTML = ''; return; }
  const branch = VOCATIONAL[val];
  if (!branch) return;
  const allCourses = [...branch.kulturDersleri, ...branch.meslekDersleri];
  document.getElementById('plan-subject').innerHTML = '<option value="">Ders Seç</option>' + allCourses.map(c => `<option value="${c}">${c}</option>`).join('');
  el.innerHTML = `<div class="section-label" style="margin-top:1rem">📚 Derslerim — ${branch.label}</div>` +
    branch.kulturDersleri.map(c => `<div class="course-chip"><span class="course-type kultur">Kültür</span>${c}</div>`).join('') +
    branch.meslekDersleri.map(c => `<div class="course-chip"><span class="course-type meslek">Meslek</span>${c}</div>`).join('');
}

function addPlanItem() {
  const subject = document.getElementById('plan-subject').value;
  const time = document.getElementById('plan-time').value;
  const duration = document.getElementById('plan-duration').value;
  if (!subject || !time) { showToast('Ders ve saat seçin!', true); return; }
  state.planItems.push({ subject, time, duration: duration || 45 });
  state.planItems.sort((a,b) => a.time.localeCompare(b.time));
  renderPlanSchedule();
  renderDashPlan();
  showToast(`${subject} plana eklendi!`);
  scheduleNotification(subject, time);
}

function scheduleNotification(subject, time) {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(perm => {
    if (perm !== 'granted') return;
    const now = new Date();
    const [h,m] = time.split(':').map(Number);
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const diff = target - now;
    if (diff > 0 && diff < 24*60*60*1000) {
      setTimeout(() => new Notification('📚 BilgiEvi Hatırlatıcı', { body: `${subject} çalışma saatin geldi!` }), diff);
    }
  });
}

function renderPlanSchedule() {
  const el = document.getElementById('plan-schedule');
  if (!state.planItems.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;">Plan boş. Yukarıdan ekle.</div>'; return; }
  el.innerHTML = state.planItems.map((p,i) => `
    <div class="plan-schedule-item">
      <span class="plan-time-badge">${p.time}</span>
      <span class="plan-subject">${p.subject}</span>
      <span class="plan-dur">${p.duration} dk</span>
      <button class="plan-remove-btn" onclick="removePlanItem(${i})">✕</button>
    </div>`).join('');
}
function removePlanItem(i) { state.planItems.splice(i,1); renderPlanSchedule(); renderDashPlan(); }

// ─────────────────────────────────────────
// KONU ANLATIMI
// ─────────────────────────────────────────
let selectedSubject = null;

function initTopics() {
  const gradeSubjects = GRADE_SUBJECTS[state.currentClass] || GRADE_SUBJECTS['9'];
  const el = document.getElementById('subject-list');
  el.innerHTML = Object.entries(gradeSubjects).map(([name]) => {
    const icon = { 'Matematik':'📐','Fizik':'⚡','Kimya':'🧪','Biyoloji':'🧬','Türk Dili':'📜','Tarih':'🏛️','İngilizce':'🌍','Coğrafya':'🗺️' }[name] || '📚';
    return `<li class="subject-item" onclick="selectSubject('${name}')" ><span>${icon}</span> ${name}</li>`;
  }).join('');
}

function selectSubject(name) {
  selectedSubject = name;
  document.querySelectorAll('.subject-item').forEach(s => { s.classList.toggle('active', s.textContent.trim().includes(name)); });
  document.getElementById('topic-placeholder').classList.add('hidden');
  document.getElementById('video-player-section').classList.add('hidden');
  document.getElementById('topic-selector').classList.remove('hidden');
  document.getElementById('selected-subject-name').textContent = name + ' Konuları';
  const gradeSubjects = GRADE_SUBJECTS[state.currentClass] || GRADE_SUBJECTS['9'];
  const topics = gradeSubjects[name] || [];
  document.getElementById('topic-list').innerHTML = topics.map(t =>
    `<li class="topic-item" onclick="selectTopic('${t}','${name}')">${t}</li>`).join('');
}

async function selectTopic(topic, subjectName) {
  document.getElementById('topic-selector').classList.add('hidden');
  document.getElementById('video-player-section').classList.remove('hidden');
  document.getElementById('video-title').textContent = topic;

  // Statik veritabanında video varsa direkt göster
  const staticVid = VIDEO_DB[topic];
  const iframe = document.getElementById('youtube-iframe');
  const vmTitle = document.getElementById('vm-title');
  const vmCh = document.getElementById('vm-channel');

  if (staticVid) {
    iframe.src = `https://www.youtube.com/embed/${staticVid.id}?rel=0`;
    vmTitle.textContent = staticVid.title;
    vmCh.textContent = '📺 ' + staticVid.ch;
  } else {
    // Gemini ile en iyi YouTube sorgusu oluştur
    vmTitle.textContent = '🔍 Video aranıyor...';
    vmCh.textContent = '';
    iframe.src = '';
    try {
      const result = await geminiSuggestVideoSearch(state.currentClass, subjectName, topic);
      iframe.src = result.embedSearch;
      vmTitle.textContent = `${subjectName} — ${topic}`;
      vmCh.textContent = `🔍 "${result.query}" araması | `;
      // YouTube arama linki ekle
      const link = document.createElement('a');
      link.href = result.searchUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'YouTube’da Aç ↗';
      link.style.cssText = 'color:var(--accent-blue);font-size:0.82rem;text-decoration:underline;';
      vmCh.appendChild(link);
    } catch {
      const q = encodeURIComponent(`${state.currentClass} sınıf ${subjectName} ${topic} konu anlatımı`);
      iframe.src = `https://www.youtube.com/embed?listType=search&list=${q}&rel=0`;
      vmTitle.textContent = `${subjectName} — ${topic}`;
      vmCh.textContent = 'YouTube’da Arama';
    }
  }

  // AI konu özeti butonu göster
  const summaryBtn = document.getElementById('ai-summary-btn');
  if (summaryBtn) {
    summaryBtn.classList.remove('hidden');
    summaryBtn.onclick = () => showTopicSummary(subjectName, topic);
  }
}

function backToTopics() {
  document.getElementById('youtube-iframe').src = '';
  document.getElementById('video-player-section').classList.add('hidden');
  document.getElementById('topic-selector').classList.remove('hidden');
  const summaryBtn = document.getElementById('ai-summary-btn');
  if (summaryBtn) summaryBtn.classList.add('hidden');
}

// e-Okul not analizi
async function analyzeEOkul() {
  const data = document.getElementById('eokul-data')?.value?.trim();
  const resultEl = document.getElementById('eokul-analysis');
  if (!data) { showToast('Lütfen not bilgilerini girin!', true); return; }
  if (!resultEl) return;
  resultEl.style.display = 'block';
  resultEl.innerHTML = '⏳ Yapay zeka analiz ediyor...';
  try {
    const analysis = await geminiAnalyzeGrades(data);
    resultEl.innerHTML = analysis
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/^## (.*)/gm, '<h4 style="color:var(--accent-cyan);margin:0.75rem 0 0.3rem">$1</h4>')
      .replace(/^# (.*)/gm, '<h3 style="color:var(--accent-blue);margin:0.75rem 0 0.3rem">$1</h3>');
  } catch (e) {
    resultEl.innerHTML = '❌ Analiz yapılamadı. Lütfen tekrar deneyin.';
  }
}

// Konu özeti modal
async function showTopicSummary(subject, topic) {
  const html = `<div id="summary-content" style="white-space:pre-wrap;line-height:1.75;font-size:0.9rem">⏳ Konu özeti hazırlanıyor...</div>`;
  openModal(html, `📚 ${topic} — AI Konu Özeti`);
  try {
    const summary = await geminiTopicSummary(state.currentClass, subject, topic);
    const el = document.getElementById('summary-content');
    if (el) el.innerHTML = summary
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/^## (.*)/gm, '<h4 style="color:var(--accent-violet);margin:0.75rem 0 0.25rem">$1</h4>')
      .replace(/^### (.*)/gm, '<h5 style="color:var(--accent-blue);margin:0.5rem 0 0.15rem">$1</h5>');
  } catch (e) {
    const el = document.getElementById('summary-content');
    if (el) el.textContent = 'Özet oluşturulamadı. İnternet bağlantınızı kontrol edin.';
  }
}


// ─────────────────────────────────────────
// TEST MODÜLÜ
// ─────────────────────────────────────────
let userAnswers = [];
let testQuestions = [];

function initTests() {
  populateTestSubjects();
  renderHistoryTable();
}

function populateTestSubjects() {
  const el = document.getElementById('test-subject');
  const gradeSubjects = GRADE_SUBJECTS[state.currentClass] || GRADE_SUBJECTS['9'];
  el.innerHTML = '<option value="">— Ders Seç —</option>' +
    Object.keys(gradeSubjects).map(s => `<option value="${s}">${s}</option>`).join('');
  document.getElementById('test-topic').innerHTML = '<option value="">— Önce Ders Seç —</option>';
  const badge = document.getElementById('test-grade-display');
  if (badge) badge.textContent = state.currentClass + '.';
}

function onTestSubjectChange() {
  const subject = document.getElementById('test-subject').value;
  const topicEl = document.getElementById('test-topic');
  if (!subject) { topicEl.innerHTML = '<option value="">— Önce Ders Seç —</option>'; return; }
  const gradeSubjects = GRADE_SUBJECTS[state.currentClass] || GRADE_SUBJECTS['9'];
  const topics = gradeSubjects[subject] || [];
  topicEl.innerHTML = '<option value="all">Tüm Konular</option>' + topics.map(t => `<option value="${t}">${t}</option>`).join('');
}

function switchTestTab(tab, btn) {
  document.querySelectorAll('.tests-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('test-tab-create').classList.toggle('hidden', tab !== 'create');
  document.getElementById('test-tab-history').classList.toggle('hidden', tab !== 'history');
  if (tab === 'history') renderHistoryTable();
}

async function generateTest() {
  const subject = document.getElementById('test-subject').value;
  const topic = document.getElementById('test-topic').value;
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  const qcount = parseInt(document.querySelector('input[name="qcount"]:checked').value);

  if (!subject) { showToast('Lütfen bir ders seç!', true); return; }
  if (!topic) { showToast('Lütfen bir konu seç!', true); return; }

  const btn = document.getElementById('generate-btn-text');
  btn.innerHTML = '⏳ Yapay Zeka hazırlıyor...';
  document.getElementById('generate-btn-text').parentElement.disabled = true;

  try {
    // Gemini API ile soru üret
    const questions = await geminiGenerateTest(state.currentClass, subject, topic, qcount, difficulty);
    if (!questions || questions.length < 3) throw new Error('Yetersiz soru');
    
    testQuestions = questions;
    userAnswers = new Array(testQuestions.length).fill(-1);

    document.getElementById('test-setup').classList.add('hidden');
    document.getElementById('test-active').classList.remove('hidden');
    document.getElementById('test-result').classList.add('hidden');
    document.getElementById('test-info-label').textContent =
      `${subject} — ${topic === 'all' ? 'Tüm Konular' : topic} — ${difficulty==='easy'?'Kolay':difficulty==='medium'?'Orta':'Zor'} — ${testQuestions.length} Soru`;

    renderQuestions();
    startTimer();
  } catch (e) {
    console.warn('Gemini hatası, statik bankaya dönülüyor:', e);
    const questions = pickQuestions(subject, topic, qcount, difficulty);
    if (!questions.length) {
        showToast('Test oluşturulamadı (Hata: ' + e.message + ')', true);
        btn.innerHTML = '🤖 Test Oluştur';
        document.getElementById('generate-btn-text').parentElement.disabled = false;
        return;
    }
    testQuestions = questions;
    userAnswers = new Array(testQuestions.length).fill(-1);
    document.getElementById('test-setup').classList.add('hidden');
    document.getElementById('test-active').classList.remove('hidden');
    renderQuestions();
    startTimer();
  } finally {
    btn.innerHTML = '🤖 Test Oluştur';
    document.getElementById('generate-btn-text').parentElement.disabled = false;
  }
}

function pickQuestions(subject, topicKey, count, difficulty) {
  const grade = state.currentClass;
  const bank = QUESTION_BANK[grade]?.[subject];
  if (!bank) return [];
  let pool = [];
  if (topicKey === 'all') {
    Object.values(bank).forEach(qs => pool.push(...qs));
  } else {
    pool = bank[topicKey] || [];
  }
  if (!pool.length) return [];
  // Shuffle
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  // Adjust for difficulty: easy=first half, hard=last half, medium=mix
  let selected;
  if (difficulty === 'easy') selected = shuffled.slice(0, Math.min(count, shuffled.length));
  else if (difficulty === 'hard') selected = shuffled.slice(-Math.min(count, shuffled.length));
  else selected = shuffled;
  // Repeat if not enough
  while (selected.length < count) selected = [...selected, ...shuffled];
  return selected.slice(0, count).map(q => ({ ...q, subject, topicKey }));
}

function renderQuestions() {
  const el = document.getElementById('questions-container');
  el.innerHTML = testQuestions.map((q, qi) => `
    <div class="question-card" id="qcard-${qi}">
      <div class="question-num">Soru ${qi+1} ${q.topicKey && q.topicKey !== 'all' ? `<span style="color:var(--accent-violet);font-size:0.7rem">${q.topicKey}</span>`:''}</div>
      ${q.visual ? `<div class="question-visual">${q.visual}</div>` : ''}
      <div class="question-text">${q.text}</div>
      <div class="options-grid">
        ${q.opts.map((opt, oi) => `
          <button class="option-btn" id="opt-${qi}-${oi}" onclick="selectAnswer(${qi},${oi})">
            <span class="option-letter">${'ABCD'[oi]}</span>${opt}
          </button>`).join('')}
      </div>
    </div>`).join('');
}

function selectAnswer(qi, oi) {
  userAnswers[qi] = oi;
  document.querySelectorAll(`#qcard-${qi} .option-btn`).forEach(b => b.classList.remove('selected'));
  document.getElementById(`opt-${qi}-${oi}`).classList.add('selected');
}

function startTimer() {
  state.timerSeconds = 0;
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timerSeconds++;
    const m = String(Math.floor(state.timerSeconds/60)).padStart(2,'0');
    const s = String(state.timerSeconds%60).padStart(2,'0');
    document.getElementById('test-timer').textContent = `⏱ ${m}:${s}`;
  }, 1000);
}

function submitTest() {
  clearInterval(state.timerInterval);
  const duration = Math.round(state.timerSeconds/60);
  let correct=0, wrong=0, empty=0;
  testQuestions.forEach((q,i) => {
    if (userAnswers[i]===-1) empty++;
    else if (userAnswers[i]===q.ans) correct++;
    else wrong++;
  });
  const score = Math.round((correct / testQuestions.length) * 100);
  const subject = testQuestions[0]?.subject || 'Bilinmiyor';
  const topicLabel = testQuestions[0]?.topicKey !== 'all' ? testQuestions[0]?.topicKey : 'Karma';
  const wrongTopics = [...new Set(testQuestions.filter((_,i) => userAnswers[i] !== testQuestions[i].ans && userAnswers[i] !== -1).map(q => q.topicKey || q.subject))];

  state.testHistory.unshift({ date: new Date().toLocaleDateString('tr-TR'), subject, topic: topicLabel, duration, score, correct, wrong, empty: empty, wrongTopics });

  // Puan ekle
  const pts = correct * 10;
  addPoints(pts);

  document.getElementById('test-active').classList.add('hidden');
  document.getElementById('test-result').classList.remove('hidden');
  document.getElementById('result-score-num').textContent = score;
  document.getElementById('result-score-circle').style.background =
    score >= 70 ? 'linear-gradient(135deg,#06d6a0,#4f8ef7)' :
    score >= 50 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' :
                  'linear-gradient(135deg,#f43f5e,#8b5cf6)';
  document.getElementById('r-correct').textContent = correct;
  document.getElementById('r-wrong').textContent = wrong;
  document.getElementById('r-empty').textContent = empty;

  const tagsEl = document.getElementById('wrong-tags');
  tagsEl.innerHTML = wrongTopics.length
    ? wrongTopics.map(t => `<span class="wrong-tag">${t}</span>`).join('')
    : '<span style="color:var(--accent-cyan)">Tüm soruları doğru cevapladın! 🎉</span>';

  renderReview();
  if (score===100) { state.earnedBadges.push('perfect'); renderBadgeShowcase(); showToast('💯 Mükemmelci rozeti kazandın!'); }
  renderHistoryTable();
}

function addPoints(pts) {
  const u = state.registeredUsers.find(u => u.email === state.profile.email);
  if (u) u.points += pts;
}

function renderReview() {
  const el = document.getElementById('result-review');
  el.innerHTML = '<h3 class="section-title">🔍 Soru İncelemesi</h3>' +
    testQuestions.map((q,i) => {
      const ua = userAnswers[i];
      const isCorrect = ua === q.ans;
      const isEmpty = ua === -1;
      return `<div class="review-q">
        ${q.visual ? `<div class="question-visual">${q.visual}</div>` : ''}
        <div class="review-q-text">${i+1}. ${q.text}</div>
        <div class="review-answer-row">
          <span class="review-correct">✅ Doğru: ${q.opts[q.ans]}</span>
          ${!isEmpty && !isCorrect ? `<span class="review-user">❌ Seçilen: ${q.opts[ua]}</span>` : ''}
          ${isEmpty ? `<span style="color:var(--text-muted)">⬜ Boş</span>` : ''}
          <button class="review-ai-btn" onclick="askAI('${q.text.replace(/'/g,"\\'").replace(/\n/g,' ')}', '${(q.opts[q.ans]||'').replace(/'/g,"\\'")}')">🤖 Yapay Zekaya Sor</button>
        </div>
      </div>`;
    }).join('');
}

function askAI(question, correctAnswer) {
  if (!state.earnedBadges.includes('ai')) { state.earnedBadges.push('ai'); showToast('🤖 AI Avcısı rozeti kazandın!'); renderBadgeShowcase(); }
  const chatHtml = `
    <div class="ai-chat-area" id="ai-chat">
      <div class="ai-msg user"><b>Sorum:</b> ${question}</div>
      <div class="ai-msg bot" id="ai-bot-msg">⏳ Yapay zeka analiz ediyor...</div>
    </div>
    <div class="ai-input-row">
      <input type="text" class="form-input" id="ai-user-input" placeholder="Başka bir şey sor..." onkeydown="if(event.key==='Enter')sendAIMessage()"/>
      <button class="btn-primary" style="width:auto;padding:0.7rem 1.2rem" onclick="sendAIMessage()">Gönder</button>
    </div>`;
  openModal(chatHtml, '🤖 Yapay Zeka Asistanı');
  setTimeout(() => {
    const el = document.getElementById('ai-bot-msg');
    if (el) el.innerHTML = `Bu soruyu adım adım inceleyelim:<br><br>
      <b>✅ Doğru Cevap:</b> ${correctAnswer}<br><br>
      <b>📌 Açıklama:</b> Bu soruyu çözmek için ilgili konunun temel formül ve kavramlarını hatırlamak gerekir.
      Yanlış seçenekler genellikle hesaplama hataları veya kavram karışıklığından kaynaklanır.<br><br>
      <b>💡 Öneri:</b> Konu anlatımı bölümünden bu konunun videosunu izlemeni tavsiye ederim. Tekrar test çözerek pekiştir! 💪`;
  }, 1100);
}

async function sendAIMessage() {
  const input = document.getElementById('ai-user-input');
  const chat = document.getElementById('ai-chat');
  if (!input || !chat || !input.value.trim()) return;
  const userText = input.value.trim();
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user'; userMsg.textContent = userText;
  chat.appendChild(userMsg);
  const botMsg = document.createElement('div');
  botMsg.className = 'ai-msg bot'; botMsg.innerHTML = '⏳ Düşünüyorum...';
  chat.appendChild(botMsg);
  input.value = '';
  chat.scrollTop = chat.scrollHeight;

  try {
    const reply = await callGemini(`Sen bir Türk lise öğretmenisin. Öğrenci sana bir soru sordu:\n\n${userText}\n\nKısa, net ve Türkçe cevap ver (maks 150 kelime).`, 0.6);
    botMsg.innerHTML = reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  } catch {
    botMsg.textContent = 'Bu konuyu pekiştirmek için konu anlatımı videolarını izlemeni öneririm. Başarılar! 🎓';
  }
  chat.scrollTop = chat.scrollHeight;
}

function newTest() {
  document.getElementById('test-setup').classList.remove('hidden');
  document.getElementById('test-active').classList.add('hidden');
  document.getElementById('test-result').classList.add('hidden');
  document.getElementById('test-topic').innerHTML = '<option value="">— Önce Ders Seç —</option>';
  document.getElementById('test-subject').value = '';
}

function renderHistoryTable() {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;
  if (!state.testHistory.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted)">Henüz test çözülmedi.</td></tr>';
    return;
  }
  tbody.innerHTML = state.testHistory.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.subject}</td>
      <td style="font-size:0.8rem;color:var(--text-muted)">${t.topic||'—'}</td>
      <td>${t.duration} dk</td>
      <td><b>${t.score}</b></td>
      <td style="color:#06d6a0">${t.correct}</td>
      <td style="color:#f43f5e">${t.wrong}</td>
      <td style="color:var(--text-muted)">${t.empty||0}</td>
    </tr>`).join('');
}

// ─────────────────────────────────────────
// OYUN MODÜLÜ — BİLGİ YARIŞMASI
// ─────────────────────────────────────────
function initGame() {
  const gradeSubjects = GRADE_SUBJECTS[state.currentClass] || GRADE_SUBJECTS['9'];
  const el = document.getElementById('game-subject-select');
  el.innerHTML = '<option value="all">Karma (Tüm Dersler)</option>' +
    Object.keys(gradeSubjects).map(s => `<option value="${s}">${s}</option>`).join('');
}

function startGame() {
  const subject = document.getElementById('game-subject-select').value;
  const grade = state.currentClass;
  const bank = QUESTION_BANK[grade] || QUESTION_BANK['9'];
  let pool = [];
  if (subject === 'all') {
    Object.values(bank).forEach(topics => Object.values(topics).forEach(qs => pool.push(...qs)));
  } else {
    const topicBank = bank[subject];
    if (topicBank) Object.values(topicBank).forEach(qs => pool.push(...qs));
  }
  if (pool.length < 5) {
    // Fallback: use all grades
    Object.values(QUESTION_BANK).forEach(gBank => Object.values(gBank).forEach(tBank => Object.values(tBank).forEach(qs => pool.push(...qs))));
  }
  state.gameQuestions = [...pool].sort(() => Math.random()-0.5).slice(0,15);
  state.gameCurrent = 0;
  state.gameScore = 0;
  state.gameActive = true;

  document.getElementById('game-intro').classList.add('hidden');
  document.getElementById('game-over').classList.add('hidden');
  document.getElementById('game-play').classList.remove('hidden');
  renderGameQuestion();
  renderPrizeLadder();
  updateGameUI();
}

function renderGameQuestion() {
  const q = state.gameQuestions[state.gameCurrent];
  if (!q) { endGame(true); return; }
  document.getElementById('game-question-text').textContent = q.text;
  document.getElementById('gq-num-display').textContent = state.gameCurrent + 1;
  document.getElementById('game-q-num').textContent = state.gameCurrent + 1;

  // Görsel varsa ata
  const visualEl = document.getElementById('game-visual-area');
  if (visualEl) visualEl.innerHTML = q.visual || '';

  const optEl = document.getElementById('game-options');
  optEl.innerHTML = q.opts.map((opt, i) => `
    <button class="game-opt-btn" id="gopt-${i}" onclick="chooseAnswer(${i})">
      <span class="game-opt-letter">${'ABCD'[i]}</span>${opt}
    </button>`).join('');
}

function chooseAnswer(idx) {
  if (!state.gameActive) return;
  const q = state.gameQuestions[state.gameCurrent];
  document.querySelectorAll('.game-opt-btn').forEach(b => b.onclick = null);
  if (idx === q.ans) {
    document.getElementById(`gopt-${idx}`).classList.add('correct');
    state.gameScore += PRIZE_LADDER[state.gameCurrent] || 0;
    updateGameUI(); playSound('correct'); updatePrizeLadder();
    setTimeout(() => {
      state.gameCurrent++;
      if (state.gameCurrent >= state.gameQuestions.length) endGame(true);
      else { renderGameQuestion(); updatePrizeLadder(); }
    }, 900);
  } else {
    document.getElementById(`gopt-${idx}`).classList.add('wrong');
    document.getElementById(`gopt-${q.ans}`).classList.add('correct');
    playSound('wrong');
    setTimeout(() => endGame(false), 1200);
  }
}

function updateGameUI() { document.getElementById('game-score').textContent = state.gameScore.toLocaleString('tr-TR'); }

function renderPrizeLadder() {
  const el = document.getElementById('game-prize-ladder');
  el.innerHTML = PRIZE_LADDER.slice(0,15).map((p,i) =>
    `<div class="prize-step ${i===state.gameCurrent?'current':i<state.gameCurrent?'passed':''}" id="prize-${i}">${p.toLocaleString('tr-TR')} pt</div>`).join('');
}

function updatePrizeLadder() {
  PRIZE_LADDER.slice(0,15).forEach((_,i) => {
    const el = document.getElementById(`prize-${i}`);
    if (el) el.className = `prize-step ${i===state.gameCurrent?'current':i<state.gameCurrent?'passed':''}`;
  });
}

function endGame(success) {
  state.gameActive = false;
  document.getElementById('game-play').classList.add('hidden');
  document.getElementById('game-over').classList.remove('hidden');
  if (success) {
    document.getElementById('game-over-emoji').textContent = '🎉';
    document.getElementById('game-over-title').textContent = 'Tebrikler!';
    document.getElementById('game-over-sub').textContent = 'Tüm soruları tamamladın!';
    playSound('level');
    addPoints(state.gameScore);
  } else {
    document.getElementById('game-over-emoji').textContent = '😢';
    document.getElementById('game-over-title').textContent = 'Yanlış Cevap!';
    document.getElementById('game-over-sub').textContent = `${state.gameCurrent + 1}. soruda elendi.`;
  }
  document.getElementById('game-final-score').textContent = state.gameScore.toLocaleString('tr-TR') + ' Puan';
}

function restartGame() { document.getElementById('game-over').classList.add('hidden'); document.getElementById('game-intro').classList.remove('hidden'); }
function quitGame() { state.gameActive = false; document.getElementById('game-play').classList.add('hidden'); document.getElementById('game-intro').classList.remove('hidden'); }

// ─────────────────────────────────────────
// BAŞLANGIÇ
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { initLogin(); });
