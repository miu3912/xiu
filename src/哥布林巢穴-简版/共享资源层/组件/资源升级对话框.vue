<template>
  <!-- 模板部分保持不变 -->
  <div v-if="show" class="dialog-overlay">
    <!-- ... 现有模板代码 ... -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
// 修正导入路径
import { modularSaveManager } from '../../核心层/服务/存档系统/模块化存档服务';
import { ExperienceLevelUpService } from '../../核心层/服务/通用服务/经验升级服务';
import type { Character } from '../../../功能模块层/人物管理/类型/人物类型';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'confirm', characterId: string, goldAmount: number, foodAmount: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const selectedCharacterId = ref('');
const goldAmount = ref(0);
const foodAmount = ref(0);
const upgradableCharacters = ref<Character[]>([]);
const prediction = ref({
  levelUps: 0,
  predictedLevel: 0,
  oldLevel: 0,
  totalCost: { gold: 0, food: 0 },
  canLevelUp: false,
  message: '',
});

// 计算属性
const availableGold = computed(() => modularSaveManager.resources.value.gold || 0);
const availableFood = computed(() => modularSaveManager.resources.value.food || 0);

const canConfirm = computed(() => {
  return selectedCharacterId.value && goldAmount.value > 0 && foodAmount.value > 0 && prediction.value.canLevelUp;
});

// 方法 - 保持不变...
const closeDialog = () => {
  resetForm();
  emit('close');
};

const confirmUpgrade = () => {
  if (canConfirm.value) {
    emit('confirm', selectedCharacterId.value, goldAmount.value, foodAmount.value);
    resetForm();
  }
};

const resetForm = () => {
  selectedCharacterId.value = '';
  goldAmount.value = 0;
  foodAmount.value = 0;
  prediction.value = {
    levelUps: 0,
    predictedLevel: 0,
    oldLevel: 0,
    totalCost: { gold: 0, food: 0 },
    canLevelUp: false,
    message: '',
  };
};

const updatePrediction = () => {
  if (selectedCharacterId.value && goldAmount.value >= 0 && foodAmount.value >= 0) {
    const result = ExperienceLevelUpService.getLevelUpMessage(
      selectedCharacterId.value,
      goldAmount.value,
      foodAmount.value,
    );
    prediction.value = result;
  }
};

const getCharacterLevel = (character: Character): number => {
  return character.level ?? Math.floor((character.offspring ?? 0) / 10) ?? 1;
};

const getCharacterName = (characterId: string): string => {
  const character = upgradableCharacters.value.find(c => c.id === characterId);
  return character?.name || '未知人物';
};

// 加载可升级的人物列表
const loadUpgradableCharacters = () => {
  try {
    upgradableCharacters.value = ExperienceLevelUpService.getUpgradableCharacters();
  } catch (error) {
    console.error('加载可升级人物失败:', error);
  }
};

// 监听显示状态
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      loadUpgradableCharacters();
      resetForm();
    }
  },
);

onMounted(() => {
  loadUpgradableCharacters();
});
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
</style>
