export function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function getCardBrand(number) {
  const first = number.replace(/\s/g, '')[0]
  if (first === '4') return 'VISA'
  if (first === '5') return 'Mastercard'
  return ''
}

// Devuelve un objeto { campo: 'mensaje' } solo con los campos inválidos
export function validateCard({ name, number, expiry, cvc }) {
  const errors = {}

  if (name.trim().length < 3) {
    errors.name = 'Ingresa el nombre tal como aparece en la tarjeta.'
  } else if (!/^[\p{L}\s.'-]+$/u.test(name.trim())) {
    errors.name = 'El nombre solo puede contener letras.'
  }

  if (number.replace(/\s/g, '').length !== 16) {
    errors.number = 'El número de tarjeta debe tener 16 dígitos.'
  }

  const match = /^(\d{2})\/(\d{2})$/.exec(expiry)
  if (!match) {
    errors.expiry = 'Usa el formato MM/AA, por ejemplo 12/28.'
  } else {
    const month = Number(match[1])
    const year = 2000 + Number(match[2])
    const now = new Date()
    if (month < 1 || month > 12) {
      errors.expiry = 'El mes debe estar entre 01 y 12.'
    } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      errors.expiry = 'La tarjeta está vencida.'
    }
  }

  if (!/^\d{3,4}$/.test(cvc)) {
    errors.cvc = 'El CVC debe tener 3 o 4 dígitos.'
  }

  return errors
}
