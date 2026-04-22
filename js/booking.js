const availableTimes = ['9:00 AM','10:15 AM','11:30 AM','1:00 PM','2:15 PM','3:30 PM','5:00 PM'];
const timeSlotsEl = document.getElementById('timeSlots');
const selectedTimeInput = document.getElementById('selectedTime');
const bookingForm = document.getElementById('bookingForm');
const bookingMessage = document.getElementById('bookingMessage');
const bookingSummary = document.getElementById('bookingSummary');
const bookingSpotlight = document.getElementById('bookingSpotlight');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const appointmentDate = document.getElementById('appointmentDate');
const bookingParams = new URLSearchParams(window.location.search);

const serviceCatalog = {
  'platinum-renewal-facial': {
    category: 'Skin',
    name: 'Platinum Renewal Facial',
    duration: '75 min',
    price: '$285+',
    depositValue: '100',
    recommendedDeposit: '$100 deposit',
    description: 'A resurfacing and infusion facial built for guests booking visible skin refinement with a more private, high-touch studio finish.',
    tags: ['Barrier repair', 'Texture reset', 'Luxury finish']
  },
  'glass-skin-consultation': {
    category: 'Skin',
    name: 'Glass Skin Consultation',
    duration: '90 min',
    price: '$165',
    depositValue: '50',
    recommendedDeposit: '$50 deposit',
    description: 'A consultation-led treatment planning session for new premium clients who want a refined, long-term skin strategy.',
    tags: ['Custom plan', 'Product edit', 'Consult-first']
  },
  'architect-brow-design': {
    category: 'Lash & Brow',
    name: 'Architect Brow Design',
    duration: '60 min',
    price: '$110+',
    depositValue: '50',
    recommendedDeposit: '$50 deposit',
    description: 'Precision brow mapping, shape refinement, and tinting packaged as a higher-end detail service.',
    tags: ['Shape correction', 'Tint finish', 'Detail work']
  },
  'lift-lamination-ritual': {
    category: 'Lash & Brow',
    name: 'Lift + Lamination Ritual',
    duration: '75 min',
    price: '$145+',
    depositValue: '50',
    recommendedDeposit: '$50 deposit',
    description: 'A dual-service appointment positioned for stronger visual impact, clean definition, and premium aftercare.',
    tags: ['Lift', 'Lamination', 'Event-ready']
  },
  'sculpt-contour-session': {
    category: 'Body',
    name: 'Sculpt + Contour Session',
    duration: '50 min',
    price: '$320+',
    depositValue: '150',
    recommendedDeposit: '$150 deposit',
    description: 'A targeted body treatment framed for clearer outcomes, package pathways, and premium plan-based booking.',
    tags: ['Targeted sculpting', 'Series-ready', 'High-ticket']
  },
  'full-body-glow-ritual': {
    category: 'Body',
    name: 'Full Body Glow Ritual',
    duration: '80 min',
    price: '$260+',
    depositValue: '100',
    recommendedDeposit: '$100 deposit',
    description: 'An editorial-style body ritual built for luxury polish, seasonal glow offers, and occasion-ready prep.',
    tags: ['Glow finish', 'Seasonal ritual', 'Event prep']
  }
};

function renderTimeSlots() {
  if (!timeSlotsEl) return;
  timeSlotsEl.innerHTML = '';
  availableTimes.forEach((time) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot';
    btn.textContent = time;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach((slot) => slot.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTimeInput.value = time;
      updateSummary();
    });
    timeSlotsEl.appendChild(btn);
  });
}

const state = { month: new Date().getMonth(), year: new Date().getFullYear() };
const calendarLabel = document.getElementById('calendarLabel');
const calendarGrid = document.getElementById('calendarGrid');

function renderCalendar() {
  if (!calendarGrid || !calendarLabel) return;
  calendarGrid.innerHTML = '';
  const date = new Date(state.year, state.month, 1);
  const monthName = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  calendarLabel.textContent = monthName;

  const firstDay = new Date(state.year, state.month, 1).getDay();
  const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i += 1) {
    const blank = document.createElement('button');
    blank.className = 'calendar-day muted';
    blank.type = 'button';
    calendarGrid.appendChild(blank);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const btn = document.createElement('button');
    btn.className = 'calendar-day';
    btn.type = 'button';
    btn.textContent = day;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day').forEach((d) => d.classList.remove('active'));
      btn.classList.add('active');
      const selected = new Date(state.year, state.month, day);
      appointmentDate.value = selected.toISOString().slice(0, 10);
      updateSummary();
    });
    calendarGrid.appendChild(btn);
  }
}

function getSelectedServiceData(serviceValue) {
  return serviceCatalog[serviceValue] || null;
}

function formatAppointmentDate(value) {
  if (!value) return 'Select date';

  const parsedDate = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function renderBookingSpotlight(serviceData) {
  if (!bookingSpotlight) return;

  if (!serviceData) {
    bookingSpotlight.innerHTML = `
      <span class="pill">Service Spotlight</span>
      <h2>Select a treatment to preview the experience.</h2>
      <p>The chosen service will populate a richer profile here with duration, investment, and deposit guidance.</p>
      <div class="spotlight-meta">
        <div><strong>Duration</strong><span>Updates live</span></div>
        <div><strong>Investment</strong><span>Updates live</span></div>
        <div><strong>Deposit</strong><span>Recommended after selection</span></div>
      </div>
    `;
    return;
  }

  bookingSpotlight.innerHTML = `
    <span class="pill">${serviceData.category}</span>
    <h2>${serviceData.name}</h2>
    <p>${serviceData.description}</p>
    <div class="spotlight-meta">
      <div><strong>${serviceData.duration}</strong><span>Duration</span></div>
      <div><strong>${serviceData.price}</strong><span>Investment</span></div>
      <div><strong>${serviceData.recommendedDeposit}</strong><span>Suggested deposit</span></div>
    </div>
    <div class="spotlight-tags">${serviceData.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
  `;
}

let depositTouched = false;

function syncRecommendedDeposit(force = false) {
  if (!bookingForm) return;

  const depositField = bookingForm.elements.deposit;
  const serviceData = getSelectedServiceData(bookingForm.elements.service?.value);
  if (!depositField || !serviceData) return;

  if (force || !depositTouched) {
    depositField.value = serviceData.depositValue;
  }
}

function updateSummary() {
  if (!bookingSummary || !bookingForm) return;
  const data = Object.fromEntries(new FormData(bookingForm).entries());
  const serviceData = getSelectedServiceData(data.service);
  const selectedServiceLabel = serviceData?.name || bookingForm.elements.service?.selectedOptions?.[0]?.textContent || 'Select a service';
  const depositDisplay = data.service && data.deposit ? `$${data.deposit}` : 'Select service';
  const addonDisplay = data.addon && data.addon !== 'None' ? data.addon : 'None selected';

  renderBookingSpotlight(serviceData);

  bookingSummary.innerHTML = `
    <h2>Reservation Summary</h2>
    <div class="summary-service">
      <span class="pill">${serviceData ? serviceData.category : 'Service pending'}</span>
      <strong>${serviceData ? selectedServiceLabel : 'Select a service to preview the reservation profile.'}</strong>
      <p>${serviceData ? serviceData.description : 'Choose a treatment to see the service profile, investment context, and a more polished deposit summary before checkout.'}</p>
    </div>
    <div class="summary-list">
      <div class="summary-row"><span>Guest</span><strong>${data.fullName || 'Add client name'}</strong></div>
      <div class="summary-row"><span>Provider</span><strong>${data.provider || 'Choose provider'}</strong></div>
      <div class="summary-row"><span>Appointment</span><strong>${formatAppointmentDate(data.date)}</strong></div>
      <div class="summary-row"><span>Arrival window</span><strong>${data.time || 'Select time'}</strong></div>
      <div class="summary-row"><span>Add-on</span><strong>${addonDisplay}</strong></div>
    </div>
    <div class="summary-highlight">
      <div><span>Service Duration</span><strong>${serviceData?.duration || 'Updates after selection'}</strong></div>
      <div><span>Investment</span><strong>${serviceData?.price || 'Updates after selection'}</strong></div>
      <div><span>Deposit Today</span><strong>${depositDisplay}</strong></div>
    </div>
    <p class="form-note">Demo note: connect this summary to Stripe Checkout, reminders, and CRM automations on launch.</p>
  `;
}

function validateBookingForm(data) {
  return data.fullName && data.email && data.phone && data.provider && data.service && data.date && data.time && data.deposit && data.policy;
}

function applyBookingParams() {
  if (!bookingForm) return;

  const selectedService = bookingParams.get('service');
  const selectedProvider = bookingParams.get('provider');
  if (selectedService) {
    const serviceField = bookingForm.elements.service;
    if (serviceField && Array.from(serviceField.options).some((option) => option.value === selectedService)) {
      serviceField.value = selectedService;
      syncRecommendedDeposit(true);
    }
  }

  if (selectedProvider) {
    const providerField = bookingForm.elements.provider;
    if (providerField && Array.from(providerField.options).some((option) => option.value === selectedProvider || option.text === selectedProvider)) {
      providerField.value = selectedProvider;
    }
  }
}

if (bookingForm) {
  bookingForm.addEventListener('input', updateSummary);
  bookingForm.addEventListener('change', (event) => {
    if (event.target.name === 'deposit') {
      depositTouched = true;
    }

    if (event.target.name === 'service') {
      syncRecommendedDeposit();
    }

    updateSummary();
  });
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(bookingForm).entries());
    if (!validateBookingForm(formData)) {
      bookingMessage.textContent = 'Please complete all required booking details before reserving.';
      return;
    }
    localStorage.setItem('beautyDemoBooking', JSON.stringify({ ...formData, submittedAt: new Date().toISOString() }));
    bookingMessage.textContent = 'Demo booking saved locally. If Stripe keys and the Vercel serverless API are connected, this button can redirect to live deposit checkout.';

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) return;
      const result = await response.json();
      if (result.url) window.location.href = result.url;
    } catch (error) {
      console.warn('Stripe demo endpoint not connected yet.', error);
    }
  });
}

if (saveDraftBtn && bookingForm) {
  saveDraftBtn.addEventListener('click', () => {
    const data = Object.fromEntries(new FormData(bookingForm).entries());
    localStorage.setItem('beautyDemoBookingDraft', JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
    bookingMessage.textContent = 'Booking draft saved in local storage for demo purposes.';
  });
}

document.getElementById('prevMonth')?.addEventListener('click', () => {
  state.month -= 1;
  if (state.month < 0) { state.month = 11; state.year -= 1; }
  renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
  state.month += 1;
  if (state.month > 11) { state.month = 0; state.year += 1; }
  renderCalendar();
});

renderTimeSlots();
renderCalendar();
applyBookingParams();
updateSummary();
