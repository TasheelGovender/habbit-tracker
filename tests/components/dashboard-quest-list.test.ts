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

describe('DashboardQuestList', () => {
  it('shows empty state and create button when no quests exist', () => {
    const wrapper = mount(DashboardQuestList, {
      props: { quests: [] },
      global: { stubs },
    })

    expect(wrapper.text()).toContain('No quests created yet')
    expect(wrapper.text()).toContain('New Quest')
  })

  it('renders a QuestCard for each quest', () => {
    const quests = [
      { id: 'q1', title: 'Run', type: 'daily', category: 'Fitness', categoryId: 'd0', difficulty: 3, streak: 0, xpReward: 30, completed: false },
      { id: 'q2', title: 'Read', type: 'daily', category: 'Learning', categoryId: 'd1', difficulty: 2, streak: 1, xpReward: 22, completed: true },
    ]

    const wrapper = mount(DashboardQuestList, {
      props: { quests },
      global: { stubs },
    })

    const cards = wrapper.findAll('[data-testid="quest-card"]')
    expect(cards).toHaveLength(2)
    expect(cards[0].text()).toContain('Run')
    expect(cards[1].text()).toContain('Read')
  })

  it('emits open-create-modal when New Quest button is clicked', async () => {
    const wrapper = mount(DashboardQuestList, {
      props: { quests: [] },
      global: { stubs },
    })

    await wrapper.find('[data-testid="new-quest-button"]').trigger('click')

    expect(wrapper.emitted('open-create-modal')).toBeTruthy()
  })

  it('forwards toggle-complete events from QuestCard', async () => {
    const quests = [
      { id: 'q1', title: 'Run', type: 'daily', category: 'Fitness', categoryId: 'd0', difficulty: 3, streak: 0, xpReward: 30, completed: false },
    ]

    const wrapper = mount(DashboardQuestList, {
      props: { quests },
      global: { stubs },
    })

    await wrapper.find('[data-testid="quest-card"]').trigger('click')

    expect(wrapper.emitted('toggle-complete')).toBeTruthy()
    expect(wrapper.emitted('toggle-complete')![0]).toEqual(['q1'])
  })
})
