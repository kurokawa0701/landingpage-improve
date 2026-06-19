/* ── GAS エンドポイント ── */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzNU8bv7G9ykul7P80MJO82ddPt_kMV2GbWn0i9c8Pi4ButWoNSn1fO8fvs8Iv0YsvQ/exec';

/* ── Mobile menu ── */
const menuToggle = document.getElementById('menuToggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => document.body.classList.toggle('menu-open'));
  document.querySelectorAll('#mobilePanel a').forEach(a => {
    a.addEventListener('click', () => document.body.classList.remove('menu-open'));
  });
}

/* ── Scroll reveal ── */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('is-visible'));
}

/* ── Download modal ── */
const dlModal        = document.getElementById('download-modal');
const dlClose        = document.getElementById('download-modal-close');
const dlForm         = document.getElementById('download-form');
const dlWrapper      = document.getElementById('download-form-wrapper');
const dlSuccess      = document.getElementById('download-success');
const dlSuccessClose = document.getElementById('download-success-close');
const dlSubmitBtn    = document.getElementById('download-submit-btn');

function openDlModal(e) {
  if (e) e.preventDefault();
  dlModal.classList.add('is-active');
  document.body.classList.add('modal-open');
}

function closeDlModal() {
  dlModal.classList.remove('is-active');
  document.body.classList.remove('modal-open');
  setTimeout(() => {
    if (dlWrapper) dlWrapper.style.display = '';
    if (dlSuccess) dlSuccess.style.display = 'none';
  }, 320);
}

document.querySelectorAll('a[href="#download"]').forEach(a => a.addEventListener('click', openDlModal));
if (dlClose)        dlClose.addEventListener('click', closeDlModal);
if (dlSuccessClose) dlSuccessClose.addEventListener('click', closeDlModal);
dlModal && dlModal.addEventListener('click', e => { if (e.target === dlModal) closeDlModal(); });

if (dlForm) {
  dlForm.addEventListener('submit', e => {
    e.preventDefault();
    let firstInvalid = null;
    dlForm.querySelectorAll('[required]').forEach(el => {
      if (!el.value.trim() && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    dlSubmitBtn.disabled = true;
    dlSubmitBtn.textContent = '送信中…';
    fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(dlForm)).toString()
    })
    .then(() => {
      dlSubmitBtn.disabled = false;
      dlSubmitBtn.textContent = '資料を受け取る';
      if (dlWrapper) dlWrapper.style.display = 'none';
      if (dlSuccess) dlSuccess.style.display = 'block';
      dlForm.reset();
    })
    .catch(err => {
      console.error(err);
      alert('送信中にエラーが発生しました。再度お試しください。');
      dlSubmitBtn.disabled = false;
      dlSubmitBtn.textContent = '資料を受け取る';
    });
  });
}

/* ── Contact modal ── */
const modal        = document.getElementById('contact-modal');
const modalClose   = document.getElementById('modal-close');
const form         = document.getElementById('contact-form');
const formWrapper  = document.getElementById('contact-form-wrapper');
const successBox   = document.getElementById('contact-success');
const successClose = document.getElementById('success-close-btn');
const submitBtn    = document.getElementById('submit-btn');

function openModal(e) {
  if (e) e.preventDefault();
  document.body.classList.remove('menu-open');
  modal.classList.add('is-active');
  document.body.classList.add('modal-open');
}

function closeModal() {
  modal.classList.remove('is-active');
  document.body.classList.remove('modal-open');
  setTimeout(() => {
    if (formWrapper) formWrapper.style.display = '';
    if (successBox)  successBox.style.display  = 'none';
  }, 320);
}

document.querySelectorAll('a[href="#contact"]').forEach(a => {
  a.addEventListener('click', openModal);
});

if (modalClose)   modalClose.addEventListener('click', closeModal);
if (successClose) successClose.addEventListener('click', closeModal);
modal && modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) closeModal();
});

/* ── Contact form → GAS ── */
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach(el => {
      const val = el.type === 'checkbox' ? el.checked : el.value.trim();
      if (!val && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中…';
    const showSuccess = () => {
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
      if (formWrapper) formWrapper.style.display = 'none';
      if (successBox)  successBox.style.display  = 'block';
      form.reset();
    };
    fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    })
    .then(showSuccess)
    .catch(err => {
      console.error(err);
      alert('送信中にエラーが発生しました。再度お試しください。');
      submitBtn.disabled = false;
      submitBtn.textContent = '送信する';
    });
  });
}
