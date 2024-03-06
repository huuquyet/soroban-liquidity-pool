import * as H from 'history'
import { ComponentType, FunctionComponent, ReactNode } from 'react'
import { RouteChildrenProps, RouteComponentProps } from 'react-router'

export type RouteProps = {
  location?: H.Location
  component: ComponentType<RouteComponentProps<any>> | ComponentType<any> | FunctionComponent<any>
  render?: (props: RouteComponentProps<any>) => ReactNode
  children?: ((props: RouteChildrenProps<any>) => ReactNode) | ReactNode
  path?: string
  exact?: boolean
  sensitive?: boolean
  strict?: boolean
}

export interface IAppRoute {
  component: ComponentType<RouteComponentProps<any>> | ComponentType<any> | FunctionComponent<any>
  path: string
  exact?: boolean
  isPrivate?: boolean
}

export interface IModuleRouteProps {
  routePrefix?: string
  routes: IAppRoute[]
  isAuthenticated: () => boolean
}
