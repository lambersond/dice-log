declare module '@3d-dice/dice-box-threejs' {
  type DiceBoxOptions = Partial<{
    assetPath: string
    framerate: number
    sounds: boolean
    volume: number
    color_spotlight: number
    shadows: boolean
    theme_surface: string
    sound_dieMaterial: string
    theme_customColorset: unknown
    theme_colorset: string
    theme_texture: string
    theme_material: string
    gravity_multiplier: number
    light_intensity: number
    baseScale: number
    strength: number
    onRollComplete: (results: unknown) => void
  }>

  export default class DiceBox {
    constructor(containerSelector: string, options?: DiceBoxOptions)
    initialize(): Promise<void>
    roll(
      notation: string | string[],
    ): Promise<{ sets: Array<{ rolls: Array<{ value: number }> }> }>
    add(notation: string | string[]): Promise<Array<{ value: number }>>
    clearDice(): void
    updateConfig(config: DiceBoxOptions): Promise<void>
  }
}
