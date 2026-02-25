/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Layout, 
  Target, 
  Zap, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  ExternalLink, 
  Terminal, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Menu,
  X,
  Globe,
  Database,
  Cpu,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---
const WEBHOOKS = {
  ORCHESTRATOR: 'https://hsk-n8n.ju2hpi.easypanel.host/webhook/orchestrator-v2',
  LOG_READER: 'https://hsk-n8n.ju2hpi.easypanel.host/webhook/log-reader',
  LOGGER_CORE: 'https://hsk-n8n.ju2hpi.easypanel.host/webhook/logger-core',
  CL_STRATEGY: 'https://hsk-n8n.ju2hpi.easypanel.host/webhook/cold-lead-sector-strategy',
  CL_ENRICHER: 'https://hsk-n8n.ju2hpi.easypanel.host/webhook/cold-lead-enricher'
};

type Tool = 'landing-builder' | 'cold-leads';

interface LogEntry {
  id: string;
  time: string;
  status: 'START' | 'SUCCESS' | 'ERROR' | 'INFO';
  message: string;
}

// --- Components ---

const SidebarItem = ({ 
  active, 
  icon: Icon, 
  label, 
  onClick, 
  expanded 
}: { 
  active: boolean; 
  icon: any; 
  label: string; 
  onClick: () => void;
  expanded: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 relative group ${
      active 
        ? 'bg-brand-purple/10 text-brand-purple' 
        : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
    }`}
  >
    <div className="min-w-[24px] flex justify-center">
      <Icon size={20} className={active ? 'drop-shadow-[0_0_8px_rgba(155,81,224,0.5)]' : ''} />
    </div>
    <AnimatePresence>
      {expanded && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-sm font-medium whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
    {active && (
      <motion.div
        layoutId="active-pill"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-purple rounded-r-full"
      />
    )}
  </button>
);

const SectionHeader = ({ label, icon: Icon }: { label: string; icon?: any }) => (
  <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
    <div className="w-1 h-3 bg-brand-purple rounded-full" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono flex items-center gap-2">
      {Icon && <Icon size={12} />}
      {label}
    </span>
  </div>
);

const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  textarea = false,
  rows = 3
}: any) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-zinc-900/50 border border-white/5 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all resize-none font-sans"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all font-sans"
      />
    )}
  </div>
);

const SelectField = ({ label, options, value, onChange }: any) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all appearance-none cursor-pointer"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value} className="bg-zinc-900">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const Collapsible = ({ label, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full py-3 text-left group"
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </motion.div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono group-hover:text-zinc-200 transition-colors">
          {label}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('landing-builder');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((status: LogEntry['status'], message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => {
      // Avoid duplicate logs if polling returns same message
      const isDuplicate = prev.length > 0 && prev[prev.length - 1].message === message;
      if (isDuplicate) return prev;
      return [...prev, { id: Math.random().toString(36).substr(2, 9), time, status, message }];
    });
  }, []);

  // --- Dynamic Log Polling ---
  useEffect(() => {
    const pollLogs = async () => {
      try {
        // Intentamos GET primero, si falla con 400, n8n probablemente espera POST
        const response = await fetch(WEBHOOKS.LOG_READER, {
          method: 'GET',
          cache: 'no-store'
        });
        
        if (response.ok) {
          const text = await response.text();
          if (!text || text.trim() === "") return;
          
          try {
            const data = JSON.parse(text);
            const logItems = Array.isArray(data) ? data : [data];
            
            logItems.forEach(item => {
              if (item && item.message) {
                const status = item.status || 'INFO';
                addLog(status as LogEntry['status'], item.message);
              }
            });
          } catch (e) {
            console.error("Error parseando logs:", text);
          }
        }
      } catch (error) {
        console.error('Log polling network error:', error);
      }
    };

    const interval = setInterval(pollLogs, 4000);
    return () => clearInterval(interval);
  }, [addLog]);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // --- Landing Builder State ---
  const [lbScript, setLbScript] = useState('');
  const [lbProjectType, setLbProjectType] = useState('landing');
  const [lbIsGenerating, setLbIsGenerating] = useState(false);
  const [lbHtml, setLbHtml] = useState<string | null>(null);
  const [lbProgress, setLbProgress] = useState(0);
  const [lbPhase, setLbPhase] = useState(0);
  const [lbStartTime, setLbStartTime] = useState<number | null>(null);
  const [lbElapsedTime, setLbElapsedTime] = useState('0.0');

  // Configuration & Template
  const [lbMode, setLbMode] = useState('strict');
  const [lbTemplateId, setLbTemplateId] = useState('template_01');

  // Strategy & Objective
  const [lbObjective, setLbObjective] = useState('');
  const [lbAudience, setLbAudience] = useState('');
  const [lbSophistication, setLbSophistication] = useState('');
  const [lbMainCTA, setLbMainCTA] = useState('');
  const [lbSecondaryCTA, setLbSecondaryCTA] = useState('');

  // Offer & Product
  const [lbProductName, setLbProductName] = useState('');
  const [lbMainBenefit, setLbMainBenefit] = useState('');
  const [lbDifferentiator, setLbDifferentiator] = useState('');

  // Course Details (Sales Page Only)
  const [lbCourseName, setLbCourseName] = useState('');
  const [lbCoursePrice, setLbCoursePrice] = useState('');
  const [lbCourseModality, setLbCourseModality] = useState('recorded');
  const [lbCourseDuration, setLbCourseDuration] = useState('');
  const [lbCourseModules, setLbCourseModules] = useState('');
  const [lbCourseLevel, setLbCourseLevel] = useState('beginner');
  const [lbCourseBonuses, setLbCourseBonuses] = useState('');
  const [lbCourseGuarantee, setLbCourseGuarantee] = useState('');
  const [lbInstructorBio, setLbInstructorBio] = useState('');

  // Branding
  const [lbBrandPersonality, setLbBrandPersonality] = useState('');
  const [lbPrimaryColor, setLbPrimaryColor] = useState('');
  const [lbSecondaryColor, setLbSecondaryColor] = useState('');
  const [lbTypographyStyle, setLbTypographyStyle] = useState('');
  const [lbFormalityLevel, setLbFormalityLevel] = useState('');
  const [lbLogoUrl, setLbLogoUrl] = useState('');

  // Visual Preferences
  const [lbSectionContrast, setLbSectionContrast] = useState('');
  const [lbSpacingScale, setLbSpacingScale] = useState('');
  const [lbLayoutComplexity, setLbLayoutComplexity] = useState('');
  const [lbAnimationLevel, setLbAnimationLevel] = useState('');

  // Reference Image
  const [lbRefImage, setLbRefImage] = useState<{ base64: string; mime: string } | null>(null);

  // Landing Images
  const [lbImages, setLbImages] = useState<{ url: string; description: string }[]>([{ url: '', description: '' }]);

  const handleLbRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Full = event.target?.result as string;
      setLbRefImage({
        base64: base64Full.split(',')[1],
        mime: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const addImageRow = () => setLbImages([...lbImages, { url: '', description: '' }]);
  const removeImageRow = (index: number) => {
    if (lbImages.length > 1) {
      setLbImages(lbImages.filter((_, i) => i !== index));
    } else {
      setLbImages([{ url: '', description: '' }]);
    }
  };
  const updateImageRow = (index: number, field: 'url' | 'description', value: string) => {
    const newImages = [...lbImages];
    newImages[index][field] = value;
    setLbImages(newImages);
  };

  useEffect(() => {
    let interval: any;
    if (lbIsGenerating && lbStartTime) {
      interval = setInterval(() => {
        setLbElapsedTime(((Date.now() - lbStartTime) / 1000).toFixed(1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [lbIsGenerating, lbStartTime]);

  // --- Cold Lead Engine State ---
  const [clCsv, setClCsv] = useState('');
  const [clCompanyName, setClCompanyName] = useState('HSK');
  const [clSenderName, setClSenderName] = useState('Alex');
  const [clIsProcessing, setClIsProcessing] = useState(false);
  const [clLeads, setClLeads] = useState<any[]>([]);
  const [clProgress, setClProgress] = useState(0);
  const [clPhase, setClPhase] = useState(0);
  const [clStats, setClStats] = useState({ total: 0, sectors: 0, enriched: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setClCsv(text);
      addLog('INFO', `File "${file.name}" loaded successfully.`);
    };
    reader.readAsText(file);
  };

  const handleLbGenerate = async () => {
    if (!lbScript.trim()) return;
    
    setLbIsGenerating(true);
    setLbHtml(null);
    setLbProgress(0);
    setLbPhase(1);
    setLbStartTime(Date.now());
    addLog('START', 'Initializing Landing Builder pipeline...');

    try {
      const payload: any = {
        prompt: lbScript, // n8n orchestrator usually expects 'prompt'
        script_text: lbScript,
        mode: lbMode,
        template_id: lbTemplateId,
        project_type: lbProjectType,
        project_context: {
          primary_objective: lbObjective,
          target_audience: lbAudience,
          audience_sophistication: lbSophistication,
          main_cta: lbMainCTA,
          secondary_cta: lbSecondaryCTA
        },
        offer: {
          product_name: lbProductName,
          main_benefit: lbMainBenefit,
          differentiator: lbDifferentiator
        },
        brand_profile: {
          brand_personality: lbBrandPersonality,
          primary_color: lbPrimaryColor,
          secondary_color: lbSecondaryColor,
          typography_style: lbTypographyStyle,
          formality_level: lbFormalityLevel,
          logo_url: lbLogoUrl
        },
        visual_preferences: {
          section_contrast: lbSectionContrast,
          spacing_scale: lbSpacingScale,
          layout_complexity: lbLayoutComplexity,
          animation_level: lbAnimationLevel
        }
      };

      if (lbProjectType === 'sales_page') {
        payload.course = {
          name: lbCourseName,
          price: lbCoursePrice,
          modality: lbCourseModality,
          duration: lbCourseDuration,
          modules: lbCourseModules,
          level: lbCourseLevel,
          bonuses: lbCourseBonuses.split('\n').filter(b => b.trim()),
          guarantee: lbCourseGuarantee,
          instructor_bio: lbInstructorBio
        };
      }

      if (lbRefImage) {
        payload.reference_image_url = `data:${lbRefImage.mime};base64,${lbRefImage.base64}`;
      }

      const validImages = lbImages.filter(img => img.url.trim());
      if (validImages.length > 0) {
        payload.image_urls = validImages;
      }

      const response = await fetch(WEBHOOKS.ORCHESTRATOR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${responseText || response.statusText}`);
      }

      if (!responseText || responseText.trim() === "") {
        throw new Error('Server returned an empty response');
      }

      const data = JSON.parse(responseText);
      if (data.success || data.html || data.html_code) {
        setLbHtml(data.html || data.html_code);
        setLbProgress(100);
        setLbPhase(6);
        addLog('SUCCESS', 'Landing page generated successfully!');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      addLog('ERROR', `Pipeline error: ${error.message}`);
    } finally {
      setLbIsGenerating(false);
    }
  };

  const handleClProcess = async () => {
    if (!clCsv.trim()) return;

    setClIsProcessing(true);
    setClLeads([]);
    setClProgress(0);
    setClPhase(1);
    addLog('START', 'Launching Cold Lead Engine...');

    try {
      // Phase 1: Strategy & Processing via n8n
      setClPhase(1);
      setClProgress(20);
      addLog('INFO', 'Sending data to Strategy Engine...');
      
      const response = await fetch(WEBHOOKS.CL_STRATEGY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: clCsv,
          company_name: clCompanyName,
          sender_name: clSenderName
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${responseText || response.statusText}`);
      }

      if (!responseText || responseText.trim() === "") {
        throw new Error('Server returned an empty response');
      }

      const data = JSON.parse(responseText);
      
      if (data.success || data.leads || data.enriched_leads) {
        const leads = data.enriched_leads || data.leads || [];
        setClLeads(leads);
        setClStats({
          total: leads.length,
          sectors: data.sectors_found?.length || 0,
          enriched: leads.length
        });
        setClProgress(100);
        setClPhase(4);
        addLog('SUCCESS', `Processed ${leads.length} leads successfully.`);
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error: any) {
      addLog('ERROR', `Engine error: ${error.message}`);
    } finally {
      setClIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black text-zinc-100 overflow-hidden font-sans">
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-purple/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* --- Sidebar --- */}
      <motion.aside
        animate={{ 
          width: sidebarExpanded ? 240 : 80,
          x: 0 
        }}
        initial={{ x: -240 }}
        className="glass-panel h-full z-30 flex flex-col border-r border-white/5 relative hidden md:flex"
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/5 h-[80px]">
          <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center shadow-lg shadow-brand-purple/20">
            <Sparkles className="text-white" size={24} />
          </div>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-lg font-bold tracking-tight leading-none">GrowLab AI</span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Toolkit v2.0</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <SidebarItem 
            active={activeTool === 'landing-builder'} 
            icon={Layout} 
            label="Landing Builder" 
            onClick={() => setActiveTool('landing-builder')}
            expanded={sidebarExpanded}
          />
          <SidebarItem 
            active={activeTool === 'cold-leads'} 
            icon={Target} 
            label="Cold Lead Engine" 
            onClick={() => setActiveTool('cold-leads')}
            expanded={sidebarExpanded}
          />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full p-3 rounded-xl hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-all flex justify-center"
          >
            {sidebarExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/5 z-50 flex md:hidden items-center justify-around px-6">
        <button 
          onClick={() => setActiveTool('landing-builder')}
          className={`flex flex-col items-center gap-1 ${activeTool === 'landing-builder' ? 'text-brand-purple' : 'text-zinc-500'}`}
        >
          <Layout size={20} />
          <span className="text-[10px] font-medium">Builder</span>
        </button>
        <button 
          onClick={() => setActiveTool('cold-leads')}
          className={`flex flex-col items-center gap-1 ${activeTool === 'cold-leads' ? 'text-brand-purple' : 'text-zinc-500'}`}
        >
          <Target size={20} />
          <span className="text-[10px] font-medium">Leads</span>
        </button>
      </div>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col z-10 relative overflow-hidden pb-16 md:pb-0">
        {/* Mobile Header */}
        <div className="h-16 glass-panel border-b border-white/5 flex md:hidden items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-purple" size={20} />
            <span className="font-bold text-sm">GrowLab AI</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">v2.0</div>
        </div>

        {/* Tool Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Tool Pages */}
          <AnimatePresence mode="wait">
            {activeTool === 'landing-builder' ? (
              <motion.div
                key="lb"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col lg:flex-row overflow-hidden"
              >
                {/* LB Left Panel: Controls */}
                <div className="w-full lg:w-[360px] glass-panel border-b lg:border-b-0 lg:border-r border-white/5 overflow-y-auto p-6 custom-scrollbar shrink-0">
                  <SectionHeader label="Project Configuration" icon={Cpu} />
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setLbProjectType('landing')}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                        lbProjectType === 'landing' 
                          ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' 
                          : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10'
                      }`}
                    >
                      Landing Page
                    </button>
                    <button
                      onClick={() => setLbProjectType('sales_page')}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                        lbProjectType === 'sales_page' 
                          ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' 
                          : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10'
                      }`}
                    >
                      Sales Page
                    </button>
                  </div>

                  <InputField 
                    label="Landing Script" 
                    placeholder="Paste your script here..." 
                    textarea 
                    rows={6} 
                    value={lbScript}
                    onChange={setLbScript}
                  />

                  <Collapsible label="Strategy & Objective" defaultOpen>
                    <InputField label="Primary Objective" placeholder="e.g. Webinar Registration" value={lbObjective} onChange={setLbObjective} />
                    <InputField label="Target Audience" placeholder="e.g. Entrepreneurs 25-45" value={lbAudience} onChange={setLbAudience} />
                    <SelectField 
                      label="Audience Sophistication" 
                      value={lbSophistication}
                      onChange={setLbSophistication}
                      options={[
                        { label: 'Auto-detect', value: '' },
                        { label: 'Unaware', value: 'unaware' },
                        { label: 'Problem Aware', value: 'problem_aware' },
                        { label: 'Solution Aware', value: 'solution_aware' },
                        { label: 'Product Aware', value: 'product_aware' },
                        { label: 'Most Aware', value: 'most_aware' },
                      ]} 
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Main CTA" placeholder="e.g. JOIN NOW" value={lbMainCTA} onChange={setLbMainCTA} />
                      <InputField label="Secondary CTA" placeholder="e.g. LEARN MORE" value={lbSecondaryCTA} onChange={setLbSecondaryCTA} />
                    </div>
                  </Collapsible>

                  <Collapsible label="Offer & Product">
                    <InputField label="Product Name" placeholder="e.g. Sales Masterclass" value={lbProductName} onChange={setLbProductName} />
                    <InputField label="Main Benefit" placeholder="e.g. Triple your sales in 90 days" value={lbMainBenefit} onChange={setLbMainBenefit} />
                    <InputField label="Key Differentiator" placeholder="e.g. Proven method with 500+ students" value={lbDifferentiator} onChange={setLbDifferentiator} />
                  </Collapsible>

                  {/* Course Details - Conditional (only for sales_page) */}
                  <AnimatePresence>
                    {lbProjectType === 'sales_page' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <Collapsible label="Course Details" defaultOpen>
                          <InputField label="Course Name" placeholder="e.g. High Performance Program" value={lbCourseName} onChange={setLbCourseName} />
                          <div className="grid grid-cols-2 gap-3">
                            <InputField label="Price" placeholder="e.g. $497 USD" value={lbCoursePrice} onChange={setLbCoursePrice} />
                            <SelectField 
                              label="Modality" 
                              value={lbCourseModality}
                              onChange={setLbCourseModality}
                              options={[
                                { label: 'Recorded', value: 'recorded' },
                                { label: 'Live', value: 'live' },
                                { label: 'Hybrid', value: 'hybrid' },
                              ]} 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <InputField label="Duration" placeholder="e.g. 8 weeks" value={lbCourseDuration} onChange={setLbCourseDuration} />
                            <InputField label="Modules" placeholder="e.g. 12" value={lbCourseModules} onChange={setLbCourseModules} />
                          </div>
                          <SelectField 
                            label="Level" 
                            value={lbCourseLevel}
                            onChange={setLbCourseLevel}
                            options={[
                              { label: 'Beginner', value: 'beginner' },
                              { label: 'Intermediate', value: 'intermediate' },
                              { label: 'Advanced', value: 'advanced' },
                              { label: 'All Levels', value: 'all' },
                            ]} 
                          />
                          <InputField label="Bonuses (one per line)" placeholder="Bonus 1: Templates..." textarea rows={3} value={lbCourseBonuses} onChange={setLbCourseBonuses} />
                          <InputField label="Guarantee" placeholder="e.g. 30-day money back" value={lbCourseGuarantee} onChange={setLbCourseGuarantee} />
                          <InputField label="Instructor Bio" placeholder="Brief bio..." textarea rows={2} value={lbInstructorBio} onChange={setLbInstructorBio} />
                        </Collapsible>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Collapsible label="Branding">
                    <SelectField 
                      label="Brand Personality" 
                      value={lbBrandPersonality}
                      onChange={setLbBrandPersonality}
                      options={[
                        { label: 'Auto-detect', value: '' },
                        { label: 'Minimal', value: 'minimal' },
                        { label: 'Bold', value: 'bold' },
                        { label: 'Corporate', value: 'corporate' },
                        { label: 'Luxury', value: 'luxury' },
                        { label: 'Futuristic', value: 'futuristic' },
                        { label: 'Playful', value: 'playful' },
                      ]} 
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Primary Color" placeholder="#9b51e0" value={lbPrimaryColor} onChange={setLbPrimaryColor} />
                      <InputField label="Secondary Color" placeholder="#ffffff" value={lbSecondaryColor} onChange={setLbSecondaryColor} />
                    </div>
                    <SelectField 
                      label="Typography Style" 
                      value={lbTypographyStyle}
                      onChange={setLbTypographyStyle}
                      options={[
                        { label: 'Auto', value: '' },
                        { label: 'Modern', value: 'modern' },
                        { label: 'Elegant', value: 'elegant' },
                        { label: 'Tech', value: 'tech' },
                        { label: 'Editorial', value: 'editorial' },
                      ]} 
                    />
                    <SelectField 
                      label="Formality Level" 
                      value={lbFormalityLevel}
                      onChange={setLbFormalityLevel}
                      options={[
                        { label: 'Auto', value: '' },
                        { label: 'Casual', value: 'casual' },
                        { label: 'Professional', value: 'professional' },
                        { label: 'Formal', value: 'formal' },
                      ]} 
                    />
                    <InputField label="Logo URL" placeholder="https://..." value={lbLogoUrl} onChange={setLbLogoUrl} />
                  </Collapsible>

                  <Collapsible label="Visual Preferences">
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField 
                        label="Section Contrast" 
                        value={lbSectionContrast}
                        onChange={setLbSectionContrast}
                        options={[
                          { label: 'Auto', value: '' },
                          { label: 'Flat', value: 'flat' },
                          { label: 'Alternating', value: 'alternating' },
                          { label: 'Dramatic', value: 'dramatic' },
                        ]} 
                      />
                      <SelectField 
                        label="Spacing" 
                        value={lbSpacingScale}
                        onChange={setLbSpacingScale}
                        options={[
                          { label: 'Auto', value: '' },
                          { label: 'Tight', value: 'tight' },
                          { label: 'Normal', value: 'normal' },
                          { label: 'Generous', value: 'generous' },
                        ]} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField 
                        label="Layout Complexity" 
                        value={lbLayoutComplexity}
                        onChange={setLbLayoutComplexity}
                        options={[
                          { label: 'Auto', value: '' },
                          { label: 'Simple', value: 'simple' },
                          { label: 'Structured', value: 'structured' },
                          { label: 'Advanced', value: 'advanced' },
                        ]} 
                      />
                      <SelectField 
                        label="Animation Level" 
                        value={lbAnimationLevel}
                        onChange={setLbAnimationLevel}
                        options={[
                          { label: 'Auto', value: '' },
                          { label: 'None', value: 'none' },
                          { label: 'Subtle', value: 'subtle' },
                          { label: 'Dynamic', value: 'dynamic' },
                        ]} 
                      />
                    </div>
                  </Collapsible>

                  <Collapsible label="Reference Image">
                    <div className="border-2 border-dashed border-white/5 rounded-xl p-4 text-center hover:border-brand-purple/30 transition-all cursor-pointer relative group">
                      <input type="file" onChange={handleLbRefImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={16} className="text-zinc-600 group-hover:text-brand-purple" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          {lbRefImage ? 'Image Selected' : 'Upload Reference'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] font-mono text-zinc-700 mt-2 text-center uppercase tracking-tighter">Analyzes style, doesn't copy design</p>
                  </Collapsible>

                  <Collapsible label="Landing Images">
                    <div className="flex flex-col gap-3">
                      {lbImages.map((img, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-3 bg-zinc-900/30 rounded-xl border border-white/5 relative group">
                          <button 
                            onClick={() => removeImageRow(idx)}
                            className="absolute top-2 right-2 text-zinc-700 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                          <InputField label="Image URL" placeholder="https://..." value={img.url} onChange={(v: string) => updateImageRow(idx, 'url', v)} />
                          <InputField label="Description" placeholder="Alt text..." value={img.description} onChange={(v: string) => updateImageRow(idx, 'description', v)} />
                        </div>
                      ))}
                      <button 
                        onClick={addImageRow}
                        className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:border-brand-purple/30 hover:text-brand-purple transition-all"
                      >
                        + Add Image URL
                      </button>
                    </div>
                  </Collapsible>

                  <SectionHeader label="System Configuration" icon={Terminal} />
                  <SelectField 
                    label="Execution Mode" 
                    value={lbMode}
                    onChange={setLbMode}
                    options={[
                      { label: 'Strict Mode', value: 'strict' },
                      { label: 'Optimized Mode', value: 'optimized' },
                    ]} 
                  />
                  <SelectField 
                    label="Template Selection" 
                    value={lbTemplateId}
                    onChange={setLbTemplateId}
                    options={[
                      { label: 'Template 01 — Default', value: 'template_01' },
                      { label: 'Template 02 — Minimal', value: 'template_02' },
                      { label: 'Template 03 — Bold', value: 'template_03' },
                    ]} 
                  />

                  <div className="mt-8">
                    <button
                      onClick={handleLbGenerate}
                      disabled={lbIsGenerating || !lbScript.trim()}
                      className="w-full purple-gradient text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {lbIsGenerating ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Zap size={20} className="group-hover:scale-110 transition-transform" />
                      )}
                      {lbIsGenerating ? 'Generating...' : 'Build Landing Page'}
                    </button>
                  </div>
                </div>

                {/* LB Center Panel: Preview & Animation */}
                <div className="flex-1 flex flex-col relative min-h-[400px] lg:min-h-0">
                  {/* Pipeline Header */}
                  <div className="glass-panel border-b border-white/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Pipeline Status</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${lbIsGenerating ? 'bg-brand-purple animate-pulse' : 'bg-zinc-700'}`} />
                          <span className="text-xs font-medium">{lbIsGenerating ? 'Processing' : 'Idle'}</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/5 hidden sm:block" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Elapsed Time</span>
                        <span className="text-xs font-mono mt-1 text-brand-purple">{lbElapsedTime}s</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button disabled={!lbHtml} className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all disabled:opacity-30"><Copy size={16} /></button>
                      <button disabled={!lbHtml} className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all disabled:opacity-30"><Download size={16} /></button>
                      <button disabled={!lbHtml} className="p-2 rounded-lg bg-brand-purple/10 border border-brand-purple/20 text-brand-purple hover:bg-brand-purple/20 transition-all disabled:opacity-30"><ExternalLink size={16} /></button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 bg-zinc-950 relative overflow-hidden">
                    {lbHtml ? (
                      <iframe srcDoc={lbHtml} className="w-full h-full border-none" title="Preview" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
                        <div className="w-20 h-20 rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center mb-4">
                          <Globe size={32} />
                        </div>
                        <p className="text-sm font-medium">Ready to build your masterpiece</p>
                        <p className="text-xs mt-1">Configure the script and click build</p>
                      </div>
                    )}

                    {/* INNOVATIVE ANIMATION: Building Blocks */}
                    <AnimatePresence>
                      {lbIsGenerating && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
                        >
                          <div className="relative w-full max-w-[260px] h-64 sm:h-80 flex flex-col items-center justify-end pb-12">
                            {/* Floating code particles */}
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 0, x: (Math.random() - 0.5) * 150 }}
                                animate={{ 
                                  opacity: [0, 1, 0], 
                                  y: -250,
                                  x: (Math.random() - 0.5) * 200
                                }}
                                transition={{ 
                                  duration: 2 + Math.random() * 2, 
                                  repeat: Infinity,
                                  delay: Math.random() * 2
                                }}
                                className="absolute bottom-0 w-1 h-1 bg-brand-purple rounded-full"
                              />
                            ))}

                            {/* Stacking Blocks */}
                            <div className="flex flex-col gap-2 items-center w-full">
                              {[5, 4, 3, 2, 1].map((level) => (
                                <motion.div
                                  key={level}
                                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                  animate={{ 
                                    opacity: lbPhase >= level ? 1 : 0.2,
                                    scale: lbPhase >= level ? 1 : 0.8,
                                    y: 0,
                                    boxShadow: lbPhase === level ? '0 0 20px rgba(155, 81, 224, 0.5)' : 'none'
                                  }}
                                  className={`h-8 sm:h-10 rounded-xl border border-brand-purple/30 bg-zinc-900/80 flex items-center px-4 gap-3 transition-all duration-500`}
                                  style={{ width: `${Math.min(100, 60 + level * 10)}%` }}
                                >
                                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${lbPhase >= level ? 'bg-brand-purple' : 'bg-zinc-800'}`} />
                                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div 
                                      animate={{ width: lbPhase >= level ? '100%' : '0%' }}
                                      className="h-full bg-brand-purple"
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Platform */}
                            <div className="w-48 h-2 bg-gradient-to-r from-transparent via-brand-purple to-transparent rounded-full mt-4 opacity-50" />
                          </div>

                          <div className="text-center max-w-md px-8">
                            <motion.h3 
                              key={lbPhase}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-2xl font-bold tracking-tight mb-2"
                            >
                              {lbPhase === 1 && "Analyzing Structure"}
                              {lbPhase === 2 && "Synthesizing Design"}
                              {lbPhase === 3 && "Optimizing Strategy"}
                              {lbPhase === 4 && "Generating Components"}
                              {lbPhase === 5 && "Final Assembly"}
                            </motion.h3>
                            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">
                              Pipeline Progress: {lbProgress}%
                            </p>
                            
                            <div className="w-64 h-1 bg-zinc-900 rounded-full mt-8 overflow-hidden">
                              <motion.div 
                                animate={{ width: `${lbProgress}%` }}
                                className="h-full bg-brand-purple shadow-[0_0_10px_rgba(155,81,224,0.8)]"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col lg:flex-row overflow-hidden"
              >
                {/* CL Left Panel: Controls */}
                <div className="w-full lg:w-[380px] glass-panel border-b lg:border-b-0 lg:border-r border-white/5 overflow-y-auto p-6 custom-scrollbar shrink-0">
                  <SectionHeader label="Lead Source" icon={Database} />
                  
                  <div className="mb-6">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-all cursor-pointer group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden" 
                      />
                      <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-zinc-500 group-hover:text-brand-purple" size={24} />
                      </div>
                      <span className="text-sm font-medium">Upload CSV File</span>
                      <span className="text-[10px] text-zinc-600 font-mono mt-1 uppercase tracking-widest">Max 5MB • .csv only</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">or paste data</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  <InputField 
                    label="CSV Content" 
                    placeholder="razon_social, email, phone..." 
                    textarea 
                    rows={8} 
                    value={clCsv}
                    onChange={setClCsv}
                  />

                  <SectionHeader label="Engine Config" icon={Zap} />
                  <InputField label="Company Name" placeholder="e.g. HSK" value={clCompanyName} onChange={setClCompanyName} />
                  <InputField label="Sender Name" placeholder="e.g. Alex" value={clSenderName} onChange={setClSenderName} />

                  <div className="mt-8">
                    <button
                      onClick={handleClProcess}
                      disabled={clIsProcessing || !clCsv.trim()}
                      className="w-full purple-gradient text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {clIsProcessing ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Target size={20} className="group-hover:scale-110 transition-transform" />
                      )}
                      {clIsProcessing ? 'Processing...' : 'Launch Engine'}
                    </button>
                  </div>
                </div>

                {/* CL Center Panel: Results & Animation */}
                <div className="flex-1 flex flex-col relative bg-zinc-950 min-h-[400px] lg:min-h-0">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-white/5 bg-black/40">
                    <div className="p-4 sm:p-6 flex flex-col border-b sm:border-b-0 sm:border-r border-white/5">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Leads</span>
                      <span className="text-xl sm:text-2xl font-bold mt-1">{clStats.total.toLocaleString()}</span>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col border-b sm:border-b-0 sm:border-r border-white/5">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sectors Found</span>
                      <span className="text-xl sm:text-2xl font-bold mt-1 text-brand-purple">{clStats.sectors}</span>
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Enriched</span>
                      <span className="text-xl sm:text-2xl font-bold mt-1 text-emerald-500">{clStats.enriched.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {clLeads.length > 0 ? (
                      <div className="grid gap-3">
                        {clLeads.map((lead, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-brand-purple/30 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-brand-purple transition-colors">
                                <FileText size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">{lead.razon_social}</span>
                                <span className="text-xs text-zinc-500">{lead.email || 'No email'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-purple/20">
                                {lead.sector_inferido}
                              </span>
                              <button className="p-2 text-zinc-600 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-4">
                          <Database size={32} />
                        </div>
                        <p className="text-sm font-medium">Lead Engine Standby</p>
                        <p className="text-xs mt-1">Upload data to begin enrichment</p>
                      </div>
                    )}
                  </div>

                  {/* INNOVATIVE ANIMATION: Orbital System */}
                  <AnimatePresence>
                    {clIsProcessing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
                      >
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                          {/* Central Core */}
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              boxShadow: [
                                '0 0 40px rgba(155, 81, 224, 0.4)',
                                '0 0 80px rgba(155, 81, 224, 0.6)',
                                '0 0 40px rgba(155, 81, 224, 0.4)'
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 sm:w-24 sm:h-24 bg-brand-purple rounded-full flex items-center justify-center z-10"
                          >
                            <Cpu className="text-white" size={32} />
                          </motion.div>

                          {/* Orbits */}
                          {[1, 2, 3].map((orbit) => (
                            <motion.div
                              key={orbit}
                              animate={{ rotate: orbit % 2 === 0 ? 360 : -360 }}
                              transition={{ duration: 4 + orbit * 2, repeat: Infinity, ease: "linear" }}
                              className="absolute border border-brand-purple/20 rounded-full"
                              style={{ 
                                width: `${orbit * (window.innerWidth < 640 ? 60 : 100)}px`, 
                                height: `${orbit * (window.innerWidth < 640 ? 60 : 100)}px` 
                              }}
                            >
                              <div 
                                className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-brand-purple rounded-full shadow-[0_0_10px_rgba(155,81,224,1)]"
                                style={{ top: '-4px', left: '50%', marginLeft: '-4px' }}
                              />
                            </motion.div>
                          ))}

                          {/* Data Particles */}
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                x: (Math.random() - 0.5) * 400,
                                y: (Math.random() - 0.5) * 400
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                delay: Math.random() * 2,
                                ease: "easeInOut"
                              }}
                              className="absolute w-1 h-1 bg-white rounded-full"
                            />
                          ))}
                        </div>

                        <div className="text-center mt-12">
                          <motion.h3 
                            key={clPhase}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-3xl font-bold tracking-tighter mb-4"
                          >
                            {clPhase === 1 && "Classifying Data"}
                            {clPhase === 2 && "Synthesizing Strategy"}
                            {clPhase === 3 && "Enriching Profiles"}
                            {clPhase === 4 && "Finalizing Results"}
                          </motion.h3>
                          
                          <div className="flex items-center gap-8 justify-center">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Progress</span>
                              <span className="text-xl font-bold text-brand-purple">{clProgress}%</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status</span>
                              <span className="text-xl font-bold text-emerald-500">Active</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Console / Log Panel --- */}
        <div className="h-[160px] sm:h-[200px] glass-panel border-t border-white/5 bg-black/60 flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3 overflow-hidden">
              <Terminal size={14} className="text-brand-purple shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono whitespace-nowrap">System Console</span>
              <div className="hidden sm:flex items-center gap-1.5 ml-4">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                <span className="text-[9px] font-mono text-zinc-600">Live Stream</span>
              </div>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="text-[9px] font-mono text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-wider shrink-0"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-800 italic">
                Waiting for system activity...
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 group">
                    <span className="text-zinc-700 shrink-0">{log.time}</span>
                    <span className={`shrink-0 font-bold w-16 ${
                      log.status === 'START' ? 'text-brand-purple' :
                      log.status === 'SUCCESS' ? 'text-emerald-500' :
                      log.status === 'ERROR' ? 'text-rose-500' :
                      'text-zinc-500'
                    }`}>
                      [{log.status}]
                    </span>
                    <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{log.message}</span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
