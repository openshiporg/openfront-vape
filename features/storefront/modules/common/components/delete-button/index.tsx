import { deleteLineItem } from "@/features/storefront/lib/data/cart";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { RiLoader2Fill } from "@remixicon/react";
import { cn } from "@/lib/utils";

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false);
    });
  };

  return (
    <button
      type="button"
      onClick={() => handleDelete(id)}
      disabled={isDeleting}
      aria-label={children ? undefined : "Remove item"}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-vp-ink-2 transition-colors hover:bg-vp-well hover:text-vp-danger disabled:cursor-not-allowed disabled:text-vp-ink-3",
        className
      )}
    >
      {isDeleting ? <RiLoader2Fill className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      {children ? <span>{children}</span> : <span className="hidden sm:inline">{isDeleting ? "Removing" : "Remove"}</span>}
    </button>
  );
};

export default DeleteButton;
