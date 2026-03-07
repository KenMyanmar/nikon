import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EDGE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/import-products`;

type ImportStatus = {
  loading: boolean;
  result: null | { success: boolean; inserted?: number; updated?: number; errors?: string[]; error?: string };
};

const SECTIONS = [
  { key: "groups", label: "Product Groups", columns: "code, name" },
  { key: "categories", label: "Categories", columns: "name, slug, group_code" },
  { key: "brands", label: "Brands", columns: "name, slug" },
  { key: "products", label: "Products", columns: "stock_code, description, category, brand, group_code, ..." },
] as const;

export default function AdminImport() {
  const [apiKey, setApiKey] = useState("ikon-import-2026");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [statuses, setStatuses] = useState<Record<string, ImportStatus>>({});

  const handleImport = async (table: string) => {
    const file = files[table];
    if (!file) return;

    setStatuses((s) => ({ ...s, [table]: { loading: true, result: null } }));

    try {
      const text = await file.text();
      const res = await fetch(`${EDGE_URL}?table=${table}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/csv",
          "x-import-key": apiKey,
        },
        body: text,
      });
      const data = await res.json();
      setStatuses((s) => ({ ...s, [table]: { loading: false, result: data } }));
    } catch (e: any) {
      setStatuses((s) => ({
        ...s,
        [table]: { loading: false, result: { success: false, error: e.message } },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin — CSV Import</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">API Key (X-Import-Key)</label>
        <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="max-w-md" />
      </div>

      {SECTIONS.map(({ key, label, columns }) => {
        const status = statuses[key];
        return (
          <div key={key} className="mb-6 p-4 bg-white rounded border">
            <h2 className="font-semibold text-lg">{label}</h2>
            <p className="text-xs text-gray-500 mb-2">CSV columns: {columns}</p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) =>
                  setFiles((f) => ({ ...f, [key]: e.target.files?.[0] || null }))
                }
                className="text-sm"
              />
              <Button
                onClick={() => handleImport(key)}
                disabled={!files[key] || status?.loading}
                size="sm"
              >
                {status?.loading ? "Importing..." : "Import"}
              </Button>
            </div>
            {status?.result && (
              <div
                className={`mt-2 text-sm p-2 rounded ${
                  status.result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                {status.result.success
                  ? `✓ ${status.result.inserted || 0} rows processed`
                  : `✗ ${status.result.error}`}
                {status.result.errors && status.result.errors.length > 0 && (
                  <ul className="mt-1 list-disc pl-4">
                    {status.result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
