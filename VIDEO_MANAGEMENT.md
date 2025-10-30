# Hero Video Management Guide

## Problem Summary
The hero video was failing to load in production with the error: **"The element has no supported sources"**. This was caused by:
1. **Extremely aggressive caching** (1-year immutable cache)
2. **Browser and server caching conflicts** 
3. **No retry mechanism** when videos failed to load
4. **Poor error diagnostics** making troubleshooting difficult

## Solution Implemented

### 1. **Cache Busting with Versioned Filenames**
- Old file: `home-page-hero-video4-web-compressed.mp4` (no version)
- New file: `home-page-hero-v1.mp4` (versioned)

**Why this works:**
- Each version gets a fresh URL, preventing cached copies from being served
- When the video needs to be updated, you simply create `home-page-hero-v2.mp4` and update the code reference
- No need to wait for caches to expire

### 2. **Improved HTTP Caching Strategy**
- **Versioned videos** (`/home-page-hero-v*.mp4`): 7-day cache
- **Non-versioned videos**: 1-hour cache
- **Added**: `Accept-Ranges` header for better streaming support
- **Added**: CORS headers for cross-origin access

### 3. **Comprehensive Retry Logic**
- Detects when video fails to load
- Implements exponential backoff: 1s, 2s, 4s (max 3 retries)
- Each retry completely resets the video element
- Logs detailed information about why it failed

### 4. **Enhanced Error Diagnostics**
All video events now log with `[VIDEO]` prefix for easy filtering in browser console:
- `[VIDEO] ✅` = Success
- `[VIDEO] ❌` = Error
- `[VIDEO] ⚠️` = Warning
- `[VIDEO] ℹ️` = Info

### 5. **Better Loading Detection**
Added timeout detection at 5 seconds:
- If source never appears → shows error log
- If source appears but no data loads → shows error log
- Tracks detailed video element state (readyState, networkState, src, duration)

### 6. **Improved HTML Markup**
```html
<video
  #heroVideo
  [src]="currentVideoSrc"
  preload="auto"
  autoplay
  crossorigin="anonymous"
  (loadeddata)="onVideoLoaded()"
  (loadedmetadata)="onVideoLoaded()"
  (canplay)="onVideoLoaded()"
  (error)="onVideoError()"
>
```

Changes:
- `[src]` binding instead of static path (easier to manage)
- Multiple load event listeners (`loadeddata`, `loadedmetadata`, `canplay`)
- `crossorigin="anonymous"` for better server communication
- `autoplay` attribute added directly

## How to Update the Video in the Future

### When updating the video file:

1. **Get the video file ready** (should be MP4, h.264 codec, optimized)

2. **Create versioned file** in `/public/`:
   ```bash
   cp new-video.mp4 public/home-page-hero-v2.mp4
   ```

3. **Update the component** (`home.component.ts`):
   ```typescript
   currentVideoSrc = '/home-page-hero-v2.mp4'; // Update to new version
   ```

4. **Update the comment** to reflect the new version:
   ```typescript
   currentVideoSrc = '/home-page-hero-v2.mp4'; // Versioned video (v2) for cache busting
   ```

5. **Deploy** - the new video will be served immediately with no caching conflicts

### Optional: Clean up old versions
- Keep the last 2 versions in `/public/` for emergency rollback
- Delete versions older than that

## Monitoring Video Issues

### Checking the browser console:
1. Open DevTools (F12)
2. Go to Console tab
3. Filter for `[VIDEO]` to see all video logs
4. Look for errors like:
   - `MEDIA_ERR_NETWORK` = Network issue
   - `MEDIA_ERR_DECODE` = Video format problem
   - `The element has no supported sources` = File not accessible

### Checking Netlify logs:
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Deploys** tab
4. Click the most recent deploy
5. Go to **Deploy log** to see build and server issues

## Technical Details

### Video Element State Values:
- **readyState:**
  - 0 = HAVE_NOTHING (no data)
  - 1 = HAVE_METADATA (duration, dimensions)
  - 2 = HAVE_CURRENT_DATA (current frame)
  - 3 = HAVE_FUTURE_DATA (enough for playback)
  - 4 = HAVE_ENOUGH_DATA (can play through)

- **networkState:**
  - 0 = NETWORK_EMPTY (not used)
  - 1 = NETWORK_IDLE (not buffering)
  - 2 = NETWORK_LOADING (actively downloading)
  - 3 = NETWORK_NO_SOURCE (no suitable source)

### Files Modified:
- `src/app/pages/home/home.component.ts` - Enhanced video logic
- `src/app/pages/home/home.component.html` - Better markup
- `netlify.toml` - Optimized cache headers
- `public/_headers` - Additional header configuration
- `public/home-page-hero-v1.mp4` - Versioned video file (new)

## Fallback Behavior

If video fails after 3 retries:
1. `videoLoaded` flag remains `false`
2. Fallback background image shows automatically
3. `hero-fallback-bg` div displays (`SHS-main-hero-temporary.jpg`)
4. User still sees a professional-looking hero section
5. No broken layout or blank space

## Performance Notes

- **Preload strategy**: `autoplay` + `preload="auto"` ensures quick loading
- **Parallel loading**: Multiple load events tracked for reliability
- **Non-blocking**: Video errors don't break the page experience
- **Mobile-friendly**: Same video for all devices (optimized compression)

## Future Enhancements (Optional)

If issues persist, consider:
1. **WebM format** alongside MP4 for better compression
2. **HLS/DASH streaming** for larger videos
3. **Video CDN** (Bunny, Cloudflare Stream) for guaranteed uptime
4. **Thumbnail preview** before video plays
5. **Play button overlay** if autoplay fails