# yt24-ffmpeg-streamer

مشروع يتيح رفع فيديو وبثه على YouTube 24/7 (مكرر).

## المتطلبات
- Docker & docker-compose
- مفتاح البث من YouTube (Stream Key)

## خطوات التشغيل
1. انسخ المشروع إلى جهازك أو إلى مستودع Git.
2. ضع ملف `.env` في `backend/` بناءً على `.env.example` وأضف `YOUTUBE_STREAM_KEY` إذا أردت.
3. (اختياري) ضع اسم ملف الفيديو الافتراضي `VIDEO_FILE` في `.env` أو استخدم واجهة الويب لرفع ملف.
4. شغّل:

```bash
docker-compose up --build -d
```

5. افتح الواجهة عبر المتصفح: `http://YOUR_SERVER_IP/` وادخل مفتاح البث ثم ارفع ملف ثم اضغط `ابدأ البث`.

## ملاحظات
- الواجهة تعمل على منفذ 80 والـ backend على 4000.
- ملفات الفيديو تُحفظ في `backend/videos` (تم ربطها كمجلد دائم في docker-compose).
- المشروع **مفتوح بدون مصادقة**: إذا نشرته على الإنترنت، ضع أمامه حماية (Basic auth أو OAuth أو firewall).
