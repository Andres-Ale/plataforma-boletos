const FAQ = [
  { q: '¿Cómo compro boletos?', a: 'Elige un evento, pulsa "Seleccionar asientos", marca tus asientos en el mapa, revisa el resumen y completa el pago.' },
  { q: '¿Cuántos asientos puedo comprar a la vez?', a: 'Hasta 8 asientos por compra, de un solo evento.' },
  { q: '¿Los pagos son reales?', a: 'No. Easy Ticket es un proyecto académico: el pago es una simulación y no se cobra ni se guarda ningún dato de tarjeta.' },
  { q: '¿Dónde veo mi boleto con el código QR?', a: 'Al terminar la compra aparece en pantalla, y siempre puedes encontrarlo en "Mis boletos", dentro del menú de tu cuenta.' },
  { q: '¿Puedo descargar el boleto?', a: 'Sí. Usa "Descargar PDF" y, en la ventana de impresión, elige guardar como PDF.' },
]

function HelpPage() {
  return (
    <div className="page container help">
      <h1 className="page__title">Ayuda</h1>
      <div className="help__list">
        {FAQ.map((item) => (
          <details key={item.q} className="help__item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

export default HelpPage
