/**
 * TypeScript interfaces for case data
 */

// Main case structure
export interface CaseData {
  caseId: string;
  title: string;
  difficulty: string;
  introText: string;
  intro?: string; // Story intro for case intro scene
  clues: ClueData[];
  suspects: SuspectData[];
  motives: MotiveData[];
  weapons: WeaponData[];
  solution: SolutionData;
}

export interface ClueData {
  id: string;
  name: string;
  description: string;
  spritePath?: string;
  location?: { x: number; y: number };
  tags?: string[];
}

export interface SuspectData {
  id: string;
  name: string;
  avatarPath?: string;
  bio: string;
  description?: string; // Short description for intro
  questions: QuestionData[];
}

export interface QuestionData {
  id: string;
  text: string;
  answer: string;
  unlocks?: {
    questions?: string[];
    clues?: string[];
  };
}

export interface MotiveData {
  id: string;
  text: string;
}

export interface WeaponData {
  id: string;
  text: string;
}

export interface SolutionData {
  killerId: string;
  motiveId: string;
  weaponId: string;
  keyEvidenceId: string;
  explanation: string;
}

// Map object from Tiled
export interface MapObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: { name: string; value: unknown }[];
}

// Save data
export interface SaveData {
  caseId: string;
  collectedClues: string[];
  importantClues: string[];
  askedQuestions: Record<string, string[]>; // suspectId -> questionIds
  unlockedQuestions: Record<string, string[]>;
  notebookEvents: NotebookEvent[];
  deductionDraft: DeductionDraft;
  playerPosition?: { x: number; y: number };
}

export interface NotebookEvent {
  id: string;
  timestamp: number;
  type: 'clue' | 'dialogue' | 'deduction' | 'scene';
  title: string;
  description: string;
}

export interface DeductionDraft {
  killerId?: string;
  motiveId?: string;
  weaponId?: string;
  keyEvidenceId?: string;
}

// Event types for EventBus
export type GameEventType =
  | 'clue:collected'
  | 'clue:detailed'
  | 'dialogue:start'
  | 'dialogue:end'
  | 'dialogue:question'
  | 'notebook:add'
  | 'deduction:submit'
  | 'deduction:result'
  | 'ui:open'
  | 'ui:close'
  | 'toast:show'
  | 'input:pause'
  | 'input:resume'
  | 'input:interact'
  | 'game:save'
  | 'game:load'
  | 'scene:ready'
  | 'case:loaded';

export interface GameEvent {
  type: GameEventType;
  data?: unknown;
}
