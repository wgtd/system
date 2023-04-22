<script setup lang="ts">
import { Search, Edit, Delete, Share, Bottom, PictureRounded } from '@element-plus/icons-vue';
import { reactive, ref, onMounted, nextTick, markRaw } from 'vue';
import { httpBatch } from '@/utill/http';
import { useStudentStore, useAuthStore } from '@/store';
import type { UploadProps, UploadFile, UploadFiles, UploadUserFile } from 'element-plus';
import { ElMessageBox, FormRules, FormInstance, ElMessage } from 'element-plus';
import { StudentApi } from '@/api';
const isDialog = ref<boolean>(false)
const isClassify = ref<boolean>(false)
const useAuth = useAuthStore()
const formRef = ref<FormInstance>()
const rule = ref<FormRules>({
    stu_name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 1, max: 20, message: '长度应该为 1 到 20之间', trigger: 'blur' },
    ],
    stu_sex: [
        { required: true, message: '请选择性别', trigger: 'blur' },
    ],
    stu_address: [
        { required: true, message: '请输入地址', trigger: 'blur' },
    ],
    stu_phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
    ],

})
const isUpload = ref<boolean>(false)
const fileList = ref<UploadUserFile[]>(markRaw([]))
const avatarUpdate = reactive<HttpPayload.Avatar>({
    stu_id: 0,
    stu_avatar_old: null,
    stu_avatar_new: '',

})
let validPhone=ref({
    stu_phone:""
})
let SelectedData: any = []
const useStudent = useStudentStore()
const pagination = reactive({
    total: 0, CurrentPage: 1
})
const multipleSelection = ref([])
let assign = ref<HttpPayload.assignClass>({
    stu_id: -1,
    stu_ids: [],
    stu_cls_id: null
})
let searchModel = ref<HttpPayload.Search>({
    stu_name: '',
    stu_cls_id: 0,
    stu_qualification: 0,
    begin: 0,
    pageSize: 4
})
let StudentList = reactive<HttpPayload.studentList>({
    stu_name: '',
    stu_avatar: null,
    stu_cls_id: null,
    stu_sex: 1,
    stu_phone: '',
    stu_phone2: '',
    stu_born: '',
    stu_qualification: 0,
    stu_school: null,
    stu_major: null,
    stu_address: '',
    stu_remark: null,
    stu_id: -1
})
//index
const indexMethods = (val: number) => {
    return (pagination.CurrentPage - 1) * searchModel.value.pageSize + val + 1;
}
//分页查询
const searchData = async (formPage1 = true) => {
    if (formPage1) pagination.CurrentPage = 1
    searchModel.value.begin = (pagination.CurrentPage - 1) * searchModel.value.pageSize
    try {
        let ret = await StudentApi.search(searchModel.value)
        useStudent.list = ret.list
        useStudent.total = ret.total
        // console.log(useStudent.list, useStudent.total)
        if (useStudent.total > 0 && useStudent.list.length === 0) {
            pagination.CurrentPage = Math.ceil(useStudent.total / searchModel.value.pageSize);
            await searchData(false)
            return
        }
        pagination.total = useStudent.total;
        useStudent.list = useStudent.list;
    } catch (e: any) { }
}
//教室名称
function classList(val: number) {
    return useStudent.classList.find(item => item.cls_id === val)?.cls_name
}
//分班准备
const assignClassBefore = (id: number) => {
    assign.value.stu_id = id
    StudentList.stu_id = -1
    StudentList.stu_cls_id = 0//默认显示select第一个
    nextTick(() => isClassify.value = true)
}
//批量分班前准备
const manyClassifyBefore = () => {
    assign.value.stu_id = null
    StudentList.stu_cls_id = 0
    nextTick(() => isClassify.value = true)
}
//分班
const assignClass = async () => {
    //把选中的stu_id放到一个数组
    try {
        assign.value.stu_ids = SelectedData
        assign.value.stu_cls_id = StudentList.stu_cls_id
        await StudentApi.assignClass(assign.value)
        ElMessage({
            type: 'success',
            message: '分配班级成功！'
        })
        searchData()
        nextTick(() => isClassify.value = false)
    } catch (e) {
        ElMessageBox.alert('未选择学生或班级', 'Tip',{})
    }
}
//全选
const allCheck = (selection: any) => {
    if (selection.length !== 0){
        selection.forEach((item: any) => {
            SelectedData.push(item.stu_id);
        })
    } else {
        SelectedData = []
    }
    // console.log(selection.length, SelectedData)
}
const handleSelectionChange = (val: any) => {
    multipleSelection.value = val
}
//单选
const tableSelect = (rows: any, row: any) => {
    //rows为选中所有行的的数据，row为当前点击的那行的数据
    let selected = rows.length && rows.indexOf(row) !== -1
    if (selected) SelectedData.push(row.stu_id);
    if (!selected) SelectedData.pop(row.stu_id);
    console.log(SelectedData) // true就是选中，0或者false是取消选中
}
//添加前准备
const beforeAdd = () => {
    //重置表单验证
    formRef.value?.resetFields()
    //清空数据
    StudentList.stu_name = ''
    StudentList.stu_sex = 1
    StudentList.stu_phone = ''
    StudentList.stu_phone2 = ''
    StudentList.stu_born = ''
    StudentList.stu_qualification = 0
    StudentList.stu_school = null
    StudentList.stu_major = null
    StudentList.stu_address = ''
    StudentList.stu_remark = null
    StudentList.stu_cls_id = null
    StudentList.stu_avatar = null
    nextTick(() => isDialog.value = true)
}
//编辑前准备
const beforeEdit = (row: HttpPayload.studentList) => {
    //重置表单验证
    formRef.value?.resetFields()
    //回显数据
    StudentList.stu_name = row.stu_name
    StudentList.stu_id = row.stu_id
    StudentList.stu_cls_id = row.stu_cls_id
    StudentList.stu_avatar = row.stu_avatar
    StudentList.stu_sex = row.stu_sex
    StudentList.stu_phone = row.stu_phone
    StudentList.stu_phone2 = row.stu_phone2
    StudentList.stu_born = row.stu_born
    StudentList.stu_qualification = row.stu_qualification
    StudentList.stu_school = row.stu_school
    StudentList.stu_major = row.stu_major
    StudentList.stu_address = row.stu_address
    StudentList.stu_remark = row.stu_remark
    nextTick(() => isDialog.value = true)

}
//添加编辑
const save = async (formEl: FormInstance | undefined) => {
    try {
        //表单验证
        await formRef.value?.validate()
        if (!formEl) return
        validPhone.value.stu_phone = StudentList.stu_phone
        let phone = await StudentApi.validPhone(validPhone.value)
        if (phone > 0) {
            ElMessageBox.alert(`手机号${validPhone.value.stu_phone}重复`, 'Warning', { type: 'error' })
            return
        }
        StudentList.stu_phone=''
        if (StudentList.stu_qualification===0) {
            ElMessageBox.alert('学历必须选择一项','tip',{})
            return       
        }
        if (StudentList.stu_id === -1) {
            await httpBatch([() => useStudent.add(StudentList), () => useStudent.getData(searchModel.value)], true)
            ElMessage({
                showClose: true,
                message: `添加成功`,
                type: 'success'
            })
        }
        else {
            await httpBatch([() => useStudent.edit(StudentList), () => useStudent.getData(searchModel.value)], true)
            ElMessage({
                showClose: true,
                message: `编辑成功`,
                type: 'success'
            })
        }
        nextTick(() => isDialog.value = false)
    } catch (e) { }


}
onMounted(async () => {
    await useStudent.getData(searchModel.value)
})
//开始头像更新
const beforeupdata = (student: any) => {
    avatarUpdate.stu_id = student.stu_id
    avatarUpdate.stu_avatar_old = student.stu_avatar;
    fileList.value = markRaw([{
        name: "card",
        url: "/image" + avatarUpdate.stu_avatar_old
    }]);
    isUpload.value = true
}
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('图片必须为jpeg或者png')
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('图片大小2W')
        return false
    }
    return true
}
//文件上传成功的回调函数
const success = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    avatarUpdate.stu_avatar_new = response.data;
    if (avatarUpdate.stu_avatar_old === null && uploadFiles.length > 1) uploadFiles.shift();
    if (avatarUpdate.stu_avatar_old !== null && uploadFiles.length > 2) uploadFiles.splice(1, 1);
    ElMessage.success('预上传成功!')
}
// 更新新头像
const saveAvatar = async () => {
    await httpBatch([() => StudentApi.saveAvatar(avatarUpdate), () => searchData()], true)
    isUpload.value = false;
    ElMessage.success('学生头像更新成功!')
};
</script>
<template>
    <el-container>
        <el-header height="80px">
            <el-form :model="searchModel" label-width="80px" inline>
                <el-form-item label="学生姓名">
                    <el-input :prefix-icon="Search" v-model="searchModel.stu_name" placeholder="请输入姓名进行搜索"
                        @change="searchData()" />
                </el-form-item>
                <el-form-item label="所在班级">
                    <el-select placeholder="hahahha" v-model="searchModel.stu_cls_id" @change="searchData">
                        <el-option label='-请选择-' :value="0"></el-option>
                        <el-option :value="item.cls_id" :label="item.cls_name" v-for="item in useStudent.classList"
                            :key="item.cls_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="学生学历 ">
                    <el-select v-model="searchModel.stu_qualification" @change="searchData">
                        <el-option label='-请选择-' :value="0"></el-option>
                        <el-option :value="item.dic_id" :label="item.dic_name"
                            v-for="item in useStudent.qualificationList" :key="item.dic_id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item align="right">
                    <el-button-group>
                        <el-button type="primary" @click="beforeAdd">＋新增</el-button>
                        <el-button type="success" :icon="Share" @click="manyClassifyBefore">批量分班</el-button>
                        <el-button type="warning" :icon="Bottom">导出学生信息</el-button>
                    </el-button-group>
                </el-form-item>
            </el-form>
        </el-header>
        <el-main>
            <el-table stripe border style:any="width:100%" :data="useStudent.list" @select=tableSelect
                @selection-change="handleSelectionChange" @select-all="allCheck">
                <el-table-column type="index" :index="indexMethods" label="#" width="50" align='center' />
                <el-table-column type="selection" width="55" align='center' />
                <el-table-column label="学生姓名" width="120" align="center">
                    <template #default="{ row }">
                        <el-tag>
                            {{ row.stu_name }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="班级" width="130" align='center'>
                    <template #default="{ row }">
                        <div style="color:#67c23a">
                            <span v-if="row.stu_cls_id !== null">{{ classList(row.stu_cls_id) }}</span>
                            <span v-else>暂无班级</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="存档照片" width="120" align="center">
                    <template #default="{ row }">
                        <el-popover placement="right" width="100" height="100" trigger="hover">
                            <template #reference>
                                <el-button text style="color:#409EFF">预览</el-button>
                            </template>
                            <div>
                                <h2 style="margin-bottom:10px">{{ row.stu_name }}</h2>
                                <div style="text-align:center;">
                                    <img v-if="row.stu_avatar !== null" :src="'image' + row.stu_avatar"
                                        style="width:150px;height:150px" alt="加载失败">
                                    <p style="width:150px;height:150px;line-height: 135px;" v-else>
                                        <span>暂无照片</span>
                                    </p>
                                </div>
                            </div>
                        </el-popover>
                    </template>
                </el-table-column>
                <el-table-column label="性别" width="80" align='center'>
                    <template #default="{ row }">
                        <el-tag v-if="row.stu_sex === 1">男</el-tag>
                        <el-tag v-else-if="row.stu_sex === 0">女</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="stu_phone" label="联系电话" width="120" align='center' />
                <el-table-column prop="stu_phone2" label="联系电话" width="120" align='center' />
                <el-table-column prop="stu_born" label="出生日期" width="120" align='center' />
                <el-table-column label="学历" width="150" align=center>
                    <template #default="{ row }">
                        {{ useStudent.qualificationList.find(item => item.dic_id === row.stu_qualification)?.dic_name }}
                    </template>
                </el-table-column>
                <el-table-column prop='stu_school' label="毕业院校" width="150" align='center' />
                <el-table-column prop="stu_major" label="院校专业 " width="100" align='center' />
                <el-table-column prop="stu_address" label="家庭住址" width="150" align='center' />
                <el-table-column prop="stu_remark" label="备注" width="100" align='center' />
                <el-table-column fixed="right" label="操作" width="400" align="center">
                    <template #default="{ row }">
                        <el-button-group class="ml-4">
                            <el-button type="success" :icon="Share" @click="assignClassBefore(row.stu_id)">分班
                            </el-button>
                            <el-button type="warning" :icon="PictureRounded" @click="beforeupdata(row)">照片存档</el-button>
                            <el-button type="primary" :icon="Edit" @click="beforeEdit(row)">编辑</el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog title="班级分配" :show-close="false" v-model='isClassify' width="40%">
                <el-form :model="StudentList" :rules="rule">
                    <el-form-item prop="stu_cls_id" label="班级">
                        <el-select v-model="StudentList.stu_cls_id">
                            <el-option label='-请选择-' :value="0"></el-option>
                            <el-option :value="item.cls_id" :label="item.cls_name" v-for="item in useStudent.classList"
                                :disabled="item.cls_end !== null">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="isClassify = false">取消</el-button>
                        <el-button type="primary" @click="assignClass">确定</el-button>
                    </span>
                </template>
            </el-dialog>
            <el-dialog v-model="isDialog" :show-close="false" title="添加数据">
                <el-form ref="formRef" :model="StudentList" :rules="rule" label-width="auto" status-icon>
                    <el-form-item prop="stu_name" label="学生姓名 " align="center">
                        <el-input placeholder="请输入学生姓名" v-model="StudentList.stu_name"></el-input>
                    </el-form-item>
                    <el-form-item prop="stu_sex" label="性别">
                        <el-radio-group v-model="StudentList.stu_sex">
                            <el-radio :label="1" size="large">男</el-radio>
                            <el-radio :label="0" size="large">女</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item prop="stu_phone" label="联系电话">
                        <el-input maxlength="11"  show-word-limit placeholder="请输入手机号码" v-model.number="StudentList.stu_phone"
                            />
                    </el-form-item>
                    <el-form-item label="备用电话">
                        <el-input placeholder="请输入手机号码" v-model="StudentList.stu_phone2">
                            <template #append>例如：028-88888888</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="出生日期">
                        <el-date-picker value-format="YYYY/MM/DD" v-model="StudentList.stu_born" type="date"
                            placeholder="请选择出生日期" />
                    </el-form-item>
                    <el-form-item label="学历">
                        <el-select v-model="StudentList.stu_qualification">
                            <el-option label='-请选择-' :value="0"></el-option>
                            <el-option :value="item.dic_id" :label="item.dic_name"
                                v-for="item in useStudent.qualificationList">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="在读/毕业院校">
                        <el-input v-model="StudentList.stu_school" placeholder="请输入在读/毕业院校（选填）" />
                    </el-form-item>
                    <el-form-item label="在校学习专业">
                        <el-input v-model="StudentList.stu_major" placeholder="请输入在校学习专业（选填）" />
                    </el-form-item>
                    <el-form-item prop="stu_address" label="家庭住址">
                        <el-input v-model="StudentList.stu_address" placeholder="请输入家庭住址" />
                    </el-form-item>
                    <el-form-item label="学生备注">
                        <el-input v-model="StudentList.stu_remark" placeholder="请输入备注" />
                    </el-form-item>
                    <el-form-item align="right">
                        <el-button @click="isDialog = false">取消</el-button>
                        <el-button type="primary" @click="save(formRef)">确认</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
            <el-dialog v-model="isUpload" title="照片存档">
                <el-upload :file-list="fileList" action="/api/student/avatarupload" list-type="picture-card"
                    name="avatar" :headers="{ Authorization: useAuth.token }" accept=".png,.jpeg"
                    :before-upload="beforeAvatarUpload" :on-success="success">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-upload>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="isUpload = false">取消</el-button>
                        <el-button type="primary" @click="saveAvatar">确定</el-button>
                    </span>
                </template>
            </el-dialog>
        </el-main>
        <el-footer>
            <el-pagination background :page-sizes="[4, 8, 10, 12]" v-model:page-size="searchModel.pageSize"
                v-model:current-page="pagination.CurrentPage" layout="prev, pager,next,jumper, ->,sizes,total"
                :total="useStudent.total" @size-change='searchData()' @current-change='searchData(false)' />
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