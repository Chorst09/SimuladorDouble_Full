// src/lib/env-check.ts
export function checkEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const issues: string[] = [];

  if (!supabaseUrl) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL não está definida');
  } else if (!supabaseUrl.startsWith('https://')) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL deve começar com https://');
  }

  if (!supabaseAnonKey) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida');
  } else if (supabaseAnonKey.length < 100) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY parece estar incompleta');
  }

  return {
    isValid: issues.length === 0,
    issues,
    config: {
      supabaseUrl,
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'não definida'
    }
  };
}

export function logEnvironmentStatus() {
  const check = checkEnvironmentVariables();
  
  if (check.isValid) {
    console.log('✅ Variáveis de ambiente do Supabase configuradas corretamente');
    console.log('📍 URL:', check.config.supabaseUrl);
    console.log('🔑 Anon Key:', check.config.supabaseAnonKey);
  } else {
    console.error('❌ Problemas com as variáveis de ambiente:');
    check.issues.forEach(issue => console.error(`  - ${issue}`));
    console.log('📋 Configuração atual:', check.config);
  }
  
  return check;
}
