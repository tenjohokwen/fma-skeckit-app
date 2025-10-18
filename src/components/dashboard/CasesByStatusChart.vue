<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-grey-7">Cases by Status</div>
      <apexchart
        v-if="series.length > 0"
        type="donut"
        height="350"
        :options="chartOptions"
        :series="series"
      />
      <div v-else class="text-center text-grey-6 q-pa-lg">
        No data available
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

// Register the component
const apexchart = VueApexCharts

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false }
  },
  colors: ['#2196F3', '#FF9800', '#9C27B0', '#4CAF50'],
  labels: props.data.map(d => d.status),
  legend: {
    position: 'bottom'
  },
  dataLabels: {
    enabled: true,
    formatter: function(val) {
      return Math.round(val) + '%'
    }
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 300
      }
    }
  }]
}))

const series = computed(() => props.data.map(d => d.count))
</script>
