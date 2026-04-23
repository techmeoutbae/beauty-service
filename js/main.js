const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(nav.classList.contains('open')));
  });
}

document.querySelectorAll('.reveal').forEach((el) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  observer.observe(el);
});

document.querySelectorAll('.range-slider').forEach((slider) => {
  const stage = slider.closest('.compare-stage');
  const after = stage?.querySelector('.compare.after');
  slider.addEventListener('input', (e) => {
    const value = e.target.value;
    if (after) after.style.clipPath = `inset(0 0 0 ${value}%)`;
    const line = stage.querySelector('.slider-line');
    if (line) line.style.left = `${value}%`;
  });
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const pageParams = new URLSearchParams(window.location.search);

const applyFormPrefill = (form) => {
  Array.from(form.elements).forEach((field) => {
    if (!field.name) return;

    const paramValue = pageParams.get(field.name);
    if (!paramValue) return;

    if (field.tagName === 'SELECT') {
      const optionExists = Array.from(field.options).some((option) => option.value === paramValue || option.text === paramValue);
      if (!optionExists) return;
    }

    field.value = paramValue;
  });
};

const leadForm = document.getElementById('leadForm');
if (leadForm) {
  applyFormPrefill(leadForm);
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(leadForm).entries());
    localStorage.setItem('beautyDemoLead', JSON.stringify({ ...data, submittedAt: new Date().toISOString() }));
    const message = document.getElementById('leadFormMessage');
    if (message) message.textContent = 'Inquiry saved in demo storage. Replace this with CRM or email integration on launch.';
    leadForm.reset();
  });
}

const bindTabs = (tabSelector, panelSelector, tabKey, panelKey) => {
  const tabs = document.querySelectorAll(tabSelector);
  const panels = document.querySelectorAll(panelSelector);
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset[tabKey];

      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset[panelKey] === target;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
    });
  });
};

bindTabs('[data-directory-tab]', '[data-directory-panel]', 'directoryTab', 'directoryPanel');
bindTabs('[data-provider-tab]', '[data-provider-panel]', 'providerTab', 'providerPanel');
bindTabs('[data-plan-tab]', '[data-plan-panel]', 'planTab', 'planPanel');

const scrollServiceSlider = (sliderName, direction) => {
  const slider = document.querySelector(`[data-slider="${sliderName}"]`);
  if (!slider) return;

  const firstCard = slider.firstElementChild;
  const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 300;
  slider.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
};

document.querySelectorAll('[data-slider-prev]').forEach((button) => {
  button.addEventListener('click', () => {
    scrollServiceSlider(button.dataset.sliderPrev, -1);
  });
});

document.querySelectorAll('[data-slider-next]').forEach((button) => {
  button.addEventListener('click', () => {
    scrollServiceSlider(button.dataset.sliderNext, 1);
  });
});

const bindFilters = (buttonSelector, itemSelector, buttonKey, itemKey) => {
  const filters = document.querySelectorAll(buttonSelector);
  const items = document.querySelectorAll(itemSelector);
  if (!filters.length || !items.length) return;

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const selectedCategory = filter.dataset[buttonKey];

      filters.forEach((item) => {
        const isActive = item === filter;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      items.forEach((card) => {
        const isVisible = selectedCategory === 'all' || card.dataset[itemKey] === selectedCategory;
        card.hidden = !isVisible;
      });
    });
  });
};

bindFilters('[data-service-filter]', '[data-service-category]', 'serviceFilter', 'serviceCategory');
bindFilters('[data-gallery-filter]', '[data-gallery-card]', 'galleryFilter', 'galleryCategory');

const initialServiceCategory = pageParams.get('category');
if (initialServiceCategory) {
  const matchingServiceFilter = Array.from(document.querySelectorAll('[data-service-filter]')).find((button) => button.dataset.serviceFilter === initialServiceCategory);
  if (matchingServiceFilter) matchingServiceFilter.click();
}

document.querySelectorAll('[data-service-category]').forEach((card) => {
  const bookUrl = card.dataset.bookUrl;
  if (!bookUrl) return;

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    window.location.href = bookUrl;
  });

  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    window.location.href = bookUrl;
  });

  card.tabIndex = 0;
  card.setAttribute('role', 'link');
});
