<template>
  <q-card flat bordered class="case-list">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6">{{ $t('client.details.cases') }}</div>
        <q-btn
          v-if="canCreate"
          color="primary"
          :label="$t('client.details.createCase')"
          icon="add"
          unelevated
          @click="$emit('create-case')"
        />
      </div>
    </q-card-section>

    <q-separator />

    <!-- No Cases -->
    <q-card-section v-if="!cases || cases.length === 0">
      <div class="text-center q-py-lg">
        <q-icon name="folder_off" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">
          {{ $t('client.details.noCases') }}
        </div>
        <q-btn
          v-if="canCreate"
          color="primary"
          :label="$t('client.details.createCase')"
          icon="add"
          unelevated
          class="q-mt-md"
          @click="$emit('create-case')"
        />
      </div>
    </q-card-section>

    <!-- Cases List -->
    <q-list v-else separator>
      <q-item
        v-for="caseItem in sortedCases"
        :key="caseItem.caseId || caseItem.folderId"
        clickable
        v-ripple
        @click="$emit('case-click', caseItem)"
        class="case-item"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="folder" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ caseItem.caseId }}</q-item-label>
          <q-item-label caption>
            <div class="row items-center q-gutter-xs">
              <q-icon name="insert_drive_file" size="14px" />
              <span>{{ $t('client.details.fileCount', { count: caseItem.fileCount || 0 }) }}</span>
            </div>
          </q-item-label>
          <q-item-label caption v-if="caseItem.lastModified" class="q-mt-xs">
            <div class="row items-center q-gutter-xs">
              <q-icon name="schedule" size="14px" />
              <span>{{ formatDate(caseItem.lastModified) }}</span>
            </div>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="column items-end">
            <q-badge
              :label="getFileCountLabel(caseItem.fileCount)"
              color="primary"
              outline
            />
          </div>
        </q-item-section>

        <q-item-section side>
          <q-icon name="chevron_right" color="grey-6" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRoleAccess } from 'src/composables/useRoleAccess'

// Props
const props = defineProps({
  cases: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['case-click', 'create-case'])

// Composables
const { t } = useI18n()
const { canCreate } = useRoleAccess()

// Computed
const sortedCases = computed(() => {
  if (!props.cases || props.cases.length === 0) return []

  // Sort by creation date (newest first)
  return [...props.cases].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.lastModified || 0)
    const dateB = new Date(b.createdAt || b.lastModified || 0)
    return dateB - dateA
  })
})

// Methods
function formatDate(timestamp) {
  if (!timestamp) return ''

  try {
    let dateObj
    if (typeof timestamp === 'string') {
      dateObj = new Date(timestamp)
    } else if (typeof timestamp === 'number') {
      dateObj = new Date(timestamp)
    } else {
      dateObj = timestamp
    }

    return date.formatDate(dateObj, 'YYYY-MM-DD HH:mm')
  } catch {
    return timestamp
  }
}

function getFileCountLabel(count) {
  const num = count || 0
  if (num === 1) {
    return t('client.details.fileCount', { count: 1 })
  }
  return t('client.details.fileCount', { count: num })
}
</script>

<style scoped lang="scss">
.case-list {
  .case-item {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
  }
}
</style>
