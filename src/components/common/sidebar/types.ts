import type { Dispatch, ReactNode, SetStateAction } from 'react'

export type SidebarProps =
  | {
      children: ReactNode
      trigger: ReactNode
      className?: string
      side?: 'left' | 'right'
      fullHeight?: boolean
      isOpen?: never
      onClose?: never
    }
  | {
      children: ReactNode
      isOpen: boolean
      onClose: () => void
      className?: string
      trigger?: never
      side?: 'left' | 'right'
      fullHeight?: boolean
    }

export type SidebarTriggerProps = {
  trigger: ReactNode
  setOpen: Dispatch<SetStateAction<boolean>>
}

export type SidebarItemProps = {
  children: ReactNode
}
