const DAY_NAMES = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

let currentWeekStart = getMondayOf(new Date())
let weekData = [] // array of 7 { date, dayStatus, preferMorning, preferAfternoon, preferNight }

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

function changeWeek(direction) {
  currentWeekStart.setDate(currentWeekStart.getDate() + direction * 7)
  loadWeek()
}


async function loadWeek() {
  const weekStart = toISO(currentWeekStart)

  document.getElementById('week-label').textContent =
    `Vecka från ${weekStart}`

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
  const headers = document.getElementById('day-headers')
  const rowStatus = document.getElementById('row-status')
  const rowMorning = document.getElementById('row-morning')
  const rowAfternoon = document.getElementById('row-afternoon')
  const rowNight = document.getElementById('row-night')

  ;[headers, rowStatus, rowMorning, rowAfternoon, rowNight].forEach(row => {
    while (row.children.length > 1) row.removeChild(row.lastChild)
  })

  weekData.forEach((day, i) => {
    const date = new Date(day.date + 'T00:00:00')
    const isAvailable = day.dayStatus === 'AVAILABLE'
    const isUnavailable = day.dayStatus === 'UNAVAILABLE'

    const th = document.createElement('th')
    th.innerHTML = `<div class="day-name">${DAY_NAMES[i]}</div><div class="day-date">${day.date}</div>`
    headers.appendChild(th)

    const tdStatus = document.createElement('td')
    const btn = document.createElement('button')
    btn.className = `status-btn ${isAvailable ? 'available' : isUnavailable ? 'unavailable' : 'not-set'}`
    btn.textContent = isAvailable ? 'Tillgänglig' : isUnavailable ? 'Otillgänglig' : 'Ej satt'
    btn.onclick = () => cycleStatus(i)
    tdStatus.appendChild(btn)
    rowStatus.appendChild(tdStatus)

    ;[
      { row: rowMorning,   field: 'preferMorning' },
      { row: rowAfternoon, field: 'preferAfternoon' },
      { row: rowNight,     field: 'preferNight' },
    ].forEach(({ row, field }) => {
      const td = document.createElement('td')
      const cb = document.createElement('input')
      cb.type = 'checkbox'
      cb.className = 'shift-checkbox'
      cb.checked = day[field]
      cb.disabled = !isAvailable
      cb.onchange = () => { weekData[i][field] = cb.checked }
      td.appendChild(cb)
      row.appendChild(td)
    })
  })
}

function cycleStatus(index) {
  const current = weekData[index].dayStatus
  if (current === null || current === undefined) {
    weekData[index].dayStatus = 'AVAILABLE'
  } else if (current === 'AVAILABLE') {
    weekData[index].dayStatus = 'UNAVAILABLE'
    weekData[index].preferMorning = false
    weekData[index].preferAfternoon = false
    weekData[index].preferNight = false
  } else {
    weekData[index].dayStatus = null
  }
  renderTable()
}

async function saveAvailability() {
  const statusEl = document.getElementById('save-status')
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
          date: day.date,
          dayStatus: day.dayStatus,
          preferMorning: day.preferMorning,
          preferAfternoon: day.preferAfternoon,
          preferNight: day.preferNight,
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