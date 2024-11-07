<script setup>
import { useLayout } from './composables/layout';
import { computed } from 'vue';
const { layoutConfig } = useLayout();
/*
uncomment this if you have the right logo
const logoUrl = computed(() => {
return `/layout/images/your_logo.png`;
});
and copy this in <img :src="logoUrl" alt="Your Logo" height="50" class="mr-0 lg:mr-2" /> </span>
*/
</script>

<template>
    <div class="layout-footer">
        Made with ❤️ by<span class="font-medium ml-2"> <img alt="Your Logo" height="50" class="mr-0 lg:mr-2" /> </span>
    </div>
</template>
<style lang="scss" scoped></style>
