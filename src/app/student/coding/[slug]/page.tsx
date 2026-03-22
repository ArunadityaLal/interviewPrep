"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  tags: string[];
  constraints: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  starterCode: { c: string; cpp: string; sql: string };
  hints: string[];
}
interface TestResult {
  testCase: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  isHidden: boolean;
  error?: string;
}
interface SubmissionResult {
  status: string;
  testsPassed: number;
  totalTests: number;
  results: TestResult[];
  runtime?: number;
  errorOutput?: string;
}
type Language = "c" | "cpp" | "sql";
type LeftTab  = "description" | "submissions" | "hints";
type BotTab   = "testcase" | "result";

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#3d3d3d] text-[#eff1f6bf] text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-[#ffffff14]">
        {label}
      </div>
    </div>
  );
}

const DIFF: Record<string, { label: string; cls: string }> = {
  EASY:   { label: "Easy",   cls: "text-[#00b8a3] bg-[#00b8a3]/10" },
  MEDIUM: { label: "Medium", cls: "text-[#ffa116] bg-[#ffa116]/10" },
  HARD:   { label: "Hard",   cls: "text-[#ff375f] bg-[#ff375f]/10" },
};
const STATUS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ACCEPTED:            { label: "Accepted",            color: "text-[#00b8a3]", bg: "bg-[#00b8a3]/10 border-[#00b8a3]/30", icon: "✓" },
  WRONG_ANSWER:        { label: "Wrong Answer",        color: "text-[#ff375f]", bg: "bg-[#ff375f]/10 border-[#ff375f]/30", icon: "✗" },
  RUNTIME_ERROR:       { label: "Runtime Error",       color: "text-[#f8a744]", bg: "bg-[#f8a744]/10 border-[#f8a744]/30", icon: "💥" },
  COMPILE_ERROR:       { label: "Compile Error",       color: "text-[#ff375f]", bg: "bg-[#ff375f]/10 border-[#ff375f]/30", icon: "⚠" },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit Exceeded", color: "text-[#ffa116]", bg: "bg-[#ffa116]/10 border-[#ffa116]/30", icon: "⏱" },
  PENDING:             { label: "Running...",          color: "text-[#5b9eff]", bg: "bg-[#5b9eff]/10 border-[#5b9eff]/30", icon: "⟳" },
};

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMd(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#eff1f6bf]">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="text-[#a8b3cf] bg-[#ffffff14] px-1.5 py-0.5 rounded text-[12px] font-mono">$1</code>')
    .replace(/^## (.+)$/gm, '<h2 class="text-[14px] font-semibold text-[#eff1f6bf] mt-5 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-[13px] font-medium text-[#a8b3cf] mt-3 mb-1">$1</h3>')
    .replace(/^[•\-] (.+)$/gm, '<div class="flex gap-2 my-1.5 ml-1"><span class="text-[#a8b3cf] shrink-0">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<div class="my-3"></div>')
    .replace(/\n/g, "<br/>");
}

// ─── Drag Dividers ────────────────────────────────────────────────────────────
function VDivider({ onDrag }: { onDrag: (dx: number) => void }) {
  const active = useRef(false), last = useRef(0);
  const onDown = (e: React.MouseEvent) => {
    active.current = true; last.current = e.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (!active.current) return; onDrag(e.clientX - last.current); last.current = e.clientX; };
    const up   = () => { active.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [onDrag]);
  return (
    <div onMouseDown={onDown} className="w-[4px] shrink-0 cursor-col-resize hover:bg-[#5b9eff]/40 transition-colors bg-transparent group">
      <div className="w-[4px] h-full" />
    </div>
  );
}

function HDivider({ onDrag }: { onDrag: (dy: number) => void }) {
  const active = useRef(false), last = useRef(0);
  const onDown = (e: React.MouseEvent) => {
    active.current = true; last.current = e.clientY;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (!active.current) return; onDrag(e.clientY - last.current); last.current = e.clientY; };
    const up   = () => { active.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [onDrag]);
  return (
    <div onMouseDown={onDown} className="h-[4px] shrink-0 cursor-row-resize hover:bg-[#5b9eff]/40 transition-colors bg-transparent" />
  );
}

// ─── Single Submission Row ────────────────────────────────────────────────────
function SubmissionRow({ s }: { s: any }) {
  const [expanded, setExpanded] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const st = STATUS[s.status] || STATUS["PENDING"];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(s.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`rounded-lg border overflow-hidden ${st.bg}`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`text-[13px] font-bold ${st.color}`}>{st.icon} {st.label}</span>
          <span className="text-[11px] bg-[#ffffff0f] px-2 py-0.5 rounded font-mono text-[#a8b3cf]">
            {s.language?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#a8b3cf]">
            {new Date(s.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center gap-1.5 text-[11px] text-[#a8b3cf] hover:text-white bg-[#ffffff0f] hover:bg-[#ffffff1f] border border-[#ffffff14] px-2.5 py-1 rounded transition-all select-none"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            {expanded ? "Hide Code" : "View Code"}
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="flex gap-4 px-4 pb-3 text-[12px] text-[#a8b3cf]">
        <span className={`font-semibold ${s.testsPassed === s.totalTests ? "text-[#00b8a3]" : "text-[#ff375f]"}`}>
          {s.testsPassed}/{s.totalTests} tests passed
        </span>
        {s.runtime != null && <span>⏱ {s.runtime}ms</span>}
      </div>

      {/* ── Code block ── */}
      {expanded && (
        <div className="border-t border-[#ffffff14]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d1a]">
            <span className="text-[11px] text-[#a8b3cf] font-medium uppercase tracking-wider">
              Submitted Code
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[11px] text-[#a8b3cf] hover:text-white transition-colors"
            >
              {copied
                ? <><svg className="w-3 h-3 text-[#00b8a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span className="text-[#00b8a3]">Copied!</span></>
                : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy</>
              }
            </button>
          </div>
          {s.code
            ? <pre className="px-4 py-3 bg-[#0d0d1a] text-[12px] font-mono text-[#c9d1d9] overflow-x-auto max-h-72 overflow-y-auto leading-relaxed whitespace-pre">{s.code}</pre>
            : <div className="px-4 py-4 bg-[#0d0d1a] text-[12px] text-[#6b7280] italic">Code not available</div>
          }
        </div>
      )}
    </div>
  );
}

// ─── Submissions Tab ──────────────────────────────────────────────────────────
function SubmissionsTab({ prevSubs }: { prevSubs: any[] }) {
  if (prevSubs.length === 0) {
    return (
      <div className="text-center py-16 text-[#a8b3cf]">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
        </svg>
        <p className="text-[13px]">No submissions yet</p>
        <p className="text-[11px] mt-1 opacity-60">Submit your code to see history here</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[15px] font-semibold text-white mb-4">Submission History</h3>
      <div className="space-y-3">
        {prevSubs.map((s: any) => (
          <SubmissionRow key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CodingProblemPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.slug as string;
  const wrapRef = useRef<HTMLDivElement>(null);

  // Panel sizing
  const [leftPct,   setLeftPct]   = useState(40);   // % of total width
  const [botHeight, setBotHeight] = useState(260);   // px

  // Data
  const [question,      setQuestion]      = useState<Question | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [language,      setLanguage]      = useState<Language>("cpp");
  const [code,          setCode]          = useState("");
  const [leftTab,       setLeftTab]       = useState<LeftTab>("description");
  const [botTab,        setBotTab]        = useState<BotTab>("testcase");
  const [customInput,   setCustomInput]   = useState("");
  const [consoleOut,    setConsoleOut]    = useState("");
  const [running,       setRunning]       = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [submission,    setSubmission]    = useState<SubmissionResult | null>(null);
  const [isSolved,      setIsSolved]      = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [prevSubs,      setPrevSubs]      = useState<any[]>([]);

  // Active test case tab in bottom panel
  const [activeCase, setActiveCase] = useState(0);

  // Editor toolbar state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [saveStatus,   setSaveStatus]   = useState<"saved" | "saving">("saved");
  const [cursorPos,    setCursorPos]    = useState({ line: 1, col: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Mark unsaved on code change, auto-save after 1s
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  const handleCodeChange = useCallback((val: string | undefined) => {
    const v = val ?? "";
    setCode(v);
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus("saved"), 1000);
  }, []);

  // ── Custom C/C++ code formatter ────────────────────────────────────────────
  const formatCppCode = (src: string): string => {
    const lines = src.split("\n");
    let indent  = 0;
    const TAB   = "    "; // 4 spaces
    const out: string[] = [];

    for (let raw of lines) {
      let line = raw.trim();
      if (!line) { out.push(""); continue; }

      // Decrease indent BEFORE printing closing braces
      if (line.startsWith("}") || line.startsWith(")") || line.startsWith("]")) {
        indent = Math.max(0, indent - 1);
      }

      out.push(TAB.repeat(indent) + line);

      // Count net open braces on this line (ignore those inside strings/comments)
      let opens  = 0;
      let closes = 0;
      let inStr  = false;
      let strCh  = "";
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inStr) {
          if (ch === strCh && line[i - 1] !== "\\") inStr = false;
        } else if (ch === '"' || ch === "'") {
          inStr = true; strCh = ch;
        } else if (ch === "/" && line[i + 1] === "/") {
          break; // rest is comment
        } else if (ch === "{" || ch === "(" || ch === "[") {
          opens++;
        } else if (ch === "}" || ch === ")" || ch === "]") {
          closes++;
        }
      }

      // Only increase for lines that end with { or where opens > closes
      const trimEnd = line.trimEnd();
      if (trimEnd.endsWith("{") || trimEnd.endsWith("(") || trimEnd.endsWith("[")) {
        indent++;
      } else if (opens > closes) {
        indent += opens - closes;
      }
    }
    return out.join("\n");
  };

  const handleFormat = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentCode = editor.getValue();
    const formatted   = formatCppCode(currentCode);

    // Use Monaco edit operation so Ctrl+Z (undo) still works
    const model = editor.getModel();
    if (!model) return;
    const fullRange = model.getFullModelRange();
    editor.executeEdits("format", [{
      range:       fullRange,
      text:        formatted,
      forceMoveMarkers: true,
    }]);
    editor.focus();
  }, []);

  // Reset to starter code
  const handleReset = () => {
    if (!question) return;
    if (confirm("Reset to starter code? Your changes will be lost.")) {
      setCode(question.starterCode[language] || "");
      setSaveStatus("saved");
    }
  };

  // Fullscreen toggle
  const handleFullscreen = () => setIsFullscreen(f => !f);

  useEffect(() => { loadQuestion(); }, [slug]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const qRes = await fetch(`/api/coding/questions/${slug}`);
      if (!qRes.ok) { router.push("/student/coding"); return; }
      const d = await qRes.json();

      setQuestion(d.question);
      setIsSolved(d.isSolved);
      setCode(d.question.starterCode?.cpp || "");
      if (d.question.testCases?.length) {
        setCustomInput(d.question.testCases[0].input || "");
      }

      // Fetch submissions with `code` field from dedicated submissions API
      const subRes = await fetch(`/api/coding/submissions?questionId=${d.question.id}`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setPrevSubs(subData.submissions || []);
      } else {
        setPrevSubs(d.submissions || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (question) { setCode(question.starterCode[language] || ""); setSubmission(null); }
  }, [language, question]);

  const handleVDrag = useCallback((dx: number) => {
    if (!wrapRef.current) return;
    const w = wrapRef.current.offsetWidth;
    setLeftPct(p => Math.min(65, Math.max(25, p + (dx / w) * 100)));
  }, []);
  const handleHDrag = useCallback((dy: number) => {
    setBotHeight(p => Math.min(520, Math.max(100, p - dy)));
  }, []);

  const handleRun = async () => {
    if (!question || !code.trim()) return;
    setRunning(true);
    setBotTab("result");
    // Show pending state while running
    setSubmission({ status: "PENDING", testsPassed: 0, totalTests: 0, results: [] });
    try {
      const res = await fetch("/api/coding/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          stdin: customInput,
          questionId: question.id, // ← pass questionId so API runs test cases
        }),
      });
      const d = await res.json();
      if (res.ok) {
        if (d.mode === "testcases") {
          // Show test case results in result panel (same as submit)
          setSubmission({
            status:      d.status,
            testsPassed: d.testsPassed,
            totalTests:  d.totalTests,
            results:     d.results,
            errorOutput: d.errorOutput,
          });
          setConsoleOut("");
        } else {
          // Custom stdin fallback
          let out = "";
          if (d.error)  out += `Stderr:\n${d.error}\n\n`;
          if (d.output) out += d.output;
          if (!out) out = d.success ? "(no output)" : "Program exited with error.";
          setConsoleOut(out.trim());
          setSubmission(null);
        }
      } else {
        setSubmission(null);
        setConsoleOut(`Error: ${d.error}`);
      }
    } catch (e: any) {
      setSubmission(null);
      setConsoleOut(`Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question || !code.trim()) return;
    setSubmitting(true);
    setSubmission({ status: "PENDING", testsPassed: 0, totalTests: 0, results: [] });
    setBotTab("result");
    try {
      const res = await fetch("/api/coding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, language, code }),
      });
      const d = await res.json();
      if (res.ok) {
        // API returns { submission: {...}, results: [...], passed: bool }
        const sub = d.submission || d;
        setSubmission({
          status:      sub.status,
          testsPassed: sub.testsPassed,
          totalTests:  sub.totalTests,
          results:     d.results || [],
          runtime:     sub.runtime,
          errorOutput: d.errorOutput,
        });
        if (sub.status === "ACCEPTED") {
          setIsSolved(true);
          loadQuestion(); // refresh submissions list
        } else {
          loadQuestion(); // refresh submissions list even on failure
        }
      } else {
        setSubmission(null);
        setConsoleOut(`Error: ${d.error}`);
      }
    } catch (e: any) {
      setSubmission(null);
      setConsoleOut(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#a8b3cf] text-sm">Loading problem…</p>
      </div>
    </div>
  );
  if (!question) return null;

  const diff = DIFF[question.difficulty] || DIFF.EASY;

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col overflow-hidden"
      style={{ fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif", color: "#eff1f6bf" }}>

      {/* ═══════════════════════════════════════
          TOP NAV BAR  (LeetCode-style)
      ═══════════════════════════════════════ */}
      <nav className="h-[50px] bg-[#282828] border-b border-[#ffffff1a] flex items-center px-4 gap-3 shrink-0 z-10">

        {/* Logo */}
        <Link href="/student/coding" className="flex items-center gap-2 mr-1 group">
          <div className="w-7 h-7 bg-[#ffa116] rounded-sm flex items-center justify-center font-black text-[14px] text-black">I</div>
        </Link>

        {/* Problem List link */}
        <Link href="/student/coding" className="flex items-center gap-1.5 text-[#eff1f6bf] hover:text-white text-[13px] font-medium transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7"/>
          </svg>
          Problem List
        </Link>

        {/* Prev / Next arrows */}
        <div className="flex items-center gap-0.5 ml-1">
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#ffffff14] text-[#a8b3cf] hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#ffffff14] text-[#a8b3cf] hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div className="flex-1" />

        {/* Run button */}
        <button onClick={handleRun} disabled={running || submitting}
          className="flex items-center gap-2 px-4 py-1.5 rounded text-[13px] font-medium text-[#eff1f6bf] bg-[#ffffff14] hover:bg-[#ffffff1f] border border-[#ffffff1a] transition-all disabled:opacity-50 select-none">
          {running
            ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            : <svg className="w-3.5 h-3.5 text-[#00b8a3]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          }
          Run
        </button>

        {/* Submit button */}
        <button onClick={handleSubmit} disabled={submitting || running}
          className="flex items-center gap-2 px-4 py-1.5 rounded text-[13px] font-semibold text-white bg-[#00b8a3] hover:bg-[#00a896] transition-all disabled:opacity-50 select-none">
          {submitting
            ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          }
          Submit
        </button>

        {/* Solved indicator */}
        {isSolved && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] text-[#00b8a3] bg-[#00b8a3]/10 border border-[#00b8a3]/20">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            Solved
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════
          MAIN BODY
      ═══════════════════════════════════════ */}
      <div ref={wrapRef} className="flex flex-1 min-h-0 overflow-hidden bg-[#1a1a1a] py-2 px-2 gap-0">

        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col bg-[#282828] rounded-lg overflow-hidden border border-[#ffffff1a]"
          style={{ width: `${leftPct}%` }}>

          {/* Left Tabs  (Description | Submissions | Hints) */}
          <div className="flex border-b border-[#ffffff1a] shrink-0 bg-[#1e1e1e] px-2 pt-0">
            {(["description", "submissions", "hints"] as LeftTab[]).map(tab => (
              <button key={tab} onClick={() => setLeftTab(tab)}
                className={`px-3 py-3 text-[13px] font-medium capitalize border-b-2 transition-colors ${
                  leftTab === tab
                    ? "text-white border-[#ffa116]"
                    : "text-[#a8b3cf] border-transparent hover:text-[#eff1f6bf]"
                }`}>
                {tab === "hints" && question.hints?.length > 0
                  ? <>Hints <span className="ml-1 text-[10px] bg-[#ffa116]/20 text-[#ffa116] px-1.5 py-0.5 rounded-full">{question.hints.length}</span></>
                  : tab.charAt(0).toUpperCase() + tab.slice(1)
                }
              </button>
            ))}
          </div>

          {/* Left scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 text-[14px] text-[#eff1f6bf]">

            {/* ── DESCRIPTION TAB ── */}
            {leftTab === "description" && (
              <div>
                {/* Title */}
                <h1 className="text-[22px] font-semibold text-white mb-3 leading-tight">{question.title}</h1>

                {/* Difficulty + Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className={`text-[12px] font-medium px-2.5 py-1 rounded ${diff.cls}`}>{diff.label}</span>
                  {question.tags.map(t => (
                    <span key={t} className="text-[12px] text-[#a8b3cf] bg-[#ffffff0f] border border-[#ffffff14] px-2.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>

                {/* Problem text */}
                <div className="leading-[1.7] text-[14px]"
                  dangerouslySetInnerHTML={{ __html: renderMd(question.description) }} />

                {/* Examples */}
                {question.examples?.length > 0 && (
                  <div className="mt-6 space-y-5">
                    {question.examples.map((ex, i) => (
                      <div key={i}>
                        <p className="font-semibold text-[#eff1f6bf] mb-2">Example {i + 1}:</p>
                        <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#ffffff14] font-mono text-[13px] leading-relaxed space-y-1">
                          <div><span className="text-[#a8b3cf] font-sans font-medium">Input: </span><span className="text-white">{ex.input}</span></div>
                          <div><span className="text-[#a8b3cf] font-sans font-medium">Output: </span><span className="text-white">{ex.output}</span></div>
                          {ex.explanation && (
                            <div className="pt-2 border-t border-[#ffffff0a] font-sans text-[13px] text-[#a8b3cf]">
                              <span className="font-medium text-[#eff1f6bf]">Explanation: </span>{ex.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {question.constraints && (
                  <div className="mt-6">
                    <p className="font-semibold text-[#eff1f6bf] mb-2">Constraints:</p>
                    <ul className="bg-[#1e1e1e] rounded-lg p-4 border border-[#ffffff14] space-y-1"
                      dangerouslySetInnerHTML={{ __html: renderMd(question.constraints) }} />
                  </div>
                )}
              </div>
            )}

            {/* ── SUBMISSIONS TAB ── */}
            {leftTab === "submissions" && (
              <SubmissionsTab prevSubs={prevSubs} />
            )}

            {/* ── HINTS TAB ── */}
            {leftTab === "hints" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[15px] font-semibold text-[#ffa116]">💡 Hints</span>
                  <span className="text-[12px] text-[#a8b3cf]">{revealedHints}/{question.hints.length} revealed</span>
                </div>
                {question.hints.length === 0
                  ? <p className="text-[#a8b3cf] text-[13px]">No hints available for this problem.</p>
                  : <div className="space-y-3">
                    {question.hints.map((hint, i) => (
                      i < revealedHints
                        ? <div key={i} className="bg-[#ffa116]/8 border border-[#ffa116]/20 rounded-lg p-4">
                            <p className="text-[11px] text-[#ffa116] font-semibold mb-2 uppercase tracking-wider">Hint {i + 1}</p>
                            <p className="text-[13px] text-[#eff1f6bf] leading-relaxed">{hint}</p>
                          </div>
                        : <button key={i} onClick={() => setRevealedHints(i + 1)}
                            className="w-full p-4 bg-[#ffffff05] border border-dashed border-[#ffffff1a] rounded-lg text-[13px] text-[#a8b3cf] hover:text-[#eff1f6bf] hover:border-[#ffa116]/30 transition-all text-left">
                            🔒 Click to reveal Hint {i + 1}
                          </button>
                    ))}
                  </div>
                }
              </div>
            )}
          </div>
        </div>

        {/* ── VERTICAL DIVIDER ── */}
        <VDivider onDrag={handleVDrag} />

        {/* ── RIGHT PANEL ── */}
        <div className={`flex flex-col min-w-0 gap-0 ml-2 ${isFullscreen ? "fixed inset-0 z-50 bg-[#1a1a1a] p-2" : "flex-1"}`}>

          {/* ── CODE EDITOR PANEL ── */}
          <div className="flex flex-col bg-[#282828] rounded-lg overflow-hidden border border-[#ffffff1a] flex-1 min-h-0">

            {/* Editor top bar — exactly like LeetCode */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#ffffff1a] bg-[#1e1e1e] shrink-0">

              {/* Left: </> Code label */}
              <div className="flex items-center gap-2 text-[#a8b3cf]">
                <svg className="w-4 h-4 text-[#5b9eff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
                <span className="text-[13px] font-medium text-[#eff1f6bf]">Code</span>
              </div>

              {/* Right: Language selector + 4 icon buttons */}
              <div className="flex items-center gap-1">

                {/* Language dropdown */}
                <select value={language} onChange={e => setLanguage(e.target.value as Language)}
                  className="px-2.5 py-1 mr-2 bg-[#2d2d2d] border border-[#ffffff1a] rounded text-[12px] text-[#eff1f6bf] focus:outline-none focus:border-[#ffa116] transition-colors cursor-pointer">
                  <option value="cpp">C++ ▾</option>
                  <option value="c">C ▾</option>
                  <option value="sql">SQL ▾</option>
                </select>

                {/* ── Bookmark ── */}
                <Tip label={isBookmarked ? "Remove bookmark" : "Bookmark"}>
                  <button onClick={() => setIsBookmarked(b => !b)}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors hover:bg-[#ffffff14] ${isBookmarked ? "text-[#ffa116]" : "text-[#a8b3cf]"}`}>
                    <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                  </button>
                </Tip>

                {/* ── Format code {} ── */}
                <Tip label="Format code">
                  <button onClick={handleFormat}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#a8b3cf] hover:text-[#eff1f6bf] hover:bg-[#ffffff14] transition-colors font-bold text-[15px]"
                    style={{ fontFamily: "monospace", letterSpacing: "-1px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "inherit", lineHeight: 1 }}>{"{}"}</span>
                  </button>
                </Tip>

                {/* ── Reset to starter code ↺ ── */}
                <Tip label="Reset to starter code">
                  <button onClick={handleReset}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#a8b3cf] hover:text-[#eff1f6bf] hover:bg-[#ffffff14] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                  </button>
                </Tip>

                {/* ── Fullscreen ↗ ── */}
                <Tip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                  <button onClick={handleFullscreen}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#a8b3cf] hover:text-[#eff1f6bf] hover:bg-[#ffffff14] transition-colors">
                    {isFullscreen
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                    }
                  </button>
                </Tip>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                onMount={(editor, monaco) => {
                  editorRef.current  = editor;
                  monacoRef.current  = monaco;
                  // Track cursor position
                  editor.onDidChangeCursorPosition(e => {
                    setCursorPos({ line: e.position.lineNumber, col: e.position.column });
                  });
                }}
                options={{
                  fontSize:                14,
                  fontFamily:              "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  fontLigatures:           true,
                  lineNumbers:             "on",
                  minimap:                 { enabled: false },
                  scrollBeyondLastLine:    false,
                  wordWrap:               "off",
                  tabSize:                 4,
                  bracketPairColorization: { enabled: true },
                  automaticLayout:         true,
                  smoothScrolling:         true,
                  cursorSmoothCaretAnimation: "on",
                  padding:                 { top: 16, bottom: 16 },
                  renderLineHighlight:     "gutter",
                  scrollbar:               { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
                  formatOnPaste:           true,
                  formatOnType:            false,
                }}
              />
            </div>

            {/* ── STATUS BAR (bottom of editor, like LeetCode/VSCode) ── */}
            <div className="flex items-center justify-between px-3 py-1 bg-[#1e1e1e] border-t border-[#ffffff0d] shrink-0">
              {/* Save status */}
              <div className="flex items-center gap-1.5">
                {saveStatus === "saving" ? (
                  <>
                    <svg className="w-3 h-3 text-[#a8b3cf] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span className="text-[11px] text-[#a8b3cf]">Saving…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 text-[#00b8a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    <span className="text-[11px] text-[#a8b3cf]">Saved</span>
                  </>
                )}
              </div>

              {/* Cursor position */}
              <span className="text-[11px] text-[#a8b3cf] font-mono">
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
            </div>
          </div>

          {/* ── HORIZONTAL DIVIDER ── */}
          <HDivider onDrag={handleHDrag} />

          {/* ── BOTTOM PANEL (Testcase / Test Result) ── */}
          <div className="bg-[#282828] rounded-lg overflow-hidden border border-[#ffffff1a] flex flex-col shrink-0 mt-2"
            style={{ height: `${botHeight}px` }}>

            {/* Bottom tab bar */}
            <div className="flex items-center border-b border-[#ffffff1a] bg-[#1e1e1e] px-3 shrink-0">
              {/* Testcase tab */}
              <button onClick={() => setBotTab("testcase")}
                className={`flex items-center gap-1.5 px-3 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                  botTab === "testcase" ? "text-white border-[#ffa116]" : "text-[#a8b3cf] border-transparent hover:text-[#eff1f6bf]"
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
                Testcase
              </button>

              {/* Test Result tab */}
              <button onClick={() => setBotTab("result")}
                className={`flex items-center gap-1.5 px-3 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                  botTab === "result" ? "text-white border-[#ffa116]" : "text-[#a8b3cf] border-transparent hover:text-[#eff1f6bf]"
                }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Test Result
                {submission && submission.status !== "PENDING" && (
                  <span className={`w-2 h-2 rounded-full ${submission.status === "ACCEPTED" ? "bg-[#00b8a3]" : "bg-[#ff375f]"}`} />
                )}
              </button>

              <div className="flex-1" />

              {/* Inline Run Code button */}
              {/* <button onClick={handleRun} disabled={running || submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#eff1f6bf] bg-[#ffffff0f] hover:bg-[#ffffff19] border border-[#ffffff1a] rounded transition-all disabled:opacity-50 select-none">
                {running
                  ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <svg className="w-3 h-3 text-[#00b8a3]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                }
                Run Code
              </button> */}
            </div>

            {/* Bottom content */}
            <div className="flex-1 overflow-y-auto p-4">

              {/* ── TESTCASE content ── */}
              {botTab === "testcase" && (
                <div>
                  {/* Case selector tabs (Case 1, Case 2, Case 3 …) */}
                  {question.testCases.filter(tc => !tc.isHidden).length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      {question.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
                        <button key={i} onClick={() => { setActiveCase(i); setCustomInput(tc.input); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded transition-all border ${
                            activeCase === i
                              ? "bg-[#ffffff14] border-[#ffffff30] text-white"
                              : "bg-transparent border-[#ffffff1a] text-[#a8b3cf] hover:text-[#eff1f6bf] hover:bg-[#ffffff0a]"
                          }`}>
                          {/* Green/Red dot based on submission result */}
                          {submission && submission.results?.[i] && (
                            <span className={`w-1.5 h-1.5 rounded-full ${submission.results[i].passed ? "bg-[#00b8a3]" : "bg-[#ff375f]"}`} />
                          )}
                          Case {i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input area */}
                  <div>
                    <p className="text-[12px] text-[#a8b3cf] mb-1.5 font-medium">Input</p>
                    <textarea
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      className="w-full h-20 bg-[#1e1e1e] border border-[#ffffff1a] rounded-lg px-3 py-2.5 text-[13px] font-mono text-[#eff1f6bf] placeholder-[#a8b3cf]/40 focus:outline-none focus:border-[#ffa116] resize-none transition-colors"
                      placeholder="Enter custom input…"
                    />
                  </div>

                  {/* Show run output below if available */}
                  {consoleOut && (
                    <div className="mt-3">
                      <p className="text-[12px] text-[#a8b3cf] mb-1.5 font-medium">Output</p>
                      <pre className="bg-[#1e1e1e] border border-[#ffffff1a] rounded-lg px-3 py-2.5 text-[13px] font-mono text-[#eff1f6bf] whitespace-pre-wrap">{consoleOut}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* ── RESULT content ── */}
              {botTab === "result" && (
                <>
                  {!submission && !submitting && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <svg className="w-12 h-12 mb-3 text-[#ffffff1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p className="text-[13px] text-[#a8b3cf]">Submit your solution to see results</p>
                    </div>
                  )}

                  {(submitting || submission?.status === "PENDING") && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                      <div className="w-7 h-7 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[13px] text-[#a8b3cf]">Judging your submission…</p>
                    </div>
                  )}

                  {submission && submission.status !== "PENDING" && (() => {
                    const st = STATUS[submission.status] || STATUS["PENDING"];
                    return (
                      <div>
                        {/* Status header */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border mb-4 ${st.bg}`}>
                          <span className={`text-[16px] font-bold ${st.color}`}>{st.icon}  {st.label}</span>
                          <div className="flex items-center gap-4 text-[13px]">
                            <span className={`font-semibold ${submission.testsPassed === submission.totalTests ? "text-[#00b8a3]" : "text-[#ff375f]"}`}>
                              {submission.testsPassed} / {submission.totalTests} cases passed
                            </span>
                            {submission.runtime && <span className="text-[#a8b3cf]">{submission.runtime}ms</span>}
                          </div>
                        </div>

                        {/* Compile / runtime error */}
                        {submission.errorOutput && (
                          <div className="mb-4 bg-[#ff375f]/8 border border-[#ff375f]/20 rounded-lg p-3.5">
                            <pre className="text-[12px] font-mono text-[#ff375f] whitespace-pre-wrap">{submission.errorOutput}</pre>
                          </div>
                        )}

                        {/* Test result badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {submission.results.map((r, i) => (
                            <button key={i} onClick={() => { setBotTab("testcase"); setActiveCase(i); if (!r.isHidden) setCustomInput(r.input); }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium border transition-all ${
                                r.passed
                                  ? "bg-[#00b8a3]/10 border-[#00b8a3]/25 text-[#00b8a3] hover:bg-[#00b8a3]/15"
                                  : "bg-[#ff375f]/10 border-[#ff375f]/25 text-[#ff375f] hover:bg-[#ff375f]/15"
                              }`}>
                              <span>{r.passed ? "✓" : "✗"}</span>
                              <span>{r.isHidden ? `Hidden ${r.testCase}` : `Case ${r.testCase}`}</span>
                            </button>
                          ))}
                        </div>

                        {/* Failed test detail */}
                        {submission.results.filter(r => !r.passed && !r.isHidden).slice(0, 1).map((r, i) => (
                          <div key={i} className="bg-[#1e1e1e] border border-[#ffffff14] rounded-lg overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-[#ffffff0a] text-[12px] text-[#a8b3cf] font-medium">
                              Failed Test Case {r.testCase}
                            </div>
                            <div className="p-4 space-y-3 font-mono text-[13px]">
                              <div>
                                <p className="text-[11px] text-[#a8b3cf] uppercase tracking-wider mb-1">Input</p>
                                <div className="bg-[#282828] rounded p-2.5 text-[#eff1f6bf]">{r.input}</div>
                              </div>
                              <div>
                                <p className="text-[11px] text-[#a8b3cf] uppercase tracking-wider mb-1">Expected Output</p>
                                <div className="bg-[#282828] rounded p-2.5 text-[#00b8a3]">{r.expectedOutput}</div>
                              </div>
                              <div>
                                <p className="text-[11px] text-[#a8b3cf] uppercase tracking-wider mb-1">Your Output</p>
                                <div className="bg-[#282828] rounded p-2.5 text-[#ff375f]">{r.actualOutput || "(empty)"}</div>
                              </div>
                              {r.error && (
                                <div>
                                  <p className="text-[11px] text-[#a8b3cf] uppercase tracking-wider mb-1">Stderr</p>
                                  <div className="bg-[#282828] rounded p-2.5 text-[#f8a744]">{r.error}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}