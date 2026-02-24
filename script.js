document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // Mobile menu toggle
    // =============================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // =============================================
    // Header scroll effect
    // =============================================
    const header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }

    // =============================================
    // Menu search filtering (menu.html)
    // =============================================
    const searchInput = document.getElementById('menu-search');

    if (searchInput) {
        let searchQuery = '';
        let activeIndex = -1;
        let activeCategory = '';

        const allMenuItems      = document.querySelectorAll('.menu-item');
        const allCategories     = document.querySelectorAll('.menu-category');
        const categoryFilter    = document.getElementById('menu-category-filter');
        const searchClear       = document.getElementById('search-clear');
        const searchEmpty       = document.getElementById('search-empty');
        const searchEmptyTerm   = document.getElementById('search-empty-term');

        // Build suggestions list from all menu items
        const suggestions = [];
        allMenuItems.forEach(item => {
            const name = item.querySelector('.menu-item-name')?.textContent ?? '';
            const desc = item.querySelector('.menu-item-desc')?.textContent ?? '';
            const price = item.querySelector('.menu-item-price')?.textContent ?? '';
            if (name) suggestions.push({ name, desc, price, el: item });
        });

        // Create dropdown element
        const dropdown = document.createElement('ul');
        dropdown.className = 'search-dropdown';
        dropdown.setAttribute('role', 'listbox');
        dropdown.hidden = true;
        searchInput.closest('.search-input-group').appendChild(dropdown);

        function showDropdown(matches) {
            dropdown.innerHTML = '';
            activeIndex = -1;

            if (!matches.length || searchQuery === '') {
                dropdown.hidden = true;
                return;
            }

            matches.slice(0, 6).forEach((s, i) => {
                const li = document.createElement('li');
                li.className = 'search-dropdown-item';
                li.setAttribute('role', 'option');
                li.innerHTML = `<span class="sd-name">${s.name}</span><span class="sd-price">${s.price}</span>`;
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    searchInput.value = s.name;
                    filterMenu(s.name);
                    dropdown.hidden = true;
                    s.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
                dropdown.appendChild(li);
            });

            dropdown.hidden = false;
        }

        function filterMenu(query) {
            searchQuery = query.trim().toLowerCase();
            searchInput.value = query.trimStart();

            let visibleCount = 0;

            // Pass 1: show/hide whole categories by dropdown
            allCategories.forEach(cat => {
                const catKey = cat.dataset.category;
                const catVisible = activeCategory === '' || catKey === activeCategory;
                cat.style.display = catVisible ? '' : 'none';
            });

            // Pass 2: filter items within visible categories by query
            allMenuItems.forEach(item => {
                const parentCat = item.closest('.menu-category');
                if (parentCat && parentCat.style.display === 'none') return;
                const name = item.querySelector('.menu-item-name')?.textContent.toLowerCase() ?? '';
                const desc = item.querySelector('.menu-item-desc')?.textContent.toLowerCase() ?? '';
                const matches = searchQuery === '' || name.includes(searchQuery) || desc.includes(searchQuery);
                item.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            searchClear.hidden = searchQuery === '';

            if (searchQuery !== '' && visibleCount === 0) {
                searchEmptyTerm.textContent = query.trim();
                searchEmpty.hidden = false;
            } else {
                searchEmpty.hidden = true;
            }
        }

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            filterMenu(query);

            const q = query.trim().toLowerCase();
            if (q) {
                const matches = suggestions.filter(s =>
                    s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
                );
                showDropdown(matches);
            } else {
                dropdown.hidden = true;
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            const items = dropdown.querySelectorAll('.search-dropdown-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
                items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, -1);
                items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
            } else if (e.key === 'Enter' && activeIndex >= 0) {
                e.preventDefault();
                items[activeIndex]?.dispatchEvent(new MouseEvent('mousedown'));
            } else if (e.key === 'Escape') {
                searchInput.value = '';
                filterMenu('');
                dropdown.hidden = true;
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => { dropdown.hidden = true; }, 150);
        });

        searchInput.addEventListener('focus', () => {
            if (searchQuery && dropdown.children.length) dropdown.hidden = false;
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            filterMenu('');
            dropdown.hidden = true;
        });

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                activeCategory = categoryFilter.value;
                searchInput.value = '';
                dropdown.hidden = true;
                filterMenu('');
            });
        }
    }

    // =============================================
    // Contact form: validation + success state
    // =============================================
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {

        // Fix 3: declarations hoisted to top of block — crash surface is visible
        // and immediate if form-success is ever missing from the HTML
        const formSuccess  = document.getElementById('form-success');
        const formResetBtn = document.getElementById('form-reset-btn');
        let submitting = false;

        formResetBtn.addEventListener('click', () => {
            formSuccess.hidden = true;
            contactForm.hidden = false;
            document.getElementById('name').focus();
        });

        // --- Helpers ---

        function showError(id, message) {
            const input = document.getElementById(id);
            const error = document.getElementById(`${id}-error`);
            input.closest('.form-group').classList.replace('is-valid', 'is-invalid') ||
            input.closest('.form-group').classList.add('is-invalid');
            input.setAttribute('aria-invalid', 'true');
            error.textContent = message;
        }

        function showValid(id) {
            const input = document.getElementById(id);
            const error = document.getElementById(`${id}-error`);
            input.closest('.form-group').classList.replace('is-invalid', 'is-valid') ||
            input.closest('.form-group').classList.add('is-valid');
            input.setAttribute('aria-invalid', 'false');
            error.textContent = '';
        }

        function validateField(id) {
            const value = document.getElementById(id).value.trim();

            if (id === 'name') {
                if (!value)           { showError('name', 'Full name is required.'); return false; }
                if (value.length < 2) { showError('name', 'Name must be at least 2 characters.'); return false; }
                showValid('name'); return true;
            }

            if (id === 'email') {
                const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@.][^\s@]*$/;
                if (!value)               { showError('email', 'Email address is required.'); return false; }
                if (!emailRe.test(value)) { showError('email', 'Please enter a valid email address.'); return false; }
                showValid('email'); return true;
            }

            if (id === 'message') {
                if (!value)            { showError('message', 'Please write us a message before sending.'); return false; }
                if (value.length < 10) { showError('message', 'Message must be at least 10 characters.'); return false; }
                showValid('message'); return true;
            }
        }

        // --- Validate on blur; re-validate live once a field has errored ---
        ['name', 'email', 'message'].forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('blur', () => validateField(id));
            el.addEventListener('input', () => {
                if (el.closest('.form-group').classList.contains('is-invalid')) {
                    validateField(id);
                }
            });
        });

        // --- Submit ---
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (submitting) return;

            const allValid = ['name', 'email', 'message'].every(id => validateField(id));

            if (!allValid) {
                const firstInvalid = contactForm.querySelector('.is-invalid input, .is-invalid textarea');
                firstInvalid?.focus();
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalLabel = submitBtn.textContent;
            submitting = true;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            setTimeout(() => {
                contactForm.hidden = true;
                formSuccess.hidden = false;
                formSuccess.querySelector('button').focus();

                contactForm.reset();
                ['name', 'email', 'message'].forEach(id => {
                    const group = document.getElementById(id).closest('.form-group');
                    group.classList.remove('is-valid', 'is-invalid');
                    document.getElementById(`${id}-error`).textContent = '';
                });

                submitBtn.disabled = false;
                submitBtn.textContent = originalLabel;
                submitting = false;
            }, 1500);
        });
    }

});
