import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Code, Copy, Download, Check, AlertCircle } from 'lucide-react';

interface PreviewTabsProps {
  htmlCode: string;
}

type TabType = 'desktop' | 'mobile' | 'code';

export const PreviewTabs: React.FC<PreviewTabsProps> = ({ htmlCode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('desktop');
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update iframe contents whenever htmlCode changes
  useEffect(() => {
    if (activeTab !== 'code' && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlCode);
        doc.close();
      }
    }
  }, [htmlCode, activeTab]);

  const handleCopy = async () => {
    if (!htmlCode) return;
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = htmlCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email_campaign_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="preview-panel glassmorphism">
      <div className="preview-header">
        <div className="preview-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'desktop' ? 'active' : ''}`}
            onClick={() => setActiveTab('desktop')}
          >
            <Monitor size={14} />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveTab('mobile')}
          >
            <Smartphone size={14} />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={14} />
            <span>HTML Source</span>
          </button>
        </div>

        <div className="preview-actions">
          <button
            type="button"
            className="action-pill btn-copy"
            onClick={handleCopy}
            title="Copy HTML to Clipboard"
            disabled={!htmlCode}
          >
            {copied ? (
              <>
                <Check size={13} className="text-neon-cyan" />
                <span className="text-neon-cyan">COPIED!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>COPY HTML</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="action-pill btn-download"
            onClick={handleDownload}
            title="Download HTML File"
            disabled={!htmlCode}
          >
            <Download size={13} />
            <span>DOWNLOAD</span>
          </button>
        </div>
      </div>

      <div className="preview-viewport-container scrollbar-neon">
        {activeTab === 'desktop' && (
          <div className="iframe-wrapper desktop-mode animate-fade-in">
            <iframe
              ref={iframeRef}
              title="Desktop Email Preview"
              className="preview-iframe"
            />
          </div>
        )}

        {activeTab === 'mobile' && (
          <div className="mobile-frame-container animate-fade-in">
            <div className="mobile-phone-outline">
              <div className="phone-earpiece" />
              <div className="iframe-wrapper mobile-mode">
                <iframe
                  ref={iframeRef}
                  title="Mobile Email Preview"
                  className="preview-iframe"
                />
              </div>
              <div className="phone-home-button" />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-view-container animate-fade-in">
            {htmlCode.includes('base64') && (
              <div className="code-warning">
                <AlertCircle size={14} />
                <span>
                  <strong>Tip:</strong> Inline base64 images inside emails can be blocked by some mail clients (like Outlook or Gmail). For campaign sending, toggle to <strong>CDN Hosted Image URL</strong>.
                </span>
              </div>
            )}
            <textarea
              readOnly
              value={htmlCode}
              placeholder="Production HTML will display here..."
              className="code-textarea scrollbar-neon"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default PreviewTabs;
