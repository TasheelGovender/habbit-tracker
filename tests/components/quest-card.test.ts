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
    streak: 5,
    xpReward: 40,
    completed: false,
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
      props: { quest: { ...baseQuest, completed: true } },
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
})
