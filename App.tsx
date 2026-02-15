import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Image as ImageIcon, 
  Bookmark, 
  Search, 
  Loader2, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { generateProductIdeas, findTrends, generateProductMockup } from './services/geminiService';
import { ProductIdea, TrendResult, AppView, SavedItem } from './types';
import IdeaCard from './components/IdeaCard';
import TrendCard from './components/TrendCard';

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [view, setView] = useState<AppView>(AppView.IDEATOR);
  const [nicheInput, setNicheInput] = useState('');
  const [trendInput, setTrendInput] = useState('');
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [trends, setTrends] = useState<TrendResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<SavedItem[]>([]);
  
  // For Visualization
  const [visualizingIdea, setVisualizingIdea] = useState<ProductIdea | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Load saved ideas from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('etsyFlowSaved');
    if (saved) {
      setSavedIdeas(JSON.parse(saved));
    }
  }, []);

  // Save ideas to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('etsyFlowSaved', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicheInput.trim()) return;

    setIsLoading(true);
    setIdeas([]);
    try {
      const results = await generateProductIdeas(nicheInput);
      setIdeas(results);
    } catch (error) {
      alert("Failed to generate ideas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindTrends = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendInput.trim()) return;

    setIsLoading(true);
    setTrends([]);
    try {
      const results = await findTrends(trendInput);
      setTrends(results);
    } catch (error) {
      alert("Failed to find trends. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = (idea: ProductIdea) => {
    const newItem: SavedItem = { ...idea, id: generateId(), createdAt: Date.now() };
    setSavedIdeas(prev => [...prev, newItem]);
  };

  const handleRemoveSaved = (id: string) => {
    setSavedIdeas(prev => prev.filter(item => item.id !== id));
  };

  const handleVisualize = async (idea: ProductIdea) => {
    setVisualizingIdea(idea);
    setView(AppView.VISUALIZER);
    setGeneratedImage(null);
    setIsGeneratingImage(true);

    try {
      // Create a rich prompt for the image generator
      const prompt = `${idea.title}. ${idea.description}. Format: ${idea.format}. Target Audience: ${idea.targetAudience}`;
      const imageUrl = await generateProductMockup(prompt);
      setGeneratedImage(imageUrl);
      
      // Update the saved idea if it exists
      const existingSaved = savedIdeas.find(saved => saved.title === idea.title && saved.description === idea.description);
      if (existingSaved) {
        setSavedIdeas(prev => prev.map(item => 
          item.id === existingSaved.id ? { ...item, imageUrl } : item
        ));
      }

    } catch (error) {
      console.error(error);
      alert("Could not generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const renderNav = () => (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShoppingBag className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              EtsyFlow
            </span>
          </div>
          <div className="flex space-x-1 sm:space-x-4 items-center">
            {[
              { id: AppView.IDEATOR, icon: Lightbulb, label: 'Ideator' },
              { id: AppView.TRENDS, icon: TrendingUp, label: 'Trends' },
              { id: AppView.VISUALIZER, icon: ImageIcon, label: 'Visualizer' },
              { id: AppView.SAVED, icon: Bookmark, label: 'Saved' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  view === item.id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderIdeator = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Generate Best-Selling <span className="text-orange-500">Digital Products</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Enter a niche or topic, and let AI brainstorm profitable Etsy product ideas complete with SEO tags and audience targeting.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-16">
        <form onSubmit={handleGenerateIdeas} className="relative">
          <input
            type="text"
            value={nicheInput}
            onChange={(e) => setNicheInput(e.target.value)}
            placeholder="e.g. Wedding Planners, ADHD Organization, Teacher Resources..."
            className="w-full pl-6 pr-14 py-4 rounded-full border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-lg shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </form>
      </div>

      {ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ideas.map((idea, idx) => (
            <IdeaCard 
              key={idx} 
              idea={idea} 
              onSave={handleSaveIdea}
              isSaved={savedIdeas.some(s => s.title === idea.title && s.description === idea.description)}
              onVisualize={handleVisualize}
            />
          ))}
        </div>
      )}
      
      {ideas.length === 0 && !isLoading && (
        <div className="text-center text-slate-400 py-12">
          <Sparkles className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <p>Ready to spark some creativity?</p>
        </div>
      )}
    </div>
  );

  const renderTrends = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Spot Real-Time <span className="text-blue-500">Market Trends</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Leverage Google Search Grounding to find what shoppers are actually looking for right now.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-16">
        <form onSubmit={handleFindTrends} className="relative">
          <input
            type="text"
            value={trendInput}
            onChange={(e) => setTrendInput(e.target.value)}
            placeholder="e.g. Digital Art, Planners, Invitations..."
            className="w-full pl-6 pr-14 py-4 rounded-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-lg shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
          >
             {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </form>
      </div>

      {trends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((trend, idx) => (
            <TrendCard key={idx} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );

  const renderVisualizer = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Product Visualizer</h1>
        <p className="text-slate-600">Turn your concepts into professional mockups.</p>
      </div>

      {!visualizingIdea && !isGeneratingImage && !generatedImage ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <ImageIcon className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg text-slate-500">Select an idea from the <strong>Ideator</strong> or <strong>Saved</strong> tab to visualize it.</p>
          <button 
            onClick={() => setView(AppView.IDEATOR)}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
          >
            Go to Ideator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: Details */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
             {visualizingIdea && (
               <>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{visualizingIdea.title}</h2>
                <p className="text-slate-600 mb-6">{visualizingIdea.description}</p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase">Prompt sent to AI</span>
                    <p className="text-sm text-slate-700 mt-1 italic">
                      "Professional product mockup of {visualizingIdea.title}, {visualizingIdea.format}..."
                    </p>
                  </div>

                  <div className="flex gap-2">
                     <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                        {visualizingIdea.format}
                     </span>
                     <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                        {visualizingIdea.targetAudience}
                     </span>
                  </div>
                </div>
               </>
             )}
          </div>

          {/* Right: Image Result */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex items-center justify-center bg-slate-100">
              {isGeneratingImage ? (
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Generating Mockup...</p>
                  <p className="text-xs text-slate-400 mt-2">This may take a few seconds</p>
                </div>
              ) : generatedImage ? (
                <div className="w-full h-full">
                  <img src={generatedImage} alt="Generated Product Mockup" className="w-full h-auto object-cover" />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <a 
                      href={generatedImage} 
                      download={`etsy-mockup-${Date.now()}.png`}
                      className="px-4 py-2 bg-white/90 backdrop-blur text-slate-900 rounded-lg shadow-lg text-sm font-semibold hover:bg-white transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Waiting for data...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSaved = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Saved Ideas ({savedIdeas.length})</h1>
      
      {savedIdeas.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Bookmark className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">You haven't saved any ideas yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedIdeas.map((item) => (
            <div key={item.id} className="relative group">
              <IdeaCard 
                idea={item} 
                isSaved={true}
                onVisualize={handleVisualize}
              />
               <button
                  onClick={() => handleRemoveSaved(item.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-500 p-2 rounded-full hover:bg-red-200"
                  title="Remove"
                >
                  <span className="sr-only">Remove</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              
              {/* If we have a generated image for this saved item, show a small preview indicator */}
              {item.imageUrl && (
                <div className="absolute bottom-20 right-6 w-12 h-12 rounded-lg border-2 border-white shadow-md overflow-hidden bg-slate-200" title="Has Mockup">
                  <img src={item.imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {renderNav()}
      <main>
        {view === AppView.IDEATOR && renderIdeator()}
        {view === AppView.TRENDS && renderTrends()}
        {view === AppView.VISUALIZER && renderVisualizer()}
        {view === AppView.SAVED && renderSaved()}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} EtsyFlow. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
