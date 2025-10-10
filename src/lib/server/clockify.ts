import type { ClockifyProject, ClockifyTimeEntry, ClockifyUser } from '$lib/types/clockify';

export class Clockify {
  private apiKey: string;
  private user: ClockifyUser;

  private constructor(apiKey: string, user: ClockifyUser) {
    this.apiKey = apiKey;
    this.user = user;
  }

  static async create(apiKey: string): Promise<Clockify> {
    const res = await fetch('https://api.clockify.me/api/v1/user', {
      headers: { 'X-Api-Key': apiKey }
    });
    if (!res.ok) throw new Error(`Clockify API error: ${res.status}`);
    const user = await res.json();
    return new Clockify(apiKey, user);
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`https://api.clockify.me/api/v1/${endpoint}`, {
      headers: { 'X-Api-Key': this.apiKey },
      ...options
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Clockify API error (${res.status}): ${text || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  async getCurrentUser() {
    return this.makeRequest<ClockifyUser>('user');
  }

  async getInProgressTimeEntries() {
    return this.makeRequest<ClockifyTimeEntry[]>(
      `workspaces/${this.user.defaultWorkspace}/user/${this.user.id}/time-entries?in-progress=true`
    );
  }

  async getTimeEntries(weekEnding: string) {
    const date = new Date(weekEnding);
    date.setUTCHours(23, 59, 59, 999);
    const formatted = date.toISOString();

    return this.makeRequest<ClockifyTimeEntry[]>(
      `workspaces/${this.user.defaultWorkspace}/user/${this.user.id}/time-entries?get-week-before=${encodeURIComponent(
        formatted
      )}`
    );
  }

  async getProjects() {
    return this.makeRequest<ClockifyProject[]>(`workspaces/${this.user.defaultWorkspace}/projects`);
  }
}
