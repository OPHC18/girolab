import { supabase } from '@/app/lib/supabase';
import { resolveUTMs, type UTMData } from '@/lib/utm';

type SessionMeta = UTMData & { referrer: string; device: 'mobile' | 'desktop' | 'tablet' };

export async function createTrackedSession(
  instrumentId: string,
  opts: { menterId?: string; empresaId?: string; jobProfileId?: string } = {}
): Promise<{ sessionId: string; token: string; url: string } | null> {
 
  const utms = resolveUTMs();
  const meta: SessionMeta = {
    ...utms,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    device: getDeviceType(),
  };
 
  const rpcName = opts.empresaId ? 'create_empresa_assessment_link' : 'create_assessment_link';
  const rpcArgs = opts.empresaId
    ? { p_instrument_id: instrumentId, p_empresa_id: opts.empresaId, p_menter_id: opts.menterId || null, p_job_profile_id: opts.jobProfileId || null }
    : { p_instrument_id: instrumentId, p_menter_id: opts.menterId || null };
 
  const { data, error } = await supabase.rpc(rpcName, rpcArgs);
  if (error || !data) return null;
 
  // Guardar metadata + UTMs en la sesión
  await supabase.from('assessment_sessions')
    .update({ metadata: meta, fuente: utms.utm_source ? 'landing' : 'dashboard' })
    .eq('session_token', data.token);
 
  return { sessionId: data.session_id, token: data.token, url: data.url };
}
 
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
}