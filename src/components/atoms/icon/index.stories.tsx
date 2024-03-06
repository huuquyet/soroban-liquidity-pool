import { Meta, Story } from '@storybook/react'
import { IIconProps, Icon, IconNames } from '.'

export default {
  title: 'Atoms/Icon',
  component: Icon,
} as Meta

const Template: Story<IIconProps> = (args) => <Icon {...args} />

export const Default = Template.bind({})

Default.argTypes = {
  name: {
    defaultValue: IconNames.user,
    control: {
      type: 'select',
      options: IconNames,
    },
  },
  size: {
    defaultValue: '50px',
  },
}
