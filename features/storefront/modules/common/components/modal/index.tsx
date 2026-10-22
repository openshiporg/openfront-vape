import { cn } from "@/lib/utils"
import React, { Fragment, createContext, useContext } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import X from "@/features/storefront/modules/common/icons/x"

type ModalContextType = {
  close: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children, close }: { children: React.ReactNode; close: () => void }) => {
  return (
    <ModalContext.Provider value={{ close }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

type ModalProps = {
  isOpen: boolean
  close: () => void
  size?: "small" | "medium" | "large"
  search?: boolean
  children: React.ReactNode
  'data-testid'?: string
}

const Modal = ({
  isOpen,
  close,
  size = "medium",
  search = false,
  children,
  'data-testid': dataTestId
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        data-testid={dataTestId}
        className={cn( 
          "[&>button:last-child]:hidden flex h-fit max-h-[85vh] w-[calc(100%-32px)] transform flex-col justify-start overflow-y-auto p-5 text-left align-middle text-vp-ink transition-all sm:p-6",
          {
            "max-w-md": size === "small",
            "max-w-xl": size === "medium",
            "max-w-3xl": size === "large",
            "bg-transparent shadow-none border-none": search,
            "rounded-[22px] border border-vp-line bg-vp-bg shadow-[0_18px_60px_rgb(20_24_22/0.18)]": !search,
          }
        )}
      >
        <ModalProvider close={close}>{children}</ModalProvider>
      </DialogContent>
    </Dialog>
  )
}

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { close } = useModal()

  return (
    <DialogHeader className="flex flex-row items-center justify-between gap-4 pb-4 text-left">
      <DialogTitle className="text-[20px] leading-[26px] font-semibold tracking-[-0.02em] text-vp-ink">{children}</DialogTitle>
      <button
        type="button"
        onClick={close}
        data-testid="close-modal-button"
        aria-label="Close"
        className="ml-auto inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-vp-well text-vp-ink transition-colors hover:bg-vp-line"
      >
        <X size={20} />
      </button>
    </DialogHeader>
  )
}

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DialogDescription className="flex h-full items-center justify-center pt-2 pb-4 text-[14px] text-vp-ink-2">
      {children}
    </DialogDescription>
  )
}

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-col">{children}</div>
}

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:items-center sm:justify-end">{children}</div>
}

Modal.Title = Title
Modal.Description = Description
Modal.Body = Body
Modal.Footer = Footer

export default Modal
