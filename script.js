// Mock data generation and simple interactivity for the prototype

const fmt = new Intl.NumberFormat('ru-RU');
const fmtCurrency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

function nowIso() { return new Date().toLocaleString('ru-RU'); }

// Хеширование данных для безопасности
async function hashData(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Функция для сохранения данных с хешированием
async function saveDataWithHash(key, data) {
  try {
    const hash = await hashData(data);
    const dataWithHash = {
      data: data,
      hash: hash,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(dataWithHash));
    return hash;
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    return null;
  }
}

// Функция для загрузки и проверки данных
async function loadDataWithHash(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    if (!parsed.data || !parsed.hash) return null;
    
    // Проверяем целостность данных
    const currentHash = await hashData(parsed.data);
    if (currentHash !== parsed.hash) {
      console.warn('Обнаружено повреждение данных для ключа:', key);
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    return null;
  }
}

async function initDashboard() {
  const turnover = 8420000; // оборот за 30 дней
  const taxes = 356000; // налоги к оплате
  const flow = 1240000; // текущий cash flow
  
  // Сохраняем данные с хешированием
  const dashboardData = {
    turnover: turnover,
    taxes: taxes,
    flow: flow,
    lastUpdated: nowIso()
  };
  
  await saveDataWithHash('dashboard_data', dashboardData);
  
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

async function initRegion() {
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
      x: 18, 
      y: 20,
      services: ['Кредиты', 'ИП', 'Консультации'],
      workingHours: '9:00 - 21:00'
    },
    { 
      id: 'O2', 
      name: 'Филиал "Арбат"', 
      address: 'ул. Арбат, 25, Москва', 
      lead: 'Михаил Сидоров', 
      phone: '+7 (495) 234-56-78', 
      x: 75, 
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
      x: 85, 
      y: 75,
      services: ['VIP-обслуживание', 'Кредиты'],
      workingHours: '8:00 - 22:00'
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

  let currentModal = null;

  paintMap();
  paintOffices();

  // Map pin interactions
  mapBox.addEventListener('click', (e) => {
    const pin = e.target.closest('.map-pin');
    if (!pin) return;
    
    const officeId = pin.getAttribute('data-office');
    const office = offices.find(o => o.id === officeId);
    if (!office) return;

    // Удаляем существующие модальные окна
    if (currentModal) {
      currentModal.remove();
      currentModal = null;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'office-modal-overlay';
    modal.innerHTML = `
      <div class="office-modal">
        <div class="office-modal-header">
          <h3>${office.name}</h3>
          <button class="office-modal-close" aria-label="Закрыть">&times;</button>
        </div>
        <div class="office-modal-content">
          <div class="office-info-section">
            <h4>Адрес</h4>
            <p>${office.address}</p>
          </div>
          <div class="office-info-section">
            <h4>Заведующий отделением</h4>
            <p>${office.lead}</p>
          </div>
          <div class="office-info-section">
            <h4>Номер телефона</h4>
            <p><a href="tel:${office.phone}" class="office-phone-link">${office.phone}</a></p>
          </div>
          <div class="office-info-section">
            <h4>Оказываемые услуги</h4>
            <div class="office-services-list">
              ${office.services.map(service => `<span class="office-service-tag">${service}</span>`).join('')}
            </div>
          </div>
          <div class="office-info-section">
            <h4>Часы работы</h4>
            <p>${office.workingHours}</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    currentModal = modal;
    
    const closeBtn = modal.querySelector('.office-modal-close');
    const overlay = modal.querySelector('.office-modal-overlay');
    
    closeBtn.addEventListener('click', () => {
      modal.remove();
      currentModal = null;
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        modal.remove();
        currentModal = null;
      }
    });
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
      currentModal.remove();
      currentModal = null;
    }
  });

  // Сохраняем данные офисов с хешированием
  await saveDataWithHash('offices_data', offices);
}

// Calendar state management
let currentCalendarDate = new Date();

function getStoredCalendarDate() {
  const stored = localStorage.getItem('calendarDate');
  if (stored) {
    const date = new Date(stored);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return new Date();
}

function saveCalendarDate(date) {
  localStorage.setItem('calendarDate', date.toISOString());
}

async function getStoredEvents() {
  const events = await loadDataWithHash('meetings_data');
  return events || [];
}

function buildCalendar(container) {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const today = new Date();
  
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
      const cellDate = new Date(year, month, dayNum);
      cell.dataset.date = cellDate.toISOString().slice(0, 10);
      const n = document.createElement('span');
      n.className = 'num';
      n.textContent = String(dayNum);
      cell.appendChild(n);
      
      // Check if this is today
      if (cellDate.toDateString() === today.toDateString()) {
        cell.classList.add('today');
      }
    } else {
      cell.style.visibility = 'hidden';
    }
    container.appendChild(cell);
  }
}

async function initCalendarNavigation() {
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  
  if (!monthSelect || !yearSelect || !prevBtn || !nextBtn) return;
  
  // Load saved date or use current
  currentCalendarDate = getStoredCalendarDate();
  
  // Populate month select
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  monthSelect.innerHTML = '';
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = month;
    if (index === currentCalendarDate.getMonth()) {
      option.selected = true;
    }
    monthSelect.appendChild(option);
  });
  
  // Populate year select
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = '';
  for (let year = currentYear - 2; year <= currentYear + 5; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentCalendarDate.getFullYear()) {
      option.selected = true;
    }
    yearSelect.appendChild(option);
  }
  
  // Event listeners
  monthSelect.addEventListener('change', async () => {
    currentCalendarDate.setMonth(parseInt(monthSelect.value));
    saveCalendarDate(currentCalendarDate);
    buildCalendar(document.getElementById('calendar'));
    await renderEvents();
  });
  
  yearSelect.addEventListener('change', async () => {
    currentCalendarDate.setFullYear(parseInt(yearSelect.value));
    saveCalendarDate(currentCalendarDate);
    buildCalendar(document.getElementById('calendar'));
    await renderEvents();
  });
  
  prevBtn.addEventListener('click', async () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    updateSelects();
    saveCalendarDate(currentCalendarDate);
    buildCalendar(document.getElementById('calendar'));
    await renderEvents();
  });
  
  nextBtn.addEventListener('click', async () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    updateSelects();
    saveCalendarDate(currentCalendarDate);
    buildCalendar(document.getElementById('calendar'));
    await renderEvents();
  });
  
  function updateSelects() {
    monthSelect.value = currentCalendarDate.getMonth();
    yearSelect.value = currentCalendarDate.getFullYear();
  }
}

async function renderEvents(events) {
  const container = document.getElementById('calendar');
  if (!container) return;
  container.querySelectorAll('.event').forEach(e => e.remove());
  const eventsData = events || await getStoredEvents();
  eventsData.forEach(ev => {
    const target = container.querySelector(`.day[data-date="${ev.date}"]`);
    if (!target) return;
    const el = document.createElement('span');
    el.className = 'event' + (ev.kind === 'room' ? ' room' : '');
    el.textContent = ev.title;
    target.appendChild(el);
  });
}

async function initMeetings() {
  const calendar = document.getElementById('calendar');
  if (calendar) {
    await initCalendarNavigation();
    buildCalendar(calendar);
  }
  const meetingsList = document.getElementById('meetingsList');
  const addBtn = document.getElementById('addMeetingBtn');
  const modal = document.getElementById('meetingModal');
  const closeBtn = document.getElementById('closeMeetingModal');
  const cancelBtn = document.getElementById('cancelMeetingBtn');
  const form = document.getElementById('meetingForm');
  const modalTitle = document.getElementById('modalTitle');
  const totalMeetings = document.getElementById('totalMeetings');
  const weekMeetings = document.getElementById('weekMeetings');
  
  let meetings = await getStoredEvents();
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

  async function saveMeeting() {
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

    // Сохраняем данные с хешированием
    await saveDataWithHash('meetings_data', meetings);

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

  window.deleteMeeting = async function(id) {
    if (confirm('Удалить встречу?')) {
      meetings = meetings.filter(m => m.id !== id);
      await saveDataWithHash('meetings_data', meetings);
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
  await renderEvents();
}

function initOffice() {
  const goalEl = document.getElementById('goal');
  const docsWrap = document.getElementById('docs');
  const arBtn = document.getElementById('arGuideBtn');
  const arHint = document.getElementById('arHint');
  const appointmentsList = document.getElementById('appointmentsList');

  const presets = {
    open_ip_credit: ['Заявление на регистрацию ИП', 'Паспорт', 'Заявка на кредит', 'Выписка по счёту'],
    open_ip: ['Заявление на регистрацию ИП', 'Паспорт'],
    credit: ['Заявка на кредит', 'Бизнес-план', 'Отчёт о прибылях и убытках'],
    consult_tax: ['История операций', 'Выписка по счёту']
  };

  // Данные об услугах
  const services = {
    ip: {
      name: 'Открытие ИП',
      duration: '30-45 мин',
      description: 'Полное сопровождение регистрации'
    },
    credit: {
      name: 'Кредитование',
      duration: '20-30 мин',
      description: 'Подбор и оформление кредита'
    },
    tax: {
      name: 'Налоговые консультации',
      duration: '15-25 мин',
      description: 'Помощь с налогообложением'
    },
    docs: {
      name: 'Документооборот',
      duration: '10-20 мин',
      description: 'Подготовка и подача документов'
    }
  };

  // Загружаем сохраненные записи
  let appointments = JSON.parse(localStorage.getItem('office_appointments') || '[]');

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

  // Обработка записи на услуги
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('service-btn')) {
      const serviceId = e.target.dataset.service;
      const service = services[serviceId];
      
      if (!service) return;

      // Проверяем, не записан ли уже пользователь на эту услугу
      const existingAppointment = appointments.find(apt => 
        apt.serviceId === serviceId && 
        new Date(apt.date) > new Date()
      );

      if (existingAppointment) {
        showToast('Вы уже записаны на эту услугу');
        return;
      }

      // Показываем модальное окно для выбора времени
      showServiceBookingModal(serviceId, service);
    }
  });

  // Функция показа модального окна записи
  function showServiceBookingModal(serviceId, service) {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Запись на услугу: ${service.name}</h3>
          <button class="modal-close" aria-label="Закрыть">&times;</button>
        </div>
        <div class="modal-form">
          <div class="form-row">
            <label for="serviceDate">Дата</label>
            <input type="date" id="serviceDate" required min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-row">
            <label for="serviceTime">Время</label>
            <select id="serviceTime" required>
              <option value="">Выберите время</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="12:00">12:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
              <option value="18:00">18:00</option>
            </select>
          </div>
          <div class="form-row">
            <label for="serviceNotes">Дополнительные пожелания (необязательно)</label>
            <textarea id="serviceNotes" placeholder="Опишите ваши пожелания..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn" id="cancelServiceBooking">Отмена</button>
            <button type="button" class="btn btn-primary" id="confirmServiceBooking">Записаться</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('scroll-lock');

    // Обработчики событий
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#cancelServiceBooking');
    const confirmBtn = modal.querySelector('#confirmServiceBooking');

    const closeModal = () => {
      modal.remove();
      document.body.classList.remove('scroll-lock');
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    confirmBtn.addEventListener('click', () => {
      const date = modal.querySelector('#serviceDate').value;
      const time = modal.querySelector('#serviceTime').value;
      const notes = modal.querySelector('#serviceNotes').value;

      if (!date || !time) {
        showToast('Заполните все обязательные поля', 'error');
        return;
      }

      // Создаем новую запись
      const appointment = {
        id: Date.now(),
        serviceId: serviceId,
        serviceName: service.name,
        date: date,
        time: time,
        duration: service.duration,
        notes: notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      appointments.push(appointment);
      localStorage.setItem('office_appointments', JSON.stringify(appointments));

      // Обновляем отображение
      renderAppointments();
      
      // Обновляем кнопку услуги
      updateServiceButton(serviceId, true);

      showToast('Запись успешно создана!');
      closeModal();
    });

    // Закрытие по клику на оверлей
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    });
  }

  // Функция обновления кнопки услуги
  function updateServiceButton(serviceId, isBooked) {
    const serviceItem = document.querySelector(`[data-service="${serviceId}"]`);
    const button = serviceItem.querySelector('.service-btn');
    
    if (isBooked) {
      button.textContent = 'Записано ✓';
      button.classList.add('booked');
      button.disabled = true;
    } else {
      button.textContent = 'Записаться';
      button.classList.remove('booked');
      button.disabled = false;
    }
  }

  // Функция отображения записей
  function renderAppointments() {
    if (!appointmentsList) return;

    appointmentsList.innerHTML = '';
    
    if (appointments.length === 0) {
      appointmentsList.innerHTML = '<div class="muted">У вас пока нет записей</div>';
      return;
    }

    // Сортируем записи по дате
    const sortedAppointments = appointments.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    sortedAppointments.forEach(appointment => {
      const appointmentEl = document.createElement('div');
      appointmentEl.className = 'appointment-item';
      
      const statusClass = appointment.status === 'confirmed' ? 'confirmed' : 'pending';
      const statusText = appointment.status === 'confirmed' ? 'Подтверждено' : 'Ожидает подтверждения';
      
      const appointmentDate = new Date(appointment.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      appointmentEl.innerHTML = `
        <div class="appointment-info">
          <div class="appointment-title">${appointment.serviceName}</div>
          <div class="appointment-date">${appointmentDate}, ${appointment.time}</div>
          <div class="appointment-status ${statusClass}">${statusText}</div>
          ${appointment.notes ? `<div class="appointment-notes">${appointment.notes}</div>` : ''}
        </div>
        <div class="appointment-actions">
          <button class="btn btn-sm appointment-cancel" data-id="${appointment.id}">Отменить</button>
        </div>
      `;

      appointmentsList.appendChild(appointmentEl);
    });

    // Добавляем обработчики для кнопок отмены
    appointmentsList.querySelectorAll('.appointment-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appointmentId = parseInt(e.target.dataset.id);
        if (confirm('Отменить запись?')) {
          appointments = appointments.filter(apt => apt.id !== appointmentId);
          localStorage.setItem('office_appointments', JSON.stringify(appointments));
          renderAppointments();
          
          // Обновляем кнопки услуг
          updateAllServiceButtons();
          
          showToast('Запись отменена');
        }
      });
    });
  }

  // Функция обновления всех кнопок услуг
  function updateAllServiceButtons() {
    Object.keys(services).forEach(serviceId => {
      const hasActiveAppointment = appointments.some(apt => 
        apt.serviceId === serviceId && 
        new Date(apt.date) > new Date()
      );
      updateServiceButton(serviceId, hasActiveAppointment);
    });
  }

  // Инициализация
  renderAppointments();
  updateAllServiceButtons();
}

function initVault() {
  const bioBtn = document.getElementById('bioAccess');
  const scannerFrame = document.getElementById('biometricScanner');
  const scannerOverlay = document.getElementById('scannerOverlay');
  const scannerLine = document.getElementById('scannerLine');
  const vaultContent = document.getElementById('vaultContent');
  const docsList = document.getElementById('docsList');
  const lockBtn = document.getElementById('lockVault');
  
  let isScanning = false;
  let isUnlocked = false;
  
  // Документы для отображения
  const documents = [
    { 
      name: 'Устав компании.pdf', 
      updated: 'вчера',
      icon: '📄',
      type: 'PDF',
      size: '2.3 МБ'
    },
    { 
      name: 'Выписка ЕГРИП.pdf', 
      updated: '3 дня назад',
      icon: '📋',
      type: 'PDF',
      size: '1.8 МБ'
    },
    { 
      name: 'Договор аренды.pdf', 
      updated: 'неделю назад',
      icon: '🏢',
      type: 'PDF',
      size: '3.1 МБ'
    },
    { 
      name: 'Лицензия на деятельность.pdf', 
      updated: '2 недели назад',
      icon: '📜',
      type: 'PDF',
      size: '1.2 МБ'
    },
    { 
      name: 'Справка об отсутствии задолженностей.pdf', 
      updated: 'месяц назад',
      icon: '✅',
      type: 'PDF',
      size: '0.8 МБ'
    }
  ];
  
  function startScanning() {
    if (isScanning || isUnlocked) return;
    
    isScanning = true;
    bioBtn.disabled = true;
    bioBtn.querySelector('.btn-text').textContent = 'Сканирование...';
    
    // Активируем анимацию сканирования
    scannerFrame.classList.add('scanning');
    scannerOverlay.classList.add('active');
    
    // Имитируем процесс сканирования
    setTimeout(() => {
      completeScanning();
    }, 4000);
  }
  
  function completeScanning() {
    // Останавливаем анимацию
    scannerFrame.classList.remove('scanning');
    scannerOverlay.classList.remove('active');
    
    // Скрываем кнопку и показываем контент
    bioBtn.style.display = 'none';
    vaultContent.style.display = 'block';
    
    // Загружаем документы
    loadDocuments();
    
    isScanning = false;
    isUnlocked = true;
    
    showToast('Биометрическая аутентификация успешна');
  }
  
  function loadDocuments() {
    docsList.innerHTML = '';
    
    documents.forEach((doc, index) => {
      setTimeout(() => {
        const li = document.createElement('li');
        li.className = 'document-item';
        li.style.opacity = '0';
        li.style.transform = 'translateY(20px)';
        
        li.innerHTML = `
          <div class="document-icon">${doc.icon}</div>
          <div class="document-info">
            <div class="document-name">${doc.name}</div>
            <div class="document-meta">
              ${doc.type} • ${doc.size} • обновлено ${doc.updated}
            </div>
          </div>
        `;
        
        docsList.appendChild(li);
        
        // Анимация появления
        setTimeout(() => {
          li.style.transition = 'all 0.3s ease';
          li.style.opacity = '1';
          li.style.transform = 'translateY(0)';
        }, 50);
      }, index * 150);
    });
  }
  
  function lockVault() {
    isUnlocked = false;
    vaultContent.style.display = 'none';
    bioBtn.style.display = 'flex';
    bioBtn.disabled = false;
    bioBtn.querySelector('.btn-text').textContent = 'Разблокировать сейф';
    
    // Очищаем список документов
    docsList.innerHTML = '';
    
    showToast('Сейф заблокирован');
  }
  
  // Обработчики событий
  bioBtn.addEventListener('click', (e) => {
    e.preventDefault();
    startScanning();
  });
  
  if (lockBtn) {
    lockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      lockVault();
    });
  }
  
  // Добавляем hover эффект для сканера
  scannerFrame.addEventListener('mouseenter', () => {
    if (!isScanning && !isUnlocked) {
      scannerFrame.style.borderColor = '#d1d5db';
      scannerFrame.style.transform = 'scale(1.02)';
    }
  });
  
  scannerFrame.addEventListener('mouseleave', () => {
    if (!isScanning && !isUnlocked) {
      scannerFrame.style.borderColor = '#e5e7eb';
      scannerFrame.style.transform = 'scale(1)';
    }
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
  // Инициализация табов
  const tabs = document.querySelectorAll('.calculator-tab');
  const panels = document.querySelectorAll('.calculator-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Убираем активный класс со всех табов и панелей
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      // Добавляем активный класс к выбранному табу и панели
      tab.classList.add('active');
      const targetPanel = document.getElementById(targetTab + 'Panel');
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Кредитный калькулятор
  const creditForm = document.getElementById('creditForm');
  const creditResult = document.getElementById('creditResult');
  const avgInput = document.getElementById('avgTurnover');
  const marginInput = document.getElementById('marginality');
  
  function updateCreditResult() {
    const avgTurnover = Number(avgInput.value);
    const margin = Number(marginInput.value) / 100;
    
    if (!Number.isFinite(avgTurnover) || !Number.isFinite(margin) || avgTurnover <= 0 || margin <= 0) {
      creditResult.innerHTML = `
        <div class="result-placeholder">
          <span class="result-icon">📊</span>
          <span class="result-text">Введите данные для расчета</span>
        </div>
      `;
      creditResult.classList.remove('has-result');
      return;
    }
    
    const limit = Math.max(0, 3 * avgTurnover * margin);
    const monthlyPayment = limit * 0.08; // Примерная ставка 8% годовых
    
    creditResult.innerHTML = `
      <div class="result-content">
        <div class="result-main">
          <div class="result-value">${fmtCurrency.format(limit)}</div>
          <div class="result-label">Максимальная сумма кредита</div>
        </div>
        <div class="result-details">
          <div class="result-detail">
            <span class="detail-label">Ежемесячный платеж:</span>
            <span class="detail-value">${fmtCurrency.format(monthlyPayment)}</span>
          </div>
          <div class="result-detail">
            <span class="detail-label">Ставка:</span>
            <span class="detail-value">8% годовых</span>
          </div>
        </div>
      </div>
    `;
    creditResult.classList.add('has-result');
  }
  
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
    
    updateCreditResult();
    showToast('Расчёт обновлён');
  });
  
  avgInput.addEventListener('input', updateCreditResult);
  marginInput.addEventListener('input', updateCreditResult);

  // Налоговый калькулятор
  const taxForm = document.getElementById('taxForm');
  const taxResult = document.getElementById('taxResult');
  const incomeInput = document.getElementById('annualIncome');
  const regionSelect = document.getElementById('region');
  
  function updateTaxResult() {
    const income = Number(incomeInput.value);
    const region = regionSelect.value;
    
    if (!Number.isFinite(income) || income <= 0) {
      taxResult.innerHTML = `
        <div class="result-placeholder">
          <span class="result-icon">📈</span>
          <span class="result-text">Введите данные для сравнения</span>
        </div>
      `;
      taxResult.classList.remove('has-result');
      return;
    }
    
    // Правильные налоговые ставки
    let ipRate, selfRate;
    if (region === 'preferential') {
      ipRate = 0.04;
      selfRate = 0.04;
    } else {
      ipRate = 0.06;
      selfRate = 0.06;
    }
    
    // Дополнительные взносы для ИП
    const fixedContributions = 49500;
    const additionalContribution = income > 300000 ? (income - 300000) * 0.01 : 0;
    const totalIpContributions = fixedContributions + additionalContribution;
    
    const ipTax = income * ipRate + totalIpContributions;
    const selfTax = income * selfRate;
    
    let better, difference, betterClass;
    if (ipTax < selfTax) {
      better = 'ИП (УСН)';
      difference = fmtCurrency.format(selfTax - ipTax);
      betterClass = 'ip-better';
    } else if (selfTax < ipTax) {
      better = 'Самозанятость';
      difference = fmtCurrency.format(ipTax - selfTax);
      betterClass = 'self-better';
    } else {
      better = 'Равно';
      difference = '0 ₽';
      betterClass = 'equal';
    }
    
    taxResult.innerHTML = `
      <div class="result-content">
        <div class="result-main ${betterClass}">
          <div class="result-value">${better}</div>
          <div class="result-label">Рекомендуемый вариант</div>
        </div>
        <div class="result-details">
          <div class="result-detail">
            <span class="detail-label">ИП (УСН):</span>
            <span class="detail-value">${fmtCurrency.format(ipTax)}</span>
            <div class="detail-breakdown">
              <small>Налог: ${fmtCurrency.format(income * ipRate)}</small>
              <small>Взносы: ${fmtCurrency.format(totalIpContributions)}</small>
            </div>
          </div>
          <div class="result-detail">
            <span class="detail-label">Самозанятость:</span>
            <span class="detail-value">${fmtCurrency.format(selfTax)}</span>
          </div>
          <div class="result-detail highlight">
            <span class="detail-label">Экономия:</span>
            <span class="detail-value">${difference}</span>
          </div>
        </div>
      </div>
    `;
    taxResult.classList.add('has-result');
  }
  
  taxForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const income = Number(incomeInput.value);
    
    // Валидация
    if (!incomeInput.value) {
      showToast('Введите годовой доход', 'error');
      return;
    }
    
    if (!Number.isFinite(income) || income <= 0) {
      showToast('Введите корректный доход', 'error');
      return;
    }
    
    updateTaxResult();
    showToast('Сравнение обновлено');
  });
  
  incomeInput.addEventListener('input', updateTaxResult);
  regionSelect.addEventListener('change', updateTaxResult);
}

function initSupport() {
  const supportForm = document.getElementById('supportForm');
  
  // Обработка отправки заявки
  supportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('supportEmail').value;
    const subject = document.getElementById('supportSubject').value;
    const message = document.getElementById('supportMessage').value;
    
    // Валидация
    if (!email || !subject || !message) {
      showToast('Заполните все поля', 'error');
      return;
    }
    
    // Имитация отправки заявки
    const submitBtn = supportForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      // Показываем уведомление об успешной отправке
      showToast('Заявка успешно отправлена! Номер заявки: #' + Math.floor(Math.random() * 10000), 'success');
      
      // Сбрасываем форму
      supportForm.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });

  // Мобильное диалоговое окно для техподдержки
  if (window.innerWidth <= 768) {
    initMobileSupportModal();
  }
}

function initMobileSupportModal() {
  // Создаем кнопку для открытия мобильного диалога
  const supportSection = document.getElementById('support');
  if (!supportSection) return;

  const mobileSupportBtn = document.createElement('button');
  mobileSupportBtn.className = 'btn btn-primary';
  mobileSupportBtn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 999;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    padding: 0;
    font-size: 18px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(239, 49, 36, 0.3);
    display: none;
    align-items: center;
    justify-content: center;
  `;
  mobileSupportBtn.innerHTML = '?';
  mobileSupportBtn.id = 'mobileSupportBtn';
  
  document.body.appendChild(mobileSupportBtn);

  // Показываем кнопку только на мобильных
  if (window.innerWidth <= 768) {
    mobileSupportBtn.style.display = 'flex';
  }

  // Обработчик клика
  mobileSupportBtn.addEventListener('click', showMobileSupportModal);

  // Обработчик изменения размера окна
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      mobileSupportBtn.style.display = 'flex';
    } else {
      mobileSupportBtn.style.display = 'none';
    }
  });
}

function showMobileSupportModal() {
  const modal = document.createElement('div');
  modal.className = 'mobile-support-modal';
  modal.innerHTML = `
    <div class="mobile-support-content">
      <div class="mobile-support-header">
        <h3 class="mobile-support-title">Техподдержка</h3>
        <button class="mobile-support-close">&times;</button>
      </div>
      <div class="mobile-support-body">
        <div class="mobile-support-option" data-action="email">
          <div class="mobile-support-option-icon">📧</div>
          <div class="mobile-support-option-content">
            <h4>Email поддержка</h4>
            <p>support@alphabiz.ru</p>
          </div>
        </div>
        <div class="mobile-support-option" data-action="phone">
          <div class="mobile-support-option-icon">📞</div>
          <div class="mobile-support-option-content">
            <h4>Телефон</h4>
            <p>+7 (495) 123-45-67</p>
          </div>
        </div>
        <div class="mobile-support-option" data-action="chat">
          <div class="mobile-support-option-icon">💬</div>
          <div class="mobile-support-option-content">
            <h4>Онлайн чат</h4>
            <p>Доступен 24/7</p>
          </div>
        </div>
        <div class="mobile-support-option" data-action="faq">
          <div class="mobile-support-option-icon">❓</div>
          <div class="mobile-support-option-content">
            <h4>Часто задаваемые вопросы</h4>
            <p>Быстрые ответы</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add('scroll-lock');

  // Обработчики событий
  const closeBtn = modal.querySelector('.mobile-support-close');
  const options = modal.querySelectorAll('.mobile-support-option');

  const closeModal = () => {
    modal.remove();
    document.body.classList.remove('scroll-lock');
  };

  closeBtn.addEventListener('click', closeModal);

  options.forEach(option => {
    option.addEventListener('click', () => {
      const action = option.dataset.action;
      
      switch(action) {
        case 'email':
          window.location.href = 'mailto:support@alphabiz.ru';
          break;
        case 'phone':
          window.location.href = 'tel:+74951234567';
          break;
        case 'chat':
          // Открываем чат
          const chatBtn = document.getElementById('chatToggleBtn');
          if (chatBtn) chatBtn.click();
          closeModal();
          break;
        case 'faq':
          // Прокручиваем к FAQ
          const faqSection = document.querySelector('.faq-list');
          if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth' });
            closeModal();
          }
          break;
      }
    });
  });

  // Закрытие по клику на оверлей
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Закрытие по Escape
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

function initChatWidget() {
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatPopup = document.getElementById('chatPopup');
  const chatPopupClose = document.getElementById('chatPopupClose');
  const chatPopupForm = document.getElementById('chatPopupForm');
  const chatPopupInput = document.getElementById('chatPopupInput');
  const chatPopupMessages = document.getElementById('chatPopupMessages');
  const chatBadge = document.getElementById('chatBadge');
  
  let isOpen = false;
  let messageCount = 0;
  
  // AI ответы для чата
  const aiResponses = {
    'привет': 'Привет! Рад помочь вам с AlphaBiz Digital Companion. Что вас интересует?',
    'как': 'Я могу помочь вам с различными вопросами по платформе. Расскажите подробнее о вашей проблеме.',
    'ошибка': 'Понимаю, что у вас возникла ошибка. Можете описать, что именно происходит? Это поможет мне лучше понять проблему.',
    'калькулятор': 'Калькулятор позволяет рассчитать кредитные возможности и сравнить налоговую нагрузку. Введите ваши данные в соответствующие поля.',
    'документы': 'В разделе "Документы" вы можете безопасно хранить важные файлы. Доступ осуществляется через биометрическую аутентификацию.',
    'встречи': 'В разделе "Встречи" вы можете планировать встречи, бронировать переговорные и управлять расписанием.',
    'дашборд': 'Дашборд показывает ключевые метрики вашего бизнеса: оборот, налоги и денежный поток в реальном времени.',
    'мобильный': 'Платформа полностью адаптирована для мобильных устройств. Все функции доступны на смартфонах и планшетах.',
    'безопасность': 'Все ваши данные хранятся локально в браузере и не передаются на внешние серверы. Это обеспечивает максимальную безопасность.',
    'экспорт': 'Для экспорта данных используйте функции сохранения в соответствующих разделах. Рекомендуем регулярно делать резервные копии.',
    'default': 'Интересный вопрос! Я постараюсь помочь. Можете уточнить детали или задать более конкретный вопрос?'
  };
  
  // Открыть/закрыть чат
  chatToggleBtn.addEventListener('click', () => {
    if (isOpen) {
      chatPopup.style.display = 'none';
      isOpen = false;
    } else {
      chatPopup.style.display = 'flex';
      chatPopupInput.focus();
      isOpen = true;
      // Убираем бейдж при открытии
      chatBadge.style.display = 'none';
    }
  });
  
  // Закрыть чат
  chatPopupClose.addEventListener('click', () => {
    chatPopup.style.display = 'none';
    isOpen = false;
  });
  
  // Закрыть чат по клику на оверлей (только на мобильных)
  chatPopup.addEventListener('click', (e) => {
    if (e.target === chatPopup) {
      chatPopup.style.display = 'none';
      isOpen = false;
    }
  });
  
  // Обработка отправки сообщения
  chatPopupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = chatPopupInput.value.trim();
    if (!message) return;
    
    // Добавляем сообщение пользователя
    addMessage(message, 'user');
    chatPopupInput.value = '';
    
    // Показываем индикатор печати
    showTypingIndicator();
    
    // Генерируем ответ AI
    setTimeout(() => {
      hideTypingIndicator();
      const aiResponse = generateAIResponse(message);
      addMessage(aiResponse, 'ai');
    }, 1500 + Math.random() * 1000);
  });
  
  // Добавление сообщения в чат
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    const time = new Date().toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <p>${text}</p>
        <span class="message-time">${time}</span>
      </div>
    `;
    
    chatPopupMessages.appendChild(messageDiv);
    chatPopupMessages.scrollTop = chatPopupMessages.scrollHeight;
    
    // Увеличиваем счетчик сообщений
    if (sender === 'user') {
      messageCount++;
      if (!isOpen) {
      // chatBadge.textContent = messageCount;
      // chatBadge.style.display = 'flex';
      }
    }
  }
  
  // Показать индикатор печати
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    
    chatPopupMessages.appendChild(typingDiv);
    chatPopupMessages.scrollTop = chatPopupMessages.scrollHeight;
  }
  
  // Скрыть индикатор печати
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Генерация ответа AI
  function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Поиск ключевых слов в сообщении
    for (const [keyword, response] of Object.entries(aiResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return aiResponses.default;
  }
  
  // Обработка Enter в поле ввода чата
  chatPopupInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatPopupForm.dispatchEvent(new Event('submit'));
    }
  });
  
  // Имитация нового сообщения от AI (для демонстрации бейджа)
  setTimeout(() => {
    if (!isOpen) {
      // chatBadge.style.display = 'flex';
    }
  }, 5000);
}

function initCommunity() {
  const findPartnersBtn = document.getElementById('findPartnersBtn');
  const partnerQuery = document.getElementById('partnerQuery');
  const partnersList = document.getElementById('partnersList');
  const addEventBtn = document.getElementById('addEventBtn');
  const filterEventsBtn = document.getElementById('filterEventsBtn');
  const eventsList = document.getElementById('eventsList');
  const newsActions = document.querySelectorAll('.news-action');
  const discussionJoins = document.querySelectorAll('.discussion-join');
  
  // Данные для партнеров
  const partnersData = [
    { name: 'ООО "Логистик Плюс"', description: 'Грузоперевозки по России', category: 'логистика', rating: 4.8 },
    { name: 'ИП Иванов А.В.', description: 'Поставки канцелярии', category: 'поставки', rating: 4.5 },
    { name: 'Агентство "Маркетинг Про"', description: 'SMM и реклама', category: 'маркетинг', rating: 4.9 },
    { name: 'ООО "ТехСервис"', description: 'IT-поддержка бизнеса', category: 'технологии', rating: 4.7 },
    { name: 'ИП Петрова М.С.', description: 'Бухгалтерские услуги', category: 'бухгалтерия', rating: 4.6 }
  ];
  
  // Данные для мероприятий
  const eventsData = [
    { title: 'Нетворкинг для предпринимателей', date: '2025-01-15', time: '18:00', participants: 24 },
    { title: 'Семинар по налогообложению', date: '2025-01-20', time: '14:00', participants: 18 },
    { title: 'Встреча инвесторов', date: '2025-01-25', time: '19:00', participants: 12 }
  ];
  
  // Поиск партнеров
  findPartnersBtn.addEventListener('click', () => {
    const query = partnerQuery.value.toLowerCase().trim();
    if (!query) {
      showToast('Введите запрос для поиска', 'error');
      return;
    }
    
    const filteredPartners = partnersData.filter(partner => 
      partner.name.toLowerCase().includes(query) ||
      partner.description.toLowerCase().includes(query) ||
      partner.category.toLowerCase().includes(query)
    );
    
    displayPartners(filteredPartners);
    showToast(`Найдено партнеров: ${filteredPartners.length}`);
  });
  
  // Отображение партнеров
  function displayPartners(partners) {
    partnersList.innerHTML = '';
    
    if (partners.length === 0) {
      partnersList.innerHTML = '<li class="muted">Партнеры не найдены</li>';
      return;
    }
    
    partners.forEach(partner => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="partner-item">
          <div class="partner-info">
            <strong>${partner.name}</strong>
            <p>${partner.description}</p>
            <span class="partner-rating">Рейтинг: ${partner.rating}/5</span>
          </div>
          <button class="btn btn-sm partner-contact">Связаться</button>
        </div>
      `;
      partnersList.appendChild(li);
    });
    
    // Добавляем обработчики для кнопок связи
    partnersList.querySelectorAll('.partner-contact').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('Функция связи будет доступна в следующих версиях');
      });
    });
  }
  
  // Добавление события
  addEventBtn.addEventListener('click', () => {
    const title = prompt('Название мероприятия:');
    if (!title) return;
    
    const date = prompt('Дата (YYYY-MM-DD):');
    if (!date) return;
    
    const time = prompt('Время (HH:MM):');
    if (!time) return;
    
    const newEvent = {
      title,
      date,
      time,
      participants: 0
    };
    
    eventsData.unshift(newEvent);
    displayEvents();
    showToast('Мероприятие добавлено');
  });
  
  // Фильтр мероприятий
  filterEventsBtn.addEventListener('click', () => {
    const filter = prompt('Фильтр по названию:');
    if (!filter) return;
    
    const filteredEvents = eventsData.filter(event => 
      event.title.toLowerCase().includes(filter.toLowerCase())
    );
    
    displayEvents(filteredEvents);
    showToast(`Найдено мероприятий: ${filteredEvents.length}`);
  });
  
  // Отображение мероприятий
  function displayEvents(events = eventsData) {
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
      eventsList.innerHTML = '<li class="muted">Мероприятия не найдены</li>';
      return;
    }
    
    events.forEach(event => {
      const li = document.createElement('li');
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
      
      li.innerHTML = `
        <div class="event-item">
          <div class="event-info">
            <strong>${event.title}</strong>
            <p>${formattedDate} в ${event.time}</p>
            <span class="event-participants">Участников: ${event.participants}</span>
          </div>
          <button class="btn btn-sm event-join">Записаться</button>
        </div>
      `;
      eventsList.appendChild(li);
    });
    
    // Добавляем обработчики для кнопок записи
    eventsList.querySelectorAll('.event-join').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('Запись на мероприятие будет доступна в следующих версиях');
      });
    });
  }
  
  // Лайки новостей
  newsActions.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('liked')) {
        btn.classList.remove('liked');
        btn.textContent = 'Нравится';
        showToast('Лайк убран');
      } else {
        btn.classList.add('liked');
        btn.textContent = 'Нравится ✓';
        showToast('Лайк добавлен');
      }
    });
  });
  
  // Присоединение к обсуждениям
  discussionJoins.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('joined')) {
        btn.classList.remove('joined');
        btn.textContent = 'Присоединиться';
        showToast('Вы покинули обсуждение');
      } else {
        btn.classList.add('joined');
        btn.textContent = 'Присоединились ✓';
        showToast('Вы присоединились к обсуждению');
      }
    });
  });
  
  // Инициализация - показываем все мероприятия
  displayEvents();
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
    case 'support.html':
      initSupport();
      break;
  }
  
  // Burger menu и чат инициализируются на всех страницах
  initBurger();
  initChatWidget();
});


