import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <>
    <Toaster position="top-right" richColors duration={10000} />
    <App />
  </>
  // </StrictMode>
)
