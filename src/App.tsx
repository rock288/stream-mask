import { useEffect, useRef } from "react"
import "./App.css"
import { gaussianBlurArea } from "./utils"

function App() {
  const refVideo = useRef<HTMLVideoElement | null>(null)
  const refCanvas = useRef<HTMLCanvasElement | null>(null)

  function drawCanvas() {
    if (refVideo.current && refCanvas.current) {
      setInterval(function () {
        if (refVideo.current && refCanvas.current) {
          const ctx = refCanvas.current.getContext("2d")
          if (ctx) {
            ctx.drawImage(refVideo.current, 0, 0, 320, 240)
            // blurPartOfCanvas(ctx, 50, 50, 100, 100, 5) // Vị trí và kích thước phần cần làm mờ
            gaussianBlurArea(ctx, 100, 100, 100, 100, 10)
          }
        }
      }, 1000 / 30) // 1s / 30 fps
    }
  }

  const setupWebcam = async () => {
    if (refVideo.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      refVideo.current.srcObject = stream
      return new Promise((resolve) => {
        if (refVideo.current) {
          refVideo.current.onloadedmetadata = () => {
            resolve(refVideo.current)
          }
        }
      })
    }
  }

  const main = async () => {
    await setupWebcam()
    drawCanvas()
  }

  useEffect(() => {
    if (refVideo.current) {
      main()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refVideo])

  return (
    <div>
      <video ref={refVideo} width="320" height="240" autoPlay></video>

      <canvas
        ref={refCanvas}
        width="320"
        id="canvas"
        height="240"
        style={{ display: "inline" }}
      ></canvas>
    </div>
  )
}

export default App
