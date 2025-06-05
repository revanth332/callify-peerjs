import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Phone, QrCode, Upload } from "lucide-react"

// interface AddContactModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onAddContact: (contact: Omit<Contact, "id" | "status">) => void
// }

export function AddContactModal({ isOpen, onClose, onAddContact }) {
  const [contactName, setContactName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+1")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (contactName && phoneNumber) {
      onAddContact({
        name: contactName,
        phoneNumber: `${countryCode}${phoneNumber}`,
      })
      setContactName("")
      setPhoneNumber("")
      setCountryCode("+1")
    }
  }

  const handleClose = () => {
    setContactName("")
    setPhoneNumber("")
    setCountryCode("+1")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-[#E8CBC0]/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#636FA4]" />
            Add New Contact
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
              Contact Name
            </Label>
            <Input
              id="contactName"
              type="text"
              placeholder="Enter contact name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="h-11 border-[#E8CBC0] focus:border-[#636FA4] focus:ring-[#636FA4]/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-24 h-11 border-[#E8CBC0] focus:border-[#636FA4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                  <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  <SelectItem value="+91">🇮🇳 +91</SelectItem>
                  <SelectItem value="+86">🇨🇳 +86</SelectItem>
                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-11 pl-10 border-[#E8CBC0] focus:border-[#636FA4] focus:ring-[#636FA4]/20"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 h-11 bg-[#636FA4] hover:bg-[#5a6396] text-white font-medium shadow-lg"
            >
              Add Contact
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 border-[#E8CBC0] text-[#636FA4] hover:bg-[#E8CBC0]/20"
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="border-t border-[#E8CBC0]/30 pt-4">
          <div className="text-center text-sm text-gray-500 mb-3">Or add contact using</div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-10 border-[#E8CBC0] text-[#636FA4] hover:bg-[#E8CBC0]/20">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <Button variant="outline" className="flex-1 h-10 border-[#E8CBC0] text-[#636FA4] hover:bg-[#E8CBC0]/20">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
