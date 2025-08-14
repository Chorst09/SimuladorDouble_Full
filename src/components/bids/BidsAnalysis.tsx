import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

const BidsAnalysis: React.FC = () => (
    <Card className="shadow-lg w-full h-full flex flex-col">
        <CardContent className="p-0 w-full h-full flex-grow">
            <iframe 
                src="https://analiseeditais.netlify.app/" 
                className="w-full h-full border-0 rounded-b-lg" 
                title="Análise de Editais"
            ></iframe>
        </CardContent>
    </Card>
);

export default BidsAnalysis;
