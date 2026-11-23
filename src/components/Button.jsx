import './Button.css'

// variant: 'primary' (naranja) | 'outline' | 'light'   size: 'md' | 'sm'
function Button({ variant = 'primary', size = 'md', block = false, type = 'button', className = '', children, ...rest }) {
  const classes = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button
