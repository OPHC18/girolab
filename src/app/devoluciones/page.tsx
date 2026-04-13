import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Devoluciones — Giro Lab',
  description: 'Consulta las condiciones de cancelación y reembolso de Giro Lab.',
}

export default function DevolucionesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0fa', fontFamily: 'DM Sans, Arial, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ color: '#421869', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Volver al inicio</a>

        <h1 style={{ fontFamily: 'Raleway, Arial, sans-serif', fontSize: 36, fontWeight: 900, color: '#421869', margin: '32px 0 8px' }}>
          Política de Devoluciones
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 48 }}>Última actualización: abril 2026</p>

        <div style={{ background: 'white', borderRadius: 20, padding: '40px 48px', boxShadow: '0 2px 16px rgba(66,24,105,0.06)', lineHeight: 1.8, color: '#444', fontSize: 15 }}>

          <Section title="1. Membresías">
            Los pagos por membresías de Menter <strong>no son reembolsables</strong> bajo ninguna circunstancia, salvo disposición legal expresa que lo exija. Al adquirir una membresía declaras haber leído y aceptado esta condición.
          </Section>

          <Section title="2. Citas (Sesiones con Menter)">
            Para las citas agendadas y pagadas a través de la plataforma, aplican las siguientes condiciones:
            <br /><br />
            <strong>Cancelación con derecho a reembolso:</strong> La solicitud debe realizarse con un mínimo de <strong>24 horas de anticipación</strong> a la hora programada de la cita.
            <br /><br />
            <strong>Sin derecho a reembolso:</strong> Las cancelaciones realizadas con menos de 24 horas de anticipación no son elegibles para reembolso. En estos casos el monto pagado queda retenido como penalidad por cancelación tardía.
            <br /><br />
            Si el Menter cancela la sesión por su propia iniciativa, el usuario recibirá el reembolso completo sin penalidad alguna.
          </Section>

          <Section title="3. Eventos">
            Para eventos pagados a través de la plataforma, la solicitud de reembolso debe realizarse como mínimo <strong>15 días calendario antes</strong> de la fecha de inicio del evento.
            <br /><br />
            Las solicitudes presentadas dentro de los 15 días previos al evento no son elegibles para reembolso, salvo que el evento sea cancelado o pospuesto por el organizador, en cuyo caso se reembolsará el 100% del monto pagado.
          </Section>

          <Section title="4. Gastos Administrativos">
            Todos los reembolsos aprobados están sujetos a un cargo del <strong>5% del monto original</strong> en concepto de gastos administrativos de procesamiento. Este cargo se descuenta automáticamente del monto a devolver.
          </Section>

          <Section title="5. Plazo de Acreditación">
            Una vez aprobada la solicitud de reembolso, el monto (descontado el 5% administrativo) se acredita en el medio de pago original en un plazo de <strong>10 a 30 días hábiles</strong>, según la entidad financiera del usuario y el método de pago utilizado. Los montos se devuelven en dólares estadounidenses (USD).
          </Section>

          <Section title="6. Cómo Solicitar un Reembolso">
            Para iniciar una solicitud de reembolso debes contactarnos a través de alguno de los siguientes canales:
            <br /><br />
            <strong>Soporte dentro de la plataforma:</strong> desde tu Dashboard, sección de Soporte o Ayuda.
            <br /><br />
            <strong>Correo electrónico:</strong> <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a> con el asunto "Solicitud de reembolso", indicando tu nombre completo, el ID o detalle de la cita/evento y el motivo de la cancelación.
            <br /><br />
            Revisaremos tu solicitud y te responderemos en un plazo máximo de 3 días hábiles confirmando si aplica o no el reembolso según esta política.
          </Section>

          <Section title="7. Excepciones">
            No se procesarán reembolsos en los siguientes casos:
            <br /><br />
            (a) Servicios efectivamente prestados en su totalidad.<br />
            (b) Cancelaciones fuera de los plazos establecidos en esta política.<br />
            (c) Cuentas suspendidas por incumplimiento de los Términos y Condiciones.<br />
            (d) Membresías de cualquier tipo.
          </Section>

          <Section title="8. Modificaciones">
            Hera Asociados S.A.C. se reserva el derecho de modificar esta Política en cualquier momento. Los cambios se notificarán con al menos 15 días de anticipación a través de la plataforma o por correo electrónico.
          </Section>

          <Section title="9. Contacto">
            Para consultas sobre esta Política: <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a>
            <br />Hera Asociados S.A.C. — RUC 20600052561 — Lima, Perú
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'Raleway, Arial, sans-serif', fontSize: 18, fontWeight: 800, color: '#421869', marginBottom: 10 }}>{title}</h2>
      <div style={{ margin: 0 }}>{children}</div>
    </div>
  )
}
