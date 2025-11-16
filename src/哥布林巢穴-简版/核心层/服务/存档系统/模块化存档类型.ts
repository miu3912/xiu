/**
 * 模块化存档系统类型定义
 */

// ==================== 基础类型定义 ====================

/**
 * 资源类型
 */
export type ResourceType = 'gold' | 'food' | 'mana' | 'essence';

/**
 * 资源消耗接口
 */
export interface ResourceConsumption {
  type: ResourceType;
  amount: number;
  reason: string;
}

/**
 * 资源检查接口
 */
export interface ResourceCheck {
  type: ResourceType;
  amount: number;
  reason: string;
}

// ==================== 模块数据接口定义 ====================

/**
 * 巢穴模块数据接口
 */
export interface NestModuleData {
  breedingSlots: BuildingSlot[];
  resourceSlots: BuildingSlot[];
  activeTab: 'breeding' | 'resource';
  totalIncome: {
    gold: number;
    food: number;
  };
  breedingRoomInfo: BreedingRoomInfo[];
}

/**
 * 建筑槽位接口
 */
export interface BuildingSlot {
  building: Building | null;
  unlocked: boolean;
}

/**
 * 建筑接口
 */
export interface Building {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: BuildingCost;
  category: 'breeding' | 'resource';
  income?: BuildingIncome;
  effects: BuildingEffect[];
}

/**
 * 建筑成本接口
 */
export interface BuildingCost {
  gold: number;
  food: number;
}

/**
 * 建筑收入接口
 */
export interface BuildingIncome {
  gold?: number;
  food?: number;
}

/**
 * 建筑效果接口
 */
export interface BuildingEffect {
  type: string;
  icon: string;
  description: string;
}

/**
 * 产卵室信息接口
 */
export interface BreedingRoomInfo {
  roomId: string;
  characterId: string;
  characterName: string;
  status: 'breeding' | 'imprisoned';
  occupiedAt: Date;
}

/**
 * 衍生物模块数据接口
 */
export interface EssencesModuleData {
  normalEssences: number;
  warriorEssences: number;
  paladinEssences: number;
  shamanEssences: number;
}

/**
 * 调教模块数据接口
 */
export interface TrainingModuleData {
  characters: TrainingCharacter[];
  trainingRooms: TrainingRoom[];
  activeTraining: ActiveTraining[];
}

/**
 * 训练角色接口
 */
export interface TrainingCharacter {
  id: string;
  name: string;
  level: number;
  experience: number;
  status: 'idle' | 'training' | 'breeding' | 'imprisoned';
  locationId?: string;
  attributes: CharacterAttributes;
  lastTrainingTime?: Date;
}

/**
 * 角色属性接口
 */
export interface CharacterAttributes {
  strength: number;
  agility: number;
  intelligence: number;
  endurance: number;
  charm: number;
}

/**
 * 训练室接口
 */
export interface TrainingRoom {
  id: string;
  name: string;
  type: 'physical' | 'magical' | 'charm';
  level: number;
  occupied: boolean;
  occupantId?: string;
}

/**
 * 活跃训练接口
 */
export interface ActiveTraining {
  characterId: string;
  roomId: string;
  startTime: Date;
  trainingType: string;
  duration: number; // 训练时长（毫秒）
}

/**
 * 资源模块数据接口
 */
export interface ResourcesModuleData {
  gold: number;
  food: number;
  mana: number;
  essence: number;
  income: {
    gold: number;
    food: number;
    mana: number;
    essence: number;
  };
  storage: {
    gold: number;
    food: number;
    mana: number;
    essence: number;
  };
}

/**
 * 玩家模块数据接口
 */
export interface PlayerModuleData {
  level: number;
  experience: number;
  name: string;
  title: string;
  achievements: string[];
  unlockedFeatures: string[];
  settings: PlayerSettings;
}

/**
 * 玩家设置接口
 */
export interface PlayerSettings {
  language: string;
  soundVolume: number;
  musicVolume: number;
  autoSave: boolean;
  notifications: boolean;
}

/**
 * 游戏进度模块数据接口
 */
export interface ProgressModuleData {
  currentChapter: number;
  completedQuests: string[];
  activeQuests: ActiveQuest[];
  unlockedAreas: string[];
  storyFlags: StoryFlag[];
}

/**
 * 活跃任务接口
 */
export interface ActiveQuest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  progress: number; // 0-100
}

/**
 * 任务目标接口
 */
export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  target: number;
  current: number;
}

/**
 * 任务奖励接口
 */
export interface QuestReward {
  type: 'gold' | 'food' | 'item' | 'experience';
  amount: number;
  itemId?: string;
}

/**
 * 故事标记接口
 */
export interface StoryFlag {
  id: string;
  name: string;
  description: string;
  triggered: boolean;
  triggerTime?: Date;
}

/**
 * 战斗模块数据接口
 */
export interface CombatModuleData {
  party: CombatCharacter[];
  inventory: CombatItem[];
  currentDungeon?: string;
  dungeonProgress: DungeonProgress;
  battles: BattleHistory[];
}

/**
 * 战斗角色接口
 */
export interface CombatCharacter {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  skills: CombatSkill[];
  equipment: Equipment;
}

/**
 * 战斗技能接口
 */
export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  power: number;
  cost: number;
  cooldown: number;
  currentCooldown: number;
}

/**
 * 装备接口
 */
export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory1?: Item;
  accessory2?: Item;
}

/**
 * 物品接口
 */
export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: ItemStats;
  effects: ItemEffect[];
}

/**
 * 物品属性接口
 */
export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  mana?: number;
  strength?: number;
  agility?: number;
  intelligence?: number;
}

/**
 * 物品效果接口
 */
export interface ItemEffect {
  type: string;
  value: number;
  description: string;
}

/**
 * 战斗物品接口
 */
export interface CombatItem {
  item: Item;
  quantity: number;
}

/**
 * 地下城进度接口
 */
export interface DungeonProgress {
  dungeonId: string;
  currentFloor: number;
  completedFloors: number[];
  discoveredSecrets: string[];
  bossDefeated: boolean;
}

/**
 * 战斗历史接口
 */
export interface BattleHistory {
  id: string;
  timestamp: Date;
  enemy: string;
  result: 'victory' | 'defeat' | 'flee';
  rewards: BattleReward[];
  damageDealt: number;
  damageTaken: number;
}

/**
 * 战斗奖励接口
 */
export interface BattleReward {
  type: 'gold' | 'food' | 'item' | 'experience';
  amount: number;
  itemId?: string;
}

// ==================== 存档数据接口 ====================

/**
 * 完整游戏数据接口
 */
export interface GameData {
  version: string;
  saveTime: Date;
  gameTime: number; // 游戏内时间（毫秒）
  
  // 模块数据
  nest?: NestModuleData;
  essences?: EssencesModuleData;
  training?: TrainingModuleData;
  resources?: ResourcesModuleData;
  player?: PlayerModuleData;
  progress?: ProgressModuleData;
  combat?: CombatModuleData;
  
  // 元数据
  metadata: {
    gameVersion: string;
    saveSlot: number;
    playTime: number;
    lastPlayed: Date;
  };
}

/**
 * 模块数据更新接口
 */
export interface ModuleDataUpdate {
  moduleName: string;
  data: any;
}

/**
 * 模块数据获取接口
 */
export interface ModuleDataRequest {
  moduleName: string;
}

/**
 * 资源操作结果接口
 */
export interface ResourceOperationResult {
  success: boolean;
  message: string;
  newBalance?: {
    [key in ResourceType]?: number;
  };
}

// ==================== 服务配置接口 ====================

/**
 * 存档服务配置接口
 */
export interface SaveServiceConfig {
  autoSaveInterval: number;
  maxSaveSlots: number;
  backupCount: number;
  compression: boolean;
  encryption: boolean;
}

/**
 * 模块注册信息接口
 */
export interface ModuleRegistration {
  moduleName: string;
  initialData: any;
  version: string;
  dependencies?: string[];
}

// ==================== 事件类型定义 ====================

/**
 * 存档事件类型
 */
export type SaveEventType = 
  | 'beforeSave' 
  | 'afterSave' 
  | 'beforeLoad' 
  | 'afterLoad' 
  | 'moduleUpdated' 
  | 'resourceChanged';

/**
 * 存档事件接口
 */
export interface SaveEvent {
  type: SaveEventType;
  timestamp: Date;
  data?: any;
  moduleName?: string;
}

// ==================== 错误类型定义 ====================

/**
 * 存档错误类型
 */
export interface SaveError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * 资源不足错误接口
 */
export interface InsufficientResourcesError {
  required: ResourceCheck[];
  available: {
    [key in ResourceType]?: number;
  };
  message: string;
}

// ==================== 工具类型 ====================

/**
 * 部分更新类型
 */
export type PartialNestModuleData = Partial<NestModuleData>;
export type PartialEssencesModuleData = Partial<EssencesModuleData>;
export type PartialTrainingModuleData = Partial<TrainingModuleData>;
export type PartialResourcesModuleData = Partial<ResourcesModuleData>;
export type PartialPlayerModuleData = Partial<PlayerModuleData>;
export type PartialProgressModuleData = Partial<ProgressModuleData>;
export type PartialCombatModuleData = Partial<CombatModuleData>;

/**
 * 深度部分类型（递归）
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};