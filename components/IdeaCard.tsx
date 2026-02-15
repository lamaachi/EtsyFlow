import React from 'react';
import { ProductIdea } from '../types';
import { Tag, DollarSign, BarChart, FileType, Plus, Check } from 'lucide-react';

interface IdeaCardProps {
  idea: ProductIdea;
  onSave?: (idea: ProductIdea) => void;
  isSaved?: boolean;
  onVisualize?: (idea: ProductIdea) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onSave, isSaved, onVisualize }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-800 leading-tight">{idea.title}</h3>
        {onSave && (
          <button
            onClick={() => onSave(idea)}
            className={`p-2 rounded-full transition-colors ${
              isSaved 
                ? 'bg-green-100 text-green-600' 
                : 'bg-slate-100 text-slate-400 hover:bg-orange-100 hover:text-orange-500'
            }`}
            title={isSaved ? "Saved" : "Save Idea"}
          >
            {isSaved ? <Check size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>

      <p className="text-slate-600 mb-6 flex-grow">{idea.description}</p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-slate-500">
          <BarChart size={16} className="mr-2 text-orange-400" />
          <span className="font-medium mr-1">Difficulty:</span> 
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            idea.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
            idea.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {idea.difficulty}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-slate-500">
          <FileType size={16} className="mr-2 text-orange-400" />
          <span className="font-medium mr-1">Format:</span> {idea.format}
        </div>

        <div className="flex items-center text-sm text-slate-500">
          <DollarSign size={16} className="mr-2 text-orange-400" />
          <span className="font-medium mr-1">Est. Price:</span> {idea.priceRange}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Audience</h4>
        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
          {idea.targetAudience}
        </p>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">SEO Tags</h4>
        <div className="flex flex-wrap gap-2">
          {idea.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
              <Tag size={10} className="mr-1" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {onVisualize && (
        <button
          onClick={() => onVisualize(idea)}
          className="w-full mt-auto py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Generate Mockup
        </button>
      )}
    </div>
  );
};

export default IdeaCard;
