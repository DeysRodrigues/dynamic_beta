import { useState } from "react";
import { 
  CheckCircle2, Layout, 
  Save, Download, Palette, Image as ImageIcon 
} from "lucide-react";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useLayoutTemplateStore } from "@/store/useLayoutTemplateStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";

import { readySetups, colorPalettes, wallpaperThemes } from "@/data/themeItems";

export default function ThemesPage() {
  const { boxes, layouts, loadDashboardState } = useDashboardStore();
  const themeStore = useThemeStore();
  const { saveTemplate } = useLayoutTemplateStore();
  const contentStore = useBoxContentStore();
  
  const [applied, setApplied] = useState<string | null>(null);
  const [newSetupName, setNewSetupName] = useState("");

  const handleSaveSetup = () => {
    if (!newSetupName.trim()) return alert("Dê um nome para o seu setup!");
    const currentTheme = {
      wallpaper: themeStore.wallpaper, customImage: themeStore.customImage, sidebarColor: themeStore.sidebarColor,
      primaryColor: themeStore.primaryColor, boxOpacity: themeStore.boxOpacity, boxColor: themeStore.boxColor,
      textColor: themeStore.textColor, backgroundColor: themeStore.backgroundColor
    };
    saveTemplate(newSetupName, boxes, layouts, currentTheme, contentStore.contents);
    setNewSetupName("");
    alert(`Setup "${newSetupName}" salvo com sucesso!`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadSetup = (template: any) => {
    if (confirm(`⚠️ Atenção: Instalar "${template.name}" irá substituir todos os seus widgets atuais. Continuar?`)) {
      loadDashboardState(template.boxes, template.layouts);
      if (template.theme) themeStore.applyPreset(template.theme);
      if (template.content) contentStore.loadAllContents(template.content);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleApplyTheme = (themeItem: any) => {
    themeStore.applyPreset(themeItem.theme);
    setApplied(themeItem.id);
    setTimeout(() => setApplied(null), 1500);
  };

  return (
    // CORREÇÃO: Adicionado style={{ color: 'var(--box-text-color)' }} para adaptar ao tema
    <div 
      className="p-6 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500 pb-20"
      style={{ color: 'var(--box-text-color)' }}
    >
      
      <div className="bar-padrao">
        <div>
          <h1 className="text-3xl font-bold">Galeria de Temas</h1>
          <p className="opacity-70 mt-1">Personalize o visual e a estrutura do seu dashboard.</p>
        </div>
      </div>

      {/* 1. SETUPS COMPLETOS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-current/10 pb-2">
          <Layout className="text-primary" size={28}/>
          <div>
            <h2 className="text-xl font-bold">Setups Completos</h2>
            <p className="text-sm opacity-60">Layouts prontos + Widgets + Tema (Substitui tudo).</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {readySetups.map((setup) => (
            <div key={setup.id} className="box-padrao p-0 overflow-hidden group flex flex-col min-h-[220px] relative hover:ring-2 ring-primary transition-all">
              <div className="h-28 w-full relative" style={{ backgroundColor: setup.theme.backgroundColor }}>
                 {setup.theme.customImage && <img src={setup.theme.customImage} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                 <div className="absolute top-3 left-3 p-2 rounded-xl shadow-lg text-white z-10" style={{ backgroundColor: setup.theme.primaryColor }}>{setup.icon}</div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between bg-current/5">
                <div>
                  <h3 className="font-bold text-lg">{setup.name}</h3>
                  <p className="text-xs opacity-60 line-clamp-2 mt-1">{setup.description}</p>
                </div>
                <button onClick={() => handleLoadSetup(setup)} className="w-full mt-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm">
                  <Download size={14}/> Instalar Setup
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. TEMAS DE IMERSÃO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-current/10 pb-2">
          <ImageIcon className="text-purple-500" size={28}/>
          <div>
            <h2 className="text-xl font-bold">Temas de Imersão</h2>
            <p className="text-sm opacity-60">Altera cores e papel de parede. Mantém seus widgets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wallpaperThemes.map((t) => (
            <div key={t.id} className="box-padrao p-0 overflow-hidden flex flex-col min-h-[160px] relative">
              <div className={`h-20 w-full relative ${t.previewColor}`}>
                {t.theme.customImage && <img src={t.theme.customImage} className="w-full h-full object-cover opacity-60" />}
                {t.theme.wallpaper === 'grid' && <div className="absolute inset-0 opacity-20 bg-[url('https://transparenttextures.com/patterns/graphy.png')]"></div>}
                {t.theme.wallpaper === 'blueprint' && <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>}
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div><h3 className="font-bold text-base">{t.name}</h3><p className="text-xs opacity-60">{t.description}</p></div>
                <button onClick={() => handleApplyTheme(t)} className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${applied === t.id ? "bg-green-500 text-white" : "bg-current/5 border border-current/10 hover:bg-primary/10 hover:text-primary hover:border-primary/30"}`}>
                  {applied === t.id ? <><CheckCircle2 size={14} /> Aplicado</> : "Aplicar Visual"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PALETAS DE CORES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-current/10 pb-2">
          <Palette className="text-pink-500" size={28}/>
          <div>
            <h2 className="text-xl font-bold">Paletas de Cores</h2>
            <p className="text-sm opacity-60">Troca apenas as cores.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {colorPalettes.map((p) => (
            <div key={p.id} className="box-padrao p-3 flex flex-col items-center justify-center text-center gap-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleApplyTheme(p)}>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: p.theme.backgroundColor }} />
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: p.theme.primaryColor }} />
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: p.theme.sidebarColor }} />
              </div>
              <div><h3 className="font-bold text-sm">{p.name}</h3><p className="text-[10px] opacity-50 line-clamp-1">{p.description}</p></div>
              <button className={`mt-1 text-[10px] font-bold px-3 py-1 rounded-full transition ${applied === p.id ? 'bg-green-500 text-white' : 'bg-current/10'}`}>
                 {applied === p.id ? "Ok" : "Usar Cores"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SALVAR SETUP ATUAL */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="box-padrao p-3 shadow-2xl border-primary/20 bg-background/90 backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-bottom-4">
           <Save size={20} className="text-primary"/>
           <div className="flex flex-col md:flex-row gap-2">
             <input type="text" placeholder="Nome do Setup..." value={newSetupName} onChange={e => setNewSetupName(e.target.value)} className="px-3 py-1.5 rounded-lg bg-black/5 border border-current/10 outline-none text-sm w-40 md:w-52" />
             <button onClick={handleSaveSetup} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:opacity-90">Backup</button>
           </div>
        </div>
      </div>
    </div>
  );
}