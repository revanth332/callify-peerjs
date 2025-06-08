import { useState, useEffect,useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, Phone, Video} from "lucide-react"
import {  } from "lucide-react"


export function AudioCallScreen({ contact, onEndCall,callStatus,audioCallRef,onAccept, onDecline,handleRemoteStreamMute,isMuted,isAudioAllowed}) {
  const [callDuration, setCallDuration] = useState(0)
  // const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const callType = callStatus.includes("audio") ? "audio" : "video";
  const [isRinging, setIsRinging] = useState(true);
  const ringIntervalRef = useRef(null);

  useEffect(() => {
    let interval
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

    useEffect(() => {
    const interval = setInterval(() => {
      setIsRinging((prev) => !prev)
    }, 1000)
    ringIntervalRef.current = interval;
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#636FA4] to-[#5a6396] flex flex-col items-center justify-center text-white relative overflow-hidden">
      <audio ref={audioCallRef} muted={isAudioAllowed} autoPlay></audio>
      
      {
        (callStatus === "incoming-audio" || callStatus === "incoming-video")
        ? <>
          {/* Background Animation */}
          <div className="absolute inset-0 opacity-20">
            <div
              className={`absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl transition-all duration-1000 ${isRinging ? "scale-110" : "scale-100"}`}
            />
            <div
              className={`absolute bottom-32 right-16 w-48 h-48 bg-[#E8CBC0] rounded-full blur-3xl transition-all duration-1000 ${isRinging ? "scale-90" : "scale-100"}`}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Incoming Call Info */}
          <div className="flex flex-col items-center z-10 mb-16">
            <div className="text-center mb-8">
              <p className="text-lg text-white/80 mb-2">Incoming {callType} call</p>
              <div className="flex items-center justify-center gap-2 text-white/60">
                {callType === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                <span className="text-sm">{callType === "video" ? "Video Call" : "Voice Call"}</span>
              </div>
            </div>

            <div className="relative mb-6">
              <Avatar
                className={`w-40 h-40 border-4 border-white/30 shadow-2xl transition-all duration-500 ${isRinging ? "scale-105" : "scale-100"}`}
              >
                <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#E8CBC0] text-[#636FA4] text-4xl font-bold">
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* Pulsing Ring Animation */}
              <div
                className={`absolute -inset-6 border-4 border-white/40 rounded-full transition-all duration-1000 ${isRinging ? "scale-110 opacity-100" : "scale-100 opacity-60"}`}
              />
              <div
                className={`absolute -inset-12 border-2 border-white/20 rounded-full transition-all duration-1000 ${isRinging ? "scale-110 opacity-60" : "scale-100 opacity-30"}`}
              />
            </div>

            <h2 className="text-3xl font-semibold mb-2">{contact.name}</h2>
            <p className="text-lg text-white/80">{contact.phoneNumber}</p>
          </div>

          {/* Call Action Buttons */}
          <div className="flex items-center justify-center gap-12 z-10">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onDecline}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 border-2 border-red-400 shadow-lg transition-transform hover:scale-105"
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
              <span className="text-sm text-white/80">Decline</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {onAccept();setIsRinging(false);clearInterval(ringIntervalRef.current)}}
                className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 border-2 border-green-400 shadow-lg transition-transform hover:scale-105"
              >
                <Phone className="w-8 h-8" />
              </Button>
              <span className="text-sm text-white/80">Accept</span>
            </div>
          </div>

          {/* Additional Options */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/10 border border-white/30 hover:bg-white/20"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Ringing Indicator */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div
                className={`w-2 h-2 bg-white rounded-full transition-all duration-300 ${isRinging ? "animate-pulse" : ""}`}
              />
              <span className="text-sm">Ringing...</span>
            </div>
          </div>
          </>
        : <>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-[#E8CBC0] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
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
            onClick={() => handleRemoteStreamMute()}
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
          </>
      }
      

    </div>
  )
}
