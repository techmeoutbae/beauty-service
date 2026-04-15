const availableTimes = ['9:00 AM','10:15 AM','11:30 AM','1:00 PM','2:15 PM','3:30 PM','5:00 PM'];
const timeSlotsEl = document.getElementById('timeSlots');
const selectedTimeInput = document.getElementById('selectedTime');
const bookingForm = document.getElementById('bookingForm');
const bookingMessage = document.getElementById('bookingMessage');
const bookingSummary = document.getElementById('bookingSummary');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const appointmentDate = document.getElementById('appointmentDate');

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

function updateSummary() {
  if (!bookingSummary || !bookingForm) return;
  const data = Object.fromEntries(new FormData(bookingForm).entries());
  bookingSummary.innerHTML = `
    <h2>Booking summary</h2>
    <p><strong>Name:</strong> ${data.fullName || '—'}</p>
    <p><strong>Provider:</strong> ${data.provider || '—'}</p>
    <p><strong>Service:</strong> ${data.service || '—'}</p>
    <p><strong>Date:</strong> ${data.date || '—'}</p>
    <p><strong>Time:</strong> ${data.time || '—'}</p>
    <p><strong>Deposit:</strong> $${data.deposit || '—'}</p>
    <p><strong>Add-on:</strong> ${data.addon || 'None'}</p>
    <p class="form-note">Demo note: on launch, this summary should sync with Stripe Checkout, CRM, and automated reminders.</p>
  `;
}

function validateBookingForm(data) {
  return data.fullName && data.email && data.phone && data.provider && data.service && data.date && data.time && data.deposit && data.policy;
}

if (bookingForm) {
  bookingForm.addEventListener('input', updateSummary);
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
updateSummary();
