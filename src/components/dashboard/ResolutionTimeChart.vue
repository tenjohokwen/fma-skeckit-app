<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-primary">{{ $t('dashboard.charts.resolutionTime') }}</div>
      <apexchart
        v-if="data.count > 0"
        type="bar"
        height="350"
        :options="chartOptions"
        :series="series"
      />
      <div v-else class="text-center text-grey-6 q-pa-lg">
        No closed cases yet
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
    type: Object,
    required: true,
    default: () => ({
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      percentile75: 0,
      percentile90: 0,
      count: 0
    })
  }
})

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true
    }
  },
  colors: ['#2196F3', '#9C27B0', '#4CAF50', '#FF9800', '#F44336'],
  xaxis: {
    categories: ['Average', 'Median', '75th %ile', '90th %ile', 'Max'],
    title: {
      text: 'Days'
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function(val) {
      return val + ' days'
    }
  },
  legend: {
    show: false
  },
  tooltip: {
    y: {
      formatter: function(val) {
        return val + ' days'
      }
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

const series = computed(() => [{
  name: 'Days',
  data: [
    props.data.average,
    props.data.median,
    props.data.percentile75,
    props.data.percentile90,
    props.data.max
  ]
}])
</script>
