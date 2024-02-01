import { RouteChildrenProps, RouteComponentProps } from 'react-router'
import * as H from 'history'

export type RouteProps = {
  location?: H.Location
  component:
  | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>
    | React.FunctionComponent<any>
  render?: (props: RouteComponentProps<any>) => React.ReactNode
  ((props: RouteChildrenProps<any>) => React.ReactNode) | React.ReactNode
  path?: string
  exact?: boolean
  sensitive?: boolean
  strict?: boolean
}

export interface IAppRoute {
  component:
  | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>
    | React.FunctionComponent<any>
  path: string
  exact?: boolean
  isPrivate?: boolean
}

export interface IModuleRouteProps {
  routePrefix?: string
  routes: IAppRoute[]
  isAuthenticated: () => boolean
}
