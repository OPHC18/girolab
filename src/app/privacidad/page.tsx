import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Giro Lab',
  description: 'Consulta cómo Giro Lab protege y trata tus datos personales.',
}

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0fa', fontFamily: 'DM Sans, Arial, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ color: '#421869', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Volver al inicio</a>

        <h1 style={{ fontFamily: 'Raleway, Arial, sans-serif', fontSize: 36, fontWeight: 900, color: '#421869', margin: '32px 0 8px' }}>
          Política de Privacidad
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 48 }}>Última actualización: abril 2026</p>

        <div style={{ background: 'white', borderRadius: 20, padding: '40px 48px', boxShadow: '0 2px 16px rgba(66,24,105,0.06)', lineHeight: 1.8, color: '#444', fontSize: 15 }}>

          <Section title="1. Responsable del Tratamiento">
            El responsable del tratamiento de tus datos personales es <strong>Hera Asociados S.A.C.</strong>, empresa con RUC N° 20600052561, domiciliada en Lima, Perú, operadora de la plataforma Giro Lab. Para consultas sobre privacidad puedes escribirnos a <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a>.
          </Section>

          <Section title="2. Marco Legal">
            El tratamiento de tus datos personales se realiza de conformidad con la <strong>Ley N° 29733 — Ley de Protección de Datos Personales</strong> del Perú y su Reglamento aprobado por Decreto Supremo N° 003-2013-JUS. Tus datos están registrados en el banco de datos personales de Hera Asociados S.A.C. debidamente inscrito ante la Autoridad Nacional de Protección de Datos Personales.
          </Section>

          <Section title="3. Datos que Recopilamos">
            Según cómo uses Giro Lab, podemos recopilar los siguientes datos:
            <br /><br />
            <strong>Datos de registro:</strong> nombre completo, apellidos, dirección de correo electrónico, teléfono, país de residencia, fecha de nacimiento, empresa y cargo (opcional).
            <br /><br />
            <strong>Datos de perfil profesional (Menters):</strong> especialidades, experiencia, certificaciones, foto de perfil, biografía y tarifas.
            <br /><br />
            <strong>Datos de uso:</strong> historial de sesiones, resultados de evaluaciones, preferencias dentro de la plataforma, registros de actividad y diagnósticos de bienestar.
            <br /><br />
            <strong>Datos de pago:</strong> información necesaria para procesar transacciones en dólares estadounidenses (USD), procesados por pasarelas de pago certificadas. No almacenamos datos de tarjetas de crédito o débito.
            <br /><br />
            <strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas y tiempo de sesión.
          </Section>

          <Section title="4. Finalidad del Tratamiento">
            Usamos tus datos para:
            <br /><br />
            (a) Gestionar tu cuenta y verificar tu identidad.<br />
            (b) Conectarte con Menters adecuados para tus necesidades.<br />
            (c) Procesar pagos y gestionar facturación.<br />
            (d) Enviarte comunicaciones de servicio (confirmaciones, recordatorios, alertas de cuenta).<br />
            (e) Enviarte comunicaciones de marketing y novedades, con tu consentimiento previo y con posibilidad de cancelación en cualquier momento.<br />
            (f) Mejorar la plataforma mediante análisis de uso agregado y anónimo.<br />
            (g) Cumplir con obligaciones legales y regulatorias.<br />
            (h) Prevenir fraude y garantizar la seguridad de la plataforma.
          </Section>

          <Section title="5. Base Legal del Tratamiento">
            El tratamiento de tus datos se fundamenta en: (a) la ejecución del contrato de servicio que aceptas al registrarte; (b) tu consentimiento explícito para comunicaciones de marketing; (c) el cumplimiento de obligaciones legales aplicables; y (d) el interés legítimo de Hera Asociados S.A.C. en mejorar y proteger sus servicios.
          </Section>

          <Section title="6. Transferencia de Datos a Terceros">
            Podemos compartir tus datos con:
            <br /><br />
            <strong>Menters:</strong> cuando agendas una sesión, el Menter recibe los datos de contacto y el contexto necesario para la atención.
            <br /><br />
            <strong>Proveedores de servicios:</strong> procesadores de pago, plataformas de videollamadas, servicios de correo electrónico y almacenamiento en nube, bajo contratos de confidencialidad.
            <br /><br />
            <strong>Empresas contratantes:</strong> si tu empresa adquiere un plan corporativo, puede acceder a estadísticas agregadas de bienestar del equipo, nunca a datos individuales identificables.
            <br /><br />
            No vendemos ni cedemos tus datos personales a terceros con fines comerciales propios.
          </Section>

          <Section title="7. Transferencia Internacional de Datos">
            Algunos de nuestros proveedores de infraestructura (almacenamiento, procesamiento, correo) pueden estar ubicados fuera del Perú. En todos los casos exigimos que dichos proveedores apliquen medidas de protección equivalentes a las establecidas por la legislación peruana vigente.
          </Section>

          <Section title="8. Conservación de los Datos">
            Conservamos tus datos durante el tiempo que tu cuenta esté activa y durante el período adicional requerido por obligaciones legales o fiscales (mínimo 5 años para registros contables según la ley peruana). Cuando solicites la eliminación de tu cuenta, procederemos a eliminar o anonimizar tus datos dentro de los 30 días hábiles siguientes, salvo que exista obligación legal de conservación.
          </Section>

          <Section title="9. Seguridad">
            Aplicamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (TLS), cifrado en reposo, control de accesos por roles, autenticación segura y monitoreo de accesos. Si detectamos una vulneración de seguridad que afecte tus derechos, te lo notificaremos en los plazos que exige la ley.
          </Section>

          <Section title="10. Tus Derechos (Derechos ARCO)">
            De acuerdo con la Ley N° 29733, tienes derecho a:
            <br /><br />
            <strong>Acceso:</strong> saber qué datos tuyos tratamos.<br />
            <strong>Rectificación:</strong> corregir datos inexactos o incompletos.<br />
            <strong>Cancelación:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.<br />
            <strong>Oposición:</strong> oponerte al tratamiento en determinadas circunstancias.
            <br /><br />
            Para ejercer cualquiera de estos derechos escríbenos a <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a> indicando tu nombre, el derecho que deseas ejercer y adjuntando documento que acredite tu identidad. Responderemos en un plazo máximo de 20 días hábiles.
          </Section>

          <Section title="11. Cookies y Tecnologías de Seguimiento">
            Utilizamos cookies y tecnologías similares para mantener tu sesión activa, recordar tus preferencias y analizar el uso de la plataforma. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar el funcionamiento de algunos servicios. Las cookies estrictamente necesarias para el funcionamiento del servicio no pueden desactivarse.
          </Section>

          <Section title="12. Menores de Edad">
            Giro Lab está dirigido exclusivamente a personas mayores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que un usuario es menor de edad, procederemos a eliminar su cuenta y los datos asociados de forma inmediata.
          </Section>

          <Section title="13. Cambios en esta Política">
            Podemos actualizar esta Política en cualquier momento. Te notificaremos por correo electrónico o mediante aviso visible en la plataforma con al menos 15 días de anticipación ante cambios significativos. El uso continuado de la plataforma tras dicho plazo constituye tu aceptación de la nueva versión.
          </Section>

          <Section title="14. Autoridad de Control">
            Si consideras que el tratamiento de tus datos infringe la normativa vigente, puedes presentar una reclamación ante la <strong>Autoridad Nacional de Protección de Datos Personales</strong> del Ministerio de Justicia y Derechos Humanos del Perú.
          </Section>

          <Section title="15. Contacto">
            Para cualquier consulta sobre esta Política o el tratamiento de tus datos personales:
            <br /><br />
            <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a>
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
