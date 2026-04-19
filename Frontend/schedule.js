const DAY_NAMES = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

let currentWeekStart = getMondayOf(new Date())
let weekData = []

let activeIndex = null
let modalStatus = null       // 'all' | 'partial' | 'unavailable'
let modalShifts = { morning: false, afternoon: false, evening: false }

const token = localStorage.getItem('token')

if (!token) {
  document.getElementById('no-token').style.display = 'block'
} else {
  document.getElementById('schedule-section').style.display = 'block'
  loadWeek()
}

function getMondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISO(date) {
  return date.toISOString().split('T')[0]
}

function changeWeek(dir) {
  currentWeekStart.setDate(currentWeekStart.getDate() + dir * 7)
  loadWeek()
}

async function loadWeek() {
  const weekStart = toISO(currentWeekStart)
  document.getElementById('week-label').textContent = `Vecka från ${weekStart}`

  try {
    const res = await fetch(`/availability/me?weekStart=${weekStart}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.status === 401) {
      localStorage.removeItem('token')
      location.href = '/index.html'
      return
    }

    weekData = await res.json()
  } catch {
    weekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart)
      d.setDate(d.getDate() + i)
      return { date: toISO(d), dayStatus: null, preferMorning: false, preferAfternoon: false, preferNight: false }
    })
  }

  renderTable()
}

function renderTable() {
  const headers     = document.getElementById('day-headers')
  const rowMorning  = document.getElementById('row-morning')
  const rowAfternoon = document.getElementById('row-afternoon')
  const rowEvening  = document.getElementById('row-evening')
  const rowChoose   = document.getElementById('row-choose')

  ;[headers, rowMorning, rowAfternoon, rowEvening, rowChoose].forEach(row => {
    while (row.children.length > 1) row.removeChild(row.lastChild)
  })

  weekData.forEach((day, i) => {
    // Header
    const th = document.createElement('th')
    th.innerHTML = `<div class="day-name">${DAY_NAMES[i]}</div><div class="day-date">${day.date}</div>`
    headers.appendChild(th)

    ;[
      { row: rowMorning,   field: 'preferMorning' },
      { row: rowAfternoon, field: 'preferAfternoon' },
      { row: rowEvening,   field: 'preferNight' },
    ].forEach(({ row, field }) => {
      const td = document.createElement('td')
      td.appendChild(makeStatusBadge(day, field))
      row.appendChild(td)
    })

    const tdChoose = document.createElement('td')
    const btn = document.createElement('button')
    btn.className = 'choose-btn'
    btn.textContent = 'Choose availability'
    btn.onclick = () => openModal(i)
    tdChoose.appendChild(btn)
    rowChoose.appendChild(tdChoose)
  })
}

function makeStatusBadge(day, field) {
  const span = document.createElement('span')
  span.className = 'cell-status'

  if (!day.dayStatus) {
    span.className += ' not-set'
    span.textContent = '–'
  } else if (day.dayStatus === 'UNAVAILABLE') {
    span.className += ' unavailable'
    span.textContent = 'Ej tillgänglig'
  } else if (day[field]) {
    span.className += ' prefer'
    span.textContent = 'Föredrar'
  } else if (day.isPartial) {
    span.className += ' unavailable'
    span.textContent = 'Ej tillgänglig'
  } else {
    span.className += ' available'
    span.textContent = 'Tillgänglig'
  }

  return span
}


function openModal(index) {
  activeIndex = index
  const day = weekData[index]

  if (!day.dayStatus) {
    modalStatus = null
  } else if (day.dayStatus === 'UNAVAILABLE') {
    modalStatus = 'unavailable'
  } else if (day.preferMorning || day.preferAfternoon || day.preferNight) {
    modalStatus = 'partial'
  } else {
    modalStatus = 'all'
  }

  modalShifts = {
    morning:   day.preferMorning,
    afternoon: day.preferAfternoon,
    evening:   day.preferNight,
  }

  renderModal()
  document.getElementById('modal-overlay').classList.add('open')
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open')
  activeIndex = null
}

function selectStatus(status) {
  modalStatus = status
  if (status !== 'partial') {
    modalShifts = { morning: false, afternoon: false, evening: false }
  }
  renderModal()
}

function toggleShift(shift) {
  if (modalStatus !== 'all' && modalStatus !== 'partial') return
  modalShifts[shift] = !modalShifts[shift]
  renderModal()
}

function renderModal() {
  document.getElementById('opt-all').classList.toggle('selected',     modalStatus === 'all')
  document.getElementById('opt-partial').classList.toggle('selected', modalStatus === 'partial')
  document.getElementById('opt-unavail').classList.toggle('selected', modalStatus === 'unavailable')

  const shiftsEnabled = modalStatus === 'all' || modalStatus === 'partial'
  ;['morning', 'afternoon', 'evening'].forEach(s => {
    const btn = document.getElementById(`shift-${s}`)
    btn.disabled = !shiftsEnabled
    btn.classList.toggle('selected', shiftsEnabled && modalShifts[s])
  })
}

function confirmModal() {
  if (activeIndex === null || modalStatus === null) {
    closeModal()
    return
  }

  const day = weekData[activeIndex]

  if (modalStatus === 'unavailable') {
    day.dayStatus       = 'UNAVAILABLE'
    day.preferMorning   = false
    day.preferAfternoon = false
    day.preferNight     = false
    day.isPartial       = false
  } else {
    day.dayStatus       = 'AVAILABLE'
    day.preferMorning   = modalShifts.morning
    day.preferAfternoon = modalShifts.afternoon
    day.preferNight     = modalShifts.evening
    day.isPartial       = modalStatus === 'partial'
  }

  renderTable()
  closeModal()
}


async function saveAvailability() {
  const statusEl = document.getElementById('save-status')
  statusEl.style.color = '#2b8a3e'
  statusEl.textContent = 'Sparar...'

  const toSave = weekData.filter(d => d.dayStatus !== null)

  try {
    await Promise.all(toSave.map(day =>
      fetch('/availability/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date:            day.date,
          dayStatus:       day.dayStatus,
          preferMorning:   day.preferMorning,
          preferAfternoon: day.preferAfternoon,
          preferNight:     day.preferNight,
          isPartial:       day.isPartial,
        })
      })
    ))

    statusEl.textContent = 'Sparat!'
    setTimeout(() => { statusEl.textContent = '' }, 3000)
  } catch {
    statusEl.style.color = 'red'
    statusEl.textContent = 'Kunde inte spara.'
  }
}

function logout() {
  localStorage.removeItem('token')
  location.href = '/index.html'
}
