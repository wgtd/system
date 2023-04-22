<script setup lang="ts">
import { useDashboardStore} from '@/store';
const dashboard = useDashboardStore()
</script>

<template>
    <el-tabs type="card" closable @tab-remove="dashboard.closeFunc" v-model="dashboard.activeFuncKey">
            <el-tab-pane v-for="item in dashboard.openFuncs" :key="item.func_id"
            :label="item.func_name" :name="item.func_key">
            <router-view :name="item.func_key" v-slot="{ Component }" >
                <keep-alive>
                    <component :is="Component"></component>
                </keep-alive>
            </router-view>
        </el-tab-pane>
    </el-tabs>
</template>

<style lang="stylus" scoped> 
</style>