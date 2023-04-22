<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { UserApi } from '@/api';
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/store';
const useAuth = useAuthStore()
const router = useRouter();
const formRef = ref<FormInstance>()
const passwordList = ref<HttpPayload.pwd>({
    user_name: '',
    oldPwd: '',
    newPwd: '',
    newPwd2:''
})
const rule = reactive<FormRules>({
    oldPwd:[
        { required:true,message:'请输入旧密码',trigger:'blur'}
    ],
    newPwd: [
        { required: true, message: '请输入新密码', trigger: 'blur' }
    ],
    newPwd2: [
        { required: true, message: '请在此输入新密码', trigger: 'blur' }
    ],
})
const save=async (formEl:FormInstance|undefined)=>{
    await formRef.value?.validate()
    if (!formEl) return
    if (useAuth.userName === 'admin') {
        ElMessage({
            type: 'error',
            message: '管理员请直接修改配置文件！',
        })
        return
    }
    if (passwordList.value.newPwd !== passwordList.value.newPwd2) {
        ElMessage({
            type: 'error',
            message: '两次密码不一致'
        })
        return;
    }
    try{
        passwordList.value.user_name=useAuth.userName
        await UserApi.changePwd(passwordList.value)
        ElMessage({
            type: 'success',
            message: '修改成功,请重新登录'
        })
        useAuth.token=''
        router.replace('/')
    }catch(e:any){
        ElMessage.error('原始密码错误！')
    }
}
</script>
<template>
    <el-form label-position='right' ref="formRef" label-width="120px" :model="passwordList" :rules="rule">
        <el-form-item label="原始密码" prop="oldPwd">
            <el-input v-model="passwordList.oldPwd" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
            <el-input v-model="passwordList.newPwd " />
        </el-form-item>
        <el-form-item label="确认密码" prop="newPwd2">
            <el-input v-model="passwordList.newPwd2" />
        </el-form-item>
        <el-form-item>
            <template #default="{ row }">
                <el-button>取消</el-button>
                <el-button type="primary" @click="save(formRef)">确认</el-button>
            </template>
        </el-form-item>
    </el-form>
</template>
<style lang="stylus" scoped> 


</style>
