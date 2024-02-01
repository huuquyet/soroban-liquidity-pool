import { CoreRouter } from 'app/core/routes'
import { AppProvider } from './context/appContext'
import ErrorBoundary from './error-boundary'

const App = (): JSX.Element => (
  <ErrorBoundary displayMessage="Ooooppss... An unexpected error occured">
    <AppProvider>
      <CoreRouter />
    </AppProvider>
  </ErrorBoundary>
)

export default App
