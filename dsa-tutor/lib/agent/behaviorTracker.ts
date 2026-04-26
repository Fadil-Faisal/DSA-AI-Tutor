export interface BehaviorSignal {
  signal_type: 'time_tick' | 'hint_request' | 'code_edit' | 'submit';
  value: number;
}

export interface BehaviorSnapshot {
  sessionId: string;
  problemId: string;
  timeOnProblemSeconds: number;
  hintLevel: number;
  codeEditsPerMinute: number;
  submitAttempts: number;
  passedTests: number;
  totalTests: number;
  accuracy: number;
  frustrationIndex: number;
  engagementScore: number;
}

class BehaviorTracker {
  private sessionId: string = '';
  private problemId: string = '';
  private startTime: number = 0;
  private editCount: number = 0;
  private editWindowStart: number = 0;
  private hintLevel: number = 0;
  private submitAttempts: number = 0;
  private passedTests: number = 0;
  private totalTests: number = 0;
  private lastActivityTime: number = Date.now();
  private pendingSignals: BehaviorSignal[] = [];

  start(sessionId: string, problemId: string) {
    this.sessionId = sessionId;
    this.problemId = problemId;
    this.startTime = Date.now();
    this.editCount = 0;
    this.editWindowStart = Date.now();
    this.hintLevel = 0;
    this.submitAttempts = 0;
    this.passedTests = 0;
    this.totalTests = 0;
    this.lastActivityTime = Date.now();
    this.pendingSignals = [];

    console.log('[BehaviorTracker] Started:', sessionId, problemId);
  }

  recordCodeEdit() {
    this.lastActivityTime = Date.now();
    this.editCount++;
    this.pendingSignals.push({ signal_type: 'code_edit', value: 1 });
  }

  recordHintRequest(level: number) {
    this.lastActivityTime = Date.now();
    this.hintLevel = Math.max(this.hintLevel, level);
    this.pendingSignals.push({ signal_type: 'hint_request', value: level });
  }

  recordSubmit(passed: number, total: number) {
    this.lastActivityTime = Date.now();
    this.submitAttempts++;
    this.passedTests = passed;
    this.totalTests = total;
    this.pendingSignals.push({ signal_type: 'submit', value: passed / total });
    this.flush();
  }

  getSnapshot(): BehaviorSnapshot {
    const timeSecs = Math.round((Date.now() - this.startTime) / 1000);
    const windowMins = Math.max((Date.now() - this.editWindowStart) / 60000, 0.1);
    const editsPerMin = this.editCount / windowMins;
    const idleSecs = (Date.now() - this.lastActivityTime) / 1000;

    const accuracy = this.totalTests > 0 ? this.passedTests / this.totalTests : 0;
    
    const hintFactor = this.hintLevel / 3;
    const timeFactor = Math.min(timeSecs / 600, 1);
    const failFactor = this.submitAttempts > 1 ? Math.min((this.submitAttempts - 1) / 5, 1) : 0;
    const idleFactor = Math.min(idleSecs / 120, 1);
    
    const frustrationIndex = Math.min(
      (hintFactor * 0.3) + (timeFactor * 0.25) + (failFactor * 0.3) + (idleFactor * 0.15),
      1
    );

    const editFactor = Math.min(editsPerMin / 10, 1);
    const engagementScore = Math.min(
      (editFactor * 0.5) + (accuracy * 0.3) + (Math.min(this.submitAttempts / 3, 1) * 0.2),
      1
    );

    return {
      sessionId: this.sessionId,
      problemId: this.problemId,
      timeOnProblemSeconds: timeSecs,
      hintLevel: this.hintLevel,
      codeEditsPerMinute: Math.round(editsPerMin * 10) / 10,
      submitAttempts: this.submitAttempts,
      passedTests: this.passedTests,
      totalTests: this.totalTests,
      accuracy: Math.round(accuracy * 100),
      frustrationIndex: Math.round(frustrationIndex * 100) / 100,
      engagementScore: Math.round(engagementScore * 100) / 100,
    };
  }

  stop() {
    this.flush();
  }

  private getTimeOnProblem(): number {
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  private async flush() {
    if (this.pendingSignals.length === 0 || !this.sessionId) return;
    const signals = [...this.pendingSignals];
    this.pendingSignals = [];
    
    try {
      await fetch('/api/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          problemId: this.problemId,
          signals,
          snapshot: this.getSnapshot(),
        }),
      });
    } catch (e) {
      console.error('[BehaviorTracker] Flush failed:', e);
    }
  }
}

export const behaviorTracker = new BehaviorTracker();