import { useNavigate } from 'react-router-dom';
import UploadBox from '../components/UploadBox';
import { uploadReport } from '../lib/api';

export default function UploadPage() {
  const navigate = useNavigate();

  const handleUpload = async (file: File) => {
    const report = await uploadReport(file);
    navigate(`/reports/${report.id}`);
  };

  return (
    <div className="upload-page container">
      <div className="page-header">
        <div>
          <h1>Upload report</h1>
          <p className="text-muted">PDF or image, up to 10 MB</p>
        </div>
      </div>

      <UploadBox onUpload={handleUpload} />
    </div>
  );
}
