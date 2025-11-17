<template>
  <a-modal
    v-model:open="visible"
    :title="$t('pipeline.create.title')"
    width="600px"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="create-pipeline-modal">
      <!-- Pipeline Type Selection -->
      <div class="form-section">
        <label class="section-label required">
          {{ $t('pipeline.create.pipelineType') }}
        </label>
        <div class="pipeline-type-cards">
          <div
            class="type-card"
            :class="{ selected: formData.type === 'batch' }"
            @click="formData.type = 'batch'"
          >
            <div class="type-card-icon">
              <DatabaseOutlined />
            </div>
            <div class="type-card-content">
              <h4>{{ $t('pipeline.create.batchPipeline') }}</h4>
              <p>{{ $t('pipeline.create.batchDescription') }}</p>
            </div>
            <div class="type-card-radio">
              <a-radio :checked="formData.type === 'batch'" />
            </div>
          </div>

          <div
            class="type-card"
            :class="{ selected: formData.type === 'streaming' }"
            @click="formData.type = 'streaming'"
          >
            <div class="type-card-icon streaming">
              <ThunderboltOutlined />
            </div>
            <div class="type-card-content">
              <h4>{{ $t('pipeline.create.streamingPipeline') }}</h4>
              <p>{{ $t('pipeline.create.streamingDescription') }}</p>
            </div>
            <div class="type-card-radio">
              <a-radio :checked="formData.type === 'streaming'" />
            </div>
          </div>
        </div>
      </div>

      <!-- Pipeline Name -->
      <div class="form-section">
        <label class="section-label required">
          {{ $t('pipeline.create.pipelineName') }}
        </label>
        <a-input
          v-model:value="formData.name"
          :placeholder="$t('pipeline.create.namePlaceholder')"
          size="large"
          @input="validateName"
        />
        <div v-if="nameError" class="error-message">
          {{ nameError }}
        </div>
      </div>

      <!-- Pipeline Description -->
      <div class="form-section">
        <label class="section-label">
          {{ $t('pipeline.create.description') }}
          <span class="optional-label">{{ $t('pipeline.create.optional') }}</span>
        </label>
        <a-textarea
          v-model:value="formData.description"
          :placeholder="$t('pipeline.create.descriptionPlaceholder')"
          :rows="3"
          :maxlength="500"
          show-count
        />
      </div>

      <!-- Save Location -->
      <div class="form-section">
        <label class="section-label">
          {{ $t('pipeline.create.saveLocation') }}
        </label>
        <a-select
          v-model:value="formData.location"
          :placeholder="$t('pipeline.create.locationPlaceholder')"
          size="large"
          style="width: 100%"
        >
          <a-select-option value="/pipelines">
            <FolderOutlined style="margin-right: 8px" />
            /pipelines
          </a-select-option>
          <a-select-option value="/pipelines/data-processing">
            <FolderOutlined style="margin-right: 8px" />
            /pipelines/data-processing
          </a-select-option>
          <a-select-option value="/pipelines/analytics">
            <FolderOutlined style="margin-right: 8px" />
            /pipelines/analytics
          </a-select-option>
          <a-select-option value="/pipelines/integration">
            <FolderOutlined style="margin-right: 8px" />
            /pipelines/integration
          </a-select-option>
        </a-select>
        <div class="location-hint">
          <InfoCircleOutlined />
          {{ $t('pipeline.create.locationHint') }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-footer">
        <a-button @click="handleClose" size="large">
          {{ $t('pipeline.create.cancel') }}
        </a-button>
        <a-button
          type="primary"
          size="large"
          :disabled="!canCreate"
          :loading="creating"
          @click="handleCreate"
        >
          {{ $t('pipeline.create.createButton') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import {
  DatabaseOutlined,
  ThunderboltOutlined,
  FolderOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'create', data: CreatePipelineData): void
}>()

interface CreatePipelineData {
  type: 'batch' | 'streaming'
  name: string
  description?: string
  location: string
}

const { t } = useI18n()

// State
const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const formData = ref<CreatePipelineData>({
  type: 'batch',
  name: '',
  description: '',
  location: '/pipelines'
})

const creating = ref(false)
const nameError = ref('')

// Computed
const canCreate = computed(() => {
  return (
    formData.value.name.trim() !== '' &&
    !nameError.value &&
    formData.value.location !== ''
  )
})

// Watchers
watch(() => props.open, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// Methods
function validateName() {
  const name = formData.value.name.trim()

  if (name === '') {
    nameError.value = ''
    return
  }

  // Check length
  if (name.length < 3) {
    nameError.value = t('pipeline.create.nameErrorTooShort')
    return
  }

  if (name.length > 100) {
    nameError.value = t('pipeline.create.nameErrorTooLong')
    return
  }

  // Check valid characters (alphanumeric, spaces, hyphens, underscores)
  const validNameRegex = /^[a-zA-Z0-9\s\-_\u4e00-\u9fa5]+$/
  if (!validNameRegex.test(name)) {
    nameError.value = t('pipeline.create.nameErrorInvalidChars')
    return
  }

  nameError.value = ''
}

function handleCreate() {
  validateName()

  if (!canCreate.value) {
    return
  }

  creating.value = true

  // Simulate API call
  setTimeout(() => {
    emit('create', {
      type: formData.value.type,
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || undefined,
      location: formData.value.location
    })

    message.success(t('pipeline.create.createSuccess'))
    creating.value = false
    handleClose()
  }, 500)
}

function handleClose() {
  emit('update:open', false)
  // Reset form after animation
  setTimeout(() => {
    resetForm()
  }, 300)
}

function resetForm() {
  formData.value = {
    type: 'batch',
    name: '',
    description: '',
    location: '/pipelines'
  }
  nameError.value = ''
  creating.value = false
}
</script>

<style scoped lang="less">
.create-pipeline-modal {
  .form-section {
    margin-bottom: 24px;

    &:last-of-type {
      margin-bottom: 32px;
    }

    .section-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      margin-bottom: 12px;

      &.required::after {
        content: ' *';
        color: #F5222D;
      }

      .optional-label {
        font-weight: 400;
        color: #5F6368;
        font-size: 13px;
        margin-left: 4px;
      }
    }

    .error-message {
      margin-top: 8px;
      font-size: 13px;
      color: #F5222D;
    }

    .location-hint {
      margin-top: 8px;
      font-size: 12px;
      color: #5F6368;
      display: flex;
      align-items: center;
      gap: 6px;

      .anticon {
        font-size: 14px;
      }
    }
  }

  .pipeline-type-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .type-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 2px solid #E4E7EB;
      border-radius: 8px;
      background: #FFFFFF;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #1570EF;
        background: #F8FAFC;
      }

      &.selected {
        border-color: #1570EF;
        background: #EFF6FF;
        box-shadow: 0 0 0 3px rgba(21, 112, 239, 0.1);
      }

      .type-card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: #1570EF;
        color: #FFFFFF;
        font-size: 24px;
        flex-shrink: 0;

        &.streaming {
          background: #7C3AED;
        }
      }

      .type-card-content {
        flex: 1;
        min-width: 0;

        h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: #212121;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #5F6368;
          line-height: 1.5;
        }
      }

      .type-card-radio {
        flex-shrink: 0;
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #E4E7EB;
  }
}

// Override Ant Design styles
:deep(.ant-input-affix-wrapper),
:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-textarea-show-count::after) {
  border-radius: 6px;
}

:deep(.ant-input-affix-wrapper:focus),
:deep(.ant-input:focus),
:deep(.ant-select-focused .ant-select-selector) {
  border-color: #1570EF;
  box-shadow: 0 0 0 2px rgba(21, 112, 239, 0.1);
}

:deep(.ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
  background-color: #EFF6FF;
  color: #1570EF;
}
</style>
