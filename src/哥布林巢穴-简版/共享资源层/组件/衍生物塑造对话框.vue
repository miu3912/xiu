<template>
  <div v-if="show" class="dialog-overlay">
    <div class="shape-dialog">
      <div class="dialog-header">
        <h3>⚒️ 衍生物塑造</h3>
        <button class="close-button" @click="close">×</button>
      </div>

      <div class="dialog-content">
        <div class="current-resources">
          <div class="resource-item">
            <span class="resource-icon">💰</span>
            <span class="resource-amount">{{ formatNumber(currentGold) }}</span>
          </div>
          <div class="resource-item">
            <span class="resource-icon">🍖</span>
            <span class="resource-amount">{{ formatNumber(currentFood) }}</span>
          </div>
        </div>

        <div class="production-options">
          <!-- 普通衍生物 -->
          <div class="production-option" :class="{ affordable: canAfford('normal', normalQuantity) }">
            <div class="essence-info">
              <span class="essence-icon">👤</span>
              <div class="essence-details">
                <div class="essence-name">普通衍生物</div>
                <div class="essence-cost">成本: 100m💰 + 50m🍖</div>
                <div class="essence-desc">基础衍生物单位，具备基本能力</div>
              </div>
            </div>
            <div class="quantity-controls">
              <button 
                class="quantity-btn" 
                :disabled="normalQuantity <= 0"
                @click="normalQuantity = Math.max(0, normalQuantity - 1)"
              >-</button>
              <span class="quantity-display">{{ normalQuantity }}</span>
              <button 
                class="quantity-btn"
                @click="normalQuantity++"
              >+</button>
              <button 
                class="quantity-btn max-btn"
                @click="calculateMaxQuantity('normal')"
                title="计算最大可塑造数量"
              >MAX</button>
            </div>
          </div>

          <!-- 衍生物战士 -->
          <div class="production-option" :class="{ affordable: canAfford('warrior', warriorQuantity) }">
            <div class="essence-info">
              <span class="essence-icon">⚔️</span>
              <div class="essence-details">
                <div class="essence-name">衍生物战士</div>
                <div class="essence-cost">成本: 250m💰 + 120m🍖</div>
                <div class="essence-desc">强化战斗能力的衍生物，攻击力提升</div>
              </div>
            </div>
            <div class="quantity-controls">
              <button 
                class="quantity-btn" 
                :disabled="warriorQuantity <= 0"
                @click="warriorQuantity = Math.max(0, warriorQuantity - 1)"
              >-</button>
              <span class="quantity-display">{{ warriorQuantity }}</span>
              <button 
                class="quantity-btn"
                @click="warriorQuantity++"
              >+</button>
              <button 
                class="quantity-btn max-btn"
                @click="calculateMaxQuantity('warrior')"
                title="计算最大可塑造数量"
              >MAX</button>
            </div>
          </div>

          <!-- 衍生物圣骑士 -->
          <div class="production-option" :class="{ affordable: canAfford('paladin', paladinQuantity) }">
            <div class="essence-info">
              <span class="essence-icon">🛡️</span>
              <div class="essence-details">
                <div class="essence-name">衍生物圣骑士</div>
                <div class="essence-cost">成本: 500m💰 + 250m🍖</div>
                <div class="essence-desc">具备神圣力量的衍生物，防御和治疗能力</div>
              </div>
            </div>
            <div class="quantity-controls">
              <button 
                class="quantity-btn" 
                :disabled="paladinQuantity <= 0"
                @click="paladinQuantity = Math.max(0, paladinQuantity - 1)"
              >-</button>
              <span class="quantity-display">{{ paladinQuantity }}</span>
              <button 
                class="quantity-btn"
                @click="paladinQuantity++"
              >+</button>
              <button 
                class="quantity-btn max-btn"
                @click="calculateMaxQuantity('paladin')"
                title="计算最大可塑造数量"
              >MAX</button>
            </div>
          </div>

          <!-- 衍生物萨满 -->
          <div class="production-option" :class="{ affordable: canAfford('shaman', shamanQuantity) }">
            <div class="essence-info">
              <span class="essence-icon">🔮</span>
              <div class="essence-details">
                <div class="essence-name">衍生物萨满</div>
                <div class="essence-cost">成本: 1b💰 + 500m🍖</div>
                <div class="essence-desc">掌握元素魔法的衍生物，具备强大法术</div>
              </div>
            </div>
            <div class="quantity-controls">
              <button 
                class="quantity-btn" 
                :disabled="shamanQuantity <= 0"
                @click="shamanQuantity = Math.max(0, shamanQuantity - 1)"
              >-</button>
              <span class="quantity-display">{{ shamanQuantity }}</span>
              <button 
                class="quantity-btn"
                @click="shamanQuantity++"
              >+</button>
              <button 
                class="quantity-btn max-btn"
                @click="calculateMaxQuantity('shaman')"
                title="计算最大可塑造数量"
              >MAX</button>
            </div>
          </div>
        </div>

        <!-- 总成本显示 -->
        <div class="total-cost" :class="{ affordable: canAffordTotal }">
          <div class="cost-label">总成本:</div>
          <div class="cost-amounts">
            <span class="cost-item">{{ formatNumber(totalGoldCost) }}💰</span>
            <span class="cost-item">{{ formatNumber(totalFoodCost) }}🍖</span>
          </div>
          <div class="cost-percentage">
            <div class="percentage-bar">
              <div class="percentage-fill gold-fill" :style="{ width: goldPercentage + '%' }"></div>
            </div>
            <div class="percentage-bar">
              <div class="percentage-fill food-fill" :style="{ width: foodPercentage + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 总产量显示 -->
        <div class="total-production">
          <div class="production-label">总产量:</div>
          <div class="production-amounts">
            <span v-if="normalQuantity > 0" class="production-item">{{ normalQuantity }}个普通衍生物</span>
            <span v-if="warriorQuantity > 0" class="production-item">{{ warriorQuantity }}个衍生物战士</span>
            <span v-if="paladinQuantity > 0" class="production-item">{{ paladinQuantity }}个衍生物圣骑士</span>
            <span v-if="shamanQuantity > 0" class="production-item">{{ shamanQuantity }}个衍生物萨满</span>
            <span v-if="totalQuantity === 0" class="production-item">无</span>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn-cancel" @click="close">取消</button>
        <button 
          class="btn-confirm" 
          :disabled="!canProduce || hasError"
          @click="confirmProduction"
        >
          塑造衍生物 (总计: {{ totalQuantity }}个)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { EssenceProductionServiceInstance } from '../../核心层/服务/通用服务/衍生物塑造服务';
import { modularSaveManager } from '../../核心层/服务/存档系统/模块化存档服务';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'confirm', result: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 数量控制
const normalQuantity = ref(0);
const warriorQuantity = ref(0);
const paladinQuantity = ref(0);
const shamanQuantity = ref(0);
const errorMessage = ref('');

// 当前资源
const currentGold = ref(0);
const currentFood = ref(0);

// 格式化数字显示
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'b';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'm';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 计算总成本
const totalGoldCost = computed(() => {
  const costs = EssenceProductionServiceInstance.getProductionCosts();
  return (normalQuantity.value * costs.normal.gold) + 
         (warriorQuantity.value * costs.warrior.gold) + 
         (paladinQuantity.value * costs.paladin.gold) + 
         (shamanQuantity.value * costs.shaman.gold);
});

const totalFoodCost = computed(() => {
  const costs = EssenceProductionServiceInstance.getProductionCosts();
  return (normalQuantity.value * costs.normal.food) + 
         (warriorQuantity.value * costs.warrior.food) + 
         (paladinQuantity.value * costs.paladin.food) + 
         (shamanQuantity.value * costs.shaman.food);
});

// 计算总数量
const totalQuantity = computed(() => {
  return normalQuantity.value + warriorQuantity.value + paladinQuantity.value + shamanQuantity.value;
});

// 计算资源百分比
const goldPercentage = computed(() => {
  return currentGold.value > 0 ? Math.min(100, (totalGoldCost.value / currentGold.value) * 100) : 0;
});

const foodPercentage = computed(() => {
  return currentFood.value > 0 ? Math.min(100, (totalFoodCost.value / currentFood.value) * 100) : 0;
});

// 检查单个类型是否可负担
const canAfford = (type: string, quantity: number) => {
  return EssenceProductionServiceInstance.canProduceEssences(type, quantity);
};

// 检查总成本是否可负担
const canAffordTotal = computed(() => {
  return totalGoldCost.value <= currentGold.value && totalFoodCost.value <= currentFood.value;
});

// 检查是否可以塑造
const canProduce = computed(() => {
  return totalQuantity.value > 0 && canAffordTotal.value;
});

const hasError = computed(() => {
  return !!errorMessage.value;
});

// 加载当前资源
const loadCurrentResources = () => {
  try {
    const gameData = modularSaveManager.getCurrentGameData();
    if (gameData && gameData.resources) {
      currentGold.value = gameData.resources.gold || 0;
      currentFood.value = gameData.resources.food || 0;
    }
  } catch (error) {
    console.error('加载资源失败:', error);
  }
};

// 计算最大可塑造数量
const calculateMaxQuantity = (type: string) => {
  const costs = EssenceProductionServiceInstance.getProductionCosts();
  const cost = costs[type];
  
  if (!cost) return;

  const maxByGold = Math.floor(currentGold.value / cost.gold);
  const maxByFood = Math.floor(currentFood.value / cost.food);
  const maxQuantity = Math.min(maxByGold, maxByFood);

  switch (type) {
    case 'normal':
      normalQuantity.value = maxQuantity;
      break;
    case 'warrior':
      warriorQuantity.value = maxQuantity;
      break;
    case 'paladin':
      paladinQuantity.value = maxQuantity;
      break;
    case 'shaman':
      shamanQuantity.value = maxQuantity;
      break;
  }
};

// 关闭对话框
const close = () => {
  resetForm();
  emit('close');
};

// 重置表单
const resetForm = () => {
  normalQuantity.value = 0;
  warriorQuantity.value = 0;
  paladinQuantity.value = 0;
  shamanQuantity.value = 0;
  errorMessage.value = '';
};

// 确认塑造
const confirmProduction = async () => {
  try {
    const productions = [];
    
    if (normalQuantity.value > 0) {
      productions.push({ type: 'normal', quantity: normalQuantity.value });
    }
    if (warriorQuantity.value > 0) {
      productions.push({ type: 'warrior', quantity: warriorQuantity.value });
    }
    if (paladinQuantity.value > 0) {
      productions.push({ type: 'paladin', quantity: paladinQuantity.value });
    }
    if (shamanQuantity.value > 0) {
      productions.push({ type: 'shaman', quantity: shamanQuantity.value });
    }

    const result = EssenceProductionServiceInstance.produceEssencesBatch(productions);
    
    if (result.success) {
      emit('confirm', result);
      resetForm();
      // 重新加载资源
      loadCurrentResources();
    } else {
      errorMessage.value = result.message;
    }
  } catch (error) {
    errorMessage.value = '塑造衍生物时发生错误';
    console.error('塑造衍生物错误:', error);
  }
};

// 组件挂载时加载资源
onMounted(() => {
  loadCurrentResources();
});
</script>

<style lang="scss" scoped>
// ... 保持原有样式，添加新样式 ...

.current-resources {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(44, 30, 24, 0.8), rgba(28, 20, 17, 0.9));
  border: 1px solid rgba(205, 133, 63, 0.3);
  border-radius: 10px;

  .resource-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .resource-icon {
      font-size: 20px;
    }

    .resource-amount {
      color: #ffd7a1;
      font-weight: 600;
      font-size: 16px;
    }
  }
}

.production-option {
  // ... 原有样式 ...
  
  &.affordable {
    border-color: rgba(34, 197, 94, 0.5);
    background: linear-gradient(180deg, rgba(34, 197, 94, 0.1), rgba(28, 20, 17, 0.9));
  }

  .essence-desc {
    color: #9ca3af;
    font-size: 12px;
    margin-top: 4px;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 8px;

    .max-btn {
      background: linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.9));
      margin-left: 8px;
      font-size: 10px;
      padding: 4px 8px;
    }
  }
}

.cost-percentage {
  margin-top: 8px;

  .percentage-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    margin-bottom: 4px;
    overflow: hidden;

    .percentage-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;

      &.gold-fill {
        background: linear-gradient(90deg, #fbbf24, #f59e0b);
      }

      &.food-fill {
        background: linear-gradient(90deg, #22c55e, #16a34a);
      }
    }
  }
}

.total-production {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), rgba(28, 20, 17, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;

  .production-label {
    color: #ffd7a1;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .production-amounts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .production-item {
      color: #93c5fd;
      font-size: 14px;
      padding: 4px 8px;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 6px;
    }
  }
}
</style>