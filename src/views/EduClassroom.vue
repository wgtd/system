<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useClassroomStore } from '@/store';
import { FormRules, FormInstance, ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit } from '@element-plus/icons-vue';
import { ClassroomApi } from '@/api';
import { httpBatch } from '@/utill/http';
const classroom = useClassroomStore();
const formRef = ref<FormInstance>()
const ruleForm = reactive({
    name: classroom.classname
})
const rule = reactive<FormRules>({
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 3, max: 20, message: '长度应该为 3 到 20之间', trigger: 'change' },
    ]
})
onMounted(async () => {
    try {
        await classroom.getClassroom();
    } catch (e) { console.log(e) }
})
const beforeAdd = () => {
    formRef.value?.resetFields()
    classroom.dialogVisible = true
    ruleForm.name = '';
    classroom.editList.clsr_id = 0

}
const beforeEdit = (val: any) => {
    formRef.value?.resetFields()
    ruleForm.name = val.clsr_name
    classroom.editList.clsr_id = val.clsr_id
    classroom.dialogVisible = true
}
const cancel = () => {
    classroom.dialogVisible = false
}
const del = async (id: number) => {
    try {
        await ElMessageBox.confirm('您确定要进行删除？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await httpBatch([() => classroom.remove(id), () => classroom.getClassroom()], true)
        ElMessage({
            showClose: true,
            message: `删除成功`,
            type: 'success'
        })
    } catch (e) {
        ElMessage({
            showClose: true,
            message: `取消删除`,
            type: 'info'
        })
    }

}
const save = async (formEl:FormInstance|undefined) => {
    await formRef.value?.validate();
    if(!formEl) return
    //判断是否有重名
    const repeat = classroom.list.filter((item:any) => item.clsr_name === ruleForm.name)
    if (repeat.length >= 1) {
        ElMessage({
            showClose: true,
            message: `名称重复`,
            type: 'error'
        })
        return
    }
    //放到一个对象
    // 编辑
    if (classroom.editList.clsr_id !== 0) {
        classroom.editList.clsr_name = ruleForm.name;
        classroom.editList.clsr_id = classroom.editList.clsr_id
        await httpBatch([() => ClassroomApi.update({ ...classroom.editList }), () => ClassroomApi.get()], true)
        classroom.list.find((item:any) => item.clsr_id === classroom.editList.clsr_id).clsr_name=ruleForm.name
        ElMessage({ message: `保存成功`, type: "success" })
    }
    else {
        //增加
        classroom.addlist.clsr_name = ruleForm.name
        await httpBatch([() => ClassroomApi.add({ ...classroom.addlist }), () => ClassroomApi.get()], true)
        classroom.list.push({ ...classroom.addlist })
        ElMessage({ message: `添加成功`, type: "success" })
    }
    classroom.dialogVisible = false;
}
</script>

<template>
    <el-container>
        <el-header>
            <p>
                <span
                    style="display:inline-block;width:20px;height:20px;border-radius: 50%;background-color: rgba(80, 209, 16, 0.83);">
                </span>
                <span>
                    空闲
                </span>
            </p>
            <p><span style="display:inline-block;;width:20px;height:20px;border-radius: 50%;background-color: #e6a23c;">
                </span>
                <span>
                    使用中
                </span>
            </p>
        </el-header>
        <el-main height="500px">
            <el-row :gutter="24">
                <el-col :span="6" v-for="item in classroom.list" :key="item.clsr_id">
                    <el-card shadow="hover"
                        :style="{ backgroundColor: item.clsr_occupy === 0 ? 'rgba(80, 209, 16, 0.83)' : '#e6a23c' }">
                        <div class="content">
                            <el-icon :size="20">
                                <HomeFilled />
                            </el-icon>
                            <span>{{  item.clsr_name  }}</span>
                        </div>
                        <div class="dialog">
                            <div class="dialog-content">
                                <span style="margin-right:10px" @click="beforeEdit(item)">
                                    <el-icon :size="40" color="#fff">
                                        <Edit />
                                    </el-icon>
                                </span>
                                <span>
                                    <el-icon :size="40" color="#fff" @click="del(item.clsr_id)">
                                        <Delete />
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
            <el-dialog v-model="classroom.dialogVisible" :title="classroom.editList.clsr_id !== 0 ? '编辑教室' : '添加教室'"
                width="40%">
                <el-form ref="formRef" :model="ruleForm" :rules="rule">
                    <el-form-item prop="name">
                        <el-input v-model="ruleForm.name" placeholder="请输入班级名称" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="cancel">取消</el-button>
                        <el-button type="primary" @click="save(formRef)">确定</el-button>
                    </span>
                </template>
            </el-dialog>
        </el-main>

        <el-footer></el-footer>
    </el-container>

</template>

<style lang="stylus" scoped> 
.el-header
    display flex
    p
        margin-right 15px
        span
            margin-left 5px
            vertical-align middle
.el-col
    min-width 200px
    margin 10px 0
.el-card
    padding 10px
    position:relative
    background-color rgba(80, 209, 16, 0.83)
    height 100px
    border-radius 50px
.el-card:hover .dialog
    display block
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
        margin-top 50px
        align-items center
        justify-content center
.content
    font-size 20px
    color #fff
    display flex
    flex-wrap nowrap
    padding-top 15px
    justify-content center
    align-items center

</style>