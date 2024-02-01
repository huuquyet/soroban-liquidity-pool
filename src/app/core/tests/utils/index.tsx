import { RenderOptions, render } from '@testing-library/react'
import { PropsWithChildren, ReactElement } from 'react'

// If the application has providers, you can add them in the wrapper below
const ApplicationProviders: React.FC<PropsWithChildren> = ({ children }) => <>{children}</>

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'queries'>): RenderOptions =>
  render(ui, { wrapper: ApplicationProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
