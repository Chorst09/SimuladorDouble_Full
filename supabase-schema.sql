-- Tabela para armazenar mensagens de contato
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- RLS (Row Level Security) - opcional, dependendo dos requisitos de segurança
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (para o formulário de contato)
-- CREATE POLICY "Allow public insert" ON contacts FOR INSERT WITH CHECK (true);

-- Política para permitir leitura apenas para usuários autenticados (admin)
-- CREATE POLICY "Allow authenticated read" ON contacts FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE contacts IS 'Tabela para armazenar mensagens de contato do site';
COMMENT ON COLUMN contacts.id IS 'Identificador único da mensagem';
COMMENT ON COLUMN contacts.name IS 'Nome do remetente';
COMMENT ON COLUMN contacts.email IS 'Email do remetente';
COMMENT ON COLUMN contacts.message IS 'Conteúdo da mensagem';
COMMENT ON COLUMN contacts.status IS 'Status da mensagem (pending, read, replied, archived)';
COMMENT ON COLUMN contacts.created_at IS 'Data e hora de criação';
COMMENT ON COLUMN contacts.updated_at IS 'Data e hora da última atualização';
