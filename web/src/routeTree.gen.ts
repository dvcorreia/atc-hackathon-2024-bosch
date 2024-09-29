/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as StudyImport } from './routes/study'
import { Route as IndexImport } from './routes/index'
import { Route as MeasureIndexImport } from './routes/measure/index'

// Create/Update Routes

const StudyRoute = StudyImport.update({
  path: '/study',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const MeasureIndexRoute = MeasureIndexImport.update({
  path: '/measure/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/study': {
      id: '/study'
      path: '/study'
      fullPath: '/study'
      preLoaderRoute: typeof StudyImport
      parentRoute: typeof rootRoute
    }
    '/measure/': {
      id: '/measure/'
      path: '/measure'
      fullPath: '/measure'
      preLoaderRoute: typeof MeasureIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/study': typeof StudyRoute
  '/measure': typeof MeasureIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/study': typeof StudyRoute
  '/measure': typeof MeasureIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/study': typeof StudyRoute
  '/measure/': typeof MeasureIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/study' | '/measure'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/study' | '/measure'
  id: '__root__' | '/' | '/study' | '/measure/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  StudyRoute: typeof StudyRoute
  MeasureIndexRoute: typeof MeasureIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  StudyRoute: StudyRoute,
  MeasureIndexRoute: MeasureIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/study",
        "/measure/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/study": {
      "filePath": "study.tsx"
    },
    "/measure/": {
      "filePath": "measure/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
