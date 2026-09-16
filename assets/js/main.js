/**
 * Art Lenz (آرت لنز) - Main Interactive Logic
 * Apple-grade responsiveness, smooth micro-interactions, and reactive UI
 */

// Global State
const state = {
  cart: [],
  cameraTracking: false,
  nightVisionActive: false,
  scanLineActive: false,
  trackingInterval: null,
};

// Helper: Format Persian numbers with commas
function formatPersianNumber(number) {
  const formatted = new Intl.NumberFormat('fa-IR').format(number);
  return formatted;
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initDomeCameraMockup();
  initCostCalculator();
  initFAQAccordion();
  initCartDrawer();
  initNightVisionSlider();
  initStoriesViewer();
  initStorageCalculator();
  initOfficialInvoice();
  initSecurityQuiz();
  initSnapConsult();
  initAISpacePlanner();
});

/* -------------------------------------------------------------------------- */
/* 1. Navbar Glass Effect on Scroll                                           */
/* -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('shadow-2xl', 'bg-[#0B1118]/90');
      navbar.classList.remove('bg-[#131E29]/68');
    } else {
      navbar.classList.remove('shadow-2xl', 'bg-[#0B1118]/90');
      navbar.classList.add('bg-[#131E29]/68');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Mobile Menu Toggle                                                      */
/* -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburgerIcon = document.getElementById('hamburgerIcon');
  const closeIcon = document.getElementById('closeIcon');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    if (isOpen) {
      mobileMenu.classList.add('hidden');
      hamburgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    } else {
      mobileMenu.classList.remove('hidden');
      hamburgerIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      hamburgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Interactive Dome Camera Mockup (Mouse Gimbal Tracking + Controls)      */
/* -------------------------------------------------------------------------- */
function initDomeCameraMockup() {
  const container = document.getElementById('domeCameraContainer');
  const cameraGraphic = document.getElementById('domeCameraInteractive');
  const cameraGimbal = document.getElementById('cameraCoreGimbal');
  const pupil = document.getElementById('cameraPupil');
  const lensGlass = document.getElementById('cameraLensGlass');
  const scanLine = document.getElementById('cameraScanLine');
  const irNodes = document.querySelectorAll('.ir-node');

  const btnNight = document.getElementById('toggleNightVision');
  const btnScan = document.getElementById('toggleScan');
  const btnTrack = document.getElementById('centerLensBtn');
  const btnGyro = document.getElementById('gyroSensorBtn');
  const gyroIndicator = document.getElementById('gyroIndicator');
  const actionBtn = document.getElementById('activateSensorActionBtn');
  const sensorStatusMain = document.getElementById('sensorStatusMain');
  const sensorStatusSub = document.getElementById('sensorStatusSub');

  if (!container || !cameraGraphic) return;

  // Explicitly ensure no CSS transition interferes with 60fps frame rendering
  cameraGraphic.style.transition = 'none';
  if (cameraGimbal) cameraGimbal.style.transition = 'none';

  // Target & Current interpolation values
  let targetRotateX = 0;
  let targetRotateY = 0;
  let targetOffsetX = 0;
  let targetOffsetY = 0;

  let currentRotateX = 0;
  let currentRotateY = 0;
  let currentOffsetX = 0;
  let currentOffsetY = 0;

  let isTouching = false;
  let gyroEnabled = true;
  let hasReceivedOrientation = false;

  let baseBeta = null;
  let baseGamma = null;
  let baseAccY = null;
  let baseAccX = null;

  // 60 FPS Render Loop (Smooth Lerp Damping)
  function renderCameraGimbal() {
    if (!state.cameraTracking) {
      const ease = 0.20;
      currentRotateX += (targetRotateX - currentRotateX) * ease;
      currentRotateY += (targetRotateY - currentRotateY) * ease;
      currentOffsetX += (targetOffsetX - currentOffsetX) * ease;
      currentOffsetY += (targetOffsetY - currentOffsetY) * ease;

      cameraGraphic.style.transform = `perspective(800px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
      if (cameraGimbal) {
        cameraGimbal.style.transform = `translate(${currentOffsetX.toFixed(2)}px, ${currentOffsetY.toFixed(2)}px)`;
      }
    }
    requestAnimationFrame(renderCameraGimbal);
  }
  requestAnimationFrame(renderCameraGimbal);

  // 1. Desktop Mouse Movement
  container.addEventListener('mousemove', (e) => {
    if (state.cameraTracking || isTouching) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const maxAngle = 14;
    targetRotateY = (x / (rect.width / 2)) * maxAngle;
    targetRotateX = -(y / (rect.height / 2)) * maxAngle;
    targetOffsetX = (x / (rect.width / 2)) * 14;
    targetOffsetY = (y / (rect.height / 2)) * 14;
  });

  container.addEventListener('mouseleave', () => {
    if (state.cameraTracking || isTouching) return;
    targetRotateX = 0;
    targetRotateY = 0;
    targetOffsetX = 0;
    targetOffsetY = 0;
  });

  // 2. Mobile Touch / Drag Tracking
  function handleTouchPos(touch) {
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;

    const maxAngle = 18;
    const progressX = Math.max(-1, Math.min(1, x / (rect.width / 2)));
    const progressY = Math.max(-1, Math.min(1, y / (rect.height / 2)));

    targetRotateY = progressX * maxAngle;
    targetRotateX = -progressY * maxAngle;
    targetOffsetX = progressX * 16;
    targetOffsetY = progressY * 16;
  }

  container.addEventListener('touchstart', (e) => {
    if (state.cameraTracking) return;
    isTouching = true;
    if (e.touches && e.touches[0]) {
      handleTouchPos(e.touches[0]);
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (state.cameraTracking) return;
    isTouching = true;
    if (e.touches && e.touches[0]) {
      handleTouchPos(e.touches[0]);
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isTouching = false;
    baseBeta = null;
    baseGamma = null;
    baseAccY = null;
    baseAccX = null;
  });

  // 3. Device Orientation Tracking (Primary Sensor)
  function handleDeviceOrientation(e) {
    if (state.cameraTracking || isTouching || !gyroEnabled) return;
    if (e.beta === null || e.gamma === null) return;

    hasReceivedOrientation = true;

    if (baseBeta === null || baseGamma === null) {
      baseBeta = e.beta;
      baseGamma = e.gamma;
      onSensorConnected();
      return;
    }

    // Keep baseline stable - only re-anchor if extreme posture change (>75 deg)
    if (Math.abs(e.beta - baseBeta) > 75) {
      baseBeta = e.beta;
    }
    if (Math.abs(e.gamma - baseGamma) > 75) {
      baseGamma = e.gamma;
    }

    // Vertical tilt direction inverted per user preference:
    // Tilting phone down moves camera down, tilting up moves camera up
    let deltaY = e.beta - baseBeta;

    // Tilting phone RIGHT:
    // gamma increases -> (gamma - baseGamma) is POSITIVE -> Camera moves RIGHT (+X)!
    // Tilting phone LEFT:
    // gamma decreases -> (gamma - baseGamma) is NEGATIVE -> Camera moves LEFT (-X)!
    let deltaX = e.gamma - baseGamma;

    // Handle landscape orientation
    const angle = window.screen?.orientation?.angle ?? window.orientation ?? 0;
    if (angle === 90) {
      const temp = deltaX;
      deltaX = -deltaY;
      deltaY = temp;
    } else if (angle === -90 || angle === 270) {
      const temp = deltaX;
      deltaX = deltaY;
      deltaY = -temp;
    }

    // 18 degrees range gives immediate, tactile and responsive movement
    const maxTilt = 18;
    const progressX = Math.max(-1, Math.min(1, deltaX / maxTilt));
    const progressY = Math.max(-1, Math.min(1, deltaY / maxTilt));

    const maxAngle = 20;
    const maxOffset = 20;

    targetRotateY = progressX * maxAngle;
    targetRotateX = -progressY * maxAngle;
    targetOffsetX = progressX * maxOffset;
    targetOffsetY = progressY * maxOffset;
  }

  // 4. Device Motion Tracking (Fallback / Supplementary Sensor)
  function handleDeviceMotion(e) {
    if (state.cameraTracking || isTouching || !gyroEnabled) return;
    if (hasReceivedOrientation) return; // If orientation is actively firing, skip motion

    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.y === null) return;

    if (baseAccY === null || baseAccX === null) {
      baseAccY = acc.y;
      baseAccX = acc.x || 0;
      onSensorConnected();
      return;
    }

    if (Math.abs(acc.y - baseAccY) > 8) {
      baseAccY = acc.y;
    }

    // Gravity vector y changes when tilted up/down (inverted)
    let deltaY = acc.y - baseAccY;
    let deltaX = (acc.x || 0) - baseAccX;

    const maxTilt = 3.2;
    const progressX = Math.max(-1, Math.min(1, deltaX / maxTilt));
    const progressY = Math.max(-1, Math.min(1, deltaY / maxTilt));

    targetRotateY = progressX * 20;
    targetRotateX = -progressY * 20;
    targetOffsetX = progressX * 20;
    targetOffsetY = progressY * 20;
  }

  function onSensorConnected() {
    updateGyroUI(true);
    if (sensorStatusMain) sensorStatusMain.textContent = 'سنسور حرکتی: ';
    if (sensorStatusSub) {
      sensorStatusSub.textContent = 'فعال (گوشی را حرکت دهید)';
      sensorStatusSub.className = 'text-brand-mint font-extrabold mr-1';
    }
    if (actionBtn) {
      actionBtn.textContent = 'کالیبره مرکز';
      actionBtn.className = 'px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 active:scale-95 transition-all shrink-0';
    }
  }

  function bindSensorEvents() {
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    window.addEventListener('devicemotion', handleDeviceMotion, true);
  }

  // Request & Connect Sensor
  function activateSensors(userTriggered = false) {
    // Check iOS 13+ permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(res => {
          if (res === 'granted') {
            bindSensorEvents();
            gyroEnabled = true;
            baseBeta = null;
            baseGamma = null;
            baseAccY = null;
            baseAccX = null;
            onSensorConnected();
            if (userTriggered) {
              showToast('سنسور حرکتی فعال شد!', 'اکنون با چرخاندن گوشی، جهت لنز دوربین تغییر می‌کند.');
            }
          } else {
            showToast('مجوز سنسور داده نشد', 'می‌توانید با کشیدن انگشت روی صفحه دوربین را حرکت دهید.');
          }
        })
        .catch(err => {
          console.warn('Motion permission error:', err);
          bindSensorEvents();
        });
    } else {
      // Android / Standard Browsers
      bindSensorEvents();
      gyroEnabled = true;
      baseBeta = null;
      baseGamma = null;
      baseAccY = null;
      baseAccX = null;
      onSensorConnected();
      if (userTriggered) {
        showToast('سنسور کالیبره شد', 'زاویه فعلی دست شما به عنوان مرکز دوربین ثبت شد.');
      }
    }
  }

  function updateGyroUI(active) {
    if (btnGyro) {
      if (active) {
        btnGyro.classList.add('bg-brand-mint/15', 'border-brand-mint', 'text-brand-mint');
        btnGyro.classList.remove('bg-white/5', 'text-slate-300', 'border-white/10');
      } else {
        btnGyro.classList.remove('bg-brand-mint/15', 'border-brand-mint', 'text-brand-mint');
        btnGyro.classList.add('bg-white/5', 'text-slate-300', 'border-white/10');
      }
    }
    if (gyroIndicator) {
      gyroIndicator.classList.remove('hidden');
    }
  }

  // Auto-connect on Android / non-iOS without waiting
  if (typeof DeviceOrientationEvent === 'undefined' || typeof DeviceOrientationEvent.requestPermission !== 'function') {
    activateSensors(false);
  }

  // Bind Buttons
  if (actionBtn) {
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activateSensors(true);
    });
  }

  if (btnGyro) {
    btnGyro.addEventListener('click', (e) => {
      e.stopPropagation();
      activateSensors(true);
    });
  }

  if (gyroIndicator) {
    gyroIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      activateSensors(true);
    });
  }

  // Also tapping anywhere on container triggers permission / calibration
  container.addEventListener('click', () => {
    if (!hasReceivedOrientation && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      activateSensors(false);
    } else {
      baseBeta = null;
      baseGamma = null;
      baseAccY = null;
      baseAccX = null;
    }
  });

  // 5. Night Vision Toggle
  if (btnNight) {
    btnNight.addEventListener('click', () => {
      state.nightVisionActive = !state.nightVisionActive;
      if (state.nightVisionActive) {
        btnNight.classList.add('bg-brand-mint/20', 'border-brand-mint', 'text-brand-mint');
        irNodes.forEach(node => {
          node.setAttribute('fill', '#FF3B30');
          node.style.filter = 'drop-shadow(0 0 8px #FF3B30) drop-shadow(0 0 14px rgba(255, 59, 48, 0.8))';
        });
        showToast('دید در شب آرایه‌ای فعال شد', 'سنسور مادون قرمز روشن و ۶ ال‌ای‌دی پرقدرت Array IR فعال شدند.');
      } else {
        btnNight.classList.remove('bg-brand-mint/20', 'border-brand-mint', 'text-brand-mint');
        irNodes.forEach(node => {
          node.setAttribute('fill', '#384C5E');
          node.style.filter = 'none';
        });
        showToast('حالت نور روز فعال شد', 'سنسور به حالت استاندارد رنگی 4K Ultra بازگشت.');
      }
    });
  }

  // 6. Scan Line Toggle
  if (btnScan) {
    btnScan.addEventListener('click', () => {
      state.scanLineActive = !state.scanLineActive;
      if (state.scanLineActive) {
        btnScan.classList.add('bg-brand-mint/20', 'border-brand-mint', 'text-brand-mint');
        scanLine.classList.remove('hidden');
        showToast('اسکن هوش مصنوعی فعال شد', 'پردازش الگوهای حرکتی و تفکیک سوژه انسان و خودرو در حال اجراست.');
      } else {
        btnScan.classList.remove('bg-brand-mint/20', 'border-brand-mint', 'text-brand-mint');
        scanLine.classList.add('hidden');
      }
    });
  }

  // 7. Auto 360 Tracking Simulation
  if (btnTrack) {
    btnTrack.addEventListener('click', () => {
      state.cameraTracking = !state.cameraTracking;
      if (state.cameraTracking) {
        btnTrack.classList.add('bg-brand-mint', 'text-brand-navy-dark', 'font-black');
        btnTrack.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');
        btnTrack.textContent = 'توقف ردیابی ۳۶۰°';

        let angle = 0;
        state.trackingInterval = setInterval(() => {
          angle += 0.05;
          const offsetX = Math.cos(angle) * 14;
          const offsetY = Math.sin(angle) * 10;
          if (cameraGimbal) {
            cameraGimbal.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          }
          cameraGraphic.style.transform = `perspective(800px) rotateX(${offsetY * 0.8}deg) rotateY(${offsetX * 0.8}deg)`;
        }, 30);

        showToast('ردیابی هوشمند ۳۶۰ درجه فعال شد', 'موتور گیمبال در حال چرخش پیوسته و پوشش تمام زوایای محیط است.');
      } else {
        clearInterval(state.trackingInterval);
        btnTrack.classList.remove('bg-brand-mint', 'text-brand-navy-dark', 'font-black');
        btnTrack.classList.add('bg-white/5', 'border-white/10', 'text-slate-300');
        btnTrack.textContent = 'ردیابی ۳۶۰°';
        targetRotateX = 0;
        targetRotateY = 0;
        targetOffsetX = 0;
        targetOffsetY = 0;
        baseBeta = null;
        baseGamma = null;
        baseAccY = null;
        baseAccX = null;
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Interactive Smart Cost Estimator                                        */
/* -------------------------------------------------------------------------- */
function initCostCalculator() {
  const envButtons = document.querySelectorAll('.calc-env-btn');
  const resButtons = document.querySelectorAll('.calc-res-btn');
  const slider = document.getElementById('cameraSlider');
  const cameraDisplay = document.getElementById('cameraCountDisplay');
  const priceDisplay = document.getElementById('estimatedPriceDisplay');
  const applyBtn = document.getElementById('applyToFormBtn');

  let envMultiplier = 1.0;
  let envName = 'خانگی و ویلایی';
  let resAddon = 0;
  let resName = 'Full HD';

  function calculatePrice() {
    const count = parseInt(slider.value, 10);
    cameraDisplay.textContent = `${count} دوربین`;

    // Base cost per camera (camera + cable share + connector + labor)
    const baseCameraCost = 2800000;
    // Base recorder unit (NVR + Hard drive + Switch)
    const baseRecorderCost = 6500000;

    let rawTotal = (baseRecorderCost + (count * (baseCameraCost + resAddon))) * envMultiplier;
    // Round to nearest 50,000 Tomans
    rawTotal = Math.round(rawTotal / 50000) * 50000;

    priceDisplay.textContent = formatPersianNumber(rawTotal);
    return { count, rawTotal, envName, resName };
  }

  // Environment buttons
  envButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      envButtons.forEach(b => {
        b.classList.remove('active', 'bg-brand-mint', 'text-brand-navy-dark', 'font-bold', 'border-brand-mint');
        b.classList.add('bg-white/5', 'text-slate-300', 'font-medium', 'border-white/10');
      });
      btn.classList.add('active', 'bg-brand-mint', 'text-brand-navy-dark', 'font-bold', 'border-brand-mint');
      btn.classList.remove('bg-white/5', 'text-slate-300', 'font-medium', 'border-white/10');

      envMultiplier = parseFloat(btn.dataset.multiplier);
      envName = btn.textContent.trim();
      calculatePrice();
    });
  });

  // Resolution buttons
  resButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      resButtons.forEach(b => {
        b.classList.remove('active', 'bg-brand-mint/15', 'text-brand-mint', 'border-brand-mint', 'font-bold');
        b.classList.add('bg-white/5', 'text-slate-300', 'border-white/10', 'font-medium');
      });
      btn.classList.add('active', 'bg-brand-mint/15', 'text-brand-mint', 'border-brand-mint', 'font-bold');
      btn.classList.remove('bg-white/5', 'text-slate-300', 'border-white/10', 'font-medium');

      resAddon = parseInt(btn.dataset.resAddon, 10);
      resName = btn.textContent.trim();
      calculatePrice();
    });
  });

  // Slider change
  if (slider) {
    slider.addEventListener('input', calculatePrice);
  }

  // Apply to booking form
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const data = calculatePrice();
      const bookingSection = document.getElementById('booking');
      const detailsField = document.getElementById('projectDetails');

      // Scroll smoothly to booking
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Pre-fill project details
      if (detailsField) {
        detailsField.value = `درخواست برآورد حضوری برای: ${data.count} دوربین (${data.resName}) در محیط ${data.envName} - تخمین اولیه: ${formatPersianNumber(data.rawTotal)} تومان.`;
        detailsField.focus();
      }

      showToast('مشخصات به فرم انتقال یافت', 'اطلاعات تماس خود را تکمیل کنید تا کارشناسان ما هماهنگی لازم را انجام دهند.');
    });
  }

  calculatePrice();
}

/* -------------------------------------------------------------------------- */
/* 5. FAQ Accordion Logic                                                     */
/* -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const faqButtons = document.querySelectorAll('.faq-btn');

  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const chevron = btn.querySelector('.faq-chevron');
      const isExpanded = !content.classList.contains('hidden');

      // Close all other FAQs
      faqButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
          const otherContent = otherBtn.nextElementSibling;
          const otherChevron = otherBtn.querySelector('.faq-chevron');
          otherContent.classList.add('hidden');
          otherChevron.classList.remove('rotate-180', 'text-brand-mint');
          otherChevron.classList.add('text-slate-400');
        }
      });

      // Toggle current
      if (isExpanded) {
        content.classList.add('hidden');
        chevron.classList.remove('rotate-180', 'text-brand-mint');
        chevron.classList.add('text-slate-400');
      } else {
        content.classList.remove('hidden');
        chevron.classList.add('rotate-180', 'text-brand-mint');
        chevron.classList.remove('text-slate-400');
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 6. Shopping Cart Management & Slide Drawer                                 */
/* -------------------------------------------------------------------------- */
function initCartDrawer() {
  const cartBtn = document.getElementById('cartButton');
  const closeBtn = document.getElementById('closeCartBtn');
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');

  function openCart() {
    renderCartItems();
    drawer.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  }

  function closeCart() {
    drawer.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (backdrop) backdrop.addEventListener('click', closeCart);
}

// Global addToCart
window.addToCart = function (title, price) {
  const existing = state.cart.find(item => item.title === title);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ title, price, quantity: 1 });
  }

  updateCartBadge();
  showToast('به سبد خرید اضافه شد', `${title} با موفقیت به سبد خرید افزوده شد.`);

  // Auto-open drawer
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    renderCartItems();
    drawer.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  }
};

function updateCartBadge() {
  const badge = document.getElementById('cartBadgeCount');
  if (!badge) return;

  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = formatPersianNumber(totalCount);

  // Pulse badge
  badge.classList.add('scale-125');
  setTimeout(() => badge.classList.remove('scale-125'), 200);
}

function renderCartItems() {
  const emptyState = document.getElementById('emptyCartState');
  const list = document.getElementById('cartItemsList');
  const totalPriceEl = document.getElementById('cartTotalPrice');

  if (!list || !emptyState || !totalPriceEl) return;

  if (state.cart.length === 0) {
    emptyState.classList.remove('hidden');
    list.innerHTML = '';
    totalPriceEl.textContent = '۰';
    return;
  }

  emptyState.classList.add('hidden');
  let totalPrice = 0;

  list.innerHTML = state.cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    return `
      <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
        <div class="flex-1 text-right">
          <div class="text-sm font-bold text-white mb-1">${item.title}</div>
          <div class="text-xs text-brand-mint font-bold">${formatPersianNumber(item.price)} تومان</div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeCartQty(${index}, -1)" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center">-</button>
          <span class="text-sm text-white font-bold min-w-[16px] text-center">${formatPersianNumber(item.quantity)}</span>
          <button onclick="changeCartQty(${index}, 1)" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center">+</button>
        </div>
      </div>
    `;
  }).join('');

  totalPriceEl.textContent = formatPersianNumber(totalPrice);
}

window.changeCartQty = function (index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  updateCartBadge();
  renderCartItems();
};

window.checkoutCart = function () {
  if (state.cart.length === 0) {
    showToast('سبد خرید خالی است', 'لطفاً ابتدا محصولی را به سبد خرید اضافه نمایید.');
    return;
  }

  // Pre-fill booking form with cart summary
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }

  const booking = document.getElementById('booking');
  const details = document.getElementById('projectDetails');
  if (booking) booking.scrollIntoView({ behavior: 'smooth' });

  if (details) {
    const itemsSummary = state.cart.map(i => `${i.title} (${i.quantity} عدد)`).join('، ');
    const total = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    details.value = `ثبت سفارش سبد خرید: [${itemsSummary}] - جمع مبلغ: ${formatPersianNumber(total)} تومان.`;
    details.focus();
  }

  showToast('سفارش به فرم ارسال شد', 'برای ثبت نهایی و صدور پیش‌فاکتور، مشخصات تماس خود را وارد نمایید.');
};

/* -------------------------------------------------------------------------- */
/* 7. Quick Booking Form Submission Handler                                   */
/* -------------------------------------------------------------------------- */
window.handleBookingSubmit = function (e) {
  e.preventDefault();

  const btn = document.getElementById('bookingSubmitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const nameInput = document.getElementById('clientName');
  const phoneInput = document.getElementById('clientPhone');

  if (!btn || !btnText || !btnSpinner) return;

  // Loading state
  btn.disabled = true;
  btn.classList.add('opacity-80', 'cursor-not-allowed');
  btnText.textContent = 'در حال ثبت و ارسال به کارشناس...';
  btnSpinner.classList.remove('hidden');

  // Simulate ultra-fast modern server response
  setTimeout(() => {
    btn.disabled = false;
    btn.classList.remove('opacity-80', 'cursor-not-allowed');
    btnText.textContent = 'ثبت درخواست مشاوره و اعزام کارشناس';
    btnSpinner.classList.add('hidden');

    const clientName = nameInput ? nameInput.value : 'کاربر گرامی';

    // Show Success Toast
    showToast(
      `درخواست شما ثبت شد، ${clientName}`,
      'کارشناسان ارشد فنی آرت لنز ظرف حداکثر ۱۵ دقیقه جهت هماهنگی با شما تماس خواهند گرفت.'
    );

    // Reset Form
    const form = document.getElementById('installationBookingForm');
    if (form) form.reset();
  }, 1000);
};

/* -------------------------------------------------------------------------- */
/* 8. Modern Apple-style Toast Notification                                   */
/* -------------------------------------------------------------------------- */
function showToast(title, message) {
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastBody = document.getElementById('toastBody');

  if (!toast || !toastTitle || !toastBody) return;

  toastTitle.textContent = title;
  toastBody.textContent = message;

  // Slide up and reveal
  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  // Auto hide after 4 seconds
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 4000);
}

/* -------------------------------------------------------------------------- */
/* 9. Interactive Night-Vision Comparison Slider (Before/After)               */
/* -------------------------------------------------------------------------- */
function initNightVisionSlider() {
  const box = document.getElementById('comparisonSliderBox');
  const clippedLayer = document.getElementById('comparisonClippedLayer');
  const handle = document.getElementById('comparisonSliderHandle');

  if (!box || !clippedLayer || !handle) return;

  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = box.getBoundingClientRect();
    let xPos = (clientX - rect.left) / rect.width;
    // Clamp between 2% and 98%
    xPos = Math.max(0.02, Math.min(0.98, xPos));
    const percent = (xPos * 100).toFixed(2);

    handle.style.left = `${percent}%`;
    clippedLayer.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
  }

  box.addEventListener('pointerdown', (e) => {
    isDragging = true;
    box.setPointerCapture(e.pointerId);
    updateSliderPosition(e.clientX);
  });

  box.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  const stopDrag = (e) => {
    if (isDragging) {
      isDragging = false;
      try { box.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };

  box.addEventListener('pointerup', stopDrag);
  box.addEventListener('pointercancel', stopDrag);
}

/* -------------------------------------------------------------------------- */
/* 10. Instagram-Style Verified Client Stories Modal                          */
/* -------------------------------------------------------------------------- */
function initStoriesViewer() {
  const storiesRow = document.getElementById('storiesRow');
  const modal = document.getElementById('storyViewerModal');
  const closeBtn = document.getElementById('closeStoryModalBtn');
  const tapNext = document.getElementById('storyTapNext');
  const tapPrev = document.getElementById('storyTapPrev');
  const mediaArea = document.getElementById('storyMediaArea');
  const orderBtn = document.getElementById('storyOrderThisBtn');

  if (!storiesRow || !modal) return;

  const storiesData = [
    {
      title: 'ویلای لواسان',
      subtitle: 'دید در شب رنگی استخر و پیرامون',
      emoji: '🏡',
      badge: 'پروژه مسکونی لوکس',
      quote: '«با سنسورهای دید در شب رنگی آرت لنز، محوطه باغ و استخر در تاریکی مطلق مثل روز روشن و واضحه.»',
      tags: ['سنسور Starvis 2', '۸ دوربین 4K', 'گارانتی طلایی ۳۶ ماهه'],
      grad: 'from-[#091522] via-[#0b1b2d] to-[#04080e]',
      price: 38500000,
    },
    {
      title: 'طلافروشی بازار بزرگ',
      subtitle: 'وضوح فوق‌العاده چهره و سریال اسکناس',
      emoji: '💎',
      badge: 'امنیت فوق حساس تجاری',
      quote: '«در محیط طلافروشی تشخیص جزئیات عیار و چهره افراد حیاتی است. کیفیت لنزهای آرت لنز غیرقابل رقابته.»',
      tags: ['رزولوشن 4K UHD', 'میکروفون استریو داخلی', 'پلاک‌خوان ورودی'],
      grad: 'from-[#221706] via-[#1f1304] to-[#0b0702]',
      price: 42000000,
    },
    {
      title: 'کارخانه و انبار صفادشت',
      subtitle: 'پوشش سوله با کابل‌کشی فیبر نوری',
      emoji: '🏭',
      badge: 'پروژه صنعتی چند هکتاری',
      quote: '«کابل‌کشی دقیق و آرایش رک استاندارد باعث شد حتی در نوسانات شدید برق کارخانه، سیستم بدون قطعی کار کنه.»',
      tags: ['سوییچ POE صنعتی', '۱۶ دوربین بولت ضدضربه', 'هارد ۸ ترابایت'],
      grad: 'from-[#081b29] via-[#04111c] to-[#02090f]',
      price: 65000000,
    },
    {
      title: 'برج مسکونی فرمانیه',
      subtitle: 'نظارت هوشمند لابی و ۴ طبقه پارکینگ',
      emoji: '🏢',
      badge: 'مجتمع مسکونی مدرن',
      quote: '«مدیریت پارکینگ با هوش مصنوعی تشخیص پلاک اتوماتیک شد و همه مالکین انتقال تصویر روان دارن.»',
      tags: ['انتقال تصویر شبکه ملی', 'تشخیص انسان و خودرو', '۲۴ دوربین تحت شبکه'],
      grad: 'from-[#190d2e] via-[#10081f] to-[#080312]',
      price: 89000000,
    },
    {
      title: 'تست غوطه‌وری در آب (IP67)',
      subtitle: 'مقاومت ۱۰۰٪ در برابر باران سیل‌آسا و گردوغبار',
      emoji: '🌊',
      badge: 'استاندارد مقاومت آب و هوا',
      quote: '«دوربین‌های فضای باز آرت لنز حتی در شرایط برف سنگین و باران‌های سیل‌آسا کوچک‌ترین افتی ندارند.»',
      tags: ['بدنه آلومینیوم دایکاست', 'استاندارد IP67', 'تحمل دمای -۳۰ تا +۶۰'],
      grad: 'from-[#062029] via-[#03131a] to-[#01080d]',
      price: 19500000,
    },
  ];

  let currentStoryIndex = 0;
  let storyProgress = 0;
  let storyTimer = null;
  let isPaused = false;
  const STORY_DURATION = 5000;
  const TICK_INTERVAL = 50;

  function updateClock() {
    const clockEl = document.getElementById('storyLiveClock');
    if (!clockEl) return;
    const now = new Date();
    const d = now.toISOString().slice(0, 10);
    const t = now.toTimeString().slice(0, 8);
    clockEl.textContent = `${d} ${t}`;
  }

  function renderStory(index) {
    currentStoryIndex = index;
    storyProgress = 0;
    const data = storiesData[index];
    if (!data) return;

    const avatar = document.getElementById('storyModalAvatar');
    const title = document.getElementById('storyModalTitle');
    const sub = document.getElementById('storyModalSubtitle');
    const emoji = document.getElementById('storyEmojiBox');
    const badge = document.getElementById('storyBadgeText');
    const quote = document.getElementById('storyQuoteText');
    const pills = document.getElementById('storyPillTags');
    const bgGrad = document.getElementById('storyBgGradient');

    if (avatar) avatar.textContent = data.emoji;
    if (title) title.textContent = data.title;
    if (sub) sub.textContent = data.subtitle;
    if (emoji) emoji.textContent = data.emoji;
    if (badge) badge.textContent = data.badge;
    if (quote) quote.textContent = data.quote;
    if (bgGrad) bgGrad.className = `absolute inset-0 z-0 bg-gradient-to-b ${data.grad}`;

    if (pills) {
      pills.innerHTML = data.tags.map(t =>
        `<span class="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10">${t}</span>`
      ).join('');
    }

    updateClock();

    // Reset progress bars
    for (let i = 0; i < storiesData.length; i++) {
      const bar = document.getElementById(`progBar${i}`);
      if (!bar) continue;
      if (i < index) {
        bar.style.width = '100%';
      } else if (i > index) {
        bar.style.width = '0%';
      } else {
        bar.style.width = '0%';
      }
    }
  }

  function startStoryLoop() {
    clearInterval(storyTimer);
    storyTimer = setInterval(() => {
      if (isPaused) return;

      storyProgress += TICK_INTERVAL;
      const pct = Math.min(100, (storyProgress / STORY_DURATION) * 100);
      const currentBar = document.getElementById(`progBar${currentStoryIndex}`);
      if (currentBar) currentBar.style.width = `${pct}%`;

      if (storyProgress >= STORY_DURATION) {
        if (currentStoryIndex < storiesData.length - 1) {
          renderStory(currentStoryIndex + 1);
        } else {
          closeModal();
        }
      }
    }, TICK_INTERVAL);
  }

  function openModal(index = 0) {
    modal.classList.remove('hidden');
    renderStory(index);
    startStoryLoop();
  }

  function closeModal() {
    clearInterval(storyTimer);
    modal.classList.add('hidden');
    for (let i = 0; i < storiesData.length; i++) {
      const bar = document.getElementById(`progBar${i}`);
      if (bar) bar.style.width = '0%';
    }
  }

  const storyButtons = storiesRow.querySelectorAll('.story-item');
  storyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const storyId = parseInt(btn.getAttribute('data-story-id') || '0', 10);
      openModal(storyId);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (tapNext) {
    tapNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentStoryIndex < storiesData.length - 1) {
        renderStory(currentStoryIndex + 1);
      } else {
        closeModal();
      }
    });
  }

  if (tapPrev) {
    tapPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentStoryIndex > 0) {
        renderStory(currentStoryIndex - 1);
      } else {
        renderStory(0);
      }
    });
  }

  if (mediaArea) {
    mediaArea.addEventListener('pointerdown', () => { isPaused = true; });
    mediaArea.addEventListener('pointerup', () => { isPaused = false; });
    mediaArea.addEventListener('pointerleave', () => { isPaused = false; });
  }

  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      const cur = storiesData[currentStoryIndex];
      closeModal();
      const booking = document.getElementById('booking');
      const details = document.getElementById('projectDetails');
      if (booking) booking.scrollIntoView({ behavior: 'smooth' });
      if (details && cur) {
        details.value = `استعلام و سفارش پکیج مشابه با پروژه «${cur.title}» (${cur.badge}).`;
        details.focus();
      }
      showToast('مشخصات پروژه انتخاب شد', `اطلاعات پکیج «${cur.title}» به فرم مشاوره اضافه گردید.`);
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 11. Hard Drive Storage Simulator (HDD Days Calculator)                    */
/* -------------------------------------------------------------------------- */
function initStorageCalculator() {
  const hddSelector = document.getElementById('storageHddSelector');
  const camSlider = document.getElementById('storageCamSlider');
  const camCountDisplay = document.getElementById('storageCamCountDisplay');
  const resSelect = document.getElementById('storageResSelect');
  const codecSelect = document.getElementById('storageCodecSelect');
  const daysResult = document.getElementById('storageDaysResult');
  const motionDaysResult = document.getElementById('storageMotionDays');
  const dailyGBResult = document.getElementById('storageDailyGB');

  if (!hddSelector || !camSlider || !daysResult) return;

  let selectedHDD_TB = 1;

  const resDataH264 = {
    '1080p': 20,
    '2k': 36,
    '4k': 60,
  };

  function calculateStorage() {
    const cams = parseInt(camSlider.value, 10);
    if (camCountDisplay) camCountDisplay.textContent = `${formatPersianNumber(cams)} دوربین`;

    const res = resSelect ? resSelect.value : '4k';
    const codec = codecSelect ? codecSelect.value : 'h265plus';

    let dailyPerCam = resDataH264[res] || 60;
    if (codec === 'h265plus') {
      dailyPerCam *= 0.5;
    }

    const totalDailyGB = Math.round(cams * dailyPerCam);
    const usableCapacityGB = selectedHDD_TB * 930;

    const continuousDays = Math.max(1, Math.floor(usableCapacityGB / Math.max(1, totalDailyGB)));
    const motionDays = Math.round(continuousDays * 2.2);

    daysResult.textContent = formatPersianNumber(continuousDays);
    if (motionDaysResult) motionDaysResult.textContent = `${formatPersianNumber(motionDays)} روز`;
    if (dailyGBResult) dailyGBResult.textContent = `${formatPersianNumber(totalDailyGB)} گیگابایت / روز`;
  }

  const hddBtns = hddSelector.querySelectorAll('.calc-hdd-btn');
  hddBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hddBtns.forEach(b => {
        b.classList.remove('active', 'bg-brand-mint', 'text-brand-navy-dark', 'font-bold', 'border-brand-mint');
        b.classList.add('bg-white/5', 'text-slate-300', 'font-medium', 'border-white/10');
      });
      btn.classList.add('active', 'bg-brand-mint', 'text-brand-navy-dark', 'font-bold', 'border-brand-mint');
      btn.classList.remove('bg-white/5', 'text-slate-300', 'font-medium', 'border-white/10');

      selectedHDD_TB = parseFloat(btn.getAttribute('data-hdd') || '1');
      calculateStorage();
    });
  });

  camSlider.addEventListener('input', calculateStorage);
  if (resSelect) resSelect.addEventListener('change', calculateStorage);
  if (codecSelect) codecSelect.addEventListener('change', calculateStorage);

  calculateStorage();
}

/* -------------------------------------------------------------------------- */
/* 12. Official PDF Invoice (1-Click Official Printable Quote)                 */
/* -------------------------------------------------------------------------- */
function initOfficialInvoice() {
  const openBtn = document.getElementById('openOfficialInvoiceBtn');
  const modal = document.getElementById('officialInvoiceModal');
  const closeBtn = document.getElementById('closeInvoiceModalBtn');

  if (!modal) return;

  function generateInvoice() {
    const serialEl = document.getElementById('invoiceSerialNo');
    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    if (serialEl) serialEl.textContent = `ALZ-1404-${randomSerial}`;

    const nameInput = document.getElementById('clientName');
    const phoneInput = document.getElementById('clientPhone');
    const clientNameEl = document.getElementById('invoiceClientName');
    const clientPhoneEl = document.getElementById('invoiceClientPhone');

    if (clientNameEl && nameInput && nameInput.value.trim()) {
      clientNameEl.textContent = nameInput.value.trim();
    }
    if (clientPhoneEl && phoneInput && phoneInput.value.trim()) {
      clientPhoneEl.textContent = phoneInput.value.trim();
    }

    const camSlider = document.getElementById('cameraSlider');
    const cams = camSlider ? parseInt(camSlider.value, 10) : 4;
    const camCountEl = document.getElementById('invoiceRowCamCount');
    const camTotalEl = document.getElementById('invoiceRowCamTotal');
    const subtotalEl = document.getElementById('invoiceSubtotal');
    const discountEl = document.getElementById('invoiceDiscount');
    const finalTotalEl = document.getElementById('invoiceFinalTotal');

    if (camCountEl) camCountEl.textContent = formatPersianNumber(cams);

    const camUnit = 4250000;
    const camTotal = cams * camUnit;
    if (camTotalEl) camTotalEl.textContent = formatPersianNumber(camTotal);

    const nvrPrice = 6800000;
    const hddPrice = 3900000;
    const cablePrice = 1800000;
    const installPrice = 2500000;

    const subtotal = camTotal + nvrPrice + hddPrice + cablePrice + installPrice;
    const discount = 2500000;
    const finalTotal = subtotal - discount;

    if (subtotalEl) subtotalEl.textContent = `${formatPersianNumber(subtotal)} تومان`;
    if (discountEl) discountEl.textContent = `${formatPersianNumber(discount)}- تومان`;
    if (finalTotalEl) finalTotalEl.textContent = `${formatPersianNumber(finalTotal)} تومان`;

    modal.classList.remove('hidden');
  }

  if (openBtn) openBtn.addEventListener('click', generateInvoice);
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 13. Smart 3-Step Security Quiz Wizard (30-Second Selector)                 */
/* -------------------------------------------------------------------------- */
const quizState = {
  step: 1,
  answers: {
    env: 'home',
    priority: 'nightcolor',
    size: 'small',
  },
};

window.selectQuizOption = function (step, value) {
  if (step === 1) quizState.answers.env = value;
  if (step === 2) quizState.answers.priority = value;
  if (step === 3) quizState.answers.size = value;

  const nextStep = step + 1;
  const s1 = document.getElementById('quizStep1');
  const s2 = document.getElementById('quizStep2');
  const s3 = document.getElementById('quizStep3');
  const sRes = document.getElementById('quizResult');

  const ind1 = document.getElementById('stepIndicator1');
  const ind2 = document.getElementById('stepIndicator2');
  const ind3 = document.getElementById('stepIndicator3');

  if (nextStep === 2) {
    if (s1) s1.classList.add('hidden');
    if (s2) s2.classList.remove('hidden');
    if (ind1) ind1.className = 'flex-1 text-center pb-2 border-b-2 border-white/20 font-medium text-xs text-slate-400';
    if (ind2) ind2.className = 'flex-1 text-center pb-2 border-b-2 border-brand-mint font-bold text-xs text-brand-mint';
  } else if (nextStep === 3) {
    if (s2) s2.classList.add('hidden');
    if (s3) s3.classList.remove('hidden');
    if (ind2) ind2.className = 'flex-1 text-center pb-2 border-b-2 border-white/20 font-medium text-xs text-slate-400';
    if (ind3) ind3.className = 'flex-1 text-center pb-2 border-b-2 border-brand-mint font-bold text-xs text-brand-mint';
  } else if (nextStep === 4) {
    if (s3) s3.classList.add('hidden');
    if (sRes) sRes.classList.remove('hidden');
    renderQuizRecommendation();
  }
};

function renderQuizRecommendation() {
  const { env, priority, size } = quizState.answers;
  const titleEl = document.getElementById('quizRecommendedTitle');
  const descEl = document.getElementById('quizRecommendedDesc');
  const priceEl = document.getElementById('quizPriceDisplay');

  let title = 'پکیج ۴ عددی سوپرویژن 4K Ultra';
  let desc = 'سنسور سونی Starvis 2 + دید در شب رنگی وارم‌لایت + دستگاه ۸ کانال AI + هارد بنفش ۲ ترابایت';
  let price = 21800000;

  if (env === 'shop' || env === 'villa') {
    if (size === 'medium' || size === 'large') {
      title = 'پکیج ۸ عددی ColorHunter 4K پروژه‌ای';
      desc = '۸ دوربین بولت و دام دید در شب رنگی + دستگاه ۱۶ کانال هوشمند + هارد بنفش ۴ ترابایت + سوییچ POE صنعتی';
      price = 44500000;
    } else {
      title = 'پکیج ۴ عددی طلافروشی و ویلا ColorHunter 4K';
      desc = '۴ دوربین 4K دید در شب رنگی با زاویه دید ۱۰۵ درجه + ضبط صدای محیط + هارد ۲ ترابایت';
      price = 24900000;
    }
  } else if (env === 'factory' || size === 'huge') {
    title = 'پکیج جامع نظارت صنعتی و پلاک‌خوان AI';
    desc = 'دوربین‌های پلاک‌خوان LPR + پوشش محوطه باز پیرامونی با هوش مصنوعی تشخیص انسان و خودرو + پشتیبانی فیبر نوری';
    price = 68000000;
  } else {
    if (priority === 'economy') {
      title = 'پکیج ۴ عددی اقتصادی ArtLenz Eco';
      desc = '۴ دوربین 1080P Full HD بدنه فلزی ضدآب + دستگاه NVR ضبط هوشمند + هارد ۱ ترابایت WD Purple';
      price = 14800000;
    } else {
      title = 'پکیج ۴ عددی خانگی هوشمند 4K UHD';
      desc = 'سنسور تصویر سونی + دید در شب رنگی + انتقال تصویر فوق‌العاده سریع بدون قطعی روی موبایل';
      price = 19800000;
    }
  }

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  if (priceEl) priceEl.textContent = formatPersianNumber(price);
}

window.restartQuiz = function () {
  quizState.step = 1;
  const s1 = document.getElementById('quizStep1');
  const s2 = document.getElementById('quizStep2');
  const s3 = document.getElementById('quizStep3');
  const sRes = document.getElementById('quizResult');

  const ind1 = document.getElementById('stepIndicator1');
  const ind2 = document.getElementById('stepIndicator2');
  const ind3 = document.getElementById('stepIndicator3');

  if (s1) s1.classList.remove('hidden');
  if (s2) s2.classList.add('hidden');
  if (s3) s3.classList.add('hidden');
  if (sRes) sRes.classList.add('hidden');

  if (ind1) ind1.className = 'flex-1 text-center pb-2 border-b-2 border-brand-mint font-bold text-xs text-brand-mint';
  if (ind2) ind2.className = 'flex-1 text-center pb-2 border-b-2 border-white/10 font-medium text-xs text-slate-400';
  if (ind3) ind3.className = 'flex-1 text-center pb-2 border-b-2 border-white/10 font-medium text-xs text-slate-400';
};

function initSecurityQuiz() {
  const modal = document.getElementById('securityQuizModal');
  const heroBtn = document.getElementById('openQuizHeroBtn');
  const closeBtn = document.getElementById('closeQuizModalBtn');
  const addToCartBtn = document.getElementById('quizAddToCartBtn');
  const bookConsultBtn = document.getElementById('quizBookConsultBtn');

  if (!modal) return;

  function openModal() {
    window.restartQuiz();
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  if (heroBtn) heroBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const titleEl = document.getElementById('quizRecommendedTitle');
      const priceEl = document.getElementById('quizPriceDisplay');
      const title = titleEl ? titleEl.textContent : 'پکیج منتخب کوییز هوشمند';
      const rawPrice = priceEl ? parseInt(priceEl.textContent.replace(/[^\d]/g, ''), 10) || 21800000 : 21800000;
      closeModal();
      addToCart(title, rawPrice);
    });
  }

  if (bookConsultBtn) {
    bookConsultBtn.addEventListener('click', () => {
      const titleEl = document.getElementById('quizRecommendedTitle');
      const title = titleEl ? titleEl.textContent : 'پکیج منتخب کوییز';
      closeModal();
      const booking = document.getElementById('booking');
      const details = document.getElementById('projectDetails');
      if (booking) booking.scrollIntoView({ behavior: 'smooth' });
      if (details) {
        details.value = `درخواست مشاوره برای ${title} (انتخاب شده از کوییز هوشمند).`;
        details.focus();
      }
      showToast('پکیج انتخاب شد', 'اطلاعات پکیج کوییز به فرم مشاوره انتقال یافت.');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 14. Snap & Consult via WhatsApp (Photo Consultation)                      */
/* -------------------------------------------------------------------------- */
function initSnapConsult() {
  const fileInput = document.getElementById('snapPhotoInput');
  const uploadBtn = document.getElementById('snapUploadBtn');
  const sendBtn = document.getElementById('snapSendWhatsAppBtn');
  const previewContainer = document.getElementById('snapPreviewContainer');
  const previewImg = document.getElementById('snapPreviewImg');
  const fileNameEl = document.getElementById('snapFileName');
  const floatingBtn = document.getElementById('floatingWhatsAppBtn');
  const btnLabel = document.getElementById('snapBtnLabel');

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file && previewContainer && previewImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          previewContainer.classList.remove('hidden');
          if (fileNameEl) fileNameEl.textContent = `تصویر بارگذاری شد: ${file.name}`;
          if (btnLabel) btnLabel.textContent = 'تغییر عکس';
          showToast('عکس آماده شد', 'اکنون دکمه «ارسال مستقیم به واتساپ» را بفشارید.');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function sendToWhatsApp() {
    const phone = '989390370985';
    const hasPhoto = fileInput && fileInput.files && fileInput.files.length > 0;
    const photoNote = hasPhoto ? ' (عکس فضا بارگذاری شد و در گفتگو ارسال می‌گردد)' : '';
    const message = `سلام و احترام، جهت کارشناسی و استعلام قیمت سیستم مداربسته آرت لنز پیام می‌دهم${photoNote}. لطفاً راهنمایی بفرمایید.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    showToast('انتقال به واتساپ', 'در حال اتصال به کارشناس ارشد فنی آرت لنز...');
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendToWhatsApp);
  }

  if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
      const snapCard = document.getElementById('snapConsultCard');
      if (snapCard) {
        snapCard.scrollIntoView({ behavior: 'smooth' });
        snapCard.classList.add('ring-2', 'ring-emerald-400');
        setTimeout(() => snapCard.classList.remove('ring-2', 'ring-emerald-400'), 2000);
      } else {
        sendToWhatsApp();
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 15. ArtLenz AI Space Planner & Vision Layout Assistant                     */
/* -------------------------------------------------------------------------- */
function initAISpacePlanner() {
  const canvasWrapper = document.getElementById('aiCanvasWrapper');
  const emptyPrompt = document.getElementById('aiEmptyPrompt');
  const fileInput = document.getElementById('aiImageInput');
  const previewImg = document.getElementById('aiPreviewImage');
  const pinsOverlay = document.getElementById('aiPinsOverlay');
  const scanOverlay = document.getElementById('aiScanOverlay');
  const progressBar = document.getElementById('aiScanProgressBar');
  const percentEl = document.getElementById('aiScanPercent');
  const telemetryEl = document.getElementById('aiTelemetryStatus');
  const spaceTypeSelect = document.getElementById('aiSpaceTypeSelect');
  const userNotesInput = document.getElementById('aiUserNotesInput');
  const triggerBtn = document.getElementById('aiTriggerAnalysisBtn');
  const sampleBtns = document.querySelectorAll('.ai-sample-btn');

  const preCard = document.getElementById('aiPreAnalysisCard');
  const postCard = document.getElementById('aiPostAnalysisCard');
  const envTitle = document.getElementById('aiResultEnvTitle');
  const camerasContainer = document.getElementById('aiResultCameras');
  const cablingMeters = document.getElementById('aiResultCablingMeters');
  const cablingDesc = document.getElementById('aiResultCablingDesc');
  const storageHDD = document.getElementById('aiResultStorageHDD');
  const storageDays = document.getElementById('aiResultStorageDays');
  const proTip = document.getElementById('aiResultProTip');
  const oldPriceEl = document.getElementById('aiResultOldPrice');
  const finalPriceEl = document.getElementById('aiResultFinalPrice');

  const addToCartBtn = document.getElementById('aiAddToCartBtn');
  const getQuoteBtn = document.getElementById('aiGetQuoteBtn');
  const whatsAppBtn = document.getElementById('aiWhatsAppBtn');
  const resetBtn = document.getElementById('aiResetBtn');

  if (!canvasWrapper || !fileInput) return;

  // Sample image URLs with high-quality architecture & space photos
  const SAMPLE_IMAGES = {
    villa: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    parking: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
    floorplan: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    store: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
  };

  let currentImageData = null;
  let currentSampleKey = null;
  let currentAIPlan = null;
  let isAnalyzing = false;

  // Click on dropzone or prompt triggers file selection
  if (emptyPrompt) {
    emptyPrompt.addEventListener('click', () => fileInput.click());
  }

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('خطای فرمت فایل', 'لطفاً فقط یک فایل تصویری (JPG, PNG, WebP) انتخاب نمایید.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      currentImageData = event.target.result;
      currentSampleKey = null;
      startAnalysis();
    };
    reader.readAsDataURL(file);
  });

  // Drag & drop handlers on canvas wrapper
  ['dragenter', 'dragover'].forEach(eventName => {
    canvasWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasWrapper.classList.add('border-brand-mint', 'bg-brand-mint/5');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    canvasWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      canvasWrapper.classList.remove('border-brand-mint', 'bg-brand-mint/5');
    });
  });

  canvasWrapper.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt && dt.files && dt.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentImageData = event.target.result;
        currentSampleKey = null;
        startAnalysis();
      };
      reader.readAsDataURL(file);
    }
  });

  // Sample preset buttons
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = btn.dataset.sample;
      if (!sample || !SAMPLE_IMAGES[sample]) return;
      currentSampleKey = sample;
      currentImageData = SAMPLE_IMAGES[sample];
      if (spaceTypeSelect) {
        if (sample === 'villa') spaceTypeSelect.value = 'villa';
        else if (sample === 'parking') spaceTypeSelect.value = 'residential';
        else if (sample === 'floorplan') spaceTypeSelect.value = 'office';
        else if (sample === 'store') spaceTypeSelect.value = 'commercial';
      }
      startAnalysis();
    });
  });

  // Manual trigger button
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      if (!currentImageData) {
        currentSampleKey = 'villa';
        currentImageData = SAMPLE_IMAGES.villa;
      }
      startAnalysis();
    });
  }

  // Main startAnalysis function
  async function startAnalysis() {
    if (isAnalyzing || !currentImageData) return;
    isAnalyzing = true;

    // 1. Show image in preview, hide empty prompt, clear previous pins
    emptyPrompt.classList.add('hidden');
    previewImg.src = currentImageData;
    previewImg.classList.remove('hidden');
    pinsOverlay.innerHTML = '';

    // 2. Activate scanning overlay
    scanOverlay.classList.remove('hidden');
    progressBar.style.width = '10%';
    percentEl.textContent = '۱۰٪';
    telemetryEl.textContent = 'در حال استخراج ابعاد هندسی فضا...';

    // Telemetry ticker steps
    const telemetrySteps = [
      { p: 28, text: 'شناسایی ورودی‌ها، پنجره‌ها و زوایای آسیب‌پذیر فضا...' },
      { p: 58, text: 'محاسبه زوایای تابش نور و پوشش بدون نقطه کور با لنز ۲.۸ و ۳.۶...' },
      { p: 82, text: 'محاسبه متراژ بهینه کابل‌کشی Cat6 مس کامل و ظرفیت NVR...' },
      { p: 98, text: 'تکمیل طراحی مهندسی و تولید پیش‌فاکتور اختصاصی...' }
    ];

    let stepIdx = 0;
    const tickerInterval = setInterval(() => {
      if (stepIdx < telemetrySteps.length) {
        const step = telemetrySteps[stepIdx];
        progressBar.style.width = `${step.p}%`;
        percentEl.textContent = `${formatPersianNumber(step.p)}٪`;
        telemetryEl.textContent = step.text;
        stepIdx++;
      }
    }, 450);

    // Call API or Fallback
    const spaceType = spaceTypeSelect ? spaceTypeSelect.value : 'auto';
    const userNotes = userNotesInput ? userNotesInput.value.trim() : '';

    let analysisResult = null;

    try {
      const response = await fetch('/api/analyze-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentImageData.startsWith('data:') ? currentImageData : '',
          sampleKey: currentSampleKey,
          spaceType,
          userNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          analysisResult = data;
        }
      }
    } catch (err) {
      console.warn('AI Serverless API error, using client fallback:', err);
    }

    // Ensure at least 1.8s of futuristic scan UI
    await new Promise(r => setTimeout(r, 2000));
    clearInterval(tickerInterval);

    // If API did not return, use built-in fallback
    if (!analysisResult) {
      analysisResult = generateClientFallback(spaceType, currentSampleKey, userNotes);
    }

    currentAIPlan = analysisResult;
    renderAnalysisResults(analysisResult);

    // Hide scan overlay
    scanOverlay.classList.add('hidden');
    isAnalyzing = false;
    showToast('تحلیل هوشمند فضا انجام شد ✨', `پوشش امنیتی بدون نقطه کور برای «${analysisResult.environment}» محاسبه شد.`);
  }

  // Render results
  function renderAnalysisResults(data) {
    if (!data) return;

    if (preCard) preCard.classList.add('hidden');
    if (postCard) postCard.classList.remove('hidden');

    if (envTitle) envTitle.textContent = data.environment || 'فضای اختصاصی شما';

    // Render Camera List
    if (camerasContainer && data.cameras) {
      camerasContainer.innerHTML = data.cameras.map(cam => `
        <div class="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start justify-between gap-3 hover:border-brand-mint/30 transition-all">
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-brand-mint/10 border border-brand-mint/20 text-brand-mint flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">${cam.model}</span>
                <span class="px-2 py-0.5 rounded-full bg-brand-mint/20 text-brand-mint text-[10px] font-mono font-bold">${formatPersianNumber(cam.count)} عدد</span>
              </div>
              <p class="text-[11px] text-slate-300 mt-0.5">${cam.lens} • ${cam.purpose}</p>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Cabling & Storage
    if (cablingMeters && data.cabling) {
      cablingMeters.textContent = `${formatPersianNumber(data.cabling.totalMeters)} متر ${data.cabling.cableType}`;
    }
    if (cablingDesc && data.cabling) {
      cablingDesc.textContent = data.cabling.estimatedRuns;
    }
    if (storageHDD && data.recording) {
      storageHDD.textContent = data.recording.hdd;
    }
    if (storageDays && data.recording) {
      storageDays.textContent = `${formatPersianNumber(data.recording.retentionDays)} روز ضبط مداوم 4K (${data.recording.nvrChannels})`;
    }

    // Pro Tip
    if (proTip) {
      proTip.textContent = data.proTip || 'طراحی بر اساس حذف کامل نقاط کور و حفظ کیفیت تصویر در شب به صورت تمام‌رنگی انجام شده است.';
    }

    // Prices
    if (oldPriceEl && data.pricing) {
      oldPriceEl.textContent = `${formatPersianNumber(data.pricing.oldTotal)} تومان`;
    }
    if (finalPriceEl && data.pricing) {
      finalPriceEl.textContent = `${formatPersianNumber(data.pricing.finalTotal)} تومان`;
    }

    // Render Interactive Detection Pins on image overlay
    if (pinsOverlay && data.detectedFeatures) {
      pinsOverlay.innerHTML = data.detectedFeatures.map((feat, idx) => `
        <div class="ai-detection-pin pointer-events-auto group" style="left: ${feat.x}%; top: ${feat.y}%;">
          <div class="relative flex items-center justify-center">
            <span class="w-7 h-7 rounded-full bg-brand-mint/20 border-2 border-brand-mint flex items-center justify-center shadow-[0_0_12px_#5BF4A3] text-brand-navy-dark font-mono text-[10px] font-black bg-brand-mint">
              ${formatPersianNumber(idx + 1)}
            </span>
            <!-- Tooltip -->
            <div class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center whitespace-nowrap z-30">
              <div class="px-2.5 py-1.5 rounded-xl bg-slate-900/95 border border-brand-mint/40 text-[11px] text-white shadow-xl backdrop-blur-md">
                <span class="font-bold text-brand-mint">${feat.name}</span>
                <span class="text-[10px] text-slate-300 block">اولویت نظارتی: ${feat.priority}</span>
              </div>
              <div class="w-2 h-2 bg-slate-900/95 border-r border-b border-brand-mint/40 transform rotate-45 -mt-1"></div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Client-side fallback generator
  function generateClientFallback(spaceType, sampleKey, userNotes) {
    if (sampleKey === 'parking' || spaceType === 'residential') {
      return {
        environment: 'پارکینگ مجتمع مسکونی و رمپ ورود',
        detectedFeatures: [
          { name: 'رمپ و گیت ورود خودرو', x: 22, y: 40, priority: 'بحرانی' },
          { name: 'درب لابی و آسانسور', x: 74, y: 35, priority: 'بالا' },
          { name: 'فضای پارک و تردد خودروها', x: 50, y: 70, priority: 'متوسط' }
        ],
        cameras: [
          { model: 'ArtLenz B600 ColorHunter 4K', type: 'بولت دید در شب رنگی', lens: 'لنز ۳.۶ میلی‌متر (فوکوس پلاک)', count: 2, purpose: 'تشخیص دقیق پلاک و هویت راننده در دهانه رمپ' },
          { model: 'ArtLenz D400 Wide 4K', type: 'دام واید ضدخرابکاری', lens: 'لنز ۲.۸ میلی‌متر (دید فوق‌پهن)', count: 2, purpose: 'پوشش راهروها و ورودی لابی با میکروفون داخلی' }
        ],
        cabling: { totalMeters: 140, cableType: 'کابل شبکه Cat6 Outdoor مس کامل', estimatedRuns: '۳ مسیر کابل‌کشی مجزا' },
        recording: { nvrChannels: 'دستگاه NVR هوشمند ۴ کانال', hdd: 'هارد ۲ ترابایت بنفش Western Digital', retentionDays: 20 },
        pricing: { oldTotal: 26500000, finalTotal: 23200000 },
        proTip: 'نصب دوربین پلاک‌خوان در زاویه ۳۰ درجه نسبت به افق رمپ مانع از تابش مستقیم نور چراغ خودروها در سنسور دوربین می‌گردد.'
      };
    } else if (sampleKey === 'floorplan' || spaceType === 'office') {
      return {
        environment: 'پلان اداری و دفتر کار مدرن',
        detectedFeatures: [
          { name: 'درب ورودی پرسنل و مراجعین', x: 18, y: 30, priority: 'بحرانی' },
          { name: 'سالن اصلی و میزهای کار', x: 52, y: 55, priority: 'بالا' },
          { name: 'اتاق سرور و اسناد مالی', x: 82, y: 35, priority: 'بحرانی' }
        ],
        cameras: [
          { model: 'ArtLenz D400 Wide 4K', type: 'دام سقفی ظریف', lens: 'لنز ۲.۸ میلی‌متر زاویه ۱۰۵ درجه', count: 3, purpose: 'پوشش همپوشان سالن و ورودی بدون جلب توجه' },
          { model: 'ArtLenz Mini-PTZ 4K', type: 'اسپیددام اداری گردان', lens: 'زوم اپتیکال ۳ برابر', count: 1, purpose: 'نظارت هوشمند سالن کنفرانس و جلسات' }
        ],
        cabling: { totalMeters: 90, cableType: 'کابل Cat6 UTP ضد حریق LSZH', estimatedRuns: 'کابل‌کشی داخل داکت توکار' },
        recording: { nvrChannels: 'دستگاه NVR بدون صدا Fanless ۴ کانال', hdd: 'هارد ۲ ترابایت بنفش Western Digital', retentionDays: 25 },
        pricing: { oldTotal: 24200000, finalTotal: 20900000 },
        proTip: 'استفاده از دوربین‌های دام با میکروفون محیطی مجهز به قابلیت Noise Reduction جهت جلسات کاری بسیار کارآمد است.'
      };
    } else if (sampleKey === 'store' || spaceType === 'commercial') {
      return {
        environment: 'فروشگاه و سالن تجاری',
        detectedFeatures: [
          { name: 'صندوق فروشگاه و دستگاه پوز', x: 30, y: 45, priority: 'بحرانی' },
          { name: 'درب ورودی و ویترین بیرونی', x: 75, y: 30, priority: 'بحرانی' },
          { name: 'قفسه‌های اجناس و راهرو', x: 50, y: 70, priority: 'متوسط' }
        ],
        cameras: [
          { model: 'ArtLenz D500 PosCapture 4K', type: 'دام زوم‌دار تخصصی صندوق', lens: 'لنز متغیر ۲.۸ تا ۱۲ میلی‌متر', count: 1, purpose: 'دید بسیار دقیق اسکناس و رسید کارتخوان با ضبط صدا' },
          { model: 'ArtLenz B600 ColorHunter 4K', type: 'بولت دید در شب رنگی', lens: 'لنز ۲.۸ میلی‌متر فوق‌پهن', count: 2, purpose: 'پوشش پیاده‌رو، ورودی و کل فضای فروشگاه' }
        ],
        cabling: { totalMeters: 80, cableType: 'کابل شبکه مس تمام Cat6', estimatedRuns: 'انتقال سریع و پایدار تصویر' },
        recording: { nvrChannels: 'دستگاه NVR هوشمند ۴ کانال 4K', hdd: 'هارد ۲ ترابایت بنفش WD', retentionDays: 28 },
        pricing: { oldTotal: 23800000, finalTotal: 20400000 },
        proTip: 'قرار دادن دوربین بالای سر صندوقدار با لنز زوم، بروز هرگونه اختلاف حساب در پرداخت نقدی و کارتخوان را کاملاً رفع می‌کند.'
      };
    } else {
      // Default Villa
      return {
        environment: 'حیاط و محوطه ویلایی دوبلکس',
        detectedFeatures: [
          { name: 'درب ورودی نفررو و سواره‌رو', x: 25, y: 35, priority: 'بحرانی' },
          { name: 'محوطه حیاط، استخر و آلاچیق', x: 62, y: 55, priority: 'بالا' },
          { name: 'دیوار جانبی و زاویه کور پشت بنا', x: 84, y: 68, priority: 'متوسط' }
        ],
        cameras: [
          { model: 'ArtLenz B600 ColorHunter 4K', type: 'دوربین بولت دید در شب رنگی', lens: 'لنز ۲.۸ میلی‌متر (زاویه باز ۱۰۵ درجه)', count: 2, purpose: 'پوشش محوطه و تشخیص هوشمند انسان و خودرو در تاریکی مطلق' },
          { model: 'ArtLenz D400 Wide 4K', type: 'دوربین دام ضدآب IP67', lens: 'لنز ۳.۶ میلی‌متر (فوکوس ورودی)', count: 1, purpose: 'نظارت درب ورودی ویلا با میکروفون محیطی' }
        ],
        cabling: { totalMeters: 120, cableType: 'کابل شبکه Cat6 SFTP تمام مس ضدآفتاب Outdoor', estimatedRuns: 'لوله فلکسیبل ضدجونده' },
        recording: { nvrChannels: 'دستگاه NVR هوشمند ۴ کانال 4K', hdd: 'هارد ۲ ترابایت بنفش Western Digital', retentionDays: 22 },
        pricing: { oldTotal: 24900000, finalTotal: 21500000 },
        proTip: 'نصب دوربین بولت با زاویه تابش لنز ۲.۸ میلی‌متری روی دیوار ضلع غربی جهت حذف بازتاب نور خورشید در عصرها توصیه می‌گردد.'
      };
    }
  }

  // 1. Action: Add To Cart
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!currentAIPlan) return;
      currentAIPlan.cameras.forEach(c => {
        window.addToCart(c.model, 4250000);
      });
      window.addToCart('پکیج NVR 4K + هارد بنفش و متعلقات هوش مصنوعی', 13000000);
      showToast('پکیج به سبد اضافه شد 🛒', 'تجهیزات پیشنهادی هوش مصنوعی در سبد خرید شما قرار گرفت.');
    });
  }

  // 2. Action: Official Quote PDF
  if (getQuoteBtn) {
    getQuoteBtn.addEventListener('click', () => {
      const openInvoiceBtn = document.getElementById('openOfficialInvoiceBtn');
      if (openInvoiceBtn) {
        openInvoiceBtn.click();
      }
    });
  }

  // 3. Action: WhatsApp
  if (whatsAppBtn) {
    whatsAppBtn.addEventListener('click', () => {
      const phone = '989390370985';
      const env = currentAIPlan ? currentAIPlan.environment : 'فضا';
      const camCount = currentAIPlan && currentAIPlan.cameras ? currentAIPlan.cameras.reduce((s, c) => s + c.count, 0) : 3;
      const cabling = currentAIPlan && currentAIPlan.cabling ? `${currentAIPlan.cabling.totalMeters} متر` : '۱۲۰ متر';
      const finalPrice = currentAIPlan && currentAIPlan.pricing ? `${formatPersianNumber(currentAIPlan.pricing.finalTotal)} تومان` : '۲۱,۵۰۰,۰۰۰ تومان';

      const msg = `سلام و احترام، سیستم هوش مصنوعی آرت لنز این پیشنهاد را برای فضای من برآورد کرده است:
📌 محیط: ${env}
📷 تعداد دوربین پیشنهادی: ${formatPersianNumber(camCount)} عدد
🔌 متراژ کابل شبکه: ${cabling}
💰 برآورد مبلغ کل: ${finalPrice}

لطفاً جهت مشاوره تکمیلی، هماهنگی کارشناسی و نهایی‌سازی سفارش راهنمایی بفرمایید.`;

      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
      showToast('انتقال به واتساپ', 'در حال انتقال مشخصات تحلیل هوش مصنوعی به کارشناس...');
    });
  }

  // 4. Action: Reset
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      previewImg.classList.add('hidden');
      previewImg.src = '';
      pinsOverlay.innerHTML = '';
      emptyPrompt.classList.remove('hidden');
      if (fileInput) fileInput.value = '';
      currentImageData = null;
      currentSampleKey = null;
      currentAIPlan = null;
      if (postCard) postCard.classList.add('hidden');
      if (preCard) preCard.classList.remove('hidden');
      showToast('آماده تحلیل جدید', 'می‌توانید تصویر جدیدی آپلود کنید یا نمونه دیگری را انتخاب نمایید.');
    });
  }
}

