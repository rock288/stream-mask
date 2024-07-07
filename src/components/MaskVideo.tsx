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
  const refVideoFinal = useRef<HTMLVideoElement | null>(null)
  const animationFrameId = useRef<number | null>(null)

  const drawCanvas = () => {
    if (refVideo.current && refCanvas.current) {
      const ctx = refCanvas.current.getContext("2d", {
        willReadFrequently: true,
      })

      if (ctx) {
        ctx.drawImage(refVideo.current, 0, 0, w, h)
        gaussianBlurArea(ctx, 200, 200, 200, 200, 10)
      }
    }
  }
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

  const startRecording = useCallback(() => {
    if (!refCanvas.current) return

    const stream = refCanvas.current.captureStream(40) // 30 FPS
    if (refVideoFinal.current) {
      refVideoFinal.current.srcObject = stream
    }
  }, [])

  const drawLoop = useCallback(() => {
    drawCanvas()
    animationFrameId.current = requestAnimationFrame(drawLoop)
  }, [])

  const main = useCallback(async () => {
    await setupWebcam()
    drawCanvas()
    drawLoop()
    startRecording()
  }, [drawLoop, setupWebcam, startRecording])

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
    <div>
      <video ref={refVideo} width="640" height="480" autoPlay></video>
      <canvas
        ref={refCanvas}
        width="640"
        id="canvas"
        height="480"
        // className="display-none"
      ></canvas>
      <video
        className="ml-4"
        ref={refVideoFinal}
        width="640"
        height="480"
        autoPlay
        controls
      />
    </div>
  )
}

export default MaskVideo
