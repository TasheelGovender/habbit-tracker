import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QuestCreateModal from '~/components/quests/QuestCreateModal.vue'

describe('QuestCreateModal', () => {
  const categories = [
    { id: 'default-0', name: 'Fitness' },
    { id: 'default-1', name: 'Learning' },
  ]

  function mountModal() {
    return mount(QuestCreateModal, {
      props: { categories },
      global: {
        stubs: {
          SystemWindow: { template: '<div><slot /></div>' },
          GlowButton: {
            template: '<button :type="type" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'type'],
          },
        },
      },
    })
  }

  it('renders a form with title input, category select, and difficulty selector', () => {
    const wrapper = mountModal()

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="difficulty-button"]')).toHaveLength(5)
  })

  it('populates category select from props', () => {
    const wrapper = mountModal()
    const options = wrapper.find('select').findAll('option')

    const categoryOptions = options.filter((o) => o.element.value !== '')
    expect(categoryOptions).toHaveLength(2)
    expect(categoryOptions[0].text()).toBe('Fitness')
    expect(categoryOptions[1].text()).toBe('Learning')
  })

  it('emits create-quest with form data on submit', async () => {
    const wrapper = mountModal()

    await wrapper.find('input[type="text"]').setValue('Morning Run')
    await wrapper.find('select').setValue('default-0')
    await wrapper.findAll('[data-testid="difficulty-button"]')[2].trigger('click')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('create-quest')).toBeTruthy()
    expect(wrapper.emitted('create-quest')![0][0]).toEqual({
      title: 'Morning Run',
      categoryId: 'default-0',
      difficulty: 3,
    })
  })

  it('emits close when cancel button is clicked', async () => {
    const wrapper = mountModal()
    const cancelButton = wrapper.find('[data-testid="cancel-button"]')

    await cancelButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows validation errors when submitting with empty fields', async () => {
    const wrapper = mountModal()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('create-quest')).toBeFalsy()
    expect(wrapper.text()).toContain('Quest title is required')
    expect(wrapper.text()).toContain('Please select a category')
  })

  it('displays error prop when provided', () => {
    const wrapper = mount(QuestCreateModal, {
      props: { categories, error: 'Firestore write failed' },
      global: {
        stubs: {
          SystemWindow: { template: '<div><slot /></div>' },
          GlowButton: {
            template: '<button :type="type"><slot /></button>',
            props: ['variant', 'size', 'type'],
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Firestore write failed')
  })
})
