"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Check, CheckCircle, XCircle } from "lucide-react";
import {
  Dot,
  SectionTitle,
  Stamp,
  StatusWord,
  Td,
  Tr,
  buttonClass,
  type DotTone,
} from "../../components/vape-ui";
import { cn } from "@/lib/utils";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { updateBusinessAccountRequestStatus } from "../actions";
import { toast } from "@/components/ui/use-toast";

export const statusTones: Record<string, DotTone> = {
  pending: "warn",
  approved: "ok",
  not_approved: "danger",
  requires_info: "warn",
};

interface BusinessAccountRequest {
  id: string;
  businessName: string;
  businessType: string;
  monthlyOrderVolume: string;
  requestedCreditLimit: number;
  formattedRequestedCredit: string;
  businessDescription: string;
  status: string;
  statusLabel: string;
  submittedAt: string;
  reviewNotes?: string;
  approvedCreditLimit?: number;
  formattedApprovedCredit?: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface BusinessAccountRequestDetailsComponentProps {
  businessAccountRequest: BusinessAccountRequest;
  list: any;
  /** "band" (default) is the original list row; "row" and "queue" render table rows. */
  variant?: "band" | "row" | "queue";
}

const waitingLabel = (value?: string) => {
  if (!value) return "";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  return days === 0 ? "Today" : `${days}d`;
};

/** Why a request is waiting on the operator, or null. */
export function requestNeed(request: { status?: string }): { label: string; tone: DotTone } | null {
  if (request?.status === "pending") return { label: "Review", tone: "warn" };
  if (request?.status === "requires_info") return { label: "Waiting on info", tone: "info" };
  return null;
}

export function BusinessAccountRequestDetailsComponent({ 
  businessAccountRequest, 
  list,
  variant = "band",
}: BusinessAccountRequestDetailsComponentProps) {
  const router = useRouter();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(businessAccountRequest.reviewNotes || '');
  const [approvedCredit, setApprovedCredit] = useState(
    businessAccountRequest.approvedCreditLimit ? (businessAccountRequest.approvedCreditLimit / 100).toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getBusinessTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      wholesale: 'Wholesale Partner',
      distribution: 'Distribution Channel',
      reseller: 'Authorized Reseller',
      b2b_platform: 'B2B Platform',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  const getVolumeLabel = (volume: string) => {
    const volumeMap: Record<string, string> = {
      low: '1-50 orders/month',
      medium: '51-200 orders/month',
      high: '201-1000 orders/month',
      enterprise: '1000+ orders/month'
    };
    return volumeMap[volume] || volume;
  };

  const handleReviewSubmit = async (action: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    try {
      const result = await updateBusinessAccountRequestStatus(
        businessAccountRequest.id,
        action,
        reviewNotes,
        approvedCredit ? parseInt(approvedCredit) * 100 : undefined
      );

      if (result.success) {
        toast({
          title: "Request Updated",
          description: `Account request has been ${action}.`,
        });
        setIsReviewDialogOpen(false);
        router.refresh(); // Refresh the page to show updated data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update request.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to update request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const overlays = (
    <>
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:rounded-md max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review {businessAccountRequest.businessName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[12px] font-medium text-muted-foreground">Business name</dt>
                <dd className="mt-0.5 text-foreground">{businessAccountRequest.businessName}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-medium text-muted-foreground">Business type</dt>
                <dd className="mt-0.5 text-foreground">{getBusinessTypeLabel(businessAccountRequest.businessType)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[12px] font-medium text-muted-foreground">Contact</dt>
                <dd className="mt-0.5 text-foreground">
                  {businessAccountRequest.user ? (
                    <>
                      <span className="block">{businessAccountRequest.user.name}</span>
                      <span className="block truncate text-muted-foreground">{businessAccountRequest.user.email}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">User information unavailable</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-medium text-muted-foreground">Monthly volume</dt>
                <dd className="mt-0.5 tabular-nums text-foreground">{getVolumeLabel(businessAccountRequest.monthlyOrderVolume)}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-medium text-muted-foreground">Requested credit</dt>
                <dd className="mt-0.5 tabular-nums text-foreground">{businessAccountRequest.formattedRequestedCredit}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-medium text-muted-foreground">Submitted</dt>
                <dd className="mt-0.5 tabular-nums text-foreground">{new Date(businessAccountRequest.submittedAt).toLocaleString()}</dd>
              </div>
            </dl>

            <div>
              <SectionTitle>Business description</SectionTitle>
              <p className="text-sm text-foreground">{businessAccountRequest.businessDescription}</p>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="approvedCredit">Approved credit limit (USD)</Label>
                <Input
                  id="approvedCredit"
                  type="number"
                  className="font-mono tabular-nums"
                  placeholder={(businessAccountRequest.requestedCreditLimit / 100).toString()}
                  value={approvedCredit}
                  onChange={(e) => setApprovedCredit(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reviewNotes">Review notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleReviewSubmit('approved')}
                  className="h-9 rounded-[4px] px-4 max-sm:h-10"
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Request
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewSubmit('rejected')}
                  className="h-9 rounded-[4px] px-4 max-sm:h-10"
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Request
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <EditItemDrawerClientWrapper
        listKey="business-account-requests"
        itemId={businessAccountRequest.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        onSave={() => {
          router.refresh();
        }}
      />
    </>
  );

  const request = businessAccountRequest;
  const tone = statusTones[request.status] || "muted";
  const contact = request.user ? request.user.name || request.user.email : "User information unavailable";
  const actionMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Actions"
          className={cn(buttonClass.base, buttonClass.ghost, "size-8 px-0 max-sm:size-10")}
        >
          <MoreVertical />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-md">
        <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
          Edit Request
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">
          Delete Request
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (variant === "queue") {
    const need = requestNeed(request);
    return (
      <Tr>
        <Td className="max-w-[16rem]">
          <div className="truncate font-medium text-foreground">{request.businessName}</div>
          <div className="truncate text-[12px] text-muted-foreground md:hidden">{contact}</div>
        </Td>
        <Td>{need ? <StatusWord tone={need.tone}>{need.label}</StatusWord> : null}</Td>
        <Td priority={2} className="max-w-[14rem] truncate text-muted-foreground">{contact}</Td>
        <Td align="right" priority={2} className="whitespace-nowrap text-foreground">{request.formattedRequestedCredit}</Td>
        <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">{waitingLabel(request.submittedAt)}</Td>
        <Td align="right" className="whitespace-nowrap">
          {request.status === "pending" ? (
            <button
              type="button"
              onClick={() => setIsReviewDialogOpen(true)}
              className={cn(buttonClass.base, buttonClass.primary)}
            >
              Review
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditDrawerOpen(true)}
              className={cn(buttonClass.base, buttonClass.outline)}
            >
              Open
            </button>
          )}
          {overlays}
        </Td>
      </Tr>
    );
  }

  if (variant === "row") {
    return (
      <Tr>
        <Td className="max-w-[16rem]">
          <div className="truncate font-medium text-foreground">{request.businessName}</div>
          <div className="truncate text-[12px] text-muted-foreground lg:hidden">{getBusinessTypeLabel(request.businessType)}</div>
        </Td>
        <Td priority={3} className="whitespace-nowrap text-muted-foreground">{getBusinessTypeLabel(request.businessType)}</Td>
        <Td priority={2} className="max-w-[14rem] truncate text-muted-foreground">{contact}</Td>
        <Td><Stamp tone={tone}>{request.statusLabel || request.status}</Stamp></Td>
        <Td align="right" priority={2} className="whitespace-nowrap text-foreground">{request.formattedRequestedCredit}</Td>
        <Td align="right" priority={3} className="whitespace-nowrap text-muted-foreground">{request.formattedApprovedCredit || "None"}</Td>
        <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">
          {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not submitted"}
        </Td>
        <Td className="w-20 whitespace-nowrap pr-2 text-right">
          {request.status === "pending" && (
            <button
              type="button"
              aria-label="Review"
              onClick={() => setIsReviewDialogOpen(true)}
              className={cn(buttonClass.base, buttonClass.ghost, "size-8 px-0 max-sm:size-10")}
            >
              <Check />
            </button>
          )}
          {actionMenu}
          {overlays}
        </Td>
      </Tr>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <Dot tone={statusTones[businessAccountRequest.status] || "muted"} />
            <h3 className="text-sm font-semibold text-foreground">{businessAccountRequest.businessName}</h3>
            <span className="text-xs text-muted-foreground">{businessAccountRequest.statusLabel}</span>
          </div>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="min-w-0 truncate">
              {businessAccountRequest.user
                ? `${businessAccountRequest.user.name} (${businessAccountRequest.user.email})`
                : "User information unavailable"
              }
            </span>
            <span>
              <span className="font-mono tabular-nums text-foreground">{businessAccountRequest.formattedRequestedCredit}</span> requested
            </span>
            <span>
              Submitted <span className="font-mono tabular-nums">{new Date(businessAccountRequest.submittedAt).toLocaleDateString()}</span>
            </span>
          </div>
          {businessAccountRequest.reviewNotes && (
            <p className="mt-2 border-l border-border pl-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Review notes</span> {businessAccountRequest.reviewNotes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {businessAccountRequest.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-[4px] sm:size-8 [&_svg]:size-4"
              aria-label="Review"
              onClick={() => setIsReviewDialogOpen(true)}
            >
              <Check className="stroke-muted-foreground" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-[4px] sm:size-8 [&_svg]:size-4"
                aria-label="Actions"
              >
                <MoreVertical className="stroke-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                Edit Request
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {overlays}
    </>
  );
}