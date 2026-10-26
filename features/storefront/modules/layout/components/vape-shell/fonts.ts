import { Big_Shoulders, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google"

// Big Shoulders comes from Chicago's sign-painting tradition: the gold-leaf lettering on a shop window.
export const vpSign = Big_Shoulders({
  subsets: ["latin"],
  display: "swap",
  variable: "--vp-font-sign",
})

export const vpSans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--vp-font-sans",
})

export const vpMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--vp-font-mono",
})
