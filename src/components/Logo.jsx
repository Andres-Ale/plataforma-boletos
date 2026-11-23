import { useState } from 'react'

// Muestra /public/images/logo.png; si todavía no existe, cae a texto.
function Logo({ height = 44 }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span className="logo-text">Easy<span>Ticket</span></span>
  }

  return (
    <img
      src="/images/logo.png"
      alt="Easy Ticket"
      style={{ height, width: 'auto' }}
      onError={() => setFailed(true)}
    />
  )
}

export default Logo
