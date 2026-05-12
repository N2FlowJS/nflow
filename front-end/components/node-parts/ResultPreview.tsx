import React from "react";
import { stringifyUnknown } from '../../lib/utils';

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

  return (
    <div className="p-2 max-h-[180px] overflow-auto text-[10px] font-mono text-gray-300 custom-scrollbar">
      {(() => {
        if (!output)
          return <span className="italic text-gray-600">Empty response</span>;

        // 0. Detect Image URL
        if (
          typeof output === "string" &&
          output.startsWith("http") &&
          (output.includes("openai.com") ||
            output.match(/\.(jpeg|jpg|gif|png)$/) !== null)
        ) {
          return (
            <div className="relative group">
              <img
                src={output}
                alt="Generated"
                className="w-full h-auto rounded border border-white/10 hover:border-cyber-primary/50 transition-colors shadow-lg cursor-pointer"
                onClick={() => window.open(output, "_blank")}
              />
              <div className="absolute inset-0 bg-cyber-primary/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
            </div>
          );
        }

        // 1. Detect Boolean
        if (typeof output === "boolean") {
          return (
            <div
              className={`text-center py-2 font-bold ${output ? "text-green-400" : "text-red-400"}`}
            >
              {output ? "TRUE" : "FALSE"}
            </div>
          );
        }

        // 2. Detect Table Shape
        let cols: string[] = [];

        if (
          rows.length > 0 &&
          isPreviewRow(rows[0])
        ) {
          cols = Object.keys(rows[0])
            .filter(
              (k) => typeof rows[0][k] !== "object" || rows[0][k] === null,
            )
            .slice(0, 4);
          if (cols.length > 0) {
            return (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 text-[9px]">
                    {cols.map((c) => (
                      <th
                        key={c}
                        className="text-left px-1 py-0.5 font-bold uppercase"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                    >
                      {cols.map((c) => (
                        <td key={c} className="px-1 py-1 truncate max-w-[80px]">
                          {String(r[c] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length > 5 && (
                    <tr>
                      <td
                        colSpan={cols.length}
                        className="text-center py-1 opacity-40 text-[9px]"
                      >
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
