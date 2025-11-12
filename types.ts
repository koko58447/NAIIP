export enum RecordingState {
  INACTIVE = 'INACTIVE',
  RECORDING = 'RECORDING',
}

export interface Correction {
  original: string;
  correction: string;
  reason?: string;
}
