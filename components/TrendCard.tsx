import React from 'react';
import { TrendResult } from '../types';
import { TrendingUp, ExternalLink, Globe } from 'lucide-react';

interface TrendCardProps {
  trend: TrendResult;
}

const TrendCard: React.FC<TrendCardProps> = ({ trend }) => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-100 rounded-full opacity-50 blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-orange-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800">{trend.trendName}</h3>
          </div>
          <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${
            trend.searchVolumeLevel === 'High' ? 'bg-green-100 text-green-700' :
            trend.searchVolumeLevel === 'Rising' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {trend.searchVolumeLevel} Vol
          </span>
        </div>

        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          {trend.description}
        </p>

        {trend.groundingUrls && trend.groundingUrls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/60">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <Globe size={12} /> Sources found
            </h4>
            <div className="flex flex-col gap-1">
              {trend.groundingUrls.map((url, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate flex items-center gap-1"
                >
                  <ExternalLink size={10} />
                  {new URL(url).hostname}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendCard;
