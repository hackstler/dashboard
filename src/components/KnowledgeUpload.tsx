import { useState } from "react";
import { useApp } from "../context/AppContext";
import { uploadFile, uploadUrl, uploadText } from "../api/knowledge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Tabs } from "./ui/Tabs";
import { FileDropzone } from "./ui/FileDropzone";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
  UploadIcon,
  LinkIcon,
  TypeIcon,
  FileTextIcon,
  XIcon,
} from "./ui/Icons";
import { formatBytes } from "../utils/format";

const tabs = [
  { id: "file", label: "File Upload" },
  { id: "url", label: "URL" },
  { id: "text", label: "Text" },
];

export function KnowledgeUpload() {
  const { addToast, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState("file");

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-semibold gradient-text">
          Upload Content
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Add files, URLs, or text to your knowledge base for indexing.
        </p>
      </div>

      <Card className="max-w-2xl gradient-border animate-fade-in-up stagger-1">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-accent-dim flex items-center justify-center">
              <UploadIcon size={14} className="text-accent" />
            </div>
            <CardTitle>New Source</CardTitle>
          </div>
          <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
        </CardHeader>
        <CardContent>
          {activeTab === "file" && (
            <FileUploadTab addToast={addToast} setActiveView={setActiveView} />
          )}
          {activeTab === "url" && (
            <UrlUploadTab addToast={addToast} setActiveView={setActiveView} />
          )}
          {activeTab === "text" && (
            <TextUploadTab addToast={addToast} setActiveView={setActiveView} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FileUploadTab({
  addToast,
  setActiveView,
}: {
  addToast: (msg: string, type: "success" | "error" | "info") => void;
  setActiveView: (view: "knowledge-list") => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    try {
      for (const file of files) {
        const result = await uploadFile(file);
        if (result.status === "indexed") {
          successCount++;
        } else {
          addToast(
            `Failed to process ${file.name}: ${result.error ?? "unknown error"}`,
            "error"
          );
        }
      }
      if (successCount > 0) {
        addToast(
          `${successCount} file(s) uploaded and indexed`,
          "success"
        );
      }
      setFiles([]);
      setActiveView("knowledge-list");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to upload files",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropzone
        onFiles={handleFiles}
        accept=".pdf,.md,.mdx,.html,.htm,.txt"
        maxSizeMB={50}
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 px-3 py-2 bg-surface-hi rounded-[var(--radius-md)] animate-fade-in"
            >
              <FileTextIcon size={16} className="text-text-muted shrink-0" />
              <span className="text-sm text-text truncate flex-1">
                {file.name}
              </span>
              <span className="text-xs text-text-dim shrink-0">
                {formatBytes(file.size)}
              </span>
              <button
                onClick={() => removeFile(i)}
                className="text-text-dim hover:text-text-muted transition-colors cursor-pointer shrink-0"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <Badge>{files.length} file(s) selected</Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={uploading}
            >
              Upload all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function UrlUploadTab({
  addToast,
  setActiveView,
}: {
  addToast: (msg: string, type: "success" | "error" | "info") => void;
  setActiveView: (view: "knowledge-list") => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setUploading(true);
    try {
      const result = await uploadUrl(url, title || undefined);
      if (result.status === "indexed") {
        addToast("URL ingested and indexed successfully", "success");
      } else {
        addToast(`Ingestion failed: ${result.error ?? "unknown error"}`, "error");
      }
      setUrl("");
      setTitle("");
      setActiveView("knowledge-list");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to ingest URL",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="URL"
        type="url"
        placeholder="https://example.com/docs"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        icon={<LinkIcon size={16} />}
      />
      <Input
        label="Title (optional)"
        type="text"
        placeholder="Override the auto-detected title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={uploading}
          disabled={!url}
        >
          Ingest URL
        </Button>
      </div>
    </form>
  );
}

function TextUploadTab({
  addToast,
  setActiveView,
}: {
  addToast: (msg: string, type: "success" | "error" | "info") => void;
  setActiveView: (view: "knowledge-list") => void;
}) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;
    setUploading(true);
    try {
      const result = await uploadText(content, name);
      if (result.status === "indexed") {
        addToast("Text content uploaded and indexed", "success");
      } else {
        addToast(`Processing failed: ${result.error ?? "unknown error"}`, "error");
      }
      setName("");
      setContent("");
      setActiveView("knowledge-list");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to upload text",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        type="text"
        placeholder="Name for this text source"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={<TypeIcon size={16} />}
      />
      <Textarea
        label="Content"
        placeholder="Paste or type your content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        charCount
      />
      <p className="text-xs text-text-dim">
        Text will be uploaded as a .txt file and processed by the ingestion
        pipeline.
      </p>
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={uploading}
          disabled={!name || !content}
        >
          Upload text
        </Button>
      </div>
    </form>
  );
}
