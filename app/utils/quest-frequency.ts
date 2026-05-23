import type { FrequencyPeriod, QuestFrequency, QuestProgress } from '~/types/quest'

export function getFrequencyLabel(frequency: QuestFrequency, frequencyTarget: number, frequencyPeriod: FrequencyPeriod): string {
  if (frequency !== 'custom') {
    return frequency
  }

  return `${frequencyTarget}x / ${frequencyPeriod}`
}

export function getWeekBounds(today: string): [string, string] {
  const ms = Date.UTC(
    Number(today.slice(0, 4)),
    Number(today.slice(5, 7)) - 1,
    Number(today.slice(8, 10)),
  )
  const dayOfWeek = new Date(ms).getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const mondayMs = ms + mondayOffset * 86400000
  const sundayMs = mondayMs + 6 * 86400000

  return [formatDateFromMs(mondayMs), formatDateFromMs(sundayMs)]
}

export function getMonthBounds(today: string): [string, string] {
  const year = Number(today.slice(0, 4))
  const month = Number(today.slice(5, 7)) - 1

  const first = new Date(Date.UTC(year, month, 1))
  const last = new Date(Date.UTC(year, month + 1, 0))

  return [formatDate(first), formatDate(last)]
}

export function getCompletionProgress(
  completedDates: string[],
  frequency: QuestFrequency,
  frequencyTarget: number,
  frequencyPeriod: FrequencyPeriod,
  today: string,
): QuestProgress {
  const period = frequency === 'custom' ? frequencyPeriod : frequencyToPeriod(frequency)
  const target = frequency === 'custom' ? frequencyTarget : 1
  const current = countCompletionsInPeriod(completedDates, period, today)

  return {
    current: Math.min(current, target),
    target,
  }
}

export function isQuestCompletedForPeriod(progress: QuestProgress): boolean {
  return progress.current >= progress.target
}

function frequencyToPeriod(frequency: QuestFrequency): FrequencyPeriod {
  if (frequency === 'weekly') return 'week'
  if (frequency === 'monthly') return 'month'
  return 'day'
}

function countCompletionsInPeriod(completedDates: string[], period: FrequencyPeriod, today: string): number {
  if (period === 'day') {
    return completedDates.filter((d) => d === today).length
  }

  const [start, end] = period === 'week' ? getWeekBounds(today) : getMonthBounds(today)
  return completedDates.filter((d) => d >= start && d <= end).length
}

function formatDateFromMs(ms: number): string {
  return formatDate(new Date(ms))
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
