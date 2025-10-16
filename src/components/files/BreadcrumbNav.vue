<template>
  <div class="breadcrumb-nav">
    <q-breadcrumbs
      v-if="breadcrumbs.length > 0"
      :class="breadcrumbClass"
      active-color="primary"
      separator-color="grey-5"
    >
      <!-- Home/Root Icon -->
      <q-breadcrumbs-el
        icon="home"
        :label="isMobile ? '' : $t('navigation.home')"
        :to="rootPath"
        class="breadcrumb-home"
      />

      <!-- Mobile: Show only last 2 segments with ellipsis -->
      <template v-if="isMobile && breadcrumbs.length > 2">
        <q-breadcrumbs-el
          icon="more_horiz"
          class="breadcrumb-ellipsis"
        />
        <q-breadcrumbs-el
          v-for="crumb in visibleMobileBreadcrumbs"
          :key="crumb.folderId"
          :label="truncateText(crumb.folderName, 15)"
          :to="crumb.isClickable ? crumb.route : undefined"
          :class="getBreadcrumbClass(crumb)"
          @click="crumb.isClickable ? handleBreadcrumbClick(crumb) : null"
        >
          <q-tooltip v-if="crumb.folderName.length > 15">
            {{ crumb.folderName }}
          </q-tooltip>
        </q-breadcrumbs-el>
      </template>

      <!-- Desktop/Mobile with <= 2 segments: Show all -->
      <template v-else>
        <q-breadcrumbs-el
          v-for="crumb in breadcrumbs"
          :key="crumb.folderId"
          :label="truncateText(crumb.folderName, maxLabelLength)"
          :to="crumb.isClickable ? crumb.route : undefined"
          :class="getBreadcrumbClass(crumb)"
          @click="crumb.isClickable ? handleBreadcrumbClick(crumb) : null"
        >
          <!-- Type icon for folders -->
          <template v-if="showIcons" v-slot:icon>
            <q-icon :name="getIconForType(crumb.type)" size="xs" />
          </template>

          <!-- Tooltip for long names -->
          <q-tooltip v-if="crumb.folderName.length > maxLabelLength">
            {{ crumb.folderName }}
          </q-tooltip>
        </q-breadcrumbs-el>
      </template>
    </q-breadcrumbs>

    <!-- Empty state: at root -->
    <div v-else class="breadcrumb-empty">
      <q-icon name="folder_open" size="sm" color="grey-5" />
      <span class="text-grey-6 q-ml-sm">{{ $t('navigation.root') }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useNavigation } from 'src/composables/useNavigation'

// Props
defineProps({
  // Root path for home navigation
  rootPath: {
    type: String,
    default: '/files'
  },
  // Show type icons next to breadcrumb labels
  showIcons: {
    type: Boolean,
    default: false
  },
  // Maximum label length before truncation
  maxLabelLength: {
    type: Number,
    default: 30
  }
})

// Emits
const emit = defineEmits(['navigate'])

// Composables
const $q = useQuasar()
const { breadcrumbs, popToIndex } = useNavigation()

// Computed
const isMobile = computed(() => {
  return $q.screen.lt.sm // Less than small breakpoint (< 600px)
})

const breadcrumbClass = computed(() => {
  return {
    'breadcrumb-mobile': isMobile.value,
    'breadcrumb-desktop': !isMobile.value
  }
})

/**
 * For mobile: show only last 2 breadcrumbs
 */
const visibleMobileBreadcrumbs = computed(() => {
  if (breadcrumbs.value.length <= 2) {
    return breadcrumbs.value
  }
  return breadcrumbs.value.slice(-2)
})

// Methods

/**
 * Get CSS class for breadcrumb element
 */
function getBreadcrumbClass(crumb) {
  return {
    'breadcrumb-clickable': crumb.isClickable,
    'breadcrumb-current': !crumb.isClickable,
    [`breadcrumb-${crumb.type}`]: true
  }
}

/**
 * Get icon for folder type
 */
function getIconForType(type) {
  const iconMap = {
    root: 'home',
    client: 'person',
    case: 'work',
    folder: 'folder'
  }
  return iconMap[type] || 'folder'
}

/**
 * Truncate text to max length
 */
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Handle breadcrumb click
 */
function handleBreadcrumbClick(crumb) {
  if (!crumb.isClickable) return

  // Update navigation store
  popToIndex(crumb.index)

  // Emit navigate event
  emit('navigate', {
    folderId: crumb.folderId,
    folderName: crumb.folderName,
    type: crumb.type,
    index: crumb.index
  })
}
</script>

<style lang="scss" scoped>
.breadcrumb-nav {
  padding: 8px 0;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.breadcrumb-home {
  font-weight: 500;
}

.breadcrumb-clickable {
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
}

.breadcrumb-current {
  font-weight: 500;
  color: var(--q-primary);
  cursor: default;
}

.breadcrumb-ellipsis {
  cursor: default;
  color: var(--q-grey-5);
}

.breadcrumb-empty {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: var(--q-grey-6);
}

// Mobile styles
.breadcrumb-mobile {
  :deep(.q-breadcrumbs__el) {
    font-size: 0.85rem;
  }

  :deep(.q-breadcrumbs__separator) {
    font-size: 0.85rem;
    margin: 0 4px;
  }
}

// Desktop styles
.breadcrumb-desktop {
  :deep(.q-breadcrumbs__el) {
    font-size: 0.95rem;
  }

  :deep(.q-breadcrumbs__separator) {
    margin: 0 8px;
  }
}

// Type-specific colors (optional)
.breadcrumb-client {
  color: var(--q-secondary);
}

.breadcrumb-case {
  color: var(--q-accent);
}

// Responsive: Prevent horizontal scroll on mobile
@media (max-width: 375px) {
  .breadcrumb-nav {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      height: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--q-grey-5);
      border-radius: 2px;
    }
  }
}
</style>
