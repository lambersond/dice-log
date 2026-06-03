import { lazy } from 'react'

export const MODALS = {
  confirm: lazy(() => import('@/components/modals/confirm-modal')),
  'dice-preferences': lazy(
    () => import('@/components/modals/dice-preferences-modal'),
  ),
  players: lazy(() => import('@/components/modals/players-modal')),
}
