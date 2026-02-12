/* ================================================
   WORKFORCE 360° - MAIN JAVASCRIPT
   Handles interactions, animations, and integrations
   ================================================ */

/* ==============================================
   1. SMOOTH SCROLL FUNCTIONS
   ============================================== */
function smoothScroll(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileNav();
    }
}

function scrollTo(id) {
    smoothScroll(id);
}

/* ==============================================
   2. MOBILE MENU TOGGLE
   ============================================== */
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        if (mobileNav) {
            mobileNav.classList.toggle('open');
        }
    });
}

function closeMobileNav() {
    if (menuToggle) {
        menuToggle.classList.remove('open');
    }
    if (mobileNav) {
        mobileNav.classList.remove('open');
    }
}

/* ==============================================
   3. HEADER SCROLL EFFECTS
   ============================================== */
const header = document.getElementById('header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        if (header) {
            header.classList.add('scrolled');
        }
    } else {
        if (header) {
            header.classList.remove('scrolled');
        }
    }
    lastScrollTop = window.scrollY;
});

/* ==============================================
   4. INTERSECTION OBSERVER FOR SCROLL REVEALS
   ============================================== */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all reveal elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach((el) => {
        observer.observe(el);
    });

    // Add staggered animation delays to cards
    const cards = document.querySelectorAll('.card.reveal');
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
    });
});

/* ==============================================
   5. ACTIVE NAV LINK TRACKING
   ============================================== */
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a.nav-link');

    let current = '';
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

/* ==============================================
   6. FORM HANDLING
   ============================================== */
function handleBookingSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    console.log('Booking submission:', data);

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '✓ Booking Received!';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

    setTimeout(() => {
        alert(`Thank you ${data.name}!\n\nWe'll contact you within 2 hours at ${data.email} to confirm your consultation.`);
        e.target.reset();
        btn.textContent = originalText;
        btn.style.background = '';
        closeMobileNav();
    }, 2000);
}

/* ==============================================
   7. UTILITY FUNCTIONS
   ============================================== */

// Format phone number for WhatsApp
function formatWhatsAppNumber(number) {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '');
    // Ensure it starts with country code (971 for UAE)
    if (digits.startsWith('971')) {
        return digits;
    }
    if (digits.startsWith('0')) {
        return '971' + digits.substring(1);
    }
    return '971' + digits;
}

// Initialize WhatsApp button with actual number
function initializeWhatsApp(phoneNumber) {
    const waButton = document.querySelector('.wa-button');
    if (waButton && phoneNumber) {
        const formattedNumber = formatWhatsAppNumber(phoneNumber);
        waButton.href = `https://wa.me/${formattedNumber}`;
        waButton.target = '_blank';
        waButton.rel = 'noopener';
    }
}

/* ==============================================
   8. EVENT LISTENERS FOR DYNAMIC CONTENT
   ============================================== */

// Handle form submission if it exists
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
}

// Handle smooth scroll links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[data-scroll]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        if (href.startsWith('#')) {
            smoothScroll(href.substring(1));
        }
    }
});

/* ==============================================
   9. INITIALIZATION ON PAGE LOAD
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize WhatsApp with phone number (update this)
    initializeWhatsApp('+971-50-123-4567');

    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach((el) => {
        observer.observe(el);
    });

    // Add staggered animation delays to cards
    const cards = document.querySelectorAll('.card.reveal');
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.1}s`;
    });
});

/* ==============================================
   10. PERFORMANCE OPTIMIZATIONS
   ============================================== */

// Lazy load images if any
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
