import {
  getServiceStateColor,
  getServiceStateLabel,
  type ServiceState,
} from "@/lib/automationStates";

export function ServiceStateBadge({ state }: { state: ServiceState }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getServiceStateColor(state)}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {getServiceStateLabel(state)}
    </span>
  );
}