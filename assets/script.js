// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Configure Lenis inertia (0.82 as requested)
lenis.options.wheelMultiplier = 0.82;

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if(target !== '#') {
            lenis.scrollTo(target, { offset: -80 }); // offset for navbar
        }
    });
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
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

// Function to attach hover states
function initCursorHovers() {
    const links = document.querySelectorAll('a:not(.nav-cta), button');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('link-hover'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('link-hover'));
    });

    const ctas = document.querySelectorAll('.nav-cta');
    ctas.forEach(cta => {
        cta.addEventListener('mouseenter', () => cursor.classList.add('cta-hover'));
        cta.addEventListener('mouseleave', () => cursor.classList.remove('cta-hover'));
    });
}
initCursorHovers();

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

function initActiveNavLinks() {
    const sectionIds = ['work', 'about', 'products', 'contact'];
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu-links a');

    const setActive = (id) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
            setActive(visible.target.id);
        }
    }, {
        root: null,
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.6]
    });

    sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
    });
}

// Mobile menu toggle
const mobileToggle = document.querySelector('.mobile-nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
});

// Initial Page Load Animations
function initPageLoadSequence() {
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
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
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
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Sending...</span>';
            setTimeout(() => {
                form.reset();
                btn.innerHTML = originalText;
                successMsg.style.display = 'block';
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 5000);
            }, 1000);
        });
    }
}

// Section Reveals
function initSectionReveals() {
    // Select sections to animate (excluding hero and portfolio which have custom logic)
    const sections = document.querySelectorAll('section:not(.hero):not(.portfolio), .footer-cta');
    
    sections.forEach(section => {
        // Select elements to stagger reveal inside this section
        const animElements = section.querySelectorAll(`
            .label-text, 
            .about-title, .about-subtitle, .about-body p, .stat-row, .about-img, .about-card,
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

document.addEventListener('DOMContentLoaded', () => {
    initPageLoadSequence();
    initCinematicPortfolio();
    initProductsAccordion();
    initContactForm();
    initSectionReveals();
    initNavbarInversion();
    initActiveNavLinks();
});

window.addEventListener('load', () => {
    // Refresh ScrollTrigger once all images and resources have actually loaded
    ScrollTrigger.refresh();
});
