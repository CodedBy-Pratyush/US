import * as THREE from 'three'

// ---------- Canvas texture helpers (no external fonts / assets) ----------

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy)
      line = word
      yy += lineHeight
    } else line = test
  }
  if (line) ctx.fillText(line, x, yy)
  return yy
}

/** Elegant plaque texture for a quote / love note. */
export function quoteTexture(text) {
  const [c, ctx] = makeCanvas(512, 384)
  ctx.fillStyle = '#f7ecd7'
  ctx.fillRect(0, 0, 512, 384)
  ctx.strokeStyle = '#b98a2f'
  ctx.lineWidth = 4
  ctx.strokeRect(18, 18, 476, 348)
  ctx.strokeStyle = 'rgba(185,138,47,.45)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(30, 30, 452, 324)
  ctx.fillStyle = '#7a1f2b'
  ctx.font = '42px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('❦', 256, 84)
  ctx.fillStyle = '#3d2320'
  ctx.font = 'italic 34px Georgia, serif'
  wrapText(ctx, text, 256, 150, 400, 46)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Big text panel for the final wall. */
export function finalWallTexture(lines) {
  const [c, ctx] = makeCanvas(1024, 420)
  ctx.clearRect(0, 0, 1024, 420)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f3d98b'
  ctx.font = '600 54px Georgia, serif'
  wrapText(ctx, lines.title, 512, 96, 920, 64)
  ctx.fillStyle = '#fff6e6'
  ctx.font = 'italic 46px Georgia, serif'
  wrapText(ctx, lines.message, 512, 226, 920, 56)
  ctx.fillStyle = '#e8b4b8'
  ctx.font = '38px Georgia, serif'
  ctx.fillText(lines.date, 512, 336)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.transparent = true
  return tex
}

/** Placeholder shown until the owner drops in a real photo. */
export function placeholderTexture(caption, filename) {
  const [c, ctx] = makeCanvas(512, 640)
  const g = ctx.createLinearGradient(0, 0, 512, 640)
  g.addColorStop(0, '#5b2333')
  g.addColorStop(1, '#2a0d16')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 640)
  ctx.strokeStyle = 'rgba(243,217,139,.6)'
  ctx.lineWidth = 3
  ctx.strokeRect(24, 24, 464, 592)
  ctx.fillStyle = '#f3d98b'
  ctx.font = '64px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('❤', 256, 250)
  ctx.fillStyle = '#fff6e6'
  ctx.font = 'italic 30px Georgia, serif'
  wrapText(ctx, caption || 'Our Memory', 256, 330, 400, 40)
  ctx.fillStyle = 'rgba(255,246,230,.65)'
  ctx.font = '21px monospace'
  wrapText(ctx, `Add your photo: public${filename}`, 256, 520, 420, 28)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Small caption plate under a frame. */
export function captionTexture(text) {
  const [c, ctx] = makeCanvas(512, 80)
  ctx.fillStyle = '#2a1710'
  ctx.fillRect(0, 0, 512, 80)
  ctx.strokeStyle = '#b98a2f'
  ctx.lineWidth = 2
  ctx.strokeRect(4, 4, 504, 72)
  ctx.fillStyle = '#f3d98b'
  ctx.font = 'italic 30px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(text, 256, 52)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Little "Happy Anniversary" sign for the cake. */
export function cakeSignTexture() {
  const [c, ctx] = makeCanvas(512, 144)
  ctx.clearRect(0, 0, 512, 144)
  ctx.beginPath()
  ctx.roundRect(10, 10, 492, 124, 26)
  ctx.fillStyle = '#43101d'
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = '#d4af37'
  ctx.stroke()
  ctx.fillStyle = '#f3d98b'
  ctx.font = 'italic 600 52px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Happy Anniversary', 256, 76)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** A single big emoji on a transparent canvas (floating hearts). */
export function emojiTexture(emoji) {
  const [c, ctx] = makeCanvas(160, 160)
  ctx.font = '120px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 80, 88)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Floating name tag ("Babai❤️") rendered as a billboard sprite. */
export function nameTagTexture(text) {
  const [c, ctx] = makeCanvas(640, 160)
  ctx.clearRect(0, 0, 640, 160)
  // Pill background
  const r = 70
  ctx.beginPath()
  ctx.roundRect(14, 18, 612, 124, r)
  ctx.fillStyle = 'rgba(43,8,18,0.88)'
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = '#d4af37'
  ctx.stroke()
  ctx.fillStyle = '#ffe9b0'
  ctx.font = '600 62px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 320, 84)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Procedural walnut plank floor — no external texture needed. */
export function woodFloorTexture() {
  const [c, ctx] = makeCanvas(512, 512)
  ctx.fillStyle = '#4a2e1c'
  ctx.fillRect(0, 0, 512, 512)
  const plankH = 64
  for (let y = 0; y < 512; y += plankH) {
    const shade = 0.9 + Math.random() * 0.25
    ctx.fillStyle = `rgb(${Math.round(84 * shade)},${Math.round(52 * shade)},${Math.round(32 * shade)})`
    ctx.fillRect(0, y, 512, plankH - 3)
    ctx.strokeStyle = 'rgba(30,16,8,.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, y, 512, plankH - 3)
    // grain
    ctx.strokeStyle = 'rgba(40,22,10,.35)'
    ctx.lineWidth = 1
    for (let i = 0; i < 7; i++) {
      const gy = y + 8 + Math.random() * (plankH - 18)
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.bezierCurveTo(170, gy + 4, 340, gy - 4, 512, gy + 2)
      ctx.stroke()
    }
    // plank joints
    const joint = Math.random() * 400
    ctx.fillStyle = 'rgba(30,16,8,.8)'
    ctx.fillRect(joint, y, 3, plankH - 3)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 4)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}
