import ContactFormPagesAPI from '@/components/ContactFormPagesAPI';

export default function ContactPagesAPIPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Contato - Pages API
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Este formulário usa a Pages API (/pages/api/contact) para enviar dados ao Supabase.
          </p>
        </div>
        
        <ContactFormPagesAPI />
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Implementação usando Pages API (Serverless Functions) do Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
