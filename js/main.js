/* =============================================================
   Hongcan Guo — homepage motion
   - scroll progress bar
   - sticky nav state on scroll
   - IntersectionObserver reveal w/ per-group stagger
   - subtle parallax on hero portrait
   Respects `prefers-reduced-motion`.
   ============================================================= */
(function () {
    'use strict';

    const prefersReduced =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --------------------------------------------------------
       1. Scroll progress bar (fixed at top)
       -------------------------------------------------------- */
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);

    const nav = document.querySelector('.site-nav');

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progress.style.width = pct + '%';

            if (nav) {
                if (scrollTop > 8) nav.classList.add('is-scrolled');
                else nav.classList.remove('is-scrolled');
            }
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* --------------------------------------------------------
       2. Reveal on scroll w/ staggered items within each group
       -------------------------------------------------------- */
    // Element types that reveal as a whole block on first entry
    const blockSelectors = [
        'section:not(.hero)',
        '.page-title',
        '.section-sep'
    ];

    // Items inside lists that should stagger individually
    // Map: container selector -> child selector to stagger
    const staggerGroups = [
        { container: '.news-list',        item: 'li' },
        { container: '#education',        item: '.experience-item' },
        { container: '#experience',       item: '.experience-item' },
        { container: '#publications',     item: '.paper-item' },
        { container: '#posts',            item: '.rp-item' },
        { container: '.wrap > section',   item: '.post-list-item' }
    ];

    // Tag block elements
    blockSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
    });

    // Tag + delay stagger children (overrides block reveal for those children)
    staggerGroups.forEach(({ container, item }) => {
        document.querySelectorAll(container).forEach(parent => {
            const items = parent.querySelectorAll(item);
            items.forEach((el, i) => {
                el.classList.add('reveal');
                el.style.setProperty('--reveal-delay', (i * 0.07) + 's');
            });
        });
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('is-visible');
        });
    } else {
        const io = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
        );
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }

    /* --------------------------------------------------------
       3. Subtle parallax on hero portrait (mouse-follow)
       -------------------------------------------------------- */
    const portrait = document.querySelector('.hero .portrait');
    if (portrait && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
        const img = portrait.querySelector('img');
        const frame = portrait; // use ::before for back frame — limited via CSS var
        let raf = 0;
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;

        function tick() {
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;
            if (img) {
                img.style.transform =
                    `translate(${currentX * 4}px, ${currentY * 4}px)`;
            }
            if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
                raf = requestAnimationFrame(tick);
            } else {
                raf = 0;
            }
        }

        portrait.addEventListener('mousemove', (e) => {
            const rect = portrait.getBoundingClientRect();
            targetX = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 … 0.5
            targetY = (e.clientY - rect.top) / rect.height - 0.5;
            if (!raf) raf = requestAnimationFrame(tick);
        });
        portrait.addEventListener('mouseleave', () => {
            targetX = 0; targetY = 0;
            if (!raf) raf = requestAnimationFrame(tick);
        });
    }

    /* --------------------------------------------------------
       4. Current-year injection for footer
       -------------------------------------------------------- */
    document.querySelectorAll('[data-year]').forEach(el => {
        el.textContent = new Date().getFullYear();
    });

})();
