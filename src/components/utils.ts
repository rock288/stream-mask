const pixelate = (
  ctx: CanvasRenderingContext2D,
  xx: number,
  yy: number,
  width: number,
  height: number,
  pixelSize: number
) => {
  for (let y = xx; y < height + xx; y += pixelSize) {
    for (let x = yy; x < width + yy; x += pixelSize) {
      const pixel = ctx.getImageData(x, y, pixelSize, pixelSize)
      let r = 0,
        g = 0,
        b = 0,
        a = 0
      for (let i = 0; i < pixel.data.length; i += 4) {
        r += pixel.data[i]
        g += pixel.data[i + 1]
        b += pixel.data[i + 2]
        a += pixel.data[i + 3]
      }
      r = r / (pixel.data.length / 4)
      g = g / (pixel.data.length / 4)
      b = b / (pixel.data.length / 4)
      a = a / (pixel.data.length / 4)
      ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`
      ctx.fillRect(x, y, pixelSize, pixelSize)
    }
  }
}

export const gaussianBlurArea = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  pixelate(context, x, y, width, height, radius)
}
