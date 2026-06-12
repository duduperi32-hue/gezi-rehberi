// ============================================
// MURDER DRONES 3D - DIALOGUE SYSTEM DATA
// All dialogue content for Chapter 1: Pilot (Accurate Script)
// ============================================

window.DialogueData = {
  // ==========================================
  // TEACHER
  // ==========================================
  teacher: {
    name: "Öğretmen",
    color: "#888888",
    portrait: "teacher",
    greeting: [
      {
        id: "teacher_greet_1",
        lines: [
          { speaker: "Öğretmen", text: "Uzi... Ödevin hakkında ne söylemek istersin?", emotion: "bored" }
        ],
        choices: [
          { text: "Su karpuzları hakkında çalışmak yerine bir RAILGUN yaptım!", next: "teacher_railgun", relationship: 0 }
        ]
      }
    ],
    quests: {
      teacher_railgun: {
        lines: [
          { speaker: "Uzi", text: "Bununla dışarı çıkıp o Disassembly Drone'ları yok edeceğim!", emotion: "proud" },
          { speaker: "Öğretmen", text: "...(İç çeker) Silahını al ve revire git lütfen.", emotion: "bored" }
        ],
        choices: [
          { text: "Beni kimse durduramaz! (Sınıftan çık)", next: null }
        ]
      }
    }
  },

  // ==========================================
  // THAD
  // ==========================================
  thad: {
    name: "Thad",
    color: "#2ECC71",
    portrait: "thad",
    greeting: [
      {
        id: "thad_greet_1",
        lines: [
          { speaker: "Thad", text: "Vay canına Uzi! Elindeki o silah çok havalı görünüyor.", emotion: "impressed" },
          { speaker: "Thad", text: "Ben Thad bu arada. Kapıların ardına geçip onlarla savaşacağın doğru mu?", emotion: "curious" }
        ],
        choices: [
          { text: "Evet, o canavarlara gerçek bir ısırık göstereceğim.", next: "thad_support", relationship: 5 }
        ]
      }
    ],
    quests: {
      thad_support: {
        lines: [
          { speaker: "Thad", text: "Sen ciddisin! Vay be... bol şans o zaman. Dikkatli ol Uzi.", emotion: "worried" }
        ],
        choices: [
          { text: "Görüşürüz Thad.", next: null }
        ]
      }
    }
  },

  // ==========================================
  // KHAN DOORMAN
  // ==========================================
  khan: {
    name: "Khan Doorman",
    color: "#AAAAAA",
    portrait: "khan",
    greeting: [
      {
        id: "khan_greet_1",
        lines: [
          { speaker: "Khan", text: "Ah, Uzi! Kapılarıma bak. Kapı 1, Kapı 2 ve Kapı 3...", emotion: "proud" },
          { speaker: "Khan", text: "Dışarıdaki canavarlara karşı en büyük savunmamız. Babanla gurur duyuyor musun?", emotion: "happy" },
          { speaker: "Khan", text: "Elindeki o icat da ne? Umarım tehlikeli bir şey değildir.", emotion: "curious" }
        ],
        choices: [
          { text: "Sadece okul için bir kapı mekanizması projesi baba...", next: "khan_lie", relationship: 2 }
        ]
      }
    ],
    quests: {
      khan_lie: {
        lines: [
          { speaker: "Khan", text: "Kapı projesi mi?! Aman Tanrım, benim izimden gidiyorsun!", emotion: "excited" },
          { speaker: "Khan", text: "İşte, Master Key (Ana Anahtar). Bununla tüm kapıları kontrol edebilirsin. Git ve dışarıdaki mekanizmayı ölç!", emotion: "proud" }
        ],
        choices: [
          { text: "(Master Key'i al ve kapılara yönel)", next: null, action: "get_master_key" }
        ]
      }
    }
  },

  // ==========================================
  // SERIAL DESIGNATION N
  // ==========================================
  n: {
    name: "Serial Designation N",
    color: "#FFD700",
    portrait: "n",
    greeting: [
      {
        id: "n_greet_1",
        lines: [
          { speaker: "N", text: "(Kafası karışmış halde bakar) Oh, hey! Sen aramıza yeni katılan çaylak olmalısın!", emotion: "cheerful" },
          { speaker: "N", text: "Ben N. Şirket seni bize yardım etmen için gönderdi sanırım? Biraz... kısa boylusun.", emotion: "curious" },
          { speaker: "Uzi", text: "(Bu da ne? Beni onlardan biri mi sandı?)", emotion: "surprised" }
        ],
        choices: [
          { text: "Aynen öyle! Ben de bir... Cinayet Dronuyum. Adım Uzi.", next: "n_friend", relationship: 5 }
        ]
      }
    ],
    quests: {
      n_friend: {
        lines: [
          { speaker: "N", text: "Harika! Bir arkadaş edinmek çok güzel. V ve J genelde bana pek iyi davranmazlar.", emotion: "happy" },
          { speaker: "N", text: "Ama bekle... gözlerin sarı değil? Ve şu elindeki şey nedir?", emotion: "curious" },
          { speaker: "Uzi", text: "Eh... bu özel bir donanım! Ve... ah, arkanızda J geliyor!", emotion: "nervous" }
        ],
        choices: [
          { text: "Savaş Başlasın!", next: "n_help", action: "start_wave" }
        ]
      },
      n_help: {
        lines: [
          { speaker: "N", text: "Bir dakika, neden savaşıyoruz?!", emotion: "confused" }
        ],
        choices: [
          { text: "Hücum!", next: null, action: "start_wave" }
        ]
      }
    }
  }
};
