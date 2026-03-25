import React from 'react';

interface ResultPreviewProps {
  output: any;
}

export const ResultPreview = ({ output }: ResultPreviewProps) => {
  if (output === undefined || output === null) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-lg bg-black/30 border border-white/5">
      <div className="px-2 py-1 bg-white/5 border-b border-white/5 flex justify-between items-center">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">Result Preview</span>
        <span className="text-[8px] font-mono text-gray-600">
          {typeof output === 'string' ? `${output.length} chars` : 'Data'}
        </span>
      </div>
      <div className="p-2 max-h-[180px] overflow-auto text-[10px] font-mono text-gray-300 custom-scrollbar">
        {(() => {
          if (!output) return <span className="italic text-gray-600">Empty response</span>;

          // 0. Detect Image URL
          if (typeof output === 'string' && (output.startsWith('http') && (output.includes('openai.com') || output.match(/\.(jpeg|jpg|gif|png)$/) !== null))) {
            return (
              <div className="relative group">
                <img 
                  src={output} 
                  alt="Generated" 
                  className="w-full h-auto rounded border border-white/10 hover:border-cyber-primary/50 transition-colors shadow-lg cursor-pointer"
                  onClick={() => window.open(output, '_blank')}
                />
                <div className="absolute inset-0 bg-cyber-primary/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
              </div>
            );
          }

          // 1. Detect Boolean
          if (typeof output === 'boolean') {
            return (
              <div className={`text-center py-2 font-bold ${output ? 'text-green-400' : 'text-red-400'}`}>
                {output ? 'TRUE' : 'FALSE'}
              </div>
            );
          }

          // 2. Detect Table Shape
          let rows: any[] = [];
          let cols: string[] = [];
          
          if (typeof output === 'object') {
            if ('rows' in output && Array.isArray(output.rows)) {
              rows = output.rows;
            } else if (Array.isArray(output)) {
              rows = output;
            }
          } else if (typeof output === 'string') {
            try {
              const parsed = JSON.parse(output);
              if (Array.isArray(parsed)) rows = parsed;
              else if (parsed && typeof parsed === 'object' && 'rows' in parsed) rows = parsed.rows;
            } catch {}
          }

          if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
            cols = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object' || rows[0][k] === null).slice(0, 4);
            if (cols.length > 0) {
              return (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 text-[9px]">
                      {cols.map(c => <th key={c} className="text-left px-1 py-0.5 font-bold uppercase">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        {cols.map(c => (
                          <td key={c} className="px-1 py-1 truncate max-w-[80px]">
                            {String(r[c] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length > 5 && (
                      <tr>
                        <td colSpan={cols.length} className="text-center py-1 opacity-40 text-[9px]">
                          + {rows.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              );
            }
          }

          // 3. Detect List Shape
          if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
             const r0 = rows[0];
             if ('title' in r0 || 'snippet' in r0 || 'text' in r0) {
                return (
                  <div className="space-y-2">
                    {rows.slice(0, 3).map((item, i) => (
                      <div key={i} className="pb-2 border-b border-white/5 last:border-0 last:pb-0 group">
                        {item.title && <div className="text-cyber-primary truncate font-bold group-hover:text-cyan-300 transition-colors">{item.title}</div>}
                        {item.link && <div className="text-[8px] text-gray-500 truncate mb-1">{item.link}</div>}
                        <div className="text-gray-400 line-clamp-3 text-[9px] leading-snug">
                          {item.snippet || item.text || item.content || JSON.stringify(item)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
             }
          }

          // 4. Fallback
          const text = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
          return (
            <div className="whitespace-pre-wrap line-clamp-[12] break-all leading-normal">
              {text}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
