import { useEffect, useRef } from 'react'
import './ConfirmDialog.css'

// Confirmación de acciones críticas con <dialog> nativo (foco atrapado y cierre con Escape).
function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', busy = false, onConfirm, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="confirm-dialog" aria-labelledby="confirm-title" onCancel={(e) => { e.preventDefault(); if (!busy) onCancel() }}>
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="confirm-dialog__actions">
        <button type="button" className="confirm-dialog__btn" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button type="button" className="confirm-dialog__btn confirm-dialog__btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
