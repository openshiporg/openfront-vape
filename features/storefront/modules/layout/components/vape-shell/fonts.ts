import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google"

export const vpSans = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--vp-font-sans",
})

export const vpMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--vp-font-mono",
})
