import { useEffect, useState } from "react"
import MaskVideo from "./components/MaskVideo"
import "./App.css"

function App() {
  const [stream, setStream] = useState<MediaStream>()

  const getStream = async () => {
    setStream(await navigator.mediaDevices.getUserMedia({ video: {} }))
  }

  useEffect(() => {
    getStream()
  }, [])

  return (
    <div>
      <MaskVideo stream={stream} />
    </div>
  )
}

export default App
