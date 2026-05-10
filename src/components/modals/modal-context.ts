import { type Dispatch, createContext } from 'react'
import type { ModalAction, ModalMap, ModalState } from '@/types'

export const ModalStateCtx = createContext<ModalState | undefined>(undefined)
export const ModalDispatchCtx = createContext<
  Dispatch<ModalAction<keyof ModalMap>> | undefined
>(undefined)
