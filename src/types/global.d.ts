export {};

declare global {
  interface FormattedTimeEntry {
    resource: string;
    date: string;
    code: string;
    hours: number;
    callNo: string;
    description: string;
  }
}
