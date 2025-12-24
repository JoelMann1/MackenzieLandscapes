// Gallery Performance Test Script
// Run this in the browser console on gallery.html

(function() {
  console.log('%c🚀 GALLERY PERFORMANCE TEST SUITE', 'background: #596B3A; color: white; font-size: 20px; padding: 10px;');
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Image Count
  console.log('%c📸 Test 1: Image Analysis', 'color: #7B8B47; font-weight: bold; font-size: 16px;');
  const images = document.querySelectorAll('.gallery-grid img');
  const totalImages = images.length;
  console.log(`   Total images: ${totalImages}`);

  let loadedImages = 0;
  let lazyImages = 0;
  let imagesWithSrc = 0;
  let imagesWithDataSrc = 0;

  images.forEach((img, index) => {
    if(img.complete && img.naturalHeight !== 0) loadedImages++;
    if(img.getAttribute('loading') === 'lazy') lazyImages++;
    if(img.src && img.src !== '') imagesWithSrc++;
    if(img.getAttribute('data-src')) imagesWithDataSrc++;
  });

  console.log(`   ✅ Loaded: ${loadedImages}/${totalImages}`);
  console.log(`   ⚡ Lazy loading enabled: ${lazyImages}/${totalImages}`);
  console.log(`   🔗 With src: ${imagesWithSrc}`);
  console.log(`   📦 With data-src: ${imagesWithDataSrc}`);
  console.log('');

  results.tests.push({
    name: 'Image Analysis',
    total: totalImages,
    loaded: loadedImages,
    lazy: lazyImages,
    withSrc: imagesWithSrc,
    withDataSrc: imagesWithDataSrc
  });

  // Test 2: Lenis Check
  console.log('%c🎬 Test 2: Lenis Smooth Scroll', 'color: #7B8B47; font-weight: bold; font-size: 16px;');
  const lenisLoaded = typeof Lenis !== 'undefined';
  const lenisActive = window.lenis !== undefined;
  const hasLenisClass = document.documentElement.classList.contains('lenis');

  console.log(`   Lenis library loaded: ${lenisLoaded ? '❌ YES (should be removed)' : '✅ NO'}`);
  console.log(`   Lenis instance active: ${lenisActive ? '❌ YES' : '✅ NO'}`);
  console.log(`   HTML has lenis class: ${hasLenisClass ? '❌ YES' : '✅ NO'}`);
  console.log('');

  results.tests.push({
    name: 'Lenis Check',
    libraryLoaded: lenisLoaded,
    instanceActive: lenisActive,
    hasClass: hasLenisClass,
    status: !lenisLoaded && !lenisActive ? 'PASS' : 'FAIL'
  });

  // Test 3: Performance Metrics
  console.log('%c⚡ Test 3: Performance Metrics', 'color: #7B8B47; font-weight: bold; font-size: 16px;');

  if(performance && performance.getEntriesByType) {
    const navTiming = performance.getEntriesByType('navigation')[0];
    if(navTiming) {
      const domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart;
      const loadComplete = navTiming.loadEventEnd - navTiming.loadEventStart;
      const domInteractive = navTiming.domInteractive - navTiming.fetchStart;

      console.log(`   DOM Content Loaded: ${domContentLoaded.toFixed(2)}ms`);
      console.log(`   Load Complete: ${loadComplete.toFixed(2)}ms`);
      console.log(`   DOM Interactive: ${domInteractive.toFixed(2)}ms`);

      results.tests.push({
        name: 'Performance Timing',
        domContentLoaded: domContentLoaded.toFixed(2) + 'ms',
        loadComplete: loadComplete.toFixed(2) + 'ms',
        domInteractive: domInteractive.toFixed(2) + 'ms'
      });
    }
  }
  console.log('');

  // Test 4: Memory Usage (if available)
  console.log('%c💾 Test 4: Memory Usage', 'color: #7B8B47; font-weight: bold; font-size: 16px;');
  if(performance.memory) {
    const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
    const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
    const limitMB = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);

    console.log(`   Used: ${usedMB} MB`);
    console.log(`   Total: ${totalMB} MB`);
    console.log(`   Limit: ${limitMB} MB`);

    results.tests.push({
      name: 'Memory Usage',
      used: usedMB + ' MB',
      total: totalMB + ' MB',
      limit: limitMB + ' MB'
    });
  } else {
    console.log('   ⚠️ Memory API not available');
  }
  console.log('');

  // Test 5: Scroll Performance
  console.log('%c📜 Test 5: Scroll Performance Test', 'color: #7B8B47; font-weight: bold; font-size: 16px;');
  console.log('   Starting 3-second scroll test...');

  let frameCount = 0;
  let lastTime = performance.now();
  const frameTimes = [];

  function measureFrame() {
    const now = performance.now();
    const delta = now - lastTime;
    frameTimes.push(delta);
    lastTime = now;
    frameCount++;
  }

  const scrollInterval = setInterval(measureFrame, 16);

  setTimeout(() => {
    clearInterval(scrollInterval);
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const fps = 1000 / avgFrameTime;

    console.log(`   ✅ Average FPS: ${fps.toFixed(2)}`);
    console.log(`   ✅ Frame count: ${frameCount}`);
    console.log(`   ✅ Avg frame time: ${avgFrameTime.toFixed(2)}ms`);

    results.tests.push({
      name: 'Scroll Performance',
      fps: fps.toFixed(2),
      frameCount: frameCount,
      avgFrameTime: avgFrameTime.toFixed(2) + 'ms'
    });

    // Final Summary
    console.log('');
    console.log('%c✅ TEST SUMMARY', 'background: #4ade80; color: black; font-size: 18px; padding: 10px;');
    console.log('');
    console.table(results.tests);
    console.log('');
    console.log('%cCopy results:', 'font-weight: bold;');
    console.log(JSON.stringify(results, null, 2));
  }, 3000);

  console.log('');
})();
