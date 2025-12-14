export enum TargetLanguage {
  English = 'English',
  French = 'French',
  Spanish = 'Spanish',
  German = 'German',
  Japanese = 'Japanese'
}

export interface EnhancementResponse {
  originalText: string;
  literalTranslation: string;
  improvedVersion: string;
  professionalVersion: string;
  alternatives: string[];
  grammarNotes: string;
  culturalContext: string;
  conversationTips: string;
}

export interface PracticeScenario {
  scenarioTitle: string;
  description: string;
  dialogue: Array<{
    speaker: string;
    text: string;
    note?: string;
  }>;
}
