export enum LandscapeStyle {
  MODERN = 'Modern Minimalist (现代简约)',
  TROPICAL = 'Tropical Resort (热带度假)',
  ZEN = 'Japanese Zen Garden (日式禅意)',
  CHINESE = 'Chinese Garden (中式园林)',
  ENGLISH = 'English Cottage Garden (英式花园)',
  FOREST = 'Dense Forest (茂密森林)',
  DESERT = 'Desert Xeriscape (沙漠耐旱)',
}

export enum InteriorStyle {
  MODERN = 'Modern Minimalist (现代简约)',
  CREAM = 'Cream Style (奶油风)',
  EUROPEAN = 'Classic European (欧式古典)',
  LUXURY = 'Light Luxury (轻奢)',
  INDUSTRIAL = 'Industrial (工业风)',
  JAPANDI = 'Japandi (日式侘寂)',
  NEW_CHINESE = 'New Chinese (新中式)',
}

export enum TimeOfDay {
  SUNNY_NOON = 'Sunny Noon (阳光午后)',
  GOLDEN_HOUR = 'Golden Hour/Sunset (日落金辉)',
  BLUE_HOUR = 'Blue Hour/Twilight (蓝调时刻)',
  FOGGY_MORNING = 'Foggy Morning (雾气清晨)',
  NIGHT = 'Night with Lighting (静谧夜晚)',
  RAINY = 'Rainy Mood (雨天氛围)',
}

export enum Season {
  SUMMER = 'Lush Summer (盛夏)',
  AUTUMN = 'Colorful Autumn (金秋)',
  SPRING = 'Blooming Spring (春日)',
  WINTER = 'Snowy Winter (冬雪)',
}

export type SceneType = 'exterior' | 'interior';

export interface GenerationSettings {
  sceneType: SceneType;
  style: LandscapeStyle;
  interiorStyle: InteriorStyle;
  time: TimeOfDay;
  season: Season;
  promptEnhancement: string;
}

export interface AppState {
  originalImage: string | null; // Base64
  referenceImage: string | null; // Base64 (Style Reference)
  generatedImage: string | null; // Base64
  isGenerating: boolean;
  error: string | null;
  settings: GenerationSettings;
}