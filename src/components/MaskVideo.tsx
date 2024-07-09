import { useCallback, useEffect, useRef } from "react"
import { gaussianBlurArea } from "./utils"

type Props = {
  stream?: MediaStream
}

const w = 640
const h = 480

function MaskVideo(props: Props) {
  const refVideo = useRef<HTMLVideoElement | null>(null)
  const refCanvas = useRef<HTMLCanvasElement | null>(null)
  const animationFrameId = useRef<number | null>(null)

  const detectObject = (ctx: CanvasRenderingContext2D) => {
    ctx.getImageData(0, 0, w, h)
    gaussianBlurArea(ctx, 100, 100, 200, 200, 10)
  }

  const drawCanvas = useCallback(() => {
    if (refVideo.current && refCanvas.current) {
      const ctx = refCanvas.current.getContext("2d", {
        willReadFrequently: true,
      })

      if (ctx) {
        ctx.drawImage(refVideo.current, 0, 0, w, h)
        detectObject(ctx)
      }
    }
  }, [])

  const setupWebcam = useCallback(async () => {
    if (refVideo.current && props.stream) {
      refVideo.current.srcObject = props.stream
      return new Promise((resolve) => {
        if (refVideo.current) {
          refVideo.current.onloadedmetadata = () => {
            resolve(refVideo.current)
          }
        }
      })
    }
  }, [props.stream])

  const startStreamCanvas = useCallback(() => {
    if (!refCanvas.current) return

    const stream = refCanvas.current.captureStream(40) // 30 FPS
    // create video and attribute
    const video = document.createElement("video")
    video.srcObject = stream
    video.width = w
    video.height = h
    video.controls = true
    video.autoplay = true

    const viewer = document.getElementById("viewer")
    if (viewer) {
      viewer.append(video)
    }
  }, [])

  const drawLoop = useCallback(() => {
    drawCanvas()
    animationFrameId.current = requestAnimationFrame(drawLoop)
  }, [drawCanvas])

  const main = useCallback(async () => {
    await setupWebcam()
    drawCanvas()
    drawLoop()
    startStreamCanvas()
  }, [drawCanvas, drawLoop, setupWebcam, startStreamCanvas])

  useEffect(() => {
    if (refVideo.current && refCanvas.current && props.stream) {
      main()
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [props.stream, main])

  return (
    <div id="viewer">
      <video
        id="userId-680"
        ref={refVideo}
        width="640"
        height="480"
        autoPlay
        className="display-none"
      ></video>
      <canvas
        ref={refCanvas}
        width="640"
        id="canvas"
        height="480"
        className="display-none"
      ></canvas>
    </div>
  )
}

export default MaskVideo
