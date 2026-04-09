'use client';

import { useState, useCallback } from 'react';

interface OrdonnanceUploadProps {
  onUploadComplete: (data: {
    medicaments: string[];
    pathologies: string[];
    dispositifsMedicaux: string[];
    prescripteur?: string;
    date?: string;
  }) => void;
}

export function OrdonnanceUpload({ onUploadComplete }: OrdonnanceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Format non supporté. Utilisez une image (JPG, PNG) ou un PDF.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedFile(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        onUploadComplete(result.data);
      } else {
        setError('Impossible d\'analyser l\'ordonnance. Veuillez réessayer.');
      }
    } catch {
      setError('Erreur lors de l\'envoi. Vérifiez votre connexion.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div>
      <label
        htmlFor="ordonnance-upload"
        className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{ display: 'block', cursor: 'pointer' }}
      >
        <input
          id="ordonnance-upload"
          type="file"
          accept="image/*,.pdf"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              border: '3px solid rgba(26, 86, 219, 0.2)',
              borderTopColor: 'var(--color-primary-light)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Analyse de l&apos;ordonnance en cours…
            </p>
          </div>
        ) : uploadedFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <p style={{ color: '#86efac', fontSize: '0.875rem', fontWeight: 600 }}>
              Ordonnance analysée
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{uploadedFile}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem' }}>📄</span>
            <p style={{ color: 'var(--color-text)', fontSize: '0.925rem', fontWeight: 500 }}>
              Glissez l&apos;ordonnance ici
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              ou cliquez pour sélectionner un fichier
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
              JPG, PNG, PDF — Max 10 Mo
            </p>
          </div>
        )}
      </label>

      {error && (
        <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
