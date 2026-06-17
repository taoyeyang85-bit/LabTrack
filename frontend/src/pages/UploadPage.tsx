import { useNavigate } from 'react-router-dom';
import DisclaimerBanner from '../components/DisclaimerBanner';
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
          <h1>Upload lab report</h1>
          <p className="text-muted">
            Upload a PDF or image of your blood test results. We extract values and explain
            them — we do not store your original file.
          </p>
        </div>
      </div>

      <UploadBox onUpload={handleUpload} />

      <div className="card info-card">
        <h3>Supported formats</h3>
        <ul>
          <li>PDF lab reports (text-based or scanned)</li>
          <li>PNG, JPG, or JPEG screenshots or photos</li>
          <li>Maximum file size: 10 MB</li>
        </ul>
        <p className="text-muted">
          Reference ranges vary by lab, age, sex, and medical history. Always verify extracted
          values against your original report.
        </p>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
