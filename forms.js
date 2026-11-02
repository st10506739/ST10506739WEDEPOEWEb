var CONTACT_RECIPIENT = 'herfoundationsa@yahoo.com';

var NAME_PATTERN = /^[A-Za-z\u00C0-\u024F' -]{2,60}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var PHONE_PATTERN = /^(\+27|0)[0-9]{9}$/;

function wrapperOf(el) { return el.closest('.field') || el.closest('fieldset'); }

function showError(el, message) {
  var wrap = wrapperOf(el);
  wrap.classList.add('has-error');
  wrap.querySelector('.field-error').textContent = message;
  el.setAttribute('aria-invalid', 'true');
}
function clearError(el) {
  var wrap = wrapperOf(el);
  wrap.classList.remove('has-error');
  el.removeAttribute('aria-invalid');
}

function checkName(v) {
  var t = v.trim();
  if (!t) return 'Enter your full name.';
  if (t.length < 2) return 'Your name is too short. Use at least 2 characters.';
  if (t.length > 60) return 'Your name is too long. Use 60 characters or fewer.';
  return NAME_PATTERN.test(t) ? '' : 'Your name can only contain letters, spaces, hyphens and apostrophes (no numbers or symbols).';
}
function checkEmail(v) {
  var t = v.trim();
  if (!t) return 'Enter your email address.';
  if (t.indexOf('@') === -1) return 'Your email address is missing the @ symbol. Use the format name@example.com.';
  if (!EMAIL_PATTERN.test(t)) return 'That email address looks incomplete. Use the format name@example.com.';
  return '';
}
function checkPhone(v, required) {
  var cleaned = v.replace(/[\s-]/g, '');
  if (!cleaned) return required ? 'Enter your phone number.' : '';
  if (/[^0-9+]/.test(cleaned)) return 'Your phone number can only contain digits, spaces, hyphens and a leading +.';
  return PHONE_PATTERN.test(cleaned) ? '' : 'Enter a South African number with 10 digits starting with 0 (082 123 4567) or +27 followed by 9 digits (+27 82 123 4567).';
}
function checkSelect(v, what) { return v ? '' : 'Choose ' + what + '.'; }

function applyCheck(el, message) {
  if (message) { showError(el, message); return false; }
  clearError(el);
  return true;
}

function liveValidate(el, checkFn) {
  ['blur', 'input', 'change'].forEach(function (evt) {
    el.addEventListener(evt, function () {
      if (evt === 'input' && !wrapperOf(el).classList.contains('has-error')) return;
      applyCheck(el, checkFn());
    });
  });
}

function focusFirstError(form) {
  var bad = form.querySelector('[aria-invalid="true"]');
  if (bad) bad.focus();
}

function labelOf(el) {
  var wrap = wrapperOf(el);
  var node = wrap && (wrap.tagName === 'FIELDSET' ? wrap.querySelector('legend') : wrap.querySelector('label'));
  if (!node) return 'This field';
  var clone = node.cloneNode(true);
  clone.querySelectorAll('.hint').forEach(function (h) { h.remove(); });
  if (!clone.textContent.trim() || el.type === 'checkbox' && el.id === 'enq-consent') return 'Consent';
  return clone.textContent.trim();
}

function showErrorSummary(form) {
  var box = form.previousElementSibling;
  if (!box || !box.classList.contains('error-summary')) {
    box = document.createElement('div');
    box.className = 'error-summary';
    box.setAttribute('role', 'alert');
    box.setAttribute('tabindex', '-1');
    form.parentNode.insertBefore(box, form);
  }
  var bad = form.querySelectorAll('[aria-invalid="true"]');
  box.textContent = '';
  var h = document.createElement('h3');
  h.textContent = bad.length === 1 ? 'Please fix 1 problem before sending' : 'Please fix ' + bad.length + ' problems before sending';
  var ul = document.createElement('ul');
  bad.forEach(function (el) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + (el.id || '');
    a.textContent = labelOf(el) + ': ' + wrapperOf(el).querySelector('.field-error').textContent;
    a.addEventListener('click', function (ev) { ev.preventDefault(); el.focus(); });
    li.appendChild(a);
    ul.appendChild(li);
  });
  box.append(h, ul);
  box.classList.remove('is-hidden');
  box.focus();
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideErrorSummary(form) {
  var box = form.previousElementSibling;
  if (box && box.classList.contains('error-summary')) box.classList.add('is-hidden');
}

function successNotice(text) {
  var p = document.createElement('p');
  p.className = 'success-notice';
  p.setAttribute('role', 'status');
  p.textContent = '\u2713 ' + text;
  return p;
}

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('enquiry-form');
  if (form) initEnquiry(form);
  var contact = document.getElementById('contact-form');
  if (contact) initContact(contact);
});

function initEnquiry(form) {
  var f = form.elements;
  var volunteerBox = document.getElementById('volunteer-fields');
  var sponsorBox = document.getElementById('sponsor-fields');
  var result = document.getElementById('enquiry-result');

    function toggleType() {
    var type = form.querySelector('input[name="enquiryType"]:checked');
    var isVolunteer = type && type.value === 'volunteer';
    var isSponsor = type && type.value === 'sponsor';
    volunteerBox.classList.toggle('is-hidden', !isVolunteer);
    sponsorBox.classList.toggle('is-hidden', !isSponsor);
    volunteerBox.querySelectorAll('input, select').forEach(function (c) { c.disabled = !isVolunteer; });
    sponsorBox.querySelectorAll('input, select').forEach(function (c) { c.disabled = !isSponsor; });
  }
  form.querySelectorAll('input[name="enquiryType"]').forEach(function (r) { r.addEventListener('change', toggleType); });
  toggleType();

    var rules = {
    name: function () { return checkName(f.fullName.value); },
    email: function () { return checkEmail(f.email.value); },
    phone: function () { return checkPhone(f.phone.value, true); },
    province: function () { return checkSelect(f.province.value, 'your province'); },
    interest: function () { return checkSelect(f.interest.value, 'a way to help'); },
    hours: function () {
      var n = Number(f.hours.value);
      if (f.hours.value === '') return 'Enter how many hours a month you can give.';
      return (Number.isInteger(n) && n >= 2 && n <= 40) ? '' : 'Enter a whole number from 2 to 40.';
    },
    programme: function () { return checkSelect(f.programme.value, 'a programme to sponsor'); },
    participants: function () {
      var n = Number(f.participants.value);
      if (f.participants.value === '') return 'Enter how many young women you would like to sponsor.';
      return (Number.isInteger(n) && n >= 1 && n <= 50) ? '' : 'Enter a whole number from 1 to 50.';
    },
    message: function () { return f.message.value.length > 300 ? 'Keep your note under 300 characters.' : ''; }
  };
  liveValidate(f.fullName, rules.name);
  liveValidate(f.email, rules.email);
  liveValidate(f.phone, rules.phone);
  liveValidate(f.province, rules.province);
  liveValidate(f.interest, rules.interest);
  liveValidate(f.hours, rules.hours);
  liveValidate(f.programme, rules.programme);
  liveValidate(f.participants, rules.participants);
  liveValidate(f.message, rules.message);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var ok = true;
    ok = applyCheck(f.fullName, rules.name()) && ok;
    ok = applyCheck(f.email, rules.email()) && ok;
    ok = applyCheck(f.phone, rules.phone()) && ok;
    ok = applyCheck(f.province, rules.province()) && ok;
    ok = applyCheck(f.message, rules.message()) && ok;

    var type = form.querySelector('input[name="enquiryType"]:checked');
    var firstRadio = form.querySelector('input[name="enquiryType"]');
    if (!type) { showError(firstRadio, 'Choose whether you want to volunteer or sponsor.'); ok = false; }
    else { clearError(firstRadio); }

    if (type && type.value === 'volunteer') {
      ok = applyCheck(f.interest, rules.interest()) && ok;
      ok = applyCheck(f.hours, rules.hours()) && ok;
      var days = form.querySelectorAll('input[name="availability"]:checked');
      var firstDay = form.querySelector('input[name="availability"]');
      if (!days.length) { showError(firstDay, 'Tick at least one time that suits you.'); ok = false; }
      else { clearError(firstDay); }
    }
    if (type && type.value === 'sponsor') {
      ok = applyCheck(f.programme, rules.programme()) && ok;
      ok = applyCheck(f.participants, rules.participants()) && ok;
    }
    if (!f.consent.checked) { showError(f.consent, 'Tick the box so we can contact you about this enquiry.'); ok = false; }
    else { clearError(f.consent); }

    if (!ok) {
      result.classList.add('is-hidden');
      showErrorSummary(form);
      return;
    }
    hideErrorSummary(form);

        var rates = await loadRates();
    showEnquiryResponse(result, form, type.value, rates);
    form.reset();
    toggleType();
  });
}

async function loadRates() {
  var fallback = {
    programmes: {
      employment: { label: 'Employment pathway', perPerson: 2500 },
      business: { label: 'Entrepreneurship pathway', perPerson: 3500 },
      full: { label: 'Employment and Entrepreneurship pathways', perPerson: 5500 }
    },
    volunteerInterests: {
      mentoring: 'mentoring a young woman', workshops: 'co-facilitating workshops',
      events: 'supporting events and networking evenings', admin: 'admin and communications'
    }
  };
  try {
    var response = await fetch('data/enquiry-rates.json');
    if (!response.ok) throw new Error('Rates file not found');
    return await response.json();
  } catch (err) {
    console.warn('Using built-in rates:', err.message);
    return fallback;
  }
}

function rand(n) { return 'R' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function showEnquiryResponse(box, form, type, rates) {
  var f = form.elements;
  var first = f.fullName.value.trim().split(/\s+/)[0];
  box.textContent = '';
  box.classList.remove('is-hidden');

  var h = document.createElement('h3');
  h.textContent = 'Thank you, ' + first;
  var lines = [];
  var big = document.createElement('p');
  big.className = 'big';

  if (type === 'sponsor') {
    var prog = rates.programmes[f.programme.value];
    var n = Number(f.participants.value);
    big.textContent = rand(prog.perPerson * n);
    lines.push('Estimated sponsorship for ' + n + (n === 1 ? ' young woman' : ' young women') +
      ' on the ' + prog.label + ' (' + rand(prog.perPerson) + ' each).');
    lines.push('Our team will email ' + f.email.value.trim() + ' to confirm availability and how to pay.');
  } else {
    var hours = Number(f.hours.value);
    var days = Array.prototype.map.call(form.querySelectorAll('input[name="availability"]:checked'), function (c) { return c.value; });
    big.textContent = (hours * 12) + ' hours a year';
    lines.push('You offered ' + hours + ' hours a month for ' + rates.volunteerInterests[f.interest.value] +
      ', available on ' + days.join(', ').toLowerCase() + '.');
    lines.push('We have volunteer roles in that area. Our team will email ' + f.email.value.trim() + ' to match you with a programme.');
  }

  box.append(successNotice('Your enquiry was submitted successfully.'), h, big);
  lines.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; box.appendChild(p); });
  box.setAttribute('tabindex', '-1');
  box.focus();
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initContact(form) {
  var f = form.elements;
  var counter = document.getElementById('message-count');
  var previewBox = document.getElementById('email-output');
  var MAX = 500, MIN = 20;

  var rules = {
    name: function () { return checkName(f.fullName.value); },
    email: function () { return checkEmail(f.email.value); },
    phone: function () { return checkPhone(f.phone.value, false); },
    type: function () { return checkSelect(f.messageType.value, 'the type of message'); },
    subject: function () {
      var v = f.subject.value.trim();
      if (!v) return 'Enter a subject.';
      return (v.length >= 3 && v.length <= 80) ? '' : 'Use 3 to 80 characters for the subject.';
    },
    message: function () {
      var len = f.message.value.trim().length;
      if (!len) return 'Write your message.';
      if (len < MIN) return 'Write at least ' + MIN + ' characters so we can help (you have ' + len + ').';
      return len > MAX ? 'Keep your message to ' + MAX + ' characters or fewer.' : '';
    }
  };
  liveValidate(f.fullName, rules.name);
  liveValidate(f.email, rules.email);
  liveValidate(f.phone, rules.phone);
  liveValidate(f.messageType, rules.type);
  liveValidate(f.subject, rules.subject);
  liveValidate(f.message, rules.message);

  f.message.addEventListener('input', function () {
    counter.textContent = f.message.value.length + ' / ' + MAX + ' characters';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ok = applyCheck(f.fullName, rules.name()) && ok;
    ok = applyCheck(f.email, rules.email()) && ok;
    ok = applyCheck(f.phone, rules.phone()) && ok;
    ok = applyCheck(f.messageType, rules.type()) && ok;
    ok = applyCheck(f.subject, rules.subject()) && ok;
    ok = applyCheck(f.message, rules.message()) && ok;
    if (!ok) { previewBox.classList.add('is-hidden'); showErrorSummary(form); return; }
    hideErrorSummary(form);

        var subject = 'Website message (' + f.messageType.value + '): ' + f.subject.value.trim();
    var body = [
      'Hello Her Foundation team,', '',
      f.message.value.trim(), '',
      '--- Contact details ---',
      'Name: ' + f.fullName.value.trim(),
      'Email: ' + f.email.value.trim(),
      'Phone: ' + (f.phone.value.trim() || 'Not provided'),
      'Message type: ' + f.messageType.value
    ].join('\n');

    document.getElementById('email-to').textContent = CONTACT_RECIPIENT;
    document.getElementById('email-subject').textContent = subject;
    document.getElementById('email-body').textContent = body;
    document.getElementById('send-email').href =
      'mailto:' + CONTACT_RECIPIENT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    var old = previewBox.querySelector('.success-notice');
    if (old) old.remove();
    previewBox.insertBefore(successNotice('Your message was submitted successfully. Press "Send email" below to send it from your email app.'), previewBox.firstChild);
    previewBox.classList.remove('is-hidden');
    previewBox.setAttribute('tabindex', '-1');
    previewBox.focus();
    previewBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
