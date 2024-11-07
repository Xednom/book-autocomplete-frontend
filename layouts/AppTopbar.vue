<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from './composables/layout';
import { useRouter } from 'vue-router';
import Menu from 'primevue/menu';

const { layoutConfig, onMenuToggle } = useLayout();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

onMounted(() => {
    bindOutsideClickListener();
});
onBeforeUnmount(() => {
    unbindOutsideClickListener();
});
/*
/*
uncomment this if you have the right logo
const logoUrl = computed(() => {
return `/layout/images/your_logo.png`;
});
and copy this in <img :src="logoUrl" alt="Your Logo" height="50" class="mr-0 lg:mr-2" /> </span>
*/

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};

const onSettingsClick = () => {
    topbarMenuActive.value = false;
    router.push('/utilities/documentation');
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };

        document.addEventListener('click', outsideClickListener.value);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;
    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

// const { data, signOut } = useAuth();
const menu = ref();
const items = ref([
    {
        separator: true
    },
    {
        label: 'Profile',
        items: [
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                shortcut: '⌘+Q'
            }
        ]
    },
    {
        separator: true
    }
]);
const toggle = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />
            <span>Your Company name</span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" :class="topbarMenuClasses">
            <Button type="button" icon="pi pi-user" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"><i class="pi pi-user"></i></Button>
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
                <template #start>
                    <span class="inline-flex align-items-center gap-1 px-2 py-2">
                        <span class="text-xl font-semibold">Your Company<span class="text-primary"> Name</span></span>
                    </span>
                </template>
                <template #item="{ item, props }">
                    <a v-ripple @click="() => signOut({ callbackUrl: '/auth/login' })" class="flex align-items-center" v-bind="props.action">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                        <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                        <span v-if="item.shortcut" class="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{{ item.shortcut }}</span>
                    </a>
                </template>
                <template #end>
                    <button v-ripple class="relative overflow-hidden w-full p-link flex align-items-center p-2 pl-3 text-color hover:surface-200 border-noround">
                        <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" class="mr-2" shape="circle" />
                        <span class="inline-flex flex-column">
                            <span class="font-bold">Welcome, {{ data.first_name }} {{ data.last_name }}</span>
                            <span class="text-sm" v-if="data.is_superuser">Admin</span>
                            <span class="text-sm" v-else>Staff</span>
                        </span>
                    </button>
                </template>
            </Menu>
        </button>

        <!-- <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <Button type="button" icon="pi pi-user" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
                <template #start>
                    <span class="inline-flex align-items-center gap-1 px-2 py-2">
                        <span class="text-xl font-semibold">Your Company<span class="text-primary"> Name</span></span>
                    </span>
                </template>
                <template #item="{ item, props }">
                    <a v-ripple @click="() => signOut({ callbackUrl: '/auth/login' })" class="flex align-items-center" v-bind="props.action">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                        <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                        <span v-if="item.shortcut" class="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{{ item.shortcut }}</span>
                    </a>
                </template>
                <template #end>
                    <button v-ripple class="relative overflow-hidden w-full p-link flex align-items-center p-2 pl-3 text-color hover:surface-200 border-noround">
                        <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" class="mr-2" shape="circle" />
                        <span class="inline-flex flex-column">
                            <span class="font-bold">Welcome, {{ data.first_name }} {{ data.last_name }}</span>
                            <span class="text-sm" v-if="data.is_superuser">Admin</span>
                            <span class="text-sm" v-else>Staff</span>
                        </span>
                    </button>
                </template>
            </Menu>
        </div> -->
    </div>
</template>

<style lang="scss" scoped></style>
