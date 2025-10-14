<template>
  <div class="field-input" :class="{ 'field-required': required }">
    <!-- Text Input -->
    <q-input
      v-if="type === 'text' || type === 'email' || type === 'tel'"
      v-model="localValue"
      :label="label"
      :type="type"
      :required="required"
      :disable="disable"
      :readonly="readonly"
      :placeholder="placeholder"
      :hint="hint"
      :error="hasError"
      :error-message="errorMessage"
      outlined
      dense
      @update:model-value="handleInput"
      @blur="handleBlur"
    >
      <template v-if="icon" #prepend>
        <q-icon :name="icon" />
      </template>
    </q-input>

    <!-- Number Input -->
    <q-input
      v-else-if="type === 'number'"
      v-model.number="localValue"
      :label="label"
      type="number"
      :required="required"
      :disable="disable"
      :readonly="readonly"
      :placeholder="placeholder"
      :hint="hint"
      :error="hasError"
      :error-message="errorMessage"
      outlined
      dense
      @update:model-value="handleInput"
      @blur="handleBlur"
    >
      <template v-if="icon" #prepend>
        <q-icon :name="icon" />
      </template>
    </q-input>

    <!-- Date Input -->
    <q-input
      v-else-if="type === 'date'"
      v-model="localValue"
      :label="label"
      :required="required"
      :disable="disable"
      :readonly="readonly"
      :hint="hint"
      :error="hasError"
      :error-message="errorMessage"
      outlined
      dense
      @update:model-value="handleInput"
      @blur="handleBlur"
    >
      <template #prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="localValue" mask="YYYY-MM-DD">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <!-- Textarea -->
    <q-input
      v-else-if="type === 'textarea'"
      v-model="localValue"
      :label="label"
      :required="required"
      :disable="disable"
      :readonly="readonly"
      :placeholder="placeholder"
      :hint="hint"
      :error="hasError"
      :error-message="errorMessage"
      type="textarea"
      outlined
      dense
      :rows="rows || 3"
      @update:model-value="handleInput"
      @blur="handleBlur"
    />

    <!-- Select -->
    <q-select
      v-else-if="type === 'select'"
      v-model="localValue"
      :label="label"
      :options="options"
      :required="required"
      :disable="disable"
      :readonly="readonly"
      :hint="hint"
      :error="hasError"
      :error-message="errorMessage"
      outlined
      dense
      emit-value
      map-options
      @update:model-value="handleInput"
      @blur="handleBlur"
    >
      <template v-if="icon" #prepend>
        <q-icon :name="icon" />
      </template>
    </q-select>
  </div>
</template>

<script setup>
/**
 * FieldInput.vue
 *
 * Reusable input component with validation for case metadata editing.
 * Supports text, number, date, textarea, and select inputs.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed, watch } from 'vue'

const props = defineProps({
  /**
   * Field value (v-model)
   */
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  /**
   * Input type
   */
  type: {
    type: String,
    default: 'text',
    validator: (value) =>
      ['text', 'email', 'tel', 'number', 'date', 'textarea', 'select'].includes(value)
  },
  /**
   * Field label
   */
  label: {
    type: String,
    required: true
  },
  /**
   * Whether field is required
   */
  required: {
    type: Boolean,
    default: false
  },
  /**
   * Whether field is disabled
   */
  disable: {
    type: Boolean,
    default: false
  },
  /**
   * Whether field is readonly
   */
  readonly: {
    type: Boolean,
    default: false
  },
  /**
   * Placeholder text
   */
  placeholder: {
    type: String,
    default: ''
  },
  /**
   * Hint text
   */
  hint: {
    type: String,
    default: ''
  },
  /**
   * Icon name
   */
  icon: {
    type: String,
    default: ''
  },
  /**
   * Number of rows for textarea
   */
  rows: {
    type: Number,
    default: 3
  },
  /**
   * Options for select input
   */
  options: {
    type: Array,
    default: () => []
  },
  /**
   * Validation rules
   */
  rules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'blur'])

// Local state
const localValue = ref(props.modelValue)
const touched = ref(false)
const validationError = ref('')

// Computed
const hasError = computed(() => {
  return touched.value && validationError.value !== ''
})

const errorMessage = computed(() => {
  return validationError.value
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue
  }
)

// Methods
function handleInput(value) {
  emit('update:modelValue', value)
  if (touched.value) {
    validate(value)
  }
}

function handleBlur() {
  touched.value = true
  validate(localValue.value)
  emit('blur')
}

function validate(value) {
  validationError.value = ''

  // Required validation
  if (props.required && (value === null || value === undefined || value === '')) {
    validationError.value = 'This field is required'
    return false
  }

  // Custom rules
  for (const rule of props.rules) {
    const result = rule(value)
    if (result !== true) {
      validationError.value = result
      return false
    }
  }

  return true
}

// Expose validation method
defineExpose({
  validate: () => validate(localValue.value),
  hasError
})
</script>

<style scoped>
.field-input {
  margin-bottom: 1rem;
}

.field-required :deep(.q-field__label:after) {
  content: ' *';
  color: var(--q-negative);
}
</style>
