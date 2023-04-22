<script setup lang="ts">
import { Search, Edit, Delete, Setting } from '@element-plus/icons-vue';
import { useRoleStore } from '@/store';
import { onMounted, reactive, ref, nextTick } from 'vue';
import { UserApi } from '@/api';
import { ElMessage, ElMessageBox, FormRules, FormInstance } from 'element-plus';
import { httpBatch } from '@/utill/http';


const useRole = useRoleStore();
const formRef = ref<FormInstance | null>()
const tabelRef = ref<any>()
const edit = reactive<{ isEdit: boolean, type: 0 | 1 | 2, model: HttpPayload.configRole }>({
    isEdit: false,
    type: 1,//，2表示角色分配，1表示进入添加
    model: {
        user_name: '',
        role_id: 0
    }
});
const rule = reactive<FormRules>({
    user_name: [
        {
            required: true, message: '用户名不为空', trigger: 'blur'
        }, 
        {
            min: 3, max: 20, message: '长度为3~20之间 ', trigger: 'change'
        }]
})
const SearchModle = reactive<HttpPayload.userSearch>({
    role_id: -1,
    user_name: '',
    begin: 0,
    pageSize: 5
})
const userList = ref<Vm.userRole[]>([])
const pagination = reactive({
    total: 0, currentPage: 1
})

const getData = async (formPage1 = true) => {
    if (formPage1) pagination.currentPage = 1;
    SearchModle.begin = (pagination.currentPage - 1) * SearchModle.pageSize
    try {
        const { total, list } = await UserApi.getUser(SearchModle);
        if (total > 0 && list.length === 0) {
            pagination.currentPage = Math.ceil(total / SearchModle.pageSize);
            await getData(false)
            return
        }
        pagination.total = total;
        userList.value = list;
    } catch (e: any) { console.log(e.message) }
}
onMounted(async () => {
    try {
        await httpBatch([() => useRole.init(), () => getData()])
    } catch (e: any) { console.log(e.message) }
})

const indexMethods = (val: number) => {
    return (pagination.currentPage - 1) * SearchModle.pageSize + val + 1;
}
const remove = async (user: Vm.userRole) => {
    await ElMessageBox.confirm(
        `是否删除${user.user_name}这个菜单？`,
        '删除菜单', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await httpBatch([() => UserApi.remove(user.user_name), () => getData(false)])
    ElMessage({ type: 'success', message: `${user.user_name}以成功删除` })
}
const resetPwd = async (user: Vm.userRole) => {
    await ElMessageBox.confirm(
        `要重置${user.user_name}这个用户的密码？`,
        '删除菜单', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await UserApi.resetpwd(user.user_name)
    ElMessage({ type: 'success', message: `用户${user.user_name}的密码重置成功` })
}
const beginAdd = () => {
    edit.type = 1
    edit.model.user_name = ''
    formRef.value?.resetFields();
    edit.isEdit = true
}
const beginConfigRole = (user: Vm.userRole) => {
    edit.type = 2
    formRef.value?.resetFields();//表单重置
    edit.model.user_name = user.user_name
    edit.model.role_id = user.role_id || 0
    
    edit.isEdit = true
}

const save = async () => {
    try {
        if (edit.type === 1) {
            await formRef.value?.validate();
            //判断用户名重复
            const nameVal = await UserApi.validateName(edit.model.user_name);
            if (nameVal === 1) {
                ElMessageBox.alert(`用户${edit.model.user_name}已存在`, 'Warning', { type: 'error' })
                return
            }
            SearchModle.user_name = '';
            SearchModle.role_id = -1;
            await httpBatch([() => UserApi.add(edit.model.user_name), () => getData()], true)
            edit.isEdit = false;
            ElMessageBox.alert(`用户${edit.model.user_name}新增成功`, 'Tips', { type: 'success' })
            //让新增的数据在表格中高亮显示
            nextTick(() => {
                let i = userList.value.findIndex(item => item.user_name === edit.model.user_name)
                tabelRef.value.setCurrentRow(userList.value[i])
            })
        } else {
            await UserApi.configRole(edit.model);
            const i = userList.value.findIndex(item => item.user_name === edit.model.user_name)
            userList.value[i].role_id = edit.model.role_id === 0 ? null : edit.model.role_id
            edit.isEdit = false;
            ElMessage({ type: 'success', message: `用户${edit.model.user_name}角色编辑成功` });
        }
    } catch (e) { }

}
</script>

<template>
    <el-container>
        <el-header height="50px">
            <el-form label-width="120px" inline>
                <el-form-item>
                    <el-input :prefix-icon="Search" label="用户名字" v-model="SearchModle.user_name" @change="getData()" />
                </el-form-item>
                <el-form-item label="用户角色">
                    <el-select v-model="SearchModle.role_id" @change="getData()">
                        <el-option :value="-1" label="-全部-"></el-option>
                        <el-option :value="0" label="-无角色-"></el-option>
                        <el-option v-for='item in useRole.roleList' :key="item.role_id" :label="item.role_name"
                            :value="item.role_id" />
                    </el-select>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main style="height:400px!important;min-width:700px">
            <el-table style="width:100%;" :data="userList" border stripe ref='tabelRef' highlight-current-row>
                <el-table-column type="index" :index="indexMethods" label="#" />
                <el-table-column prop="user_name" align="center" label="用户名" width="150" />
                <el-table-column prop="role_id" label="角色" width="150">
                    <template #default="{ row }">
                        <span v-if="row.role_id">
                            {{ useRole.roleList.find(item => item.role_id === row.role_id)?.role_name }}
                        </span>
                        <span v-else style="color:#ccc">-无角色-</span>
                    </template>
                </el-table-column>
                <el-table-column style="min-width:400px">
                    <template #header>
                        <span style="margin-right:20px">操作</span>
                        <el-button type="success" @click="beginAdd">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            新增
                        </el-button>
                    </template>
                    <template #default="{ row }">
                        <el-button type="primary" :icon="Edit" @click="resetPwd(row)">重置密码</el-button>
                        <el-button type="success" :icon="Setting" @click="beginConfigRole(row)">设置角色</el-button>
                        <el-button type="danger" :icon="Delete" @click="remove(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog v-model="edit.isEdit" :title="edit.type === 1 ? '添加用户' : '设置角色'">
                <el-form :model="edit.model" :rules="rule" ref="formRef">
                    <el-form-item label="用户名称" prop="user_name">
                        <el-input :prefix-icon="Search" label="用户名字" v-model="edit.model.user_name"
                            :disabled='edit.type === 2' />
                    </el-form-item>
                    <el-form-item label="用户角色" v-show='edit.type === 2'>
                        <el-select v-model="edit.model.role_id">
                            <el-option :value="0" label="-无角色-"></el-option>
                            <el-option v-for='item in useRole.roleList' :key="item.role_id" :label="item.role_name"
                                :value="item.role_id" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button type="primary" @click="save">
                        <el-icon>
                            <Message />
                        </el-icon>
                        确认
                    </el-button>
                    <el-button @click="edit.isEdit = false">
                        <el-icon>
                            <Close />
                        </el-icon>
                        取消
                    </el-button>
                </template>
            </el-dialog>
        </el-main>
        <el-footer height="36px">
            <el-pagination background :page-sizes="[5, 8, 10, 12]" v-model:page-size="SearchModle.pageSize"
                v-model:current-page="pagination.currentPage" layout="prev, pager,next,jumper, ->,sizes,total"
                :total="pagination.total" @size-change='getData()' @current-change='getData(false)' />
        </el-footer>
    </el-container>
</template>

<style lang="stylus" scoped> 

</style>