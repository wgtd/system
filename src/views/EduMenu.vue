
<script setup lang="ts">

type MenuTreeItem = Vm.Func & { children?: MenuTreeItem[] }
interface PropType {
    list: MenuTreeItem[]
}
defineProps<PropType>()
</script>

<template>
    <template v-for="item in list">
        <!-- 非叶子节点 -->
        <el-sub-menu :index="item.func_id.toString()" v-if="item.func_key === ''" >
            <template #title>
                <el-icon>
                    <location />
                </el-icon>
                <span v-text="item.func_name"></span>
            </template>
            <!-- 组件递归调用出口，没有就是死循环 -->
            <EduMenu v-if="item.children" :list="item.children"></EduMenu>
        </el-sub-menu>
        <!-- 叶子节点 -->
        <el-menu-item v-else :index="item.func_key" >
            <el-icon>
                <Setting />
            </el-icon>
            <span v-text="item.func_name"></span>
        </el-menu-item>
    </template>
</template>

<style lang="stylus" scoped> 
</style>