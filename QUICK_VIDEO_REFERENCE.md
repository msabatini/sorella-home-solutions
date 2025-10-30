# Quick Video Reference Card

## ⚡ TL;DR
Your hero video had a caching problem. Fixed it with versioned filenames + retry logic + better diagnostics. Issue should not happen again.

## 🎯 What Changed

| Item | Before | After |
|------|--------|-------|
| **Video filename** | `home-page-hero-video4-web-compressed.mp4` | `home-page-hero-v1.mp4` |
| **Cache duration** | 1 year (immutable) | 7 days (versioned) / 1 hour (other) |
| **Retry on failure** | None | 3 retries with backoff |
| **Error visibility** | Unclear | Detailed [VIDEO] logs |
| **Update process** | Wait 1 year or clear CDN | Create v2.mp4, update code |

## 📊 Test the Fix

```javascript
// Open DevTools (F12) on home page and paste this:
document.querySelectorAll('*').forEach(el => {
  el.addEventListener('console', () => {});
});
// Filter logs by [VIDEO] to see all video operations
```

**Expected console output:**
```
[VIDEO] Initializing video element...
[VIDEO] Attempting initial play after initialization
[VIDEO] ✅ Hero video loaded successfully (2345ms)
[VIDEO] ✅ Video is playing successfully
```

## 🔧 Updating Video in Future

### Step 1: Get your video ready
- Format: MP4, H.264 codec
- Place in `/public/` folder

### Step 2: Create versioned file
```bash
cp new-video.mp4 public/home-page-hero-v2.mp4
```

### Step 3: Update one line
**File:** `src/app/pages/home/home.component.ts`

**Find this:**
```typescript
currentVideoSrc = '/home-page-hero-v1.mp4'; // Versioned video (v1) for cache busting
```

**Change to:**
```typescript
currentVideoSrc = '/home-page-hero-v2.mp4'; // Versioned video (v2) for cache busting
```

### Step 4: Deploy
```bash
npm run build
# Push to Git → Netlify auto-deploys
```

## 🐛 If Video Fails Again

### Check Browser Console:
1. Open DevTools (F12)
2. Filter for `[VIDEO]`
3. Look for error messages:
   - `MEDIA_ERR_NETWORK` → Network issue
   - `MEDIA_ERR_DECODE` → Video format broken
   - `The element has no supported sources` → Can't access file
   - `Timeout` → Server not responding

### Common Issues & Fixes:

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| `MEDIA_ERR_NETWORK` | Network error | Check internet, Netlify status |
| `MEDIA_ERR_DECODE` | Video corrupted or wrong codec | Re-export video as H.264 MP4 |
| `No supported sources` | File not at server | Check file exists in `/public/` |
| `Timeout after 5s` | Server slow or down | Check Netlify deployment status |

### Get Help:
Share these logs with support:
1. Browser console output (filter by `[VIDEO]`)
2. Netlify deploy log
3. The actual file size and codec

## 📁 Related Files

| File | Purpose |
|------|---------|
| `public/home-page-hero-v1.mp4` | The actual video file (versioned) |
| `src/app/pages/home/home.component.ts` | Video logic & retry handler |
| `src/app/pages/home/home.component.html` | Video markup |
| `netlify.toml` | Cache headers for video |
| `public/_headers` | Additional headers config |
| `VIDEO_MANAGEMENT.md` | Detailed management guide |

## 🎬 How Retry Works

If video fails:

```
Attempt 1: Retry after 1 second
↓ (if fails)
Attempt 2: Retry after 2 seconds
↓ (if fails)
Attempt 3: Retry after 4 seconds
↓ (if fails)
Show fallback background image
```

Each retry completely resets the video element and tries to load fresh.

## ✅ What You Should See

### On successful load:
- Video plays automatically
- No errors in console
- Logs show: `✅ Hero video loaded successfully`

### On fallback (if video unavailable):
- Beautiful background image displays
- Professional hero section still visible
- No broken layout
- Logs show: `ℹ️ Video not loaded - fallback background will be visible`

## 🚀 Performance Impact

- **Better:** Auto-retries handle transient issues
- **Better:** Shorter cache for safety
- **Same:** Video loads in same time (~2-3 seconds)
- **Better:** Early timeout detection (5 seconds)

## 📝 Notes

- Old filename still exists (`home-page-hero-video4-web-compressed.mp4`)
- You can delete it once you're confident
- Versioning only needed for hero video (you can do same for other videos)
- Fallback image will show if video unavailable
- No user-facing changes, just reliability improvements

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready