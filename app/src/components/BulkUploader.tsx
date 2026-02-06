"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Papa from "papaparse";

export interface BulkEntry {
  student_name: string;
  course_name: string;
}

interface BulkUploaderProps {
  onParsed: (entries: BulkEntry[]) => void;
}

/**
 * Drag-and-drop zone that accepts CSV or JSON files containing
 * certificate data (student_name, course_name).
 */
export default function BulkUploader({ onParsed }: BulkUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    setFileName(file.name);

    const isCSV = file.name.endsWith(".csv");
    const isJSON = file.name.endsWith(".json");

    if (!isCSV && !isJSON) {
      setError("Please upload a .csv or .json file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;

        if (isJSON) {
          const data = JSON.parse(text);
          if (!Array.isArray(data)) {
            setError("JSON must be an array of objects");
            return;
          }
          const entries: BulkEntry[] = data.map((row: any) => ({
            student_name: row.student_name || row.studentName || row.name || "",
            course_name: row.course_name || row.courseName || row.course || "",
          }));
          const valid = entries.filter(
            (e) => e.student_name && e.course_name
          );
          if (valid.length === 0) {
            setError(
              "No valid entries found. Ensure each object has student_name and course_name."
            );
            return;
          }
          onParsed(valid);
        } else {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              const entries: BulkEntry[] = (result.data as any[]).map(
                (row: any) => ({
                  student_name:
                    row.student_name || row.studentName || row.name || "",
                  course_name:
                    row.course_name || row.courseName || row.course || "",
                })
              );
              const valid = entries.filter(
                (e) => e.student_name && e.course_name
              );
              if (valid.length === 0) {
                setError(
                  "No valid rows. CSV needs student_name and course_name columns."
                );
                return;
              }
              onParsed(valid);
            },
            error: () => setError("Failed to parse CSV"),
          });
        }
      } catch {
        setError("Failed to read file contents");
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  return (
    <div>
      <div
        className={`drop-zone ${dragActive ? "active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={handleChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "var(--accent-cyan-dim)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          {fileName ? (
            <p className="text-sm" style={{ color: "var(--accent-cyan)" }}>
              {fileName}
            </p>
          ) : (
            <>
              <p
                className="text-sm"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Drop your CSV or JSON file here
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Columns: <code className="mono">student_name</code>,{" "}
                <code className="mono">course_name</code>
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
