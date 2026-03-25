import { useState, useCallback, memo } from "react";
import { 
  CheckCircle2, Layout, 
  Save, Download, Palette, Image as ImageIcon, Search, Heart, Sparkles 
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useLayoutTemplateStore } from "@/store/useLayoutTemplateStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";

import { readySetups, colorPalettes, wallpaperThemes } from "@/data/themeItems";
import ShinyText from "@/components/landing/ShinyText";
import type { ThemeItem, WallpaperThemeItem, SetupItem } from "@/types/Theme";

// --- COMPONENTES MEMOIZADOS ---

const SetupCard = memo(({ setup, isFavorite, onInstall, onToggleFavorite }: { setup: SetupItem; isFavorite: boolean; onInstall: (s: SetupItem) => void; onToggleFavorite: (id: string) => void }) => (
  <div className="box-padrao p-0 overflow-hidden group flex flex-col min-h-[220px] relative hover:ring-2 ring-primary transition-all">
    <div className="h-28 w-full relative bg-current/5" style={{ backgroundColor: setup.theme.backgroundColor }}>
       {setup.theme.customImage && (
         <img 
            src={setup.theme.customImage} 
            alt="" 
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity duration-300" 
         />
       )}
       <div className="absolute top-3 left-3 p-2 rounded-xl shadow-lg text-white z-10" style={{ backgroundColor: setup.theme.primaryColor }}>{setup.icon}</div>
       
       <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(setup.id); }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all hover:bg-black/10 z-20 ${isFavorite ? "text-red-500 scale-110 bg-white/20" : "text-white/70 hover:text-white"}`}
       >
         <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
       </button>
    </div>
    <div className="p-4 flex-1 flex flex-col justify-between bg-current/5">
      <div>
        <h3 className="font-bold text-lg">{setup.name}</h3>
        <p className="text-xs opacity-60 line-clamp-2 mt-1">{setup.description}</p>
      </div>
      <button onClick={() => onInstall(setup)} className="w-full mt-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm">
        <Download size={14}/> Instalar Setup
      </button>
    </div>
  </div>
));

const ThemeCard = memo(({ theme, isApplied, isFavorite, onApply, onToggleFavorite }: { theme: WallpaperThemeItem; isApplied: boolean; isFavorite: boolean; onApply: (t: WallpaperThemeItem) => void; onToggleFavorite: (id: string) => void }) => (
  <div className="box-padrao p-0 overflow-hidden flex flex-col min-h-[160px] relative group">
    <div className={`h-20 w-full relative bg-current/5 ${theme.previewColor}`}>
      {theme.theme.customImage && (
        <img 
          src={theme.theme.customImage} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-60 transition-opacity duration-300" 
          alt=""
        />
      )}
      <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(theme.id); }}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all hover:bg-black/10 z-20 ${isFavorite ? "text-red-500 scale-110 bg-white/20" : "text-white/70 hover:text-white opacity-0 group-hover:opacity-100"}`}
       >
         <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
       </button>
    </div>
    <div className="p-4 flex flex-col justify-between flex-1">
      <div><h3 className="font-bold text-base">{theme.name}</h3><p className="text-xs opacity-60">{theme.description}</p></div>
      <button 
        onClick={() => onApply(theme)} 
        className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
          isApplied 
            ? "bg-green-500 text-white" 
            : "bg-current/5 hover:bg-primary/10 hover:text-primary"
        }`}
      >
        {isApplied ? <><CheckCircle2 size={14} /> Aplicado</> : "Aplicar Visual"}
      </button>
    </div>
  </div>
));

const PaletteCard = memo(({ palette, isApplied, isFavorite, onApply, onToggleFavorite }: { palette: ThemeItem; isApplied: boolean; isFavorite: boolean; onApply: (p: ThemeItem) => void; onToggleFavorite: (id: string) => void }) => (
  <div 
    className="box-padrao p-3 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer relative group" 
    onClick={() => onApply(palette)}
  >
    <button 
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(palette.id); }}
        className={`absolute top-2 right-2 p-1 rounded-full transition-all hover:bg-black/5 z-20 ${isFavorite ? "text-red-500 scale-110" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`}
    >
        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
    </button>

    <div className="flex -space-x-2">
      <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: palette.theme.backgroundColor }} />
      <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: palette.theme.primaryColor }} />
      <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: palette.theme.sidebarColor }} />
    </div>
    <div><h3 className="font-bold text-sm">{palette.name}</h3><p className="text-[10px] opacity-50 line-clamp-1">{palette.description}</p></div>
    <button className={`mt-1 text-[10px] font-bold px-3 py-1 rounded-full transition ${isApplied ? 'bg-green-500 text-white' : 'bg-current/10'}`}>
       {isApplied ? "Ok" : "Usar Cores"}
    </button>
  </div>
));

// --- PÁGINA PRINCIPAL ---

export default function ThemesPage() {
  const { boxes, layouts, loadDashboardState } = useDashboardStore(
    useShallow(state => ({ 
      boxes: state.boxes, 
      layouts: state.layouts, 
      loadDashboardState: state.loadDashboardState 
    }))
  );

  const applyPreset = useThemeStore(state => state.applyPreset);
  const saveTemplate = useLayoutTemplateStore(state => state.saveTemplate);
  
  const { contents, loadAllContents } = useBoxContentStore(
    useShallow(state => ({ 
      contents: state.contents, 
      loadAllContents: state.loadAllContents 
    }))
  );

  const { favoriteThemes, toggleThemeFavorite } = useFavoriteStore(
      useShallow(state => ({
        favoriteThemes: state.favoriteThemes,
        toggleThemeFavorite: state.toggleThemeFavorite
      }))
  );
  
  const [applied, setApplied] = useState<string | null>(null);
  const [newSetupName, setNewSetupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSetups = readySetups.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredThemes = wallpaperThemes.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPalettes = colorPalettes.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favSetups = filteredSetups.filter(s => favoriteThemes.includes(s.id));
  const favThemes = filteredThemes.filter(t => favoriteThemes.includes(t.id));
  const favPalettes = filteredPalettes.filter(p => favoriteThemes.includes(p.id));
  const hasFavorites = favSetups.length > 0 || favThemes.length > 0 || favPalettes.length > 0;

  const handleSaveSetup = useCallback(() => {
    if (!newSetupName.trim()) return alert("Dê um nome para o seu setup!");
    const currentThemeState = useThemeStore.getState();
    const currentTheme = {
      wallpaper: currentThemeState.wallpaper, 
      customImage: currentThemeState.customImage, 
      sidebarColor: currentThemeState.sidebarColor,
      primaryColor: currentThemeState.primaryColor, 
      boxOpacity: currentThemeState.boxOpacity, 
      boxColor: currentThemeState.boxColor,
      textColor: currentThemeState.textColor, 
      backgroundColor: currentThemeState.backgroundColor
    };
    saveTemplate(newSetupName, boxes, layouts, currentTheme, contents);
    setNewSetupName("");
    alert(`Setup "${newSetupName}" salvo com sucesso!`);
  }, [newSetupName, boxes, layouts, contents, saveTemplate]);

  const handleLoadSetup = useCallback((template: SetupItem) => {
    if (confirm(`Atenção: Instalar "${template.name}" irá substituir todos os seus widgets atuais. Continuar?`)) {
      loadDashboardState(template.boxes, template.layouts);
      if (template.theme) applyPreset(template.theme);
      if (template.content) loadAllContents(template.content as Record<string, unknown>);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loadDashboardState, applyPreset, loadAllContents]);

  const handleApplyTheme = useCallback((themeItem: WallpaperThemeItem | ThemeItem) => {
    applyPreset(themeItem.theme);
    setApplied(themeItem.id);
    setTimeout(() => setApplied(null), 1500);
  }, [applyPreset]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-transparent">
       {/* Background Ambient */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] rounded-full blur-[120px] opacity-10" 
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div 
          className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="w-full max-w-7xl space-y-12 pt-10 pb-32 px-4 relative z-10" style={{ color: 'var(--box-text-color)' }}>
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border shrink-0 transition-colors duration-500"
                 style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                    color: 'var(--primary)'
                 }}>
               <Palette size={28} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2 opacity-60"
                   style={{ color: 'var(--primary)' }}>
                 <Sparkles size={10} /> Customização
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  <ShinyText text="Galeria de Temas" disabled={false} speed={3} />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5 rounded-2xl backdrop-blur-sm border transition-colors duration-500 w-full md:w-auto"
               style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--box-text-color) 5%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--box-text-color) 10%, transparent)'
               }}>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
              <input
                type="text"
                placeholder="Pesquisar estilos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border-none outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO DE FAVORITOS */}
        {hasFavorites && (
          <section className="space-y-6 pb-8 border-b border-current/5">
            <div className="flex items-center gap-3">
              <Heart className="text-red-500 fill-red-500" size={24} />
              <h2 className="text-2xl font-black tracking-tight">Meus Favoritos</h2>
            </div>

            {favSetups.length > 0 && (
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Setups Completos</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(favSetups as SetupItem[]).map((setup) => (
                      <SetupCard key={setup.id} setup={setup} isFavorite={true} onToggleFavorite={toggleThemeFavorite} onInstall={handleLoadSetup} />
                    ))}
                 </div>
              </div>
            )}

            {favThemes.length > 0 && (
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Temas de Imersão</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favThemes.map((t) => (
                      <ThemeCard key={t.id} theme={t} isApplied={applied === t.id} isFavorite={true} onToggleFavorite={toggleThemeFavorite} onApply={handleApplyTheme} />
                    ))}
                 </div>
              </div>
            )}

            {favPalettes.length > 0 && (
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Paletas</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {favPalettes.map((p) => (
                      <PaletteCard key={p.id} palette={p} isApplied={applied === p.id} isFavorite={true} onToggleFavorite={toggleThemeFavorite} onApply={handleApplyTheme} />
                    ))}
                 </div>
              </div>
            )}
          </section>
        )}

        {/* 1. SETUPS COMPLETOS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Layout className="text-primary" size={24}/>
            <h2 className="text-2xl font-black tracking-tight">Setups Completos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(filteredSetups as SetupItem[]).map((setup) => (
              <SetupCard key={setup.id} setup={setup} isFavorite={favoriteThemes.includes(setup.id)} onToggleFavorite={toggleThemeFavorite} onInstall={handleLoadSetup} />
            ))}
          </div>
        </section>

        {/* 2. TEMAS DE IMERSÃO */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <ImageIcon className="text-purple-500" size={24}/>
            <h2 className="text-2xl font-black tracking-tight">Temas de Imersão</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredThemes.map((t) => (
              <ThemeCard key={t.id} theme={t} isApplied={applied === t.id} isFavorite={favoriteThemes.includes(t.id)} onToggleFavorite={toggleThemeFavorite} onApply={handleApplyTheme} />
            ))}
          </div>
        </section>

        {/* 3. PALETAS DE CORES */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="text-pink-500" size={24}/>
            <h2 className="text-2xl font-black tracking-tight">Paletas de Cores</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} isApplied={applied === p.id} isFavorite={favoriteThemes.includes(p.id)} onToggleFavorite={toggleThemeFavorite} onApply={handleApplyTheme} />
            ))}
          </div>
        </section>

        {/* SALVAR SETUP ATUAL */}
        <div className="fixed bottom-6 right-6 z-50 left-6 sm:left-auto sm:w-auto">
          <div className="bar-padrao shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-6 duration-500 ring-1 ring-primary/20">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Save size={20}/>
             </div>
             <div className="flex flex-row gap-2 w-full">
               <input type="text" placeholder="Nome do Backup..." value={newSetupName} onChange={e => setNewSetupName(e.target.value)} className="px-4 py-2 rounded-xl bg-current/5 outline-none text-xs font-bold flex-1 sm:w-52" />
               <button onClick={handleSaveSetup} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Salvar</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
