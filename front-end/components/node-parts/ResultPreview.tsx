import React from "react";
import { JsonViewer } from "@textea/json-viewer";
import { stringifyUnknown } from '../../lib/utils';
import { CyberBadge } from "../shared/CyberUI";

interface ResultPreviewProps {
  output: unknown;
}

type PreviewRow = Record<string, unknown>;

function isPreviewRow(value: unknown): value is PreviewRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRows(output: unknown): PreviewRow[] {
  if (Array.isArray(output)) {
    return output.filter(isPreviewRow);
  }

  if (isPreviewRow(output) && Array.isArray(output.rows)) {
    return output.rows.filter(isPreviewRow);
  }

  if (typeof output === 'string') {
    try {
      const parsed = JSON.parse(output) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter(isPreviewRow);
      }
      if (isPreviewRow(parsed) && Array.isArray(parsed.rows)) {
        return parsed.rows.filter(isPreviewRow);
      }
    } catch {
      return [];
    }
  }

  return [];
}

function getRowText(row: PreviewRow, key: string): string {
  return stringifyUnknown(row[key]);
}

function hasRowValue(row: PreviewRow, key: string): boolean {
  const value = row[key];
  return value !== undefined && value !== null && value !== '';
}

export const ResultPreview = ({ output }: ResultPreviewProps) => {
  if (output === undefined || output === null) return null;

  const rows = parseRows(output);

  // Try to parse as JSON for tree view
  let jsonObj: any = null;
  if (typeof output === 'object') {
    jsonObj = output;
  } else if (typeof output === 'string') {
    try {
      const parsed = JSON.parse(output);
      if (typeof parsed === 'object' && parsed !== null) {
        jsonObj = parsed;
      }
    } catch {
      // Not JSON
    }
  }

  return (
    <div className="p-0 max-h-[160px] overflow-auto text-[10px] font-mono custom-scrollbar">
      {(() => {
        if (!output)
          return <div className="p-2 italic text-gray-600 uppercase tracking-widest text-[9px]">Empty_Result</div>;

        // 0. Detect Image URL
        if (
          typeof output === "string" &&
          output.startsWith("http") &&
          (output.includes("openai.com") ||
            output.match(/\.(jpeg|jpg|gif|png)$/) !== null)
        ) {
          return (
            <div className="relative group p-1">
              <img
                src={output}
                alt="Generated"
                className="w-full h-auto rounded border border-white/10 hover:border-cyber-primary/50 transition-all cursor-zoom-in"
                onClick={() => window.open(output, "_blank")}
              />
              <div className="absolute inset-0 bg-cyber-primary/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
            </div>
          );
        }

        // 1. Detect Boolean
        if (typeof output === "boolean") {
          return (
            <div className="flex items-center justify-center py-4 bg-black/20">
              <CyberBadge 
                label={output ? "TRUE" : "FALSE"} 
                variant={output ? "success" : "error"}
                size="sm"
                className="px-4 py-1.5"
              />
            </div>
          );
        }

        // 2. JSON Tree View (Priority for structured objects)
        if (jsonObj) {
          return (
            <div className="bg-black/20 p-2 rounded">
              <JsonViewer
                value={jsonObj}
                theme="dark"
                rootName={false}
                displayDataTypes={false}
                style={{
                  backgroundColor: 'transparent',
                  fontSize: '9px',
                }}
                defaultInspectDepth={1}
              />
            </div>
          );
        }

        // 3. Detect List Shape
        if (
          rows.length > 0 &&
          isPreviewRow(rows[0])
        ) {
          const r0 = rows[0];
          if ("title" in r0 || "snippet" in r0 || "text" in r0) {
            return (
              <div className="space-y-2">
                {rows.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="pb-2 border-b border-white/5 last:border-0 last:pb-0 group"
                  >
                    {hasRowValue(item, 'title') && (
                      <div className="text-cyber-primary truncate font-bold group-hover:text-cyan-300 transition-colors">
                        {getRowText(item, 'title')}
                      </div>
                    )}
                    {hasRowValue(item, 'link') && (
                      <div className="text-[8px] text-gray-500 truncate mb-1">
                        {getRowText(item, 'link')}
                      </div>
                    )}
                    <div className="text-gray-400 line-clamp-3 text-[9px] leading-snug">
                      {item.snippet
                        ? getRowText(item, 'snippet')
                        : item.text
                          ? getRowText(item, 'text')
                          : item.content
                            ? getRowText(item, 'content')
                            : stringifyUnknown(item)}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
        }

        // 4. Fallback
        const text = stringifyUnknown(output);
        return (
          <div className="whitespace-pre-wrap line-clamp-[12] break-all leading-normal">
            {text}
          </div>
        );
      })()}
    </div>
  );
};
