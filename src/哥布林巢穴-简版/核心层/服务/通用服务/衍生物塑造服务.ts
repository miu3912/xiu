import { modularSaveManager } from '../存档系统/模块化存档服务';

export interface EssenceProductionCost {
  gold: number;
  food: number;
}

export interface EssenceProductionResult {
  success: boolean;
  message: string;
  normalEssences?: number;
  warriorEssences?: number;
  paladinEssences?: number;
  shamanEssences?: number;
}

export class EssenceProductionService {
  private static instance: EssenceProductionService;

  public static getInstance(): EssenceProductionService {
    if (!EssenceProductionService.instance) {
      EssenceProductionService.instance = new EssenceProductionService();
    }
    return EssenceProductionService.instance;
  }

  /**
   * 获取塑造不同等级衍生物的成本（基于你的资源规模调整）
   */
  public getProductionCosts(): Record<string, EssenceProductionCost> {
    return {
      normal: { gold: 100000000, food: 50000000 },        // 1亿金币 + 5千万食物 - 普通衍生物
      warrior: { gold: 250000000, food: 120000000 },      // 2.5亿金币 + 1.2亿食物 - 衍生物战士
      paladin: { gold: 500000000, food: 250000000 },      // 5亿金币 + 2.5亿食物 - 衍生物圣骑士
      shaman: { gold: 1000000000, food: 500000000 },      // 10亿金币 + 5亿食物 - 衍生物萨满
    };
  }

  /**
   * 格式化大数字显示
   */
  private formatLargeNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'b';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'm';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * 检查是否可以塑造衍生物
   */
  public canProduceEssences(essenceType: string, quantity: number = 1): boolean {
    const costs = this.getProductionCosts();
    const cost = costs[essenceType];
    
    if (!cost) return false;

    const totalGoldCost = cost.gold * quantity;
    const totalFoodCost = cost.food * quantity;

    return modularSaveManager.hasEnoughResources([
      { type: 'gold', amount: totalGoldCost, reason: '塑造衍生物' },
      { type: 'food', amount: totalFoodCost, reason: '塑造衍生物' },
    ]);
  }

  /**
   * 塑造衍生物
   */
  public produceEssences(essenceType: string, quantity: number = 1): EssenceProductionResult {
    const costs = this.getProductionCosts();
    const cost = costs[essenceType];
    
    if (!cost) {
      return {
        success: false,
        message: '无效的衍生物类型',
      };
    }

    const totalGoldCost = cost.gold * quantity;
    const totalFoodCost = cost.food * quantity;

    // 检查资源是否足够
    if (!this.canProduceEssences(essenceType, quantity)) {
      return {
        success: false,
        message: '资源不足，无法塑造衍生物',
      };
    }

    // 消耗资源
    const resourcesConsumed = modularSaveManager.consumeResources([
      { type: 'gold', amount: totalGoldCost, reason: `塑造${quantity}个${this.getEssenceName(essenceType)}` },
      { type: 'food', amount: totalFoodCost, reason: `塑造${quantity}个${this.getEssenceName(essenceType)}` },
    ]);

    if (!resourcesConsumed) {
      return {
        success: false,
        message: '资源消耗失败',
      };
    }

    // 获取当前衍生物数量
    const currentEssences = this.getCurrentEssences();
    
    // 增加衍生物数量
    const result: EssenceProductionResult = {
      success: true,
      message: `成功塑造了${quantity}个${this.getEssenceName(essenceType)}，消耗${this.formatLargeNumber(totalGoldCost)}💰和${this.formatLargeNumber(totalFoodCost)}🍖`,
    };

    switch (essenceType) {
      case 'normal':
        currentEssences.normalEssences += quantity;
        result.normalEssences = quantity;
        break;
      case 'warrior':
        currentEssences.warriorEssences += quantity;
        result.warriorEssences = quantity;
        break;
      case 'paladin':
        currentEssences.paladinEssences += quantity;
        result.paladinEssences = quantity;
        break;
      case 'shaman':
        currentEssences.shamanEssences += quantity;
        result.shamanEssences = quantity;
        break;
    }

    // 保存更新后的衍生物数量
    this.saveEssences(currentEssences);

    return result;
  }

  /**
   * 批量塑造衍生物
   */
  public produceEssencesBatch(productions: { type: string; quantity: number }[]): EssenceProductionResult {
    let totalGoldCost = 0;
    let totalFoodCost = 0;
    const costs = this.getProductionCosts();

    // 计算总成本
    for (const production of productions) {
      const cost = costs[production.type];
      if (!cost) {
        return {
          success: false,
          message: `无效的衍生物类型: ${production.type}`,
        };
      }
      totalGoldCost += cost.gold * production.quantity;
      totalFoodCost += cost.food * production.quantity;
    }

    // 检查资源
    if (!modularSaveManager.hasEnoughResources([
      { type: 'gold', amount: totalGoldCost, reason: '批量塑造衍生物' },
      { type: 'food', amount: totalFoodCost, reason: '批量塑造衍生物' },
    ])) {
      return {
        success: false,
        message: '资源不足，无法批量塑造衍生物',
      };
    }

    // 消耗资源
    const resourcesConsumed = modularSaveManager.consumeResources([
      { type: 'gold', amount: totalGoldCost, reason: '批量塑造衍生物' },
      { type: 'food', amount: totalFoodCost, reason: '批量塑造衍生物' },
    ]);

    if (!resourcesConsumed) {
      return {
        success: false,
        message: '资源消耗失败',
      };
    }

    // 获取当前衍生物数量
    const currentEssences = this.getCurrentEssences();
    const result: EssenceProductionResult = {
      success: true,
      message: `批量塑造衍生物成功，总消耗${this.formatLargeNumber(totalGoldCost)}💰和${this.formatLargeNumber(totalFoodCost)}🍖`,
    };

    // 增加衍生物数量
    for (const production of productions) {
      switch (production.type) {
        case 'normal':
          currentEssences.normalEssences += production.quantity;
          result.normalEssences = (result.normalEssences || 0) + production.quantity;
          break;
        case 'warrior':
          currentEssences.warriorEssences += production.quantity;
          result.warriorEssences = (result.warriorEssences || 0) + production.quantity;
          break;
        case 'paladin':
          currentEssences.paladinEssences += production.quantity;
          result.paladinEssences = (result.paladinEssences || 0) + production.quantity;
          break;
        case 'shaman':
          currentEssences.shamanEssences += production.quantity;
          result.shamanEssences = (result.shamanEssences || 0) + production.quantity;
          break;
      }
    }

    // 保存更新后的衍生物数量
    this.saveEssences(currentEssences);

    return result;
  }

  /**
   * 获取衍生物名称
   */
  private getEssenceName(essenceType: string): string {
    const names: Record<string, string> = {
      normal: '普通衍生物',
      warrior: '衍生物战士',
      paladin: '衍生物圣骑士',
      shaman: '衍生物萨满',
    };
    return names[essenceType] || '未知衍生物';
  }

  /**
   * 获取当前衍生物数量
   */
  private getCurrentEssences(): any {
    try {
      const gameData = modularSaveManager.getCurrentGameData();
      return gameData?.essences || {
        normalEssences: 0,
        warriorEssences: 0,
        paladinEssences: 0,
        shamanEssences: 0,
      };
    } catch (error) {
      console.error('获取衍生物数量失败:', error);
      return {
        normalEssences: 0,
        warriorEssences: 0,
        paladinEssences: 0,
        shamanEssences: 0,
      };
    }
  }

  /**
   * 保存衍生物数量
   */
  private saveEssences(essences: any): void {
    try {
      modularSaveManager.updateModuleData({
        moduleName: 'essences',
        data: essences,
      });
    } catch (error) {
      console.error('保存衍生物数量失败:', error);
    }
  }

  /**
   * 获取衍生物统计信息
   */
  public getEssenceStats(): {
    total: number;
    normal: number;
    warrior: number;
    paladin: number;
    shaman: number;
  } {
    const essences = this.getCurrentEssences();
    return {
      total: essences.normalEssences + essences.warriorEssences + essences.paladinEssences + essences.shamanEssences,
      normal: essences.normalEssences,
      warrior: essences.warriorEssences,
      paladin: essences.paladinEssences,
      shaman: essences.shamanEssences,
    };
  }
}

export const EssenceProductionServiceInstance = EssenceProductionService.getInstance();