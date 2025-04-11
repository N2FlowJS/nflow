import React from "react";
import { Alert, Tabs, Table, Tooltip } from "antd";

const { TabPane } = Tabs;

interface FileContentViewerProps {
  content: string;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({ content }) => {
  try {
    // Try to parse as JSON first (for structured content)
    const parsed = JSON.parse(content);

    // Handle Markdown
    if (parsed.markdown && parsed.html) {
      return (
        <Tabs defaultActiveKey="markdown">
          <TabPane tab="Markdown" key="markdown">
            <div
              style={{
                maxHeight: "500px",
                overflow: "auto",
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                }}
              >
                {parsed.markdown}
              </pre>
            </div>
          </TabPane>
          <TabPane tab="HTML" key="html">
            <div
              style={{
                maxHeight: "500px",
                overflow: "auto",
                background: "#fff",
                padding: "15px",
                borderRadius: "5px",
                border: "1px solid #f0f0f0",
              }}
              dangerouslySetInnerHTML={{ __html: parsed.html }}
            />
          </TabPane>
          <TabPane tab="Raw" key="raw">
            <div
              style={{
                maxHeight: "500px",
                overflow: "auto",
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </div>
          </TabPane>
        </Tabs>
      );
    }

    // Handle Word documents
    if (
      parsed.text &&
      (parsed.warnings === undefined || Array.isArray(parsed.warnings))
    ) {
      return (
        <Tabs defaultActiveKey="text">
          <TabPane tab="Text Content" key="text">
            <div
              style={{
                maxHeight: "500px",
                overflow: "auto",
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                }}
              >
                {parsed.text}
              </pre>
            </div>
          </TabPane>
          {parsed.warnings && parsed.warnings.length > 0 && (
            <TabPane
              tab={`Warnings (${parsed.warnings.length})`}
              key="warnings"
            >
              <Alert
                message="Document Parse Warnings"
                description={
                  <ul>
                    {parsed.warnings.map((warning: any, index: number) => (
                      <li key={index}>
                        {warning.message || JSON.stringify(warning)}
                      </li>
                    ))}
                  </ul>
                }
                type="warning"
                showIcon
              />
            </TabPane>
          )}
          <TabPane tab="Raw" key="raw">
            <div
              style={{
                maxHeight: "500px",
                overflow: "auto",
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </div>
          </TabPane>
        </Tabs>
      );
    }

    // Handle Excel files (object with arrays for each sheet)
    if (typeof parsed === "object" && Object.keys(parsed).length > 0) {
      const firstSheetKey = Object.keys(parsed)[0];
      if (Array.isArray(parsed[firstSheetKey])) {
        return (
          <Tabs defaultActiveKey={firstSheetKey}>
            {Object.entries(parsed).map(([sheetName, rows]) => {
              if (!Array.isArray(rows) || rows.length === 0) {
                return (
                  <TabPane tab={sheetName} key={sheetName}>
                    <Alert
                      message="Empty sheet"
                      description="This sheet contains no data"
                      type="info"
                    />
                  </TabPane>
                );
              }

              // Extract columns from the first row
              const firstRow = rows[0];
              const columns = Object.keys(firstRow).map((key) => ({
                title: key,
                dataIndex: key,
                key: key,
                ellipsis: true,
                render: (text: string) => {
                  const stringValue = String(
                    text === null || text === undefined ? "" : text
                  );
                  return stringValue.length > 50 ? (
                    <Tooltip title={stringValue}>
                      {stringValue.slice(0, 50)}...
                    </Tooltip>
                  ) : (
                    stringValue
                  );
                },
              }));

              return (
                <TabPane
                  tab={`${sheetName} (${rows.length} rows)`}
                  key={sheetName}
                >
                  <div style={{ maxHeight: "500px", overflow: "auto" }}>
                    <Table
                      dataSource={rows.map((row, idx) => ({
                        ...row,
                        key: idx,
                      }))}
                      columns={columns}
                      size="small"
                      scroll={{ x: "max-content" }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                      }}
                    />
                  </div>
                </TabPane>
              );
            })}
            <TabPane tab="Raw Data" key="raw">
              <div
                style={{
                  maxHeight: "500px",
                  overflow: "auto",
                  background: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "5px",
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(parsed, null, 2)}
                </pre>
              </div>
            </TabPane>
          </Tabs>
        );
      }
    }

    // For other structured data
    return (
      <div
        style={{
          maxHeight: "500px",
          overflow: "auto",
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
          }}
        >
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    );
  } catch (e) {
    // Fallback for plain text
    return (
      <div
        style={{
          maxHeight: "500px",
          overflow: "auto",
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
          }}
        >
          {content}
        </pre>
      </div>
    );
  }
};

export default FileContentViewer;
