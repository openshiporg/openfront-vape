"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ArrowUpRight } from "lucide-react"
import { primaryButtonClass, secondaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"
import { toast } from "@/components/ui/use-toast"
import { CardElement } from '@stripe/react-stripe-js'
import InvoicePaymentWrapper from "./invoice-payment-wrapper"
import InvoicePaymentButton from "./invoice-payment-button"
import { createInvoicePaymentSessions, createInvoiceFromLineItems, initiateInvoicePaymentSession, setInvoicePaymentSession, getActiveInvoice } from "./invoice-actions"
import { isStripe, paymentInfoMap } from "@/features/storefront/lib/constants"
import { cn } from "@/lib/utils"
import { listCartPaymentMethods } from "@/features/storefront/lib/data/payment"
import { RiLoader2Fill } from "@remixicon/react"

type InvoicePaymentDialogProps = {
  isOpen: boolean
  onClose: () => void
  businessAccount: any
  unpaidLineItems: any
}

export default function InvoicePaymentDialog({ 
  isOpen, 
  onClose, 
  businessAccount, 
  unpaidLineItems 
}: InvoicePaymentDialogProps) {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentMethodSwitching, setPaymentMethodSwitching] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [step, setStep] = useState<'select-region' | 'payment' | 'review'>('select-region')

  const handleRegionSelect = async (regionId: string) => {
    setSelectedRegion(regionId)
    
    // Load payment methods for this region (same as checkout)
    try {
      const paymentMethods = await listCartPaymentMethods(regionId)
      setAvailablePaymentMethods(paymentMethods || [])
      
    } catch (error) {
      setAvailablePaymentMethods([])
    }
  }

  const handleCreateInvoiceWithPaymentSessions = async () => {
    if (!selectedRegion || !businessAccount?.id) return
    
    setLoading(true)
    try {
      // First create invoice from unpaid line items for this region
      const regionData = unpaidLineItems.regions?.find(
        (region: any) => region.region?.id === selectedRegion
      )
      
      if (!regionData) return

      // Create invoice using the GraphQL mutation
      const invoiceResult = await createInvoiceFromLineItems({
        accountId: businessAccount.id,
        regionId: selectedRegion,
        lineItemIds: regionData.lineItems.map((item: any) => item.id)
      })

      if (invoiceResult.success && invoiceResult.invoiceId) {
        // Load payment methods for this region first  
        const paymentMethods = await listCartPaymentMethods(selectedRegion)
        setAvailablePaymentMethods(paymentMethods || [])
        
        // Create payment sessions for this invoice (but don't initiate any yet)
        await createInvoicePaymentSessions(invoiceResult.invoiceId)
        
        // Get the invoice with payment sessions (now with clientSecret)
        const invoiceData = await getActiveInvoice(invoiceResult.invoiceId)

        if (invoiceData) {
          
          // Format the amount since JSON response doesn't have virtual fields
          const formatAmount = (amount: number, currency: { code: string; noDivisionCurrency?: boolean }) => {
            if (!currency) return '$0.00'
            const divisor = currency.noDivisionCurrency ? 1 : 100
            const amountValue = (amount || 0) / divisor
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.code,
            }).format(amountValue)
          }
          
          setInvoice({
            ...invoiceData,
            formattedTotal: formatAmount(invoiceData.totalAmount, invoiceData.currency),
            itemCount: invoiceData.lineItems?.length || 0,
            region: regionData.region,
            businessAccount
          })
          
          // Move to payment step  
          setStep('payment')
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice payment sessions"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentMethodChange = async (newPaymentMethod: string) => {
    if (!invoice?.id) return
    
    setPaymentMethodSwitching(true)
    setSelectedPaymentMethod(newPaymentMethod)
    
    try {
      // Find the payment provider ID for this payment method
      const paymentProvider = availablePaymentMethods.find(method => method.code === newPaymentMethod)
      if (!paymentProvider) {
        return
      }

      // Set the payment session as selected
      await setInvoicePaymentSession(invoice.id, paymentProvider.id)
      
      // Initiate the payment session to get clientSecret/orderId
      await initiateInvoicePaymentSession(invoice.id, newPaymentMethod)
      
      // Refresh invoice data to get updated payment sessions with clientSecret/orderId
      const invoiceData = await getActiveInvoice(invoice.id)

      if (invoiceData) {
        
        // Format the amount since JSON response doesn't have virtual fields
        const formatAmount = (amount: number, currency: { code: string; noDivisionCurrency?: boolean }) => {
          if (!currency) return '$0.00'
          const divisor = currency.noDivisionCurrency ? 1 : 100
          const amountValue = (amount || 0) / divisor
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.code,
          }).format(amountValue)
        }
        
        setInvoice({
          ...invoiceData,
          formattedTotal: formatAmount(invoiceData.totalAmount, invoiceData.currency),
          itemCount: invoiceData.lineItems?.length || 0,
          region: invoice.region,
          businessAccount: invoice.businessAccount
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change payment method"
      })
    } finally {
      setPaymentMethodSwitching(false)
    }
  }

  const handlePaymentMethodSubmit = async () => {
    if (!selectedPaymentMethod || !invoice?.id) return
    
    setPaymentLoading(true)
    try {
      // If Stripe is selected and card not complete, stay on payment step
      const shouldInputCard = isStripe(selectedPaymentMethod) && !cardComplete
      
      // Check if we need to initiate payment session for this method
      const currentSession = invoice.paymentCollection?.paymentSessions?.find(
        (session: any) => session.isSelected
      )

      if (currentSession && !currentSession.isInitiated) {
        await initiateInvoicePaymentSession(invoice.id, selectedPaymentMethod)

        // Refresh invoice data to get updated payment sessions with clientSecret/orderId
        const invoiceData = await getActiveInvoice(invoice.id)

        if (invoiceData) {
          
          // Format the amount since JSON response doesn't have virtual fields
          const formatAmount = (amount: number, currency: { code: string; noDivisionCurrency?: boolean }) => {
            if (!currency) return '$0.00'
            const divisor = currency.noDivisionCurrency ? 1 : 100
            const amountValue = (amount || 0) / divisor
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.code,
            }).format(amountValue)
          }
          
          setInvoice({
            ...invoiceData,
            formattedTotal: formatAmount(invoiceData.totalAmount, invoiceData.currency),
            itemCount: invoiceData.lineItems?.length || 0,
            region: invoice.region,
            businessAccount: invoice.businessAccount
          })
        }
      }

      if (!shouldInputCard) {
        // Move to review step for non-Stripe payments or completed Stripe
        setStep('review')
      }
    } catch (error) {
      setCardError(error instanceof Error ? error.message : 'Payment setup failed')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Single payment screen - like storefront checkout
  if (invoice && availablePaymentMethods.length > 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="vape-sf w-[calc(100%-32px)] max-h-[92dvh] overflow-y-auto rounded-[22px] border-vp-line bg-vp-bg text-vp-ink sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[20px] leading-[26px] font-semibold tracking-[-0.02em]">Pay invoice <span className="font-vp-mono">#{invoice.invoiceNumber}</span></DialogTitle>
            <DialogDescription className="text-[13px] text-vp-ink-2">
              Payment method
            </DialogDescription>
          </DialogHeader>

          <InvoicePaymentWrapper invoice={invoice}>
            <div className="space-y-4">
              {/* Invoice Summary */}
              <div className="vp-band p-4">
                <h4 className="mb-3 font-vp-mono text-[12px] uppercase tracking-[0.12em] text-vp-ink-3">Summary</h4>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-[14px] text-vp-ink-2">Total <span className="font-vp-mono text-[17px] font-medium text-vp-ink">{invoice.formattedTotal}</span></span>
                  <span className="font-vp-mono text-[13px] text-vp-ink-2">{invoice.itemCount} {invoice.itemCount === 1 ? 'order' : 'orders'}</span>
                </div>
                
                {/* Orders list */}
                <div className="flex flex-col divide-y divide-vp-line overflow-hidden rounded-[14px] bg-vp-surface">
                  {invoice.lineItems?.map((lineItem: any) => (
                    <button
                      type="button"
                      key={lineItem.id}
                      className="grid min-h-12 w-full grid-cols-[1fr_auto_18px] items-center gap-x-3 px-3 py-2.5 text-left hover:bg-vp-bg"
                      onClick={() => window.open(`/account/orders/details/${lineItem.accountLineItem.order?.id}`, '_blank')}
                      aria-label={`Open order #${lineItem.accountLineItem.order.displayId} in a new tab`}
                    >
                      <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                        <span className="font-vp-mono text-[13px] text-vp-ink">#{lineItem.accountLineItem.order.displayId}</span>
                        <span className="font-vp-mono text-[12px] text-vp-ink-2">{new Date(lineItem.accountLineItem.order.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span className="font-vp-mono text-[13px] text-vp-ink">{lineItem.accountLineItem.order.total}</span>
                      <ArrowUpRight size={16} aria-hidden="true" className="text-vp-ink-3" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Card with Selection */}
              <div className="vp-band p-4">
                <h4 className="mb-3 font-vp-mono text-[12px] uppercase tracking-[0.12em] text-vp-ink-3">Payment method</h4>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-2"
                >
                  {availablePaymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                      <RadioGroupItem value={method.code} id={method.id} className="sr-only" />
                      <Label 
                        htmlFor={method.id}
                        className={cn(
                          "flex min-h-12 min-w-0 cursor-pointer items-center justify-between rounded-[14px] border bg-vp-surface px-4 py-3 text-sm font-normal transition-colors",
                          {
                            "border-vp-ink": selectedPaymentMethod === method.code,
                            "border-vp-line hover:border-vp-ink-3": selectedPaymentMethod !== method.code,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-3 min-w-0 flex-1">
                          <div className={cn(
                            "w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                            {
                              "border-vp-ink": selectedPaymentMethod === method.code,
                              "border-vp-line": selectedPaymentMethod !== method.code,
                            }
                          )}>
                            {selectedPaymentMethod === method.code && (
                              <div className="w-2 h-2 bg-vp-ink rounded-full" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {paymentInfoMap[method.code]?.title || method.code}
                            </div>
                            <div className="truncate font-vp-mono text-[11px] text-vp-ink-3">
                              {method.code}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-2">
                          {paymentInfoMap[method.code]?.icon}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Stripe card element - only show if Stripe is selected and has clientSecret */}
              {isStripe(selectedPaymentMethod) && invoice?.paymentCollection?.paymentSessions?.find((s: { isSelected: boolean; data?: { clientSecret?: string } }) => s.isSelected && s.data?.clientSecret) && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <p className="mb-1.5 text-[13px] font-medium text-vp-ink-2">
                    Card
                  </p>
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontFamily: "ui-sans-serif, system-ui, sans-serif",
                          color: "#141816",
                          "::placeholder": {
                            color: "#878d89",
                          },
                        },
                      },
                      classes: {
                        base: "block h-12 w-full appearance-none rounded-[14px] border border-vp-line bg-vp-surface px-4 pt-3.5 pb-1",
                      },
                      // Hide postal code - billing address is already collected
                      hidePostalCode: true,
                    }}
                    onChange={(e) => {
                      setCardError(e.error?.message || null)
                      setCardComplete(e.complete)
                    }}
                  />
                  {cardError && (
                    <p role="alert" className="mt-2 text-[13px] text-vp-danger">{cardError}</p>
                  )}
                </div>
              )}
              
              {/* Show loading state for Stripe when waiting for clientSecret */}
              {isStripe(selectedPaymentMethod) && !invoice?.paymentCollection?.paymentSessions?.find((s: { isSelected: boolean; data?: { clientSecret?: string } }) => s.isSelected && s.data?.clientSecret) && (
                <div className="mt-5">
                  <p className="mb-1.5 text-[13px] font-medium text-vp-ink-2">Card</p>
                  <div className="h-12 animate-pulse rounded-[14px] bg-vp-well"></div>
                </div>
              )}


              {/* Terms and Payment Button */}
              <div className="mb-4 text-[13px] text-vp-ink-2">
                By clicking Pay invoice, you confirm payment for the selected orders.
              </div>

              <div className="w-full">
                {!selectedPaymentMethod ? (
                  <div className="flex h-12 items-center justify-center rounded-full bg-vp-well">
                    <span className="text-[14px] text-vp-ink-3">Select a payment method</span>
                  </div>
                ) : paymentMethodSwitching ? (
                  <div className="flex h-12 items-center justify-center rounded-full bg-vp-well">
                    <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin text-vp-ink-3" />
                    <span className="text-[14px] text-vp-ink-3">Loading payment method...</span>
                  </div>
                ) : (
                  <InvoicePaymentButton 
                    invoice={invoice}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onPaymentSuccess={onClose}
                    data-testid="pay-invoice-button"
                  />
                )}
              </div>
            </div>
          </InvoicePaymentWrapper>
        </DialogContent>
      </Dialog>
    )
  }

  // Show region selection (like checkout shows cart items)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="vape-sf w-[calc(100%-32px)] rounded-[22px] border-vp-line bg-vp-bg text-vp-ink sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[20px] leading-[26px] font-semibold tracking-[-0.02em]">Pay balance</DialogTitle>
          <DialogDescription className="text-[13px] text-vp-ink-2">
            Region
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {unpaidLineItems.success && unpaidLineItems.regions?.length > 0 ? (
            <RadioGroup value={selectedRegion || ""} onValueChange={handleRegionSelect}>
              {unpaidLineItems.regions.map((regionData: any) => (
                <div key={regionData.region.id} className="flex min-h-14 items-center gap-3 rounded-[14px] border border-vp-line bg-vp-surface px-4 py-3">
                  <RadioGroupItem value={regionData.region.id} id={regionData.region.id} />
                  <Label htmlFor={regionData.region.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-vp-ink">{regionData.region.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-vp-mono text-[12px] text-vp-ink-2">
                          {regionData.itemCount} {regionData.itemCount === 1 ? 'order' : 'orders'}
                        </span>
                        <span className="font-vp-mono text-[14px] font-medium text-vp-ink">
                          {regionData.formattedTotalAmount}
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="vp-band px-4 py-8 text-[15px] text-vp-ink-2">
              No unpaid orders
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" className={secondaryButtonClass} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={primaryButtonClass}
              onClick={handleCreateInvoiceWithPaymentSessions}
              disabled={!selectedRegion || loading}
            >
              {loading ? "Creating..." : "Continue to payment"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}