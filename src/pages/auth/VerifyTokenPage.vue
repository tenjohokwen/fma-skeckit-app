<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="auth-card q-pa-md" style="width: 100%; max-width: 450px;">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">
          {{ $t('auth.verifyToken.title') }}
        </div>

        <div v-if="!verificationSuccess" class="q-mb-md">
          <p class="text-body2 text-grey-7 text-center">
            {{ $t('auth.verifyToken.instructions') }}
          </p>
          <p class="text-body2 text-grey-7 text-center">
            <strong>{{ userEmail }}</strong>
          </p>
        </div>

        <!-- Success State -->
        <div v-if="verificationSuccess" class="text-center q-py-md">
          <q-icon name="check_circle" color="positive" size="64px" class="q-mb-md" />
          <p class="text-h6 text-positive q-mb-sm">
            {{ $t('auth.verifyToken.success') }}
          </p>
          <p class="text-body2 text-grey-7">
            {{ $t('auth.verifyToken.successMessage') }}
          </p>
        </div>

        <!-- Token Entry Form -->
        <q-form
          v-else
          @submit.prevent="handleSubmit"
          class="q-gutter-md"
        >
          <q-input
            v-model="token"
            :label="$t('auth.verifyToken.tokenLabel')"
            :hint="$t('auth.verifyToken.tokenHint')"
            outlined
            autofocus
            :disable="isVerifying"
            maxlength="50"
            counter
            :rules="[
              val => !!val || $t('auth.verifyToken.tokenRequired'),
              val => val.length >= 10 || $t('auth.verifyToken.tokenMinLength')
            ]"
          >
            <template #prepend>
              <q-icon name="vpn_key" />
            </template>
          </q-input>

          <!-- Error Message -->
          <q-banner
            v-if="errorMessage"
            class="bg-negative text-white"
            rounded
          >
            <template #avatar>
              <q-icon name="error" color="white" />
            </template>
            {{ errorMessage }}
          </q-banner>

          <!-- Submit Button -->
          <q-btn
            type="submit"
            :label="$t('auth.verifyToken.submitButton')"
            color="primary"
            class="full-width"
            :loading="isVerifying"
            :disable="!token || token.length < 10"
          />

          <!-- Resend Link -->
          <div class="text-center q-mt-md">
            <q-btn
              flat
              :label="$t('auth.verifyToken.resendLink')"
              color="primary"
              :loading="isResending"
              :disable="isVerifying"
              @click="handleResend"
            />
          </div>
        </q-form>

        <!-- Back to Login (shown after success) -->
        <div v-if="verificationSuccess" class="text-center q-mt-md">
          <q-btn
            :label="$t('auth.verifyToken.backToLogin')"
            color="primary"
            class="full-width"
            @click="goToLogin"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuth } from 'src/composables/useAuth';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();
const { verifyEmail, resendVerification } = useAuth();

const token = ref('');
const userEmail = ref('');
const isVerifying = ref(false);
const isResending = ref(false);
const verificationSuccess = ref(false);
const errorMessage = ref('');

onMounted(() => {
  // Get email from route query params (passed from signup page)
  userEmail.value = route.query.email || '';

  if (!userEmail.value) {
    $q.notify({
      type: 'negative',
      message: t('auth.verifyToken.emailMissing'),
      position: 'top'
    });
    router.push({ name: 'signup' });
  }
});

const handleSubmit = async () => {
  if (!token.value || token.value.length < 10) {
    return;
  }

  errorMessage.value = '';
  isVerifying.value = true;

  try {
    await verifyEmail(userEmail.value, token.value);
    verificationSuccess.value = true;

    $q.notify({
      type: 'positive',
      message: t('auth.verifyToken.successNotification'),
      position: 'top'
    });

    // Redirect to login after 2 seconds
    setTimeout(() => {
      goToLogin();
    }, 2000);

  } catch (error) {
    errorMessage.value = error.message || t('auth.verifyToken.errorDefault');

    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top'
    });
  } finally {
    isVerifying.value = false;
  }
};

const handleResend = async () => {
  if (!userEmail.value) {
    return;
  }

  isResending.value = true;
  errorMessage.value = '';

  try {
    await resendVerification(userEmail.value);

    $q.notify({
      type: 'positive',
      message: t('auth.verifyToken.resendSuccess'),
      position: 'top',
      timeout: 3000
    });

    // Clear the token field to prompt user to enter new token
    token.value = '';

  } catch (error) {
    errorMessage.value = error.message || t('auth.verifyToken.resendError');

    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top'
    });
  } finally {
    isResending.value = false;
  }
};

const goToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
.auth-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
