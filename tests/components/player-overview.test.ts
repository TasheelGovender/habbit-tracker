import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import PlayerOverview from '../../app/components/player/PlayerOverview.vue'

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

const ProgressBarStub = defineComponent({
  name: 'ProgressBar',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    tone: {
      type: String,
      default: 'xp',
    },
  },
  template: '<div />',
})

describe('PlayerOverview', () => {
  it('mounts the player overview presentation', () => {
    const wrapper = mount(PlayerOverview, {
      props: {
        player: {
          displayName: 'Hunter',
          rank: 'E',
          title: null,
          level: 1,
          xp: 0,
          hp: 50,
          maxHp: 50,
        },
      },
      global: {
        stubs: {
          ProgressBar: ProgressBarStub,
          SystemWindow: SystemWindowStub,
        },
      },
    })

    const systemWindow = wrapper.getComponent(SystemWindowStub)
    const progressBars = wrapper.findAllComponents(ProgressBarStub)

    expect(systemWindow.props('eyebrow')).toBe('Player')
    expect(systemWindow.props('title')).toBe('Hunter')
    expect(wrapper.text()).toContain('Hunter')
    expect(wrapper.text()).toContain('E')
    expect(wrapper.text()).toContain('Unawakened')
    expect(progressBars).toHaveLength(2)
    expect(progressBars[0]?.props()).toMatchObject({
      label: 'Level XP',
      value: 0,
      max: 100,
      tone: 'xp',
    })
    expect(progressBars[1]?.props()).toMatchObject({
      label: 'HP',
      value: 50,
      max: 50,
      tone: 'hp',
    })
  })
})
