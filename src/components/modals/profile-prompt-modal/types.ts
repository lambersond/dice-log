import type { ModalProps } from '../types'
import type { UserProfile } from '@/hooks/use-user-profile'

export interface ProfilePromptModalProps extends ModalProps {
  onSave: (profile: UserProfile) => void
}
