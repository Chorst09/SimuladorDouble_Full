import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Entre em Contato
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tem alguma dúvida ou sugestão? Envie sua mensagem e nossa equipe 
            entrará em contato com você o mais breve possível.
          </p>
        </div>
        
        <ContactForm />
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Suas informações são tratadas com total confidencialidade e 
            utilizadas apenas para responder ao seu contato.
          </p>
        </div>
      </div>
    </div>
  );
}
