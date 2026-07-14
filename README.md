# ✅ Manage Task

تطبيق بسيط وأنيق لإدارة المهام مبني بـ HTML/CSS/JavaScript مع Supabase كـ Backend.

## 🚀 المميزات
- تسجيل الدخول وإنشاء الحساب عبر Supabase Auth
- إضافة المهام مع عنوان، وصف، أولوية، وتاريخ استحقاق
- تصفية المهام (الكل، قيد التنفيذ، مكتملة، عالية الأولوية)
- إحصائيات فورية للمهام
- تصميم داكن متجاوب مع RTL عربي

## 🛠️ خطوات الإعداد

### 1. إعداد Supabase
1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com)
2. اذهب إلى **SQL Editor** وشغّل محتوى ملف `database.sql`
3. من **Settings > API** انسخ:
   - `Project URL`
   - `anon public` key

### 2. تحديث الإعدادات
افتح ملف `supabase-config.js` وضع القيم الصحيحة:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3. تشغيل التطبيق
- افتح `index.html` مباشرة في المتصفح، أو
- ارفعه على Vercel / Netlify لنشره

## 🗄️ هيكل قاعدة البيانات

```
tasks
├── id (UUID - Primary Key)
├── user_id (UUID - Foreign Key → auth.users)
├── title (TEXT)
├── description (TEXT)
├── status (pending | completed)
├── priority (low | medium | high)
├── due_date (DATE)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## 📁 هيكل الملفات
```
manage-task/
├── index.html          # الصفحة الرئيسية
├── styles.css          # التصميم
├── supabase-config.js  # إعدادات Supabase
├── app.js              # منطق التطبيق
├── database.sql        # سكيما قاعدة البيانات
└── README.md
```