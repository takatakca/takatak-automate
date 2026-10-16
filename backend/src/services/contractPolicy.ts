/** Guards payment and project state transitions independently from HTTP. */
export function canAccept(contract: string, payment: string, project: string): boolean {
  return contract === "assigned" && payment === "assigned" && project === "assigned";
}
export const canDecline = canAccept;
export function canDeliver(contract: string, payment: string, project: string): boolean {
  return contract === "in_progress" &&
    ["in_progress", "revision_requested"].includes(payment) &&
    ["in_progress", "revision_requested"].includes(project);
}
