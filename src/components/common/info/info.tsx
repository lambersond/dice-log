import { InfoIcon } from 'lucide-react'
import { Tooltip } from '../tooltip'

export function Info({ info }: Readonly<{ info: string }>) {
  return (
    <Tooltip title={info}>
      <InfoIcon className='size-4 min-w-4 min-h-4 text-info/80' />
    </Tooltip>
  )
}
