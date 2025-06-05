import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Video, VideoOff, Mic, MicOff, PhoneOff, RotateCcw, MessageSquare, Maximize2, Minimize2 } from "lucide-react"

// interface VideoCallScreenProps {
//   contact: Contact
//   onEndCall: () => void
// }

export function VideoCallScreen({ contact, onEndCall }) {
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callStatus, setCallStatus] = useState<"connecting" | "connected">("connecting")

  useEffect(() => {
    // Simulate call connecting
    const connectTimer = setTimeout(() => {
      setCallStatus("connected")
    }, 3000)

    return () => clearTimeout(connectTimer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let interval
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Remote Video Feed */}
      <div className="flex-1 relative bg-gradient-to-br from-[#636FA4]/20 to-[#5a6396]/20">
        {callStatus === "connecting" ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#E8CBC0] text-[#636FA4] text-3xl font-bold">
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -inset-4 border-4 border-white/30 rounded-full animate-ping" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">{contact.name}</h2>
            <p className="text-lg text-white/80">Connecting...</p>
          </div>
        ) : (
          <div className="h-full bg-gradient-to-br from-[#636FA4]/30 to-[#5a6396]/30 flex items-center justify-center">
            <div className="text-center text-white">
              <Avatar className="w-48 h-48 mx-auto mb-4 border-4 border-white/20">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#E8CBC0] text-[#636FA4] text-6xl font-bold">
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-3xl font-semibold">{contact.name}</h2>
            </div>
          </div>
        )}

        {/* Call Info Overlay */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
            <p className="text-sm font-medium">{contact.name}</p>
            {callStatus === "connected" && (
              <p className="text-xs text-white/80 font-mono">{formatDuration(callDuration)}</p>
            )}
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border border-white/20"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Local Video Feed (Picture-in-Picture) */}
      <div className="absolute bottom-24 right-4 w-32 h-24 bg-[#636FA4] rounded-lg border-2 border-white/20 shadow-lg overflow-hidden z-10">
        {isVideoOn ? (
          <div className="h-full bg-gradient-to-br from-[#E8CBC0]/50 to-[#636FA4]/50 flex items-center justify-center">
            <span className="text-white text-xs">You</span>
          </div>
        ) : (
          <div className="h-full bg-gray-800 flex items-center justify-center">
            <VideoOff className="w-6 h-6 text-white/60" />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center justify-center gap-4 bg-black/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
          {/* Mute Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full border border-white/30 hover:bg-white/20 ${
              isMuted ? "bg-red-500/80 border-red-400" : "bg-white/10"
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </Button>

          {/* Video Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-12 h-12 rounded-full border border-white/30 hover:bg-white/20 ${
              !isVideoOn ? "bg-red-500/80 border-red-400" : "bg-white/10"
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
          </Button>

          {/* End Call Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 border-2 border-red-400 shadow-lg"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>

          {/* Switch Camera Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/10 border border-white/30 hover:bg-white/20"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </Button>

          {/* Chat Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/10 border border-white/30 hover:bg-white/20"
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {callStatus === "connecting" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm">Connecting video call...</span>
          </div>
        </div>
      )}
    </div>
  )
}
