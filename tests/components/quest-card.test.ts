import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QuestCard from '~/components/quests/QuestCard.vue'

describe('QuestCard', () => {
  const baseQuest = {
    id: 'quest-1',
    title: 'Morning Run',
    type: 'daily',
    category: 'Fitness',
    categoryId: 'default-0',
    difficulty: 3,
    frequency: 'daily' as const,
    frequencyTarget: 1,
    frequencyPeriod: 'day' as const,
    streak: 5,
    xpReward: 40,
    completed: false,
    progress: { current: 0, target: 1 },
  }

  it('renders quest title, category, difficulty, streak, and xp reward', () => {
    const wrapper = mount(QuestCard, { props: { quest: baseQuest } })

    expect(wrapper.text()).toContain('Morning Run')
    expect(wrapper.text()).toContain('Fitness')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('5 days')
    expect(wrapper.text()).toContain('+40 XP')
  })

  it('applies default styling when not completed', () => {
    const wrapper = mount(QuestCard, { props: { quest: baseQuest } })
    const article = wrapper.find('article')

    expect(article.classes()).toContain('border-cyan-300/15')
  })

  it('applies completed styling when completed', () => {
    const wrapper = mount(QuestCard, {
      props: { quest: { ...baseQuest, completed: true, progress: { current: 1, target: 1 } } },
    })
    const article = wrapper.find('article')

    expect(article.classes()).toContain('border-emerald-300/30')
  })

  it('emits toggle-complete with quest id when toggle button is clicked', async () => {
    const wrapper = mount(QuestCard, { props: { quest: baseQuest } })
    const toggleButton = wrapper.find('[data-testid="toggle-complete"]')

    await toggleButton.trigger('click')

    expect(wrapper.emitted('toggle-complete')).toBeTruthy()
    expect(wrapper.emitted('toggle-complete')![0]).toEqual(['quest-1'])
  })

  it('hides progress column for single-target quests', () => {
    const wrapper = mount(QuestCard, { props: { quest: baseQuest } })

    expect(wrapper.find('[data-testid="quest-progress"]').exists()).toBe(false)
  })

  it('shows progress for multi-target quests', () => {
    const wrapper = mount(QuestCard, {
      props: {
        quest: {
          ...baseQuest,
          type: '3x / week',
          frequency: 'custom' as const,
          frequencyTarget: 3,
          frequencyPeriod: 'week' as const,
          progress: { current: 2, target: 3 },
        },
      },
    })

    const progress = wrapper.find('[data-testid="quest-progress"]')
    expect(progress.exists()).toBe(true)
    expect(progress.text()).toContain('2 / 3')
  })

  it('emits delete-quest with quest id when delete button is clicked', async () => {
    const wrapper = mount(QuestCard, { props: { quest: baseQuest } })
    const deleteButton = wrapper.find('[data-testid="delete-quest"]')

    await deleteButton.trigger('click')

    expect(wrapper.emitted('delete-quest')).toBeTruthy()
    expect(wrapper.emitted('delete-quest')![0]).toEqual(['quest-1'])
  })
})
