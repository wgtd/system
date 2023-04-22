<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from 'vue';
import { httpBatch } from '@/utill/http';
import { ClassApi, ClassroomApi, StaffApi } from "@/api";
import { Search, Setting,Edit,Delete } from '@element-plus/icons-vue'
import { ElMessageBox, FormRules, FormInstance, ElMessage } from 'element-plus';
const isDialog = ref<boolean>(false)
const formRef = ref<FormInstance>()
const ClassSwitch = ref<boolean>(false)
const isEnd = ref<boolean>(false)
const Classroom = ref<Vm.Classroom[]>([])
const begin = ref<HttpPayload.begin>({
    cls_id: 0,
    cls_clsr_id: 0
})
const pagination = reactive({
    total: 0, CurrentPage: 1
})
const rules = reactive<FormRules>({
    cls_name: [
        { required: true, message: '用户名不为空', trigger: 'blur' },
        { min: 1, max: 20, message: '长度为1~20之间 ', trigger: 'change' }
    ]
})
let math = ref<any>([])
let admin = ref<any>([])
let job = ref<any>([])
let Classlist = ref<Vm.statusClass>({
    list: [],
    total: 0
})
const dictionary = ref<Vm.dictionary[]>([])
let Classstatus = ref<HttpPayload.statusClass>({
    cls_name: '',
    cls_dic_id_major: 0,
    cls_status: 0,
    begin: 0,
    pageSize: 4
})
let ClassList = reactive<HttpPayload.Class>({
    cls_id: -1,
    cls_name: '',
    cls_dic_id_major: 0,
    cls_clsr_id: null,
    cls_stf_id_teacher: 0,
    cls_stf_id_admin: 0,
    cls_stf_id_job: 0,
    cls_begin: null,
    cls_end: null,
    cls_remark: ''
})
let VlidName = ref({
    cls_name: ''
})
onMounted(async () => {
    try {
        [math.value, admin.value, job.value, dictionary.value, Classlist.value] = await httpBatch([() => StaffApi.getIdentify(4), () => StaffApi.getIdentify(5),
        () => StaffApi.getIdentify(6), () => StaffApi.dictionary(), () => ClassApi.getClassList(Classstatus.value)])
        dictionary.value = dictionary.value.filter(item => item.dic_group_name === '班级专业')
        Classroom.value = await ClassroomApi.get()
    } catch (e) { }
})
//tabel索引
const indexMethods = (val: number) => {
    return (pagination.CurrentPage - 1) * Classstatus.value.pageSize + val + 1;
}
//添加前准备
const beforeAdd = () => {
    formRef.value?.resetFields();
    ClassList.cls_name = '',
        ClassList.cls_clsr_id = null,
        ClassList.cls_dic_id_major = 0,
        ClassList.cls_stf_id_teacher = 0,
        ClassList.cls_stf_id_admin = 0,
        ClassList.cls_stf_id_job = 0,
        ClassList.cls_remark = '',
        nextTick(() => isDialog.value = true)
}
//编辑前准备
const beforeEdit = (row: Vm.Class) => {
    formRef.value?.resetFields();
    ClassList.cls_id = row.cls_id,
        ClassList.cls_name = row.cls_name,
        ClassList.cls_dic_id_major = row.cls_dic_id_major,
        ClassList.cls_stf_id_teacher = row.cls_stf_id_teacher,
        ClassList.cls_stf_id_admin = row.cls_stf_id_admin,
        ClassList.cls_stf_id_job = row.cls_stf_id_job,
        ClassList.cls_remark = row.cls_remark
    nextTick(() => isDialog.value = true)
}
// 分页，换页
const search = async (formPage1 = true) => {
    if (formPage1) pagination.CurrentPage = 1
    Classstatus.value.begin = (pagination.CurrentPage - 1) * Classstatus.value.pageSize
    try {
        Classlist.value = await ClassApi.getClassList(Classstatus.value)
        if (Classlist.value.total > 0 && Classlist.value.list.length === 0) {
            pagination.CurrentPage = Math.ceil(Classlist.value.total / Classstatus.value.pageSize);
            await search(false)
            return
        }
        pagination.total = Classlist.value.total;
        Classlist.value.list = Classlist.value.list;
    } catch (e) { }
}
//教室名称
function classroom(val: number) {
    return Classroom.value.find(item => item.clsr_id === val)?.clsr_name
}
//开课前准备
const beforeStart = async (id: number) => {
    try {
        begin.value.cls_id = id;
        ClassList.cls_clsr_id = 0;
        nextTick(() => ClassSwitch.value = true)
    } catch (e) { }
}
//开课
const start = async () => {
    try {
        begin.value.cls_clsr_id = ClassList.cls_clsr_id
        await ElMessageBox.confirm('你确定要开课吗？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await httpBatch([() => ClassApi.begin(begin.value), () => search()], true)
        nextTick(() => ClassSwitch.value = false)
    } catch (e) { }

}
//结课
const endbefore = async (id: number) => {
    try {
        await ElMessageBox.confirm('你确定要结课吗？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await httpBatch([() => ClassApi.end({ cls_id: id }), () => search()], true)
        isEnd.value = true
        ElMessage({
            showClose: true,
            message: `结课成功`,
            type: 'success'
        })
    } catch (e) { }
}
//添加编辑操作
const save = async (formEl: FormInstance | undefined) => {
    try {
        await formRef.value?.validate();
        if (!formEl) return
        VlidName.value.cls_name = ClassList.cls_name
        let ret = await ClassApi.validform(VlidName.value)
        if (ret > 0) {
            ElMessageBox.alert(`班级${VlidName.value.cls_name}已存在`, 'Warning', { type: 'error' })
            return
        }
        if (ClassList.cls_id === -1) {
            
            await httpBatch([() => ClassApi.add(ClassList), () => search()], true)
            ElMessageBox.alert(`班级新增成功`, 'Tips', { type: 'success' })
        }
        else {
            await httpBatch([() => ClassApi.update(ClassList), () => search()], true)
            ElMessageBox.alert(`保存成功`, 'Tips', { type: 'success' })
        }
        nextTick(() => isDialog.value = false)
    } catch (e) {
        ElMessageBox.alert('请将信息填写完整', 'Tip')
    }

}

</script>

<template>
    <el-container>
        <el-header height="80px">
            <el-form label-width="100px" inline>
                <el-form-item label="用户名字">
                    <el-input :prefix-icon="Search" placeholder="请输入姓名进行搜索" v-model='Classstatus.cls_name'
                        @change='search()' />
                </el-form-item>
                <el-form-item label="班级专业">
                    <el-select v-model="Classstatus.cls_dic_id_major" @change='search'>
                        <el-option label='-全部-' :value="0"></el-option>
                        <el-option :label="item.dic_name" :value="item.dic_id" v-for="item in dictionary" :key="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="班级状态">
                    <el-select placeholder="-请选择-" v-model="Classstatus.cls_status" @change="search">
                        <el-option label='所有' :value="0"></el-option>
                        <el-option label="开课中" :value="1"></el-option>
                        <el-option label="未开课" :value="2"></el-option>
                        <el-option label="结课" :value="3"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="beforeAdd">＋新增</el-button>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table stripe :data="Classlist.list" border style="width:100%">
                <el-table-column type="index" :index="indexMethods" label="#" width="50">
                </el-table-column>
                <el-table-column label="班级名称" width="150" align="center">
                    <template #default="{ row }">
                        <el-tag>
                            {{ row.cls_name }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="班级专业" width="100" align="center">
                    <template #default="{ row }">
                        <div style="display:flex;align-items:center">
                            <img v-if="dictionary.find(item => item.dic_id === row.cls_dic_id_major)?.dic_name === 'Java'"
                                src="../assets/java.png" style="width: 20px;">
                            <img v-else-if="dictionary.find(item => item.dic_id === row.cls_dic_id_major)?.dic_name === 'H5前端'"
                                src="../assets/H5.png" style="width: 20px;">
                            <img v-if="dictionary.find(item => item.dic_id === row.cls_dic_id_major)?.dic_name === 'UI设计'"
                                src="../assets/UI.png" style="width: 20px;">
                            <span style="margin-left:5px">{{ dictionary.find(item => item.dic_id ===
                                    row.cls_dic_id_major)?.dic_name
                            }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="cls_stf_id_teacher_name" label="数学老师" width="100" align="center">
                </el-table-column>
                <el-table-column prop="cls_stf_id_admin_name" label="教务老师" width="100" align="center">
                </el-table-column>
                <el-table-column prop="cls_stf_id_job_name" label="就业老师" width="100" align="center">
                </el-table-column>
                <el-table-column label="教室" width="120" align="center">
                    <template #default="{ row }" style="text-align:center">
                        <div style="display:flex;align-items:center;justify-self: center;">
                            <el-icon v-if="row.cls_begin && !row.cls_end" color="rgb(103, 194, 58)">
                                <DataBoard />
                            </el-icon>
                            <el-icon v-if="row.cls_begin && row.cls_end" color="rgb(255, 61, 3)">
                                <DataBoard />
                            </el-icon>
                            <span style="margin-left:5px"> {{ classroom(row.cls_clsr_id) }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="开课时间" width="130" align="center">
                    <template #default="{ row }">
                        <div style="display:flex;align-items:center;justify-self: center;"
                            :style="{ color: row.cls_begin ? 'rgb(103, 194, 58)' : 'rgb(103, 194, 58)' }">
                            <el-icon v-if="row.cls_begin" color="rgb(103, 194, 58)">
                                <Calendar />
                            </el-icon>
                            <span style="margin-left:5px">{{ row.cls_begin }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="结课时间" width="130" align="center">
                    <template #default="{ row }">
                        <div style="display:flex;align-items:center;justify-self: center;"
                            :style="{ color: row.cls_end ? 'rgb(255, 61, 3)' : 'rgb(255, 61, 3)' }">
                            <el-icon v-if="row.cls_end" color="rgb(255, 61, 3)">
                                <Calendar />
                            </el-icon>
                            <span style="margin-left:5px">{{ row.cls_end }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="班级状态" width="100" align="center">
                    <template #default="{ row }">
                        <span style="color:rgb(255, 61, 3)"
                            v-if="row.cls_begin !== null && row.cls_end !== null">结课</span>
                        <span
                            :style="{ color: (row.cls_begin !== null && row.cls_end === null) ? 'rgb(103, 194, 58)' : 'rgb(230, 162, 60)' }"
                            v-else>{{ (row.cls_begin !== null && row.cls_end === null) ? '开课中' : '未开课' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="cls_remark" label="备注" width="100" align="center"></el-table-column>
                <el-table-column fixed="right" label="操作" width="200" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" :icon="Edit" @click="beforeEdit(row)">编辑</el-button>
                        <el-button type="success" v-if="row.cls_begin === null && row.cls_end === null" :icon="Setting"
                            @click="beforeStart(row.cls_id)">
                            {{ '开课' }}
                        </el-button>
                        <el-button :class="{ endbtn: isEnd }" type="danger"
                            v-else-if="row.cls_begin !== null && row.cls_end === null" :icon="Delete"
                            @click.once="endbefore(row.cls_id)">
                            {{ '结课' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog v-model="ClassSwitch" :show-close="false" width="40%">
                <el-form :model="ClassList">
                    <el-form-item label="分配教室">
                        <el-select v-model="ClassList.cls_clsr_id">
                            <el-option label="-全部-" :value="0"> </el-option>
                            <el-option :label="item.clsr_name" :value="item.clsr_id" v-for="item in Classroom" :key="item.clsr_id"
                                :disabled="item.clsr_occupy === 1">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="ClassSwitch = false">取消</el-button>
                        <el-button type="primary" @click="start">确定</el-button>
                    </span>
                </template>
            </el-dialog>
            <el-dialog v-model="isDialog" :show-close="false" title="添加数据">
                <el-form ref="formRef" :model="ClassList" :rules="rules" label-width="auto">
                    <el-form-item prop="cls_name" label="班级名称" align="center">
                        <el-input placeholder="请输入班级名称" v-model="ClassList.cls_name"></el-input>
                    </el-form-item>
                    <el-form-item label="班级专业">
                        <el-select v-model="ClassList.cls_dic_id_major">
                            <el-option label='-请选择-' :value='0'></el-option>
                            <el-option :label="item.dic_name" :value="item.dic_id" v-for="item in dictionary" :key='item.dic_id'>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="教学老师">
                        <el-select v-model="ClassList.cls_stf_id_teacher">
                            <el-option label='-请选择-' :value="0"></el-option>
                            <el-option :value="item.stf_id" :label="item.stf_name" v-for="item in math" :key='item.stf_id'>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="教务老师">
                        <el-select v-model="ClassList.cls_stf_id_admin">
                            <el-option label='-请选择-' :value="0"></el-option>
                            <el-option :value="item.stf_id" :label="item.stf_name" v-for="item in admin" :key='item.stf_id'>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="就业老师">
                        <el-select v-model="ClassList.cls_stf_id_job">
                            <el-option label='-请选择-' :value="0"></el-option>
                            <el-option :value="item.stf_id" :label="item.stf_name" v-for="item in job" :key='item.stf_id'>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="班级备注">
                        <el-input v-model="ClassList.cls_remark" :rows="2" type="textarea" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item align="right">
                        <el-button @click="isDialog = false">取消</el-button>
                        <el-button type="primary" @click="save(formRef)">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </el-main>
        <el-footer>
            <el-pagination background :page-sizes="[4, 8, 10, 12]" v-model:page-size="Classstatus.pageSize"
                v-model:current-page="pagination.CurrentPage" layout="prev, pager,next,jumper, ->,sizes,total"
                :total="Classlist.total" @size-change='search()' @current-change='search(false)' />
        </el-footer>
    </el-container>
</template>

<style lang="stylus" scoped> 
:deep(.el-dialog)
    border-radius 20px
:deep(.el-dialog__header)
    border-radius 20px 20px 0 0
    background-color #409eff !important
    margin-right 0 !important
:deep(.el-dialog__title)
    color #fff !important
:deep(.el-table_1_column_8 el-table__cell)
    color greenyellow !important
.endbtn{
    visibility hidden
}

</style>