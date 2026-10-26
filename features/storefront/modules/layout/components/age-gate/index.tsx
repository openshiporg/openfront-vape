"use client"

import { useEffect, useState } from "react"

import { AGE_COOKIE } from "./constants"

export default function AgeGate({ storeName, confirmed }: { storeName: string; confirmed: boolean }) {
  const [state, setState] = useState<"ask" | "denied" | "ok">(confirmed ? "ok" : "ask")

  useEffect(() => {
    if (state === "ask" || state === "denied") {
      document.documentElement.style.overflow = "hidden"
      return () => {
        document.documentElement.style.overflow = ""
      }
    }
  }, [state])

  if (state === "ok") return null

  const confirm = () => {
    document.cookie = `${AGE_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
    setState("ok")
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vp-age-title"
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-vp-glass/70 p-3 sm:p-6"
    >
      <div className="vp-window w-full max-w-[440px] rounded-[4px] border border-vp-glass-line p-6 shadow-[0_24px_60px_rgb(13_21_19/0.45)] sm:p-8">
        <p className="vp-sign vp-gold text-[40px] sm:text-[48px] break-words">{storeName}</p>
        <div className="mt-6 flex items-baseline gap-3 border-t border-vp-glass-line pt-5">
          <span className="font-vp-mono text-[44px] leading-none font-medium text-white">21+</span>
          <span className="text-[13px] font-medium text-white/75">Age required</span>
        </div>
        {state === "denied" ? (
          <>
            <h2 id="vp-age-title" className="mt-5 text-[20px] leading-[26px] font-semibold text-white">
              You must be 21 or older to enter.
            </h2>
            <button
              type="button"
              onClick={() => setState("ask")}
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[4px] border border-vp-glass-line bg-vp-glass-2 text-[15px] font-medium text-white hover:border-white/60"
            >
              Back
            </button>
          </>
        ) : (
          <>
            <h2 id="vp-age-title" className="mt-5 text-[20px] leading-[26px] font-semibold text-white">
              Are you 21 or older?
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setState("denied")}
                className="inline-flex h-12 items-center justify-center rounded-[4px] border border-vp-glass-line bg-vp-glass-2 text-[15px] font-medium text-white hover:border-white/60"
              >
                No
              </button>
              <button
                type="button"
                autoFocus
                onClick={confirm}
                className="inline-flex h-12 items-center justify-center rounded-[4px] bg-vp-gold text-[15px] font-semibold text-vp-ink hover:bg-[#e3c278]"
              >
                Yes, I am 21+
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
