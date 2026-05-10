'use client'

import { createContext, useContext } from 'react'

export const SidebarContext = createContext<{
  onClose?: VoidFunction
  side?: 'left' | 'right'
  isOpen?: boolean
}>({ isOpen: false })

export const useSidebar = () => useContext(SidebarContext)
