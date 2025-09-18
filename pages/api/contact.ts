import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabaseClient'; // Importe o cliente Supabase

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  data?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Configurar CORS se necessário
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, email, message }: ContactFormData = req.body;

      // Validação básica dos dados
      if (!name || !email || !message) {
        return res.status(400).json({ 
          error: 'Todos os campos são obrigatórios (nome, email, mensagem).' 
        });
      }

      // Validação do formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Por favor, insira um email válido.' 
        });
      }

      // Validação do tamanho dos campos
      if (name.length > 100) {
        return res.status(400).json({ 
          error: 'O nome deve ter no máximo 100 caracteres.' 
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({ 
          error: 'A mensagem deve ter no máximo 1000 caracteres.' 
        });
      }

      // Inserir dados no Supabase
      const { data, error } = await supabase
        .from('contacts') // O nome da sua tabela
        .insert([
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            created_at: new Date().toISOString(),
            status: 'pending'
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao inserir no Supabase:', error);
        
        // Verificar se é erro de tabela não encontrada
        if (error.code === 'PGRST116') {
          return res.status(500).json({ 
            error: 'Tabela de contatos não encontrada. Verifique a configuração do banco de dados.' 
          });
        }

        return res.status(500).json({ 
          error: 'Erro interno do servidor. Tente novamente mais tarde.' 
        });
      }

      return res.status(200).json({ 
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.', 
        data: data?.[0] 
      });

    } catch (error) {
      console.error('Erro na API de contato:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor. Tente novamente mais tarde.' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
