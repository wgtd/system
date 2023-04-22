<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { useDashboardStore, useAuthStore} from '@/store';
import { useRouter } from 'vue-router';
import EduMenu from './EduMenu.vue';
import EduTab from './EduTab.vue';
import { ElMessage } from 'element-plus';
const useAuth=useAuthStore()
const dashboard = useDashboardStore();
const away=()=>{
    sessionStorage.clear()
    router.replace('/')
    router.go(0)
    ElMessage({message: '退出登录成功',type:'success'})
}
onMounted(async () => {
    try {
        await dashboard.getMenu()
    } catch (e: any) { console.log(e.message) }
})
const router = useRouter();
watch(() => dashboard.activeFuncKey, (newFunckey: string) => {
    router.replace('/home/' + newFunckey)
}, { flush: 'post' })
</script>
<template>
    <el-container>
        <el-header height="80px">
            <div style="width:200px"></div>
            <div style="display:flex;justify-content:space-between;width:100%">
                <h1>潍坊科技学院教学管理系统 -v1.0</h1>
            <div style="display:flex;align-items:center;color:#fff;">
                 <img  src="../assets/xiong.png" 
                 style="width:40px;height:40px;border-radius:50%;margin-right:5px"/>
                 <span>&nbsp;</span>
                 <span>{{useAuth.userName}}</span>
                 <span>&nbsp;</span>
                 <el-button type="primary" @click="away">
                    退出登录
                 </el-button>
            </div>
            </div>
        </el-header>
        <el-container>
            <el-aside :width="dashboard.collapse ? '70px' : '250px'">
                <el-button @click="dashboard.collapse = !dashboard.collapse">
                    <el-icon v-if='dashboard.collapse' >
                        <ArrowRightBold />
                    </el-icon>
                    <el-icon v-else>
                        <ArrowLeftBold />
                    </el-icon>
                </el-button>
                <el-menu :default-active="dashboard.activeFuncKey" :collapse="dashboard.collapse === true"
                    class="el-menu-vertical-demo" @select="dashboard.openFunc" active-text-color="#ffd04b"
                    text-color="#fff" background-color="rgba(0,0,0,0)">
                    <EduMenu :list=dashboard.MenuTree />
                </el-menu>
            </el-aside>
            <el-container>
                <el-main>
                    <EduTab/>
                </el-main>
                <el-footer height="40px">
                    <p>&copy;版权所有</p>
                </el-footer>
            </el-container>
        </el-container>
    </el-container>
</template>


<style lang="stylus" scoped>
.el-header{
    background url('../assets/aside.jpg') no-repeat 
    background-size: 100% 
    background-position -5-px -80px
    display flex
    align-items center
}
h1{
    font-size 20px
    font-family "微软雅黑"
    color #fff
    letter-spacing 5px
}
.el-aside
    background url('../assets/aside.jpg') no-repeat 
    background-size: auto 100% 
    color #fff
    .el-menu
        border-right none!important
.el-footer
    background-color #46A3FF
</style>