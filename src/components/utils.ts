import * as StackBlur from "stackblur-canvas"

export const gaussianBlurArea = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  // Lấy dữ liệu hình ảnh từ canvas
  const imageData = context.getImageData(x, y, width, height)

  // Sử dụng StackBlur để làm mờ
  StackBlur.imageDataRGBA(imageData, 0, 0, width, height, radius)

  // Đưa dữ liệu hình ảnh đã làm mờ trở lại canvas
  context.putImageData(imageData, x, y)
}
