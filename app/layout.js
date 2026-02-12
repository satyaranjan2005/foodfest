import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'FoodFest 2026 - Order Your Favorite Food',
  description: 'College FoodFest ordering system with UPI payments',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
