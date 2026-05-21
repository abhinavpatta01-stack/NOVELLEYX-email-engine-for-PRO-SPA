import React, { useState } from 'react';
import { EmailConfig, NavLink, SocialLink, BrandPreset } from '../types';
import { 
  Building, Image, Type, Compass, 
  Share2, ChevronDown, ChevronUp, Upload, Trash, Plus, X, Sparkles, RefreshCw 
} from 'lucide-react';

interface EmailSettingsProps {
  config: EmailConfig;
  onChange: (updates: Partial<EmailConfig>) => void;
  presets: BrandPreset[];
  onPresetSelect: (presetId: string) => void;
  onSavePreset: (preset: Omit<BrandPreset, 'id'>) => void;
  onDeletePreset: (presetId: string) => void;
  onImageUpload: (file: File) => void;
  base64Image: string;
}

type AccordionKey = 'brand' | 'image' | 'header' | 'cta' | 'footer' | 'ai';

export const EmailSettings: React.FC<EmailSettingsProps> = ({
  config,
  onChange,
  presets,
  onPresetSelect,
  onSavePreset,
  onDeletePreset,
  onImageUpload,
  base64Image
}) => {
  const [activeAccordion, setActiveAccordion] = useState<AccordionKey>('brand');
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom Preset Modal State
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [addCompanyName, setAddCompanyName] = useState('');
  const [addFallbackUrl, setAddFallbackUrl] = useState('https://');
  const [addPrimaryColor, setAddPrimaryColor] = useState('#00f0ff');
  const [addLogoUrl, setAddLogoUrl] = useState('');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenType, setAiGenType] = useState<'brand' | 'cta' | 'all'>('all');
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const runAiAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiLogs([]);
    
    try {
      const promptLower = aiPrompt.toLowerCase();
      
      let theme = 'cyberpunk';
      let brandName = 'Novelleyx Neon';
      let primaryColor = '#00f0ff';
      let logoBg = '#101018';
      let navLinks = [
        { text: 'Features', url: 'https://example.com/features' },
        { text: 'Interactive Map', url: 'https://example.com/map' },
        { text: 'Get Started', url: 'https://example.com/start' }
      ];
      let ctaTitle = 'Elevate Your Interactive Campaigns';
      let ctaBody = 'Deploy interactive clickable maps directly in your customers\' inboxes. High performance, zero-friction path to purchase.';
      let ctaBtn = 'Learn More';

      if (promptLower.includes('organic') || promptLower.includes('nature') || promptLower.includes('eco') || promptLower.includes('green') || promptLower.includes('wellness') || promptLower.includes('health') || promptLower.includes('botanical')) {
        theme = 'wellness';
        brandName = 'Flora & Co';
        primaryColor = '#2e7d32';
        logoBg = '#f1f8e9';
        navLinks = [
          { text: 'Our Farms', url: 'https://example.com/farms' },
          { text: 'Botanicals', url: 'https://example.com/botanicals' },
          { text: 'Sustainability', url: 'https://example.com/green' }
        ];
        ctaTitle = 'Reconnecting with Botanical Healing';
        ctaBody = 'Harvested from organic, sustainable sources. Explore our freshly packaged collection of aromatherapy blends crafted to relax your body and soothe your mind.';
        ctaBtn = 'Explore Healing';
      } else if (promptLower.includes('corp') || promptLower.includes('finance') || promptLower.includes('bank') || promptLower.includes('business') || promptLower.includes('consult')) {
        theme = 'enterprise';
        brandName = 'Apex Ledger';
        primaryColor = '#0a2540';
        logoBg = '#f8f9fa';
        navLinks = [
          { text: 'Enterprise Platform', url: 'https://example.com/platform' },
          { text: 'Pricing Matrix', url: 'https://example.com/pricing' },
          { text: 'Schedule Demo', url: 'https://example.com/demo' }
        ];
        ctaTitle = 'Consolidate Marketing Infrastructure';
        ctaBody = 'Deliver maximum conversion metrics using high-fidelity inline image maps. Integrate enterprise-grade analytics tracking on every zone interaction.';
        ctaBtn = 'Request Case Study';
      } else if (promptLower.includes('kid') || promptLower.includes('fun') || promptLower.includes('toy') || promptLower.includes('play') || promptLower.includes('festival')) {
        theme = 'playful';
        brandName = 'Wonder Play';
        primaryColor = '#ff007f';
        logoBg = '#120010';
        navLinks = [
          { text: 'Shop Toys', url: 'https://example.com/toys' },
          { text: 'Activity Kits', url: 'https://example.com/activities' },
          { text: 'Parent Portal', url: 'https://example.com/portal' }
        ];
        ctaTitle = 'Unbox Infinite Joy & Learning!';
        ctaBody = 'Check out our newly dropped creative activity packages. Full of vibrant accessories, interactive games, and toys built for healthy, imaginative play.';
        ctaBtn = 'Let\'s Play!';
      } else if (promptLower.includes('sale') || promptLower.includes('shop') || promptLower.includes('fashion') || promptLower.includes('holiday') || promptLower.includes('black') || promptLower.includes('clothing')) {
        theme = 'fashion';
        brandName = 'Vogue Studio';
        primaryColor = '#d946ef';
        logoBg = '#09090b';
        navLinks = [
          { text: 'New Arrivals', url: 'https://example.com/new' },
          { text: 'Holiday Deals', url: 'https://example.com/deals' },
          { text: 'Style Guide', url: 'https://example.com/style' }
        ];
        ctaTitle = 'HOLIDAY SAVINGS ARE OFFICIALLY LIVE';
        ctaBody = 'Unlock early access items at up to 50% off. Seamless mapped sizing charts and priority checkout routing. Free express delivery on orders over $75.';
        ctaBtn = 'Claim 50% Off';
      } else {
        // Dynamic builder based on prompt text keywords
        const cleanPrompt = aiPrompt.replace(/[^a-zA-Z0-9\s]/g, '');
        const words = cleanPrompt.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0) {
          brandName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).slice(0, 3).join(' ') + ' Brand';
        } else {
          brandName = 'Custom Preset';
        }
        
        const colors = ['#00f0ff', '#ff007f', '#39ff14', '#ffbd2e', '#8b5cf6'];
        primaryColor = colors[Math.floor(Math.random() * colors.length)];
        
        ctaTitle = `Welcome to ${brandName}`;
        ctaBody = `Discover the next level of brand interactions using our mapped email image canvas. Tailored content optimized for your target audience: "${aiPrompt}".`;
      }

      const steps = [
        `[ai] Initializing Novelleyx AI Generator...`,
        `[ai] Reading intent prompt: "${aiPrompt}"`,
        `[ai] Extracting visual archetype mapping...`,
        `[ai] Archetype classification: ${theme.toUpperCase()} style.`,
        `[ai] Deciding color palette matching: ${primaryColor}`,
        `[ai] Constructing header navigation elements...`,
        `[ai] Writing CTA marketing copy & action triggers...`,
        `[ai] Performing local optimization compile...`,
        `[ai] Applying variables to active workspace state...`
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 80));
        setAiLogs(prev => [...prev, steps[i]]);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Apply the consolidated updates in a single call to prevent React state batching races
      const updates: any = {};
      if (aiGenType === 'brand' || aiGenType === 'all') {
        updates.companyName = brandName;
        updates.headerActive = true;
        updates.headerBgColor = logoBg;
        updates.headerTextColor = primaryColor;
        updates.navLinks = navLinks;
        updates.ctaBgColor = primaryColor;
        updates.fallbackUrl = 'https://' + brandName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        updates.ctaButtonUrl = 'https://' + brandName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      }
      
      if (aiGenType === 'cta' || aiGenType === 'all') {
        updates.ctaActive = true;
        updates.ctaTitle = ctaTitle;
        updates.ctaBody = ctaBody;
        updates.ctaButtonText = ctaBtn;
        updates.ctaBgColor = primaryColor;
        updates.ctaTextColor = '#ffffff';
      }

      onChange(updates);

      setAiLogs(prev => [...prev, `[success] Novelleyx AI successfully automated the settings panel!`]);
    } catch (err: any) {
      console.error(err);
      setAiLogs(prev => [...prev, `[error] AI engine error: ${err?.message || err}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAccordion = (key: AccordionKey) => {
    setActiveAccordion(activeAccordion === key ? 'brand' : key);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  // Nav Links helper functions
  const handleNavLinkChange = (index: number, field: keyof NavLink, value: string) => {
    const newLinks = [...config.navLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({ navLinks: newLinks });
  };

  const addNavLink = () => {
    if (config.navLinks.length >= 4) return;
    onChange({
      navLinks: [...config.navLinks, { text: 'New Page', url: 'https://' }]
    });
  };

  const removeNavLink = (index: number) => {
    const newLinks = config.navLinks.filter((_, idx) => idx !== index);
    onChange({ navLinks: newLinks });
  };

  // Social Links helper functions
  const handleSocialLinkChange = (index: number, updates: Partial<SocialLink>) => {
    const newSocials = [...config.socialLinks];
    newSocials[index] = { ...newSocials[index], ...updates };
    onChange({ socialLinks: newSocials });
  };

  const handleCreateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCompanyName.trim()) return;

    onSavePreset({
      name: addCompanyName.trim(),
      fallbackUrl: addFallbackUrl.trim(),
      logoUrl: addLogoUrl.trim(),
      primaryColor: addPrimaryColor,
      navLinks: [
        { text: 'Home', url: addFallbackUrl.trim() },
        { text: 'Products', url: addFallbackUrl.trim() + '/products' },
        { text: 'Contact Us', url: addFallbackUrl.trim() + '/contact' }
      ],
      footerText: `© ${new Date().getFullYear()} ${addCompanyName.trim()} Technology Inc. All Rights Reserved.`,
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com', active: false },
        { platform: 'x', url: 'https://x.com', active: true },
        { platform: 'instagram', url: 'https://instagram.com', active: true },
        { platform: 'linkedin', url: 'https://linkedin.com', active: false },
        { platform: 'youtube', url: 'https://youtube.com', active: false }
      ]
    });

    // Reset and Close
    setAddCompanyName('');
    setAddFallbackUrl('https://');
    setAddPrimaryColor('#00f0ff');
    setAddLogoUrl('');
    setShowAddCompanyModal(false);
  };

  return (
    <div className="settings-panel scrollbar-neon">
      
      {/* 1. BRAND & PRESETS ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'brand' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('brand')}
        >
          <div className="accordion-title">
            <Building size={16} className="icon-neon-cyan" />
            <span>1. Brand Settings & Presets</span>
          </div>
          {activeAccordion === 'brand' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="form-group">
            <div className="flex-row justify-between align-center mb-5">
              <label>Select active company profile</label>
              <button 
                type="button" 
                className="btn-tiny flex-row align-center gap-5"
                onClick={() => setShowAddCompanyModal(true)}
              >
                <Plus size={10} />
                <span>Add Company</span>
              </button>
            </div>
            
            <div className="presets-list-container scrollbar-neon">
              {presets.map(p => {
                const isActive = config.companyName.toLowerCase() === p.name.toLowerCase();
                return (
                  <div 
                    key={p.id} 
                    className={`preset-list-row ${isActive ? 'active' : ''}`}
                  >
                    <span 
                      className="preset-row-name flex-1"
                      onClick={() => onPresetSelect(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {p.name}
                    </span>
                    {p.id !== 'novelleyx' && (
                      <button 
                        type="button" 
                        className="btn-delete-preset" 
                        onClick={() => onDeletePreset(p.id)}
                        title="Delete Company Profile"
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="company-name">Brand Name</label>
            <input
              id="company-name"
              type="text"
              value={config.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="e.g. Novelleyx"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fallback-url">Main Fallback Link URL</label>
            <input
              id="fallback-url"
              type="text"
              value={config.fallbackUrl}
              onChange={(e) => onChange({ fallbackUrl: e.target.value })}
              placeholder="https://novelleyx.com"
            />
            <span className="field-hint">Primary fallback link if user clicks outside mapped hotspots.</span>
          </div>

          <div className="form-group">
            <label htmlFor="email-preheader">Inboxes Preview Preheader Text</label>
            <input
              id="email-preheader"
              type="text"
              value={config.preheader}
              onChange={(e) => onChange({ preheader: e.target.value })}
              placeholder="e.g. Don't miss our summer flash sale! ⚡"
            />
            <span className="field-hint">Hidden intro text visible inside email client previews.</span>
          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL IMAGE ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'image' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('image')}
        >
          <div className="accordion-title">
            <Image size={16} className="icon-neon-cyan" />
            <span>2. Promotional Banner Graphic</span>
          </div>
          {activeAccordion === 'image' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="form-group">
            <label>Image Source Type</label>
            <div className="segmented-control">
              <button
                type="button"
                className={config.imageType === 'base64' ? 'active' : ''}
                onClick={() => onChange({ imageType: 'base64' })}
              >
                Local Upload (Base64)
              </button>
              <button
                type="button"
                className={config.imageType === 'external' ? 'active' : ''}
                onClick={() => onChange({ imageType: 'external' })}
              >
                External CDN URL
              </button>
            </div>
          </div>

          {config.imageType === 'base64' ? (
            <div className="form-group">
              <label>Select & Load Promotional Image</label>
              <div 
                className={`upload-dropzone ${base64Image ? 'has-file' : ''} ${isDragging ? 'dragging' : ''}`}
                onClick={() => document.getElementById('sidebar-image-file')?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={24} className="icon-neon-cyan" />
                <span>{isDragging ? 'Drop Image Here' : base64Image ? 'Replace Banner Image' : 'Click to Upload Image'}</span>
                <span className="field-hint">Supports PNG, JPG, WEBP (Max 3MB)</span>
                <input
                  id="sidebar-image-file"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="external-image-url">CDN Hosted Image URL</label>
              <input
                id="external-image-url"
                type="text"
                value={config.externalImageUrl}
                onChange={(e) => onChange({ externalImageUrl: e.target.value })}
                placeholder="https://mycdn.com/assets/email-banner.png"
              />
              <span className="field-hint">Enter the absolute web URL of your image asset. Highly recommended for actual campaign deployments.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. OPTIONAL HEADER ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'header' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('header')}
        >
          <div className="accordion-title">
            <Compass size={16} className="icon-neon-cyan" />
            <span>3. Brand Header Block (Optional)</span>
          </div>
          {activeAccordion === 'header' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="toggle-group mb-15">
            <span className="toggle-label">Include Brand Header Section</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.headerActive}
                onChange={(e) => onChange({ headerActive: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {config.headerActive && (
            <div className="accordion-sub-fields animate-fade-in">
              <div className="form-group">
                <label htmlFor="header-logo-url">Logo Image URL (Leave blank to use Brand Name Text)</label>
                <input
                  id="header-logo-url"
                  type="text"
                  value={config.headerLogoUrl}
                  onChange={(e) => onChange({ headerLogoUrl: e.target.value })}
                  placeholder="https://yourcompany.com/logo.png"
                />
              </div>

              <div className="flex-row gap-15 mb-15">
                <div className="form-group flex-1">
                  <label htmlFor="header-bg-color">Background Color</label>
                  <div className="color-picker-input">
                    <input
                      id="header-bg-color"
                      type="color"
                      value={config.headerBgColor}
                      onChange={(e) => onChange({ headerBgColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.headerBgColor}
                      onChange={(e) => onChange({ headerBgColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="header-text-color">Links / Text Color</label>
                  <div className="color-picker-input">
                    <input
                      id="header-text-color"
                      type="color"
                      value={config.headerTextColor}
                      onChange={(e) => onChange({ headerTextColor: e.target.checked ? '#00f0ff' : config.headerTextColor })} // Safely bound
                      className="hidden-color-input"
                      style={{ display: 'none' }}
                    />
                    <input
                      type="color"
                      value={config.headerTextColor}
                      onChange={(e) => onChange({ headerTextColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.headerTextColor}
                      onChange={(e) => onChange({ headerTextColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="flex-row justify-between align-center mb-5">
                  <label>Header Navigation Links (Max 4)</label>
                  {config.navLinks.length < 4 && (
                    <button 
                      type="button" 
                      className="btn-tiny"
                      onClick={addNavLink}
                    >
                      + Add Link
                    </button>
                  )}
                </div>

                {config.navLinks.map((link, idx) => (
                  <div key={idx} className="flex-row gap-5 mb-5 align-center animate-fade-in">
                    <input
                      type="text"
                      value={link.text}
                      onChange={(e) => handleNavLinkChange(idx, 'text', e.target.value)}
                      placeholder="Title"
                      className="input-tiny flex-1"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleNavLinkChange(idx, 'url', e.target.value)}
                      placeholder="https://"
                      className="input-tiny flex-2"
                    />
                    <button
                      type="button"
                      className="btn-delete-tiny"
                      onClick={() => removeNavLink(idx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. OPTIONAL SECONDARY CTA ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'cta' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('cta')}
        >
          <div className="accordion-title">
            <Type size={16} className="icon-neon-cyan" />
            <span>4. Secondary CTA Segment (Optional)</span>
          </div>
          {activeAccordion === 'cta' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="toggle-group mb-15">
            <span className="toggle-label">Include Body Text & Button</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.ctaActive}
                onChange={(e) => onChange({ ctaActive: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {config.ctaActive && (
            <div className="accordion-sub-fields animate-fade-in">
              <div className="form-group">
                <label htmlFor="cta-title">Headline</label>
                <input
                  id="cta-title"
                  type="text"
                  value={config.ctaTitle}
                  onChange={(e) => onChange({ ctaTitle: e.target.value })}
                  placeholder="Take action before it's gone!"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cta-body">Body Description Text</label>
                <textarea
                  id="cta-body"
                  value={config.ctaBody}
                  onChange={(e) => onChange({ ctaBody: e.target.value })}
                  placeholder="Enter details about your promotion here."
                  rows={3}
                />
              </div>

              <div className="flex-row gap-10 mb-15">
                <div className="form-group flex-1">
                  <label htmlFor="cta-btn-text">Button Text</label>
                  <input
                    id="cta-btn-text"
                    type="text"
                    value={config.ctaButtonText}
                    onChange={(e) => onChange({ ctaButtonText: e.target.value })}
                    placeholder="Claim Discount"
                  />
                </div>
                <div className="form-group flex-2">
                  <label htmlFor="cta-btn-url">Button Redirect URL</label>
                  <input
                    id="cta-btn-url"
                    type="text"
                    value={config.ctaButtonUrl}
                    onChange={(e) => onChange({ ctaButtonUrl: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="flex-row gap-15">
                <div className="form-group flex-1">
                  <label htmlFor="cta-btn-bg">Button Color</label>
                  <div className="color-picker-input">
                    <input
                      id="cta-btn-bg"
                      type="color"
                      value={config.ctaBgColor}
                      onChange={(e) => onChange({ ctaBgColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.ctaBgColor}
                      onChange={(e) => onChange({ ctaBgColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="cta-btn-text-color">Button Text Color</label>
                  <div className="color-picker-input">
                    <input
                      id="cta-btn-text-color"
                      type="color"
                      value={config.ctaTextColor}
                      onChange={(e) => onChange({ ctaTextColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={config.ctaTextColor}
                      onChange={(e) => onChange({ ctaTextColor: e.target.value })}
                      className="color-hex"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. FOOTER & SOCIAL ACCORDION */}
      <div className={`accordion-item ${activeAccordion === 'footer' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('footer')}
        >
          <div className="accordion-title">
            <Share2 size={16} className="icon-neon-cyan" />
            <span>5. Footer & Social Accounts</span>
          </div>
          {activeAccordion === 'footer' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <div className="toggle-group mb-15">
            <span className="toggle-label">Include Brand Footer Block</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.footerActive}
                onChange={(e) => onChange({ footerActive: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {config.footerActive && (
            <div className="accordion-sub-fields animate-fade-in">
              <div className="form-group">
                <label htmlFor="footer-text-copyright">Footer Details / Copyright Notice</label>
                <textarea
                  id="footer-text-copyright"
                  value={config.footerText}
                  onChange={(e) => onChange({ footerText: e.target.value })}
                  placeholder="© 2026 Novelleyx."
                  rows={2}
                />
              </div>

              <div className="toggle-group mb-10 mt-15">
                <span className="toggle-label-sub">Display Social Profile Links</span>
                <label className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={config.socialActive}
                    onChange={(e) => onChange({ socialActive: e.target.checked })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              {config.socialActive && config.socialLinks.map((social, index) => (
                <div key={social.platform} className="flex-row gap-10 mb-8 align-center animate-fade-in">
                  <span className="social-platform-label capitalize">{social.platform}</span>
                  <input
                    type="checkbox"
                    checked={social.active}
                    onChange={(e) => handleSocialLinkChange(index, { active: e.target.checked })}
                    title="Activate Social Platform"
                  />
                  <input
                    type="text"
                    value={social.url}
                    onChange={(e) => handleSocialLinkChange(index, { url: e.target.value })}
                    placeholder={`https://${social.platform}.com/brand`}
                    className="input-tiny flex-1"
                    disabled={!social.active}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. NOVELLEYX AI AUTOMATION ASSISTANT */}
      <div className={`accordion-item ${activeAccordion === 'ai' ? 'open' : ''}`}>
        <button 
          type="button" 
          className="accordion-header" 
          onClick={() => toggleAccordion('ai')}
        >
          <div className="accordion-title">
            <Sparkles size={16} className="icon-neon-cyan" />
            <span>6. Novelleyx AI Assistant</span>
          </div>
          {activeAccordion === 'ai' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className="accordion-body">
          <form onSubmit={runAiAutomation} className="flex-col gap-10">
            <div className="form-group">
              <label htmlFor="ai-prompt-input">Automation Command / Prompt</label>
              <textarea
                id="ai-prompt-input"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Create a dark mode organic skincare brand called 'Lush Green' with green color palette and organic theme"
                rows={3}
                required
                disabled={isGenerating}
              />
              <span className="field-hint">Describe your brand theme, archetype, or campaign objective.</span>
            </div>

            <div className="form-group">
              <label htmlFor="ai-gen-type">Automation Focus Scope</label>
              <select
                id="ai-gen-type"
                value={aiGenType}
                onChange={(e) => setAiGenType(e.target.value as any)}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              >
                <option value="all">Complete Brand, Copy & Navigation (Full Auto)</option>
                <option value="brand">Visual Themes & Color Palette Only</option>
                <option value="cta">Promotional CTA Copywriting Only</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-submit flex-row align-center justify-center gap-5 w-100" 
              disabled={isGenerating || !aiPrompt.trim()}
              style={{ marginTop: '5px' }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={13} />
                  <span>AI Engine Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate Brand Experience</span>
                </>
              )}
            </button>

            {/* AI step-by-step reasoning log terminal */}
            {(aiLogs.length > 0 || isGenerating) && (
              <div 
                className="terminal-console-wrapper w-100 mt-10"
                style={{
                  border: '1px solid var(--border-dim)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              >
                <div 
                  className="terminal-header flex-row justify-between align-center px-10 py-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid var(--border-dim)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace'
                  }}
                >
                  <span>AI REASONING CORE</span>
                  <span style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }}></span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}></span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }}></span>
                  </span>
                </div>
                <div 
                  className="terminal-body p-8 scrollbar-neon" 
                  style={{ 
                    maxHeight: '120px', 
                    overflowY: 'auto', 
                    textAlign: 'left', 
                    fontFamily: 'monospace', 
                    fontSize: '9px', 
                    lineHeight: '13px', 
                    background: '#07070a', 
                    color: '#e0e0e6',
                    height: '120px'
                  }}
                >
                  {aiLogs.map((log, idx) => {
                    let color = '#a0a0b0';
                    if (log.startsWith('[ai]')) {
                      color = '#8b5cf6'; // AI purple
                    } else if (log.startsWith('[success]')) {
                      color = '#39ff14'; // neon green
                    }
                    return (
                      <div key={idx} style={{ color }}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Sleek inline overlay Modal to create a new Company Preset */}
      {showAddCompanyModal && (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 1000 }}>
          <div className="modal-content glassmorphism">
            <div className="modal-header">
              <div className="modal-title">
                <Building className="icon-neon-cyan" size={16} />
                <span>Create Company Profile</span>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowAddCompanyModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCompanySubmit} className="modal-body flex-col gap-10">
              <div className="form-group">
                <label>Company / Brand Name</label>
                <input
                  type="text"
                  value={addCompanyName}
                  onChange={(e) => setAddCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Redirect Link (Fallback URL)</label>
                <input
                  type="url"
                  value={addFallbackUrl}
                  onChange={(e) => setAddFallbackUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Primary Theme Color (Hex)</label>
                <div className="color-picker-input">
                  <input
                    type="color"
                    value={addPrimaryColor}
                    onChange={(e) => setAddPrimaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    value={addPrimaryColor}
                    onChange={(e) => setAddPrimaryColor(e.target.value)}
                    className="color-hex"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Header Logo Image URL (Optional)</label>
                <input
                  type="url"
                  value={addLogoUrl}
                  onChange={(e) => setAddLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAddCompanyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default EmailSettings;
