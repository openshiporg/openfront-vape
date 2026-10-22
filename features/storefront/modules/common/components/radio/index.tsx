const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  return (
    <>
      <button
        type="button"
        role="radio"
        aria-checked="true"
        data-state={checked ? "checked" : "unchecked"}
        className="group relative flex h-5 w-5 flex-none items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-vp-accent"
        data-testid={dataTestId || 'radio-button'}
      >
        <span
          aria-hidden="true"
          className="block h-[18px] w-[18px] rounded-full border-[1.5px] border-vp-ink-3 bg-vp-surface transition-all group-hover:border-vp-ink group-data-[state=checked]:border-[5px] group-data-[state=checked]:border-vp-ink group-disabled:border-vp-line"
        />
      </button>
    </>
  )
}

export default Radio
