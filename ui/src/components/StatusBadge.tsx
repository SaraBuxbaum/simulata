import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export enum RunStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  RUNNING = 'running',
}

const STATUS_STYLES: Record<RunStatus, { bg: string; text: string; icon: any }> = {
  [RunStatus.PASSED]: {
    bg: "bg-[#E2F0D9] border border-[#B4C6E7]/20",
    text: "text-[#385723]",
    icon: CheckCircle2,
  },
  [RunStatus.FAILED]: {
    bg: "bg-[#FCE4D6] border border-[#F8CBAD]/30",
    text: "text-[#C65911]",
    icon: XCircle,
  },
  [RunStatus.RUNNING]: {
    bg: "bg-blue-50 border border-blue-200/50",
    text: "text-blue-600",
    icon: Loader2,
  },
};

function toRunStatus(raw: string): RunStatus {
  if (raw === RunStatus.PASSED) return RunStatus.PASSED;
  if (raw === RunStatus.RUNNING || raw === 'pending' || raw === 'queued') return RunStatus.RUNNING;
  return RunStatus.FAILED;
}

export default function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "lg" }) {
  const normalized = toRunStatus(status);
  const style = STATUS_STYLES[normalized];
  const Icon = style.icon;
  const textSize = size === "lg" ? "text-xs font-black tracking-wider font-heebo" : "text-[10px] font-black tracking-wider font-heebo";
  const iconSize = size === "lg" ? 14 : 12;
  const px = size === "lg" ? "px-3.5 py-1.5" : "px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} ${style.text} ${textSize} ${px} transition-all`}>
      <Icon size={iconSize} className={normalized === RunStatus.RUNNING ? "animate-spin" : ""} />
      {normalized.toUpperCase()}
    </span>
  );
}
