<template>
    <div>
        <div class="col-12 grid-margin stretch-card">
            <SettingForm/>
        </div>
    </div>
</template>
<script>
import SettingForm from '~/components/dashboard/form/Setting.vue'

export default {
    components: {
        SettingForm,
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'settings', subIsActive: 'setting-general' });
    },
}
</script>
