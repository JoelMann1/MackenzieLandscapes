
// Smooth Scroll with Lenis
(function(){
  if(typeof Lenis !== 'undefined'){
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      lerp: prefersReducedMotion ? 1 : 0.08,  // Lower = more inertia/smoothness (0.08 is very cinematic)
      duration: prefersReducedMotion ? 0.8 : 1.8,  // How long scroll animations take
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // Smooth easing curve
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: !prefersReducedMotion,  // Disable if user prefers reduced motion
      wheelMultiplier: prefersReducedMotion ? 1.0 : 0.6,  // Lower = smaller distance per scroll (more cinematic)
      touchMultiplier: prefersReducedMotion ? 1.0 : 1.5,  // Touch scroll sensitivity
      smoothTouch: false,  // Keep native touch scrolling on mobile
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if(href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if(target){
          lenis.scrollTo(target, {
            offset: -100,
            duration: prefersReducedMotion ? 0.8 : 2.5
          });
        }
      });
    });

    // Expose lenis globally for debugging
    window.lenis = lenis;
  } else {
    console.warn('Lenis library not loaded');
  }
})();

// Navigation, sticky header, dropdowns, and interactions
(function(){
  const header = document.querySelector('[data-header]');
  const sentinel = document.querySelector('#header-sentinel');
  const menuItems = Array.from(document.querySelectorAll('.menu-item.has-panel'));
  const topLevelControls = Array.from(document.querySelectorAll('.menu > .menu-item > a, .menu > .menu-item .menu-trigger'));
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const allowHover = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if(header){
    let lastScrollY = window.scrollY;
    let scrollDirection = 'up';

    if('IntersectionObserver' in window && sentinel){
      const io = new IntersectionObserver(([entry]) => {
        header.classList.toggle('is-stuck', !entry.isIntersecting);
      }, {threshold:[0,1]});
      io.observe(sentinel);
    }else{
      const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
      onScroll();
      window.addEventListener('scroll', onScroll, {passive:true});
    }

    // Hide on scroll down, show on scroll up
    const handleScrollDirection = () => {
      const currentScrollY = window.scrollY;

      if(currentScrollY > lastScrollY && currentScrollY > 100){
        // Scrolling down & past threshold
        scrollDirection = 'down';
        header.classList.add('is-hidden');
      } else if(currentScrollY < lastScrollY){
        // Scrolling up
        scrollDirection = 'up';
        header.classList.remove('is-hidden');
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScrollDirection, {passive:true});
  }

  const closeMenu = (li)=>{
    if(!li) return;
    const trigger = li.querySelector('.menu-trigger');
    const panel = li.querySelector('.menu-panel');
    li.classList.remove('open');
    if(trigger){ trigger.setAttribute('aria-expanded','false'); }
    if(panel){
      panel.hidden = true;
      panel.setAttribute('aria-hidden','true');
    }
  };

  const openMenu = (li)=>{
    if(!li) return;
    menuItems.forEach(item => { if(item !== li){ closeMenu(item); } });
    const trigger = li.querySelector('.menu-trigger');
    const panel = li.querySelector('.menu-panel');
    if(trigger){ trigger.setAttribute('aria-expanded','true'); }
    if(panel){
      panel.hidden = false;
      panel.removeAttribute('aria-hidden');
    }
    li.classList.add('open');
  };

  const closeAll = ()=> menuItems.forEach(closeMenu);

  function moveHorizontal(current, dir){
    const index = topLevelControls.indexOf(current);
    if(index === -1){ return; }
    const next = topLevelControls[(index + dir + topLevelControls.length) % topLevelControls.length];
    if(!next){ return; }
    if(next.matches('.menu-trigger')){
      openMenu(next.closest('.menu-item'));
    }else{
      closeAll();
    }
    next.focus();
  }

  menuItems.forEach(li => {
    const trigger = li.querySelector('.menu-trigger');
    const panel = li.querySelector('.menu-panel');
    if(!trigger || !panel){ return; }

    closeMenu(li);
    trigger.setAttribute('aria-expanded','false');
    panel.hidden = true;
    panel.setAttribute('aria-hidden','true');

    let hoverTimer = null;
    const cancelHover = () => { if(hoverTimer){ clearTimeout(hoverTimer); hoverTimer = null; } };

    if(allowHover){
      li.addEventListener('mouseenter', () => {
        cancelHover();
        openMenu(li);
      });
      li.addEventListener('mouseleave', () => {
        hoverTimer = setTimeout(() => closeMenu(li), 140);
      });
      panel.addEventListener('mouseenter', cancelHover);
      panel.addEventListener('mouseleave', () => {
        hoverTimer = setTimeout(() => closeMenu(li), 140);
      });
    }

    li.addEventListener('focusin', () => openMenu(li));
    li.addEventListener('focusout', (event) => {
      if(!li.contains(event.relatedTarget)){
        closeMenu(li);
      }
    });

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      if(expanded){
        closeMenu(li);
      }else{
        openMenu(li);
        const first = panel.querySelector(focusableSelector);
        first?.focus();
      }
    });

    trigger.addEventListener('keydown', (event) => {
      if(event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown'){
        event.preventDefault();
        openMenu(li);
        const first = panel.querySelector(focusableSelector);
        first?.focus();
      }else if(event.key === 'ArrowUp'){
        event.preventDefault();
        openMenu(li);
        const items = Array.from(panel.querySelectorAll(focusableSelector));
        items[items.length - 1]?.focus();
      }else if(event.key === 'Escape'){
        event.preventDefault();
        closeMenu(li);
        trigger.focus();
      }else if(event.key === 'ArrowRight' || event.key === 'ArrowLeft'){
        event.preventDefault();
        moveHorizontal(trigger, event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    panel.addEventListener('keydown', (event) => {
      const items = Array.from(panel.querySelectorAll(focusableSelector));
      if(!items.length){ return; }
      const index = items.indexOf(document.activeElement);
      if(event.key === 'ArrowDown'){
        event.preventDefault();
        items[(index + 1) % items.length].focus();
      }else if(event.key === 'ArrowUp'){
        event.preventDefault();
        items[(index - 1 + items.length) % items.length].focus();
      }else if(event.key === 'Home'){
        event.preventDefault();
        items[0].focus();
      }else if(event.key === 'End'){
        event.preventDefault();
        items[items.length - 1].focus();
      }else if(event.key === 'Escape'){
        event.preventDefault();
        closeMenu(li);
        trigger.focus();
      }else if(event.key === 'ArrowRight' || event.key === 'ArrowLeft'){
        event.preventDefault();
        closeMenu(li);
        moveHorizontal(trigger, event.key === 'ArrowRight' ? 1 : -1);
      }
    });
  });

  topLevelControls.forEach(control => {
    if(control.classList.contains('menu-trigger')){ return; }
    control.addEventListener('keydown', (event) => {
      if(event.key === 'ArrowRight' || event.key === 'ArrowLeft'){
        event.preventDefault();
        moveHorizontal(control, event.key === 'ArrowRight' ? 1 : -1);
      }
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if(!event.target.closest('.menu-item.has-panel')){
      closeAll();
    }
  });

  document.addEventListener('focusin', (event) => {
    if(!event.target.closest('.menu-item.has-panel')){
      closeAll();
    }
  });

  const currentPath = location.pathname.split('/').pop() || 'index.html';
  const servicePaths = new Set(['concept-and-design.html','softscaping.html','hardscaping.html','tree-care.html','commercial.html','maintenance.html']);
  const projectsPaths = new Set(['gallery.html']);

  if(servicePaths.has(currentPath)){
    document.querySelector('.menu-item.has-panel[data-menu="services"]')?.setAttribute('aria-current','page');
  }
  if(projectsPaths.has(currentPath)){
    document.querySelector('.menu-item.has-panel[data-menu="projects"]')?.setAttribute('aria-current','page');
  }

  document.querySelectorAll('.menu > .menu-item > a[role="menuitem"]').forEach(link => {
    const href = link.getAttribute('href');
    if(href === currentPath){
      link.closest('.menu-item')?.setAttribute('aria-current','page');
    }
  });

  // Hero slider
  const heroSlider = document.querySelector('[data-hero-slider]');
  if(heroSlider){
    const slides = Array.from(heroSlider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(heroSlider.querySelectorAll('[data-hero-dot]'));
    const prevBtn = heroSlider.querySelector('.hero-control--prev');
    const nextBtn = heroSlider.querySelector('.hero-control--next');
    let current = slides.findIndex(slide => slide.classList.contains('is-active'));
    if(current < 0){ current = 0; }
    let autoTimer;
    const interval = 7000;

    const goTo = index=>{
      if(!slides.length){ return; }
      const nextIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i)=>{
        const active = i === nextIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        if(dots[i]){
          dots[i].classList.toggle('is-active', active);
          dots[i].setAttribute('aria-pressed', String(active));
        }
      });
      current = nextIndex;
    };

    const next = ()=> goTo(current + 1);
    const prev = ()=> goTo(current - 1);

    const pause = ()=>{
      if(autoTimer){
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };

    const resume = ()=>{
      if(slides.length <= 1){ return; }
      pause();
      autoTimer = setInterval(next, interval);
    };

    goTo(current);

    if(slides.length > 1){
      if(prevBtn){
        prevBtn.addEventListener('click', ()=>{
          prev();
          resume();
        });
      }
      if(nextBtn){
        nextBtn.addEventListener('click', ()=>{
          next();
          resume();
        });
      }
      dots.forEach((dot, i)=>{
        dot.addEventListener('click', ()=>{
          if(i === current){ return; }
          goTo(i);
          resume();
        });
      });

      heroSlider.addEventListener('mouseenter', pause);
      heroSlider.addEventListener('mouseleave', resume);
      heroSlider.addEventListener('focusin', pause);
      heroSlider.addEventListener('focusout', resume);

      resume();
    }else{
      if(prevBtn){ prevBtn.setAttribute('hidden','true'); }
      if(nextBtn){ nextBtn.setAttribute('hidden','true'); }
      const dotsWrap = heroSlider.querySelector('.hero-dots');
      if(dotsWrap){ dotsWrap.setAttribute('hidden','true'); }
    }
  }

  // Services Accordion
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const toggle = item.querySelector('.accordion-item__toggle');
    const content = item.querySelector('.accordion-item__content');

    if(toggle && content){
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        // Close all other accordions
        accordionItems.forEach(otherItem => {
          if(otherItem !== item){
            const otherToggle = otherItem.querySelector('.accordion-item__toggle');
            const otherContent = otherItem.querySelector('.accordion-item__content');
            if(otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
            if(otherContent) otherContent.setAttribute('aria-hidden', 'true');
          }
        });

        // Toggle current accordion
        toggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        content.setAttribute('aria-hidden', isExpanded ? 'true' : 'false');
      });
    }
  });

  // Simple image rotators
  document.querySelectorAll('[data-rotator]').forEach(rotator=>{
    const frames = Array.from(rotator.querySelectorAll('img'));
    if(frames.length <= 1){ return; }
    let index = frames.findIndex(img => img.classList.contains('is-active'));
    if(index < 0){
      index = 0;
      frames[0].classList.add('is-active');
    }
    const delayAttr = parseInt(rotator.getAttribute('data-rotator-interval'), 10);
    const rotateInterval = Number.isFinite(delayAttr) && delayAttr > 0 ? delayAttr : 7000;

    setInterval(()=>{
      frames[index].classList.remove('is-active');
      index = (index + 1) % frames.length;
      frames[index].classList.add('is-active');
    }, rotateInterval);
  });
  // Mark active nav item
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path){
      a.classList.add('active');
      a.setAttribute('aria-current','page');
      const dropdownMenu = a.closest('.dropdown-menu');
      if(dropdownMenu){
        const toggle = dropdownMenu.parentElement.querySelector('.dropdown-toggle');
        if(toggle){
          toggle.classList.add('is-current');
        }
      }
    }
  });

  // Enhanced Reveal on scroll with multiple animation types
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      }
    });
  }, {threshold:0.1, rootMargin:'0px 0px -50px 0px'});

  // Observe all reveal types
  document.querySelectorAll('[data-reveal], [data-reveal-left], [data-reveal-right], [data-reveal-scale], [data-reveal-stagger], [data-reveal-fade]').forEach(el=> {
    revealObserver.observe(el);
  });

  // Year in footer
  const y = document.getElementById('year'); if(y){ y.textContent = new Date().getFullYear(); }

  // Basic form validation + async submit (works with Formspree endpoint in action attr)
  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const status = form.querySelector('.form-status');
      status.textContent = '';
      let ok = true;
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');
      const errs = {name:'', email:'', message:''};

      if(!name.value.trim()){ errs.name = 'Please enter your name.'; ok = false; }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)){ errs.email = 'Please enter a valid email.'; ok = false; }
      if(!message.value.trim()){ errs.message = 'Please enter a message.'; ok = false; }

      ['name','email','message'].forEach(id => {
        const errEl = form.querySelector(`[data-for="${id}"]`);
        if(errEl) errEl.textContent = errs[id];
      });
      if(!ok){ return; }

      const endpoint = form.getAttribute('action');
      const formData = new FormData(form);
      try{
        const res = await fetch(endpoint, { method:'POST', body: formData, headers: { 'Accept': 'application/json' } });
        if(res.ok){
          status.textContent = "Thanks — we'll be in touch shortly.";
          form.reset();
        } else {
          status.textContent = 'Sorry, something went wrong. Please email us directly.';
        }
      }catch(err){
        status.textContent = 'Network error. Please try again or email us directly.';
      }
    });
  }
})();

// Mobile Menu Toggle
(function(){
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileSubmenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
  const body = document.body;

  if(!mobileMenuToggle || !mobileMenu) return;

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const isOpen = mobileMenuToggle.getAttribute('aria-expanded') === 'true';

    if(isOpen){
      // Close menu
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      body.classList.remove('mobile-menu-open');

      // Close all submenus
      mobileSubmenuToggles.forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
      });
    }else{
      // Open menu
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      body.classList.add('mobile-menu-open');
    }
  };

  // Handle hamburger button click
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);

  // Handle submenu toggles
  mobileSubmenuToggles.forEach(toggle => {
    toggle.addEventListener('click', function(){
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    });
  });

  // Close menu when clicking on a link (not submenu toggle)
  const mobileMenuLinks = mobileMenu.querySelectorAll('.mobile-menu__link:not(.mobile-submenu-toggle), .mobile-submenu a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Small delay to allow navigation
      setTimeout(() => {
        if(mobileMenuToggle.getAttribute('aria-expanded') === 'true'){
          toggleMobileMenu();
        }
      }, 150);
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && mobileMenuToggle.getAttribute('aria-expanded') === 'true'){
      toggleMobileMenu();
    }
  });

  // Close menu when clicking outside
  mobileMenu.addEventListener('click', (e) => {
    if(e.target === mobileMenu){
      toggleMobileMenu();
    }
  });

  // Handle window resize - close menu if resizing to desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if(window.innerWidth > 1024 && mobileMenuToggle.getAttribute('aria-expanded') === 'true'){
        toggleMobileMenu();
      }
    }, 250);
  });
})();


// Parallax scrolling effect - sequential images rising from bottom
(function(){
  const parallaxSection = document.querySelector('.section--parallax-hero');
  if(!parallaxSection){
    console.log('Parallax section not found');
    return;
  }

  const parallaxImages = parallaxSection.querySelectorAll('.parallax-hero__img');

  if(!parallaxImages.length){
    console.log('No parallax images found');
    return;
  }

  console.log(`Found ${parallaxImages.length} parallax images`);

  let ticking = false;

  const updateParallax = () => {
    const windowHeight = window.innerHeight;
    const sectionRect = parallaxSection.getBoundingClientRect();
    const sectionTop = sectionRect.top;
    const sectionHeight = sectionRect.height;

    // Only animate when section is in view
    if(sectionTop > windowHeight || sectionTop + sectionHeight < 0){
      ticking = false;
      return;
    }

    // Calculate overall scroll progress through the entire section (0 to 1)
    const scrollProgress = Math.max(0, Math.min(1,
      (windowHeight - sectionTop) / (sectionHeight + windowHeight)
    ));

    parallaxImages.forEach((img, index) => {
      const totalImages = parallaxImages.length;

      // Create overlapping groups - multiple images move together for depth
      // Tighter spacing so all images appear throughout the scroll
      const segmentSize = 1 / (totalImages + 2); // Smaller segments = tighter spacing
      const overlapFactor = 2.2; // Each image visible longer (creates 2-3 simultaneous)
      const imageStartProgress = index * segmentSize;
      const imageEndProgress = imageStartProgress + (segmentSize * overlapFactor);

      // Calculate this image's individual progress (0 to 1 during its active period)
      let imageProgress = (scrollProgress - imageStartProgress) / (imageEndProgress - imageStartProgress);
      imageProgress = Math.max(0, Math.min(1, imageProgress));

      // Calculate vertical position
      // Start: below viewport (windowHeight + 200)
      // End: above viewport (-800)
      const startY = windowHeight + 200;
      const endY = -800;
      const yPosition = startY + (endY - startY) * imageProgress;

      // Calculate opacity with fade in/out
      let opacity = 0;
      if(imageProgress > 0 && imageProgress < 1){
        if(imageProgress < 0.15){
          // Fade in
          opacity = imageProgress / 0.15;
        } else if(imageProgress > 0.85){
          // Fade out
          opacity = (1 - imageProgress) / 0.15;
        } else {
          // Fully visible
          opacity = 1;
        }
      }

      // Apply layer-specific opacity reduction for back images
      if(img.getAttribute('data-layer') === 'back'){
        opacity *= 0.75;
      }

      // Apply transforms - center images on their track position
      img.style.transform = `translateX(-50%) translateY(${yPosition}px)`;
      img.style.opacity = opacity;
    });

    ticking = false;
  };

  const requestTick = () => {
    if(!ticking){
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, {passive:true});
  window.addEventListener('resize', requestTick, {passive:true});

  // Initial update
  updateParallax();
})();

// Testimonials Slider
(function(){
  const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
  const prevBtn = document.querySelector('.testimonial-nav--prev');
  const nextBtn = document.querySelector('.testimonial-nav--next');

  if(!slides.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
    });
  };

  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  };

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Optional: Auto-advance every 8 seconds
  // setInterval(nextSlide, 8000);
})();

// Auto-Sliding Testimonial Cards with Drag Functionality
(function(){
  const track = document.querySelector('.testimonial-slider__track');
  if(!track) return;

  const cards = Array.from(track.children);

  // Duplicate cards for infinite scroll effect
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    track.appendChild(clone);
  });

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let velocity = 0;
  let animationId = null;

  // Pause animation on hover
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });

  track.addEventListener('mouseleave', () => {
    if(!isDragging){
      track.style.animationPlayState = 'running';
    }
  });

  // Drag functionality for desktop
  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
    track.style.animationPlayState = 'paused';

    if(animationId){
      cancelAnimationFrame(animationId);
    }
  });

  track.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    velocity = walk;
    track.scrollLeft = scrollLeft - walk;
  });

  track.addEventListener('mouseup', () => {
    if(!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';

    // Apply momentum
    const decelerate = () => {
      if(Math.abs(velocity) > 0.5){
        track.scrollLeft -= velocity;
        velocity *= 0.95;
        animationId = requestAnimationFrame(decelerate);
      } else {
        track.style.animationPlayState = 'running';
      }
    };
    decelerate();
  });

  track.addEventListener('mouseleave', () => {
    if(isDragging){
      isDragging = false;
      track.style.cursor = 'grab';
      track.style.animationPlayState = 'running';
    }
  });

  // Touch support for mobile
  let touchStartX = 0;
  let touchScrollLeft = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = track.scrollLeft;
    track.style.animationPlayState = 'paused';
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    const walk = (touchStartX - x) * 2;
    track.scrollLeft = touchScrollLeft + walk;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    track.style.animationPlayState = 'running';
  }, { passive: true });
})();

