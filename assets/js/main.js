
// Main interactions: nav toggle, active link, reveal on scroll, simple form validation
(function(){
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const dropdownItems = document.querySelectorAll('.nav .has-dropdown');

  const closeAllDropdowns = (exceptionToggle)=>{
    dropdownItems.forEach(item=>{
      const toggle = item.querySelector('.dropdown-toggle');
      const menu = item.querySelector('.dropdown-menu');
      if(!toggle || !menu){ return; }
      if(exceptionToggle && toggle === exceptionToggle){ return; }
      toggle.setAttribute('aria-expanded','false');
      toggle.classList.remove('is-open');
      menu.hidden = true;
    });
  };

  if(navToggle && nav){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;
      navToggle.setAttribute('aria-expanded', String(nextState));
      nav.classList.toggle('open', nextState);
      nav.setAttribute('aria-expanded', String(nextState));
      if(!nextState){
        closeAllDropdowns();
      }
    });
  }

  dropdownItems.forEach(item=>{
    const toggle = item.querySelector('.dropdown-toggle');
    const menu = item.querySelector('.dropdown-menu');
    if(!toggle || !menu){ return; }
    menu.hidden = true;
    let hoverCloseTimer;

    const cancelHoverClose = ()=>{
      if(hoverCloseTimer){
        clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
      }
    };

    const openDropdown = ()=>{
      closeAllDropdowns(toggle);
      toggle.setAttribute('aria-expanded','true');
      toggle.classList.add('is-open');
      menu.hidden = false;
    };

    const hideDropdown = ()=>{
      cancelHoverClose();
      toggle.setAttribute('aria-expanded','false');
      toggle.classList.remove('is-open');
      menu.hidden = true;
    };

    toggle.addEventListener('click', event=>{
      event.preventDefault();
      cancelHoverClose();
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if(expanded){
        hideDropdown();
      }else{
        openDropdown();
      }
    });

    toggle.addEventListener('keydown', event=>{
      if(event.key === 'Escape'){
        hideDropdown();
        toggle.focus();
      }
    });

    menu.addEventListener('keydown', event=>{
      if(event.key === 'Escape'){
        hideDropdown();
        toggle.focus();
      }
    });

    const supportsHover = window.matchMedia('(hover:hover)').matches;
    if(supportsHover){
      item.addEventListener('mouseenter', ()=>{
        if(window.innerWidth > 820){
          cancelHoverClose();
          openDropdown();
        }
      });
      item.addEventListener('mouseleave', event=>{
        if(window.innerWidth > 820){
          const next = event.relatedTarget;
          if(next && item.contains(next)){
            return;
          }
          hoverCloseTimer = setTimeout(hideDropdown, 140);
        }
      });
      menu.addEventListener('mouseenter', cancelHoverClose);
      menu.addEventListener('mouseleave', event=>{
        if(window.innerWidth > 820){
          const next = event.relatedTarget;
          if(next && item.contains(next)){
            return;
          }
          hoverCloseTimer = setTimeout(hideDropdown, 140);
        }
      });
    }
  });

  document.addEventListener('click', event=>{
    if(!event.target.closest('.nav')){
      closeAllDropdowns();
    }
  });

  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 820 && nav){
      nav.classList.remove('open');
      nav.setAttribute('aria-expanded','false');
      if(navToggle){
        navToggle.setAttribute('aria-expanded','false');
      }
    }
    closeAllDropdowns();
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

  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, {threshold:.15});
  document.querySelectorAll('[data-reveal]').forEach(el=> io.observe(el));

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

