(function () {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    /* SCROLL EFFECTS
       Same feel as the old ScrollMagic scenes: elements get .visible as they scroll into view,
       and lose it again when scrolled back above the trigger point. */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else if (entry.boundingClientRect.top > 0) {
                    entry.target.classList.remove('visible');
                }
            });
        }, { rootMargin: '0px 0px -12% 0px' });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('visible'));
    }

    /* HEADER: transparent at the top, solid with a smaller logo once scrolled (same 50px trigger as the old site) */
    const hdr = $('.hdr');
    if (hdr) {
        let shrunk = null;
        const onScroll = () => {
            const next = window.scrollY > 50;
            if (next !== shrunk) hdr.classList.toggle('shrink', (shrunk = next));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* MOBILE MENU */
    const menu = $('#menu');
    const menuBtn = $('.menu-btn');
    if (menu && typeof menu.showModal === 'function') {
        menuBtn.addEventListener('click', () => {
            menu.showModal();
            menuBtn.setAttribute('aria-expanded', 'true');
        });
        menu.addEventListener('close', () => menuBtn.setAttribute('aria-expanded', 'false'));
        const closeMenu = () => {
            if (!menu.open || menu.classList.contains('is-closing')) return;
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) { menu.close(); return; }
            menu.classList.add('is-closing');
            menu.addEventListener('animationend', () => {
                menu.classList.remove('is-closing');
                menu.close();
            }, { once: true });
        };
        // Esc: animate out instead of vanishing
        menu.addEventListener('cancel', (e) => { e.preventDefault(); closeMenu(); });
        // clicks on the backdrop land on the <dialog> itself
        menu.addEventListener('click', (e) => {
            if (e.target === menu || e.target.closest('a, [data-close]')) closeMenu();
        });
    } else if (menuBtn) {
        menuBtn.hidden = true;
    }

    /* CASE STUDIES PAGE: filter by area */
    const filters = $$('.filter-btn');
    filters.forEach((btn) => btn.addEventListener('click', () => {
        const area = btn.dataset.filter;
        filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        $$('#study-list .cs').forEach((s) => {
            s.hidden = area !== 'all' && !s.dataset.areas.split(' ').includes(area);
        });
    }));

    /* DIY GUIDE: contents panel follows along as you read */
    const toc = $('.guide-toc');
    if (toc) {
        const details = $('details', toc);
        const links = new Map($$('a', toc).map((a) => [a.hash.slice(1), a]));
        const small = matchMedia('(max-width: 1023px)');
        if (small.matches) details.open = false; // collapsed above the guide on smaller screens
        toc.addEventListener('click', (e) => { if (e.target.closest('a') && small.matches) details.open = false; });
        const heads = $$('.guide-body h2[id], .guide-body h3[id]').filter((h) => links.has(h.id));
        const mark = (id) => links.forEach((a, key) => a.classList.toggle('is-current', key === id));
        // "current" = the last heading that has scrolled past the top 30% of the screen
        let ticking = false;
        const update = () => {
            ticking = false;
            const line = window.innerHeight * 0.3;
            const passed = heads.filter((h) => h.getBoundingClientRect().top <= line);
            mark(passed.length ? passed[passed.length - 1].id : null);
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    /* CASE STUDY GALLERIES: full-size images in a lightbox (links still open the image without JS) */
    const lb = $('#lightbox');
    if (lb && typeof lb.showModal === 'function') {
        const img = $('img', lb);
        const cap = $('figcaption', lb);
        const fig = $('figure', lb);
        let items = [];
        let at = 0;
        const show = (i) => {
            at = (i + items.length) % items.length;
            const a = items[at];
            img.width = Number(a.dataset.fullW);
            img.height = Number(a.dataset.fullH);
            img.src = a.getAttribute('href');
            img.alt = $('img', a).alt;
            cap.textContent = $('figcaption', a.closest('figure')).textContent;
            fig.scrollTop = 0;
            $$('.lb-prev, .lb-next', lb).forEach((b) => { b.hidden = items.length < 2; });
        };
        $$('.gallery a').forEach((a) => a.addEventListener('click', (e) => {
            e.preventDefault();
            items = $$('a', a.closest('.gallery'));
            show(items.indexOf(a));
            lb.showModal();
        }));
        lb.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-lb]');
            if (btn) {
                if (btn.dataset.lb === 'close') lb.close();
                else show(at + Number(btn.dataset.lb));
            } else if (e.target === lb) {
                lb.close(); // clicked the dark surround
            }
        });
        lb.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') show(at + 1);
            if (e.key === 'ArrowLeft') show(at - 1);
        });
        lb.addEventListener('close', () => img.removeAttribute('src'));
    }

    /* SLOW SCROLL — a gentler, longer glide than the browser's smooth scroll; any wheel, touch or key stops it */
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let scrollAnim = 0;
    function stopScroll() {
        cancelAnimationFrame(scrollAnim);
        document.documentElement.style.scrollBehavior = '';
    }
    function slowScrollTo(y) {
        stopScroll();
        const root = document.documentElement;
        const start = window.scrollY;
        const dist = Math.max(0, Math.min(y, root.scrollHeight - window.innerHeight)) - start;
        if (Math.abs(dist) < 4) return;
        root.style.scrollBehavior = 'auto'; // the page-wide smooth scrolling would fight each frame
        if (reduceMotion.matches) {
            window.scrollTo(0, start + dist);
            root.style.scrollBehavior = '';
            return;
        }
        const duration = Math.min(1400, 600 + Math.abs(dist) * 0.5);
        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const t0 = performance.now();
        const step = (now) => {
            const t = Math.min(1, (now - t0) / duration);
            window.scrollTo(0, start + dist * ease(t));
            if (t < 1) scrollAnim = requestAnimationFrame(step);
            else root.style.scrollBehavior = '';
        };
        scrollAnim = requestAnimationFrame(step);
    }
    ['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, stopScroll, { passive: true }));

    /* HOME: area tiles + card carousel + case study matching */
    const boxes = $$('button.e2e-box');
    const tracks = $$('.car-track');
    const cards = $$('.svc');
    const studies = $$('.cs-wrap .cs');
    const view = $('.car-view');
    const prevBtn = $('.car-btn[data-dir="-1"]');
    const nextBtn = $('.car-btn[data-dir="1"]');
    const pos = $('.car-pos');
    const chip = $('#cs-chip');
    const clearBtn = $('#cs-clear');
    const note = $('#cs-note');
    const areaTitle = $('#car-area');
    const areaBlurb = $('#car-blurb');
    const mqMobile = matchMedia('(max-width: 639px)');
    const mqTablet = matchMedia('(max-width: 1023px)');

    // 'all' = no area tile selected: every service, strongest (most case-study mentions) first
    const state = { area: 'all', svc: null, idx: { all: 0, tech: 0, ui: 0, people: 0 } };
    const allBlurb = areaBlurb ? areaBlurb.textContent : '';
    const areaLabel = (area) => (area === 'all' ? 'All' : $(`button.e2e-box[data-area="${area}"] strong`).textContent);
    const svcName = (id) => $(`.svc[data-svc="${id}"] .svc-name`).textContent;
    const headerHeight = () => $('.hdr').offsetHeight;

    // must match the .svc flex-basis rules in site.css
    function layout() {
        if (mqMobile.matches) return { per: 2.35, gap: 14 };
        if (mqTablet.matches) return { per: 3, gap: 20 };
        return { per: 4, gap: 20 };
    }

    function renderCarousel() {
        const track = tracks.find((t) => t.dataset.area === state.area);
        tracks.forEach((t) => { t.hidden = t !== track; });

        const n = track.children.length;
        const { per, gap } = layout();
        const full = Math.floor(per);
        const maxIdx = Math.max(0, n - full);
        const idx = Math.min(Math.max(state.idx[state.area], 0), maxIdx);
        state.idx[state.area] = idx;

        track.style.transform = `translateX(calc(${-idx} * (100% + ${gap}px) / ${per}))`;
        prevBtn.disabled = idx <= 0;
        nextBtn.disabled = idx >= maxIdx;
        pos.textContent = n <= full ? `All ${n}` : `${idx + 1}–${Math.min(idx + full, n)} of ${n}`;
    }

    function page(dir) {
        state.idx[state.area] += dir;
        renderCarousel();
    }

    function renderStudy() {
        const all = state.area === 'all';
        let study = null;
        let label = '';
        let fallback = '';
        if (state.svc) {
            study = studies.find((s) => s.dataset.tags.split(' ').includes(state.svc));
            label = svcName(state.svc);
            if (!study) {
                fallback = all
                    ? `No case study for ${label} yet, so here’s our top project instead.`
                    : `No case study for ${label} yet, so here’s our top ${areaLabel(state.area)} project instead.`;
            }
        }
        if (!study && !all) {
            study = studies.find((s) => s.dataset.areas.split(' ').includes(state.area));
            if (!state.svc) label = areaLabel(state.area);
        }
        if (!study) {
            study = studies[0];
            if (!state.svc) label = 'All services';
        }

        studies.forEach((s) => { s.hidden = s !== study; });
        $$('.pill[data-svc]', study).forEach((p) => p.classList.toggle('hit', p.dataset.svc === state.svc));
        // "Services delivered": every group with no area selected, otherwise just that area's
        const groups = $$('.cs-grp', study);
        const showAll = all || !groups.some((g) => g.dataset.area === state.area);
        groups.forEach((g) => { g.hidden = !showAll && g.dataset.area !== state.area; });

        chip.textContent = label;
        clearBtn.hidden = !state.svc;
        note.hidden = !fallback;
        note.textContent = fallback;
    }

    function selectService(id) {
        state.svc = id;
        cards.forEach((c) => {
            const on = c.dataset.svc === id;
            c.classList.toggle('on', on);
            c.setAttribute('aria-pressed', String(on));
        });
        renderStudy();
    }

    function selectArea(area) {
        state.area = area;
        boxes.forEach((b) => {
            const on = b.dataset.area === area;
            b.classList.toggle('on', on);
            b.setAttribute('aria-pressed', String(on));
            if (on) areaBlurb.textContent = b.dataset.blurb;
        });
        if (area === 'all') areaBlurb.textContent = allBlurb;
        areaTitle.textContent = areaLabel(area);
        renderCarousel();
        selectService(null);
    }

    // after picking an area, glide down until the service cards are fully in view
    function revealCards() {
        const head = $('.car-head').getBoundingClientRect();
        const cardsBottom = view.getBoundingClientRect().bottom;
        const target = Math.min(
            window.scrollY + cardsBottom - window.innerHeight + 24,
            window.scrollY + head.top - headerHeight() - 16, // never tuck the carousel heading under the header
        );
        if (target > window.scrollY) slowScrollTo(target);
    }

    if (view) {
        boxes.forEach((b) => b.addEventListener('click', () => {
            const picked = state.area === b.dataset.area ? 'all' : b.dataset.area; // clicking the selected tile clears it
            selectArea(picked);
            if (picked !== 'all') revealCards();
        }));
        // page so a card is fully in view (e.g. the partly visible card at the edge)
        const showCard = (card) => {
            const i = Array.from(card.parentNode.children).indexOf(card);
            const full = Math.floor(layout().per);
            const idx = state.idx[state.area];
            if (i < idx) state.idx[state.area] = i;
            else if (i >= idx + full) state.idx[state.area] = i - full + 1;
            renderCarousel();
        };
        cards.forEach((c) => c.addEventListener('click', () => {
            const picking = state.svc !== c.dataset.svc;
            selectService(picking ? c.dataset.svc : null);
            showCard(c);
            if (picking) {
                const related = $('#case-studies');
                slowScrollTo(window.scrollY + related.getBoundingClientRect().top - headerHeight());
            }
        }));
        prevBtn.addEventListener('click', () => page(-1));
        nextBtn.addEventListener('click', () => page(1));
        clearBtn.addEventListener('click', () => selectService(null));

        // keep keyboard focus on a visible card (only keyboard: paging on a mouse press would
        // slide the card out from under the pointer before the click lands)
        view.addEventListener('focusin', (e) => {
            const card = e.target.closest('.svc');
            if (!card || !card.matches(':focus-visible')) return;
            view.scrollLeft = 0;
            showCard(card);
        });

        // swipe to page on touch screens
        let touchX = null;
        view.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
        view.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(dx) > 40) page(dx < 0 ? 1 : -1);
        });

        mqMobile.addEventListener('change', renderCarousel);
        mqTablet.addEventListener('change', renderCarousel);
        renderCarousel();
    }

    /* CONTACT FORM (posts to the same mailer as the old site) */
    const form = $('#ajax-contact');
    if (!form) return;

    const msg = $('#form-messages');
    const sendBtn = $('button[type="submit"]', form);
    const radios = form.elements.seviceRequestRadios;

    const isEmail = (v) => /^[^\s@]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,}$/.test(v);

    function showMessage(text, ok) {
        msg.textContent = text;
        msg.classList.toggle('success', ok);
    }

    function done() {
        form.reset();
        showMessage('Thanks much, email sent!', true);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const message = form.elements.message.value.trim();

        const invalid = {
            name: !name || name.length > 1000,
            email: !isEmail(email),
            message: !message,
        };
        Object.keys(invalid).forEach((key) => {
            form.elements[key].setAttribute('aria-invalid', String(invalid[key]));
            $(`#${key}-err`).hidden = !invalid[key];
        });
        const firstBad = Object.keys(invalid).find((key) => invalid[key]);
        if (firstBad) {
            form.elements[firstBad].focus();
            return;
        }

        const data = { name, email, seviceRequestRadios: radios.value };
        data.message = message;

        sendBtn.disabled = true;
        showMessage('', false);
        try {
            const res = await fetch(form.action, {
                method: 'POST',
                headers: {
                    Accept: 'application/json; charset=utf-8',
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`Mailer responded ${res.status}`);
            done();
        } catch (err) {
            console.error(err);
            showMessage('Something went wrong!', false);
        } finally {
            sendBtn.disabled = false;
        }
    });
})();
