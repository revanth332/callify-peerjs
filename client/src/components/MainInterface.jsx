import { useEffect, useState,useRef } from "react"
import { ChatSidebar } from "@/components/ChatSidebar"
import { ChatView } from "@/components/ChatView"
import { AddContactModal } from "@/components/AddContactModal"
import { AudioCallScreen } from "@/components/AudioCallScreen"
import { VideoCallScreen } from "@/components/VideoCallScreen"
import { IncomingCallScreen } from "@/components/IncomingCallScreen"
import {Peer} from 'peerjs';
import API from "@/services/API"
import { Loader } from "lucide-react"

// export interface Contact {
//   id: string
//   name: string
//   phoneNumber: string
//   avatar?: string
//   status: "online" | "offline" | "typing"
//   lastSeen?: string
//   lastMessage?: string
//   lastMessageTime?: string
//   unreadCount?: number
// }

// export type CallState = "none" | "audio" | "video" | "incoming-audio" | "incoming-video"

// const mockContacts = [
//   {
//     id: "1",
//     name: "Sarah Johnson",
//     phoneNumber: "+1234567890",
//     status: "online",
//     lastMessage: "Hey! How are you doing?",
//     lastMessageTime: "2:30 PM",
//     unreadCount: 2,
//   },
//   {
//     id: "2",
//     name: "Mike Chen",
//     phoneNumber: "+1234567891",
//     status: "typing",
//     lastMessage: "See you tomorrow!",
//     lastMessageTime: "1:45 PM",
//   },
//   {
//     id: "3",
//     name: "Emily Davis",
//     phoneNumber: "+1234567892",
//     status: "offline",
//     lastSeen: "Last seen 1 hour ago",
//     lastMessage: "Thanks for the help",
//     lastMessageTime: "12:15 PM",
//   },
//   {
//     id: "4",
//     name: "Alex Rodriguez",
//     phoneNumber: "+1234567893",
//     status: "online",
//     lastMessage: "Perfect! Let's do it",
//     lastMessageTime: "11:30 AM",
//   },
//   {
//     id: "5",
//     name: "Lisa Wang",
//     phoneNumber: "+1234567894",
//     status: "offline",
//     lastSeen: "Last seen yesterday",
//     lastMessage: "Good night!",
//     lastMessageTime: "Yesterday",
//   },
// ]

export function MainInterface({userInfo}) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false)
  const [callState, setCallState] = useState("none")
  const [callingContact, setCallingContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [waiting,setWaiting] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting")


  // const [recieverPeerId,setRecieverPeerId] = useState("");
  const peerInstance = useRef(null);
  const connectionRef = useRef(null);
  const audioCallRef = useRef(null);
  const peerCallRef = useRef(null);

  useEffect(() => {
    const peer = new Peer(userInfo.peerId);
    
    peer.on("open",(id) => {
      console.log("peer id ",id);
    })

    peer.on("call",async (call) => {
      console.log("incoming call",call.metadata.name);
      const contact = contacts.find(item => item.name === call.metadata.name);
      if(contact){
        call.on("close",() => {
          handleEndCall();
        })
        setCallState("incoming-audio");
        peerCallRef.current = call;
        handleIncomingCall(contact,call.metadata.type);
      }
    })
    peer.on("error", (err) => {
      console.error("PeerJS error:", err);
      // Common errors: 'peer-unavailable', 'socket-error', 'network', 'webrtc'
      // 'peer-unavailable' means the peerId you tried to connect to isn't registered or active.
    });

  peer.on("disconnected", () => {
    console.log("Disconnected from the PeerJS signaling server. Attempting to reconnect...");
    // PeerJS will attempt to reconnect automatically.
    // You might want to update UI or state here.
  });

  peer.on("close", () => {
    console.log("Peer connection completely closed (e.g., by calling peer.destroy()).");
  });
    peer.on("connection",(conn) => {
      console.log(conn)
      const proceed = window.confirm(`Do you want to connect with ${conn.metadata.name}`)
        if(proceed){
            const contact = contacts.find(item => item.name === conn.metadata.name);
            console.log(contacts,contact);
            setSelectedContact(contact);

            conn.on("open", (data) => {
              console.log("connection created",data);
            });

              conn.on("data", (data) => {
                const message = {
                  id: Date.now().toString(),
                  content: data,
                  sender: "contact",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  status: "read",
                }
              setMessages(prev => [...prev,message]);
            });

            conn.on("close",()=> {
              console.log("closed")
            })

            connectionRef.current = conn;
      }
    })
    
    peerInstance.current = peer;

    return () => {
      console.log("Cleaning up PeerJS instance...");
      if (peerInstance.current) {
        peerInstance.current.destroy(); // Important for cleanup
        peerInstance.current = null;
      }
    };
  },[userInfo,contacts]);

  useEffect(() => {
    fetchContacts(userInfo._id);
  },[userInfo._id]);

  const fetchContacts = async (userId) => {
    try{
      const result = await API.get.getContacts(userId);
      setContacts(result.contacts);
    }
    catch(err){
      console.log(err);
    }
    }

  const handlePeerConnection = (peerId,contact) => {
    try{
      console.log("connection started",peerId)
      const connection = peerInstance.current.connect(peerId,{metadata : {name:userInfo.name}});
      setWaiting(true); 
      connection.on("open",() => {
        setWaiting(false);
        setSelectedContact(contact);
      })
      connection.on("data",(data) => {
        const message = {
                id: Date.now().toString(),
                content: data,
                sender: "contact",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "read",
              }
              setMessages(prev => [...prev,message])
      })
    connectionRef.current = connection;
    }
    catch(err){
      console.log(err);
    }
  }

  const sendMessage = (text) => {
    connectionRef.current.send(text);
  }

  const handleAddContact = (newContact) => {
    const contact = {
      ...newContact,
      id: Date.now().toString(),
      status: "offline",
    }
    setContacts([contact, ...contacts])
    setShowAddContact(false)
  }

  const handleStartCall = async (contact, type) => {
    const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    const result = await API.get.getPeerId(contact._id)
    const call = peerInstance.current.call(result.peerId,audioStream,{metadata : {name:userInfo.name,type:"audio"}});
    peerCallRef.current = call;
    console.log(audioCallRef)
    call.on("stream",(remoteAudioStream) => {
      console.log("answer recieved",audioCallRef);
      setCallStatus("connected");
      audioCallRef.current.srcObject = remoteAudioStream;
    })
    call.on("close",() => {
      handleEndCall();
    })
    setCallingContact(contact);
    setCallState(type);
  }

  const handleEndCall = () => {
    setCallState("none");
    setCallingContact(null);
    peerCallRef.current.close();
    peerCallRef.current = null;
  }

  const handleIncomingCall = (contact, type) => {
    setCallingContact(contact)
    setCallState(type === "audio" ? "incoming-audio" : "incoming-video")
  }

  const handleAcceptCall = async () => {
    if (callState === "incoming-audio") {
      const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      peerCallRef.current.answer(audioStream);
      setCallState("audio");
      setCallStatus("connected");
    } else if (callState === "incoming-video") {
      setCallState("video")
    }
  }

  const handleDeclineCall = () => {
    setCallState("none")
    setCallingContact(null)
  }

  // Simulate incoming call for demo
  // const simulateIncomingCall = () => {
  //   handleIncomingCall(contacts[1], "audio")
  // }

  if (callState === "audio" && callingContact) {
    return <AudioCallScreen audioCallRef={audioCallRef} callStatus={callStatus} contact={callingContact} onEndCall={handleEndCall} />
  }

  if (callState === "video" && callingContact) {
    return <VideoCallScreen contact={callingContact} onEndCall={handleEndCall} />
  }

  if ((callState === "incoming-audio" || callState === "incoming-video") && callingContact) {
    return (
      <IncomingCallScreen
        contact={callingContact}
        callType={callState === "incoming-audio" ? "audio" : "video"}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    )
  }

  const handleUserSelection = async (contact) => {
    console.log(contact);
    if(contact.status === "online"){
      const result = await API.get.getPeerId(contact._id)
      handlePeerConnection(result.peerId,contact);
    }
  }

  return (
    <div className="h-screen bg-[#E8CBC0]/10 flex">
      {/* Sidebar */}
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={handleUserSelection}
        onAddContact={() => setShowAddContact(true)}
      />
      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedContact ? (
          <ChatView messages={messages} setMessages={setMessages} sendMessage={sendMessage} contact={selectedContact} onStartCall={handleStartCall} />
        ) : (
          waiting
          ? <div className="h-full flex items-center justify-center bg-white">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-[#E8CBC0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-[#636FA4]"> Waiting for Dharma to accept connection request </h3>
              <p className="flex justify-center text-[#636FA4]"><Loader className="animate-spin" /></p>
            </div>
          </div>
          : <div className="h-full flex items-center justify-center bg-white">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-[#E8CBC0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-[#636FA4]">Select a chat to start messaging</h3>
              <p className="text-sm text-gray-600 mb-4">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onAddContact={handleAddContact}
      />
    </div>
  )
}
