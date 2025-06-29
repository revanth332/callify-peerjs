import { useState,useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Video, MoreVertical, Send, Paperclip, Smile, ArrowBigLeftIcon, ArrowLeft, File, Download, FileIcon,FileAudio,Image } from "lucide-react";
import CircularProgressBar from "./ui/circular-progress-bar";
import EmojiPicker from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function ChatView({ contact, onStartCall,sendMessage,messages,setMessages,sendFile,uploadingStatus,sendingFileId,closeChat}) {
  const [newMessage, setNewMessage] = useState("");
  const [isEmojiModelOpen, setIsEmojiModelOpen] = useState(false);
  const fileRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the messages when they change
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    try{
      e.preventDefault()
      if (!newMessage.trim()) return

      // const message = {
      //   id: Date.now().toString(),
      //   type:"file",
      //   fileId : Date.now().toString(),
      //   content: newMessage,
      //   fileSize:"123.4kb",
      //   sender: "me",
      //   timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      //   status: "sent",
      // }
      const message = {
        id: Date.now().toString(),
        type: "text",
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

  const downloadFile = (fileUrl,name) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    // setIsPickerOpen(false);
  };

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
            <ArrowLeft className="text-[#636FA4]" onClick={() => closeChat()} />
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
              {
                message.type === "text"
                ? <p className="text-sm">{message.content}</p>
                : <div className="flex gap-2 p-2">
                  <div className="border-r pr-1 flex justify-center items-center">
                    {
                      message.content.includes(".mp4") || message.content.includes(".mov")
                      ? <Video className="h-10 w-10" />
                      : message.content.includes(".mp3") || message.content.includes(".wav")
                        ? <FileAudio className="h-10 w-10" />
                        : message.content.includes(".pdf")
                          ? <File className="h-10 w-10" />
                          : message.content.includes(".jpg") || message.content.includes(".png") || message.content.includes(".jpeg")
                            ? <Image src={message.fileUrl} alt={message.content} className="h-10 w-10 object-cover rounded-md" />
                            : message.content.includes(".docx") || message.content.includes(".xlsx")
                              ? <FileIcon className="h-10 w-10" />
                              : <FileIcon className="h-10 w-10" /> // Default icon for other file types
                    }
                  </div>
                  <div className="w-full flex gap-2">
                    <div className="w-[130px]">
                      <p className="text-ellipsis overflow-hidden text-nowrap">{message.content}</p>
                
                      
                      <p>{message.fileSize}</p>
                    </div>
                    <div className="flex justify-center items-center">
                      {
                        sendingFileId === message.fileId && <CircularProgressBar value={uploadingStatus} size="sm" color="green" />
                      }
                    </div>
                  </div>
                  {message.fileUrl && <div>
                    <Download onClick={() => downloadFile(message.fileUrl,message.content)} />
                  </div>
                  }
                  </div>
              }
              <div
                className={`flex flex-col items-end justify-center gap-1 mt-1 ${
                  message.sender === "me" ? "text-gray-200" : "text-gray-500"
                }`}
              >
                <div className="flex justify-center w-full">
                  {message.fileUrl && (
                        message.content.includes(".mp4") || message.content.includes(".mov")
                        ? <video src={message.fileUrl} controls className="object-cover rounded-md" />
                        : message.content.includes(".mp3") || message.content.includes(".wav")
                          ? <audio src={message.fileUrl} controls className="object-cover rounded-md" />
                          : message.content.includes(".jpg") || message.content.includes(".png") || message.content.includes(".jpeg")
                            ? <img src={message.fileUrl} alt={message.content} className="object-cover rounded-md" />
                            : message.content
                        )
                  }
                </div>

                <span className="text-xs">{message.timestamp}</span>
                {/* {message.sender === "me" && (
                  <div className="flex">
                    {message.status === "sent" && <span className="text-xs">✓</span>}
                    {message.status === "delivered" && <span className="text-xs">✓✓</span>}
                    {message.status === "read" && <span className="text-xs text-[#E8CBC0]">✓✓</span>}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        ))}
        <p ref={messagesEndRef}></p>
      </div>
        {isEmojiModelOpen && <div className="absolute flex justify-center w-full bottom-16 py-3 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>}
      {/* Message Input */}
      <div className="p-4 border-t border-[#E8CBC0]/30 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Button
            onClick={() => fileRef.current.click()}
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/20"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
            <input
              type="file"
              className="hidden"
              ref={fileRef}
              onChange={(e) => sendFile(e.target.files[0])}
            />

          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="pr-12 h-12 border-[#E8CBC0] focus:border-[#636FA4] rounded-full bg-[#E8CBC0]/10 focus:bg-white"
            />
            {/* <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/20"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-full bottom-5 p-0">
                <div className="w-full">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              </PopoverContent>
            </Popover> */}

                <Button
                  onClick={() => setIsEmojiModelOpen(!isEmojiModelOpen)}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/20"
                >
                  <Smile className="w-4 h-4" />
                </Button>
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
