import './Button.css'

// variant: 'primary' (naranja) | 'outline' | 'light'   size: 'md' | 'sm'
// `as` permite renderizar otro elemento (por ejemplo <Link to="...">) con el mismo aspecto de botón
function Button({ as: Tag = 'button', variant = 'primary', size = 'md', block = false, type = 'button', className = '', children, ...rest }) {
  const classes = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className]
    .filter(Boolean)
    .join(' ')

  const extra = Tag === 'button' ? { type } : {}

  return (
    <Tag className={classes} {...extra} {...rest}>
      {children}
    </Tag>
  )
}

export default Button
