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
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-vp-ink/40 backdrop-blur-md p-3 sm:p-6"
    >
      <div className="w-full max-w-[420px] rounded-[28px] bg-vp-bg p-6 sm:p-8 shadow-[0_24px_80px_rgb(20_24_22/0.35)]">
        <p className="font-vp-mono text-[12px] uppercase tracking-[0.14em] text-vp-ink-2">{storeName}</p>
        <div className="mt-8 flex items-baseline gap-3">
          <span className="font-vp-mono text-[56px] leading-none font-medium text-vp-ink">21+</span>
          <span className="text-[13px] font-medium text-vp-ink-2">Age required</span>
        </div>
        {state === "denied" ? (
          <>
            <h2 id="vp-age-title" className="mt-6 text-[22px] leading-[28px] font-semibold tracking-[-0.01em] text-vp-ink">
              You must be 21 or older to enter.
            </h2>
            <button
              type="button"
              onClick={() => setState("ask")}
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-vp-well text-[15px] font-medium text-vp-ink"
            >
              Back
            </button>
          </>
        ) : (
          <>
            <h2 id="vp-age-title" className="mt-6 text-[22px] leading-[28px] font-semibold tracking-[-0.01em] text-vp-ink">
              Are you 21 or older?
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setState("denied")}
                className="inline-flex h-12 items-center justify-center rounded-full bg-vp-well text-[15px] font-medium text-vp-ink"
              >
                No
              </button>
              <button
                type="button"
                autoFocus
                onClick={confirm}
                className="inline-flex h-12 items-center justify-center rounded-full bg-vp-ink text-[15px] font-medium text-vp-on-ink"
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
