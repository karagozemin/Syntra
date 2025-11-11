# 🔧 Supabase Kurulum Rehberi

## ❓ Neden Supabase?

Şu anda uygulamanız **memory storage** kullanıyor, bu yüzden:
- ✅ Agent oluşturuyorsunuz
- ❌ Sayfa yenilendiğinde veya sunucu restart olduğunda agent'lar kayboluyor
- ❌ My Collections sayfasında NFT'leriniz görünmüyor

**Çözüm:** Supabase veritabanı kurarak agent'larınızı kalıcı hale getirin!

---

## 🚀 Kurulum Adımları

### 1️⃣ Supabase Projesi Oluşturun

1. [https://supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın (ücretsiz)
3. Yeni bir proje oluşturun:
   - Organization: Yeni oluşturun veya mevcut birini seçin
   - Project name: `syntra-agents` (veya istediğiniz isim)
   - Database Password: Güçlü bir şifre oluşturun (kaydedin!)
   - Region: Size en yakın bölgeyi seçin (örn: Frankfurt)
   - Pricing Plan: **Free** (başlangıç için yeterli)

### 2️⃣ Database Tablosu Oluşturun

1. Supabase dashboard'da sol menüden **"SQL Editor"** seçin
2. **"New query"** butonuna tıklayın
3. Aşağıdaki SQL kodunu yapıştırın ve **"Run"** butonuna tıklayın:

```sql
-- Agents tablosu oluştur
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  token_id TEXT NOT NULL,
  agent_contract_address TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT,
  price TEXT,
  price_wei TEXT,
  creator TEXT NOT NULL,
  current_owner TEXT NOT NULL,
  tx_hash TEXT,
  storage_uri TEXT,
  listing_id INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  social JSONB DEFAULT '{}'::jsonb,
  capabilities TEXT[],
  compute_model TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  trending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performans için index'ler oluştur
CREATE INDEX idx_agents_creator ON agents(creator);
CREATE INDEX idx_agents_current_owner ON agents(current_owner);
CREATE INDEX idx_agents_active ON agents(active);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);

-- RLS (Row Level Security) - Herkes okuyabilir, herkes yazabilir (testnet için)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON agents
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON agents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for creators" ON agents
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for creators" ON agents
  FOR DELETE USING (true);
```

### 3️⃣ API Anahtarlarını Alın

1. Sol menüden **"Settings"** > **"API"** seçin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key (uzun bir token)

### 4️⃣ Environment Variables Ayarlayın

1. Projenizin `agentx/packages/webapp/` klasöründe `.env.local` dosyası oluşturun
2. Aşağıdaki içeriği yapıştırın ve kendi anahtarlarınızı ekleyin:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Polygon RPC (optional)
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology/
```

**⚠️ ÖNEMLİ:** `.env.local` dosyası `.gitignore`'da olduğu için git'e commit edilmez. Bu güvenlik içindir.

### 5️⃣ Sunucuyu Yeniden Başlatın

```bash
# Terminal'de:
cd agentx/packages/webapp
npm run dev
```

### 6️⃣ Bağlantıyı Test Edin

1. Tarayıcınızda: [http://localhost:3000/api/supabase/test](http://localhost:3000/api/supabase/test)
2. Başarılı yanıt görmelisiniz:

```json
{
  "success": true,
  "message": "Supabase keep-alive test completed successfully",
  "operations": {
    "insert": true,
    "query": true,
    "update": true,
    "cleanup": true
  }
}
```

---

## ✅ Test Edin

1. Yeni bir agent oluşturun: [http://localhost:3000/create](http://localhost:3000/create)
2. My Collections'a gidin: [http://localhost:3000/my-collections](http://localhost:3000/my-collections)
3. Agent'ınızı görmelisiniz!
4. Sayfayı yenileyin - agent hala orada olmalı ✅
5. Sunucuyu restart edin - agent hala orada olmalı ✅

---

## 🐛 Sorun Giderme

### "No INFTs Created Yet" Görünüyor

1. Browser console'u açın (F12)
2. "Loading agents for creator:" mesajını arayın
3. Hata mesajı var mı kontrol edin:
   - ❌ "Supabase connection failed" → `.env.local` dosyası doğru mu?
   - ❌ "relation agents does not exist" → SQL tablosu oluşturuldu mu?
   - ❌ "Invalid API key" → Anon key doğru kopyalandı mı?

### Supabase Dashboard'da Veri Yok

1. **Table Editor** > **agents** tablosunu kontrol edin
2. Hiç satır yok mu?
   - Agent oluşturdunuz mu?
   - Console'da "INFT saved to Supabase" mesajı görünüyor mu?

### Environment Variables Çalışmıyor

```bash
# .env.local dosyasının doğru yerde olduğundan emin olun:
# ✅ agentx/packages/webapp/.env.local
# ❌ agentx/.env.local (yanlış yer)

# Sunucuyu restart ettin mi?
npm run dev
```

---

## 📊 Supabase Dashboard'da Verilerinizi Görüntüleme

1. Supabase dashboard > **Table Editor**
2. **agents** tablosunu seçin
3. Tüm agent'larınızı görebilirsiniz:
   - Filtreleme yapabilirsiniz (creator, category vs.)
   - Manuel olarak düzenleyebilirsiniz
   - SQL sorguları çalıştırabilirsiniz

---

## 🎉 Tamamlandı!

Artık agent'larınız kalıcı olarak saklanıyor ve My Collections sayfasında görünüyor!

**İpucu:** Supabase free plan limitleri:
- 500 MB database
- 50,000 monthly active users
- 5 GB bandwidth/month
- Testnet için fazlasıyla yeterli! 🚀

