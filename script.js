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

  const notifications = [
    { text: 'Через 3 дня — срок уплаты налогов. Включить автосписание?', type: 'tax' },
    { text: 'Доступна новая льгота для МСП в вашем регионе.', type: 'benefit' },
    { text: 'Подтвердите операции выше 1 000 000 ₽ за неделю.', type: 'security' }
  ];
  const notUl = document.getElementById('notifications');
  notifications.forEach(n => {
    const li = document.createElement('li');
    li.textContent = n.text;
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
    document.body.style.overflow = '';
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
    document.body.style.overflow = 'hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
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
  initOffice();
  initVault();
  initCommunity();
  initCalculator();
  initBurger();
});


