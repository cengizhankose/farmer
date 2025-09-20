export type Risk = "Low" | "Medium" | "High";

export function normalizeRisk(input: string): Risk {
  const v = input.toLowerCase();
  if (v.startsWith("low")) return "Low";
  if (v.startsWith("med")) return "Medium";
  return "High";
}

