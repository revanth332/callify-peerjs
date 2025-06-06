"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MessageCircle, MoreVertical, RefreshCcw, Sidebar } from "lucide-react"

// interface ChatSidebarProps {
//   contacts: Contact[]
//   selectedContact: Contact | null
//   onSelectContact: (contact: Contact) => void
//   onAddContact: () => void
// }

export function ChatSidebar({ contacts, selectedContact, onSelectContact, onAddContact,fetchContacts,userId,setIsSidebarOpen,isSidebarOpen }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusIndicator = (contact) => {
    switch (contact.status) {
      case "online":
        return <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      case "typing":
        return <div className="w-3 h-3 bg-[#636FA4] rounded-full border-2 border-white animate-pulse" />
      default:
        return null
    }
  }

  const getStatusText = (contact) => {
    switch (contact.status) {
      case "online":
        return "Online"
      case "typing":
        return "Typing..."
      case "offline":
        return contact.lastSeen || "Offline"
      default:
        return "Offline"
    }
  }

  return (
    <div className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-[100%] transition-all duration-300 absolute z-10 h-screen bg-white border-r border-[#E8CBC0]/50 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-[#E8CBC0]/30 bg-gradient-to-r from-[#E8CBC0]/20 to-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#636FA4] rounded-full flex items-center justify-center shadow-md">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-[#636FA4]">Chats</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddContact}
              className="h-9 w-9 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/30"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => fetchContacts(userId)}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/30"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsSidebarOpen(false)}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#636FA4] hover:text-[#636FA4] hover:bg-[#E8CBC0]/30"
            >
              <Sidebar className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-[#E8CBC0]/10 border-[#E8CBC0] focus:bg-white focus:border-[#636FA4]"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact._id}
            onClick={() => onSelectContact(contact)}
            className={`p-4 border-b border-[#E8CBC0]/20 cursor-pointer transition-colors hover:bg-[#E8CBC0]/10 ${
              selectedContact?._id === contact._id ? "bg-[#E8CBC0]/20 border-[#636FA4]/30" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-[#E8CBC0]/50 text-[#636FA4] font-medium">
                    {contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">{getStatusIndicator(contact)}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                  <div className="flex items-center gap-2">
                    {contact.lastMessageTime && (
                      <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                    )}
                    {contact.unreadCount && (
                      <Badge className="bg-[#636FA4] text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        {contact.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage || "No messages yet"}</p>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    contact.status === "online"
                      ? "text-green-600"
                      : contact.status === "typing"
                        ? "text-[#636FA4]"
                        : "text-gray-500"
                  }`}
                >
                  {getStatusText(contact)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
