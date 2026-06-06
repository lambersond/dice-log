import type { ReactNode } from 'react'

export type ModalProps = {
  children: ReactNode
  headerClassName?: string
  title: string
  subtitle?: ReactNode
  isOpen: boolean
  onClose: VoidFunction
  /**
   * When false, the modal can't be dismissed by the user: the close (X) button
   * is hidden and backdrop/Escape clicks are ignored. Use for forced flows
   * (e.g. a required profile gate). Defaults to true.
   */
  dismissable?: boolean
  width?: string
  fullHeight?: boolean
  fullScreen?: boolean
  disableContainerStyles?: boolean
  containerClassName?: string
}
