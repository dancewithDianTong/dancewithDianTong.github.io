// ===== Canvas setup =====
const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener("resize", resizeCanvas)

// ===== Capture page as image =====
let pageImage = null

async function capturePage() {
  const tempCanvas = await html2canvas(document.body)
  pageImage = tempCanvas
}

capturePage()

// ===== Ripple state =====
let ripples = []

canvas.addEventListener("click", (e) => {
  ripples.push({
    x: e.clientX,
    y: e.clientY,
    radius: 0,
    life: 0
  })
})

// ===== Animation =====
function animate() {
  if (!pageImage) {
    requestAnimationFrame(animate)
    return
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // draw base image
  ctx.drawImage(pageImage, 0, 0)

  // get pixels
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let data = imageData.data

  // apply ripple distortion
  ripples.forEach(r => {
    r.radius += 3
    r.life += 1

    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {

        const dx = x - r.x
        const dy = y - r.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        const diff = dist - r.radius

        if (Math.abs(diff) < 20) {
          const offset = Math.sin(diff * 0.3) * 3

          const sx = Math.floor(x + dx / dist * offset)
          const sy = Math.floor(y + dy / dist * offset)

          if (sx >= 0 && sy >= 0 && sx < canvas.width && sy < canvas.height) {
            const i = (y * canvas.width + x) * 4
            const si = (sy * canvas.width + sx) * 4

            data[i] = data[si]
            data[i + 1] = data[si + 1]
            data[i + 2] = data[si + 2]
          }
        }
      }
    }
  })

  // clean old ripples
  ripples = ripples.filter(r => r.life < 80)

  ctx.putImageData(imageData, 0, 0)

  requestAnimationFrame(animate)
}

animate()