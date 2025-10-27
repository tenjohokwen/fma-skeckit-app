<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-primary">{{ $t('dashboard.charts.casesPerAttorney') }}</div>
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

      <!-- Feature 016: Personal Metrics - Show current user indicator -->
      <div v-if="currentUserEntry" class="q-mt-sm q-pt-sm" style="border-top: 1px solid #eee;">
        <div class="row items-center justify-center">
          <q-icon name="person" size="16px" color="primary" class="q-mr-xs" />
          <span class="text-body2 text-grey-7">
            {{ $t('dashboard.personalMetrics.youLabel') }}:
            <strong class="text-primary">{{ currentUserEntry.count }}</strong>
            {{ $t('dashboard.personalMetrics.myCases').toLowerCase() }}
          </span>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'

// Register the component
const apexchart = VueApexCharts

const authStore = useAuthStore()
const { t: $t } = useI18n()

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Feature 016: Find current user's entry in attorney list
const currentUserEntry = computed(() => {
  const userEmail = authStore.user?.email
  if (!userEmail || !props.data) return null

  return props.data.find(attorney => attorney.attorney === userEmail)
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
