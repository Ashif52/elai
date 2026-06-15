/* ============================================================
   ELAI ORGANICS — Main JavaScript
   Premium Organic E-Commerce
   ============================================================ */

(function () {
  'use strict';

  // ── Utility ───────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ── Cart State (localStorage) ─────────────────────────
  let cart = JSON.parse(localStorage.getItem('elai_cart') || '[]');

  function saveCart() {
    localStorage.setItem('elai_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(name, price, image, qty = 1) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ name, price: parseFloat(price), image, qty });
    }
    saveCart();
    openCart();
    showToast(`${name} added to cart!`);
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
  }

  function updateCartQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart();
  }

  function getCartTotal() {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  // ── Update Cart UI ────────────────────────────────────
  function updateCartUI() {
    // Cart count badges
    $$('#cartCount').forEach(el => {
      const count = cart.reduce((s, i) => s + i.qty, 0);
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });

    const cartItems = $('#cartItems');
    const cartFooter = $('#cartFooter');
    if (!cartItems) return;

    if (cart.length === 0) {
      cartItems.innerHTML = `<div class="cart-drawer__empty"><div class="cart-drawer__empty-icon">🛒</div><p>Your cart is empty</p><a href="shop.html" class="btn btn--primary btn--sm" style="margin-top:1rem;">Start Shopping</a></div>`;
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    cartItems.innerHTML = cart.map((item, i) => `
      <div class="cart-drawer__item">
        <div class="cart-drawer__item-img"><img src="${item.image}" alt="${item.name}"></div>
        <div class="cart-drawer__item-info">
          <div class="cart-drawer__item-name">${item.name}</div>
          <div class="cart-drawer__item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div class="cart-drawer__item-actions">
            <div class="product-card__qty">
              <button onclick="window.__elai.updateQty(${i},-1)">−</button>
              <span>${item.qty}</span>
              <button onclick="window.__elai.updateQty(${i},1)">+</button>
            </div>
            <button class="cart-drawer__item-remove" onclick="window.__elai.removeItem(${i})">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    if (cartFooter) {
      cartFooter.style.display = 'block';
      const subtotal = getCartTotal();
      const gst = Math.round(subtotal * 0.05);
      const total = subtotal + gst;
      const s = $('#cartSubtotal');
      const g = $('#cartGst');
      const t = $('#cartTotal');
      if (s) s.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
      if (g) g.textContent = `₹${gst.toLocaleString('en-IN')}`;
      if (t) t.textContent = `₹${total.toLocaleString('en-IN')}`;
    }
  }

  // Expose to inline onclick handlers
  window.__elai = {
    updateQty: (i, d) => updateCartQty(i, d),
    removeItem: (i) => removeFromCart(i)
  };

  // ── Cart Drawer Toggle ────────────────────────────────
  function openCart() {
    const overlay = $('#cartOverlay');
    const drawer = $('#cartDrawer');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const overlay = $('#cartOverlay');
    const drawer = $('#cartDrawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Toast Notification ────────────────────────────────
  function showToast(message) {
    const existing = $('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>✓</span> ${message}`;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      background: '#0D4D3A',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '999',
      boxShadow: '0 8px 24px rgba(13,77,58,0.3)',
      animation: 'fadeInUp 0.4s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ── Init on DOM Ready ─────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {

    updateCartUI();

    // ── Header Scroll ─────────────────────────────────
    const header = $('#header');
    if (header) {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (current > 50) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
        lastScroll = current;
      }, { passive: true });
    }

    // ── Hamburger Menu ────────────────────────────────
    const hamburger = $('#hamburger');
    const nav = $('#mainNav');
    const navOverlay = $('#navOverlay');

    if (hamburger && nav) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        if (navOverlay) navOverlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
      });
      if (navOverlay) {
        navOverlay.addEventListener('click', () => {
          hamburger.classList.remove('active');
          nav.classList.remove('active');
          navOverlay.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
    }

    // ── Cart Drawer Events ────────────────────────────
    const cartBtn = $('#cartBtn');
    const cartClose = $('#cartClose');
    const cartOverlay = $('#cartOverlay');

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // ── Add to Cart Buttons ───────────────────────────
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-to-cart-btn');
      if (!btn) return;
      e.preventDefault();

      const card = btn.closest('.product-card') || btn.closest('.product-info__buttons');
      let name, price, image;

      if (btn.dataset.name) {
        name = btn.dataset.name;
        price = btn.dataset.price;
        image = btn.dataset.image;
      } else if (card) {
        name = card.dataset.name || card.querySelector('.product-card__name')?.textContent;
        price = card.dataset.price || card.querySelector('.price--new')?.textContent.replace(/[₹,]/g, '');
        image = card.dataset.image || card.querySelector('.product-card__image')?.src;
      }

      if (name && price) {
        // Check quantity selector on product page
        const qtyEl = $('#qtyValue');
        const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
        addToCart(name, price, image, qty);
      }
    });

    // ── Search Overlay ────────────────────────────────
    const searchBtn = $('#searchBtn');
    const searchOverlay = $('#searchOverlay');
    const searchClose = $('#searchClose');
    const searchInput = $('#searchInput');

    if (searchBtn && searchOverlay) {
      searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput?.focus(), 300);
      });
    }
    if (searchClose && searchOverlay) {
      searchClose.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
    if (searchOverlay) {
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
          searchOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // ── Keyboard shortcuts ────────────────────────────
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCart();
        if (searchOverlay) { searchOverlay.classList.remove('active'); document.body.style.overflow = ''; }
      }
    });

    // ── Hero Slider ───────────────────────────────────
    const heroSlider = $('#heroSlider');
    if (heroSlider) {
      const slides = $$('.hero__slide', heroSlider);
      const dots = $$('.hero__dot');
      let current = 0;
      let autoplay;

      function goToSlide(n) {
        slides[current].classList.remove('hero__slide--active');
        dots[current]?.classList.remove('hero__dot--active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('hero__slide--active');
        dots[current]?.classList.add('hero__dot--active');
      }

      function startAutoplay() {
        autoplay = setInterval(() => goToSlide(current + 1), 5000);
      }

      function resetAutoplay() {
        clearInterval(autoplay);
        startAutoplay();
      }

      const prevBtn = $('#heroPrev');
      const nextBtn = $('#heroNext');
      if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(current - 1); resetAutoplay(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(current + 1); resetAutoplay(); });

      dots.forEach(dot => {
        dot.addEventListener('click', () => { goToSlide(parseInt(dot.dataset.dot)); resetAutoplay(); });
      });

      startAutoplay();
    }

    // ── Scroll Reveal ─────────────────────────────────
    const reveals = $$('.reveal');
    if (reveals.length > 0) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      reveals.forEach(el => revealObserver.observe(el));
    }

    // ── Product Filters (Home & Shop) ─────────────────
    const filterBtns = $$('.products__filter');
    const productCards = $$('.products__grid .product-card, #shopGrid .product-card');

    if (filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('products__filter--active'));
          btn.classList.add('products__filter--active');
          const filter = btn.dataset.filter;

          productCards.forEach(card => {
            const cat = card.dataset.category;
            if (filter === 'all' || cat === filter || !cat) {
              card.style.display = '';
              card.style.animation = 'fadeInUp 0.4s ease';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    }

    // ── Product Detail Thumbnails ──────────────────────
    const thumbs = $$('.product-gallery__thumb');
    const mainImg = $('#mainProductImg');

    if (thumbs.length > 0 && mainImg) {
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          thumbs.forEach(t => t.classList.remove('product-gallery__thumb--active'));
          thumb.classList.add('product-gallery__thumb--active');
          mainImg.src = thumb.dataset.img;
        });
      });

      // Touch swipe support for product gallery
      const galleryMain = $('.product-gallery__main');
      if (galleryMain) {
        let touchStartX = 0;
        let touchEndX = 0;

        galleryMain.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        galleryMain.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        }, { passive: true });

        function handleSwipe() {
          const threshold = 50;
          const diff = touchEndX - touchStartX;
          if (Math.abs(diff) < threshold) return;

          const activeIndex = thumbs.findIndex(t => t.classList.contains('product-gallery__thumb--active'));
          if (activeIndex === -1) return;

          let newIndex = activeIndex;
          if (diff < 0) {
            // Swiped left -> Next image
            newIndex = (activeIndex + 1) % thumbs.length;
          } else {
            // Swiped right -> Prev image
            newIndex = (activeIndex - 1 + thumbs.length) % thumbs.length;
          }
          thumbs[newIndex].click();
        }
      }
    }

    // ── Product Image Zoom ────────────────────────────
    const galleryMain = $('.product-gallery__main');
    if (galleryMain && mainImg) {
      galleryMain.addEventListener('mousemove', (e) => {
        const rect = galleryMain.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
      });
      galleryMain.addEventListener('mouseleave', () => {
        mainImg.style.transformOrigin = 'center center';
        mainImg.style.transform = 'scale(1)';
      });
    }

    // ── Quantity Selector (Product Page) ───────────────
    const qtyMinus = $('#qtyMinus');
    const qtyPlus = $('#qtyPlus');
    const qtyValue = $('#qtyValue');

    if (qtyMinus && qtyPlus && qtyValue) {
      qtyMinus.addEventListener('click', () => {
        let v = parseInt(qtyValue.textContent);
        if (v > 1) qtyValue.textContent = v - 1;
      });
      qtyPlus.addEventListener('click', () => {
        let v = parseInt(qtyValue.textContent);
        if (v < 10) qtyValue.textContent = v + 1;
      });
    }

    // ── Product Tabs ──────────────────────────────────
    const tabBtns = $$('.tabs__tab');
    if (tabBtns.length > 0) {
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('tabs__tab--active'));
          $$('.tabs__content').forEach(c => c.classList.remove('tabs__content--active'));
          btn.classList.add('tabs__tab--active');
          const tab = $(`#tab-${btn.dataset.tab}`);
          if (tab) tab.classList.add('tabs__content--active');
        });
      });
    }

    // ── FAQ Accordion ─────────────────────────────────
    const faqQuestions = $$('.faq-item__question');
    faqQuestions.forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const isActive = item.classList.contains('active');
        $$('.faq-item').forEach(f => f.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });

    // ── Wishlist Toggle ───────────────────────────────
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.product-card__wishlist');
      if (!btn) return;
      e.preventDefault();
      btn.classList.toggle('active');
      const svg = btn.querySelector('svg');
      if (btn.classList.contains('active')) {
        svg.setAttribute('fill', 'currentColor');
        showToast('Added to wishlist!');
      } else {
        svg.setAttribute('fill', 'none');
        showToast('Removed from wishlist');
      }
    });

    // ── Testimonials Slider ───────────────────────────
    const testTrack = $('#testimonialTrack');
    const testPrev = $('#testPrev');
    const testNext = $('#testNext');

    if (testTrack) {
      const cards = $$('.testimonial-card', testTrack);
      let testIndex = 0;

      function getTestVisible() {
        if (window.innerWidth > 992) return 3;
        if (window.innerWidth > 576) return 2;
        return 1;
      }

      function updateTestSlider() {
        const visible = getTestVisible();
        const max = Math.max(0, cards.length - visible);
        testIndex = Math.min(testIndex, max);
        const cardWidth = cards[0]?.offsetWidth || 340;
        const gap = 24;
        testTrack.style.transform = `translateX(-${testIndex * (cardWidth + gap)}px)`;
      }

      if (testPrev) testPrev.addEventListener('click', () => { testIndex = Math.max(0, testIndex - 1); updateTestSlider(); });
      if (testNext) testNext.addEventListener('click', () => { testIndex++; updateTestSlider(); });
      window.addEventListener('resize', updateTestSlider);
    }

    // ── Timeline Animation ────────────────────────────
    const timelineProgress = $('#timelineProgress');
    if (timelineProgress) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          timelineProgress.style.width = '100%';
          observer.unobserve(entries[0].target);
        }
      }, { threshold: 0.3 });
      observer.observe(timelineProgress.closest('.timeline') || timelineProgress);
    }

    // ── Payment Method Selection ──────────────────────
    const paymentMethods = $$('.payment-method');
    paymentMethods.forEach(method => {
      method.addEventListener('click', () => {
        paymentMethods.forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
        const radio = method.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // ── Delivery Slot Selection ───────────────────────
    const deliverySlots = $$('.delivery-slot');
    deliverySlots.forEach(slot => {
      slot.addEventListener('click', () => {
        deliverySlots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
      });
    });

    // ── Place Order ───────────────────────────────────
    const placeOrderBtn = $('#placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Simple validation
        const required = $$('.checkout-section input[required]');
        let valid = true;
        required.forEach(input => {
          if (!input.value.trim()) {
            input.style.borderColor = 'var(--clr-error)';
            valid = false;
          } else {
            input.style.borderColor = '';
          }
        });

        if (valid) {
          cart = [];
          saveCart();
          // Redirect to success
          document.body.innerHTML = `
            <div class="order-success">
              <div class="order-success__card">
                <div class="order-success__icon">🎉</div>
                <h1 class="order-success__title">Order Placed Successfully!</h1>
                <p class="order-success__subtitle">Thank you for your order. We'll send you a confirmation shortly.</p>
                <div class="order-success__details">
                  <div><span class="order-success__detail-label">Order ID</span><div class="order-success__detail-value">#EO-${Date.now().toString().slice(-8)}</div></div>
                  <div><span class="order-success__detail-label">Status</span><div class="order-success__detail-value">Confirmed</div></div>
                  <div><span class="order-success__detail-label">Payment</span><div class="order-success__detail-value">Processing</div></div>
                  <div><span class="order-success__detail-label">Delivery</span><div class="order-success__detail-value">3-5 Business Days</div></div>
                </div>
                <div class="order-success__actions">
                  <a href="orders.html" class="btn btn--primary btn--lg">Track Order</a>
                  <a href="shop.html" class="btn btn--outline btn--lg">Continue Shopping</a>
                </div>
              </div>
            </div>`;
        } else {
          showToast('Please fill all required fields');
        }
      });
    }

    // ── Contact Form ──────────────────────────────────
    const contactForm = $('#contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Message sent successfully! We\'ll get back to you soon.');
        contactForm.reset();
      });
    }

    // ── Newsletter Form ───────────────────────────────
    $$('.newsletter-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Welcome to the Elai family! 🌿');
        form.reset();
      });
    });

    // ── Smooth scrolling for anchor links ─────────────
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ── Quick View (Product Cards) ────────────────────
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.quick-view-btn');
      if (!btn) return;
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;

      const name = card.dataset.name || card.querySelector('.product-card__name')?.textContent;
      const price = card.dataset.price || '0';
      const image = card.dataset.image || card.querySelector('.product-card__image')?.src;

      // Navigate to product page
      window.location.href = `product.html`;
    });

    // ── Product Card Click → Product Page ─────────────
    $$('.product-card__name').forEach(nameEl => {
      nameEl.style.cursor = 'pointer';
      nameEl.addEventListener('click', () => {
        window.location.href = 'product.html';
      });
    });

    $$('.product-card__img-wrap').forEach(imgWrap => {
      imgWrap.style.cursor = 'pointer';
      imgWrap.addEventListener('click', (e) => {
        if (!e.target.closest('.quick-view-btn') && !e.target.closest('.product-card__wishlist')) {
          window.location.href = 'product.html';
        }
      });
    });

    // ── Apple-Style Slider Controller ──────────────────
    function initAppleSlider(gridId, prevId, nextId, thumbId) {
      const grid = $('#' + gridId);
      const prevBtn = $('#' + prevId);
      const nextBtn = $('#' + nextId);
      const thumb = $('#' + thumbId);

      if (!grid) return;

      // Update progress bar and prev/next disabled state
      function updateSliderStatus() {
        const scrollWidth = grid.scrollWidth - grid.clientWidth;
        if (scrollWidth <= 0) {
          if (thumb) {
            thumb.style.width = '100%';
            thumb.style.left = '0%';
          }
          if (prevBtn) prevBtn.classList.add('carousel-btn--disabled');
          if (nextBtn) nextBtn.classList.add('carousel-btn--disabled');
          return;
        }

        const scrollLeft = grid.scrollLeft;
        const progress = Math.max(0, Math.min(1, scrollLeft / scrollWidth));
        
        const visibleRatio = grid.clientWidth / grid.scrollWidth;
        const thumbWidth = Math.max(15, Math.round(visibleRatio * 100));
        
        if (thumb) {
          thumb.style.width = thumbWidth + '%';
          thumb.style.left = (progress * (100 - thumbWidth)) + '%';
        }

        // Toggle button states
        if (prevBtn) {
          if (scrollLeft <= 5) prevBtn.classList.add('carousel-btn--disabled');
          else prevBtn.classList.remove('carousel-btn--disabled');
        }
        if (nextBtn) {
          if (scrollLeft + grid.clientWidth >= grid.scrollWidth - 5) nextBtn.classList.add('carousel-btn--disabled');
          else nextBtn.classList.remove('carousel-btn--disabled');
        }
      }

      // Scroll handlers for arrow buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const cardWidth = grid.querySelector('.product-card')?.offsetWidth || 320;
          const gap = 24;
          grid.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const cardWidth = grid.querySelector('.product-card')?.offsetWidth || 320;
          const gap = 24;
          grid.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        });
      }

      // Drag to scroll logic for desktop mouse
      let isDown = false;
      let startX;
      let scrollLeftVal;
      let dragDistance = 0;
      let isDragging = false;

      grid.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false;
        grid.style.scrollSnapType = 'none'; // Disable snapping temporarily to allow smooth drag
        grid.style.scrollBehavior = 'auto';
        startX = e.pageX - grid.offsetLeft;
        scrollLeftVal = grid.scrollLeft;
        dragDistance = 0;
      });

      grid.addEventListener('mouseleave', () => {
        if (isDown) {
          isDown = false;
          grid.style.scrollSnapType = 'x mandatory';
          grid.style.scrollBehavior = 'smooth';
        }
      });

      grid.addEventListener('mouseup', () => {
        if (isDown) {
          isDown = false;
          grid.style.scrollSnapType = 'x mandatory';
          grid.style.scrollBehavior = 'smooth';
          // Snap to nearest card
          const scrollLeft = grid.scrollLeft;
          const cardWidth = grid.querySelector('.product-card')?.offsetWidth || 320;
          const gap = 24;
          const snapIndex = Math.round(scrollLeft / (cardWidth + gap));
          grid.scrollTo({ left: snapIndex * (cardWidth + gap), behavior: 'smooth' });
        }
      });

      grid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 1.5;
        grid.scrollLeft = scrollLeftVal - walk;
        dragDistance += Math.abs(walk);
        if (dragDistance > 10) {
          isDragging = true;
        }
      });

      // Capture phase listener to prevent clicks while dragging
      grid.addEventListener('click', (e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      // Event listeners for scroll adjustments
      grid.addEventListener('scroll', updateSliderStatus);
      window.addEventListener('resize', updateSliderStatus);

      // Initial status update (wait a tiny bit for render layout)
      setTimeout(updateSliderStatus, 200);

      // If category filter hides cards on home page, update slider layout
      const filterBtns = $$('.products__filter');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          setTimeout(updateSliderStatus, 450); // wait for fade out animations to end
        });
      });
    }

    // Initialize the sliders
    initAppleSlider('productsGrid', 'featuredPrev', 'featuredNext', 'featuredThumb');
    initAppleSlider('relatedGrid', 'relatedPrev', 'relatedNext', 'relatedThumb');

  }); // end DOMContentLoaded

})();
