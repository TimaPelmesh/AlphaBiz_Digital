// Mock data generation and simple interactivity for the prototype

const fmt = new Intl.NumberFormat('ru-RU');
const fmtCurrency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

function nowIso() { return new Date().toLocaleString('ru-RU'); }

function initDashboard() {
  const turnover = 8420000; // оборот за 30 дней
  const taxes = 356000; // налоги к оплате
  const flow = 1240000; // текущий cash flow
  document.getElementById('turnoverValue').textContent = fmtCurrency.format(turnover);
  document.getElementById('turnoverUpdated').textContent = nowIso();
  document.getElementById('taxesDue').textContent = fmtCurrency.format(taxes);
  document.getElementById('cashFlow').textContent = fmtCurrency.format(flow);
  // demo badges and KPI emphasis
  const turnoverBadge = document.getElementById('kpiTurnoverBadge');
  const taxesBadge = document.getElementById('kpiTaxesBadge');
  const flowBadge = document.getElementById('kpiFlowBadge');
  const kpiCards = document.querySelectorAll('.kpi');
  if (turnoverBadge) turnoverBadge.hidden = false;
  if (taxesBadge) taxesBadge.hidden = false;
  if (flowBadge) flowBadge.hidden = false;
  if (kpiCards[0]) kpiCards[0].classList.add('positive');
  if (kpiCards[1]) kpiCards[1].classList.add('warning');
  if (kpiCards[2]) kpiCards[2].classList.add('negative');

  const notifications = [
    { text: 'Через 3 дня — срок уплаты налогов. Включить автосписание?', type: 'tax' },
    { text: 'Доступна новая льгота для МСП в вашем регионе.', type: 'benefit' },
    { text: 'Подтвердите операции выше 1 000 000 ₽ за неделю.', type: 'security' }
  ];
  const notUl = document.getElementById('notifications');
  notifications.forEach(n => {
    const li = document.createElement('li');
    li.textContent = n.text;
    li.className = `item-${n.type}`;
    notUl.appendChild(li);
  });

  const egov = [
    { title: 'Декларация УСН', status: 'Принято' },
    { title: 'Взнос в ПФР', status: 'Ожидает' },
    { title: 'Справка об отсутствии задолженностей', status: 'Готово' }
  ];
  const egovUl = document.getElementById('egovStatuses');
  egov.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.title}: ${s.status}`;
    egovUl.appendChild(li);
  });

  document.getElementById('autoDebitBtn').addEventListener('click', () => {
    alert('Автосписание включено. Мы спишем налоги в срок и пришлём подтверждение.');
  });
}

function initRegion() {
  // Mock offices and interactive map pins
  const offices = [
    { id: 'C', name: 'Центральный', address: 'ул. Ленина, 10', departments: ['Касса', 'Ипотека', 'МСП'], lead: 'Иванов И.И.', phone: '+7 (900) 111-22-33', x: 28, y: 44 },
    { id: 'N', name: 'Северный', address: 'пр-т Мира, 5', departments: ['РКО', 'Кредиты МСП'], lead: 'Петров П.П.', phone: '+7 (900) 222-33-44', x: 62, y: 24 },
    { id: 'S', name: 'Южный', address: 'ул. Победы, 21', departments: ['VIP', 'Консалтинг'], lead: 'Сидорова А.А.', phone: '+7 (900) 333-44-55', x: 70, y: 72 }
  ];
  const map = document.getElementById('mapBox');
  const tbody = document.querySelector('#officesTable tbody');
  let currentPopover = null;
  if (map) {
    offices.forEach(o => {
      const pin = document.createElement('div');
      pin.className = 'map-pin';
      pin.style.left = o.x + '%';
      pin.style.top = o.y + '%';
      pin.title = `${o.name}: ${o.address}`;
      pin.setAttribute('role', 'button');
      pin.setAttribute('tabindex', '0');
      const openPopover = () => {
        if (currentPopover) { currentPopover.remove(); currentPopover = null; }
        const pop = document.createElement('div');
        pop.className = 'map-popover';
        const tags = (o.departments || []).map(d => `<span class="tag">${d}</span>`).join(' ');
        pop.innerHTML = `<button class="close" aria-label="Закрыть"></button><h4>${o.name}</h4><p class="muted">${o.address}</p><div class="tags">${tags}</div><p class="muted">${o.lead} · ${o.phone}</p>`;
        const mapRect = map.getBoundingClientRect();
        const pinRect = pin.getBoundingClientRect();
        const relTop = pinRect.top - mapRect.top;
        const relLeft = pinRect.left - mapRect.left;
        const showBelow = relTop < 140 ? true : false;
        pop.style.left = Math.max(8, Math.min(map.clientWidth - 280, relLeft - 10)) + 'px';
        pop.style.top = (showBelow ? Math.min(map.clientHeight - 100, relTop + 16) : Math.max(8, relTop - 120)) + 'px';
        map.appendChild(pop);
        currentPopover = pop;
        const closeBtn = pop.querySelector('.close');
        closeBtn.addEventListener('click', () => { pop.remove(); currentPopover = null; });
      };
      pin.addEventListener('click', openPopover);
      pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPopover(); }
      });
      map.appendChild(pin);
    });
    document.addEventListener('click', (e) => {
      if (!currentPopover) return;
      if (map.contains(e.target) && (e.target.closest('.map-popover') || e.target.classList.contains('map-pin'))) return;
      currentPopover.remove(); currentPopover = null;
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && currentPopover) { currentPopover.remove(); currentPopover = null; }
    });
  }
  if (tbody) {
    offices.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${o.name}</td><td>${o.address}</td><td>${o.lead}</td><td>${o.phone}</td>`;
      tbody.appendChild(tr);
    });
  }
}

function buildCalendar(container) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7; // Monday=0
  const total = startWeekday + last.getDate();
  const weeks = Math.ceil(total / 7) * 7;
  container.innerHTML = '';
  for (let i = 0; i < weeks; i++) {
    const dayNum = i - startWeekday + 1;
    const cell = document.createElement('div');
    cell.className = 'day';
    if (dayNum >= 1 && dayNum <= last.getDate()) {
      cell.dataset.date = new Date(year, month, dayNum).toISOString().slice(0, 10);
      const n = document.createElement('span');
      n.className = 'num';
      n.textContent = String(dayNum);
      cell.appendChild(n);
      if (dayNum === today.getDate()) cell.classList.add('today');
    } else {
      cell.style.visibility = 'hidden';
    }
    container.appendChild(cell);
  }
}

function renderEvents(events) {
  const container = document.getElementById('calendar');
  if (!container) return;
  container.querySelectorAll('.event').forEach(e => e.remove());
  events.forEach(ev => {
    const target = container.querySelector(`.day[data-date="${ev.date}"]`);
    if (!target) return;
    const el = document.createElement('span');
    el.className = 'event' + (ev.kind === 'room' ? ' room' : '');
    el.textContent = ev.title;
    target.appendChild(el);
  });
}

function initMeetings() {
  const calendar = document.getElementById('calendar');
  if (calendar) buildCalendar(calendar);
  const meetings = [];
  const rooms = [
    { id: 'R1', name: 'Переговорная 1', booked: false },
    { id: 'R2', name: 'Переговорная 2', booked: false },
    { id: 'R3', name: 'Переговорная 3', booked: false }
  ];
  const equipment = [
    { id: 'E1', name: 'Проектор', available: true },
    { id: 'E2', name: 'Доска/флипчарт', available: true },
    { id: 'E3', name: 'Видеоконференция', available: false }
  ];

  const roomsList = document.getElementById('roomsList');
  const equipmentList = document.getElementById('equipmentList');
  const meetingsList = document.getElementById('meetingsList');

  function paintRooms() {
    if (!roomsList) return;
    roomsList.innerHTML = '';
    rooms.forEach(r => {
      const li = document.createElement('li');
      li.innerHTML = `<div class="toggle"><span>${r.name}</span><div class="switch${r.booked ? ' on' : ''}" data-id="${r.id}"></div></div>`;
      roomsList.appendChild(li);
    });
  }
  function paintEquipment() {
    if (!equipmentList) return;
    equipmentList.innerHTML = '';
    equipment.forEach(e => {
      const li = document.createElement('li');
      li.innerHTML = `<div class="toggle"><span>${e.name}</span><div class="switch${e.available ? ' on' : ''}" data-id="${e.id}" data-kind="eq"></div></div>`;
      equipmentList.appendChild(li);
    });
  }
  function paintMeetings() {
    if (!meetingsList) return;
    meetingsList.innerHTML = '';
    meetings.forEach(m => {
      const li = document.createElement('li');
      li.textContent = `${m.date} ${m.time} — ${m.title} (${m.room})`;
      if (m.notes) {
        const small = document.createElement('div');
        small.className = 'muted';
        small.textContent = m.notes;
        li.appendChild(small);
      }
      meetingsList.appendChild(li);
    });
  }

  paintRooms();
  paintEquipment();
  paintMeetings();

  // Toggle handlers
  roomsList?.addEventListener('click', (e) => {
    const s = e.target.closest('.switch');
    if (!s || s.dataset.id == null) return;
    const room = rooms.find(r => r.id === s.dataset.id);
    if (!room) return;
    room.booked = !room.booked;
    s.classList.toggle('on', room.booked);
    showToast(room.booked ? `Забронирована: ${room.name}` : `Освобождена: ${room.name}`);
  });
  equipmentList?.addEventListener('click', (e) => {
    const s = e.target.closest('.switch');
    if (!s || s.dataset.kind !== 'eq') return;
    const eq = equipment.find(x => x.id === s.dataset.id);
    if (!eq) return;
    eq.available = !eq.available;
    s.classList.toggle('on', eq.available);
    showToast(eq.available ? `${eq.name}: доступно` : `${eq.name}: недоступно`);
  });

  // Create meeting
  const createBtn = document.getElementById('createMeetingBtn');
  const titleEl = document.getElementById('meetTitle');
  const dateEl = document.getElementById('meetDate');
  const timeEl = document.getElementById('meetTime');
  const roomEl = document.getElementById('meetRoom');
  const notesEl = document.getElementById('meetNotes');
  createBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const title = (titleEl?.value || '').trim();
    const date = (dateEl?.value || '').trim();
    const time = (timeEl?.value || '').trim();
    const room = roomEl?.value || 'R1';
    const notes = (notesEl?.value || '').trim();
    if (!title || !date || !time) {
      showToast('Заполните тему, дату и время');
      return;
    }
    const event = { date, title: title.slice(0, 18), kind: 'room' };
    meetings.push({ title, date, time, room, notes });
    renderEvents([event, ...meetings.map(m => ({ date: m.date, title: m.title.slice(0, 10), kind: 'room' }))]);
    paintMeetings();
    showToast('Встреча добавлена');
    titleEl.value = '';
    notesEl.value = '';
  });
}

function initOffice() {
  const goalEl = document.getElementById('goal');
  const docsWrap = document.getElementById('docs');
  const arBtn = document.getElementById('arGuideBtn');
  const arHint = document.getElementById('arHint');

  const presets = {
    open_ip_credit: ['Заявление на регистрацию ИП', 'Паспорт', 'Заявка на кредит', 'Выписка по счёту'],
    open_ip: ['Заявление на регистрацию ИП', 'Паспорт'],
    credit: ['Заявка на кредит', 'Бизнес-план', 'Отчёт о прибылях и убытках'],
    consult_tax: ['История операций', 'Выписка по счёту']
  };

  goalEl.addEventListener('change', () => {
    docsWrap.innerHTML = '';
    const list = presets[goalEl.value] || [];
    list.forEach(d => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = d;
      docsWrap.appendChild(span);
    });
  });

  const visitForm = document.getElementById('visitForm');
  visitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const goal = goalEl.value;
    const date = (document.getElementById('date').value || '').trim();
    if (!goal) {
      showToast('Выберите цель визита');
      goalEl.focus();
      return;
    }
    if (!date) {
      showToast('Укажите дату визита');
      document.getElementById('date').focus();
      return;
    }
    showToast('Запись создана. Документы будут готовы ко времени визита.');
    visitForm.reset();
    docsWrap.innerHTML = '';
  });

  arBtn.addEventListener('click', () => {
    arHint.hidden = false;
  });
}

function initVault() {
  const btn = document.getElementById('bioAccess');
  const listEl = document.getElementById('docsList');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // Имитация биометрии WebAuthn
    setTimeout(() => {
      listEl.innerHTML = '';
      const docs = [
        { name: 'Устав компании.pdf', updated: 'вчера' },
        { name: 'Выписка ЕГРИП.pdf', updated: '3 дня назад' },
        { name: 'Договор аренды.pdf', updated: 'неделю назад' }
      ];
      docs.forEach(d => {
        const li = document.createElement('li');
        li.textContent = `${d.name} · обновлено ${d.updated}`;
        listEl.appendChild(li);
      });
    }, 400);
  });
}

function initCommunity() {
  const queryEl = document.getElementById('partnerQuery');
  const listEl = document.getElementById('partnersList');
  document.getElementById('findPartnersBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const q = (queryEl.value || '').toLowerCase();
    listEl.innerHTML = '';
    const pool = [
      { name: 'Логистический центр "Север"', tags: ['логистика'] },
      { name: 'Маркетинг Плюс', tags: ['маркетинг'] },
      { name: 'СнабСервис', tags: ['поставки'] },
      { name: 'IT‑интегратор Vektor', tags: ['интеграции', 'софт'] }
    ];
    pool
      .filter(p => !q || p.tags.join(',').includes(q) || p.name.toLowerCase().includes(q))
      .forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.name} — теги: ${p.tags.join(', ')}`;
        listEl.appendChild(li);
      });
  });

  const eventsEl = document.getElementById('eventsList');
  const events = [
    { title: 'Налоговый ликбез для самозанятых', date: '12.10.2025' },
    { title: 'Мастер‑класс: экспорт и ВЭД', date: '20.10.2025' }
  ];
  events.forEach(ev => {
    const li = document.createElement('li');
    li.textContent = `${ev.title} — ${ev.date}`;
    eventsEl.appendChild(li);
  });
}

function initCalculator() {
  const creditForm = document.getElementById('creditForm');
  const creditResult = document.getElementById('creditResult');
  const avgInput = document.getElementById('avgTurnover');
  const marginInput = document.getElementById('marginality');
  creditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const avgTurnover = Number(avgInput.value);
    const margin = Number(marginInput.value) / 100;
    if (Number.isFinite(avgTurnover) && Number.isFinite(margin)) {
      // Простая модель: лимит = 3 * (оборот * маржа)
      const limit = Math.max(0, 3 * avgTurnover * margin);
      creditResult.textContent = `Оценочный лимит: ${fmtCurrency.format(limit)}`;
      showToast('Расчёт обновлён');
    }
  });
  const recalc = () => {
    const avgTurnover = Number(avgInput.value);
    const margin = Number(marginInput.value) / 100;
    if (!Number.isFinite(avgTurnover) || !Number.isFinite(margin)) return;
    const limit = Math.max(0, 3 * avgTurnover * margin);
    creditResult.textContent = `Оценочный лимит: ${fmtCurrency.format(limit)}`;
  };
  avgInput.addEventListener('input', recalc);
  marginInput.addEventListener('input', recalc);

  const taxForm = document.getElementById('taxForm');
  const taxResult = document.getElementById('taxResult');
  const incomeInput = document.getElementById('annualIncome');
  const regionSelect = document.getElementById('region');
  taxForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const income = Number(incomeInput.value);
    const region = regionSelect.value;
    // Условная модель: ИП УСН 6% (или 4% льготно), самозанятость 6% (или 4%) до лимитов
    const ipRate = region === 'preferential' ? 0.04 : 0.06;
    const selfRate = region === 'preferential' ? 0.04 : 0.06;
    const ipTax = income * ipRate;
    const selfTax = income * selfRate;
    const better = ipTax < selfTax ? 'ИП (УСН)' : (selfTax < ipTax ? 'Самозанятость' : 'Равно');
    taxResult.textContent = `${better}. Налог при ИП: ${fmtCurrency.format(ipTax)}, при самозанятости: ${fmtCurrency.format(selfTax)}`;
    showToast('Сравнение обновлено');
  });
  const recomputeTax = () => {
    const income = Number(incomeInput.value);
    const region = regionSelect.value;
    if (!Number.isFinite(income)) return;
    const ipRate = region === 'preferential' ? 0.04 : 0.06;
    const selfRate = region === 'preferential' ? 0.04 : 0.06;
    const ipTax = income * ipRate;
    const selfTax = income * selfRate;
    const better = ipTax < selfTax ? 'ИП (УСН)' : (selfTax < ipTax ? 'Самозанятость' : 'Равно');
    taxResult.textContent = `${better}. Налог при ИП: ${fmtCurrency.format(ipTax)}, при самозанятости: ${fmtCurrency.format(selfTax)}`;
  };
  incomeInput.addEventListener('input', recomputeTax);
  regionSelect.addEventListener('change', recomputeTax);
}

function initBurger() {
  const btn = document.getElementById('burgerBtn');
  const panel = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileOverlay');
  if (!btn || !panel) return;
  const links = panel.querySelectorAll('a');
  let previouslyFocused = null;

  const focusFirstElement = () => {
    const focusables = panel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    const target = (focusables[0] || btn);
    if (target && typeof target.focus === 'function') target.focus();
  };

  const close = () => {
    panel.classList.remove('open');
    panel.hidden = true;
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('scroll-lock');
    if (overlay) { overlay.classList.remove('visible'); overlay.hidden = true; }
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    } else {
      btn.focus();
    }
  };
  const open = () => {
    previouslyFocused = document.activeElement;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('open'));
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('scroll-lock');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    if (overlay) { overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('visible')); }
    // Move focus into the panel
    setTimeout(focusFirstElement, 0);
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (panel.hidden) open(); else close();
  });
  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    const within = panel.contains(e.target) || btn.contains(e.target);
    if (!within) close();
  });

  if (overlay) {
    overlay.addEventListener('click', () => close());
  }

  // Keyboard handling: Escape to close, Tab trap within panel
  document.addEventListener('keydown', (e) => {
    if (panel.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = panel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  links.forEach(a => a.addEventListener('click', () => close()));
}

function ensureToastRoot() {
  let root = document.getElementById('toastsRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toastsRoot';
    root.className = 'toasts';
    document.body.appendChild(root);
  }
  return root;
}

function showToast(message) {
  const root = ensureToastRoot();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 250);
  }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initRegion();
  initMeetings();
  initOffice();
  initVault();
  initCommunity();
  initCalculator();
  initBurger();
});


