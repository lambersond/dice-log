export type DieSides = 4 | 6 | 8 | 10 | 12 | 20 | 100

export const DIE_SIDES: readonly DieSides[] = [4, 6, 8, 10, 12, 20, 100]

export type Advantage = 'adv' | 'dis'

export type RollerInfo = {
  id: string
  name?: string
  image?: string
}

export type DiePool = {
  sides: DieSides
  count: number
  /** length === count; each inner array is 1 (normal) or 2 (adv/dis applied to a d20) */
  rolls: number[][]
  /** length === count; the value chosen from each die's rolls (max for adv, min for dis) */
  kept: number[]
  /**
   * Optional, length === count; explosion chain for each die.
   * Only present when at least one die exploded.
   */
  explosions?: number[][]
}

export type RollRequest = {
  pools: ReadonlyArray<{ sides: DieSides; count: number }>
  modifier: number
  advantage?: Advantage
  /** When true, dice that roll their max value spawn another die of the same kind, recursively. */
  exploding?: boolean
}

export type RollTheme = {
  /** dice-box-threejs `theme_colorset` lookup key, or `'custom'` when the
   *  roller has provided their own hex via `customColor`. */
  colorset: string
  /** dice-box-threejs `theme_material` value */
  material: string
  /** When `colorset === 'custom'`, the hex color (e.g. `#ff0066`) to feed
   *  through `theme_customColorset`. */
  customColor?: string
}

export type RollResult = {
  id: string
  at: number
  roller: RollerInfo
  pools: DiePool[]
  modifier: number
  advantage?: Advantage
  total: number
  /** Roller's dice theme at roll time. Other clients use this to render the
   *  dice in the originating user's chosen style. */
  theme?: RollTheme
}
