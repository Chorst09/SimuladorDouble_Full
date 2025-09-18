import PABXSIPCalculator from '@/components/calculators/PABXSIPCalculator';

export default function PabxSipPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calculadora PABX/SIP</h1>
      <PABXSIPCalculator />
    </div>
  );
}
