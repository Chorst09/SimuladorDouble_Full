"use client"

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

interface FileUploadSectionProps {
  title: string;
  files: { id: number, name: string }[];
  onFileAdd: (file: File) => void;
  onFileRemove: (id: number) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ title, files, onFileAdd, onFileRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileAdd(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mb-4 min-h-[100px]">
                    {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <span className="text-sm text-muted-foreground truncate pr-2">{file.name}</span>
                            <Button variant="ghost" size="icon" onClick={() => onFileRemove(file.id)}>
                                <Trash2 size={16} className="text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                    <PlusCircle size={16} className="mr-2" /> Adicionar Arquivo
                </Button>
            </CardContent>
        </Card>
    );
};

export default FileUploadSection;
