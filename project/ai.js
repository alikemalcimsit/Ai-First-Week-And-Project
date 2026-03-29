import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "BURAYA_API_KEYINIZI_YAZIN",
  dangerouslyAllowBrowser: true, // Eğer front-end'de test yapıyorsan gerekli
});

let chatHistory = [
  {
    role: "system",
    content:
      "Sen bir yemek öneri chatbotusun. Kullanıcının sevdiği ve sevmediği yiyeceklere göre ona uygun yemekler öneriyorsun.",
  },
];

const analyzeMeal = async (likes, dislikes) => {
  try {
    const userMessage = `Sevdiğim yiyecekler: ${likes.join(", ")}. Sevmediğim yiyecekler: ${dislikes.join(", ")}. Bana 3 tane yemek öner.`;
    chatHistory.push({ role: "user", content: userMessage });

    //     neden chat.completions Kullandık?
    // Aslında OpenAI'ın şu anki standart ve en güçlü yöntemi bu.

    // Diyalog Mantığı: Adı "Chat" olsa da bu sadece WhatsApp gibi yazışmak için değil. AI'ya bir "geçmiş" veya "bağlam" (context) vermek için en iyi yol bu. messages dizisi sayesinde ona "Sen şusun (System)", "Ben buyum (User)" diyebiliyoruz.

    // Güncellik: OpenAI artık yeni modellerini (GPT-3.5, GPT-4, GPT-4o) tamamen bu yapıya göre optimize ediyor.

    // Maliyet ve Performans: Eski yöntemlere göre hem daha ucuz hem de daha zeki sonuçlar veriyor.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
      temperature: 0.7,
      max_tokens: 500,
    });

    const suggestion = response.choices[0].message.content;
    chatHistory.push({ role: "assistant", content: suggestion }); // AI'nın cevabını da geçmişe ekliyoruz ki sonraki sorularda bilsin
    console.log("AI Önerisi:", suggestion);
    return suggestion;
  } catch (error) {
    console.error("API Hatası:", error);
    return "Üzgünüm, şu an öneri oluşturamıyorum.";
  }
};

// en iyi yöntem
// İYİ ÖRNEK: Rolleri görevlerine göre ayırmak
// const smartMessages = [
//     // 1. KATMAN: KİMLİK (Oyunun kuralları - System)
//     {
//         role: "system",
//         content: "Sen bir diyetisyen şefsin. Cevapların kısa ve net olsun."
//     },

//     // 2. KATMAN: KULLANICI GİRDİSİ (Anlık veri - User)
//     {
//         role: "user",
//         content: `Sevdiğim: ${likes.join(", ")}. Sevmediğim: ${dislikes.join(", ")}.`
//     },

//     // 3. KATMAN: YARDIMCI (AI'nın önceki cevabı - Assistant)
//     // Eğer konuşma devam ediyorsa buraya AI'nın cevabını eklersin
//     {
//         role: "assistant",
//         content: "Sana ızgara tavuk ve kinoa salatası öneririm."
//     },

//     // 4. KATMAN: TAKİP SORUSU (User)
//     {
//         role: "user",
//         content: "Peki bu yemeğin yanına hangi içecek gider?"
//     }
// ];

// dinamik kod olarak da
// let chatHistory = [
//     { role: "system", content: "Sen yemek uzmanısın." }
// ];

// async function askAI(newUserMessage) {
//     // 1. Kullanıcının yeni mesajını diziye ekle
//     chatHistory.push({ role: "user", content: newUserMessage });

//     const response = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: chatHistory, // Tüm geçmişi gönderiyoruz!
//     });

//     const aiAnswer = response.choices[0].message.content;

//     // 2. AI'nın cevabını da hafızaya (diziye) ekle ki bir sonraki soruyu bilsin
//     chatHistory.push({ role: "assistant", content: aiAnswer });

//     return aiAnswer;
// }
