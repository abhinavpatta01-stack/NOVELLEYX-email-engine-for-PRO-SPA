import React, { useState } from 'react';
import { Eye, Copy, Download, Check, Send, Code } from 'lucide-react';

interface PreviewTabsProps {
  htmlCode: string;
  imageMapOnlyHtml: string;
  onSendEmail: () => void;
}

export const PreviewTabs: React.FC<PreviewTabsProps> = ({ 
  htmlCode, 
  imageMapOnlyHtml,
  onSendEmail 
}) => {
  const [copiedMap, setCopiedMap] = useState(false);

  const handleCopyMap = async () => {
    if (!imageMapOnlyHtml) return;
    try {
      await navigator.clipboard.writeText(imageMapOnlyHtml);
      setCopiedMap(true);
      setTimeout(() => setCopiedMap(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = imageMapOnlyHtml;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedMap(true);
      setTimeout(() => setCopiedMap(false), 2000);
    }
  };

  const handleDownloadMap = () => {
    if (!imageMapOnlyHtml) return;
    const blob = new Blob([imageMapOnlyHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mapped_image_only_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (!htmlCode) return;
    const win = window.open();
    if (win) {
      win.document.open();
      win.document.write(htmlCode);
      win.document.close();
    }
  };

  return (
    <div className="preview-panel glassmorphism flex-col gap-20 p-20 scrollbar-neon" style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
      
      {/* 1. View Campaign Link */}
      <div className="preview-action-card flex-col align-center py-25 text-center">
        <Eye className="icon-neon-cyan animate-pulse mb-10" size={32} />
        <h4>Interactive Campaign Preview</h4>
        <p className="text-muted mt-5 mb-15">Open the responsive campaign in a clean, full-size browser window to test the hotspots.</p>
        <button
          type="button"
          className="btn-submit flex-row align-center justify-center gap-10 py-12 px-24"
          style={{ width: 'auto', background: 'linear-gradient(90deg, var(--neon-cyan), #0066ff)', color: '#07070a', fontWeight: 'bold' }}
          onClick={handlePreview}
          disabled={!htmlCode}
        >
          <Eye size={16} />
          <span>Preview in Browser</span>
        </button>
      </div>

      {/* 2. Download Mapped Image (Image + Map tags) */}
      <div className="deploy-card glassmorphism-dark p-15 border-dim text-center flex-col align-center">
        <div className="flex-row align-center justify-center gap-10 mb-10">
          <Code className="icon-neon-cyan" size={18} />
          <h5 className="m-0 text-white">Mapped Image Code Only</h5>
        </div>
        <p className="text-muted mb-15" style={{ fontSize: '11px', lineHeight: '16px' }}>
          Exports just the image tag and the coordinate maps. Copy or download this snippet to paste directly into Mailchimp, Klaviyo, HubSpot, or custom templates.
        </p>
        <div className="flex-row justify-center gap-10 w-100">
          <button
            type="button"
            className="action-pill btn-copy flex-1 py-8 flex-row align-center justify-center gap-5"
            onClick={handleCopyMap}
            disabled={!imageMapOnlyHtml}
          >
            {copiedMap ? (
              <>
                <Check size={12} className="text-neon-cyan" />
                <span className="text-neon-cyan">COPIED Snippet</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Image Code</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            className="action-pill btn-download flex-1 py-8 flex-row align-center justify-center gap-5"
            onClick={handleDownloadMap}
            disabled={!imageMapOnlyHtml}
          >
            <Download size={12} />
            <span>Download Image HTML</span>
          </button>
        </div>
      </div>

      {/* 3. Send campaign */}
      <div className="deploy-card glassmorphism-dark p-15 border-dim text-center flex-col align-center">
        <div className="flex-row align-center justify-center gap-10 mb-10">
          <Send className="icon-neon-cyan" size={18} />
          <h5 className="m-0 text-white">Direct Email Dispatch</h5>
        </div>
        <p className="text-muted mb-15" style={{ fontSize: '11px', lineHeight: '16px' }}>
          Configure SMTP routing settings, from/to addresses, add attachments, and dispatch the HTML campaign directly.
        </p>
        <button
          type="button"
          className="btn-submit w-100 flex-row align-center justify-center gap-10 py-10"
          style={{ background: 'var(--neon-cyan)', color: '#07070a', fontWeight: 'bold' }}
          onClick={onSendEmail}
          disabled={!htmlCode}
        >
          <Send size={12} />
          <span>Open Campaign Sender</span>
        </button>
      </div>

    </div>
  );

};

export default PreviewTabs;
