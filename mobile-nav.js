/* ============================================================
   APPLE LIQUID GLASS MOBILE NAVIGATION
   iOS 26 / Premium Interactions
   ============================================================ */

(function () {
  'use strict';

  // Utility selector
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  document.addEventListener('DOMContentLoaded', () => {
    const hamburger = $('#hamburger-apple');
    const overlay = $('.apple-nav-overlay');
    const pageContainer = $('#page-container');

    if (!hamburger || !overlay) return;

    // Toggle menu state
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (hamburger.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when clicking outside of the glass panel
    document.addEventListener('click', (e) => {
      if (overlay.classList.contains('active')) {
        if (!e.target.closest('.apple-nav-overlay') && !e.target.closest('#hamburger-apple')) {
          closeMobileMenu();
        }
      }
    });

    // Close menu on pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    function openMobileMenu() {
      hamburger.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('apple-menu-open');
    }

    function closeMobileMenu() {
      hamburger.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('apple-menu-open');
    }

    // Expose close helper globally
    window.__appleNav = {
      close: closeMobileMenu,
      open: openMobileMenu
    };

    // ── Tactile Micro Interactions (Haptic/Spring Physics Feel) ──
    const tactileElements = $$(
      '.apple-nav__link, .apple-nav__card, .apple-nav__btn, .apple-nav__social-btn'
    );

    tactileElements.forEach((el) => {
      el.addEventListener('touchstart', () => {
        el.classList.add('pressed');
      }, { passive: true });

      el.addEventListener('touchend', () => {
        el.classList.remove('pressed');
        // Gentle haptic-like bounce bounce effect on release
        el.classList.add('hovered');
        setTimeout(() => el.classList.remove('hovered'), 400);
      }, { passive: true });

      el.addEventListener('touchcancel', () => {
        el.classList.remove('pressed');
      }, { passive: true });
    });

    // ── Wishlist & Cart Synchronization ──
    function updateMobileCartUI() {
      try {
        const cart = JSON.parse(localStorage.getItem('elai_cart') || '[]');
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const totalEl = document.getElementById('mobileCartTotal');
        if (totalEl) {
          totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
        }
      } catch (e) {
        console.error('Error parsing cart items', e);
      }
    }

    function updateMobileWishlistUI() {
      try {
        const wishlist = JSON.parse(localStorage.getItem('elai_wishlist') || '[]');
        const countEl = document.getElementById('mobileWishlistCount');
        if (countEl) {
          countEl.textContent = `${wishlist.length} Item${wishlist.length !== 1 ? 's' : ''}`;
        }
      } catch (e) {
        console.error('Error parsing wishlist items', e);
      }
    }

    // Intercept wishlist toggles across the application to live-sync the panel card
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.product-card__wishlist');
      if (!btn) return;

      const card = btn.closest('.product-card');
      const name = card ? (card.dataset.name || card.querySelector('.product-card__name')?.textContent) : null;
      if (!name) return;

      // Existing toggle executes, we wait a tiny bit to check class list status
      setTimeout(() => {
        let wishlist = JSON.parse(localStorage.getItem('elai_wishlist') || '[]');
        if (btn.classList.contains('active')) {
          if (!wishlist.includes(name)) wishlist.push(name);
        } else {
          wishlist = wishlist.filter(item => item !== name);
        }
        localStorage.setItem('elai_wishlist', JSON.stringify(wishlist));
        updateMobileWishlistUI();
      }, 50);
    });

    // Intercept add-to-cart clicks to update card value
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-to-cart-btn');
      if (btn) {
        setTimeout(updateMobileCartUI, 100);
      }
    });

    // Trigger cart drawer open from premium cart card
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    if (mobileCartBtn) {
      mobileCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobileMenu();
        const mainCartBtn = document.getElementById('cartBtn');
        if (mainCartBtn) {
          mainCartBtn.click();
        }
      });
    }

    // Initialize UI states
    updateMobileCartUI();
    updateMobileWishlistUI();
    
    // Periodically sync just in case details pages modify values
    window.addEventListener('focus', () => {
      updateMobileCartUI();
      updateMobileWishlistUI();
    });

  });
})();
