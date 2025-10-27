<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-primary">{{ $t('dashboard.charts.activeCases') }}</div>

      <div class="row items-center q-mt-md">
        <div class="col">
          <div class="text-h2 text-weight-bold">
            {{ data.count }}
          </div>
        </div>
        <div class="col-auto">
          <q-icon
            :name="trendIcon"
            :color="trendColor"
            size="48px"
          />
        </div>
      </div>

      <div class="row items-center q-mt-sm">
        <div :class="`text-${trendColor}`">
          {{ data.trend.percentage }}%
        </div>
        <div class="text-grey-7 q-ml-sm">
          vs. last month
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const trendIcon = computed(() => {
  if (props.data.trend.direction === 'up') return 'trending_up'
  if (props.data.trend.direction === 'down') return 'trending_down'
  return 'trending_flat'
})

const trendColor = computed(() => {
  // For active cases, decrease is good (green), increase is concerning (red)
  if (props.data.trend.direction === 'up') return 'negative'
  if (props.data.trend.direction === 'down') return 'positive'
  return 'grey'
})
</script>
