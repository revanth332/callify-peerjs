import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Video, MoreVertical, Send, Paperclip, Smile, ArrowBigLeftIcon, ArrowLeft } from "lucide-react"

export function ChatView({ contact, onStartCall,sendMessage,messages,setMessages,setIsSidebarOpen }) {
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e) => {
    try{
      e.preventDefault()
      if (!newMessage.trim()) return

      const message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "me",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      }
      sendMessage(newMessage);
      setMessages([...messages, message]);
      setNewMessage("");
    }
    catch(err){
      console.log(err);
    }

  }

  const getStatusIndicator = () => {
    switch (contact.status) {
      case "online":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case "typing":
        return <span className="text-[#636FA4] text-sm">typing...</span>
      default:
        return <span className="text-gray-500 text-sm">{contact.lastSeen || "offline"}</span>
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#E8CBC0]/30 bg-gradient-to-r from-[#E8CBC0]/10 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeft className="text-[#636FA4]" onClick={() => setIsSidebarOpen(true)} />
            <Avatar className="w-10 h-10">
              <AvatarImage src={contact.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-[#E8CBC0]/50 text-[#636FA4] font-medium">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-[#636FA4]">{contact.name}</h2>
              <div className="flex items-center gap-2">{getStatusIndicator()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStartCall(contact, "audio")}
              className="h-10 w-10 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/30"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStartCall(contact, "video")}
              className="h-10 w-10 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/30"
            >
              <Video className="w-5 h-5" />
            </Button>
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/30"
            >
              <MoreVertical className="w-5 h-5" />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#E8CBC0]/5 to-white">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === "me"
                  ? "bg-[#636FA4] text-white rounded-br-md shadow-md"
                  : "bg-white text-gray-900 rounded-bl-md shadow-sm border border-[#E8CBC0]/30"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div
                className={`flex items-center justify-end gap-1 mt-1 ${
                  message.sender === "me" ? "text-gray-200" : "text-gray-500"
                }`}
              >
                <span className="text-xs">{message.timestamp}</span>
                {message.sender === "me" && (
                  <div className="flex">
                    {message.status === "sent" && <span className="text-xs">✓</span>}
                    {message.status === "delivered" && <span className="text-xs">✓✓</span>}
                    {message.status === "read" && <span className="text-xs text-[#E8CBC0]">✓✓</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[#E8CBC0]/30 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Button
            disabled  
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/20"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="pr-12 h-12 border-[#E8CBC0] focus:border-[#636FA4] rounded-full bg-[#E8CBC0]/10 focus:bg-white"
            />
            {/* <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/20"
            >
              <Smile className="w-4 h-4" />
            </Button> */}
          </div>

          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 bg-[#636FA4] hover:bg-[#5a6396] rounded-full shadow-lg"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
