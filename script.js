// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const enableMotion = !prefersReducedMotion;
const enableCustomCursor = enableMotion && !isCoarsePointer;

async function loadSiteContent() {
    try {
        const response = await fetch('content/site.json', { cache: 'no-store' });
        if (!response.ok) return null;
        const content = await response.json();
        applySiteContent(content);
        return content;
    } catch {
        return null;
    }
}

function setMeta(selector, value, attribute = 'content') {
    const element = document.querySelector(selector);
    if (element && value) {
        element.setAttribute(attribute, value);
    }
}

function applyProjectContent(projects = []) {
    const panels = document.querySelectorAll('.project-panel');

    panels.forEach((panel, index) => {
        const project = projects[index];
        if (!project) return;

        const image = panel.querySelector('.project-img');
        const category = panel.querySelector('.pr-middle .label-text');
        const title = panel.querySelector('.pr-title');
        const metaSpans = panel.querySelectorAll('.pr-meta span');
        const description = panel.querySelector('.pr-desc');

        if (image) {
            image.src = project.image;
            image.alt = project.imageAlt;
        }
        if (category) category.textContent = project.category;
        if (title) title.innerHTML = project.titleHtml;
        if (metaSpans[0]) metaSpans[0].textContent = project.location;
        if (metaSpans[1]) metaSpans[1].textContent = project.year;
        if (description) description.textContent = project.description;
    });
}

function applyAboutContent(about = {}) {
    const watermarks = document.querySelectorAll('.about-watermark');
    if (watermarks[0] && about.watermarkPrimary) watermarks[0].textContent = about.watermarkPrimary;
    if (watermarks[1] && about.watermarkSecondary) watermarks[1].textContent = about.watermarkSecondary;

    const kicker = document.querySelector('.about-kicker');
    const lead = document.querySelector('.about-lead');
    const aboutImage = document.querySelector('.about-img');
    const badgeLabel = document.querySelector('.about-badge-label');
    const badgeValue = document.querySelector('.about-badge-value');
    const ethos = document.querySelector('.about-essay-block .body-text');

    if (kicker && about.kicker) kicker.textContent = about.kicker;
    if (lead && about.lead) lead.textContent = about.lead;
    if (aboutImage && about.image) {
        aboutImage.src = about.image;
        aboutImage.alt = about.imageAlt || aboutImage.alt;
    }
    if (badgeLabel && about.workshopLabel) badgeLabel.textContent = about.workshopLabel;
    if (badgeValue && about.workshopValue) badgeValue.textContent = about.workshopValue;
    if (ethos && about.ethos) ethos.textContent = about.ethos;

    const pillars = document.querySelectorAll('.about-pillar');
    pillars.forEach((pillar, index) => {
        const pillarData = about.pillars?.[index];
        if (!pillarData) return;
        const title = pillar.querySelector('.pillar-title');
        const text = pillar.querySelector('.body-text');
        if (title) title.innerHTML = pillarData.titleHtml;
        if (text) text.textContent = pillarData.description;
    });

    const metrics = document.querySelectorAll('.about-metric');
    metrics.forEach((metric, index) => {
        const metricData = about.metrics?.[index];
        if (!metricData) return;
        const value = metric.querySelector('.stat-num');
        const label = metric.querySelector('.stat-label');
        if (value) value.textContent = metricData.value;
        if (label) label.textContent = metricData.label;
    });
}

function applyContactContent(contact = {}) {
    const emailRow = document.querySelector('a[href^="mailto:"]');
    const phoneRow = document.querySelector('a[href^="tel:"]');
    const whatsappRow = document.querySelector('a[href*="wa.me"]');
    const footerCopy = document.querySelector('.fb-left');

    if (emailRow && contact.email) {
        emailRow.href = `mailto:${contact.email}`;
        const value = emailRow.querySelector('.cr-value');
        if (value) value.textContent = contact.email;
    }

    if (phoneRow && contact.phoneHref) {
        phoneRow.href = `tel:${contact.phoneHref}`;
        const value = phoneRow.querySelector('.cr-value');
        if (value) value.textContent = contact.phone || value.textContent;
    }

    if (whatsappRow && contact.whatsappHref) {
        whatsappRow.href = contact.whatsappHref;
        const value = whatsappRow.querySelector('.cr-value');
        if (value) value.textContent = contact.whatsappLabel || value.textContent;
    }

    if (footerCopy && contact.footerCopy) footerCopy.innerHTML = contact.footerCopy;
}

function applySiteContent(content) {
    if (!content) return;

    if (content.seo) {
        document.title = content.seo.title || document.title;
        setMeta('meta[name="description"]', content.seo.description);
        setMeta('meta[name="theme-color"]', content.seo.themeColor);
        setMeta('meta[property="og:title"]', content.seo.ogTitle || content.seo.title);
        setMeta('meta[property="og:description"]', content.seo.ogDescription || content.seo.description);
        setMeta('meta[property="og:site_name"]', content.seo.siteName);
        setMeta('meta[property="og:locale"]', content.seo.locale);
        setMeta('meta[name="twitter:title"]', content.seo.ogTitle || content.seo.title);
        setMeta('meta[name="twitter:description"]', content.seo.ogDescription || content.seo.description);
        setMeta('meta[property="og:image"]', content.portfolio?.projects?.[0]?.image);
        setMeta('meta[name="twitter:image"]', content.portfolio?.projects?.[0]?.image);

        const structuredData = document.getElementById('structured-data');
        if (structuredData) {
            structuredData.textContent = JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: content.seo.siteName || 'Arabesque Carpentry',
                description: content.seo.description,
                areaServed: 'Bahrain',
                image: content.portfolio?.projects?.[0]?.image || 'assets/door.png',
                telephone: content.contact?.phone || '+973 1770 1006',
                email: content.contact?.email || 'actbahrain@batelco.com.bh'
            });
        }
    }

    if (content.hero) {
        const heroDesc = document.querySelector('.hero-desc');
        const filmStripLabel = document.querySelector('.film-strip-label');
        const heroLocation = document.querySelector('.hero-bottom-right');

        if (heroDesc && content.hero.description) heroDesc.textContent = content.hero.description;
        if (filmStripLabel && content.hero.filmStripLabel) filmStripLabel.textContent = content.hero.filmStripLabel;
        if (heroLocation && content.hero.locationLabel) heroLocation.textContent = content.hero.locationLabel;
    }

    if (content.portfolio) {
        const subtitle = document.querySelector('.ph-subtitle');
        const footerTitle = document.querySelector('.pf-title');
        const footerLink = document.querySelector('.pf-link');

        if (subtitle && content.portfolio.subtitle) subtitle.textContent = content.portfolio.subtitle;
        if (footerTitle && content.portfolio.footerTitle) footerTitle.textContent = content.portfolio.footerTitle;
        if (footerLink && content.portfolio.footerLinkLabel) footerLink.textContent = content.portfolio.footerLinkLabel;
        applyProjectContent(content.portfolio.projects);
    }

    applyAboutContent(content.about);
    applyContactContent(content.contact);
}

// Initialize Lenis
const lenis = new Lenis({
    duration: enableMotion ? 0.9 : 0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: enableMotion,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Configure Lenis inertia (0.82 as requested)
lenis.options.wheelMultiplier = 0.82;

// Integrate Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if(target !== '#' && enableMotion) {
            lenis.scrollTo(target, { offset: -80 }); // offset for navbar
        } else if (target !== '#') {
            document.querySelector(target)?.scrollIntoView();
        }
    });
});

if (enableMotion) {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
}
gsap.ticker.lagSmoothing(0, 0);

// Custom Cursor
const cursor = document.querySelector('.cursor');
const cursorLabel = document.querySelector('.cursor-label');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Cursor lag effect (set to 1 to remove lag as requested)
const lag = 1; 

if (enableCustomCursor && cursor && cursorLabel) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        let dx = mouseX - cursorX;
        let dy = mouseY - cursorY;
        cursorX += dx * lag;
        cursorY += dy * lag;
        
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        cursorLabel.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// Function to attach hover states
function initCursorHovers() {
    if (!enableCustomCursor || !cursor) return;

    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('link-hover'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('link-hover'));
    });

    const ctas = document.querySelectorAll('.cta-hover-target');
    ctas.forEach(cta => {
        cta.addEventListener('mouseenter', () => cursor.classList.add('cta-hover'));
        cta.addEventListener('mouseleave', () => cursor.classList.remove('cta-hover'));
    });
}
initCursorHovers();

function initThemeToggle() {
    const themeBtn = document.querySelector('.theme-toggle');

    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-dark');
        ScrollTrigger.refresh();
    });
}
initThemeToggle();

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    // We can use Lenis scroll event to toggle scrolled class
    lenis.on('scroll', (e) => {
        if (e.animatedScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}
initNavbarScroll();

function initNavbarInversion() {
    const darkSections = document.querySelectorAll('.portfolio, .products, .dual-marquee, .footer-cta');
    const navbar = document.querySelector('.navbar');

    darkSections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 40px", // When the section hits the middle of the navbar
            end: "bottom 40px",
            onEnter: () => navbar.classList.add('nav-inverted'),
            onLeave: () => navbar.classList.remove('nav-inverted'),
            onEnterBack: () => navbar.classList.add('nav-inverted'),
            onLeaveBack: () => navbar.classList.remove('nav-inverted'),
        });
    });
}

// Mobile menu toggle
const mobileToggle = document.querySelector('.mobile-nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

function setMobileMenuState(isOpen) {
    mobileMenu.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);

    if (isOpen) {
        lenis.stop();
    } else {
        lenis.start();
    }
}

mobileToggle.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('active');
    setMobileMenuState(isOpen);
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        setMobileMenuState(false);
    });
});

// Initial Page Load Animations
function initPageLoadSequence() {
    if (!enableMotion) return;

    const tl = gsap.timeline();

    // 0-300ms: Navbar fades in
    tl.fromTo('.logo-main', 
        { x: -20, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, '0')
      .fromTo('.logo-sub', 
        { x: -20, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, '0')
      .fromTo(['.nav-center > *', '.nav-right > *'], 
        { x: 20, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, '0');

    // 300-900ms: Title lines clip up
    const titleLines = document.querySelectorAll('.title-line, .title-line-small');
    titleLines.forEach((line, index) => {
        // Delay 200ms per staggered line starting at 300ms (0.3s)
        tl.fromTo(line, {
            yPercent: 100
        }, {
            yPercent: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, 0.3 + (index * 0.2));
    });

    // 900ms: Photo slides in
    tl.fromTo('.hero-main-img', { x: 40, opacity: 0 }, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out'
    }, 0.9);

    // 1100ms: Body text and CTAs fade up
    tl.fromTo(['.hero-rule', '.hero-desc', '.hero-links', '.hero-bottom-right'], {
        y: 16,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
    }, 1.1);

    // 1300ms: Film strip thumbnails pop in
    tl.fromTo('.strip-img', { opacity: 0 }, {
        opacity: 1,
        duration: 0.3,
        stagger: 0.06,
        ease: 'power1.out'
    }, 1.3);
}

// Cinematic Portfolio (Section 3) ScrollTrigger
function initCinematicPortfolio() {
    if (!enableMotion) return;

    const panels = gsap.utils.toArray('.project-panel');
    const totalPanels = panels.length;
    
    if (totalPanels === 0) return;

    // Set initial states
    gsap.set(panels, { opacity: 0, pointerEvents: 'none' });
    gsap.set(panels[0], { opacity: 1, pointerEvents: 'auto' });
    
    panels.forEach((panel, i) => {
        if (i !== 0) {
            gsap.set(panel.querySelector('.project-img'), { xPercent: 5, opacity: 0.2 });
            gsap.set(panel.querySelector('.pr-content'), { y: 40, opacity: 0 });
        }
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#portfolio-pin",
            start: "top top",
            end: `+=${150 * (totalPanels - 1)}%`, // 150vh per transition
            scrub: 1, // Smooth scrubbing
            pin: true,
            anticipatePin: 1
        }
    });

    // Progress bar
    tl.to('.portfolio-progress-bar', {
        height: '100%',
        ease: 'none'
    }, 0);

    // Add empty space at start and end of timeline for pausing
    tl.set({}, {}, "+=0.5");
    
    // Transitions between panels
    for (let i = 0; i < totalPanels - 1; i++) {
        const currentPanel = panels[i];
        const nextPanel = panels[i + 1];
        
        const currentImg = currentPanel.querySelector('.project-img');
        const currentContent = currentPanel.querySelector('.pr-content');
        
        const nextImg = nextPanel.querySelector('.project-img');
        const nextContent = nextPanel.querySelector('.pr-content');

        const stepTime = i + 0.5; // Offset by 0.5 so first panel rests before animating

        // At the start of this transition, ensure next panel is visible
        tl.set(nextPanel, { opacity: 1, pointerEvents: 'auto' }, stepTime);

        // 1. Current Content slides UP and OUT
        tl.to(currentContent, {
            y: -40,
            opacity: 0,
            duration: 0.2, // ~150ms equivalent relative
            ease: 'power2.in'
        }, stepTime);

        // 2. Current Image slides LEFT and fades out
        tl.to(currentImg, {
            xPercent: -5,
            opacity: 0.2,
            duration: 0.6, // ~600ms equivalent relative
            ease: 'power2.inOut'
        }, stepTime);

        // 3. Next Image enters from RIGHT
        tl.to(nextImg, {
            xPercent: 0,
            opacity: 1,
            duration: 0.7, // ~700ms equivalent relative
            ease: 'power2.out'
        }, stepTime + 0.1); // Starts slightly after current begins leaving

        // 4. Next Content slides up
        tl.to(nextContent, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
        }, stepTime + 0.4); // 300ms delay after image starts

        // Hide current panel completely after transition
        tl.set(currentPanel, { opacity: 0, pointerEvents: 'none' }, stepTime + 1);
        
        // Add artificial pause at end of each transition
        tl.set({}, {}, "+=0.5");
    }
}

// Products Accordion (Section 4)
function initProductsAccordion() {
    const items = document.querySelectorAll('.accordion-item');

    if (items.length === 0) return;

    function setActiveItem(activeItem) {
        items.forEach(item => {
            const isActive = item === activeItem;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-expanded', String(isActive));
        });
    }

    items.forEach(item => {
        item.addEventListener('mouseenter', () => setActiveItem(item));
        item.addEventListener('focus', () => setActiveItem(item));
        item.addEventListener('click', () => setActiveItem(item));
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveItem(item);
            }
        });
    });
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const formData = new FormData(form);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const message = String(formData.get('message') || '').trim();

            if (!name || !email || !message) {
                successMsg.dataset.state = 'error';
                successMsg.textContent = 'Please fill in your name, email, and project details.';
                successMsg.style.display = 'block';
                return;
            }

            const subject = encodeURIComponent(`Project Inquiry from ${name}`);
            const body = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\n\nProject Details:\n${message}`
            );

            btn.disabled = true;
            window.location.href = `mailto:actbahrain@batelco.com.bh?subject=${subject}&body=${body}`;
            successMsg.dataset.state = 'success';
            successMsg.textContent = 'Your email app should open with a pre-filled inquiry.';
            successMsg.style.display = 'block';
            btn.disabled = false;
        });
    }
}

// Section Reveals
function initSectionReveals() {
    if (!enableMotion) return;

    // Select sections to animate (excluding hero and portfolio which have custom logic)
    const sections = document.querySelectorAll('section:not(.hero):not(.portfolio), .footer-cta');
    
    sections.forEach(section => {
        // Select elements to stagger reveal inside this section
        const animElements = section.querySelectorAll(`
            .label-text, 
            .about-title, .about-kicker, .about-lead, .about-img, .about-badge, .about-essay-block, .about-pillar, .about-metric,
            .cert-item, .cf-label, .cf-text, 
            .accordion-item, .contact-row, .contact-form, .fc-subtitle
        `);
        
        if (animElements.length > 0) {
            gsap.fromTo(animElements, 
                { y: 60, opacity: 0, rotation: 1 },
                {
                    y: 0,
                    opacity: 1,
                    rotation: 0,
                    duration: 1.2,
                    stagger: 0.1,
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%", // Triggers when top of section is 15% from bottom
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    });

    // Add Parallax to Hero Image
    gsap.to('.hero-main-img', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // Add Parallax to About Image
    gsap.fromTo('.about-img', {
        yPercent: -10
    }, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    // Fade in marquees
    gsap.utils.toArray('.marquee-container').forEach(mq => {
        gsap.fromTo(mq,
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 1, 
                ease: "power2.out", 
                scrollTrigger: { 
                    trigger: mq, 
                    start: "top 90%" 
                } 
            }
        );
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSiteContent();
    initPageLoadSequence();
    initCinematicPortfolio();
    initProductsAccordion();
    initContactForm();
    initSectionReveals();
    initNavbarInversion();
});

window.addEventListener('load', () => {
    // Refresh ScrollTrigger once all images and resources have actually loaded
    if (enableMotion) {
        ScrollTrigger.refresh();
    }
});
