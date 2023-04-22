<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { FormInstance, FormRules, ElMessage, ElMessageBox } from 'element-plus'
import { UserApi } from '@/api';
import {useAuthStore} from '@/store'
const router=useRouter();
const formRef = ref<FormInstance>()
const ruleForm = reactive<HttpPayload.login>({
    user_name: '',
    user_pwd: ''
})
const rules: FormRules = {
    user_name: [
        { required: true, message: '用户名不能为空', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度3~20', trigger: 'blur' },
    ],
    user_pwd: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 3, max: 20, message: '密码长度3~20', trigger: 'blur' },
    ],
}
const login = async () => {
    try {
        await formRef.value?.validate();
        const  token = await UserApi.login(ruleForm);
        //将name和token存入pinia
        const AuthStore=useAuthStore();
         AuthStore.login(ruleForm.user_name,token)
        //提示用户，过一会自动消失
        ElMessage({
            showClose: true,
            message: `${ruleForm.user_name}欢迎登录潍坊科技管理系统！`,
            type:'success'
        })
        //登录成功跳转
        router.replace('/home')
    } catch (e: any){
        ElMessage(
            {
                type: 'error',
                message: '用户名或密码错误'
            }
        )
    }

}

</script>

<template>
    <div class="login">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <h4>潍坊教学管理系统</h4>
                </div>
            </template>
            <el-form :model="ruleForm" :rules="rules" ref="formRef" status-icon>
                <el-form-item prop="user_name">
                    <el-input placeholder="请输入用户名" :prefix-icon="User" v-model.trim="ruleForm.user_name">
                        <template #prepend>
                            <span>账号:</span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="user_pwd">
                    <el-input type="password" :prefix-icon="Lock" placeholder="请输入密码" v-model="ruleForm.user_pwd">
                        <template #prepend>
                            <span>密码:</span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login">登录系统</el-button>
                </el-form-item>
            </el-form>
        </el-card>

    </div>
</template>

<style lang="stylus" scoped> 
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 350px;
  position:fixed;
  top:200px
  right:100px
}
.login
    width 106vw
    height 100vh
    background-image:url('../assets/wf.jpg')
    background-size 100% 100%
    
</style>