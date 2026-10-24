const ErrorMessage = ({ error, 'data-testid': dataTestid }: { error?: string | null, 'data-testid'?: string }) => {
  if (!error) {
    return null
  }

  return (
    <div role="alert" className="whitespace-pre-line pt-2 text-[13px] leading-[18px] text-vp-danger" data-testid={dataTestid}>
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
