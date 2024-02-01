// @ts-nocheck
// this TS annotation is because react 18 doesn't have children as
// prop in FC components, as it has before. Since react-router-dom v5
// was using it, it doesn't type it correctly. This is a temporary workaround
// while we don't update to v6
// TODO: update react-router-dom to v6
import { isAuthentication } from 'app/core/auth'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import ModuleRoutes from './module-routes'
import { coreRoutes } from './routes'

const CoreRouter = (): JSX.Element => (
  <Router>
    <Switch>
      <ModuleRoutes routes={coreRoutes} isAuthenticated={isAuthentication} />
    </Switch>
  </Router>
)

export { CoreRouter }
