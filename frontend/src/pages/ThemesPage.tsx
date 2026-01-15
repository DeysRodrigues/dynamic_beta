import { useState, useCallback, memo } from "react";
import { 
  CheckCircle2, Layout, 
  Save, Download, Palette, Image as ImageIcon, Search, Heart 
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useLayoutTemplateStore } from "@/store/useLayoutTemplateStore";
import { useBoxContentStore } from "@/store/useBoxContentStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";

import { readySetups, colorPalettes, wallpaperThemes } from "@/data/themeItems";

// --- COMPONENTES MEMOIZADOS (Evitam Re-renders em massa) ---

// 1. Card de Setup Completo
const SetupCard = memo(({ setup, isFavorite, onInstall, onToggleFavorite }: { setup: any; isFavorite: boolean; onInstall: (s: any) => void; onToggleFavorite: (id: string) => void }) => (
  <div className="box-padrao p-0 overflow-hidden group flex flex-col min-h-[220px] relative hover:ring-2 ring-primary transition-all">
    <div className="h-28 w-full relative" style={{ backgroundColor: setup.theme.backgroundColor }}>
       {setup.theme.customImage && <img src={setup.theme.customImage} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
       <div className="absolute top-3 left-3 p-2 rounded-xl shadow-lg text-white z-10" style={{ backgroundColor: setup.theme.primaryColor }}>{setup.icon}</div>
       
       {/* Favorite Button */}
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

// 2. Card de Tema de Imersão
const ThemeCard = memo(({ theme, isApplied, isFavorite, onApply, onToggleFavorite }: { theme: any; isApplied: boolean; isFavorite: boolean; onApply: (t: any) => void; onToggleFavorite: (id: string) => void }) => (
  <div className="box-padrao p-0 overflow-hidden flex flex-col min-h-[160px] relative group">
    <div className={`h-20 w-full relative ${theme.previewColor}`}>
      {theme.theme.customImage && <img src={theme.theme.customImage} className="w-full h-full object-cover opacity-60" />}
      {theme.theme.wallpaper === 'grid' && <div className="absolute inset-0 opacity-20 bg-[url('https://transparenttextures.com/patterns/graphy.png')]"></div>}
      {theme.theme.wallpaper === 'blueprint' && <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>}
      
      {/* Favorite Button */}
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

// 3. Card de Paleta de Cores
const PaletteCard = memo(({ palette, isApplied, isFavorite, onApply, onToggleFavorite }: { palette: any; isApplied: boolean; isFavorite: boolean; onApply: (p: any) => void; onToggleFavorite: (id: string) => void }) => (
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
  // 1. OTIMIZAÇÃO: Seletores Shallow e Ações Estáveis
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

  // --- LÓGICA DE FAVORITOS ---
  const favSetups = filteredSetups.filter(s => favoriteThemes.includes(s.id));
  const favThemes = filteredThemes.filter(t => favoriteThemes.includes(t.id));
  const favPalettes = filteredPalettes.filter(p => favoriteThemes.includes(p.id));
  const hasFavorites = favSetups.length > 0 || favThemes.length > 0 || favPalettes.length > 0;

  // 2. OTIMIZAÇÃO: Acesso direto ao State para salvar (sem re-render ao mudar tema)
  const handleSaveSetup = useCallback(() => {
    if (!newSetupName.trim()) return alert("Dê um nome para o seu setup!");
    
    // Pega o estado ATUAL do tema diretamente, sem causar re-render no componente
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

  const handleLoadSetup = useCallback((template: any) => {
    if (confirm(`Atenção: Instalar "${template.name}" irá substituir todos os seus widgets atuais. Continuar?`)) {
      loadDashboardState(template.boxes, template.layouts);
      if (template.theme) applyPreset(template.theme);
      if (template.content) loadAllContents(template.content);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loadDashboardState, applyPreset, loadAllContents]);

  const handleApplyTheme = useCallback((themeItem: any) => {
    applyPreset(themeItem.theme);
    setApplied(themeItem.id);
    setTimeout(() => setApplied(null), 1500);
  }, [applyPreset]);

  return (
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

      {/* SEARCH BAR */}
      <div className="bar-padrao">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            size={20}
          />
          <input
            type="text"
            placeholder="Pesquisar setups, temas ou paletas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* SEÇÃO DE FAVORITOS */}
      {hasFavorites && (
        <section className="space-y-6 pb-8">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={24} />
            <div>
              <h2 className="text-2xl font-bold">Meus Favoritos</h2>
              <p className="text-sm opacity-60">Seus estilos preferidos salvos.</p>
            </div>
          </div>

          {favSetups.length > 0 && (
            <div className="space-y-3">
               <h3 className="text-sm font-bold opacity-50 uppercase tracking-wider">Setups Completos</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favSetups.map((setup) => (
                    <SetupCard 
                      key={setup.id} 
                      setup={setup} 
                      isFavorite={true}
                      onToggleFavorite={toggleThemeFavorite}
                      onInstall={handleLoadSetup} 
                    />
                  ))}
               </div>
            </div>
          )}

          {favThemes.length > 0 && (
            <div className="space-y-3">
               <h3 className="text-sm font-bold opacity-50 uppercase tracking-wider">Temas de Imersão</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favThemes.map((t) => (
                    <ThemeCard 
                      key={t.id} 
                      theme={t} 
                      isApplied={applied === t.id}
                      isFavorite={true}
                      onToggleFavorite={toggleThemeFavorite}
                      onApply={handleApplyTheme} 
                    />
                  ))}
               </div>
            </div>
          )}

          {favPalettes.length > 0 && (
            <div className="space-y-3">
               <h3 className="text-sm font-bold opacity-50 uppercase tracking-wider">Paletas</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {favPalettes.map((p) => (
                    <PaletteCard 
                      key={p.id} 
                      palette={p} 
                      isApplied={applied === p.id}
                      isFavorite={true}
                      onToggleFavorite={toggleThemeFavorite}
                      onApply={handleApplyTheme} 
                    />
                  ))}
               </div>
            </div>
          )}
        </section>
      )}

      {/* 1. SETUPS COMPLETOS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <Layout className="text-primary" size={28}/>
          <div>
            <h2 className="text-xl font-bold">Setups Completos</h2>
            <p className="text-sm opacity-60">Layouts prontos + Widgets + Tema (Substitui tudo).</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSetups.map((setup) => (
            <SetupCard 
              key={setup.id} 
              setup={setup} 
              isFavorite={favoriteThemes.includes(setup.id)}
              onToggleFavorite={toggleThemeFavorite}
              onInstall={handleLoadSetup} 
            />
          ))}
        </div>
      </section>

      {/* 2. TEMAS DE IMERSÃO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <ImageIcon className="text-purple-500" size={28}/>
          <div>
            <h2 className="text-xl font-bold">Temas de Imersão</h2>
            <p className="text-sm opacity-60">Altera cores e papel de parede. Mantém seus widgets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredThemes.map((t) => (
            <ThemeCard 
              key={t.id} 
              theme={t} 
              isApplied={applied === t.id}
              isFavorite={favoriteThemes.includes(t.id)}
              onToggleFavorite={toggleThemeFavorite}
              onApply={handleApplyTheme} 
            />
          ))}
        </div>
      </section>

      {/* 3. PALETAS DE CORES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <Palette className="text-pink-500" size={28}/>
          <div>
            <h2 className="text-xl font-bold">Paletas de Cores</h2>
            <p className="text-sm opacity-60">Troca apenas as cores.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredPalettes.map((p) => (
            <PaletteCard 
              key={p.id} 
              palette={p} 
              isApplied={applied === p.id}
              isFavorite={favoriteThemes.includes(p.id)}
              onToggleFavorite={toggleThemeFavorite}
              onApply={handleApplyTheme} 
            />
          ))}
        </div>
      </section>

      {/* SALVAR SETUP ATUAL */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="box-padrao p-3 shadow-2xl bg-background/90 backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-bottom-4">
           <Save size={20} className="text-primary"/>
           <div className="flex flex-col md:flex-row gap-2">
             <input type="text" placeholder="Nome do Setup..." value={newSetupName} onChange={e => setNewSetupName(e.target.value)} className="px-3 py-1.5 rounded-lg bg-black/5 outline-none text-sm w-40 md:w-52" />
             <button onClick={handleSaveSetup} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:opacity-90">Backup</button>
           </div>
        </div>
      </div>
    </div>
  );
}
