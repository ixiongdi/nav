<template>
    <el-container style="height: 100vh">
        <!-- 顶部搜索区 -->
        <el-header height="60px" class="search-header">
            <el-input
                v-model="searchQuery"
                placeholder="搜索书签，按回车快速跳转"
                prefix-icon="Search"
                style="width: 100%; max-width: 600px"
                @keyup.enter="handleSearchJump"
            />
        </el-header>

        <el-container>
            <!-- 侧边栏文件夹树 -->
            <el-aside width="250px" class="sidebar">
                <el-tree
                    v-model="currentFolder"
                    :data="folderTree"
                    :props="folderTreeProps"
                    node-key="id"
                    @node-click="handleFolderClick"
                    style="height: 100%; overflow-y: auto"
                />
            </el-aside>

            <!-- 主内容区 -->
            <el-main class="main-content">
                <!-- 工具栏 -->
                <el-toolbar class="toolbar">
                    <el-button type="primary" icon="Import" @click="importBookmarks"
                        >导入书签</el-button
                    >
                    <el-button type="primary" icon="Export" @click="exportBookmarks"
                        >导出书签</el-button
                    >
                    <el-button type="primary" icon="Plus" @click="addBookmark">新增</el-button>
                    <el-button type="danger" icon="Delete" @click="clearBookmarks">清空</el-button>
                </el-toolbar>

                <!-- 书签列表 -->
                <div class="bookmark-grid">
                    <el-card
                        v-for="bookmark in filteredBookmarks"
                        :key="bookmark.id"
                        class="bookmark-card"
                        @mouseenter="showActions(bookmark.id)"
                        @mouseleave="hideActions()"
                    >
                        <template #header>
                            <div class="card-header">
                                <el-image :src="bookmark.icon" />
                                <span class="bookmark-title">{{ bookmark.title }}</span>
                                <div class="bookmark-actions" v-if="activeActions === bookmark.id">
                                    <el-button
                                        type="primary"
                                        :icon="Edit"
                                        circle
                                        @click="editBookmark(bookmark.id)"
                                    ></el-button>
                                    <el-button
                                        type="danger"
                                        :icon="Delete"
                                        circle
                                        @click="deleteBookmark(bookmark.id)"
                                    ></el-button>
                                </div>
                            </div>
                        </template>
                        <div class="bookmark-link">
                            <a :href="bookmark.url" target="_blank">{{ bookmark.url }}</a>
                        </div>
                    </el-card>
                </div>
            </el-main>
        </el-container>
    </el-container>
    <!-- 文件上传隐藏input -->
    <input
        type="file"
        ref="fileInput"
        style="display: none"
        accept=".html"
        @change="handleFileUpload"
    />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import type { BookmarkFile, StoredBookmarkNode } from './types/bookmark';
import {
    getBookmarkNodesByParentId,
    getAllBookmarkNodes,
    deleteBookmarkNode,
    addBookmarkNode,
    deleteAllBookmarkNodes,
} from './utils/database';
import { convertToStoredBookmarkNodes, convertToViewBookmarkNodes } from './utils/bookmarkParser';

import { parseHtmlToBookmarkFile } from './utils/bookmarkParser2';
import { Delete, Edit } from '@element-plus/icons-vue';

// 搜索相关
const searchQuery = ref('');
const currentFolder = ref<string | null>(null);
const activeActions = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// 文件夹树相关
const folderTree = ref<any[]>([]);
const folderTreeProps = {
    label: 'title',
    children: 'children',
};

// 书签数据
const bookmarks = ref<StoredBookmarkNode[]>([]);
const filteredBookmarks = computed(() => {
    if (!searchQuery.value) return bookmarks.value;
    return bookmarks.value.filter(
        (bookmark) =>
            bookmark.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            bookmark.url?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// 初始化数据
async function initData() {
    const allBookmarks = await getAllBookmarkNodes();
    // 获取文件夹树
    folderTree.value = convertToViewBookmarkNodes(allBookmarks);
    console.log(folderTree.value);
    // 默认加载所有书签
    loadBookmarks(null);
}

// 加载特定文件夹下的书签
async function loadBookmarks(folderId: string | null) {
    currentFolder.value = folderId;
    // 这里假设getBookmarksByFolder函数已经实现
    bookmarks.value = await getBookmarkNodesByParentId(folderId);
}

// 处理搜索回车跳转
function handleSearchJump() {
    if (filteredBookmarks.value.length > 0) {
        window.open(filteredBookmarks.value[0].url, '_blank');
    } else {
        ElMessage({
            message: '未找到匹配的书签',
            type: 'warning',
        });
    }
}

// 处理文件夹点击
function handleFolderClick(data: any) {
    loadBookmarks(data.id);
}

// 显示操作按钮
function showActions(id: string) {
    activeActions.value = id;
}

// 隐藏操作按钮
function hideActions() {
    activeActions.value = null;
}

// 编辑书签
function editBookmark(id: string) {
    // 编辑功能逻辑，这里只是示例
    ElMessage({
        message: `编辑书签 ${id}`,
        type: 'info',
    });
    // 实际应用中应该打开编辑对话框
}

// 删除书签
async function deleteBookmark(id: string) {
    try {
        await deleteBookmarkNode(id);
        // 重新加载当前文件夹的书签
        loadBookmarks(currentFolder.value);
        ElMessage({
            message: '书签删除成功',
            type: 'success',
        });
    } catch (error) {
        ElMessage({
            message: '书签删除失败',
            type: 'error',
        });
    }
}

// 导入书签
function importBookmarks() {
    // 触发文件选择对话框
    fileInput.value?.click();
}

// 处理文件上传
async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    if (!file || file.type !== 'text/html') {
        ElMessage({
            message: '请上传HTML格式的书签文件',
            type: 'warning',
        });
        return;
    }

    const loading = ElLoading.service({
        lock: true,
        text: '导入中...',
        background: 'rgba(0, 0, 0, 0.7)',
    });

    try {
        // 读取文件内容
        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = async (e) => {
            try {
                const html = e.target?.result as string;
                // 1. 解析HTML为BookmarkFile
                const bookmarkFile: BookmarkFile = parseHtmlToBookmarkFile(html);
                console.log(bookmarkFile);

                // 2. 转换为StoredBookmarkNode数组
                const nodes: StoredBookmarkNode[] = convertToStoredBookmarkNodes(bookmarkFile);

                // 3. 插入数据库
                for (const node of nodes) {
                    await addBookmarkNode(node);
                }

                // 重新加载数据
                await initData();

                ElMessage({
                    message: `成功导入 ${nodes.length} 个书签`,
                    type: 'success',
                });
            } catch (error) {
                ElMessage({
                    message: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
                    type: 'error',
                });
            } finally {
                loading.close();
                // 重置文件输入
                target.value = '';
            }
        };

        reader.onerror = () => {
            ElMessage({
                message: '文件读取失败',
                type: 'error',
            });
            loading.close();
            target.value = '';
        };
    } catch (error) {
        ElMessage({
            message: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
            type: 'error',
        });
        loading.close();
        target.value = '';
    }
}

// 导出书签
function exportBookmarks() {
    // 导出功能逻辑
    ElMessage({
        message: '导出书签',
        type: 'info',
    });
}

// 新增书签
function addBookmark() {
    // 新增功能逻辑
    ElMessage({
        message: '新增书签',
        type: 'info',
    });
}

// 清空书签
async function clearBookmarks() {
    // 清空功能逻辑
    await deleteAllBookmarkNodes();
    ElMessage({
        message: '清空书签',
        type: 'info',
    });
}

// 初始化数据
initData();
</script>

<style scoped>
.search-header {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar {
    background-color: #f0f2f5;
    border-right: 1px solid #e6e6e6;
}

.main-content {
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
}

.toolbar {
    margin-bottom: 20px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.bookmark-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.bookmark-card {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.bookmark-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.bookmark-icon {
    color: #409eff;
}

.bookmark-title {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bookmark-link {
    margin-top: 10px;
    color: #606266;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
