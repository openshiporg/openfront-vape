import React from 'react';
import { Copy, Check, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataCardProps {
  title: string;
  content: string;
  onCopy: (text: string, key: string) => Promise<void>;
  copied: boolean;
  copyKey: string;
  showPasteButton?: boolean;
  onPaste?: () => void;
}

export function DataCard({ title, content, onCopy, copied, copyKey, showPasteButton, onPaste }: DataCardProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-muted/40 ring-1 ring-inset ring-border/60">
      <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-1">
          {showPasteButton && onPaste && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onPaste}
              aria-label="Paste"
              className="size-8 rounded-full p-0 hover:bg-background/80"
            >
              <Clipboard className="h-3 w-3 text-muted-foreground" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCopy(content, copyKey)}
            aria-label="Copy"
            className="size-8 rounded-full p-0 hover:bg-background/80"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <div className="bg-background/60">
        <div className="text-xs overflow-auto h-[200px] whitespace-pre-wrap break-words text-foreground font-mono p-4">
          {content}
        </div>
      </div>
    </div>
  );
}