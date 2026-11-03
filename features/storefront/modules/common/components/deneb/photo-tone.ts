// The soft sweep behind each product is the colour of its own photo's backdrop, sampled at the
// photo's edges, so the CSS background runs seamlessly into whatever photo the store uploads.
// The same pass finds where the product sits in the frame (for crops) and its own colour.
// Dark or unreadable photos fall back to a neutral light sweep.

export type PhotoTone = {
  left: string
  right: string
  bottom: string
  dark: boolean
  /** Horizontal centre of the product in the frame, 0–100. */
  focusX: number
  /** Width / height of the photo. */
  aspect: number
  /** Mean colour of the product itself (pixels unlike the backdrop), as [r, g, b]. */
  subject: [number, number, number] | null
}

const NEUTRAL: PhotoTone = {
  left: "#eef0f2",
  right: "#eef0f2",
  bottom: "#e6e8eb",
  dark: false,
  focusX: 50,
  aspect: 1,
  subject: null,
}
const cache = new Map<string, Promise<PhotoTone>>()

const hex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")

const luminance = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

async function sample(url: string): Promise<PhotoTone> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" })
    if (!res.ok) return NEUTRAL
    const input = Buffer.from(await res.arrayBuffer())
    const sharp = (await import("sharp")).default
    const meta = await sharp(input).metadata()
    const aspect = meta.width && meta.height ? meta.width / meta.height : 1
    const W = 48
    const H = 32
    const { data } = await sharp(input).removeAlpha().resize(W, H, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true })
    const at = (x: number, y: number): [number, number, number] => {
      const i = (y * W + x) * 3
      return [data[i], data[i + 1], data[i + 2]]
    }
    const mean = (points: [number, number, number][]): [number, number, number] => {
      const s = points.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0])
      return [s[0] / points.length, s[1] / points.length, s[2] / points.length]
    }
    const column = (x: number) => mean(Array.from({ length: H - 4 }, (_, k) => at(x, k + 2)))
    const row = (y: number) => mean(Array.from({ length: W - 4 }, (_, k) => at(k + 2, y)))
    const l = column(1)
    const r = column(W - 2)
    const b = row(H - 2)

    // Foreground: pixels far from the backdrop, interpolated across the frame from left to right edge.
    let weight = 0
    let sumX = 0
    const fg: [number, number, number][] = []
    for (let x = 0; x < W; x++) {
      const t = x / (W - 1)
      const bg = [l[0] + (r[0] - l[0]) * t, l[1] + (r[1] - l[1]) * t, l[2] + (r[2] - l[2]) * t]
      for (let y = 0; y < H; y++) {
        const p = at(x, y)
        const d = Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2])
        if (d > 90) {
          weight += d
          sumX += d * x
          fg.push(p)
        }
      }
    }
    const focusX = weight > 0 ? Math.round((sumX / weight / (W - 1)) * 100) : 50
    const subject = fg.length > 8 ? mean(fg) : null

    const dark = luminance(...l) < 0.45 || luminance(...r) < 0.45
    if (dark) return { ...NEUTRAL, dark: true, focusX, aspect, subject }
    return { left: hex(...l), right: hex(...r), bottom: hex(...b), dark: false, focusX, aspect, subject }
  } catch {
    return NEUTRAL
  } finally {
    clearTimeout(timer)
  }
}

export function photoTone(url?: string | null): Promise<PhotoTone> {
  if (!url) return Promise.resolve(NEUTRAL)
  // Signed URLs change per request; the object path is the stable key.
  const key = url.split("?")[0]
  let hit = cache.get(key)
  if (!hit) {
    hit = sample(url)
    cache.set(key, hit)
    if (cache.size > 500) cache.delete(cache.keys().next().value as string)
  }
  return hit
}

function hsl([r, g, b]: [number, number, number]) {
  const R = r / 255, G = g / 255, B = b / 255
  const max = Math.max(R, G, B), min = Math.min(R, G, B)
  const L = (max + min) / 2
  const S = max === min ? 0 : L > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)
  let h = 0
  if (max !== min) {
    if (max === R) h = ((G - B) / (max - min)) % 6
    else if (max === G) h = (B - R) / (max - min) + 2
    else h = (R - G) / (max - min) + 4
  }
  return { h: (h * 60 + 360) % 360, s: S, l: L }
}

const rgbOf = (fill: string): [number, number, number] => [
  parseInt(fill.slice(1, 3), 16),
  parseInt(fill.slice(3, 5), 16),
  parseInt(fill.slice(5, 7), 16),
]

// Which of the product's colour options the photo shows: nearest hue for a coloured device,
// nearest lightness for a neutral one. Returns null when it can't tell.
export function photographedColour(tone: PhotoTone, options: { value: string; fill: string | null }[]) {
  if (!tone.subject) return null
  const s = hsl(tone.subject)
  const candidates = options.filter((o) => o.fill).map((o) => ({ ...o, c: hsl(rgbOf(o.fill!)) }))
  if (!candidates.length) return null
  if (s.s > 0.25) {
    const coloured = candidates.filter((o) => o.c.s > 0.25)
    if (!coloured.length) return null
    const dh = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))
    return coloured.sort((a, b) => dh(a.c.h, s.h) - dh(b.c.h, s.h))[0].value
  }
  const neutral = candidates.filter((o) => o.c.s <= 0.25)
  if (!neutral.length) return null
  return neutral.sort((a, b) => Math.abs(a.c.l - s.l) - Math.abs(b.c.l - s.l))[0].value
}
