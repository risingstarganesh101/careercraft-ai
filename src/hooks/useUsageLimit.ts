const DAILY_LIMIT = 5;
const STORAGE_KEY = "careertoolkit_usage";

interface UsageData {
  date: string;
  count: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: UsageData = JSON.parse(raw);
      if (data.date === getToday()) return data;
    }
  } catch {}
  return { date: getToday(), count: 0 };
}

function setUsage(data: UsageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getRemainingGenerations(): number {
  const usage = getUsage();
  return Math.max(0, DAILY_LIMIT - usage.count);
}

export function canGenerate(): boolean {
  return getRemainingGenerations() > 0;
}

export function recordGeneration(): void {
  const usage = getUsage();
  usage.count += 1;
  setUsage(usage);
}

export const DAILY_GENERATION_LIMIT = DAILY_LIMIT;
