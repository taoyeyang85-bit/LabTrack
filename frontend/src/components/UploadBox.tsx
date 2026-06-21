import { ChangeEvent, DragEvent, useRef, useState } from 'react';

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['.pdf', '.png', '.jpg', '.jpeg'];

type UploadBoxProps = {
  onUpload: (file: File) => Promise<void>;
};

export default function UploadBox({ onUpload }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return 'Please upload a PDF, PNG, JPG, or JPEG file.';
    }
    if (file.size > MAX_SIZE) {
      return 'File is too large. Maximum size is 10 MB.';
    }
    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="upload-box">
      <div
        className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${loading ? 'loading' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
          hidden
          disabled={loading}
        />
        {loading ? (
          <p className="upload-status">Reading your report… this may take a minute on free hosting.</p>
        ) : (
          <>
            <p className="upload-title">Drop file here or tap to choose</p>
            <p className="upload-subtitle">PDF, PNG, JPG · max 10 MB</p>
          </>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}
