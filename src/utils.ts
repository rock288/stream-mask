export const gaussianBlurArea = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const imageData = context.getImageData(x, y, width, height)
  const data = imageData.data
  const w = imageData.width
  const h = imageData.height

  const extendedData = extendBorders(data, w, h, radius)
  const blurredData = applyGaussianBlur(
    extendedData,
    w + 2 * radius,
    h + 2 * radius,
    radius
  )

  const newData = new Uint8ClampedArray(data.length)
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      for (let k = 0; k < 4; k++) {
        newData[(i * w + j) * 4 + k] =
          blurredData[((i + radius) * (w + 2 * radius) + (j + radius)) * 4 + k]
      }
    }
  }

  for (let i = 0; i < newData.length; i++) {
    data[i] = newData[i]
  }
  context.putImageData(imageData, x, y)
}

const extendBorders = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray => {
  const extendedWidth = width + 2 * radius
  const extendedHeight = height + 2 * radius
  const extendedData = new Uint8ClampedArray(extendedWidth * extendedHeight * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let k = 0; k < 4; k++) {
        extendedData[((y + radius) * extendedWidth + (x + radius)) * 4 + k] =
          data[(y * width + x) * 4 + k]
      }
    }
  }

  // Extend the borders
  for (let i = 0; i < radius; i++) {
    // Top and bottom
    for (let j = 0; j < width; j++) {
      for (let k = 0; k < 4; k++) {
        extendedData[(i * extendedWidth + (j + radius)) * 4 + k] =
          data[j * 4 + k]
        extendedData[
          ((height + radius + i) * extendedWidth + (j + radius)) * 4 + k
        ] = data[((height - 1) * width + j) * 4 + k]
      }
    }

    // Left and right
    for (let j = 0; j < height; j++) {
      for (let k = 0; k < 4; k++) {
        extendedData[((j + radius) * extendedWidth + i) * 4 + k] =
          data[j * width * 4 + k]
        extendedData[
          ((j + radius) * extendedWidth + (width + radius + i)) * 4 + k
        ] = data[(j * width + (width - 1)) * 4 + k]
      }
    }
  }

  // Corners
  for (let i = 0; i < radius; i++) {
    for (let j = 0; j < radius; j++) {
      for (let k = 0; k < 4; k++) {
        extendedData[(i * extendedWidth + j) * 4 + k] = data[k]
        extendedData[(i * extendedWidth + (width + radius + j)) * 4 + k] =
          data[(width - 1) * 4 + k]
        extendedData[((height + radius + i) * extendedWidth + j) * 4 + k] =
          data[(height - 1) * width * 4 + k]
        extendedData[
          ((height + radius + i) * extendedWidth + (width + radius + j)) * 4 + k
        ] = data[((height - 1) * width + (width - 1)) * 4 + k]
      }
    }
  }

  return extendedData
}

const applyGaussianBlur = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray => {
  const weights = gaussianKernel(radius)
  const side = Math.round(Math.sqrt(weights.length))
  const halfSide = Math.floor(side / 2)

  const newData = new Uint8ClampedArray(data.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0
      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const scy = y + ky - halfSide
          const scx = x + kx - halfSide
          if (scy >= 0 && scx >= 0 && scy < height && scx < width) {
            const srcPos = (scy * width + scx) * 4
            const wt = weights[ky * side + kx]
            r += data[srcPos] * wt
            g += data[srcPos + 1] * wt
            b += data[srcPos + 2] * wt
            a += data[srcPos + 3] * wt
          }
        }
      }
      const dstPos = (y * width + x) * 4
      newData[dstPos] = r
      newData[dstPos + 1] = g
      newData[dstPos + 2] = b
      newData[dstPos + 3] = a
    }
  }

  return newData
}

const gaussianKernel = (radius: number): Float32Array => {
  const sigma = radius / 3
  const size = radius * 2 + 1
  const kernel = new Float32Array(size * size)
  let sum = 0
  let i = 0
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const value =
        (1 / (2 * Math.PI * sigma * sigma)) *
        Math.exp(-(x * x + y * y) / (2 * sigma * sigma))
      kernel[i++] = value
      sum += value
    }
  }
  for (i = 0; i < kernel.length; i++) {
    kernel[i] /= sum
  }
  return kernel
}
