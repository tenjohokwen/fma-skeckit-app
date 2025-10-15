<template>
  <q-card flat bordered class="client-details">
    <q-card-section>
      <div class="text-h6">{{ $t('client.details.personalInfo') }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- First Name -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.firstName')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">{{ client.firstName }}</div>
            </template>
          </q-field>
        </div>

        <!-- Last Name -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.lastName')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">{{ client.lastName }}</div>
            </template>
          </q-field>
        </div>

        <!-- National ID -->
        <div class="col-12 col-md-6">
          <q-field
            :label="$t('client.details.nationalId')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">{{ client.nationalId }}</div>
            </template>
          </q-field>
        </div>

        <!-- Telephone -->
        <div class="col-12 col-md-6" v-if="client.telephone">
          <q-field
            :label="$t('client.details.telephone')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">
                <q-icon name="phone" size="xs" class="q-mr-xs" />
                {{ client.telephone }}
              </div>
            </template>
          </q-field>
        </div>

        <!-- Email -->
        <div class="col-12 col-md-6" v-if="client.email">
          <q-field
            :label="$t('client.details.email')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body1">
                <q-icon name="email" size="xs" class="q-mr-xs" />
                {{ client.email }}
              </div>
            </template>
          </q-field>
        </div>

        <!-- Created At -->
        <div class="col-12 col-md-6" v-if="client.createdAt">
          <q-field
            :label="$t('common.createdAt')"
            stack-label
            borderless
            readonly
          >
            <template v-slot:control>
              <div class="text-body2 text-grey-7">
                {{ formatDate(client.createdAt) }}
              </div>
            </template>
          </q-field>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { date } from 'quasar'

// Props
defineProps({
  client: {
    type: Object,
    required: true
  }
})

// Methods
function formatDate(timestamp) {
  if (!timestamp) return ''

  try {
    // Handle different timestamp formats
    let dateObj
    if (typeof timestamp === 'string') {
      dateObj = new Date(timestamp)
    } else if (typeof timestamp === 'number') {
      dateObj = new Date(timestamp)
    } else {
      dateObj = timestamp
    }

    return date.formatDate(dateObj, 'YYYY-MM-DD HH:mm')
  } catch (e) {
    return timestamp
  }
}
</script>

<style scoped lang="scss">
.client-details {
  .q-field {
    padding-bottom: 8px;
  }

  .text-body1 {
    font-weight: 500;
  }
}
</style>
