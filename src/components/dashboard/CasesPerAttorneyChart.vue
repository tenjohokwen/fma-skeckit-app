<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-grey-7">Active Cases per Attorney</div>
      <apexchart
        v-if="series.length > 0 && series[0].data.length > 0"
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

// Map workload level to color
const getWorkloadColor = (level) => {
  const colorMap = {
    'low': '#4CAF50',      // Green
    'medium': '#FFC107',   // Yellow
    'high': '#FF9800',     // Orange
    'overloaded': '#F44336' // Red
  }
  return colorMap[level] || '#9E9E9E'
}

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      distributed: true,
      columnWidth: '70%'
    }
  },
  colors: props.data.map(d => getWorkloadColor(d.level)),
  xaxis: {
    categories: props.data.map(d => d.attorney),
    labels: {
      rotate: -45,
      rotateAlways: true,
      trim: true,
      maxHeight: 120
    }
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
  annotations: {
    yaxis: [{
      y: 20,
      borderColor: '#999',
      label: {
        borderColor: '#999',
        style: {
          color: '#fff',
          background: '#999'
        },
        text: 'Ideal workload (20)'
      }
    }]
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 300
      },
      xaxis: {
        labels: {
          rotate: -90
        }
      }
    }
  }]
}))

const series = computed(() => [{
  name: 'Active Cases',
  data: props.data.map(d => d.count)
}])
</script>
