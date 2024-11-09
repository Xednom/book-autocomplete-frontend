<script setup lang="ts">
import { ref, computed } from 'vue';
import AppConfig from '@/layouts/AppConfig.vue';
const logoUrl = computed(() => {
    return '/layout/images/bvgels.png';
});
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const { signIn } = useAuth();

const loading = ref<boolean>(false);
const authError = ref<Record<string, unknown>>({});
const loginData = ref<{ username: string; password: string }>({
    username: '',
    password: ''
});

definePageMeta({
    auth: false,
    layout: false
});

const data = {
    username: loginData.value.username,
    password: loginData.value.password
};

const onSubmit = () => {
    loading.value = true;
    signIn({ username: data.username, password: data.password }, { callbackUrl: '/' })
        .then(() => {
            loading.value = false;
        })
        .catch((err) => {
            loading.value = false;
            const errorMessage = err.message;
            const errorCodeMatch = errorMessage.match(/: (\d{3})/);
            const errorCode = errorCodeMatch ? errorCodeMatch[1] : null;

            if (errorCode === '401' || errorCode === '400' || errorCode === '403' || errorCode === '405') {
                authError.value = 'Authentication Failed';
            } else if (errorMessage.includes('no response')) {
                authError.value = 'No response from server';
            } else {
                authError.value = errorMessage;
            }

            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: `${authError.value}`,
                life: 3000
            });
        });
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <!-- <img :src="logoUrl" alt="Bvgels logo" class="mb-5 w-6rem flex-shrink-0" /> -->
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Sign in to continue</div>
                    </div>
                    <Toast />
                    <form @submit.prevent="onSubmit">
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Username</label>
                        <InputText id="username" v-model="data.username" type="text" placeholder="Username" class="w-full md:w-30rem mb-5" style="padding: 1rem" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <InputText id="password" v-model="data.password" type="password" toggleMask placeholder="Username" class="w-full md:w-30rem mb-5" style="padding: 1rem" />

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <!-- <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Forgot password?</a> -->
                        </div>
                        <Button v-if="!loading" type="submit" label="Sign In" class="w-full p-3 text-xl"></Button>
                        <Button v-if="loading" label="Signing In..." class="w-full p-3 text-xl" disabled />
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}
.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
