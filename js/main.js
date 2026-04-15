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

const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(leadForm).entries());
    localStorage.setItem('beautyDemoLead', JSON.stringify({ ...data, submittedAt: new Date().toISOString() }));
    const message = document.getElementById('leadFormMessage');
    if (message) message.textContent = 'Inquiry saved in demo storage. Replace this with CRM or email integration on launch.';
    leadForm.reset();
  });
}
