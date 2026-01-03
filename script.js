/* Global references */
const page = document.getElementById('page');

/* DOM ready */
window.addEventListener('DOMContentLoaded', () => {
  // entrance
  requestAnimationFrame(() => page.classList.add('visible'));

  initTheme();
  initScrollAnimations();
  initContactForm();
  initScrollSpy();      // highlight nav while scrolling (anchors)
  initSetActiveOnLoad();// mark active nav item for the current page (file-based)
  initRipple();         // button ripple effect
  initParallax();       // hero parallax
  initTilt(); 
  initCarousels();          // tilt micro-interactions on cards
});

/* --------------------------
   Theme toggle (persist)
   -------------------------- */
function initTheme(){
  const toggle = document.getElementById('theme-toggle');
  const body = document.body;
  const current = localStorage.getItem('theme');
  if (current === 'dark') body.classList.add('dark');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    toggle.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

/* --------------------------
   Scroll animations (IntersectionObserver)
   -------------------------- */
function initScrollAnimations(){
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
}

/* --------------------------
   Scrollspy (anchors only)
   -------------------------- */
function initScrollSpy(){
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');

  function onScroll(){
    let current = "";
    sections.forEach(s => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom > 120) current = s.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#') && href.slice(1) === current) {
        link.classList.add('active');
      } else if (href.startsWith('#')) {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // run once
  onScroll();
}

/* --------------------------
   Mark nav link active on page load (file match)
   -------------------------- */
function initSetActiveOnLoad(){
  const navLinks = document.querySelectorAll('.main-nav a');
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => link.classList.remove('active'));
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    // If link points to this file (exact match or endsWith)
    if (!href.startsWith('#') && (href === currentFile || href.endsWith(currentFile))) {
      link.classList.add('active');
    }
  });
}

/* --------------------------
   Ripple effect for buttons (dynamic element)
   -------------------------- */
function initRipple(){
  document.querySelectorAll('.btn.ripple').forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      circle.className = 'ripple-effect';
      const diameter = Math.max(rect.width, rect.height) * 1.1;
      circle.style.width = circle.style.height = `${diameter}px`;
      // calculate position relative to button
      const x = e.clientX - rect.left - diameter / 2;
      const y = e.clientY - rect.top - diameter / 2;
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });
}

/* --------------------------
   Parallax (hero photo)
   -------------------------- */
function initParallax(){
  const elems = document.querySelectorAll('.parallax');
  if (!elems.length) return;
  window.addEventListener('scroll', () => {
    elems.forEach(el => {
      // small translation for depth
      const offset = window.scrollY * 0.12;
      el.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });
}

/* --------------------------
   Tilt micro-interaction (cards)
   -------------------------- */
function initTilt(){
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('mousemove', function(e){
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * 6;   // degrees
      const rotateX = -y * 6;
      this.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
      this.style.transition = 'transform 0.08s linear';
    });
    el.addEventListener('mouseleave', function(){
      this.style.transform = '';
      this.style.transition = 'transform 0.45s cubic-bezier(.22,.9,.3,1)';
      setTimeout(() => this.style.transition = '', 500);
    });
  });
}

/* --------------------------
   Contact form (AJAX + auto-clear)
   -------------------------- */
function initContactForm(){
  const form = document.getElementById('contact-form');
  const msg = document.getElementById('form-message');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Build form data
    const formData = new FormData(form);
    msg.textContent = "Sending…";
    msg.style.color = '';

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset(); // clear fields
        msg.textContent = "Thank you — your message has been sent!";
        msg.style.color = 'darkbrown';
      } else {
        msg.textContent = "Oops — something went wrong. Please try again.";
        msg.style.color = 'red';
      }
    } catch (error) {
      msg.textContent = "Network error — please try again later.";
      msg.style.color = 'red';
    }
  });
}

/* --------------------------
   Carousels (auto-rotate + click-to-lightbox)
   -------------------------- */
function initCarousels(){
  document.querySelectorAll('.carousel').forEach(carousel=>{
    const imgs = carousel.querySelectorAll('.carousel-image');
    if(!imgs.length) return;

    let idx = 0;
    const interval = parseInt(carousel.dataset.interval,10) || 5000;
    let timer = setInterval(next, interval);

    function show(i){
      imgs.forEach((img,j)=> img.classList.toggle('visible', j===i));
    }
    function next(){ 
      idx = (idx+1) % imgs.length; 
      show(idx); 
    }
    
    // pause on hover
    carousel.addEventListener('mouseenter', ()=> clearInterval(timer));
    carousel.addEventListener('mouseleave', ()=> timer=setInterval(next, interval));

    // open in lightbox only when clicking on an image
    imgs.forEach((img,i)=>{
      img.addEventListener('click', (e)=>{
        e.stopPropagation();
        openLightbox([...imgs].map(im=>({src:im.src,alt:im.alt})), i);
      });
    });
  });
}

/* --------------------------
   Redesigned Lightbox (drop-in)
   -------------------------- */
function openLightbox(items, startIndex = 0) {
  const lb = document.getElementById('lightbox');
  const overlay = lb.querySelector('[data-overlay]');
  const imgEl = lb.querySelector('#lb-image');
  const prevBtn = lb.querySelector('[data-prev]');
  const nextBtn = lb.querySelector('[data-next]');
  const closeBtn = lb.querySelector('[data-close]');
  const progress = lb.querySelector('#lb-progress');

  let idx = startIndex;
  let touchStartX = 0;

  // Clear previous progress (if any)
  progress.innerHTML = '';

  // Create progress buttons
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `  ${i + 1}`;
    b.addEventListener('click', () => show(i));
    progress.appendChild(b);
  });

  function updateProgress() {
    const bs = Array.from(progress.querySelectorAll('button'));
    bs.forEach((b, i) => b.classList.toggle('active', i === idx));
  }

  // Show image with preload & fade
  function show(i) {
    if (i < 0 || i >= items.length) return;
    idx = i;

    // Preload image
    const pre = new Image();
    pre.src = items[idx].src;
    pre.alt = items[idx].alt || '';

    // Hide current image while loading new one
    imgEl.classList.remove('visible');

    pre.onload = () => {
      imgEl.src = pre.src;
      imgEl.alt = pre.alt;
      // force reflow then fade in
      requestAnimationFrame(() => {
        imgEl.classList.add('visible');
      });
    };

    // If image fails, still set alt and visible so layout remains
    pre.onerror = () => {
      imgEl.src = items[idx].src;
      imgEl.alt = items[idx].alt || '';
      requestAnimationFrame(() => imgEl.classList.add('visible'));
    };

    updateProgress();
  }

  function prev() {
    idx = (idx - 1 + items.length) % items.length;
    show(idx);
  }

  function next() {
    idx = (idx + 1) % items.length;
    show(idx);
  }

  function close() {
    // remove class and restore body scroll
    lb.classList.remove('open');
    document.body.classList.remove('lb-open');

    // remove event listeners we attached (cleanup)
    document.removeEventListener('keydown', onKeyDown);
    overlay.removeEventListener('click', onOverlayClick);
    lb.removeEventListener('touchstart', onTouchStart);
    lb.removeEventListener('touchend', onTouchEnd);
    prevBtn.removeEventListener('click', prev);
    nextBtn.removeEventListener('click', next);
    closeBtn.removeEventListener('click', close);
  }

  // Event handler references for removal later
  function onKeyDown(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }
  function onOverlayClick(e) {
    // close only when clicking the overlay itself (not content)
    if (e.target === overlay) close();
  }
  function onTouchStart(e) {
    touchStartX = e.touches[0] ? e.touches[0].clientX : 0;
  }
  function onTouchEnd(e) {
    const touchEndX = e.changedTouches[0] ? e.changedTouches[0].clientX : 0;
    const diff = touchEndX - touchStartX;
    if (diff > 60) prev();
    if (diff < -60) next();
  }

  // Open
  lb.classList.add('open');
  document.body.classList.add('lb-open');

  // Add listeners
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onKeyDown);

  // Touch support on the lightbox container (swipe)
  lb.addEventListener('touchstart', onTouchStart, { passive: true });
  lb.addEventListener('touchend', onTouchEnd, { passive: true });

  // show initial
  show(idx);
}


   /* --------------------------
   Stars rating library
   -------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stars').forEach(starBlock => {
    const rating = parseFloat(starBlock.dataset.rating) || 0;;
    const percent = (rating / 5) * 100;
    starBlock.style.setProperty('--percent', percent);
  });
});
