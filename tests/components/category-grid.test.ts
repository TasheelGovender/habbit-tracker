import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import CategoryGrid from '../../app/components/player/CategoryGrid.vue'

const SystemWindowStub = defineComponent({
  name: 'SystemWindow',
  props: {
    title: {
      type: String,
      default: undefined,
    },
    eyebrow: {
      type: String,
      default: undefined,
    },
  },
  template: '<section><slot /></section>',
})

describe('CategoryGrid', () => {
  it('mounts the category grid presentation', () => {
    const wrapper = mount(CategoryGrid, {
      props: {
        categories: [
          {
            id: '1',
            name: 'Fitness',
            level: 2,
            icon: '💪',
            color: '#EF4444',
            xp: 0,
            order: 0,
            createdAt: null,
          },
        ],
      },
      global: {
        stubs: {
          SystemWindow: SystemWindowStub,
        },
      },
    })

    const systemWindow = wrapper.getComponent(SystemWindowStub)

    expect(systemWindow.props('eyebrow')).toBe('Categories')
    expect(systemWindow.props('title')).toBe('Current growth')
    expect(wrapper.text()).toContain('Fitness')
    expect(wrapper.text()).toContain('Lv. 2')
  })
})
