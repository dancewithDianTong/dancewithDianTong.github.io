// ===== Import Pretext =====
import { prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext'

// ===== Canvas =====
const canvas = document.getElementById('c')
const ctx = canvas.getContext('2d')
const dpr = Math.min(window.devicePixelRatio || 1, 2)

let W, H

// ===== TEXT =====
const TEXT = `Welcome! I am Diantong, a senior undergraduate student. 
My research focuses on data-driven decision-making under uncertainty, 
especially Bayesian Optimization and its real-world applications.`

// ===== SETTINGS =====
const FONT = '16px Georgia, serif'
const LINE_HEIGHT = 22

let chars = []
let dots = []

const DOT_COLORS = ['#9b59b6','#e67e22','#1abc9c','#e74c3c','#3498db','#2ecc71']
let colorIdx = 0

// ===== Resize =====
function resize() {
  W = window.innerWidth
  H = window.innerHeight

  canvas.width = W * dpr
  canvas.height = H * dpr

  layoutText()
}

// ===== Layout using Pretext =====
function layoutText() {
  const prepared = prepareWithSegments(TEXT, FONT)
  const { lines } = layoutWithLines(prepared, W - 40, LINE_HEIGHT)

  chars = []

  lines.forEach((line, lineIndex) => {
    let x = 20
    let y = 40 + lineIndex * LINE_HEIGHT

    for (let i = 0; i < line.text.length; i++) {
      const ch = line.text[i]

      chars.push({
        ch,
        baseX: x,
        baseY: y,
        x,
        y,
        dx: 0,
        dy: 0
      })

      // advance cursor (approximate width)
      const spacing = 2.0
      x += ctx.measureText(ch).width * spacing
    }
  })
}

// ===== Interaction =====
function addDot(x, y) {
  dots.push({
    x,
    y,
    color: DOT_COLORS[colorIdx % DOT_COLORS.length],
    time: 0,
    radius: 0
  })
  colorIdx++
}

canvas.addEventListener('pointerdown', e => {
  addDot(e.clientX, e.clientY)
})

canvas.addEventListener('pointermove', e => {
  if (e.buttons > 0 && Math.random() < 0.08) {
    addDot(e.clientX, e.clientY)
  }
})

// ===== Animation =====
function frame() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)

  ctx.fillStyle = '#f5f2ed'
  ctx.fillRect(0, 0, W, H)

  // update dots
  for (const dot of dots) {
    dot.time += 0.016
    dot.radius = dot.time * 120
  }

  dots = dots.filter(d => d.time < 6)

  // compute ripple
  for (const c of chars) {
    c.dx = 0
    c.dy = 0

    for (const dot of dots) {
      const dx = c.baseX - dot.x
      const dy = c.baseY - dot.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      const rippleWidth = 60
      const diff = Math.abs(dist - dot.radius)

      if (diff < rippleWidth) {
        const wave = Math.cos((diff / rippleWidth) * Math.PI * 0.5)
        const strength = wave * 30

        if (dist > 1) {
          c.dx += (dx / dist) * strength
          c.dy += (dy / dist) * strength
        }
      }
    }

    c.x = c.baseX + c.dx
    c.y = c.baseY + c.dy
  }

  // draw text
  ctx.font = FONT
  ctx.textBaseline = 'top'

  for (const c of chars) {
    ctx.fillStyle = '#333'
    ctx.fillText(c.ch, c.x, c.y)
  }

  requestAnimationFrame(frame)
}

// ===== Init =====
window.addEventListener('resize', resize)
resize()
requestAnimationFrame(frame)