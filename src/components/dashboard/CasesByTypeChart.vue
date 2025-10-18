<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-grey-7">Cases by Practice Area</div>
      <apexchart
        v-if="series.length > 0"
        type="bar"
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
    type: 'bar',
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true
    }
  },
  colors: ['#2196F3', '#9C27B0', '#FF9800', '#4CAF50', '#00BCD4', '#F44336', '#FFC107', '#8BC34A', '#673AB7', '#E91E63', '#9E9E9E'],
  xaxis: {
    categories: props.data.map(d => d.type)
  },
  dataLabels: {
    enabled: true,
    formatter: function(val) {
      return val
    }
  },
  legend: {
    show: false
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
  name: 'Cases',
  data: props.data.map(d => d.count)
}])
</script>
