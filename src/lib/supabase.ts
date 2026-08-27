import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCredentials } from '../types';

/**
 * Sanitiza e normaliza a URL do Supabase, convertendo URLs do painel/dashboard
 * para o formato oficial da API (https://[project-id].supabase.co).
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/['"]/g, '');

  // Caso o usuário tenha colado a URL do painel: https://supabase.com/dashboard/project/abcdefghijklm...
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Se o usuário digitou apenas o Project ID (ex: "abcdefghijklm")
  if (/^[a-z0-9]{20}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // Garantir protocolo https:// se esquecido
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remover caminhos extras no final como /rest/v1, /auth/v1 ou barras extras
  url = url.replace(/\/(rest|auth|storage)\/v[0-9]+.*$/i, '');
  url = url.replace(/\/+$/, '');

  return url;
}

// Get Supabase URL and Anon Key from environment variables or localStorage
export function getSupabaseCredentials(): SupabaseCredentials {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem('supabase_url') || '';
  const storedKey = localStorage.getItem('supabase_anon_key') || '';

  // Use env var if valid, otherwise fallback to stored credentials
  const rawUrl = (envUrl && !envUrl.includes('your-project') && !envUrl.includes('example.com')) ? envUrl : storedUrl;
  const rawKey = (envKey && envKey.length > 25 && !envKey.includes('...')) ? envKey : storedKey;

  const url = sanitizeSupabaseUrl(rawUrl);
  const key = rawKey.trim().replace(/['"]/g, '');

  const isConfigured = Boolean(
    url && 
    url.startsWith('http') && 
    !url.includes('your-project') && 
    key && 
    key.length > 20
  );

  return { url, key, isConfigured };
}

export function saveSupabaseCredentials(rawUrl: string, rawKey: string): void {
  const url = sanitizeSupabaseUrl(rawUrl);
  const key = rawKey.trim().replace(/['"]/g, '');
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_anon_key', key);
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_anon_key');
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Erro ao inicializar cliente Supabase:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function reinitializeSupabase(): SupabaseClient | null {
  supabaseInstance = null;
  return getSupabaseClient();
}

