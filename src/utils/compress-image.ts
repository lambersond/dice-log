type Options = {
  /** Target byte budget for the resulting data URL string. */
  maxBytes?: number
  /** Longest-edge ceiling in pixels. */
  maxDim?: number
}

const QUALITY_STEPS = [0.92, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3] as const

/**
 * Reads `file`, downscales it onto a canvas, and returns a JPEG data URL no
 * larger than `maxBytes`. Iterates the JPEG quality knob until it fits, then
 * returns the smallest attempt as a fallback.
 */
export async function compressImage(
  file: File,
  { maxBytes = 30_000, maxDim = 192 }: Options = {},
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d context unavailable')
    ctx.drawImage(bitmap, 0, 0, width, height)

    let smallest = canvas.toDataURL('image/jpeg', QUALITY_STEPS[0])
    for (const quality of QUALITY_STEPS) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      if (dataUrl.length < smallest.length) smallest = dataUrl
      if (dataUrl.length <= maxBytes) return dataUrl
    }
    return smallest
  } finally {
    bitmap.close?.()
  }
}
