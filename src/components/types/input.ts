import { ChangeEvent, FocusEvent, Ref } from 'react'

export interface IInputProps {
  /**
   * The HTML id of the component, if not provided the name prop will be used as a default
   */
  id?: string
  /**
   * The name of the input
   */
  name: string
  /**
   * The React input ref
   * This ref usually is used to integrate with react-hook-forms
   */
  ref: Ref<HTMLInputElement>
  /**
   * The input on change event
   * This prop is required when you use react-hook-forms
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * The input on blur event
   * This prop is required when you use react-hook-forms
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  /**
   * Classname to add custom css
   */
  className?: string
  /**
   * Is the input disabled?
   * The default value is `false`
   */
  disabled?: boolean
}
