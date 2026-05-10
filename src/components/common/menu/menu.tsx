import { Group } from './group'
import { Options } from './options'
import { isGroupOption } from './utils'
import type { MenuProps } from './types'

export function Menu({ options }: Readonly<MenuProps>) {
  return (
    <div className='min-w-48 bg-paper rounded-lg flex flex-col border border-border-light shadow-md min-w-28 overflow-hidden'>
      {options.map((option, index) =>
        isGroupOption(option) ? (
          <Group {...option} key={option.key} />
        ) : (
          <Options key={`option-${option.label}-${index}`} options={[option]} />
        ),
      )}
    </div>
  )
}
