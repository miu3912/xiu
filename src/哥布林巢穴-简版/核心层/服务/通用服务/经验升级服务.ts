import { modularSaveManager } from '../存档系统/模块化存档服务';
import type { Character } from '../../../功能模块层/人物管理/类型/人物类型';

/**
 * 资源升级结果
 */
export interface ResourceLevelUpResult {
  success: boolean;
  oldLevel: number;
  newLevel: number;
  message?: string;
}

/**
 * 经验升级服务
 * 负责通过消耗金币和食物来提升人物等级
 */
export class ExperienceLevelUpService {
  /**
   * 通过消耗金币和食物升级人物等级
   * @param characterId 目标人物ID
   * @param goldAmount 消耗的金币数量
   * @param foodAmount 消耗的食物数量
   * @returns 升级结果
   */
  static levelUpByResources(characterId: string, goldAmount: number, foodAmount: number): ResourceLevelUpResult {
    try {
      const gameData = modularSaveManager.getCurrentGameData();
      if (!gameData) {
        return {
          success: false,
          oldLevel: 1,
          newLevel: 1,
          message: '没有游戏数据，无法升级',
        };
      }

      const character = gameData.training.characters.find((char: Character) => char.id === characterId);
      if (!character) {
        return {
          success: false,
          oldLevel: 1,
          newLevel: 1,
          message: `未找到人物 (id: ${characterId})`,
        };
      }

      // 获取当前等级
      const currentLevel = character.level ?? Math.floor((character.offspring ?? 0) / 10) ?? 1;

      // 先计算可以升多少级
      const levelUps = this.calculateLevelUps(goldAmount, foodAmount, currentLevel);

      if (levelUps <= 0) {
        return {
          success: false,
          oldLevel: currentLevel,
          newLevel: currentLevel,
          message: `资源不足，无法升级。提升1级需要${this.getCostForLevel(currentLevel + 1).gold.toLocaleString()}金币和${this.getCostForLevel(currentLevel + 1).food.toLocaleString()}食物。`,
        };
      }

      // 计算实际消耗（基于实际升级的等级）
      const actualCost = this.getCostForLevelUps(currentLevel, levelUps);

      // 验证资源是否足够（使用实际消耗金额）
      if (
        !modularSaveManager.hasEnoughResources([
          { type: 'gold', amount: actualCost.gold, reason: '经验升级' },
          { type: 'food', amount: actualCost.food, reason: '经验升级' },
        ])
      ) {
        return {
          success: false,
          oldLevel: currentLevel,
          newLevel: currentLevel,
          message: '金币或食物不足，无法升级',
        };
      }

      // 消耗资源
      if (
        !modularSaveManager.consumeResources([
          { type: 'gold', amount: actualCost.gold, reason: `经验升级${levelUps}级` },
          { type: 'food', amount: actualCost.food, reason: `经验升级${levelUps}级` },
        ])
      ) {
        return {
          success: false,
          oldLevel: currentLevel,
          newLevel: currentLevel,
          message: '消耗资源失败',
        };
      }

      const newLevel = currentLevel + levelUps;
      character.level = newLevel;

      // 更新存档
      modularSaveManager.updateModuleData({
        moduleName: 'training',
        data: gameData.training,
      });

      console.log(`${character.name} 资源升级成功: ${currentLevel} -> ${newLevel}（提升${levelUps}级）`);
      return {
        success: true,
        oldLevel: currentLevel,
        newLevel: newLevel,
        message: `${character.name} 等级提升: ${currentLevel} -> ${newLevel}（提升${levelUps}级）`,
      };
    } catch (error) {
      console.error('资源升级失败:', error);
      return {
        success: false,
        oldLevel: 1,
        newLevel: 1,
        message: `升级失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 计算基于资源数量可以升多少级
   */
  private static calculateLevelUps(goldAmount: number, foodAmount: number, currentLevel: number): number {
    let levelUps = 0;
    let remainingGold = goldAmount;
    let remainingFood = foodAmount;

    // 限制一次最多升50级，避免计算过于复杂
    const maxLevelUps = Math.min(50, 1000 - currentLevel);

    for (let i = 1; i <= maxLevelUps; i++) {
      const targetLevel = currentLevel + i;
      const cost = this.getCostForLevel(targetLevel);

      if (remainingGold >= cost.gold && remainingFood >= cost.food) {
        levelUps = i;
        remainingGold -= cost.gold;
        remainingFood -= cost.food;
      } else {
        break;
      }
    }

    return levelUps;
  }

  /**
   * 获取提升指定等级范围的总成本
   */
  private static getCostForLevelUps(startLevel: number, levelUps: number): { gold: number; food: number } {
    let totalGold = 0;
    let totalFood = 0;

    for (let i = 1; i <= levelUps; i++) {
      const cost = this.getCostForLevel(startLevel + i);
      totalGold += cost.gold;
      totalFood += cost.food;
    }

    return { gold: totalGold, food: totalFood };
  }

  /**
   * 获取提升到指定等级所需的资源
   * 指数增长公式：成本 = base * (growthRate ^ (targetLevel / 10))
   * 确保高级别极其昂贵
   */
  private static getCostForLevel(targetLevel: number): { gold: number; food: number } {
    // 指数增长公式确保高级别极其昂贵
    const baseGold = 1000;
    const baseFood = 500;
    const growthRate = 2.5;

    const goldCost = Math.floor(baseGold * Math.pow(growthRate, targetLevel / 10));
    const foodCost = Math.floor(baseFood * Math.pow(growthRate, targetLevel / 10));

    return {
      gold: Math.max(1000, goldCost),
      food: Math.max(500, foodCost),
    };
  }

  /**
   * 获取升级提示信息
   */
  static getLevelUpMessage(
    characterId: string,
    goldAmount: number,
    foodAmount: number,
  ): {
    levelUps: number;
    predictedLevel: number;
    oldLevel: number;
    totalCost: { gold: number; food: number };
    canLevelUp: boolean;
    message: string;
  } {
    try {
      const gameData = modularSaveManager.getCurrentGameData();
      if (!gameData) {
        return {
          levelUps: 0,
          predictedLevel: 1,
          oldLevel: 1,
          totalCost: { gold: 0, food: 0 },
          canLevelUp: false,
          message: '没有游戏数据',
        };
      }

      const character = gameData.training.characters.find((char: Character) => char.id === characterId);
      if (!character) {
        return {
          levelUps: 0,
          predictedLevel: 1,
          oldLevel: 1,
          totalCost: { gold: 0, food: 0 },
          canLevelUp: false,
          message: '未找到人物',
        };
      }

      const currentLevel = character.level ?? Math.floor((character.offspring ?? 0) / 10) ?? 1;
      const levelUps = this.calculateLevelUps(goldAmount, foodAmount, currentLevel);
      const predictedLevel = currentLevel + levelUps;
      const totalCost = this.getCostForLevelUps(currentLevel, levelUps);
      const canLevelUp = levelUps > 0;

      let message = '';
      if (canLevelUp) {
        message = `将升级至等级 ${predictedLevel}（提升${levelUps}级），消耗${totalCost.gold.toLocaleString()}金币和${totalCost.food.toLocaleString()}食物`;
      } else {
        const nextLevelCost = this.getCostForLevel(currentLevel + 1);
        message = `资源不足，无法升级。提升1级需要${nextLevelCost.gold.toLocaleString()}金币和${nextLevelCost.food.toLocaleString()}食物。`;
      }

      return {
        levelUps,
        predictedLevel,
        oldLevel: currentLevel,
        totalCost,
        canLevelUp,
        message,
      };
    } catch (error) {
      console.error('获取升级信息失败:', error);
      return {
        levelUps: 0,
        predictedLevel: 1,
        oldLevel: 1,
        totalCost: { gold: 0, food: 0 },
        canLevelUp: false,
        message: '获取升级信息失败',
      };
    }
  }

  /**
   * 获取可升级的人物列表
   * 包括：已堕落且可战斗的人物、已编制且可战斗的人物（不包括玩家角色，因为玩家等级等于人物最高级）
   * @returns 可升级的人物列表
   */
  static getUpgradableCharacters(): Character[] {
    try {
      const gameData = modularSaveManager.getCurrentGameData();
      if (!gameData) {
        return [];
      }

      const characters = gameData.training.characters;

      // 筛选出可升级的人物（不包括玩家角色）：
      // 1. 已堕落且可战斗的人物
      // 2. 已编制且可战斗的人物
      const upgradableCharacters = characters.filter((character: Character) => {
        // 排除玩家角色（玩家等级会自动跟随最高级人物）
        if (character.status === 'player') {
          return false;
        }
        // 必须是可战斗的人物
        if (character.canCombat !== true) {
          return false;
        }
        // 已堕落且可战斗
        if (character.status === 'surrendered') {
          return true;
        }
        // 已编制且可战斗
        if (character.status === 'deployed') {
          return true;
        }
        return false;
      });

      return upgradableCharacters;
    } catch (error) {
      console.error('获取可升级人物列表失败:', error);
      return [];
    }
  }

  /**
   * 获取人物当前等级
   * @param characterId 人物ID
   * @returns 人物等级，如果找不到返回1
   */
  static getCharacterLevel(characterId: string): number {
    try {
      const gameData = modularSaveManager.getCurrentGameData();
      if (!gameData) {
        return 1;
      }

      const character = gameData.training.characters.find((char: Character) => char.id === characterId);
      if (!character) {
        return 1;
      }

      // 优先使用 level 字段，如果没有则使用 offspring/10 计算，都没有则返回1
      return character.level ?? Math.floor((character.offspring ?? 0) / 10) ?? 1;
    } catch (error) {
      console.error('获取人物等级失败:', error);
      return 1;
    }
  }
}
