import { Space_Grotesk } from "next/font/google"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const OpenfrontCTA = () => {
  return (
    // In the page flow on phone so it never covers content; pinned to the corner from sm up.
    <div className="flex justify-center pb-6 sm:fixed sm:right-4 sm:bottom-4 sm:z-50 sm:pb-0">
      <a
        href="https://www.openship.org"
        target="_blank"
        rel="noreferrer"
        className="flex gap-x-2 items-center bg-white backdrop-blur-sm border border-transparent ring-1 ring-foreground/5 rounded-[4px] px-2.5 py-0.5 shadow hover:bg-white/90 transition-colors"
      >
        <span className="text-muted-foreground font-medium text-[0.625rem] uppercase">Powered By</span>
        <span className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 bg-[#3b82f6] rounded-[1px]"/>
        <span className={cn(spaceGrotesk.className, "text-sm font-semibold tracking-tight text-zinc-700 mb-0.5")}>
          open<span className="font-normal">front</span>
        </span>
        </span>
      </a>
    </div>
  );
}

export default OpenfrontCTA
