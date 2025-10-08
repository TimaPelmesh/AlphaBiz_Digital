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
  const mapBox = document.getElementById('mapBox');
  const officesList = document.getElementById('officesList');
  if (!mapBox || !officesList) return;

  const offices = [
    { 
      id: 'O1', 
      name: 'Центральный офис', 
      address: 'ул. Тверская, 12, стр. 1, Москва', 
      lead: 'Анна Петрова', 
      phone: '+7 (495) 123-45-67', 
      x: 35, 
      y: 45,
      services: ['Кредиты', 'ИП', 'Консультации'],
      workingHours: '9:00 - 21:00'
    },
    { 
      id: 'O2', 
      name: 'Филиал "Арбат"', 
      address: 'ул. Арбат, 25, Москва', 
      lead: 'Михаил Сидоров', 
      phone: '+7 (495) 234-56-78', 
      x: 25, 
      y: 35,
      services: ['ИП', 'Налоги'],
      workingHours: '10:00 - 20:00'
    },
    { 
      id: 'O3', 
      name: 'Филиал "Красная Площадь"', 
      address: 'Красная площадь, 1, Москва', 
      lead: 'Елена Козлова', 
      phone: '+7 (495) 345-67-89', 
      x: 45, 
      y: 55,
      services: ['VIP-обслуживание', 'Кредиты'],
      workingHours: '8:00 - 22:00'
    },
    { 
      id: 'O4', 
      name: 'Филиал "Китай-город"', 
      address: 'ул. Ильинка, 4, Москва', 
      lead: 'Дмитрий Волков', 
      phone: '+7 (495) 456-78-90', 
      x: 55, 
      y: 65,
      services: ['Бизнес-кредиты', 'Консультации'],
      workingHours: '9:00 - 19:00'
    },
    { 
      id: 'O5', 
      name: 'Филиал "Тверская"', 
      address: 'Тверская ул., 15, Москва', 
      lead: 'Ольга Морозова', 
      phone: '+7 (495) 567-89-01', 
      x: 65, 
      y: 25,
      services: ['ИП', 'Самозанятость'],
      workingHours: '9:30 - 18:30'
    }
  ];

  function paintMap() {
    mapBox.innerHTML = '';
    
    // Добавляем фоновые элементы (дома и дороги)
    addMapBackground();
    
    // Добавляем маркеры офисов
    offices.forEach((office, index) => {
      const pin = document.createElement('div');
      pin.className = 'map-pin';
      pin.style.left = office.x + '%';
      pin.style.top = office.y + '%';
      pin.setAttribute('data-office', office.id);
      pin.setAttribute('title', `${office.name}\n${office.address}`);
      pin.setAttribute('role', 'button');
      pin.setAttribute('tabindex', '0');
      
      // Добавляем номер офиса на маркер
      const pinNumber = document.createElement('div');
      pinNumber.className = 'pin-number';
      pinNumber.textContent = index + 1;
      pin.appendChild(pinNumber);
      
      mapBox.appendChild(pin);
    });
  }

  function addMapBackground() {
    // Создаем дороги
    const roads = [
      { type: 'horizontal', top: '20%', left: '0%', width: '100%', height: '2px' },
      { type: 'horizontal', top: '40%', left: '0%', width: '100%', height: '2px' },
      { type: 'horizontal', top: '60%', left: '0%', width: '100%', height: '2px' },
      { type: 'horizontal', top: '80%', left: '0%', width: '100%', height: '2px' },
      { type: 'vertical', top: '0%', left: '20%', width: '2px', height: '100%' },
      { type: 'vertical', top: '0%', left: '40%', width: '2px', height: '100%' },
      { type: 'vertical', top: '0%', left: '60%', width: '2px', height: '100%' },
      { type: 'vertical', top: '0%', left: '80%', width: '2px', height: '100%' }
    ];

    roads.forEach(road => {
      const roadEl = document.createElement('div');
      roadEl.className = 'map-road';
      roadEl.style.position = 'absolute';
      roadEl.style.top = road.top;
      roadEl.style.left = road.left;
      roadEl.style.width = road.width;
      roadEl.style.height = road.height;
      roadEl.style.backgroundColor = '#e0e0e0';
      roadEl.style.zIndex = '1';
      mapBox.appendChild(roadEl);
    });

    // Создаем здания
    const buildings = [
      { top: '10%', left: '10%', width: '15%', height: '20%', color: '#d4d4d4' },
      { top: '30%', left: '70%', width: '20%', height: '25%', color: '#c8c8c8' },
      { top: '50%', left: '30%', width: '18%', height: '30%', color: '#d0d0d0' },
      { top: '70%', left: '60%', width: '25%', height: '15%', color: '#d8d8d8' },
      { top: '15%', left: '50%', width: '12%', height: '35%', color: '#cccccc' },
      { top: '60%', left: '10%', width: '16%', height: '25%', color: '#d6d6d6' }
    ];

    buildings.forEach(building => {
      const buildingEl = document.createElement('div');
      buildingEl.className = 'map-building';
      buildingEl.style.position = 'absolute';
      buildingEl.style.top = building.top;
      buildingEl.style.left = building.left;
      buildingEl.style.width = building.width;
      buildingEl.style.height = building.height;
      buildingEl.style.backgroundColor = building.color;
      buildingEl.style.borderRadius = '2px';
      buildingEl.style.zIndex = '1';
      mapBox.appendChild(buildingEl);
    });
  }

  function paintOffices() {
    officesList.innerHTML = '';
    offices.forEach((office, index) => {
      const card = document.createElement('div');
      card.className = 'office-card';
      card.innerHTML = `
        <div class="office-header">
          <div class="office-number">${index + 1}</div>
          <div class="office-name">${office.name}</div>
        </div>
        <div class="office-address">${office.address}</div>
        <div class="office-services">
          ${office.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
        </div>
        <div class="office-contact">
          <div class="office-lead">${office.lead}</div>
          <a href="tel:${office.phone}" class="office-phone">${office.phone}</a>
        </div>
        <div class="office-hours">${office.workingHours}</div>
      `;
      officesList.appendChild(card);
    });
  }

  let currentPopover = null;

  paintMap();
  paintOffices();

  // Map pin interactions
  mapBox.addEventListener('click', (e) => {
    const pin = e.target.closest('.map-pin');
    if (!pin) return;
    
    const officeId = pin.getAttribute('data-office');
    const office = offices.find(o => o.id === officeId);
    if (!office) return;

    // Удаляем существующие попапы
    if (currentPopover) {
      currentPopover.remove();
      currentPopover = null;
    }

    // Create popover
    const popover = document.createElement('div');
    popover.className = 'map-popover';
    popover.innerHTML = `
      <button class="close" aria-label="Закрыть">&times;</button>
      <h4>${office.name}</h4>
      <p class="muted">${office.address}</p>
      <div class="popover-services">
        ${office.services.map(service => `<span class="tag">${service}</span>`).join('')}
      </div>
      <div class="popover-contact">
        <div><strong>Руководитель:</strong> ${office.lead}</div>
        <div><strong>Телефон:</strong> <a href="tel:${office.phone}">${office.phone}</a></div>
        <div><strong>Часы работы:</strong> ${office.workingHours}</div>
      </div>
    `;
    
    // Position popover
    const mapRect = mapBox.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    const relTop = pinRect.top - mapRect.top;
    const relLeft = pinRect.left - mapRect.left;
    const showBelow = relTop < 140;
    
    popover.style.left = Math.max(8, Math.min(mapBox.clientWidth - 280, relLeft - 10)) + 'px';
    popover.style.top = (showBelow ? Math.min(mapBox.clientHeight - 100, relTop + 16) : Math.max(8, relTop - 120)) + 'px';
    
    mapBox.appendChild(popover);
    currentPopover = popover;
    
    const closeBtn = popover.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      popover.remove();
      currentPopover = null;
    });
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (popover.parentElement) {
        popover.remove();
        currentPopover = null;
      }
    }, 8000);
  });

  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    if (!currentPopover) return;
    if (mapBox.contains(e.target) && (e.target.closest('.map-popover') || e.target.classList.contains('map-pin'))) return;
    currentPopover.remove();
    currentPopover = null;
  });

  // Close popover on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentPopover) {
      currentPopover.remove();
      currentPopover = null;
    }
  });
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
  const meetingsList = document.getElementById('meetingsList');
  const addBtn = document.getElementById('addMeetingBtn');
  const modal = document.getElementById('meetingModal');
  const closeBtn = document.getElementById('closeMeetingModal');
  const cancelBtn = document.getElementById('cancelMeetingBtn');
  const form = document.getElementById('meetingForm');
  const modalTitle = document.getElementById('modalTitle');
  const totalMeetings = document.getElementById('totalMeetings');
  const weekMeetings = document.getElementById('weekMeetings');
  
  let meetings = [];
  let editingId = null;

  function renderMeetings() {
    if (!meetingsList) return;
    meetingsList.innerHTML = '';
    meetings.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    meetings.forEach((meeting) => {
      const li = document.createElement('li');
      li.className = 'meeting-item';
      li.innerHTML = `
        <div class="meeting-info">
          <div class="meeting-title">${meeting.title}</div>
          <div class="meeting-details">
            ${meeting.date} в ${meeting.time}
            ${meeting.rooms.length ? ` • ${meeting.rooms.join(', ')}` : ''}
            ${meeting.equipment.length ? ` • ${meeting.equipment.join(', ')}` : ''}
          </div>
          ${meeting.notes ? `<div class="meeting-details">${meeting.notes}</div>` : ''}
        </div>
        <div class="meeting-actions">
          <button class="btn" onclick="editMeeting(${meeting.id})">Изменить</button>
          <button class="btn" onclick="deleteMeeting(${meeting.id})" style="color: #dc2626;">Удалить</button>
        </div>
      `;
      meetingsList.appendChild(li);
    });
    
    updateStats();
  }

  function updateStats() {
    if (totalMeetings) totalMeetings.textContent = meetings.length;
    
    if (weekMeetings) {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekCount = meetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= weekStart && meetingDate <= weekEnd;
      }).length;
      
      weekMeetings.textContent = weekCount;
    }
  }

  function openModal(meeting = null) {
    if (!modal) return;
    
    editingId = meeting ? meeting.id : null;
    if (modalTitle) modalTitle.textContent = meeting ? 'Изменить встречу' : 'Добавить встречу';
    
    if (meeting) {
      document.getElementById('meetTitle').value = meeting.title;
      document.getElementById('meetDate').value = meeting.date;
      document.getElementById('meetTime').value = meeting.time;
      document.getElementById('meetNotes').value = meeting.notes || '';
      
      // Reset switches
      document.querySelectorAll('.switch').forEach(s => s.classList.remove('on'));
      
      // Set selected rooms
      meeting.rooms.forEach(roomId => {
        const switchEl = document.querySelector(`[data-id="${roomId}"]`);
        if (switchEl) switchEl.classList.add('on');
      });
      
      // Set selected equipment
      meeting.equipment.forEach(eqId => {
        const switchEl = document.querySelector(`[data-id="${eqId}"]`);
        if (switchEl) switchEl.classList.add('on');
      });
    } else {
      if (form) form.reset();
      document.querySelectorAll('.switch').forEach(s => s.classList.remove('on'));
    }
    
    modal.hidden = false;
    modal.style.display = 'flex';
    document.body.classList.add('scroll-lock');
  }

  function closeModal() {
    if (!modal) return;
    
    // Скрываем модальное окно
    modal.hidden = true;
    modal.style.display = 'none';
    
    // Убираем блокировку скролла
    document.body.classList.remove('scroll-lock');
    
    // Сбрасываем форму
    if (form) {
      form.reset();
    }
    
    // Сбрасываем переключатели
    document.querySelectorAll('.switch').forEach(s => s.classList.remove('on'));
    
    // Сбрасываем ID редактирования
    editingId = null;
    
    console.log('Modal closed'); // Для отладки
  }

  function saveMeeting() {
    const title = document.getElementById('meetTitle')?.value?.trim();
    const date = document.getElementById('meetDate')?.value;
    const time = document.getElementById('meetTime')?.value;
    const notes = document.getElementById('meetNotes')?.value?.trim();
    
    if (!title || !date || !time) {
      showToast('Заполните обязательные поля', 'error');
      return;
    }

    const selectedRooms = Array.from(document.querySelectorAll('.room-selection .switch.on')).map(r => r.dataset.id);
    const selectedEquipment = Array.from(document.querySelectorAll('.equipment-selection .switch.on')).map(e => e.dataset.id);

    const meetingData = {
      title,
      date,
      time,
      notes,
      rooms: selectedRooms,
      equipment: selectedEquipment
    };

    if (editingId) {
      const index = meetings.findIndex(m => m.id === editingId);
      if (index !== -1) {
        meetings[index] = { ...meetingData, id: editingId };
        showToast('Встреча изменена');
      }
    } else {
      const meeting = { ...meetingData, id: Date.now() };
      meetings.push(meeting);
      showToast('Встреча добавлена');
    }

    // Обновляем список встреч
    renderMeetings();
    
    // Автоматически закрываем модальное окно после сохранения
    closeModal();
  }

  // Global functions for inline handlers
  window.editMeeting = function(id) {
    const meeting = meetings.find(m => m.id === id);
    if (meeting) openModal(meeting);
  };

  window.deleteMeeting = function(id) {
    if (confirm('Удалить встречу?')) {
      meetings = meetings.filter(m => m.id !== id);
      renderMeetings();
      showToast('Встреча удалена');
    }
  };

  // Event listeners
  if (addBtn) addBtn.addEventListener('click', () => openModal());
  if (closeBtn) closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });
  if (cancelBtn) cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveMeeting();
  });

  // Close modal on overlay click
  if (modal) modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      e.preventDefault();
      closeModal();
    }
  });

  // Toggle switches
  document.addEventListener('click', (e) => {
    const s = e.target.closest('.switch');
    if (!s) return;
    s.classList.toggle('on');
  });

  // Initialize
  renderMeetings();
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
    
    // Валидация
    if (!avgInput.value || !marginInput.value) {
      showToast('Заполните все поля', 'error');
      return;
    }
    
    if (!Number.isFinite(avgTurnover) || avgTurnover <= 0) {
      showToast('Введите корректный оборот', 'error');
      return;
    }
    
    if (!Number.isFinite(margin) || margin <= 0 || margin > 1) {
      showToast('Введите корректную маржинальность (0-100%)', 'error');
      return;
    }
    
    // Простая модель: лимит = 3 * (оборот * маржа)
    const limit = Math.max(0, 3 * avgTurnover * margin);
    creditResult.textContent = `Оценочный лимит: ${fmtCurrency.format(limit)}`;
    showToast('Расчёт обновлён');
  });
  const recalc = () => {
    const avgTurnover = Number(avgInput.value);
    const margin = Number(marginInput.value) / 100;
    if (!Number.isFinite(avgTurnover) || !Number.isFinite(margin) || avgTurnover <= 0 || margin <= 0) {
      creditResult.textContent = '—';
      return;
    }
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
    
    // Валидация
    if (!incomeInput.value) {
      showToast('Введите годовой доход', 'error');
      return;
    }
    
    if (!Number.isFinite(income) || income <= 0) {
      showToast('Введите корректный доход', 'error');
      return;
    }
    
    // Правильные налоговые ставки
    let ipRate, selfRate;
    if (region === 'preferential') {
      // Льготные регионы: ИП УСН 4%, самозанятость 4%
      ipRate = 0.04;
      selfRate = 0.04;
    } else {
      // Обычные регионы: ИП УСН 6%, самозанятость 6%
      ipRate = 0.06;
      selfRate = 0.06;
    }
    
    // Дополнительные взносы для ИП (фиксированные + 1% с дохода свыше 300,000)
    const fixedContributions = 49500; // Фиксированные взносы на 2025 год
    const additionalContribution = income > 300000 ? (income - 300000) * 0.01 : 0;
    const totalIpContributions = fixedContributions + additionalContribution;
    
    const ipTax = income * ipRate + totalIpContributions;
    const selfTax = income * selfRate;
    
    let better, difference;
    if (ipTax < selfTax) {
      better = 'ИП (УСН)';
      difference = fmtCurrency.format(selfTax - ipTax);
    } else if (selfTax < ipTax) {
      better = 'Самозанятость';
      difference = fmtCurrency.format(ipTax - selfTax);
    } else {
      better = 'Равно';
      difference = '0 ₽';
    }
    
    taxResult.innerHTML = `
      <strong>${better}</strong><br>
      ИП: ${fmtCurrency.format(ipTax)} (налог: ${fmtCurrency.format(income * ipRate)}, взносы: ${fmtCurrency.format(totalIpContributions)})<br>
      Самозанятость: ${fmtCurrency.format(selfTax)}<br>
      <small>Разница: ${difference}</small>
    `;
    showToast('Сравнение обновлено');
  });
  const recomputeTax = () => {
    const income = Number(incomeInput.value);
    const region = regionSelect.value;
    
    if (!Number.isFinite(income) || income <= 0) {
      taxResult.textContent = '—';
      return;
    }
    
    let ipRate, selfRate;
    if (region === 'preferential') {
      ipRate = 0.04;
      selfRate = 0.04;
    } else {
      ipRate = 0.06;
      selfRate = 0.06;
    }
    
    const fixedContributions = 49500;
    const additionalContribution = income > 300000 ? (income - 300000) * 0.01 : 0;
    const totalIpContributions = fixedContributions + additionalContribution;
    
    const ipTax = income * ipRate + totalIpContributions;
    const selfTax = income * selfRate;
    
    let better, difference;
    if (ipTax < selfTax) {
      better = 'ИП (УСН)';
      difference = fmtCurrency.format(selfTax - ipTax);
    } else if (selfTax < ipTax) {
      better = 'Самозанятость';
      difference = fmtCurrency.format(ipTax - selfTax);
    } else {
      better = 'Равно';
      difference = '0 ₽';
    }
    
    taxResult.innerHTML = `
      <strong>${better}</strong><br>
      ИП: ${fmtCurrency.format(ipTax)} (налог: ${fmtCurrency.format(income * ipRate)}, взносы: ${fmtCurrency.format(totalIpContributions)})<br>
      Самозанятость: ${fmtCurrency.format(selfTax)}<br>
      <small>Разница: ${difference}</small>
    `;
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

function showToast(message, type = 'success') {
  const root = ensureToastRoot();
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 250);
  }, 2200);
}

// Section modal functionality

document.addEventListener('DOMContentLoaded', () => {
  // Определяем текущую страницу по URL
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Инициализируем только нужные функции для каждой страницы
  switch(currentPage) {
    case 'index.html':
    case '':
      initDashboard();
      break;
    case 'region.html':
      initRegion();
      break;
    case 'meetings.html':
      initMeetings();
      break;
    case 'office.html':
      initOffice();
      break;
    case 'vault.html':
      initVault();
      break;
    case 'community.html':
      initCommunity();
      break;
    case 'calculator.html':
      initCalculator();
      break;
  }
  
  // Burger menu инициализируется на всех страницах
  initBurger();
});


