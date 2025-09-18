import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface RadioCommissionData {
  vendedor: { meses: string; comissao: string }[];
  diretor: { meses: string; comissao: string }[];
  parceiro: { range: string; ate24: string; mais24: string }[];
}

interface RadioCommissionTablesProps {
  commissionData: RadioCommissionData;
  onCommissionDataChange: (data: RadioCommissionData) => void;
}

export const RadioCommissionTables: React.FC<RadioCommissionTablesProps> = ({ 
  commissionData, 
  onCommissionDataChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<RadioCommissionData>({ ...commissionData });

  const handleEdit = () => {
    setEditableData(JSON.parse(JSON.stringify(commissionData)));
    setIsEditing(true);
  };

  const handleSave = () => {
    onCommissionDataChange(JSON.parse(JSON.stringify(editableData)));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableData(JSON.parse(JSON.stringify(commissionData)));
    setIsEditing(false);
  };

  const handleVendedorChange = (index: number, field: 'meses' | 'comissao', value: string) => {
    const newData = { ...editableData };
    newData.vendedor[index][field] = value;
    setEditableData(newData);
  };

  const handleDiretorChange = (index: number, field: 'meses' | 'comissao', value: string) => {
    const newData = { ...editableData };
    newData.diretor[index][field] = value;
    setEditableData(newData);
  };

  const handleParceiroChange = (index: number, field: 'range' | 'ate24' | 'mais24', value: string) => {
    const newData = { ...editableData };
    newData.parceiro[index][field] = value;
    setEditableData(newData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gray-900 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Tabela de Comissões - Internet Rádio</CardTitle>
          {!isEditing ? (
            <Button variant="ghost" size="icon" onClick={handleEdit} className="text-white hover:bg-gray-800">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel} className="text-white">
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-1" /> Salvar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Vendedor e Diretor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-800 bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Comissão Vendedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-700">
                        <TableHead className="text-gray-300">Prazo (meses)</TableHead>
                        <TableHead className="text-right text-gray-300">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.vendedor.map((row, index) => (
                        <TableRow key={`vendedor-${index}`} className="hover:bg-gray-700">
                          <TableCell className="text-white">
                            {isEditing ? (
                              <Input
                                value={row.meses}
                                onChange={(e) => handleVendedorChange(index, 'meses', e.target.value)}
                                className="w-24 bg-gray-700 border-gray-600 text-white"
                              />
                            ) : (
                              row.meses
                            )}
                          </TableCell>
                          <TableCell className="text-right text-white">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.comissao}
                                  onChange={(e) => handleVendedorChange(index, 'comissao', e.target.value)}
                                  className="w-20 text-right bg-gray-700 border-gray-600 text-white"
                                />
                                <span className="ml-1">%</span>
                              </div>
                            ) : (
                              `${row.comissao}%`
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Comissão Diretor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-700">
                        <TableHead className="text-gray-300">Prazo (meses)</TableHead>
                        <TableHead className="text-right text-gray-300">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.diretor.map((row, index) => (
                        <TableRow key={`diretor-${index}`} className="hover:bg-gray-700">
                          <TableCell className="text-white">
                            {isEditing ? (
                              <Input
                                value={row.meses}
                                onChange={(e) => handleDiretorChange(index, 'meses', e.target.value)}
                                className="w-24 bg-gray-700 border-gray-600 text-white"
                              />
                            ) : (
                              row.meses
                            )}
                          </TableCell>
                          <TableCell className="text-right text-white">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.comissao}
                                  onChange={(e) => handleDiretorChange(index, 'comissao', e.target.value)}
                                  className="w-20 text-right bg-gray-700 border-gray-600 text-white"
                                />
                                <span className="ml-1">%</span>
                              </div>
                            ) : (
                              `${row.comissao}%`
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Parceiro Indicador */}
            <Card className="border-gray-800 bg-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Comissão Parceiro Indicador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-700">
                        <TableHead className="text-gray-300">Valores - Receita Mensal</TableHead>
                        <TableHead className="text-right text-gray-300">Até 24 Meses</TableHead>
                        <TableHead className="text-right text-gray-300">24 Meses ou Mais</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.parceiro.map((row, index) => (
                        <TableRow key={`parceiro-${index}`} className="hover:bg-gray-700">
                          <TableCell className="text-white">
                            {isEditing ? (
                              <Input
                                value={row.range}
                                onChange={(e) => handleParceiroChange(index, 'range', e.target.value)}
                                className="w-full bg-gray-700 border-gray-600 text-white"
                              />
                            ) : (
                              row.range
                            )}
                          </TableCell>
                          <TableCell className="text-right text-white">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.ate24}
                                  onChange={(e) => handleParceiroChange(index, 'ate24', e.target.value)}
                                  className="w-20 text-right bg-gray-700 border-gray-600 text-white"
                                />
                                <span className="ml-1">%</span>
                              </div>
                            ) : (
                              `${row.ate24}%`
                            )}
                          </TableCell>
                          <TableCell className="text-right text-white">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.mais24}
                                  onChange={(e) => handleParceiroChange(index, 'mais24', e.target.value)}
                                  className="w-20 text-right bg-gray-700 border-gray-600 text-white"
                                />
                                <span className="ml-1">%</span>
                              </div>
                            ) : (
                              `${row.mais24}%`
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadioCommissionTables;
