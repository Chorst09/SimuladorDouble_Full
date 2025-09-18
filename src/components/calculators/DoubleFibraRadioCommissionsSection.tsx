import React, { useState, useEffect } from 'react';
import { DoubleFibraRadioCommissionTables, DoubleFibraRadioCommissionData } from './DoubleFibraRadioCommissionTables';

const DoubleFibraRadioCommissionsSection: React.FC = () => {
  // Default commission data based on the provided images
  const defaultCommissionData: DoubleFibraRadioCommissionData = {
    vendedor: [
      { meses: '12', comissao: '1,5' },
      { meses: '24', comissao: '2' },
      { meses: '36', comissao: '2,5' },
      { meses: '48', comissao: '3' },
      { meses: '60', comissao: '3,5' },
    ],
    diretor: [
      { meses: '12', comissao: '0,5' },
      { meses: '24', comissao: '0,75' },
      { meses: '36', comissao: '1' },
      { meses: '48', comissao: '1,25' },
      { meses: '60', comissao: '1,5' },
    ],
    parceiro: [
      { range: 'R$ 0,00 a R$ 500,00', ate24: '1,5', mais24: '2,5' },
      { range: 'R$ 500,01 a R$ 1.000,00', ate24: '2,5', mais24: '4' },
      { range: 'R$ 1.000,01 a R$ 1.500,00', ate24: '4,01', mais24: '5,5' },
      { range: 'R$ 1.500,01 a R$ 3.000,00', ate24: '5,51', mais24: '7' },
      { range: 'R$ 3.000,01 a R$ 5.000,00', ate24: '7,01', mais24: '8,5' },
      { range: 'R$ 5.000,01 a R$ 6.500,00', ate24: '8,51', mais24: '10' },
      { range: 'R$ 6.500,01 a R$ 9.000,00', ate24: '10,01', mais24: '11,5' },
      { range: 'Acima de R$ 9.000,01', ate24: '11,51', mais24: '13' },
    ],
  };

  const [commissionData, setCommissionData] = useState<DoubleFibraRadioCommissionData>(defaultCommissionData);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('doubleFibraRadioCommissionsData');
    if (savedData) {
      try {
        setCommissionData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to parse saved commission data', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  const handleCommissionDataChange = (data: DoubleFibraRadioCommissionData) => {
    setCommissionData(data);
    localStorage.setItem('doubleFibraRadioCommissionsData', JSON.stringify(data));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Precificação - Double-Fibra/Radio</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tabela de Comissões</h2>
        <DoubleFibraRadioCommissionTables 
          commissionData={commissionData}
          onCommissionDataChange={handleCommissionDataChange}
        />
      </div>
    </div>
  );
};

export default DoubleFibraRadioCommissionsSection;
