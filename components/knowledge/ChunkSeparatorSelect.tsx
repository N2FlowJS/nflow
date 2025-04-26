import React from "react";
import { Select, Form } from "antd";
export type ConfigChunk ={
    tokenChunk: number;
    chunkSeparator: string[];
  }
  
export const separatorOptions = [
    { label: 'Newline (\\n)', value: '\n' },
    { label: 'Carriage Return (\\r)', value: '\r' },
    { label: 'Tab (\\t)', value: '\t' },
    { label: 'Space ( )', value: ' ' },
    { label: 'Comma (,)', value: ',' },
    { label: 'Semicolon (;)', value: ';' },
    { label: 'Chinese Period (。)', value: '。' },
    { label: 'Chinese Comma (，)', value: '，' },
    { label: 'Chinese Question Mark (？)', value: '？' },
    { label: 'Chinese Exclamation Mark (！)', value: '！' },
    { label: 'Chinese Semicolon (；)', value: '；' },
    { label: 'Chinese Left Double Quotation Mark (“)', value: '“' },
    { label: 'Chinese Right Double Quotation Mark (”)', value: '”' },
];

export const renderSeparatorTokens = (separators: string[]) => {
    if (!Array.isArray(separators)) return null;
    return (
        <div style={{ marginTop: 8 }}>
            {separators.map((sep, idx) => (
                <span
                    key={idx}
                    style={{
                        display: 'inline-block',
                        background: '#f0f0f0',
                        borderRadius: 4,
                        padding: '2px 8px',
                        marginRight: 4,
                        fontFamily: 'monospace',
                        fontSize: 13,
                        border: '1px solid #d9d9d9',
                    }}
                >
                    {JSON.stringify(sep)}
                </span>
            ))}
        </div>
    );
};

interface ChunkSeparatorSelectProps {
    name: any;
    label?: string;
    tooltip?: string;
    rules?: any[];
    form?: any;
}

const ChunkSeparatorSelect: React.FC<ChunkSeparatorSelectProps> = ({
    name,
    label = "Chunk Separator",
    tooltip = "Characters used to divide text into chunks (e.g., ['\\n','\\r'] for paragraphs)",
    rules = [{ required: true, message: "Please enter chunk separator" }],
    form,
}) => {
    const chunkSeparator = form ? Form.useWatch(name, form) : undefined;

    return (
        <>
            <Form.Item
                name={name}
                label={label}
                tooltip={tooltip}
                rules={rules}
                getValueProps={(value) => ({
                    value: Array.isArray(value) ? value : typeof value === 'string' ? [value] : [],
                })}
                normalize={(value) => {
                    if (Array.isArray(value)) return value;
                    if (typeof value === 'string') return [value];
                    return [];
                }}
            >
                <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Enter or select chunk separators"
                    tokenSeparators={[]}
                    options={separatorOptions}
                />
            </Form.Item>
            {renderSeparatorTokens(chunkSeparator)}
        </>
    );
};

export default ChunkSeparatorSelect;
