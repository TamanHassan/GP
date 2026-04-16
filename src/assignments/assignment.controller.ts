// src/controllers/assignment.controller.ts

import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { createAssignmentSchema, deleteAssignmentSchema } from '../schemas/assignment.schema'

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

function getWeekDates(weekStart: string): Date[] {
  const start = new Date(weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export async function getAssignments(req: Request, res: Response) {
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
          date: { gte: startDate, lte: endDate },
        },
      },
      assignments: {
        where: {
          date: { gte: startDate, lte: endDate },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const result = dates.map((date) => {
    const iso = date.toISOString().split('T')[0]

    return {
      date: iso,
      shifts: {
        MORNING: buildShiftData(employees, iso, 'MORNING'),
        AFTERNOON: buildShiftData(employees, iso, 'AFTERNOON'),
        NIGHT: buildShiftData(employees, iso, 'NIGHT'),
      },
    }
  })

  return res.json(result)
}

function buildShiftData(
  employees: any[],
  iso: string,
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT'
) {
  const shiftField = shift === 'MORNING'
    ? 'preferMorning'
    : shift === 'AFTERNOON'
    ? 'preferAfternoon'
    : 'preferNight'

  return employees.map((emp) => {
    const avail = emp.availability.find(
      (a: any) => a.date.toISOString().split('T')[0] === iso
    )
    const assigned = emp.assignments.find(
      (a: any) => a.date.toISOString().split('T')[0] === iso && a.shift === shift
    )

    let status: 'ASSIGNED' | 'PREFER' | 'AVAILABLE' | 'UNAVAILABLE' | 'NOT_SET'

    if (assigned) {
      status = 'ASSIGNED'
    } else if (!avail) {
      status = 'NOT_SET'
    } else if (avail.dayStatus === 'UNAVAILABLE') {
      status = 'UNAVAILABLE'
    } else if (avail[shiftField] === true) {
      status = 'PREFER'
    } else {
      status = 'AVAILABLE'
    }

    return {
      employeeId: emp.id,
      name: emp.name,
      assignmentId: assigned?.id ?? null,
      status,
    }
  })
}

export async function createAssignment(req: Request, res: Response) {
  const parsed = createAssignmentSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const { employeeId, date, shift } = parsed.data

  // Kontrollera att den anställde faktiskt finns
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
  })

  if (!employee || employee.role !== 'EMPLOYEE') {
    return res.status(404).json({ error: 'Anställd hittades inte' })
  }

  const existing = await prisma.assignment.findUnique({
    where: {
      employeeId_date_shift: {
        employeeId,
        date: new Date(date),
        shift,
      },
    },
  })

  if (existing) {
    return res.status(409).json({ error: 'Den anställde är redan tilldelad det här passet' })
  }

  const assignment = await prisma.assignment.create({
    data: {
      employeeId,
      date: new Date(date),
      shift,
    },
    include: {
      employee: {
        select: { id: true, name: true },
      },
    },
  })

  return res.status(201).json(assignment)
}
export async function deleteAssignment(req: Request, res: Response) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Ogiltigt id' })
  }

  const existing = await prisma.assignment.findUnique({
    where: { id },
  })

  if (!existing) {
    return res.status(404).json({ error: 'Tilldelningen hittades inte' })
  }

  await prisma.assignment.delete({
    where: { id },
  })

  return res.json({ message: 'Tilldelning borttagen' })
}