<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useStaffStore } from '@/store';
import { Edit, Delete, Search } from '@element-plus/icons-vue';
import { FormInstance, FormRules, ElMessage, ElMessageBox } from 'element-plus';
import { httpBatch } from '@/utill/http';

const useStaff = useStaffStore();
const isEdit = ref<boolean>(false)
const currentPage4 = ref(1)//保存当前页数
const pageSize4 = ref(5) //保存当前页码
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
    stf_name: [
        { required: true, message: '请输入员工姓名', trigger: 'blur' },
        { min: 2, max: 30, message: '姓名长度在2~30位之间', trigger: 'change' },
    ],
})
let ruleForm = reactive<Vm.ruleForm>({
            stf_id: -1, 
            stf_name: "",
            stf_remark: "", 
            stf_category: 4, 
            stf_invalid: 1
        })

//增加
const beforeadd = () => {
    ruleFormRef.value?.resetFields()
    ruleForm.stf_id = -1;
    ruleForm.stf_name = '';
    ruleForm.stf_category = 0;
    ruleForm.stf_remark = '';
    ruleForm.stf_invalid = 0
    isEdit.value = true
}
//cancel
const cancel = () => {
    isEdit.value = false;
    ruleFormRef.value?.resetFields();
}
//编辑
const edit = (val: Vm.ruleForm) => {
    ruleFormRef.value?.resetFields()
    ruleForm = { ...val }
    isEdit.value = true

}
//离职,入职
const remove = async (val :any) => {
    
    try{
        await ElMessageBox.confirm('您确定要进行离职？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        })
        val.stf_invalid === 1 ? useStaff.quit(val.stf_id) : useStaff.entry(val.stf_id)
    }catch(e){}
    
}
//保存
const save = async (formEl: FormInstance|undefined) => {
    await ruleFormRef.value?.validate()
    if (!formEl) return
    try {
        //名称重复
        var repeat= useStaff.Tabel.list.filter(item => item.stf_name === ruleForm.stf_name)
        console.log(repeat)
        if (repeat.length>=1) {
            ElMessage({
                showClose: true,
                message: `名称重复`,
                type: 'error'
            })
            return 
        }
        //添加
        if (ruleForm.stf_id === -1)
            await httpBatch([() => useStaff.Add(ruleForm), () => useStaff.getList(useStaff.List)], true)
        //修改
        else await httpBatch([() => useStaff.update(ruleForm), () => useStaff.getList(useStaff.List)], true)
        isEdit.value = false;
        ElMessage({ message: `保存成功`, type: "success" })
    } catch (e) { 
        ElMessage({ message: `名称不能为空`, type: "success" })
     }
}
function searchIndentify(val: number) {
    let Indentify = useStaff.Identify.filter(item => item.dic_id === val)
    return Indentify[0].dic_name
}
//搜索条件
function search() {
    useStaff.List.pageSize = pageSize4.value;
    useStaff.List.begin = (currentPage4.value - 1) * pageSize4.value
    useStaff.getList(useStaff.List)
}
//控制显示页数
const handleSizeChange = (val: number) => {
    pageSize4.value = val
    search()
}
//控制显示条数
const handleCurrentChange = (val: number) => {
    console.log(`current page: ${val}`)
    currentPage4.value = val;
    search()
}
onMounted(() => {
    useStaff.List = {
        stf_category: 0,
        stf_name: "",
        begin: 0,
        pageSize: 5,
    }
    search()
})
</script>

<template>
    <el-container>
        <el-header height="80px">
            <el-form label-width="120px" inline>
                <el-form-item :prefix-icon="Search" label="用户名字">
                    <el-input placeholder="请输入姓名进行搜索" v-model="useStaff.List.stf_name" @change='search' />
                </el-form-item>
                <el-form-item label="用户角色">
                    <el-select v-model="useStaff.List.stf_category" @change="search">
                        <el-option label='-请选择-' :value="0"></el-option>
                        <el-option :label="item.dic_name" :value="item.dic_id" v-for="item in useStaff.Identify" :key='item.dic_id'>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="beforeadd">＋新增</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table stripe :data="useStaff.Tabel.list" style="width: 100%">
                <el-table-column type="index" label="#" width="100"></el-table-column>
                <el-table-column label="姓名" width="150">
                    <template #default="{ row }">
                        <el-tag>
                            {{ row.stf_name }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="stf_category" label="职务类型" width="150">
                    <template #default="{ row }">
                        <span>{{ searchIndentify(row.stf_category) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="备注" width="300">
                    <template #default="{ row }">
                        <span v-if="row.stf_remark !== ''">{{ row.stf_remark }}</span>
                        <span v-else>暂无员工的备注信息</span>
                    </template>
                </el-table-column>
                <el-table-column label="员工状态" width="100" color="#95d475">
                    <template #default="{ row }">
                        <el-tag effect="light" :style="{ color: row.stf_invalid === 1 ? '#67c23a' : 'red' }">
                            {{ row.stf_invalid === 1 ? "在职" : "离职" }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="300" align="right">
                    <template #default="{ row }">
                        <el-button type="primary" :icon="Edit" @click="edit(row)">编辑</el-button>
                        <el-button :type="row.stf_invalid === 1 ? 'danger' : 'success'" :icon="Delete"
                            @click="remove(row)">
                            {{ row.stf_invalid === 1 ? "离职" : "在职" }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer>
            <el-pagination background :page-sizes="[4, 8, 10, 12]" v-model:page-size="pageSize4"
                v-model:current-page="currentPage4" layout="prev, pager,next,jumper, ->,sizes,total"
                :total="useStaff.Tabel.total" @size-change='handleSizeChange' @current-change='handleCurrentChange' />
        </el-footer>
    </el-container>
    <el-dialog v-model="isEdit" :show-close='false' :close-on-click-modal='false' :close-on-press-escape='false'
        :title="ruleForm.stf_id === -1 ? '新增员工' : '编辑员工信息'" width="500px">
        <el-form ref="ruleFormRef" require-asterisk-position="right" label-position="right" :model="ruleForm"
            status-icon :rules="rules" label-width="80px" class="demo-ruleForm">
            <el-form-item label="员工姓名" prop="stf_name">
                <el-input v-model="ruleForm.stf_name" />
            </el-form-item>
            <el-form-item label="员工职位">
                <el-select v-model="ruleForm.stf_category" placeholder="-全部-">
                    <el-option label="-请选择-" :value="0" />
                    <el-option :label="item.dic_name" :value="item.dic_id" v-for="item in useStaff.Identify" :key='item.dic_id' />
                </el-select>
            </el-form-item>
            <el-form-item label="员工备注">
                <el-input v-model="ruleForm.stf_remark" :rows="2" type="textarea" placeholder="请输入员工备注" />
            </el-form-item>
            <el-form-item>
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="save(ruleFormRef)">保存</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<style lang="stylus" scoped> 

</style>