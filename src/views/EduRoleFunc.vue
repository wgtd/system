<script setup lang="ts">
import { onMounted, reactive, ref, nextTick } from 'vue';
import { useRoleStore, useFuncStore } from '@/store';
import { httpBatch } from '@/utill/http';
import { RoleApi } from '@/api';
import { Message, Close, Setting, Delete, Edit } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage, FormInstance, FormRules } from 'element-plus';

const useRole = useRoleStore();
const useFunc = useFuncStore();
const treeRef = ref<any>(null);
const formRef = ref<FormInstance>()
const rule = reactive<FormRules>({
    role_name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 3, max: 5, message: '长度应该为 3 到 20之间', trigger: 'blur' },
    ]
})
const roleList = reactive<
    { isSetting: boolean, currentFuncs: Vm.Func[], model: HttpPayload.roleFunc }
>({
    isSetting: false,
    currentFuncs: [],
    model: {
        role_id: 0, role_func_ids: ''
    }
})
onMounted(async () => {
    try {
        await useRole.init()
        await httpBatch([() => useRole.init(), () => useFunc.init()])
    } catch (e) { }


})
const echoFuncs = () => {
    const checkedKeys = roleList.currentFuncs.reduce((result: Number[], item: Vm.Func) => {
        if (item.func_key !== '') result.push(item.func_id);
        return result
    }, [])
    treeRef.value.setCheckedKeys(checkedKeys);
}
const beforeSetting = async (role_id: number) => {
    //回显
    roleList.model.role_id = role_id;
    const funcs = await RoleApi.getRoleFuncs(role_id);
    roleList.currentFuncs = funcs;
    nextTick(() => {
        roleList.isSetting = true;
        nextTick(() => echoFuncs())
    })
}
const saveRoleFunc = async () => {
    //将树中的勾选和伴勾选的（root）除外的节点的key放到一个数组
    const checkedKeys = [...treeRef.value.getHalfCheckedKeys(), ...treeRef.value.getCheckedKeys()]
    if (checkedKeys.length > 1) checkedKeys.shift()
    roleList.model.role_func_ids = checkedKeys.join(',');
    await RoleApi.saveRoleFunc(roleList.model)
    roleList.isSetting = false
    //提示用户
    ElMessage({ type: 'success', message: `操作成功` })
}
const beforeEdit = (item: any) => {
    formRef.value?.resetFields()
    useRole.val.role_id = item.role_id
    useRole.val.role_name = item.role_name
    useRole.dialogVisible = true
}
const beforeAdd = () => {
    formRef.value?.resetFields()
    useRole.val.role_name = ''
    useRole.val.role_id=0 
    useRole.dialogVisible = true
}
const cancel = () => {
    useRole.dialogVisible = false
}
const remove=async (id:number)=>{
    try{
        await ElMessageBox.confirm('你确定要删除？','提示',{
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await httpBatch([() => useRole.remove(id), () => useRole.init()], true)
        ElMessage({
            showClose: true,
            message: `删除成功`,
            type: 'success'
        })
    }catch(e){
        ElMessage({
            showClose: true,
            message: `删除失败`,
            type: 'error'
        })
    }

}
const save = async (formEl: FormInstance | undefined) => {
    await formRef.value?.validate()
    if (!formEl) return 
    try {
        if(useRole.val.role_id===0){
            await httpBatch([() => useRole.add({ ...useRole.val }), () => useRole.init()], true)
            ElMessage({
                showClose: true,
                message: `添加成功`,
                type: 'success'
            })
        }
        else{
            await httpBatch([() => useRole.update({ ...useRole.val }), () => useRole.init()], true)
            ElMessage({
                showClose: true,
                message: `修改成功`,
                type: 'success'
            })
        }
        useRole.dialogVisible = false
    } catch (e) {}
}
</script>
<template>
    <el-row :gutter="12">
        <el-col :span="6" v-for="item in useRole.roleList" :key="item.role_id">
            <el-card shadow="hover">
                <div class="content">
                    <span>{{ item.role_name }}</span>
                </div>
                <div class="dialog">
                    <div class="dialog-content">
                        <span @click="beforeEdit(item)">
                            <el-icon :size="40">
                                <Edit />
                            </el-icon>
                        </span>
                        <span @click="remove(item.role_id)">
                            <el-icon :size="40">
                                <Delete />
                            </el-icon>
                        </span>
                        <span @click="beforeSetting(item.role_id)">
                            <el-icon :size="40">
                                <Setting />
                            </el-icon>
                        </span>
                    </div>
                </div>
            </el-card>
        </el-col>
        <el-col :span="6">
            <el-card style="background-color:#fff" shadow="hover" @click="beforeAdd">
                <div class="content">
                    <el-icon :size="20" color="blue">
                        <Plus />
                    </el-icon>
                </div>
            </el-card>
        </el-col>
    </el-row>
    <el-dialog v-model="useRole.dialogVisible" title="编辑教室" width="40%">
        <el-form ref="formRef" :model="useRole.val" :rules="rule">
            <el-form-item prop="role_name">
                <el-input v-model="useRole.val.role_name" placeholder="请输入教室名称" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="save(formRef)">确定</el-button>
            </span>
        </template>
    </el-dialog>
    <el-drawer v-model="roleList.isSetting" :show-close="false">
        <template #header>
            <h4>角色功能绑定</h4>
        </template>
        <template #default>
            <el-tree ref="treeRef" show-checkbox node-key="func_id" :data="useFunc.treeDate" class="custom-tree"
                :expand-on-click-node="false">
                <template #default="{ data }">
                    <span class="custom-tree-node">
                        <span>
                            <el-icon class="paperclip">
                                <Paperclip />
                            </el-icon>
                            <span>{{ data.func_name }}</span>
                        </span>
                    </span>
                </template>
            </el-tree>
        </template>
        <template #footer>
            <div style="flex: auto">
                <el-button @click="roleList.isSetting = false" :icon="Close">取消</el-button>
                <el-button type="warning" @click="echoFuncs">重置</el-button>
                <el-button type="primary" :icon="Message" @click="saveRoleFunc">确认</el-button>
            </div>
        </template>
    </el-drawer>
</template>
<style lang="stylus" scoped>
.el-row 
    width 100%
.el-card
    padding 20px
    position:relative
    background-color #409eff
    height 100px
    color #fff
    border-radius 50px
.el-card:hover .dialog
    display block
.el-card__body
    margin-top 13px!important
.dialog
    position absolute
    text-align center
    display none
    top 0
    left 0
    width 100%
    height 100%
    background rgba(0,0,0,0.2)
    .dialog-content
        display flex
        align-items center
        justify-content center
        span
            margin-top 50px
            margin-left 16px
            color #fff
.content
    font-size 20px
    display flex
    flex-wrap nowrap
    padding-top 15px
    justify-content center
    align-items center

.el-col
    min-width 200px
</style>