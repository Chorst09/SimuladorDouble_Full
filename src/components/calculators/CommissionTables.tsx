import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface CommissionData {
  vendedor: { meses: string; comissao: string }[];
  diretor: { meses: string; comissao: string }[];
  parceiro: { range: string; ate24: string; mais24: string }[];
}

interface CommissionTablesProps {
  commissionData: CommissionData;
  onCommissionDataChange: (data: CommissionData) => void;
}

export const CommissionTables: React.FC<CommissionTablesProps> = ({ 
  commissionData, 
  onCommissionDataChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<CommissionData>({ ...commissionData });

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Tabela de Comissões</CardTitle>
          {!isEditing ? (
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> Salvar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Vendedor e Diretor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Comissão Vendedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prazo (meses)</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.vendedor.map((row, index) => (
                        <TableRow key={`vendedor-${index}`}>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={row.meses}
                                onChange={(e) => handleVendedorChange(index, 'meses', e.target.value)}
                                className="w-24"
                              />
                            ) : (
                              row.meses
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.comissao}
                                  onChange={(e) => handleVendedorChange(index, 'comissao', e.target.value)}
                                  className="w-20 text-right"
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Comissão Diretor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prazo (meses)</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.diretor.map((row, index) => (
                        <TableRow key={`diretor-${index}`}>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={row.meses}
                                onChange={(e) => handleDiretorChange(index, 'meses', e.target.value)}
                                className="w-24"
                              />
                            ) : (
                              row.meses
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.comissao}
                                  onChange={(e) => handleDiretorChange(index, 'comissao', e.target.value)}
                                  className="w-20 text-right"
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Comissão Parceiro Indicador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Valores - Receita Mensal</TableHead>
                        <TableHead className="text-right">Até 24 Meses</TableHead>
                        <TableHead className="text-right">24 Meses ou Mais</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableData.parceiro.map((row, index) => (
                        <TableRow key={`parceiro-${index}`}>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                value={row.range}
                                onChange={(e) => handleParceiroChange(index, 'range', e.target.value)}
                                className="w-full"
                              />
                            ) : (
                              row.range
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.ate24}
                                  onChange={(e) => handleParceiroChange(index, 'ate24', e.target.value)}
                                  className="w-20 text-right"
                                />
                                <span className="ml-1">%</span>
                              </div>
                            ) : (
                              `${row.ate24}%`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <Input
                                  value={row.mais24}
                                  onChange={(e) => handleParceiroChange(index, 'mais24', e.target.value)}
                                  className="w-20 text-right"
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

export default CommissionTables;
