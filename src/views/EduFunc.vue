<script setup lang="ts">
import { Paperclip, Plus, Edit, Delete, Close, Message } from '@element-plus/icons-vue'
import { onMounted, reactive, ref, watch } from 'vue';
import { useFuncStore } from '@/store'
import append from './index'
import { ElMessage, ElMessageBox, FormInstance, FormRules, valueEquals } from 'element-plus'


const edit = reactive({
    isEdit: false,
    isLreaf: true,
    model: {
        func_fid: -1,
        func_name: "",
        func_key: "",
        func_id: 0
    }
})
const formRef = ref<FormInstance | null>()
const rule = reactive<FormRules>({
    func_name: [{
        validator: (rule: any, value: string, cb: any) => {
            if (value.length === 0)
                cb(new Error("功能名称不能为空"));
            else if (value.length < 2 || value.length > 50)
                cb(new Error("功能长度 2-50"));
            else if (funcStore._allFuncs.some(item =>
                item.func_id !== edit.model.func_id &&
                item.func_name === value &&
                item.func_fid === edit.model.func_fid
            ))
                cb(new Error(`当前父节点下已存在：'${value}'节点`));
            else cb()
        }, trigger: 'blur'
    }],
    func_key: [{
        validator: (rule: any, value: string, cb: any) => {
            if (edit.isLreaf && value === '')
                cb(new Error("叶子节点必须绑定模块"))
            else
                cb()
        }, trigger: 'change'
    }],
    func_fid: [{
        validator: (rule: any, value: string, cb: any) => {
            if (edit.model.func_id != 0)
                formRef.value?.validateField('func_name', () => null);
            else
                cb()
        }, trigger: 'change'
    }]
})
const beginadd = (func: Vm.treeDateItem) => {
    edit.model = { func_id: 0, func_name: "", func_key: "", func_fid: func.func_id };
    edit.isLreaf = false;
    formRef.value?.resetFields();
    edit.isEdit = true
}
watch(() => edit.isLreaf, newValue => {
    if (!newValue) edit.model.func_key = ""
});
const beginupdate = (func: Vm.treeDateItem) => {
    edit.model = {
        func_fid: func.func_fid,
        func_name: func.func_name,
        func_key: func.func_key,
        func_id: func.func_id,
    }
    edit.isLreaf = func.func_key !== ''
    formRef.value?.resetFields();
    edit.isEdit = true
}
const funcStore = useFuncStore();
const remove = async (func: Vm.treeDateItem) => {
    await ElMessageBox.confirm(
        `是否删除${func.func_name}这个菜单？`,
        '删除菜单', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    funcStore.remove(func.func_id)
    ElMessage({ type: 'success', message: `${func.func_name}已成功删除` })
}
const save = async () => {
    formRef.value?.validate()
    try {
         
        if (edit.model.func_id === 0) {
            await funcStore.add(edit.model);
        }
        else { 
            await funcStore.update(edit.model); }
        edit.isEdit = false;
        ElMessage({ message: `功能编辑成功 请重新登录已启用最新菜单...`, type: "success" })
    } catch (e) { console.log(e) }
}
onMounted(() => {
    funcStore.init()
})
</script>
<template>
    <el-tree class="custom-tree" :data="funcStore.treeDate" default-expand-all :expand-on-click-node="false">
        <template #default="{ data }">
            <span class="custom-tree-node">
                <span>
                    <el-icon class="paperclip">
                        <Paperclip />
                    </el-icon>
                    <span>{{ data.func_name }}</span>
                </span>
                <span>
                    <el-button type="text" :icon="Plus" v-if="data.func_key === ''" 
                    @click="beginadd(data)"></el-button>
                    <el-button type="text" :icon="Edit" v-if="![0, 1, 2].includes(data.func_id)"
                        
                        @click="beginupdate(data)"></el-button>
                    <el-button type="text" :icon="Delete" v-if="![0, 1, 2].includes(data.func_id)"
                        :disabled="!!data.children" @click="remove(data)"></el-button>
                </span>
            </span>
        </template>
    </el-tree>
    <el-dialog title="功能编辑" v-model="edit.isEdit" width="500px">
        <el-form label-position="right" label-width="100px" style="max-width: 460px" :rules="rule" status-icon
            ref="formRef" :model="edit.model">
            <el-form-item label="功能类型" >
                <el-radio-group class="ml-4" v-model="edit.isLreaf" :disabled="edit.model.func_key !== ''">
                    <el-radio :label="false" size="large">非叶子节点</el-radio>
                    <el-radio :label="true" size="large">叶子节点</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="父级功能" prop="func_fid">
                <el-select v-model="edit.model.func_fid" class="m-2" placeholder="Select" size="large"
                    :disabled="edit.model.func_key === ''">
                    <el-option label="Root" :value="0"></el-option>
                    <el-option :disabled="item.func_id === edit.model.func_fid" v-for="item in funcStore.noLeafFuncs"
                        :key="item.func_id" :label="item.func_name" :value="item.func_id" />
                </el-select>
            </el-form-item>
            <el-form-item label="功能名称" prop="func_name">
                <el-input placeholder="Please input" v-model="edit.model.func_name" />
            </el-form-item>
            <el-form-item label="功能对应组件" v-show="edit.isLreaf" prop="func_key">
                <el-select v-model="edit.model.func_key" class="m-2" placeholder="Select" size="large">
                    <el-option :label="v" :value="k" v-for="(v, k) in append"
                        ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="Message" @click="save">保存</el-button>
                <el-button :icon="Close" @click="edit.isEdit = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<style lang="stylus">
.custom-tree {
    width: 500px;
}
.custom-tree-node {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-grow: 1;
    }
.paperclip {
            color: rgb(9, 144, 255);
}
</style>