# 🤖 Build AI Apps with ChatGPT, DALL-E, and GPT-4 — Öğrendiklerim

> freeCodeCamp'in 4.5 saatlik ücretsiz kursundan öğrendiklerimin özeti.  
> Kurs linki: [YouTube — freeCodeCamp](https://www.youtube.com/watch?v=uRQH2CFvedY)  
> Bu repo hem kişisel notlarım hem de konuya yeni başlayanlar için bir kaynak olarak hazırlandı.

---

## 📋 İçindekiler

- [Temel Kavramlar](#temel-kavramlar)
- [OpenAI API Kullanımı](#openai-api-kullanımı)
- [Modeller](#modeller)
- [Token Nedir?](#token-nedir)
- [Temperature ve Parametreler](#temperature-ve-parametreler)
- [Few-Shot Prompting](#few-shot-prompting)
- [Sohbet (Chat) Geçmişi Yönetimi](#sohbet-chat-geçmişi-yönetimi)
- [Frequency ve Presence Penalty](#frequency-ve-presence-penalty)
- [Tools — Araç Kullanımı](#tools--araç-kullanımı)
- [Fine-Tuning](#fine-tuning)
- [Stop Sequence](#stop-sequence)
- [n_epochs](#n_epochs)
- [Uygulama Mimarisi](#uygulama-mimarisi)
- [DALL-E ile Görsel Üretme](#dall-e-ile-görsel-üretme)
- [Deployment — Netlify Serverless Functions](#deployment--netlify-serverless-functions)
- [Projeler](#projeler)

---

## Temel Kavramlar

### LLM (Large Language Model) Nedir?

LLM'ler, büyük miktarda metin verisiyle eğitilmiş yapay zeka modelleridir. Bir sonraki token'ı tahmin ederek metin üretirler. ChatGPT, Claude, Gemini bunların örnekleridir.

### API Nedir? (Bu Bağlamda)

OpenAI API'si, modellere HTTP isteği göndererek çıktı almanı sağlayan bir arayüzdür. Kendi uygulamana AI zekası entegre etmek için kullanılır.

---



## OpenAI API Kullanımı

### OpenAI API Endpoint'leri ve Kullanım Senaryoları

| Metot / Endpoint         | Amacı                                 | Ne Zaman Kullanılır?                                                                 |
|-------------------------|---------------------------------------|--------------------------------------------------------------------------------------|
| chat.completions        | Karşılıklı mesajlaşma (Chat)           | Tüm metin bazlı işler: öneri, analiz, özetleme, sohbet, asistan, chatbot             |
| images.generate         | Görsel oluşturma (DALL-E)              | "Bana içinde tavuk olan bir tabak resmi çiz" gibi görsel üretim isteklerinde         |
| audio.transcriptions    | Sesi metne çevirme (Whisper)           | Kullanıcı yazmak yerine ses kaydı gönderirse, sesi yazıya çevirmek için               |
| embeddings              | Metni sayısal vektöre çevirme          | Büyük bir tarif/ürün/mesaj kütüphanesinde benzerlik araması veya öneri sistemi için   |
| files / fineTuning      | Modeli eğitme                          | AI'yı sadece kendi özel yemek kitabın veya verinle eğitmek/kısıtlamak istersen        |


### OpenAI JavaScript SDK ile Kullanım (openai npm paketi)

OpenAI'nin resmi JavaScript/TypeScript SDK'sı ile modern ve kolay bir şekilde API'ye erişebilirsin. (npm paketi: `openai`)

#### Kurulum
```bash
npm install openai
```

#### Basit Kullanım
```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "OPENAI_API_KEY", // .env ile de alınabilir
  dangerouslyAllowBrowser: true // Frontend'de test için
});

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "Sen yemek önerisi yapan bir asistansın." },
    { role: "user", content: "Ben mantar sevmem, pizza severim." }
  ],
  temperature: 0.7
});

console.log(response.choices[0].message.content);
```

> **Not:** Frontend'de test için `dangerouslyAllowBrowser: true` gerekir. Gerçek projede API anahtarını asla client-side'da tutma!

### Temel Fetch İsteği (JavaScript)

```javascript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Sen yardımcı bir asistansın." },
      { role: "user", content: "Merhaba!" }
    ],
    temperature: 0.7
  })
})

const data = await response.json()
const reply = data.choices[0].message.content
console.log(reply)
```

### Mesaj Rolleri

| Rol | Açıklama |
|-----|----------|
| `system` | Modele kimliğini ve davranışını tanımlar |
| `user` | Kullanıcının gönderdiği mesaj |
| `assistant` | Modelin önceki yanıtları (sohbet geçmişi için) |

### Dependency Injection ile API Key Yönetimi

API key'i direkt koda gömmek güvenlik açığıdır. `.env` dosyasında sakla:

```
OPENAI_API_KEY=sk-...
```

```javascript
// .env dosyasından oku
const apiKey = process.env.OPENAI_API_KEY
```

> ⚠️ `.env` dosyasını asla GitHub'a yükleme. `.gitignore`'a ekle.

---

## Modeller

### Fark Nedir?

| Model | Hız | Zeka | Maliyet | Ne Zaman Kullan |
|-------|-----|------|---------|-----------------|
| gpt-4o-mini | Hızlı | Orta | Ucuz | Basit görevler, öğrenme |
| gpt-4o | Orta | Yüksek | Orta | Genel kullanım |
| gpt-4 | Yavaş | Çok yüksek | Pahalı | Karmaşık görevler |

### Model Seçimi Nasıl Yapılır?

- Öğrenme aşamasında → `gpt-4o-mini` (ucuz, yeterince akıllı)
- Production basit görevler → `gpt-4o-mini`
- Karmaşık analiz, reasoning → `gpt-4o`

---

## Token Nedir?

Token, modelin metni işlediği en küçük birimdir. Kelime, hece veya noktalama işareti olabilir.

```
"Merhaba dünya" → ["Mer", "haba", " dün", "ya"] → 4 token (yaklaşık)
```

### Neden Önemli?

- API maliyeti token başına hesaplanır
- Her modelin maksimum token limiti vardır (context window)
- Hem gönderdiğin (prompt) hem aldığın (completion) tokenlar sayılır

### Pratik Kurallar

```javascript
{
  max_tokens: 500,  // yanıt maksimum kaç token olsun
  // Dikkat: Bu değeri çok düşük tutarsan yanıt yarıda kesilir
}
```

> 💡 1000 token ≈ 750 İngilizce kelime ≈ 500 Türkçe kelime (yaklaşık)

---

## Temperature ve Parametreler

### Temperature

Modelin ne kadar "yaratıcı" veya "tahmin edilemez" olacağını kontrol eder.

```javascript
{ temperature: 0.2 }  // Tutarlı, deterministik — analiz, JSON çıktısı
{ temperature: 0.7 }  // Dengeli — sohbet botu, genel kullanım  
{ temperature: 1.2 }  // Yaratıcı, beklenmedik — hikaye, slogan, beyin fırtınası
```

#### Arkasındaki Mantık

Model her token için olasılık dağılımı hesaplar:

```
"Merhaba, nasıl..." → "yardımcı" %60 | "olabilirim" %25 | "yapabilirim" %15

Temperature 0   → Her zaman %60'ı seçer (yardımcı)
Temperature 1   → Olasılıklara göre rastgele seçer
Temperature 2   → Düşük olasılıklı seçeneklere bile kapı açar
```

### title_temperature (Başlık için Yüksek Temperature)

Kurs projesinde başlık üretmek için yüksek, özet için düşük temperature kullanıldı:

```javascript
// Özet için — tutarlı olsun
const synopsis = await fetchSynopsis(movieIdea, { temperature: 0.2 })

// Başlık için — yaratıcı olsun
const title = await fetchTitle(synopsis, { temperature: 0.9 })
```

---

## Few-Shot Prompting

Modele örnek göstererek istediğin formatta çıktı almanı sağlar.

### Zero-Shot (Örneksiz)

```javascript
{
  role: "user",
  content: "Bu metni analiz et: 'Ürün berbattı, iade istiyorum'"
}
// Model istediği formatta döner — kontrol edemezsin
```

### Few-Shot (Örnekli) ✅

```javascript
{
  role: "system",
  content: `Müşteri mesajlarını analiz et. Format:
  
  Örnek 1:
  Mesaj: "Harika ürün, çok memnunum!"
  Analiz: {"duygu": "pozitif", "aciliyet": "düşük"}
  
  Örnek 2:
  Mesaj: "3 gündür cevap yok, çok kötü!"
  Analiz: {"duygu": "negatif", "aciliyet": "yüksek"}
  
  Şimdi sana verdiğim mesajı aynı formatta analiz et.`
}
```

> 💡 Few-shot prompting = modele "istediğim çıktı böyle görünüyor" demek.  
> JSON çıktısı almak için çok etkili.

---

## Sohbet (Chat) Geçmişi Yönetimi

ChatGPT'nin "sizi hatırlaması" aslında her istekte tüm geçmişi tekrar göndermekle olur. Model stateless (durumsuz) çalışır.

```javascript
const conversation = [
  { role: "system", content: "Sen yardımcı bir asistansın." }
]

// Kullanıcı mesaj gönderince
conversation.push({ role: "user", content: userMessage })

const response = await fetch("...", {
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: conversation  // tüm geçmişi gönder
  })
})

const reply = response.choices[0].message.content

// Modelin yanıtını da geçmişe ekle
conversation.push({ role: "assistant", content: reply })
```

### Firebase ile Geçmişi Kalıcı Hale Getirme

Sayfa yenilenince kaybolmaması için Firebase Realtime DB kullanıldı:

```javascript
import { push, onValue, ref } from "firebase/database"

// Mesajı kaydet
push(ref(db, "conversation"), { role: "user", content: message })

// Geçmişi dinle
onValue(ref(db, "conversation"), (snapshot) => {
  const data = snapshot.val()
  // mesajları render et
})
```

---

## Frequency ve Presence Penalty

Modelin tekrar eden kelimeler kullanmasını engeller.

```javascript
{
  frequency_penalty: 0.5,  // Sık kullanılan kelimeleri cezalandır
  presence_penalty: 0.5,   // Daha önce geçen kelimeleri cezalandır
}
```

| Parametre | Ne Yapar | Ne Zaman Kullan |
|-----------|----------|-----------------|
| `frequency_penalty` | Sık tekrar eden kelimeleri azaltır | Uzun metinlerde çeşitlilik için |
| `presence_penalty` | Yeni konu/kelime girişini teşvik eder | Yaratıcı içerikte |

> 💡 İkisi de `-2.0` ile `2.0` arasında değer alır. `0` = kapalı (default)

---

## Tools — Araç Kullanımı

Tools (Araçlar), modelin kendi başına yapamayacağı şeyleri dış fonksiyonlar çağırarak yapabilmesini sağlar. Agent'ların temeli budur.

### Ne İşe Yarar?

Model doğası gereği sadece metin üretir. Ama "şu anki hava durumu nedir?" gibi gerçek zamanlı veriye ihtiyaç duyulan sorularda model yetersiz kalır. Tools ile modele dış dünyaya açılan kapılar verirsin.

```
Model → "hava durumunu öğrenmem lazım" → getWeather() fonksiyonunu çağır → sonucu al → yanıt üret
```

### Temel Kullanım

```javascript
const tools = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Belirli bir şehrin hava durumunu getirir",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Şehir adı, örn: Istanbul" }
        },
        required: ["city"]
      }
    }
  }
]

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Istanbul'da hava nasıl?" }],
    tools: tools
  })
})

const data = await response.json()

// Model tool çağırmak istedi mi?
if (data.choices[0].finish_reason === "tool_calls") {
  const toolCall = data.choices[0].message.tool_calls[0]
  const args = JSON.parse(toolCall.function.arguments)
  // args.city → "Istanbul"
  const weather = await getWeather(args.city)
  // Sonucu modele geri gönder...
}
```

> 💡 Bu kursda tools konusuna giriş yapıldı. LangChain kursunda çok daha derin işlenecek — agent'ların tüm gücü buradan geliyor.

---

## Fine-Tuning

Modeli kendi verin ile belirli bir göreve özel olarak eğitmektir.

### Ne Zaman Fine-Tune Yapılır?

- Belirli bir marka sesi / kişilik gerektiğinde
- Çok spesifik format çıktısı gerektiğinde
- Few-shot ile yeterli sonuç alınamadığında

### Fine-Tuning Süreci (Genel)

```
1. Eğitim verisi hazırla (.jsonl formatında)
2. OpenAI CLI ile veriyi doğrula
3. Fine-tuning işlemini başlat
4. Yeni model adını al
5. Kodunda bu model adını kullan
```

```jsonl
{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

> ⚠️ Fine-tuning pahalıdır. Çoğu durumda iyi bir sistem promptu + few-shot daha verimlidir.

---

## Stop Sequence

Modelin belirli bir karakter veya kelimeyle duraklamasını sağlar. Fine-tuning ile birlikte yanıt formatını kontrol etmek için kullanılır.

### Ne İşe Yarar?

Model normalde `max_tokens` dolana kadar veya doğal bitişe kadar yazar. Stop sequence ile "şu karakteri görünce dur" diyebilirsin.

```javascript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Bir film özeti yaz." }],
    stop: ["###", "END"]  // Bu karakterleri görünce dur
  })
})
```

### Ne Zaman Kullanılır?

```
Fine-tuned chatbot senaryosu:

Model yanıt üretir → "###" görür → durur
Böylece yanıt her zaman aynı yapıda kalır
```

| Kullanım Senaryosu | Stop Sequence |
|--------------------|---------------|
| JSON çıktısı kontrolü | `}` veya özel bir ayraç |
| Fine-tuned chatbot | `###` |
| Liste üretimi | özel bir son etiketi |

> 💡 Stop sequence yanıta dahil edilmez, sadece durma sinyali olarak kullanılır.

---

## n_epochs

Fine-tuning sırasında modelin eğitim verisi üzerinden kaç kez geçeceğini belirler.

```
n_epochs = 3 → model tüm eğitim verisini 3 kez görür
```

### Doğru Değer Nasıl Seçilir?

| n_epochs | Sonuç |
|----------|-------|
| Çok düşük (1-2) | Model yeterince öğrenemez — underfitting |
| İdeal (3-5) | Dengeli öğrenme |
| Çok yüksek (10+) | Model ezberler, genelleşemez — overfitting |

```python
# OpenAI CLI ile fine-tuning başlatırken
openai api fine_tunes.create \
  -t "data.jsonl" \
  -m "gpt-4o-mini" \
  --n_epochs 4
```

> 💡 OpenAI genellikle veri setine göre otomatik öneri verir. Küçük veri setlerinde 4-5, büyük veri setlerinde 2-3 iyi başlangıç noktasıdır.

---

## Uygulama Mimarisi

Kurs boyunca MoviePitch projesinin mimarisi aşamalı olarak geliştirildi:

### Basit Mimari (Başlangıç)

```
Kullanıcı → Client (JS) → OpenAI API
                ↑
           API key burada (güvensiz!)
```

### Güvenli Mimari (Final)

```
Kullanıcı
    ↓
Client (JS) — API key yok, güvenli
    ↓
Netlify Serverless Function — API key burada, gizli
    ↓
OpenAI API
```

### Chatbot Mimarisi (Firebase ile)

```
Kullanıcı
    ↓
Client (JS)
    ↓           ↓
Netlify Fn   Firebase DB
    ↓           ↓
OpenAI API  Sohbet geçmişi
```

> 💡 Temel prensip: API key ve hassas veriler asla client-side'da olmamalı. Her zaman bir backend katmanı (serverless function, API route) üzerinden geç.

---

```javascript
const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: "Uzayda dans eden bir astronot, sinematik, 4K",
    n: 1,
    size: "1024x1024"
  })
})

const data = await response.json()
const imageUrl = data.data[0].url
```

### İyi Bir DALL-E Prompt'u Nasıl Yazılır?

```
[Konu] + [Stil] + [Detaylar] + [Kalite]

"Neon ışıklı bir şehirde yağmurda yürüyen adam, 
cyberpunk tarzı, sinematik aydınlatma, 4K, detaylı"
```

---

## Deployment — Netlify Serverless Functions

API key'i client-side'da kullanmak güvenlik açığıdır. Serverless function ile gizle:

### Neden Serverless Function?

```
❌ Client (tarayıcı) → OpenAI API  (API key görünür!)
✅ Client → Netlify Function → OpenAI API  (API key gizli)
```

### Netlify Function Yapısı

```javascript
// netlify/functions/fetchReply.js
export async function handler(event) {
  const { userMessage } = JSON.parse(event.body)
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }]
    })
  })
  
  const data = await response.json()
  
  return {
    statusCode: 200,
    body: JSON.stringify({ reply: data.choices[0].message.content })
  }
}
```

```javascript
// Client tarafında
const response = await fetch("/.netlify/functions/fetchReply", {
  method: "POST",
  body: JSON.stringify({ userMessage: "Merhaba!" })
})
```

### Deploy Adımları

```bash
# Netlify CLI kur
npm install -g netlify-cli

# Login ol
netlify login

# Environment variable ekle (Netlify dashboard'dan da yapılabilir)
netlify env:set OPENAI_API_KEY sk-...

# Deploy et
netlify deploy --prod
```

---



## Integration: CRM Sohbet Analizi (chatAnalyze.js)


### Örnek Sohbet (Konuşma Formatı)

```
Müşteri: Merhaba kolay gelsin
Müşteri: Sgk anlaşmalı muayene ücretiniz nedir acaba Mustafa Bey için (ortopedi)
Çalışan: merhaba caner bey
Çalışan: şuanda kampanyamız mevcut mustafa beyin şuanda sgk 2000 tl'dir
Müşteri: Tamamdır teşekkürler sağ olun.
Çalışan: sağlıklı günler dilerim
Müşteri: Teşekkürler sağ olun
```

### AI Analiz Cevabı

```json
{
  "memnuniyet": "memnun",
  "duygu": "mutlu",
  "aciliyet": "düşük",
  "konu": "Sgk anlaşmalı muayene ücreti hakkında bilgi",
  "ozet": "Müşteri SGK anlaşmalı muayene ücretini sordu, çalışan fiyatı bildirdi.",
  "temsilci_onerisi": "Kampanya ve fiyatlar otomatik olarak müşteri ile paylaşılmalı",
  "aksiyon_gerekiyor_mu": false,
}
```

Bu bölümde, CRM sisteminizdeki müşteri sohbetlerini analiz etmek için geliştirilmiş `chatAnalyze.js` dosyasının detaylı açıklamasını bulabilirsiniz. Kodun her parçası, neden o şekilde tasarlandığı ve entegrasyon mantığı ile birlikte açıklanmıştır.

### Amaç
WhatsApp gibi kanallardan gelen müşteri mesajlarını, LLM (büyük dil modeli) ile analiz ederek duygu, memnuniyet, aciliyet, özet ve aksiyon önerisi gibi çıktılar üretmek. Kod, CRM sistemine kolayca entegre edilebilecek şekilde modüler ve güvenli yazılmıştır.

---

### 1. Data Fetching (Veri Çekme)
```js
async function fetchAllMessages(chatId) {
  try {
    const res = await apiRequest.post("/chatlist/last-100", { chatId });
    const messages = res?.data?.data || res?.data || res || [];
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error(`ChatId ${chatId} için mesajlar çekilemedi:`, error.message);
    return [];
  }
}
```
**Açıklama:**
- Belirli bir `chatId` için son 100 mesajı API'dan çeker.
- Gelen veri yapısı farklı olabileceği için, güvenli şekilde diziye dönüştürülür.
- Hata olursa boş dizi döner ve hata loglanır.

**Neden böyle?**
Farklı API cevap formatlarına karşı dayanıklı ve hata toleranslı olması için.

---

### 2. Safe Decode (Güvenli Çözümleme)
```js
function safeDecode(text) {
  if (!text) return "";
  try {
    return decodeURIComponent(text.replace(/\+/g, '%20'));
  } catch {
    return text;
  }
}
```
**Açıklama:**
- Mesaj metinleri bazen URL encode edilmiş gelir. Ayrıca bazı sistemler boşlukları `+` ile bırakabilir.
- Bu fonksiyon, metni güvenli şekilde çözer. Hatalıysa orijinal metni döner.

**Neden böyle?**
Gerçek hayatta mesajlar her zaman düzgün encode edilmez. Kullanıcıya doğru metin göstermek için.

---

### 3. Role Detection (Rol Tespiti)
```js
function getRole(m) {
  return m.status === "inbound" ? "user" : "assistant";
}
```
**Açıklama:**
- Mesajın kimden geldiğini belirler. `inbound` ise müşteri (`user`), diğer durumlar çalışan (`assistant`).

**Neden böyle?**
LLM analizinde rol ayrımı çok önemlidir. Modelin doğru bağlamda analiz yapabilmesi için.

---

### 4. Clean + Normalize Chat (Temizleme & Normalizasyon)
```js
function prepareMessages(messages) {
  const uniqueMessagesMap = new Map();
  messages.forEach(m => {
    if (!uniqueMessagesMap.has(m.messageId)) {
      uniqueMessagesMap.set(m.messageId, m);
    }
  });
  return Array.from(uniqueMessagesMap.values())
    .filter(m => m.type === "text" && m.text?.trim())
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .map(m => ({
      role: getRole(m),
      content: safeDecode(m.text)
    }));
}
```
**Açıklama:**
- Aynı mesaj birden fazla kez gelebilir, `messageId` ile tekilleştirilir.
- Sadece dolu ve metin olan mesajlar alınır.
- Tarihe göre sıralanır.
- Her mesaj, LLM için uygun role ve çözümlenmiş metne dönüştürülür.

**Neden böyle?**
LLM'e gönderilecek veri temiz, sıralı ve tekrar içermemeli. Analiz doğruluğu için kritik.

---


### 5. LLM Analysis & Few-Shot Config (LLM ile Analiz ve Few-Shot Ayarı)
```js
async function analyzeWithLM(chatMessages) {
  // SYSTEM PROMPT: Modelin davranışını ve çıktı formatını kesin olarak belirler
  const systemPrompt = `
Sen bir müşteri deneyimi ve CRM analiz AI'sısın.

KURALLAR:
- SADECE geçerli bir JSON döndür. Asla markdown veya ekstra bir açıklama metni kullanma.
- ASLA uydurma yapma. Yalnızca sağlanan konuşma metnini analiz et.
- Müşteri bir mağduriyet (randevu iptali, gecikme vb.) yaşamasına rağmen duruma anlayış gösterip kibar davranıyorsa (örn: "geçmiş olsun", "sorun değil"), bunu "mutlu" veya "memnun" olarak DEĞERLENDİRME. Duyguyu "sakin", memnuniyeti "nötr" olarak işaretle.

ÇIKTI FORMATI:
{
  "memnuniyet": "memnun | nötr | memnun değil",
  "duygu": "mutlu | sakin | sinirli | üzgün | kızgın",
  "aciliyet": "yüksek | orta | düşük",
  "konu": "müşterinin gerçek talebi",
  "ozet": "gerçek olay özeti",
  "temsilci_onerisi": "somut aksiyon",
  "aksiyon_gerekiyor_mu": true | false,
  "sorumlular": ["Randevu Sorumlusu", "Müşteri Temsilcisi" vb.]
}
`.trim();

  // Sohbeti transcript formatına çevir: LLM'in bağlamı net anlaması için
  const chatTranscript = chatMessages
    .map(m => `${m.role === "user" ? "Müşteri" : "Çalışan"}: ${m.content}`)
    .join("\n");

  // FEW-SHOT EXAMPLES: Modelin formatı ve duygu tuzaklarını öğrenmesi için örnekler
  const fewShotExamples = [
    {
      role: "user",
      content: "Aşağıdaki sohbeti analiz et:\nMüşteri: Merhaba diş çekimi yapılabiliyor mu?\nÇalışan: Evet, bugün 20:00’a kadar hizmet veriyoruz."
    },
    {
      role: "assistant",
      content: '{\n  "memnuniyet": "nötr",\n  "duygu": "sakin",\n  "aciliyet": "orta",\n  "konu": "Diş hizmet saatleri hakkında bilgi",\n  "ozet": "Müşteri hizmetin açık olup olmadığını sordu, çalışan çalışma saatini bildirdi.",\n  "temsilci_onerisi": "Çalışma saatleri otomatik mesaj olarak optimize edilmeli",\n  "aksiyon_gerekiyor_mu": false,\n  "sorumlular": ["Randevu Sorumlusu"]\n}'
    },
    {
      role: "user",
      content: "Aşağıdaki sohbeti analiz et:\nÇalışan: Kusura bakmayın doktor beyin acil bir işi çıktı randevuyu iptal etmek zorundayız.\nMüşteri: Anladım, sorun değil geçmiş olsun."
    },
    {
      role: "assistant",
      content: '{\n  "memnuniyet": "nötr",\n  "duygu": "sakin",\n  "aciliyet": "orta",\n  "konu": "Doktorun acil durumu sebebiyle randevu iptali",\n  "ozet": "Klinik, doktorun acil durumu nedeniyle randevuyu iptal etti. Müşteri durumu anlayışla karşıladı.",\n  "temsilci_onerisi": "Doktor döndüğünde hastaya öncelikli yeni randevu oluşturulmalı.",\n  "aksiyon_gerekiyor_mu": true,\n  "sorumlular": ["Randevu Sorumlusu"]\n}'
    }
  ];

  // LLM API'ye gönderilecek payload
  const payload = {
    model: "qwen2.5-7b-instruct-1m", // Kullanılan LLM modeli (değiştirilebilir)
    temperature: 0.1, // Düşük: Analitik, deterministik, tutarlı yanıtlar için. Yaratıcılık istenmiyor.
    max_tokens: 500, // Yanıtın uzunluğunu sınırlar. JSON çıktısı için yeterli, gereksiz uzamayı engeller.
    messages: [
      { role: "system", content: systemPrompt },
      ...fewShotExamples,
      // Asıl analiz isteği: transcript formatında sohbet
      { role: "user", content: `Aşağıdaki sohbeti analiz et:\n\n${chatTranscript}` }
    ]
  };

  // ...fetch ile LLM API çağrısı ve JSON ayıklama işlemi...
}
```
**Açıklama:**
- **systemPrompt**: Modelin davranışını, kurallarını ve çıktı formatını kesin olarak belirler. Yanlış duygu/memnuniyet değerlendirmelerini önler.
- **chatTranscript**: Sohbeti "Müşteri:" ve "Çalışan:" olarak etiketleyip, modelin bağlamı net anlamasını sağlar.
- **fewShotExamples**: Modelin beklenen JSON formatını ve duygu tuzaklarını öğrenmesini sağlar. Yanlış örüntüleri engeller.
- **model**: Hangi LLM kullanılacaksa burada seçilir. (qwen2.5-7b-instruct-1m örneği)
- **temperature**: 0.1 seçildi çünkü analizde tutarlılık ve deterministik yanıtlar istenir. Yaratıcılık gereksiz.
- **max_tokens**: Yanıtın uzunluğunu sınırlar. JSON çıktısı için 500 yeterli, hem maliyet hem de gereksiz uzama engellenir.
- **messages**: LLM API'nin beklediği format. System prompt, örnekler ve asıl analiz isteği sırayla verilir.
- **Yanıt işleme**: LLM bazen markdown veya açıklama ekleyebilir. Sadece geçerli JSON'u regex ile ayıklayıp döneriz.

**Neden böyle?**
- LLM'ler bazen istenmeyen açıklama veya formatta dönebilir. System prompt ve örneklerle modelin davranışı sıkı şekilde kontrol edilir.
- Temperature ve max_tokens gibi parametreler, analiz senaryosunda en güvenli ve verimli sonucu almak için seçildi.

---

### 6. Main Export (Dışa Aktarım)
```js
export async function analyzeChatById(chatId) {
  try {
    const messages = await fetchAllMessages(chatId);
    if (!messages || messages.length === 0) {
      return { hata: "Sohbet kaydı bulunamadı" };
    }
    const chatMessages = prepareMessages(messages);
    if (chatMessages.length === 0) {
      return { hata: "İşlenecek geçerli metin mesajı yok" };
    }
    const result = await analyzeWithLM(chatMessages);
    return result;
  } catch (e) {
    return { hata: e.message };
  }
}
```
**Açıklama:**
- Tüm süreci birleştirir: veri çekme, temizleme, LLM ile analiz.
- Hataları kullanıcıya açıkça döner.

**Neden böyle?**
UI'da bir butona bağlandığında, tek fonksiyonla tüm analiz zinciri çalışır. Hata yönetimi kolaydır.

---

### Entegrasyon Senaryosu
- Bu kod, bir CRM sisteminde butona veya otomatik tetikleyiciye bağlanabilir.
- Herhangi bir chatId ile çağrıldığında, ilgili sohbeti analiz edip özet, duygu, memnuniyet ve aksiyon önerisi gibi çıktılar üretir.
- LLM modeli ve API adresi kolayca değiştirilebilir.

---

**Kritik Noktalar:**
- Her adımda hata toleransı ve veri temizliği ön planda tutuldu.
- LLM'e gönderilen veri, minimum karmaşa ve maksimum doğruluk için özenle hazırlandı.
- Few-shot örneklerle modelin yanıt formatı ve duygu tuzakları önlendi.

---

> Daha fazla entegrasyon veya özelleştirme için kodun her fonksiyonu kolayca genişletilebilir.

### 1. MoviePitch — Film Fikri Üretici
- Kullanıcıdan film fikri al
- GPT ile özet (synopsis) üret — düşük temperature
- GPT ile başlık üret — yüksek temperature
- DALL-E ile poster görseli oluştur

### 2. KnowItAll — GPT-4 Chatbot
- Sohbet geçmişini array'de tut
- Her istekte tüm geçmişi gönder
- Firebase ile geçmişi kalıcı hale getir
- Chatbot'a sistem promptuyla kişilik ver
- Frequency/presence penalty ile çeşitlilik sağla

### 3. We-Wingit — Fine-Tuned Chatbot
- Fine-tuning ile modeli özel veriye adapte et
- Stop sequence ile yanıt formatını kontrol et
- n_epochs ayarıyla eğitim süresini optimize et

---

## 🔑 Öğrenilen Temel Prensipler

1. **API key'i asla client-side'a koyma** — serverless function kullan
2. **Temperature'ı göreve göre ayarla** — analiz için düşük, yaratıcılık için yüksek
3. **Sohbet geçmişi = her istekte tüm array** — model stateless'tır
4. **Few-shot prompting** — istediğin formatı örnekle göster
5. **Token = para** — gereksiz uzun promptlardan kaçın
6. **Fine-tuning son çaredir** — önce prompt engineering dene
7. **Tools = agent'ların kapısı** — modele dış dünyayı açar
8. **Stop sequence** — yanıt formatını kontrol etmenin güçlü yolu
9. **n_epochs** — çok düşük underfitting, çok yüksek overfitting

---

## 🗺️ Sonraki Adımlar

Bu kurs LLM API temelini öğretti. Sıradaki konular:

- [ ] **LangChain** — zincirleme, bellek, araç entegrasyonu
- [ ] **RAG** — kendi dökümanlarınla modeli zenginleştirme
- [ ] **LangGraph** — multi-agent orchestration
- [ ] **MCP** — Model Context Protocol
- [ ] **LangSmith** — production observability

---

## 📚 Kaynaklar

- [OpenAI API Dokümantasyonu](https://platform.openai.com/docs)
- [OpenAI Tokenizer](https://platform.openai.com/tokenizer)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)

---



## Ayrıca bu repository de var olan bir projeye integrasyon ve sıfırdan bir proje bulunmaktadır

> 💬 Sorularınız için GitHub Issues açabilirsiniz.