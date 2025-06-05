import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Phone } from "lucide-react"


export function LoginScreen({ onLogin }) {
  const [fullName, setFullName] = useState("Revanth")
  const [phoneNumber, setPhoneNumber] = useState("9959965916")
  const [countryCode, setCountryCode] = useState("+1")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (fullName && phoneNumber) {
      onLogin(fullName,phoneNumber)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#636FA4] rounded-full mb-4 shadow-lg">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Callify</h1>
          <p className="text-gray-700">Connect with friends and family</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#E8CBC0]/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 border-[#E8CBC0] focus:border-[#636FA4] focus:ring-[#636FA4]/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-24 h-12 border-[#E8CBC0] focus:border-[#636FA4]">
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
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 pl-10 border-[#E8CBC0] focus:border-[#636FA4] focus:ring-[#636FA4]/20"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#636FA4] hover:bg-[#5a6396] text-white font-medium rounded-xl transition-colors shadow-lg"
            >
              Continue
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  )
}
