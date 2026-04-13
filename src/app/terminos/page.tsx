import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Giro Lab',
  description: 'Consulta los términos y condiciones de uso de Giro Lab.',
}

export default function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0fa', fontFamily: 'DM Sans, Arial, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ color: '#421869', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Volver al inicio</a>

        <h1 style={{ fontFamily: 'Raleway, Arial, sans-serif', fontSize: 36, fontWeight: 900, color: '#421869', margin: '32px 0 8px' }}>
          Términos y Condiciones
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 48 }}>Última actualización: abril 2026</p>

        <div style={{ background: 'white', borderRadius: 20, padding: '40px 48px', boxShadow: '0 2px 16px rgba(66,24,105,0.06)', lineHeight: 1.8, color: '#444', fontSize: 15 }}>

          <Section title="1. Información de la empresa">
            Giro Lab es operado por <strong>Hera Asociados S.A.C.</strong>, empresa constituida bajo las leyes de la República del Perú, con RUC N° 20600052561, con domicilio en Lima, Perú. Para cualquier consulta legal, puedes escribirnos a <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a>.
          </Section>

          <Section title="2. Aceptación de los Términos">
            Al registrarte y usar Giro Lab, declaras ser mayor de 18 años y aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de los términos aquí establecidos, te pedimos que no uses nuestra plataforma. El uso continuado de la plataforma tras la publicación de cambios constituye tu aceptación de dichos cambios.
          </Section>

          <Section title="3. Mayoría de edad">
            Giro Lab está dirigido exclusivamente a personas mayores de 18 años. Al crear una cuenta, confirmas que cumples con este requisito. Nos reservamos el derecho de suspender o eliminar cualquier cuenta de la que tengamos indicios de que pertenece a un menor de edad.
          </Section>

          <Section title="4. Descripción del Servicio">
            Giro Lab es una plataforma digital que conecta a personas y empresas con profesionales del bienestar denominados "Menters". A través de nuestra plataforma podrás: (a) buscar y contactar Menters especializados; (b) agendar y gestionar sesiones de acompañamiento; (c) acceder a herramientas de diagnóstico y seguimiento de progreso; (d) participar en eventos y actividades de bienestar; (e) acceder a contenido relacionado con el desarrollo humano y organizacional.
          </Section>

          <Section title="5. Roles en la Plataforma">
            Giro Lab distingue tres tipos de usuarios:
            <br /><br />
            <strong>Personas:</strong> Usuarios individuales que buscan acompañamiento profesional para su bienestar personal o desarrollo profesional.
            <br /><br />
            <strong>Empresas:</strong> Organizaciones que acceden a servicios de bienestar corporativo para sus equipos.
            <br /><br />
            <strong>Menters:</strong> Profesionales del bienestar verificados que ofrecen sus servicios a través de la plataforma. Los Menters son profesionales independientes y no empleados de Hera Asociados S.A.C.
          </Section>

          <Section title="6. Registro y Cuenta">
            Para acceder a los servicios debes crear una cuenta proporcionando información veraz, completa y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta. Debes notificarnos de inmediato ante cualquier uso no autorizado a través de <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a>.
          </Section>

          <Section title="7. Sesiones y Pagos">
            Los precios de las sesiones son establecidos por cada Menter de forma independiente. Giro Lab actúa como intermediario facilitando la conexión entre usuarios y Menters. Los pagos se realizan en dólares estadounidenses (USD) a través de los métodos habilitados en la plataforma. Las condiciones de cancelación y reembolso se detallan en nuestra <a href="/devoluciones" style={{ color: '#421869' }}>Política de Devoluciones</a>.
          </Section>

          <Section title="8. Membresías">
            Giro Lab ofrece planes de membresía para Menters que otorgan acceso a funcionalidades adicionales. Los pagos de membresías no son reembolsables bajo ninguna circunstancia, salvo disposición legal expresa que lo exija.
          </Section>

          <Section title="9. Responsabilidad de los Menters">
            Los Menters son profesionales independientes responsables del contenido, calidad y resultados de sus servicios. Giro Lab no garantiza resultados específicos derivados de las sesiones. Los Menters declaran, al registrarse, contar con las certificaciones, experiencia y habilitaciones necesarias para ejercer su práctica. Hera Asociados S.A.C. no asume responsabilidad por el contenido de las sesiones ni por los resultados obtenidos.
          </Section>

          <Section title="10. Conducta del Usuario">
            Queda prohibido el uso de la plataforma para: (a) publicar contenido falso, engañoso o difamatorio; (b) acosar o intimidar a otros usuarios; (c) realizar actividades ilícitas o contrarias a las buenas costumbres; (d) intentar acceder a sistemas o datos sin autorización; (e) suplantar la identidad de otras personas o entidades. Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estas normas.
          </Section>

          <Section title="11. Propiedad Intelectual">
            Todo el contenido de Giro Lab, incluyendo el diseño, logotipos, textos, código y funcionalidades, es propiedad de Hera Asociados S.A.C. y está protegido por las leyes de propiedad intelectual aplicables. Los Menters retienen los derechos sobre el contenido que publican en la plataforma, otorgando a Giro Lab una licencia no exclusiva para mostrarlo dentro del servicio.
          </Section>

          <Section title="12. Privacidad y Datos Personales">
            El tratamiento de tus datos personales se rige por nuestra <a href="/privacidad" style={{ color: '#421869' }}>Política de Privacidad</a>, de conformidad con la Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su reglamento.
          </Section>

          <Section title="13. Limitación de Responsabilidad">
            En la máxima medida permitida por la ley peruana, Hera Asociados S.A.C. no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la plataforma. Nuestra responsabilidad total no excederá el monto pagado por el usuario en los últimos 12 meses.
          </Section>

          <Section title="14. Modificaciones">
            Nos reservamos el derecho de modificar estos Términos en cualquier momento. Notificaremos cambios significativos mediante correo electrónico o aviso dentro de la plataforma con al menos 15 días de anticipación. El uso continuado tras dicho plazo constituye aceptación de los nuevos términos.
          </Section>

          <Section title="15. Ley Aplicable y Jurisdicción">
            Estos Términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a la jurisdicción de los tribunales competentes de Lima, Perú.
          </Section>

          <Section title="16. Contacto">
            Para consultas sobre estos Términos: <a href="mailto:contacto@girolab.net" style={{ color: '#421869' }}>contacto@girolab.net</a>
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
