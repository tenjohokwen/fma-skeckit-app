<template>
  <q-card flat bordered class="client-search-results">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6">
          {{ $t('client.search.results', { count: results.length }) }}
        </div>
        <q-btn
          v-if="showCreateButton && canCreate"
          color="primary"
          :label="$t('client.search.createNew')"
          icon="add"
          unelevated
          @click="$emit('create-client')"
        />
      </div>
    </q-card-section>

    <q-separator />

    <!-- Loading State -->
    <q-card-section v-if="loading">
      <div class="row justify-center q-py-xl">
        <q-spinner-dots color="primary" size="50px" />
      </div>
    </q-card-section>

    <!-- No Results -->
    <q-card-section v-else-if="results.length === 0">
      <div class="text-center q-py-xl">
        <q-icon name="search_off" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">
          {{ $t('client.search.noResults') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-sm">
          {{ $t('client.search.noResultsHint') }}
        </div>
        <q-btn
          v-if="canCreate"
          color="primary"
          :label="$t('client.search.createNew')"
          icon="add"
          unelevated
          class="q-mt-md"
          @click="$emit('create-client')"
        />
      </div>
    </q-card-section>

    <!-- Results List -->
    <q-list v-else separator>
      <q-item
        v-for="client in results"
        :key="client.clientId"
        clickable
        v-ripple
        @click="$emit('select-client', client)"
        class="client-item"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="person" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            {{ client.firstName }} {{ client.lastName }}
          </q-item-label>
          <q-item-label caption>
            <div class="row items-center q-gutter-sm">
              <q-icon name="badge" size="14px" />
              <span>{{ client.nationalId }}</span>
            </div>
          </q-item-label>
          <q-item-label caption v-if="client.telephone || client.email">
            <div class="row items-center q-gutter-sm q-mt-xs">
              <q-icon v-if="client.telephone" name="phone" size="14px" />
              <span v-if="client.telephone">{{ client.telephone }}</span>
              <q-icon v-if="client.email" name="email" size="14px" class="q-ml-sm" />
              <span v-if="client.email">{{ client.email }}</span>
            </div>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="column items-end q-gutter-xs">
            <q-btn
              flat
              dense
              round
              color="primary"
              icon="folder"
              size="sm"
              @click.stop="$emit('view-client', client)"
            >
              <q-tooltip>{{ $t('client.view.tooltip') }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="canCreate"
              flat
              dense
              round
              color="positive"
              icon="create_new_folder"
              size="sm"
              @click.stop="$emit('create-case', client)"
            >
              <q-tooltip>{{ $t('client.createCase.tooltip') }}</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup>
import { useRoleAccess } from 'src/composables/useRoleAccess'

// Role-based access control
const { canCreate } = useRoleAccess()

// Props
defineProps({
  results: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showCreateButton: {
    type: Boolean,
    default: true
  }
})

// Emits
defineEmits([
  'select-client',
  'view-client',
  'create-client',
  'create-case'
])
</script>

<style scoped lang="scss">
.client-search-results {
  max-width: 800px;
  margin: 0 auto;
}

.client-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}
</style>
