"use client"

import React from 'react';
import type { BidDocs } from '@/lib/types';
import FileUploadSection from './FileUploadSection';

interface BidsDocumentationViewProps {
  docs: BidDocs;
  onDocsChange: React.Dispatch<React.SetStateAction<BidDocs>>;
}

const BidsDocumentationView: React.FC<BidsDocumentationViewProps> = ({ docs, onDocsChange }) => {
    const handleFileAdd = (category: keyof BidDocs, file: File) => {
        const newFile = { id: Date.now(), name: file.name };
        onDocsChange(prevDocs => ({ ...prevDocs, [category]: [...prevDocs[category], newFile] }));
    };

    const handleFileRemove = (category: keyof BidDocs, fileId: number) => {
        onDocsChange(prevDocs => ({ ...prevDocs, [category]: prevDocs[category].filter(f => f.id !== fileId) }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FileUploadSection 
                title="Documentações da Empresa" 
                files={docs.company}
                onFileAdd={(file) => handleFileAdd('company', file)}
                onFileRemove={(id) => handleFileRemove('company', id)}
            />
            <FileUploadSection 
                title="Comprovações" 
                files={docs.proofs}
                onFileAdd={(file) => handleFileAdd('proofs', file)}
                onFileRemove={(id) => handleFileRemove('proofs', id)}
            />
            <FileUploadSection 
                title="Certificações" 
                files={docs.certifications}
                onFileAdd={(file) => handleFileAdd('certifications', file)}
                onFileRemove={(id) => handleFileRemove('certifications', id)}
            />
        </div>
    );
};

export default BidsDocumentationView;
