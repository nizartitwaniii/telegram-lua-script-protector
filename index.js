const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');

const app = express();

// بوت تليجرام
const bot = new TelegramBot('7619814993:AAFSs9zig8B0vzqTmWpRPUNsYVXQ8QOEunM', { polling: true });

// Middleware
app.use(express.json({ limit: "10kb" }));

// Database setup
const DB_FILE = "scripts.json";
let scriptDB = {};

async function loadScripts() {
  try {
    const fileExists = await fs.access(DB_FILE).then(() => true).catch(() => false);
    if (fileExists) {
      const raw = await fs.readFile(DB_FILE, "utf8");
      scriptDB = JSON.parse(raw);
      console.log("✅ تم تحميل السكربتات من الملف");
    }
  } catch (err) {
    console.error("❌ خطأ في التحميل:", err);
  }
}

async function saveScripts() {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(scriptDB, null, 2));
    console.log("✅ تم حفظ السكربتات في الملف");
  } catch (err) {
    console.error("❌ خطأ في الحفظ:", err);
  }
}

// Load scripts on startup
loadScripts();

// الصفحة الرئيسية للحالة
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Lua Script Protection Bot</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }
          .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
          h1 { text-align: center; margin-bottom: 30px; }
          .info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
          .status { color: #4ade80; font-weight: bold; }
          .stats { display: flex; justify-content: space-between; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; color: #fbbf24; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🛡️ Lua Script Protection Bot</h1>
          <div class="info">
            <p><strong>الحالة:</strong> <span class="status">متصل وجاهز للعمل</span></p>
            <p><strong>الوظيفة:</strong> حماية وحفظ سكربتات Lua</p>
            <p><strong>الاستخدام:</strong> أرسل <code>/حماية كود_السكربت</code> في البوت</p>
          </div>
          <div class="stats">
            <div class="stat">
              <div class="stat-number">${Object.keys(scriptDB).length}</div>
              <div>السكربتات المحفوظة</div>
            </div>
            <div class="stat">
              <div class="stat-number">${new Set(Object.values(scriptDB).map(s => s.userId)).size}</div>
              <div>المستخدمون النشطون</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Script serving endpoint
app.get('/s/:id', (req, res) => {
  const id = req.params.id;
  if (!id || !scriptDB[id]) {
    return res.status(404).send('السكربت غير موجود');
  }

  // Check User-Agent to allow only Roblox HTTP requests
  const userAgent = req.headers["user-agent"] || "";
  const isRoblox = userAgent.includes("Roblox") || userAgent.includes("HttpGet");
  if (!isRoblox) {
    return res.status(403).send("Access denied: This endpoint is for Roblox execution only.");
  }

  res.type('text/plain').send(scriptDB[id].script);
});



// معالج رسائل البوت
bot.onText(/\/حماية (.+)/, async (msg, match) => {
  const code = match[1];
  const userId = `telegram_${msg.from.id}`;
  
  try {
    // التحقق من وجود نفس السكربت للمستخدم
    const normalizedScript = code.trim().replace(/\s+/g, " ");
    const existingScript = Object.entries(scriptDB).find(
      ([_, data]) => data.userId === userId && data.script.trim().replace(/\s+/g, " ") === normalizedScript
    );
    
    if (existingScript) {
      const [existingId] = existingScript;
      const link = `https://${process.env.KOYEB_PUBLIC_DOMAIN || 'localhost:3000'}/s/${existingId}`;
      const result = `⚠️ هذا السكربت محفوظ مسبقاً!\n\nloadstring(game:HttpGet("${link}"))()`;
      bot.sendMessage(msg.chat.id, result);
      return;
    }

    const id = crypto.randomBytes(8).toString('hex'); // معرف أطول للأمان
    scriptDB[id] = { 
      script: code.trim(), 
      userId, 
      createdAt: new Date().toISOString(),
      username: msg.from.username || msg.from.first_name || 'مجهول'
    };
    
    await saveScripts();
    const link = `https://${process.env.KOYEB_PUBLIC_DOMAIN || 'localhost:3000'}/s/${id}`;
    const result = `✅ تم حماية السكربت بنجاح!\n\n📋 **Loadstring:**\n\`\`\`\nloadstring(game:HttpGet("${link}"))()\n\`\`\`\n\n🔗 **المعرف:** \`${id}\`\n📅 **التاريخ:** ${new Date().toLocaleString('ar-EG')}`;
    
    bot.sendMessage(msg.chat.id, result, { parse_mode: 'Markdown' });
    console.log(`تم حفظ سكربت جديد: ${id} للمستخدم: ${msg.from.username || msg.from.first_name}`);
  } catch (err) {
    console.error('خطأ في حفظ السكربت:', err);
    bot.sendMessage(msg.chat.id, '❌ حدث خطأ أثناء حفظ السكربت. حاول مرة أخرى.');
  }
});

// معالج قائمة السكربتات
bot.onText(/\/قائمتي/, async (msg) => {
  const userId = `telegram_${msg.from.id}`;
  
  try {
    const userScripts = Object.entries(scriptDB)
      .filter(([_, script]) => script.userId === userId)
      .map(([id, script]) => ({
        id,
        script: script.script,
        createdAt: script.createdAt
      }));

    if (userScripts.length === 0) {
      bot.sendMessage(msg.chat.id, '📜 لا توجد سكربتات محفوظة لديك حتى الآن.\n\nأرسل `/حماية كود_السكربت` لحفظ سكربت جديد.');
      return;
    }

    let message = `📜 **قائمة سكربتاتك المحفوظة (${userScripts.length}):**\n\n`;
    
    userScripts.slice(0, 10).forEach((script, index) => {
      const date = new Date(script.createdAt).toLocaleDateString('ar-EG');
      const preview = script.script.substring(0, 50) + (script.script.length > 50 ? '...' : '');
      message += `**${index + 1}.** \`${script.id}\`\n📅 ${date}\n📝 \`${preview}\`\n\n`;
    });

    if (userScripts.length > 10) {
      message += `*... و ${userScripts.length - 10} سكربت آخر*\n\n`;
    }

    message += `💡 **نصيحة:** أرسل \`/معلومات معرف_السكربت\` للحصول على معلومات مفصلة عن سكربت معين.`;

    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('خطأ في استرجاع قائمة السكربتات:', err);
    bot.sendMessage(msg.chat.id, '❌ حدث خطأ في استرجاع قائمة السكربتات.');
  }
});

// معالج معلومات السكربت
bot.onText(/\/معلومات (.+)/, async (msg, match) => {
  const scriptId = match[1].trim();
  const userId = `telegram_${msg.from.id}`;
  
  if (!scriptDB[scriptId]) {
    bot.sendMessage(msg.chat.id, '❌ لم يتم العثور على سكربت بهذا المعرف.');
    return;
  }

  if (scriptDB[scriptId].userId !== userId) {
    bot.sendMessage(msg.chat.id, '🔒 هذا السكربت لا ينتمي إليك.');
    return;
  }

  const script = scriptDB[scriptId];
  const link = `https://${process.env.KOYEB_PUBLIC_DOMAIN || 'localhost:3000'}/s/${scriptId}`;
  const date = new Date(script.createdAt).toLocaleString('ar-EG');
  
  const message = `📄 **معلومات السكربت:**\n\n🔗 **المعرف:** \`${scriptId}\`\n📅 **تاريخ الإنشاء:** ${date}\n👤 **المستخدم:** ${script.username || 'مجهول'}\n📊 **حجم السكربت:** ${script.script.length} حرف\n\n📋 **Loadstring:**\n\`\`\`\nloadstring(game:HttpGet("${link}"))()\n\`\`\`\n\n📝 **السكربت:**\n\`\`\`lua\n${script.script.substring(0, 500)}${script.script.length > 500 ? '\n...' : ''}\n\`\`\``;

  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// معالج رسائل الترحيب
bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `
🛡️ **مرحباً بك في بوت حماية السكربتات!**

**الأوامر المتاحة:**

📝 **/حماية** \`كود_السكربت\` - حماية وحفظ سكربت جديد
📜 **/قائمتي** - عرض قائمة سكربتاتك المحفوظة  
📄 **/معلومات** \`معرف_السكربت\` - عرض معلومات سكربت معين
📊 **/احصائيات** - عرض إحصائيات البوت
ℹ️ **/مساعدة** - عرض هذه الرسالة

**مثال:**
\`/حماية print("Hello World")\`

سيتم إنشاء رابط محمي لسكربتك يمكن استخدامه في Roblox!

🌐 **رابط البوت:** https://${process.env.KOYEB_PUBLIC_DOMAIN || 'localhost:3000'}
  `;
  
  bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'Markdown' });
});

// معالج الإحصائيات
bot.onText(/\/احصائيات/, (msg) => {
  const totalScripts = Object.keys(scriptDB).length;
  const totalUsers = new Set(Object.values(scriptDB).map(s => s.userId)).size;
  const userScripts = Object.values(scriptDB).filter(s => s.userId === `telegram_${msg.from.id}`).length;
  
  const message = `📊 **إحصائيات البوت:**\n\n📜 إجمالي السكربتات: **${totalScripts}**\n👥 إجمالي المستخدمين: **${totalUsers}**\n📝 سكربتاتك: **${userScripts}**\n🚀 حالة البوت: **متصل**\n⏰ وقت التشغيل: **${process.uptime().toFixed(0)}** ثانية`;
  
  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// معالج المساعدة
bot.onText(/\/مساعدة/, (msg) => {
  bot.onText(/\/start/, msg => bot.emit('text', msg, [msg.text, '/start']));
});

// معالج الأخطاء
bot.on('polling_error', (error) => {
  console.error('خطأ في البوت:', error);
});

// معالج الرسائل غير المفهومة
bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const helpMessage = `❓ لم أفهم رسالتك. أرسل /start لعرض قائمة الأوامر المتاحة.`;
  bot.sendMessage(msg.chat.id, helpMessage);
});

// تشغيل السيرفر
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 سيرفر شغال على المنفذ ${port}`);
  console.log(`📱 بوت تليجرام متصل وجاهز للعمل`);
  console.log(`📊 السكربتات المحفوظة: ${Object.keys(scriptDB).length}`);
  console.log(`👥 المستخدمون المسجلون: ${new Set(Object.values(scriptDB).map(s => s.userId)).size}`);
});