import type { ReactNode } from 'react'

export type ModalProps = {
  children: ReactNode
  headerClassName?: string
  title: string
  subtitle?: ReactNode
  isOpen: boolean
  onClose: VoidFunction
  width?: string
  fullHeight?: boolean
  fullScreen?: boolean
  disableContainerStyles?: boolean
  containerClassName?: string
}
