// Video Stability Test Script
// Run this in the browser console to test video functionality

console.log('🎬 Starting Video Stability Test...');

function testVideoStability() {
  const video = document.querySelector('.hero-video');
  
  if (!video) {
    console.error('❌ Video element not found');
    return;
  }
  
  console.log('📹 Video element found:', video);
  console.log('📊 Video properties:');
  console.log('  - Source:', video.src);
  console.log('  - Muted:', video.muted);
  console.log('  - Loop:', video.loop);
  console.log('  - Autoplay:', video.autoplay);
  console.log('  - Ready State:', video.readyState);
  console.log('  - Paused:', video.paused);
  console.log('  - Current Time:', video.currentTime);
  console.log('  - Duration:', video.duration);
  
  // Test video visibility
  const videoStyle = window.getComputedStyle(video);
  console.log('👁️ Video visibility:');
  console.log('  - Opacity:', videoStyle.opacity);
  console.log('  - Display:', videoStyle.display);
  console.log('  - Visibility:', videoStyle.visibility);
  
  // Test fallback background
  const fallback = document.querySelector('.hero-fallback-bg');
  if (fallback) {
    const fallbackStyle = window.getComputedStyle(fallback);
    console.log('🖼️ Fallback background:');
    console.log('  - Opacity:', fallbackStyle.opacity);
    console.log('  - Display:', fallbackStyle.display);
  }
  
  // Test play functionality
  if (video.paused) {
    console.log('▶️ Attempting to play video...');
    video.play().then(() => {
      console.log('✅ Video play successful');
    }).catch(error => {
      console.log('❌ Video play failed:', error.name);
    });
  } else {
    console.log('✅ Video is already playing');
  }
  
  // Monitor video for 5 seconds
  let checkCount = 0;
  const monitor = setInterval(() => {
    checkCount++;
    console.log(`📊 Check ${checkCount}: Paused=${video.paused}, Time=${video.currentTime.toFixed(2)}s`);
    
    if (checkCount >= 5) {
      clearInterval(monitor);
      console.log('🏁 Video stability test completed');
      
      if (!video.paused && video.currentTime > 0) {
        console.log('✅ Video is stable and playing');
      } else {
        console.log('⚠️ Video may have stability issues');
      }
    }
  }, 1000);
}

// Run the test
testVideoStability();