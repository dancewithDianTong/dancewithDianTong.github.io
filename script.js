// ===== Import Pretext from CDN =====
import { prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext'

// ===== Canvas setup =====
const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener("resize", resizeCanvas)

// ===== Text setup (Pretext) =====
const text = "Click anywhere on this page to create a ripple effect over this text."
const prepared = prepareWithSegments(text, '20px Arial')

// layout width relative to screen
let layoutWidth = Math.min(600, window.innerWidth - 40)
let lineHeight = 28

let { lines } = layoutWithLines(prepared, layoutWidth, lineHeight)

// recompute layout on resize
window.addEventListener("resize", () => {
  layoutWidth = Math.min(600, window.innerWidth - 40)
  const result = layoutWithLines(prepared, layoutWidth, lineHeight)
  lines = result.lines
})

// ===== Drawing settings =====
ctx.font = "20px Arial"
ctx.fillStyle = "#000"

// ===== Ripple state =====
let ripples = []

canvas.addEventListener("click", (e) => {
  ripples.push({
    x: e.offsetX,
    y: e.offsetY,
    radius: 0,
    life: 0
  })
})

// ===== Animation loop =====
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // update ripples
  ripples.forEach(r => {
    r.radius += 3
    r.life += 1
  })

  // remove old ripples
  ripples = ripples.filter(r => r.life < 120)

  // draw text with distortion
  lines.forEach((line, i) => {
    let baseX = 20
    let baseY = 60 + i * lineHeight

    let offsetY = 0

    ripples.forEach(r => {
      const dx = baseX - r.x
      const dy = baseY - r.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      const diff = dist - r.radius

      if (Math.abs(diff) < 30) {
        offsetY += Math.sin(diff * 0.2) * 6 * Math.exp(-Math.abs(diff) / 30)
      }
    })

    ctx.fillText(line.text, baseX, baseY + offsetY)
  })

  requestAnimationFrame(animate)
}

// ===== Start animation =====
animate()