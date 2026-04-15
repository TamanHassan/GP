import { Request, Response } from 'express'
import { prisma } from '../prisma/client.js'
import { updateAvailabilitySchema } from '../schemas/availability.schema.js'


function getWeekDates(weekStart: string): Date[] {
  const start = new Date(weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

export async function getMyAvailability(req: Request, res: Response) {
  const weekStart = (req.query.weekStart as string) || todayString()

  const dates = getWeekDates(weekStart)
  const startDate = dates[0]
  const endDate = dates[6]

  const rows = await prisma.availability.findMany({
    where: {
      employeeId: req.user!.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  })

  const result = dates.map((date) => {
    const iso = date.toISOString().split('T')[0]
    const row = rows.find((r) => r.date.toISOString().split('T')[0] === iso)
    return {
      date: iso,
      dayStatus: row?.dayStatus ?? null,
      preferMorning: row?.preferMorning ?? false,
      preferAfternoon: row?.preferAfternoon ?? false,
      preferNight: row?.preferNight ?? false,
    }
  })

  return res.json(result)
}

export async function updateMyAvailability(req: Request, res: Response) {
  const parsed = updateAvailabilitySchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const { date, dayStatus, preferMorning, preferAfternoon, preferNight } = parsed.data

  const prefer = dayStatus === 'AVAILABLE'
    ? { preferMorning, preferAfternoon, preferNight }
    : { preferMorning: false, preferAfternoon: false, preferNight: false }

  const availability = await prisma.availability.upsert({
    where: {
      employeeId_date: {
        employeeId: req.user!.id,
        date: new Date(date),
      },
    },
    update: {
      dayStatus,
      ...prefer,
    },
    create: {
      employeeId: req.user!.id,
      date: new Date(date),
      dayStatus,
      ...prefer,
    },
  })

  return res.json(availability)
}

export async function getAllEmployeesAvailability(req: Request, res: Response) {
  const weekStart = (req.query.weekStart as string) || todayString()

  const dates = getWeekDates(weekStart)
  const startDate = dates[0]
  const endDate = dates[6]

  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      availability: {
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const result = employees.map((emp) => ({
    employeeId: emp.id,
    name: emp.name,
    week: dates.map((date) => {
      const iso = date.toISOString().split('T')[0]
      const row = emp.availability.find(
        (a) => a.date.toISOString().split('T')[0] === iso
      )

      return {
        date: iso,
        morning: getCellStatus(row, 'preferMorning'),
        afternoon: getCellStatus(row, 'preferAfternoon'),
        night: getCellStatus(row, 'preferNight'),
      }
    }),
  }))

  return res.json(result)
}

function getCellStatus(
  row: { dayStatus: string; preferMorning: boolean; preferAfternoon: boolean; preferNight: boolean } | undefined,
  shiftField: 'preferMorning' | 'preferAfternoon' | 'preferNight'
): 'NOT_SET' | 'UNAVAILABLE' | 'PREFER' | 'AVAILABLE' {
  if (!row) return 'NOT_SET'
  if (row.dayStatus === 'UNAVAILABLE') return 'UNAVAILABLE'
  if (row[shiftField] === true) return 'PREFER'
  return 'AVAILABLE'
}