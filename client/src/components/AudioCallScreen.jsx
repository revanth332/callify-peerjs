"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare } from "lucide-react"

// interface AudioCallScreenProps {
//   contact: Contact
//   onEndCall: () => void
// }

export function AudioCallScreen({ contact, onEndCall,callStatus,audioCallRef }) {
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
//   const [callStatus, setCallStatus] = useState<"connecting" | "connected">("connecting")

  // useEffect(() => {
  //   // Simulate call connecting
  //   const connectTimer = setTimeout(() => {
  //     setCallStatus("connected")
  //   }, 3000)

  //   return () => clearTimeout(connectTimer)
  // }, [])

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
    <div className="h-screen bg-gradient-to-br from-[#636FA4] to-[#5a6396] flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-[#E8CBC0] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>
      <audio ref={audioCallRef} autoPlay></audio>
      {/* Call Info */}
      <div className="flex flex-col items-center z-10 mb-16">
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
          {callStatus === "connecting" && (
            <div className="absolute -inset-4 border-4 border-white/30 rounded-full animate-ping" />
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-2">{contact.name}</h2>
        <p className="text-lg text-white/80 mb-2">{callStatus === "connecting" ? "Connecting..." : "Audio Call"}</p>
        {callStatus === "connected" && (
          <p className="text-white/60 text-lg font-mono">{formatDuration(callDuration)}</p>
        )}
      </div>

      {/* Call Controls */}
      <div className="flex items-center justify-center gap-6 z-10">
        {/* Mute Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className={`w-16 h-16 rounded-full border-2 border-white/30 hover:bg-white/20 ${
            isMuted ? "bg-red-500/80 border-red-400" : "bg-white/10"
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        {/* End Call Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onEndCall}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 border-2 border-red-400 shadow-lg"
        >
          <PhoneOff className="w-8 h-8" />
        </Button>

        {/* Speaker Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`w-16 h-16 rounded-full border-2 border-white/30 hover:bg-white/20 ${
            isSpeakerOn ? "bg-[#E8CBC0]/80 border-[#E8CBC0]" : "bg-white/10"
          }`}
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </Button>
      </div>

      {/* Additional Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/10 border border-white/30 hover:bg-white/20"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      </div>

      {/* Status Indicator */}
      {callStatus === "connecting" && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm">Connecting...</span>
          </div>
        </div>
      )}
    </div>
  )
}
