import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DashboardQuestList from '~/components/dashboard/DashboardQuestList.vue'

const stubs = {
  SystemWindow: { template: '<div><slot /></div>', props: ['eyebrow', 'title'] },
  QuestCard: {
    template: '<div data-testid="quest-card" @click="$emit(\'toggle-complete\', quest.id)">{{ quest.title }}</div>',
    props: ['quest'],
    emits: ['toggle-complete'],
  },
  GlowButton: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    props: ['variant', 'size'],
  },
}

const emptyGroups = { daily: [], weekly: [], monthly: [] }

function makeQuest(overrides = {}) {
  return {
    id: 'q1', title: 'Run', type: 'daily', category: 'Fitness', categoryId: 'd0',
    difficulty: 3, frequency: 'daily', frequencyTarget: 1, frequencyPeriod: 'day',
    streak: 0, xpReward: 30, completed: false, progress: { current: 0, target: 1 },
    ...overrides,
  }
}

describe('DashboardQuestList', () => {
  it('shows empty state when no quests in any group', () => {
    const wrapper = mount(DashboardQuestList, {
      props: { questsByFrequency: emptyGroups },
      global: { stubs },
    })

    expect(wrapper.text()).toContain('No quests created yet')
    expect(wrapper.text()).toContain('New Quest')
  })

  it('renders quests grouped by frequency', () => {
    const wrapper = mount(DashboardQuestList, {
      props: {
        questsByFrequency: {
          daily: [makeQuest({ id: 'q1', title: 'Run' })],
          weekly: [makeQuest({ id: 'q2', title: 'Gym', type: 'weekly', frequency: 'weekly', frequencyPeriod: 'week' })],
          monthly: [],
        },
      },
      global: { stubs },
    })

    expect(wrapper.find('[data-testid="section-daily"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="section-weekly"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="section-monthly"]').exists()).toBe(false)

    expect(wrapper.text()).toContain('Daily Quests (1)')
    expect(wrapper.text()).toContain('Weekly Quests (1)')
  })

  it('emits open-create-modal when New Quest button is clicked', async () => {
    const wrapper = mount(DashboardQuestList, {
      props: { questsByFrequency: emptyGroups },
      global: { stubs },
    })

    await wrapper.find('[data-testid="new-quest-button"]').trigger('click')

    expect(wrapper.emitted('open-create-modal')).toBeTruthy()
  })

  it('forwards toggle-complete events from QuestCard', async () => {
    const wrapper = mount(DashboardQuestList, {
      props: {
        questsByFrequency: {
          daily: [makeQuest({ id: 'q1', title: 'Run' })],
          weekly: [],
          monthly: [],
        },
      },
      global: { stubs },
    })

    await wrapper.find('[data-testid="quest-card"]').trigger('click')

    expect(wrapper.emitted('toggle-complete')).toBeTruthy()
    expect(wrapper.emitted('toggle-complete')![0]).toEqual(['q1'])
  })
})
