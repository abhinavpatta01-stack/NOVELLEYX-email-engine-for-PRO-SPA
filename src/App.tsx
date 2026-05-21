import React, { useState, useEffect, useMemo } from 'react';
import { EmailConfig, Hotspot, BrandPreset, NavLink, SocialLink } from './types';
import { EmailSettings } from './components/EmailSettings';
import { HotspotCanvas } from './components/HotspotCanvas';
import { HotspotList } from './components/HotspotList';
import { PreviewTabs } from './components/PreviewTabs';
import { HotspotModal } from './components/HotspotModal';
import { generateEmailHtml } from './utils/emailGenerator';
import { Sparkles, Layers } from 'lucide-react';

// Default mock image for instant WOW factor when loading the editor
const DEFAULT_PRESET_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: 'facebook', url: 'https://facebook.com', active: false },
  { platform: 'x', url: 'https://x.com', active: true },
  { platform: 'instagram', url: 'https://instagram.com', active: true },
  { platform: 'linkedin', url: 'https://linkedin.com', active: false },
  { platform: 'youtube', url: 'https://youtube.com', active: false }
];

const DEFAULT_NAV_LINKS: NavLink[] = [
  { text: 'Features', url: 'https://example.com/features' },
  { text: 'Pricing', url: 'https://example.com/pricing' },
  { text: 'Contact Us', url: 'https://example.com/contact' }
];

const SYSTEM_DEFAULT_PRESETS: BrandPreset[] = [
  {
    id: 'novelleyx',
    name: 'Novelleyx',
    fallbackUrl: 'https://novelleyx.com',
    logoUrl: '',
    primaryColor: '#00f0ff',
    navLinks: [
      { text: 'Novel Suite', url: 'https://novelleyx.com/suite' },
      { text: 'Features', url: 'https://novelleyx.com/features' },
      { text: 'Enterprise', url: 'https://novelleyx.com/enterprise' }
    ],
    footerText: '© 2026 Novelleyx Technology Inc. 456 Tech Circle, Suite 100, San Francisco, CA.',
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/novelleyx', active: true },
      { platform: 'x', url: 'https://x.com/novelleyx', active: true },
      { platform: 'instagram', url: 'https://instagram.com/novelleyx', active: true },
      { platform: 'linkedin', url: 'https://linkedin.com/company/novelleyx', active: true },
      { platform: 'youtube', url: 'https://youtube.com/novelleyx', active: false }
    ]
  },
  {
    id: 'zennova',
    name: 'Zennova Esports',
    fallbackUrl: 'https://zennova.gg',
    logoUrl: '',
    primaryColor: '#ff0055',
    navLinks: [
      { text: 'Roster', url: 'https://zennova.gg/roster' },
      { text: 'Tournaments', url: 'https://zennova.gg/tournaments' },
      { text: 'Merch Shop', url: 'https://zennova.gg/shop' }
    ],
    footerText: '© 2026 Zennova Esports LLC. All Esports trademarks and logos belong to their respective owners.',
    socialLinks: [
      { platform: 'facebook', url: '', active: false },
      { platform: 'x', url: 'https://x.com/zennova_gg', active: true },
      { platform: 'instagram', url: 'https://instagram.com/zennova_gg', active: true },
      { platform: 'linkedin', url: '', active: false },
      { platform: 'youtube', url: 'https://youtube.com/zennova_gg', active: true }
    ]
  },
  {
    id: 'zenbio',
    name: 'Zen Biomedical',
    fallbackUrl: 'https://zenbiomedical.com',
    logoUrl: '',
    primaryColor: '#10b981',
    navLinks: [
      { text: 'Research Lab', url: 'https://zenbiomedical.com/research' },
      { text: 'Clinical Trials', url: 'https://zenbiomedical.com/trials' },
      { text: 'Publications', url: 'https://zenbiomedical.com/publications' }
    ],
    footerText: '© 2026 Zen Biomedical Laboratories. Approved for investigational research purposes only.',
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/zenbio', active: true },
      { platform: 'x', url: 'https://x.com/zenbiomedical', active: false },
      { platform: 'instagram', url: '', active: false },
      { platform: 'linkedin', url: 'https://linkedin.com/company/zenbiomedical', active: true },
      { platform: 'youtube', url: '', active: false }
    ]
  }
];

export const App: React.FC = () => {
  // Brand profiles state
  const [presets, setPresets] = useState<BrandPreset[]>([]);
  
  // App Config state
  const [config, setConfig] = useState<EmailConfig>({
    companyName: 'Novelleyx',
    fallbackUrl: 'https://novelleyx.com',
    preheader: 'Check out our latest interactive updates! ⚡',
    headerActive: true,
    headerLogoUrl: '',
    headerBgColor: '#101018',
    headerTextColor: '#00f0ff',
    navLinks: [...DEFAULT_NAV_LINKS],
    imageType: 'external',
    externalImageUrl: DEFAULT_PRESET_IMAGE,
    ctaActive: true,
    ctaTitle: 'Ready to elevate your marketing campaigns?',
    ctaBody: 'Create interactive mapped images with multiple click targets inside a single high-performance email template. Start boosting your Click-Through Rate (CTR) today.',
    ctaButtonText: 'Try Engine Pro Now',
    ctaButtonUrl: 'https://novelleyx.com',
    ctaBgColor: '#00f0ff',
    ctaTextColor: '#07070a',
    footerActive: true,
    footerText: '© 2026 Novelleyx Technology Inc. 456 Tech Circle, Suite 100, San Francisco, CA.',
    socialActive: true,
    socialLinks: [...DEFAULT_SOCIAL_LINKS]
  });

  // Hotspots drawing state
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Image metadata state
  const [base64Image, setBase64Image] = useState<string>('');
  const [imgDimensions, setImgDimensions] = useState({ width: 600, height: 400 });

  // Modal dialog state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    hotspotId: string | null;
    initialUrl: string;
    initialLabel: string;
    pendingHotspotCoords?: Omit<Hotspot, 'id' | 'url' | 'label'>;
  }>({
    isOpen: false,
    isEditing: false,
    hotspotId: null,
    initialUrl: 'https://',
    initialLabel: ''
  });

  // Load Presets on Init
  useEffect(() => {
    const saved = localStorage.getItem('novelleyx_email_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch {
        setPresets(SYSTEM_DEFAULT_PRESETS);
      }
    } else {
      setPresets(SYSTEM_DEFAULT_PRESETS);
      localStorage.setItem('novelleyx_email_presets', JSON.stringify(SYSTEM_DEFAULT_PRESETS));
    }
  }, []);

  // Pre-load default preset external image size on start
  useEffect(() => {
    if (config.imageType === 'external' && config.externalImageUrl) {
      const img = new Image();
      img.onload = () => {
        setImgDimensions({
          width: img.width || 600,
          height: img.height || 400
        });
      };
      img.src = config.externalImageUrl;
    }
  }, [config.imageType, config.externalImageUrl]);

  const handleUpdateConfig = (updates: Partial<EmailConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setBase64Image(dataUrl);
      handleUpdateConfig({ imageType: 'base64' });

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setImgDimensions({
          width: img.width || 600,
          height: img.height || 400
        });
      };
      img.src = dataUrl;

      // Discard current hotspots on new image
      setHotspots([]);
      setSelectedId(null);
    };
    reader.readAsDataURL(file);
  };

  // Preset operations
  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setConfig(prev => ({
      ...prev,
      companyName: preset.name,
      fallbackUrl: preset.fallbackUrl,
      headerLogoUrl: preset.logoUrl || '',
      headerBgColor: prev.headerBgColor,
      headerTextColor: preset.primaryColor || '#00f0ff',
      navLinks: preset.navLinks.length > 0 ? [...preset.navLinks] : [...DEFAULT_NAV_LINKS],
      footerText: preset.footerText,
      socialLinks: preset.socialLinks.length > 0 ? [...preset.socialLinks] : [...DEFAULT_SOCIAL_LINKS],
      ctaBgColor: preset.primaryColor || '#00f0ff',
      ctaButtonUrl: preset.fallbackUrl
    }));
  };

  const handleSavePreset = (presetName: string) => {
    const newPreset: BrandPreset = {
      id: 'preset_' + Date.now(),
      name: presetName,
      logoUrl: config.headerLogoUrl,
      fallbackUrl: config.fallbackUrl,
      primaryColor: config.headerTextColor,
      navLinks: [...config.navLinks],
      footerText: config.footerText,
      socialLinks: [...config.socialLinks]
    };

    const updated = [newPreset, ...presets];
    setPresets(updated);
    localStorage.setItem('novelleyx_email_presets', JSON.stringify(updated));
  };

  // Hotspot actions
  const triggerAddHotspot = (coords: Omit<Hotspot, 'id' | 'url' | 'label'>) => {
    setModalState({
      isOpen: true,
      isEditing: false,
      hotspotId: null,
      initialUrl: 'https://',
      initialLabel: `Link Zone ${hotspots.length + 1}`,
      pendingHotspotCoords: coords
    });
  };

  const triggerEditHotspot = (id: string) => {
    const hotspot = hotspots.find(h => h.id === id);
    if (!hotspot) return;

    setModalState({
      isOpen: true,
      isEditing: true,
      hotspotId: id,
      initialUrl: hotspot.url,
      initialLabel: hotspot.label
    });
  };

  const handleSaveHotspot = (url: string, label: string) => {
    if (modalState.isEditing && modalState.hotspotId) {
      // Apply edit
      setHotspots(prev => prev.map(h => 
        h.id === modalState.hotspotId ? { ...h, url, label } : h
      ));
    } else if (modalState.pendingHotspotCoords) {
      // Create new
      const newHotspot: Hotspot = {
        id: 'hotspot_' + Date.now(),
        url,
        label,
        ...modalState.pendingHotspotCoords
      };
      setHotspots(prev => [...prev, newHotspot]);
      setSelectedId(newHotspot.id);
    }
    
    // Close modal
    setModalState({
      isOpen: false,
      isEditing: false,
      hotspotId: null,
      initialUrl: 'https://',
      initialLabel: ''
    });
  };

  const handleDeleteHotspot = (id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleUpdateHotspotCoords = (id: string, updates: Partial<Hotspot>) => {
    setHotspots(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  // Memoize Compiled HTML
  const compiledHtml = useMemo(() => {
    return generateEmailHtml(
      config,
      hotspots,
      base64Image,
      imgDimensions.width,
      imgDimensions.height
    );
  }, [config, hotspots, base64Image, imgDimensions]);

  return (
    <div className="container-root animate-fade-in">
      <header className="main-header glassmorphism">
        <div className="logo-brand">
          <Sparkles className="icon-neon-cyan bounce-subtle" size={24} />
          <h1>Novelleyx Email Engine <span className="logo-pro-badge">PRO</span></h1>
        </div>
        <div className="branding-nav">
          <span className="current-preset-indicator">
            <Layers size={14} /> Profile: <strong>{config.companyName}</strong>
          </span>
        </div>
      </header>

      <div className="workspace-grid">
        {/* LEFT COLUMN: Sidebar Configurations */}
        <aside className="sidebar-col">
          <EmailSettings
            config={config}
            onChange={handleUpdateConfig}
            presets={presets}
            onPresetSelect={handlePresetSelect}
            onSavePreset={handleSavePreset}
            onImageUpload={handleImageUpload}
            base64Image={base64Image}
          />
        </aside>

        {/* MIDDLE COLUMN: Visual Editor Workspace */}
        <main className="editor-col">
          <HotspotCanvas
            base64Image={config.imageType === 'base64' ? base64Image : config.externalImageUrl}
            hotspots={hotspots}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddHotspot={triggerAddHotspot}
            onUpdateHotspot={handleUpdateHotspotCoords}
            onDeleteHotspot={handleDeleteHotspot}
            onOpenSettings={triggerEditHotspot}
          />

          <HotspotList
            hotspots={hotspots}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDeleteHotspot}
            onEdit={triggerEditHotspot}
          />
        </main>

        {/* RIGHT COLUMN: Realtime HTML Render Preview */}
        <section className="preview-col">
          <div className="preview-column-header">
            <h3>3. Realtime Rendering & Code Engine</h3>
          </div>
          <PreviewTabs htmlCode={compiledHtml} />
        </section>
      </div>

      {/* Custom Popup Settings Dialog */}
      <HotspotModal
        isOpen={modalState.isOpen}
        isEditing={modalState.isEditing}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveHotspot}
        initialUrl={modalState.initialUrl}
        initialLabel={modalState.initialLabel}
      />
    </div>
  );
};
export default App;
