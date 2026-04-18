import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, Lock, Shield, FileText, CheckCircle2, Loader2, Cloud, HardDrive, FolderOpen, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { playClick, playSuccess, playCover } from '@/lib/audio';

const slides = [
  { title: 'Welcome to Age UK Handyperson Coordinator Portal', subtitle: 'Your command centre for service delivery', image: '📋', description: 'Manage appointments, supervise teams, and track service quality—all in one place.' },
  { title: 'Appointment Management', subtitle: 'Never miss a booking', image: '📅', description: 'Schedule handypeople, track response times, and meet funder deadlines effortlessly.' },
  { title: 'Team Supervision', subtitle: 'Support your handypeople daily', image: '👥', description: 'Daily contact logs, task assignments, expense tracking, and performance monitoring.' },
  { title: 'Customer & Quality Tracking', subtitle: 'Build trust through transparency', image: '⭐', description: 'Monitor satisfaction, log compliments, handle complaints, and prove impact.' },
  { title: 'Compliance & Reporting', subtitle: 'Stay audit-ready', image: '✅', description: 'GDPR-compliant data, financial records, health & safety logs, and funder reports.' },
  { title: 'Mobile Handyperson App', subtitle: 'Optional—power in your pocket', image: '📱', description: 'Jobs on-site, photo documentation, signatures, and instant updates to Sue.' },
];

const STEPS = [
  { title: 'Understand Your Role', desc: 'We have researched your Handyperson Coordinator responsibilities.' },
  { title: 'Choose Your Workspace', desc: 'Customise how you want to work.' },
  { title: 'Import Your Data', desc: 'Bring your existing records into the system.' },
  { title: 'Data Safety & Compliance', desc: 'Your data is protected. Here is how.' },
  { title: 'You are Ready!', desc: 'Your workspace is set up. What is next?' },
];

const WORKSPACE_OPTIONS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard View', desc: "See today's jobs, team status, and alerts at a glance", badge: 'Recommended for coordinators', variant: 'default' },
  { id: 'list', icon: '📋', label: 'List View', desc: 'Detailed appointment & job list with filters', badge: 'Clean & straightforward', variant: 'secondary' },
  { id: 'calendar', icon: '🗓️', label: 'Calendar View', desc: 'Visual schedule of all bookings and team assignments', badge: 'Plan ahead visually', variant: 'outline' },
];

const ACCEPTED_TYPES = [
  { ext: '.xlsx', label: 'Excel Workbook', icon: '📊' },
  { ext: '.xls', label: 'Excel 97–2003', icon: '📊' },
  { ext: '.csv', label: 'CSV Spreadsheet', icon: '📋' },
  { ext: '.ods', label: 'OpenDocument', icon: '📋' },
  { ext: '.pdf', label: 'PDF Document', icon: '📄' },
  { ext: '.docx', label: 'Word Document', icon: '📝' },
  { ext: '.doc', label: 'Word 97–2003', icon: '📝' },
  { ext: '.txt', label: 'Plain Text', icon: '📃' },
  { ext: '.json', label: 'JSON Data', icon: '🔧' },
  { ext: '.xml', label: 'XML Data', icon: '🔧' },
  { ext: '.zip', label: 'ZIP Archive', icon: '🗜️' },
  { ext: '.mdb', label: 'Access Database', icon: '🗄️' },
];

const CLOUD_SOURCES = [
  { id: 'gdrive', label: 'Google Drive', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', icon: '🟦' },
  { id: 'onedrive', label: 'OneDrive', color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100', icon: '☁️' },
  { id: 'dropbox', label: 'Dropbox', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100', icon: '📦' },
  { id: 'sharepoint', label: 'SharePoint', color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100', icon: '🟩' },
];

const LOCAL_DRIVES = ['C:\\', 'D:\\', 'E:\\', 'F:\\', 'G:\\', 'H:\\'];

function ImportStep({ droppedFiles, setDroppedFiles }) {
  const [isDragging, setIsDragging] = useState(false);
  const [cloudConnecting, setCloudConnecting] = useState(null);
  const [cloudConnected, setCloudConnected] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files));
  };

  const addFiles = (files) => {
    const newEntries = files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(1) + ' KB', status: 'ready' }));
    setDroppedFiles(prev => [...prev, ...newEntries]);
    playClick();
  };

  const removeFile = (idx) => {
    setDroppedFiles(prev => prev.filter((_, i) => i !== idx));
    playClick();
  };

  const handleCloudConnect = (id) => {
    if (cloudConnected.includes(id)) return;
    setCloudConnecting(id);
    playClick();
    // Simulate OAuth connect
    setTimeout(() => {
      setCloudConnecting(null);
      setCloudConnected(prev => [...prev, id]);
      playSuccess();
    }, 1800);
  };

  const handleDriveSelect = () => {
    fileInputRef.current?.click();
    playClick();
  };

  return (
    <div className="space-y-4">

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
        }`}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput}
          accept=".xlsx,.xls,.csv,.ods,.pdf,.docx,.doc,.txt,.json,.xml,.zip,.mdb" />
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-blue-400'}`} />
        <p className="text-sm font-semibold text-blue-900">{isDragging ? 'Release to upload' : 'Drag & drop files here'}</p>
        <p className="text-xs text-blue-600 mt-1">or click to browse your computer</p>
      </div>

      {/* Accepted file types */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Accepted file types:</p>
        <div className="flex flex-wrap gap-1.5">
          {ACCEPTED_TYPES.map(t => (
            <span key={t.ext} className="inline-flex items-center gap-1 text-xs bg-muted border border-border rounded px-2 py-0.5 font-mono">
              {t.icon} {t.ext}
            </span>
          ))}
        </div>
      </div>

      {/* Local Drive picker */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Browse local drives:</p>
        <div className="flex flex-wrap gap-2">
          {LOCAL_DRIVES.map(drive => (
            <button
              key={drive}
              onClick={handleDriveSelect}
              className="flex items-center gap-1.5 text-xs border border-border bg-card hover:bg-muted rounded-lg px-3 py-2 transition-colors font-mono font-semibold"
            >
              <FolderOpen className="w-3.5 h-3.5 text-yellow-500" /> {drive}
            </button>
          ))}
        </div>
      </div>

      {/* Cloud connectors */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Cloud className="w-3.5 h-3.5" /> Connect cloud storage:</p>
        <div className="grid grid-cols-2 gap-2">
          {CLOUD_SOURCES.map(src => (
            <button
              key={src.id}
              onClick={() => handleCloudConnect(src.id)}
              className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${src.color} ${cloudConnected.includes(src.id) ? 'opacity-100' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span>{src.icon}</span>
                <span>{src.label}</span>
              </span>
              {cloudConnecting === src.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : cloudConnected.includes(src.id)
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  : <span className="text-xs opacity-60">Connect</span>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Queued files */}
      {droppedFiles.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 text-xs font-semibold flex items-center justify-between">
            <span>Files queued for import ({droppedFiles.length})</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          </div>
          <div className="divide-y divide-border max-h-40 overflow-y-auto">
            {droppedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="truncate text-foreground">{f.name}</span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-muted-foreground">{f.size}</span>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Don't worry if files aren't perfect — we'll guide you through any questions.</p>
    </div>
  );
}

export default function RoleOnboarding() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = slideshow, 1-5 = steps
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedWorkspace, setSelectedWorkspace] = useState('dashboard');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState([]);

  const TOTAL = STEPS.length;

  // Auto-advance slideshow
  useEffect(() => {
    if (currentStep !== 0) return;
    const t = setTimeout(() => setSlideIndex(i => (i + 1) % slides.length), 5000);
    return () => clearTimeout(t);
  }, [slideIndex, currentStep]);

  const goTo = useCallback((step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const handleStartSetup = () => { playCover(); goTo(1); };
  const handleBack = () => { playClick(); goTo(currentStep - 1); };

  const handleContinue = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep >= TOTAL) {
      playSuccess();
      setTimeout(() => { window.location.href = '/clients'; }, 400);
    } else {
      playSuccess();
      goTo(currentStep + 1);
    }
  };

  // --- Step content rendered inline so state is always live ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Age UK describes your role as:</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3">Core Responsibilities</h4>
              <ul className="text-sm space-y-2">
                {['Manage appointment bookings for handypeople','Supervise handyperson team daily','Ensure service meets contract deadlines','Monitor customer satisfaction & complaints','Maintain financial & admin records','Ensure GDPR & health/safety compliance'].map(r => (
                  <li key={r} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground italic">We've built this portal specifically to make these tasks simpler. Ready to continue?</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {WORKSPACE_OPTIONS.map(opt => (
                <Card
                  key={opt.id}
                  onClick={() => { playClick(); setSelectedWorkspace(opt.id); }}
                  className={`cursor-pointer border-2 transition-all duration-200 ${selectedWorkspace === opt.id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {opt.icon} {opt.label}
                      {selectedWorkspace === opt.id && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </CardTitle>
                    <CardDescription>{opt.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Badge variant={opt.variant}>{opt.badge}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">You can change this anytime in settings.</p>
          </div>
        );

      case 3:
        return <ImportStep droppedFiles={droppedFiles} setDroppedFiles={setDroppedFiles} />;


      case 4:
        return (
          <div className="space-y-4">
            {[
              { Icon: Lock, title: 'Bank-Level Encryption', desc: 'All data is encrypted in transit and at rest.' },
              { Icon: Shield, title: 'GDPR Compliant', desc: 'We follow UK data protection regulations. Only you control who sees what data.' },
              { Icon: FileText, title: 'Role-Based Access', desc: 'Your handypeople see jobs—not compliance data. Role-specific visibility.' },
              { Icon: CheckCircle2, title: 'Your Data, Your Control', desc: 'You can download or delete all your data at any time. No lock-in.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="border border-border rounded-lg p-4 flex items-start gap-3">
                <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-semibold mb-1">Terms & Conditions</p>
              <p className="text-xs text-muted-foreground">By using this service, you agree to use a platform built specifically for Age UK coordinators. Your data is private and you can cancel anytime.</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="font-semibold text-green-900 text-lg">Welcome to Your Coordinator Portal, Sue!</h4>
              <p className="text-sm text-green-800">Everything is ready. Start managing appointments, supervising your team, and tracking impact.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Optional: Mobile App for Your Team</CardTitle>
                <CardDescription>Make fieldwork even easier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-1 ml-2">
                  {['See today\'s jobs with one tap','Take photos of work completed','Get customer signatures on-site','Message you directly if issues arise'].map(i => (
                    <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {i}</li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { playClick(); setShowMobilePreview(p => !p); }}
                >
                  {showMobilePreview ? 'Hide' : 'Show'} Mobile App Preview
                </Button>
                {showMobilePreview && (
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <p className="font-semibold text-xs mb-2">📱 Handyperson Mobile App Preview</p>
                    <div className="bg-gray-100 rounded p-4 h-40 flex items-center justify-center text-gray-500 text-sm">[Mobile app mockup view]</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* SLIDESHOW */}
      {currentStep === 0 && (
        <div className={`h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-full max-w-2xl px-6 py-12 space-y-8 text-center">
            <div className="text-6xl">{slides[slideIndex].image}</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{slides[slideIndex].title}</h1>
              <p className="text-xl text-primary mb-4">{slides[slideIndex].subtitle}</p>
              <p className="text-muted-foreground text-lg">{slides[slideIndex].description}</p>
            </div>
            <div className="flex gap-2 justify-center">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { playClick(); setSlideIndex(idx); }}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === slideIndex ? 'bg-primary w-8' : 'bg-primary/30 w-2'}`}
                />
              ))}
            </div>
            <Button
              size="lg"
              onClick={handleStartSetup}
              className="w-full text-lg py-6 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150"
            >
              Start Setup <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEPS */}
      {currentStep > 0 && (
        <div className={`max-w-3xl mx-auto py-12 px-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

          {/* Progress */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Step {currentStep} of {TOTAL}</span>
              <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / TOTAL) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-primary">{Math.round((currentStep / TOTAL) * 100)}%</span>
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => {
                const step = i + 1;
                return (
                  <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${completedSteps.has(step) ? 'bg-green-500' : step === currentStep ? 'bg-primary' : 'bg-border'}`} />
                );
              })}
            </div>
          </div>

          {/* Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                {completedSteps.has(currentStep) && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                <CardTitle className="text-xl">{STEPS[currentStep - 1].title}</CardTitle>
              </div>
              <CardDescription>{STEPS[currentStep - 1].desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderStepContent()}

              <div className="flex gap-3 pt-4 border-t border-border">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handleBack} disabled={isTransitioning} className="active:scale-95 transition-transform">
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleContinue}
                  disabled={isTransitioning}
                  className="flex-1 py-5 text-base shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                >
                  {isTransitioning
                    ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</span>
                    : currentStep === TOTAL
                      ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Finish & Enter Portal</span>
                      : <span className="flex items-center justify-center gap-2">Continue <ChevronRight className="w-4 h-4" /></span>
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Completed chips */}
          {completedSteps.size > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(completedSteps).sort((a, b) => a - b).map(s => (
                <span key={s} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
                  <CheckCircle2 className="w-3 h-3" /> {STEPS[s - 1].title}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}