"use client"
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesChartProps {
    data: any[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    return (
        <Card className="shadow-lg h-full">
            <CardHeader>
                <CardTitle>Performance de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: 'var(--radius)'
                            }}
                            cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Bar dataKey="Orçamentos" fill="hsl(var(--accent))" name="Orçamentos Criados" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Vendas" fill="hsl(var(--primary))" name="Vendas Convertidas" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default SalesChart;
