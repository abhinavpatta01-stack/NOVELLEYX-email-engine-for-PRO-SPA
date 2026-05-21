import React, { useState, useEffect } from 'react';
import { Mail, Send, X, Paperclip, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  companyName: string;
}

type SendMethod = 'sandbox' | 'webhook';
type SendingStatus = 'idle' | 'sending' | 'success' | 'error';

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  htmlCode,
  companyName
}) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [sendMethod, setSendMethod] = useState<SendMethod>('sandbox');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [status, setStatus] = useState<SendingStatus>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Default subject line based on company name
  useEffect(() => {
    if (isOpen) {
      setSubject(`Exclusive Campaign from ${companyName || 'Novelleyx'}`);
      setRecipient('');
      setAttachments([]);
      setStatus('idle');
      setActiveStep(0);
      setErrorMessage('');
      setIsDragging(false);
    }
  }, [isOpen, companyName]);

  if (!isOpen) return null;

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      // Limit file size to 3MB per attachment
      if (file.size > 3 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 3MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          base64: base64String
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const runSimulation = () => {
    setStatus('sending');
    setActiveStep(1); // 1. Compiling HTML & Assets

    setTimeout(() => {
      setActiveStep(2); // 2. Packaging Attachments
      
      setTimeout(() => {
        setActiveStep(3); // 3. Transmitting Headers
        
        setTimeout(() => {
          setActiveStep(4); // 4. Delivery success
          setStatus('success');
        }, 1500);
      }, 1500);
    }, 1200);
  };

  const runWebhookSend = async () => {
    if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS Webhook URL.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setActiveStep(1);

    try {
      // Step 1: Compiling
      await new Promise(resolve => setTimeout(resolve, 800));
      setActiveStep(2);

      // Step 2: Packaging attachments
      await new Promise(resolve => setTimeout(resolve, 800));
      setActiveStep(3);

      // Prepare payload
      const payload = {
        to: recipient,
        subject: subject,
        html: htmlCode,
        companyName: companyName,
        sentAt: new Date().toISOString(),
        attachments: attachments.map(att => ({
          filename: att.name,
          contentType: att.type,
          content: att.base64.split(',')[1] // Get raw base64 string
        }))
      };

      // Step 3: Trigger real transmission
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      setActiveStep(4);
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to dispatch webhook. Network error.');
      setStatus('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) return;

    if (sendMethod === 'sandbox') {
      runSimulation();
    } else {
      runWebhookSend();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glassmorphism animate-scale-up">
        
        <div className="modal-header">
          <div className="modal-title">
            <Mail className="icon-neon-cyan" size={16} />
            <span>Send Email Campaign</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} disabled={status === 'sending'}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {status === 'idle' && (
            <form onSubmit={handleSubmit} className="flex-col gap-10">
              <div className="form-group">
                <label htmlFor="send-method">Delivery System</label>
                <div className="send-methods-grid">
                  <div 
                    className={`send-method-card ${sendMethod === 'sandbox' ? 'active' : ''}`}
                    onClick={() => setSendMethod('sandbox')}
                  >
                    <div className="method-card-title">Sandbox Simulator</div>
                    <div className="method-card-desc">Instant mock transmission for demo testing</div>
                  </div>
                  <div 
                    className={`send-method-card ${sendMethod === 'webhook' ? 'active' : ''}`}
                    onClick={() => setSendMethod('webhook')}
                  >
                    <div className="method-card-title">Webhook API</div>
                    <div className="method-card-desc">POST live JSON payload to custom endpoint</div>
                  </div>
                </div>
              </div>

              {sendMethod === 'webhook' && (
                <div className="form-group animate-fade-in">
                  <label htmlFor="webhook-url">API Webhook Endpoint URL</label>
                  <input
                    id="webhook-url"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://make.com/webhooks/... or https://webhook.site/..."
                    required
                  />
                  <span className="field-hint">Triggers a POST request containing HTML, recipient info, and attachments.</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="send-recipient">Recipient Email Address</label>
                <input
                  id="send-recipient"
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="send-subject">Subject Line</label>
                <input
                  id="send-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email Subject Line"
                  required
                />
              </div>

              <div className="form-group">
                <label>Add File Attachments (Optional)</label>
                <div 
                  className={`attachment-dropzone ${isDragging ? 'dragging' : ''}`}
                  onClick={() => document.getElementById('email-attachment-file')?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Paperclip size={18} className="icon-neon-cyan" />
                  <span>{isDragging ? 'Drop Files Here' : 'Choose Files or Drag & Drop'}</span>
                  <span>Max 3MB per file</span>
                  <input
                    id="email-attachment-file"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="attachments-list scrollbar-neon">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="attachment-file-item animate-fade-in">
                        <div className="flex-row align-center min-width-0">
                          <span className="attachment-file-name">{file.name}</span>
                          <span className="attachment-file-size">({formatSize(file.size)})</span>
                        </div>
                        <button 
                          type="button" 
                          className="btn-remove-attachment"
                          onClick={() => removeAttachment(idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit flex-row align-center gap-5">
                  <Send size={13} />
                  <span>Send Campaign</span>
                </button>
              </div>
            </form>
          )}

          {status === 'sending' && (
            <div className="flex-col align-center py-20 text-center animate-fade-in">
              <RefreshCw className="icon-neon-cyan animate-spin mb-15" size={32} />
              <h4>Transmitting Campaign...</h4>
              <p className="text-muted mt-5">Please hold on while the campaign is prepared and sent.</p>

              <div className="stepper-container w-100">
                <div className={`step-item ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                  <div className="step-circle">{activeStep > 1 ? '✓' : '1'}</div>
                  <div className="step-text">Compiling Responsive Email HTML</div>
                </div>

                <div className={`step-item ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
                  <div className="step-circle">{activeStep > 2 ? '✓' : '2'}</div>
                  <div className="step-text">
                    {attachments.length > 0 
                      ? `Uploading and Encoding Attachments (${attachments.length} files)` 
                      : 'Checking File Attachments (None)'}
                  </div>
                </div>

                <div className={`step-item ${activeStep >= 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}>
                  <div className="step-circle">{activeStep > 3 ? '✓' : '3'}</div>
                  <div className="step-text">
                    {sendMethod === 'webhook' ? 'Transmitting JSON Payload to API' : 'Transmitting to Mail Relay Server'}
                  </div>
                </div>

                <div className={`step-item ${activeStep >= 4 ? 'active' : ''}`}>
                  <div className="step-circle">4</div>
                  <div className="step-text">Verifying Inbox Delivery Receipt</div>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex-col align-center py-20 text-center animate-fade-in">
              <CheckCircle className="text-neon-cyan mb-15" size={48} />
              <h3>Campaign Dispatched!</h3>
              <p className="text-muted mt-10">
                The responsive mapped campaign has been sent successfully to:
                <br />
                <strong className="text-neon-cyan" style={{ display: 'block', margin: '5px 0' }}>{recipient}</strong>
                Subject: <em>"{subject}"</em>
              </p>

              {attachments.length > 0 && (
                <div className="mt-10 text-muted" style={{ fontSize: '11px' }}>
                  Successfully attached {attachments.length} files.
                </div>
              )}

              <div className="modal-footer w-100" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn-submit" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex-col align-center py-20 text-center animate-fade-in">
              <AlertCircle className="text-neon-pink mb-15" size={48} />
              <h3>Transmission Failed</h3>
              <div className="form-error w-100 mt-10">
                <span>{errorMessage}</span>
              </div>
              <p className="text-muted mt-10">Please verify your connection and settings, then try again.</p>

              <div className="modal-footer w-100" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn-cancel" onClick={() => setStatus('idle')}>
                  Back to Form
                </button>
                <button type="button" className="btn-submit" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default SendEmailModal;
