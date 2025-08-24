<template>
    <el-container>
        <!-- 顶部搜索区 -->
        <el-header style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="max-width: 800px; margin: 0 auto;">
                <el-autocomplete
                    ref="searchInput"
                    v-model="searchQuery"
                    :fetch-suggestions="handleSearch"
                    placeholder="🔍 搜索书签，按回车快速跳转 (Ctrl+K)"
                    prefix-icon="Search"
                    @select="handleSelect"
                    @keyup.enter="handleSearchJump"
                    @keydown="handleKeyDown"
                    clearable
                    size="large"
                    style="width: 100%;"
                    :popper-options="{
                        modifiers: [{
                            name: 'offset',
                            options: {
                                offset: [0, 8]
                            }
                        }]
                    }"
                    :popper-class="'search-suggestions'"
                >
                    <template #suffix>
                        <el-dropdown trigger="click" @command="handleSearchFilter">
                            <el-button :icon="Filter" circle size="small" style="margin-right: 8px;" />
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="all">全部</el-dropdown-item>
                                    <el-dropdown-item divided command="recent">最近使用</el-dropdown-item>
                                    <el-dropdown-item command="folder">按文件夹筛选</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ item }">
                        <div style="display: flex; align-items: center; padding: 8px 0;">
                            <el-avatar 
                                v-if="!item.isHistory" 
                                :src="item.icon" 
                                size="small" 
                                style="margin-right: 12px; flex-shrink: 0;"
                            />
                            <el-icon v-else style="margin-right: 12px; color: #909399;">
                                <Clock />
                            </el-icon>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; color: #303133; margin-bottom: 2px;">
                                    {{ item.title || item.value }}
                                </div>
                                <div v-if="item.url && !item.isHistory" style="font-size: 12px; color: #909399; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {{ item.url }}
                                </div>
                                <div v-if="item.isHistory" style="font-size: 12px; color: #909399;">
                                    搜索历史
                                </div>
                            </div>
                        </div>
                    </template>
                </el-autocomplete>
            </div>
        </el-header>

        <el-container>
            <!-- 侧边栏文件夹树 -->
            <el-aside>
                <el-tree
                    v-model="currentFolder"
                    :data="folderTree"
                    :props="folderTreeProps"
                    node-key="id"
                    @node-click="handleFolderClick"
                />
            </el-aside>

            <!-- 主内容区 -->
            <el-main>
                <!-- 工具栏 -->
                <div>
                    <el-button type="primary" icon="Download" @click="importBookmarks">导入书签</el-button>
                    <el-button type="primary" icon="Upload" @click="exportBookmarks">导出书签</el-button>
                    <el-button type="primary" icon="Plus" @click="addBookmark">新增</el-button>
                    <el-button type="danger" icon="Delete" @click="clearBookmarks">清空</el-button>
                </div>

                <!-- 书签列表 -->
                <div>
                    <el-space wrap style="width: 1000px">
                        <el-card v-for="bookmark in bookmarks" :key="bookmark.id" style="width: 242px; height: 200px">
                            <template #header>
                                <el-text line-clamp="1">
                                    <el-avatar size="small" :src="bookmark.icon" />
                                    {{ bookmark.title }}
                                </el-text>
                            </template>
                            <el-link :href="bookmark.url" target="_blank">
                                <el-text line-clamp="1">
                                    {{ bookmark.url }}
                                </el-text>
                            </el-link>
                            <template #footer>
                                <el-button type="primary" :icon="Edit" circle @click="editBookmark(bookmark)" />
                                <el-button
                                    type="danger"
                                    :icon="Delete"
                                    circle
                                    @click="onRemoved(bookmark.id, bookmark)"
                                />
                            </template>
                        </el-card>
                    </el-space>
                </div>
            </el-main>
        </el-container>
        
        <!-- 添加书签/文件夹对话框 -->
        <el-dialog 
            v-model="addBookmarkDialogVisible" 
            :title="bookmarkForm.url ? '添加书签' : '添加文件夹'" 
            width="500px"
            :before-close="cancelAddBookmark"
        >
            <el-form :model="bookmarkForm" label-width="80px">
                <el-form-item label="标题" required>
                    <el-input 
                        v-model="bookmarkForm.title" 
                        placeholder="请输入标题"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="链接">
                    <el-input 
                        v-model="bookmarkForm.url" 
                        placeholder="请输入书签链接（如：https://example.com），不填则创建文件夹"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="文件夹">
                    <el-tree-select
                        v-model="bookmarkForm.parentId"
                        :data="folderTree"
                        :props="folderTreeProps"
                        node-key="id"
                        :render-after-expand="false"
                        :check-strictly="true"
                        placeholder="选择文件夹（可选）"
                        clearable
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="cancelAddBookmark">取消</el-button>
                    <el-button type="primary" @click="confirmAddBookmark">确定</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 编辑书签/文件夹对话框 -->
        <el-dialog 
            v-model="editBookmarkDialogVisible" 
            :title="editForm.url ? '编辑书签' : '编辑文件夹'" 
            width="500px"
            :before-close="cancelEdit"
        >
            <el-form :model="editForm" label-width="80px">
                <el-form-item label="标题" required>
                    <el-input 
                        v-model="editForm.title" 
                        placeholder="请输入标题"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="链接" v-if="editForm.url !== undefined">
                    <el-input 
                        v-model="editForm.url" 
                        placeholder="请输入书签链接（如：https://example.com）"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="文件夹">
                    <el-tree-select
                        v-model="editForm.parentId"
                        :data="folderTree"
                        :props="folderTreeProps"
                        node-key="id"
                        :render-after-expand="false"
                        :check-strictly="true"
                        placeholder="选择文件夹（可选）"
                        clearable
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="cancelEdit">取消</el-button>
                    <el-button type="primary" @click="confirmEdit">确定</el-button>
                </div>
            </template>
        </el-dialog>
    </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Link, Search, Download, Upload, Plus, Delete, Edit, Clock, Filter } from '@element-plus/icons-vue';
import { MyBookmarks } from './utils/bookmarks';
import { ElMessage } from 'element-plus';
import { parseHtmlToBookmarks, bookmarksToHtml } from './utils/parser';
import type { BookmarkTreeNode, CreateDetails } from './types/bookmark';

// 搜索相关
const searchQuery = ref('');
const allBookmarks = ref<BookmarkTreeNode[]>([]);
const searchHistory = ref<string[]>([]);
const maxSearchHistory = 10;
const searchInput = ref();
const searchFilter = ref('all'); // 'all', 'recent', 'folder'
const searchFolderId = ref('');

// 搜索筛选器处理
function handleSearchFilter(command: string) {
    searchFilter.value = command;
    if (command === 'folder') {
        // 可以在这里添加文件夹选择逻辑
        searchFolderId.value = currentFolder.value;
    } else {
        searchFolderId.value = '';
    }
    // 重新搜索
    if (searchQuery.value.trim()) {
        handleSearch(searchQuery.value, () => {});
    }
}

// 快捷键处理
function handleKeyDown(event: KeyboardEvent) {
    // ESC 清空搜索框
    if (event.key === 'Escape') {
        searchQuery.value = '';
        searchInput.value?.blur();
    }
}

// 全局快捷键
function handleGlobalKeyDown(event: KeyboardEvent) {
    // Ctrl+K 或 Cmd+K 聚焦搜索框
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInput.value?.focus();
    }
    // / 聚焦搜索框（仅当不在输入框内时）
    else if (event.key === '/' && !isInInputElement(event.target as Element)) {
        event.preventDefault();
        searchInput.value?.focus();
    }
}

// 检查是否在输入元素内
function isInInputElement(element: Element): boolean {
    const inputElements = ['INPUT', 'TEXTAREA', 'SELECT'];
    return inputElements.includes(element.tagName) || element.hasAttribute('contenteditable');
}

// 加载全部书签（用于搜索）
async function loadAllBookmarks() {
    allBookmarks.value = await bookmarkDB.search('');
}

// 处理搜索建议
function handleSearch(query: string, callback: (data: any[]) => void) {
    if (query.trim()) {
        const queryLower = query.toLowerCase();
        let filteredBookmarks = allBookmarks.value;
        
        // 按筛选器过滤
        switch (searchFilter.value) {
            case 'recent':
                filteredBookmarks = allBookmarks.value
                    .filter(bookmark => bookmark.dateLastUsed && bookmark.dateLastUsed > 0)
                    .sort((a, b) => (b.dateLastUsed || 0) - (a.dateLastUsed || 0))
                    .slice(0, 20);
                break;
            case 'folder':
                if (searchFolderId.value) {
                    filteredBookmarks = allBookmarks.value
                        .filter(bookmark => bookmark.parentId === searchFolderId.value);
                }
                break;
            default:
                filteredBookmarks = allBookmarks.value;
        }
        
        const results = filteredBookmarks
            .filter((bookmark) => 
                bookmark.title.toLowerCase().includes(queryLower) || 
                (bookmark.url && bookmark.url.toLowerCase().includes(queryLower))
            )
            .map((bookmark) => {
                // 计算匹配度分数
                let score = 0;
                const titleMatch = bookmark.title.toLowerCase().indexOf(queryLower);
                const urlMatch = bookmark.url ? bookmark.url.toLowerCase().indexOf(queryLower) : -1;
                
                // 标题匹配分数更高
                if (titleMatch === 0) score += 100; // 开头匹配
                else if (titleMatch > -1) score += 50; // 部分匹配
                
                if (urlMatch === 0) score += 30;
                else if (urlMatch > -1) score += 10;
                
                // 最近使用加分
                if (bookmark.dateLastUsed && bookmark.dateLastUsed > 0) {
                    const daysSinceUse = (Date.now() / 1000 - bookmark.dateLastUsed) / (24 * 60 * 60);
                    score += Math.max(0, 20 - daysSinceUse);
                }
                
                return {
                    value: bookmark.title,
                    url: bookmark.url,
                    id: bookmark.id,
                    icon: bookmark.icon,
                    title: bookmark.title,
                    parentId: bookmark.parentId,
                    score
                };
            })
            .sort((a, b) => b.score - a.score) // 按分数排序
            .slice(0, 10); // 限制建议数量
        
        // 如果没有匹配结果，显示搜索历史
        if (results.length === 0 && searchHistory.value.length > 0) {
            const historyResults = searchHistory.value
                .filter(item => item.toLowerCase().includes(queryLower))
                .slice(0, 5)
                .map(item => ({
                    value: item,
                    isHistory: true
                }));
            callback(historyResults);
        } else {
            callback(results);
        }
    } else {
        // 显示最近搜索历史
        const historyResults = searchHistory.value
            .slice(0, 5)
            .map(item => ({
                value: item,
                isHistory: true
            }));
        callback(historyResults);
    }
}

// 处理选中建议项
function handleSelect(item: any) {
    if (item.isHistory) {
        // 选中历史搜索项，触发搜索
        searchQuery.value = item.value;
        handleSearchJump();
    } else if (item.url) {
        // 添加到搜索历史
        addToSearchHistory(searchQuery.value);
        window.open(item.url, '_blank');
        // 更新使用时间
        updateBookmarkUsage(item.id);
    }
}

// 添加到搜索历史
function addToSearchHistory(query: string) {
    if (!query.trim()) return;
    
    const trimmedQuery = query.trim();
    // 移除已存在的项目
    const index = searchHistory.value.indexOf(trimmedQuery);
    if (index > -1) {
        searchHistory.value.splice(index, 1);
    }
    
    // 添加到开头
    searchHistory.value.unshift(trimmedQuery);
    
    // 保持历史记录数量限制
    if (searchHistory.value.length > maxSearchHistory) {
        searchHistory.value = searchHistory.value.slice(0, maxSearchHistory);
    }
    
    // 保存到本地存储
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
}

// 更新书签使用记录
async function updateBookmarkUsage(id: string) {
    try {
        await bookmarkDB.update(id, { 
            dateLastUsed: Date.now() / 1000 
        });
    } catch (error) {
        console.warn('Failed to update bookmark usage:', error);
    }
}

// 加载搜索历史
function loadSearchHistory() {
    try {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
            searchHistory.value = JSON.parse(saved);
        }
    } catch (error) {
        console.warn('Failed to load search history:', error);
        searchHistory.value = [];
    }
}

// 文件夹树相关
const folderTree = ref<any[]>([]);
const currentFolder = ref('');
const folderTreeProps = ref({
    value: 'id',
    label: 'title',
    children: 'children'
});

// 书签列表相关
const bookmarks = ref<BookmarkTreeNode[]>([]);

// 书签数据库实例
const bookmarkDB = new MyBookmarks();

// 添加书签对话框相关
const addBookmarkDialogVisible = ref(false);
const bookmarkForm = ref({
    title: '',
    url: '',
    parentId: ''
});

// 编辑书签对话框相关
const editBookmarkDialogVisible = ref(false);
const editForm = ref({
    id: '',
    title: '',
    url: '',
    parentId: ''
});
const editingBookmark = ref<BookmarkTreeNode | null>(null);

// 初始化
onMounted(async () => {
    await loadFolderTree();
    await loadBookmarks();
    await loadAllBookmarks();
    loadSearchHistory();
    
    // 添加全局快捷键监听
    document.addEventListener('keydown', handleGlobalKeyDown);
});

// 清理
onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeyDown);
});

// 加载文件夹树
async function loadFolderTree() {
    // 从数据库加载文件夹树
    folderTree.value = await bookmarkDB.getFolderTree();
}

// 加载书签
async function loadBookmarks() {
    // 实际应用中，这里应该根据当前选中的文件夹加载书签
    bookmarks.value = await bookmarkDB.getBookmarkChildren(currentFolder.value);
}

// 搜索跳转
function handleSearchJump() {
    const query = searchQuery.value.trim();
    if (query) {
        // 添加到搜索历史
        addToSearchHistory(query);
        
        // 找到第一个匹配的书签并跳转
        const queryLower = query.toLowerCase();
        const matched = allBookmarks.value.find((bookmark) =>
            bookmark.title.toLowerCase().includes(queryLower) || 
            (bookmark.url && bookmark.url.toLowerCase().includes(queryLower))
        );
        
        if (matched && matched.url) {
            window.open(matched.url, '_blank');
            // 更新使用记录
            updateBookmarkUsage(matched.id);
        } else {
            ElMessage.info('未找到匹配的书签');
        }
    }
}

// 文件夹点击
function handleFolderClick(data: any) {
    currentFolder.value = data.id;
    loadBookmarks();
}

// 导入书签
function importBookmarks() {
    console.log('导入书签');
    // 实际应用中，这里应该实现导入书签的逻辑
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const html = e.target?.result as string;
                const bookmarks = parseHtmlToBookmarks(html);
                console.log('导入的书签:', bookmarks);
                // 实际应用中，这里应该将书签保存到数据库
                onImportBegan();
                saveBookmarks(bookmarks).then(async () => {
                    onImportEnded();
                    // 重新加载全部书签以更新搜索
                    await loadAllBookmarks();
                });
            };
            reader.readAsText(file);
        }
    };
    input.click();
}
async function saveBookmarks(bookmarks: BookmarkTreeNode[]) {
    for (const [index, bookmark] of bookmarks.entries()) {
        const node: CreateDetails = {
            title: bookmark.title,
            url: bookmark.url,
            index: index,
            type: bookmark.url ? 'bookmark' : 'folder',
            parentId: bookmark.parentId,
        };
        const result = await bookmarkDB.create(node);
        if (bookmark.children) {
            bookmark.children.forEach((b) => (b.parentId = result.id));
            await saveBookmarks(bookmark.children);
        }
    }
}

// 导出书签
async function exportBookmarks() {
    try {
        ElMessage.info('正在导出书签...');
        
        // 获取全部书签数据
        const allBookmarksData = await bookmarkDB.getTree();
        
        if (allBookmarksData.length === 0) {
            ElMessage.warning('没有可导出的书签');
            return;
        }
        
        // 生成文件名（包含时间戳）
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const filename = `mynav-bookmarks-${timestamp}.html`;
        
        // 将书签数据转换为HTML
        const htmlContent = bookmarksToHtml(allBookmarksData, 'MyNav 导出的书签');
        
        // 创建下载链接
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载元素并触发下载
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // 清理URL对象
        URL.revokeObjectURL(url);
        
        ElMessage.success(`书签已成功导出为 ${filename}`);
        
        console.log('导出书签成功:', {
            count: countBookmarks(allBookmarksData),
            filename,
            size: `${Math.round(blob.size / 1024)}KB`
        });
        
    } catch (error) {
        console.error('导出书签失败:', error);
        ElMessage.error('导出书签失败，请重试');
    }
}

// 计算书签数量（递归统计）
function countBookmarks(bookmarks: BookmarkTreeNode[]): number {
    let count = 0;
    for (const bookmark of bookmarks) {
        if (bookmark.type === 'bookmark') {
            count++;
        } else if (bookmark.children) {
            count += countBookmarks(bookmark.children);
        }
    }
    return count;
}

// 添加书签
function addBookmark() {
    // 重置表单数据
    bookmarkForm.value = {
        title: '',
        url: '',
        parentId: currentFolder.value || ''
    };
    // 显示对话框
    addBookmarkDialogVisible.value = true;
}

// 确认添加书签或文件夹
async function confirmAddBookmark() {
    if (!bookmarkForm.value.title.trim()) {
        ElMessage.warning('请输入标题');
        return;
    }
    
    const hasUrl = bookmarkForm.value.url.trim();
    
    // 如果有URL，验证URL格式
    if (hasUrl) {
        try {
            new URL(bookmarkForm.value.url);
        } catch (error) {
            ElMessage.error('请输入正确的URL格式（以http://或https://开头）');
            return;
        }
    }

    try {
        const createDetails: CreateDetails = {
            title: bookmarkForm.value.title.trim(),
            url: hasUrl ? bookmarkForm.value.url.trim() : undefined,
            parentId: bookmarkForm.value.parentId || currentFolder.value,
            type: hasUrl ? 'bookmark' : 'folder',
            index: bookmarks.value.length
        };
        
        const newItem = await bookmarkDB.create(createDetails);
        
        const itemType = hasUrl ? '书签' : '文件夹';
        ElMessage.success(`${itemType}添加成功`);
        
        // 关闭对话框
        addBookmarkDialogVisible.value = false;
        
        // 重新加载书签列表和文件夹树
        await loadBookmarks();
        await loadFolderTree();
        
        console.log(`新增${itemType}:`, newItem);
    } catch (error) {
        ElMessage.error('添加失败，请重试');
        console.error('添加错误:', error);
    }
}

// 取消添加书签
function cancelAddBookmark() {
    addBookmarkDialogVisible.value = false;
    bookmarkForm.value = {
        title: '',
        url: '',
        parentId: ''
    };
}

// 清空书签
function clearBookmarks() {
    bookmarkDB.clear();
    loadBookmarks();
    loadFolderTree();
    loadAllBookmarks(); // 重新加载全部书签以更新搜索
    console.log('清空书签');

    ElMessage.success('书签已清空');
}

// 新增的函数
function onChanged(id: string, changeInfo: any) {
    console.log('Bookmark changed:', id, changeInfo);
    // 处理书签更改逻辑
    loadBookmarks();
    loadFolderTree();
    loadAllBookmarks(); // 重新加载全部书签以更新搜索
}

function onChildrenReordered(id: string, reorderInfo: object) {
    console.log('Children reordered for:', id, reorderInfo);
    // 处理子项重排逻辑
    loadBookmarks();
}

function onCreated(id: string, bookmark: BookmarkTreeNode) {
    console.log('Bookmark created:', id, bookmark);
    // 处理创建逻辑
    loadBookmarks();
    loadFolderTree();
    loadAllBookmarks(); // 重新加载全部书签以更新搜索
}

function onImportBegan() {
    console.log('Import began');
    // 处理导入开始逻辑
    ElMessage.info('开始导入书签...');
}

function onImportEnded() {
    ElMessage.success(`成功导入书签`);
    loadBookmarks();
    loadFolderTree();
    loadAllBookmarks(); // 重新加载全部书签以更新搜索
}

function onMoved(id: string, moveInfo: object) {
    console.log('Bookmark moved:', moveInfo);
    // 处理移动逻辑
    loadBookmarks();
    loadFolderTree();
    loadAllBookmarks(); // 重新加载全部书签以更新搜索
}

async function onRemoved(id: string, removeInfo: object) {
    await bookmarkDB.remove(id);
    console.log('Bookmark removed:', removeInfo);
    // 处理删除逻辑
    loadBookmarks();
    loadFolderTree();
    loadAllBookmarks(); // 重新加载全部书签以更新搜索
}

// 编辑书签
function editBookmark(bookmark: BookmarkTreeNode) {
    editingBookmark.value = bookmark;
    editForm.value = {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url || '',
        parentId: bookmark.parentId || ''
    };
    editBookmarkDialogVisible.value = true;
}

// 确认编辑
async function confirmEdit() {
    if (!editForm.value.title.trim()) {
        ElMessage.warning('请输入标题');
        return;
    }
    
    const hasUrl = editForm.value.url.trim();
    
    // 如果有URL，验证URL格式
    if (hasUrl) {
        try {
            new URL(editForm.value.url);
        } catch (error) {
            ElMessage.error('请输入正确的URL格式（以http://或https://开头）');
            return;
        }
    }

    try {
        const changes: any = {
            title: editForm.value.title.trim(),
            parentId: editForm.value.parentId || null
        };
        
        // 只有书签才更新URL
        if (editingBookmark.value?.url !== undefined) {
            changes.url = hasUrl ? editForm.value.url.trim() : undefined;
            if (changes.url) {
                changes.icon = bookmarkDB.getGoogleFaviconUrl(changes.url);
            }
        }
        
        await bookmarkDB.update(editForm.value.id, changes);
        
        const itemType = editingBookmark.value?.url ? '书签' : '文件夹';
        ElMessage.success(`${itemType}编辑成功`);
        
        // 关闭对话框
        editBookmarkDialogVisible.value = false;
        
        // 重新加载书签列表和文件夹树
        await loadBookmarks();
        await loadFolderTree();
        // 重新加载全部书签以更新搜索
        await loadAllBookmarks();
        
        console.log(`编辑${itemType}:`, changes);
    } catch (error) {
        ElMessage.error('编辑失败，请重试');
        console.error('编辑错误:', error);
    }
}

// 取消编辑
function cancelEdit() {
    editBookmarkDialogVisible.value = false;
    editForm.value = {
        id: '',
        title: '',
        url: '',
        parentId: ''
    };
    editingBookmark.value = null;
}
</script>

<style scoped>
/* 搜索框样式 */
.el-header {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 改进搜索框输入样式 */
:deep(.el-input__wrapper) {
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
}

:deep(.el-input__wrapper:hover) {
    border-color: rgba(255, 255, 255, 0.4);
}

:deep(.el-input__wrapper.is-focus) {
    border-color: #409EFF;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.el-input__inner) {
    font-size: 16px;
    color: #303133;
}

:deep(.el-input__inner::placeholder) {
    color: #909399;
}

/* 工具栏样式 */
.el-main > div:first-child {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

/* 书签卡片样式优化 */
.el-card {
    transition: all 0.3s ease;
    border-radius: 12px;
    overflow: hidden;
}

.el-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 侧边栏样式 */
.el-aside {
    background: #f8f9fa;
    border-right: 1px solid #e4e7ed;
    padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .el-header {
        padding: 15px;
    }
    
    .el-header > div {
        max-width: 100%;
    }
    
    .el-space {
        width: 100% !important;
    }
    
    .el-card {
        width: 100% !important;
        max-width: 300px;
    }
}
</style>

<style>
/* 全局样式（不受 scoped 限制）*/
.search-suggestions {
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border: none;
    margin-top: 4px;
}

.search-suggestions .el-autocomplete-suggestion__list {
    padding: 8px;
}

.search-suggestions .el-autocomplete-suggestion__list li {
    border-radius: 8px;
    margin: 2px 0;
    padding: 8px 12px;
    transition: all 0.2s ease;
}

.search-suggestions .el-autocomplete-suggestion__list li:hover {
    background: #f0f9ff;
    transform: translateX(4px);
}

.search-suggestions .el-autocomplete-suggestion__list li.highlighted {
    background: #e6f7ff;
    border-color: #409EFF;
}
</style>
