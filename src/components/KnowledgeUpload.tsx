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
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-bright">
          Upload Content
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Add files, URLs, or text to your knowledge base.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <UploadIcon size={16} className="text-text-muted" />
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
    try {
      for (const file of files) {
        await uploadFile(file);
      }
      addToast(`${files.length} file(s) uploaded successfully`, "success");
      setFiles([]);
      setActiveView("knowledge-list");
    } catch {
      addToast("Failed to upload files", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropzone onFiles={handleFiles} />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 px-3 py-2 bg-surface-hi rounded-[var(--radius-md)]"
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
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setUploading(true);
    try {
      await uploadUrl(url, name || undefined);
      addToast("URL added successfully", "success");
      setUrl("");
      setName("");
      setActiveView("knowledge-list");
    } catch {
      addToast("Failed to add URL", "error");
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
        label="Name (optional)"
        type="text"
        placeholder="Give this source a name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={uploading}
          disabled={!url}
        >
          Add URL
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
      await uploadText(content, name);
      addToast("Text added successfully", "success");
      setName("");
      setContent("");
      setActiveView("knowledge-list");
    } catch {
      addToast("Failed to add text", "error");
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
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={uploading}
          disabled={!name || !content}
        >
          Add text
        </Button>
      </div>
    </form>
  );
}
