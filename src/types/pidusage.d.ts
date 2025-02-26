// src/types/pidusage.d.ts
declare module 'pidusage' {
    interface Stats {
      cpu: number;
      memory: number;
      ppid: number;
      pid: number;
      timestamp: number;
    }
  
    function pidusage(pid: number, callback: (err: any, stats: Stats) => void): void;
    export = pidusage;
  }
  