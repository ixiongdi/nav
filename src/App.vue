<template>
    <div class="app-container">
        <el-container class="main-container">
            <!-- 顶部搜索区 -->
            <el-header class="header-section">
                <div class="header-content">
                    <div class="search-wrapper">
                        <el-autocomplete
                            ref="searchInput"
                            v-model="searchQuery"
                            :fetch-suggestions="handleSearch"
                            placeholder="🔍 搜索书签，按回车快速跳转 (Ctrl+K)"
                            prefix-icon="Search"
                            @select="handleSelect"
                            @keydown="handleKeyDown"
                            @compositionstart="handleCompositionStart"
                            @compositionend="handleCompositionEnd"
                            clearable
                            size="large"
                            class="search-input"
                            :popper-options="{
                                modifiers: [{
                                    name: 'offset',
                                    options: {
                                        offset: [0, 12]
                                    }
                                }]
                            }"
                            :popper-class="'search-suggestions'"
                        >
                            <template #suffix>
                                <el-dropdown trigger="click" @command="handleSearchFilter">
                                    <el-button :icon="Filter" circle size="small" class="filter-btn" />
                                    <template #dropdown>
                                        <el-dropdown-menu class="filter-dropdown">
                                            <el-dropdown-item command="all">🌟 全部</el-dropdown-item>
                                            <el-dropdown-item divided command="recent">⏰ 最近使用</el-dropdown-item>
                                            <el-dropdown-item command="folder">📁 按文件夹筛选</el-dropdown-item>
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
                </div>
            </el-header>

            <el-container class="content-container">
                <!-- 侧边栏文件夹树 -->
                <el-aside class="sidebar">
                    <div class="sidebar-header">
                        <h3 class="sidebar-title">
                            <el-icon class="sidebar-icon"><Folder /></el-icon>
                            文件夹
                        </h3>
                    </div>
                    <div class="folder-tree-wrapper">
                        <el-tree
                            v-model="currentFolder"
                            :data="folderTree"
                            :props="folderTreeProps"
                            node-key="id"
                            @node-click="handleFolderClick"
                            class="folder-tree"
                            :highlight-current="true"
                            :expand-on-click-node="false"
                        >
                            <template #default="{ node, data }">
                                <el-dropdown
                                    trigger="contextmenu"
                                    @command="(command) => handleFolderCommand(command, data)"
                                >
                                    <div class="folder-tree-node">
                                        <el-icon class="folder-icon"><Folder /></el-icon>
                                        <span class="folder-name">{{ data.title }}</span>
                                    </div>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item command="edit">
                                                <el-icon><Edit /></el-icon>
                                                编辑文件夹
                                            </el-dropdown-item>
                                            <el-dropdown-item command="delete" divided>
                                                <el-icon><Delete /></el-icon>
                                                删除文件夹
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </template>
                        </el-tree>
                    </div>
                </el-aside>

                <!-- 主内容区 -->
                <el-main class="main-content">
                    <!-- 工具栏 -->
                    <div class="toolbar">
                        <div class="toolbar-section">
                            <el-button type="primary" @click="importBookmarks" class="action-btn import-btn">
                                <el-icon><Download /></el-icon>
                                导入书签
                            </el-button>
                            <el-button type="success" @click="exportBookmarks" class="action-btn export-btn">
                                <el-icon><Upload /></el-icon>
                                导出书签
                            </el-button>
                        </div>
                        <div class="toolbar-section">
                            <el-button type="primary" @click="addBookmark" class="action-btn add-btn">
                                <el-icon><Plus /></el-icon>
                                新增
                            </el-button>
                            <el-button type="danger" @click="clearBookmarks" class="action-btn clear-btn">
                                <el-icon><FolderDelete /></el-icon>
                                清空
                            </el-button>
                        </div>
                    </div>

                    <!-- 书签统计信息 -->
                    <div class="stats-bar" v-if="bookmarks.length > 0">
                        <div class="stats-item">
                            <el-icon><Document /></el-icon>
                            <span>共 {{ bookmarks.length }} 个书签</span>
                        </div>
                        <div class="stats-item" v-if="currentFolder">
                            <el-icon><Folder /></el-icon>
                            <span>当前文件夹</span>
                        </div>
                    </div>

                    <!-- 书签列表 -->
                    <div class="bookmarks-container">
                        <div class="bookmarks-grid" v-if="bookmarks.length > 0">
                            <div 
                                v-for="bookmark in bookmarks" 
                                :key="bookmark.id" 
                                class="bookmark-card-wrapper"
                            >
                                <el-card class="bookmark-card" shadow="hover" @click="openBookmark(bookmark)">
                                    <div class="bookmark-body">
                                        <!-- 左侧图标 -->
                                        <div class="bookmark-favicon">
                                            <el-avatar 
                                                :src="bookmark.icon" 
                                                :size="40"
                                                class="favicon"
                                            >
                                                <el-icon><Link /></el-icon>
                                            </el-avatar>
                                        </div>
                                        
                                        <!-- 右侧内容区 -->
                                        <div class="bookmark-info">
                                            <!-- 标题 -->
                                            <div class="bookmark-title">
                                                <el-text class="title-text" :title="bookmark.title">
                                                    {{ bookmark.title }}
                                                </el-text>
                                            </div>
                                            
                                            <!-- 链接 -->
                                            <div class="bookmark-url-container">
                                                <div class="bookmark-url" :title="bookmark.url">
                                                    <el-text class="url-text">
                                                        {{ bookmark.url }}
                                                    </el-text>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 操作按钮组 -->
                                        <div class="bookmark-actions" @click.stop>
                                            <el-button 
                                                type="primary" 
                                                :icon="Edit" 
                                                circle 
                                                size="small"
                                                @click="editBookmark(bookmark)"
                                                class="action-btn-circle edit-action"
                                                title="编辑"
                                            />
                                            <el-button
                                                type="danger"
                                                :icon="Delete"
                                                circle
                                                size="small"
                                                @click="onRemoved(bookmark.id, bookmark)"
                                                class="action-btn-circle delete-action"
                                                title="删除"
                                            />
                                        </div>
                                    </div>
                                </el-card>
                            </div>
                        </div>
                        
                        <!-- 空状态 -->
                        <div v-else class="empty-state">
                            <div class="empty-icon">
                                <el-icon size="64"><DocumentCopy /></el-icon>
                            </div>
                            <h3 class="empty-title">暂无书签</h3>
                            <p class="empty-description">点击「新增」按钮添加您的第一个书签吧！</p>
                            <el-button type="primary" @click="addBookmark" class="empty-action">
                                <el-icon><Plus /></el-icon>
                                添加书签
                            </el-button>
                        </div>
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
        
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
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Link, Search, Download, Upload, Plus, Delete, Edit, Clock, Filter, Folder, Document, DocumentCopy, FolderDelete } from '@element-plus/icons-vue';
import { MyBookmarks } from './utils/bookmarks';
import { ElMessage, ElMessageBox } from 'element-plus';
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

// 中文输入法状态
const isComposing = ref(false);

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
        return;
    }
    
    // 处理回车键，但要考虑中文输入法状态
    if (event.key === 'Enter') {
        // 如果正在使用中文输入法，不触发跳转
        if (!isComposing.value) {
            handleSearchJump();
        }
    }
}

// 中文输入法开始
function handleCompositionStart() {
    isComposing.value = true;
}

// 中文输入法结束
function handleCompositionEnd() {
    isComposing.value = false;
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

// 文件夹相关
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

// 打开书签
function openBookmark(bookmark: BookmarkTreeNode) {
    if (bookmark.url) {
        window.open(bookmark.url, '_blank');
        // 更新使用记录
        updateBookmarkUsage(bookmark.id);
    }
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

// 处理文件夹菜单命令
function handleFolderCommand(command: string, folderData: any) {
    switch (command) {
        case 'edit':
            editFolder(folderData);
            break;
        case 'delete':
            deleteFolderWithConfirm(folderData);
            break;
    }
}

// 编辑文件夹
function editFolder(folder: BookmarkTreeNode) {
    editingBookmark.value = folder;
    editForm.value = {
        id: folder.id,
        title: folder.title,
        url: '', // 文件夹没有URL
        parentId: folder.parentId || ''
    };
    editBookmarkDialogVisible.value = true;
}

// 删除文件夹（带确认）
async function deleteFolderWithConfirm(folder: BookmarkTreeNode) {
    try {
        // 检查文件夹是否有子内容
        const children = await bookmarkDB.getBookmarkChildren(folder.id);
        let confirmMessage = `确定要删除文件夹「${folder.title}」吗？`;
        
        if (children.length > 0) {
            confirmMessage += `\n\n注意：该文件夹包含 ${children.length} 个子项，删除后将无法恢复！`;
        }
        
        const { value } = await ElMessageBox.confirm(
            confirmMessage,
            '删除文件夹',
            {
                type: 'warning',
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                dangerouslyUseHTMLString: true
            }
        );
        
        if (value === 'confirm') {
            await deleteFolder(folder);
        }
    } catch (error) {
        // 用户取消了操作
        console.log('用户取消了删除操作');
    }
}

// 删除文件夹
async function deleteFolder(folder: BookmarkTreeNode) {
    try {
        ElMessage.info('正在删除文件夹...');
        
        // 使用 removeTree 方法递归删除文件夹及其所有子内容
        await bookmarkDB.removeTree(folder.id);
        
        ElMessage.success(`文件夹「${folder.title}」删除成功`);
        
        // 如果删除的是当前选中的文件夹，则清空当前选择
        if (currentFolder.value === folder.id) {
            currentFolder.value = '';
        }
        
        // 重新加载数据
        await loadFolderTree();
        await loadBookmarks();
        await loadAllBookmarks();
        
        console.log('文件夹删除成功:', folder);
    } catch (error) {
        ElMessage.error('删除文件夹失败，请重试');
        console.error('删除文件夹错误:', error);
    }
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
/* 应用容器 */
.app-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-container {
    min-height: 100vh;
    backdrop-filter: blur(10px);
}

/* 头部样式 */
.header-section {
    padding: 20px 32px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    min-height: 100px;
    display: flex;
    align-items: center;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.search-wrapper {
    position: relative;
}

.search-input {
    width: 100%;
}

.filter-btn {
    margin-right: 16px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.filter-btn:hover {
    background: white;
    transform: translateY(-2px) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 内容容器 */
.content-container {
    background: rgba(255, 255, 255, 0.95);
    margin: 0 16px 16px 16px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

/* 侧边栏样式 */
.sidebar {
    width: 280px;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    border-right: 1px solid #e2e8f0;
    padding: 0;
}

.sidebar-header {
    padding: 24px 20px 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    background: white;
}

.sidebar-title {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    gap: 8px;
}

.sidebar-icon {
    color: #6366f1;
}

.folder-tree-wrapper {
    padding: 16px;
}

.folder-tree {
    background: transparent;
}

/* 文件夹树节点样式 */
.folder-tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    width: 100%;
    min-height: 32px;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
    user-select: none;
}

.folder-tree-node:hover {
    background: rgba(99, 102, 241, 0.1);
    transform: translateX(2px);
}

.folder-icon {
    font-size: 16px;
    color: #6366f1;
    flex-shrink: 0;
}

.folder-name {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 确保dropdown触发区域覆盖整个节点 */
:deep(.el-tree-node__content) {
    padding: 0 !important;
}

:deep(.el-tree-node__content .el-dropdown) {
    width: 100%;
}

:deep(.el-tree-node__content .el-dropdown > div) {
    width: 100%;
}

/* 主内容区样式 */
.main-content {
    background: white;
    padding: 24px;
}

/* 工具栏样式 */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.toolbar-section {
    display: flex;
    gap: 12px;
    align-items: center;
}

.action-btn {
    border-radius: 12px;
    padding: 12px 20px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.import-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.export-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.add-btn {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.clear-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* 统计栏 */
.stats-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
    border-radius: 12px;
    border: 1px solid #f59e0b;
}

.stats-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #92400e;
}

/* 书签容器 */
.bookmarks-container {
    min-height: 400px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.bookmarks-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 4px;
    width: 100%;
    box-sizing: border-box;
}

.bookmark-card-wrapper {
    transition: all 0.3s ease;
    width: 100%;
    min-width: 0;
}

.bookmark-card {
    height: auto;
    min-height: 120px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background: white;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    width: 100%;
    box-sizing: border-box;
}

.bookmark-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-color: #6366f1;
}

/* 书签主体内容区域 */
.bookmark-body {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    position: relative;
    transition: transform 0.3s ease;
}

.bookmark-card:hover .bookmark-body {
    transform: translateY(-2px);
}

/* 左侧图标区域 */
.bookmark-favicon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.favicon {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.bookmark-card:hover .favicon {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 右侧信息区域 */
.bookmark-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow: hidden;
}

.bookmark-title {
    width: 100%;
    min-width: 0;
}

.title-text {
    font-weight: 600;
    color: #1f2937;
    font-size: 14px;
    line-height: 1.3;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
}

.bookmark-url-container {
    width: 100%;
    min-width: 0;
}

.bookmark-url {
    display: block;
    padding: 8px 10px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    width: 100%;
    min-height: 46px;
    cursor: inherit;
    box-sizing: border-box;
    overflow: hidden;
}

.bookmark-card:hover .bookmark-url {
    background: #f1f5f9;
    border-color: #6366f1;
}

.url-text {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
    width: 100%;
    box-sizing: border-box;
}

/* 操作按钮样式 */
.bookmark-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    visibility: hidden;
    opacity: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: scale(0.9);
    flex-shrink: 0;
    padding: 6px;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%) scale(0.9);
}

/* 卡片悬停时显示按钮 */
.bookmark-card:hover .bookmark-actions {
    visibility: visible;
    opacity: 1;
    transform: translateY(-50%) scale(1);
}

.action-btn-circle {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    cursor: pointer;
    position: relative;
    z-index: 100;
    opacity: 0.9;
    visibility: visible;
    pointer-events: auto;
    transform: scale(1);
}

/* 卡片悬停时按钮放大并完全显示 */
.bookmark-card:hover .action-btn-circle {
    opacity: 1;
    transform: scale(1.05);
}

.action-btn-circle:hover {
    transform: translateY(-2px) scale(1.15) !important;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2) !important;
}

.action-btn-circle:active {
    transform: translateY(-1px) scale(1.1) !important;
}

.edit-action {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
    color: white !important;
}

.edit-action:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
}

.delete-action {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    color: white !important;
}

.delete-action:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #6b7280;
}

.empty-icon {
    margin-bottom: 24px;
    opacity: 0.6;
}

.empty-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #374151;
}

.empty-description {
    font-size: 16px;
    margin-bottom: 32px;
    color: #6b7280;
    line-height: 1.6;
}

.empty-action {
    border-radius: 12px;
    padding: 12px 32px;
    font-size: 16px;
    font-weight: 500;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
}

.empty-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .header-section {
        padding: 16px 20px;
        min-height: 80px;
    }
    
    .header-content {
        max-width: 100%;
    }
    
    :deep(.el-input__wrapper) {
        height: 52px;
    }
    
    :deep(.el-input__inner) {
        font-size: 16px;
        height: 48px;
        line-height: 48px;
        padding: 0 20px;
    }
    
    :deep(.el-input__inner::placeholder) {
        font-size: 14px;
    }
    
    :deep(.el-input__prefix) {
        font-size: 18px;
        height: 48px;
    }
    
    :deep(.el-input__suffix) {
        height: 48px;
    }
    
    .filter-btn {
        width: 36px;
        height: 36px;
    }
    
    .content-container {
        margin: 0 8px 8px 8px;
        border-radius: 16px;
    }
    
    .sidebar {
        width: 100%;
        max-width: 100%;
    }
    
    .main-content {
        padding: 16px;
    }
    
    .toolbar {
        flex-direction: column;
        gap: 16px;
        padding: 16px;
    }
    
    .toolbar-section {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .bookmarks-container {
        max-width: 100%;
        padding: 0 8px;
    }
    
    .bookmarks-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 2px;
    }
    
    .bookmark-card {
        min-height: 110px;
    }
    
    .bookmark-body {
        padding: 14px;
        gap: 10px;
    }
    
    .favicon {
        width: 36px !important;
        height: 36px !important;
    }
    
    .title-text {
        font-size: 13px;
    }
    
    .url-text {
        font-size: 11px;
    }
    
    .action-btn-circle {
        width: 24px;
        height: 24px;
        font-size: 10px;
    }
    
    .bookmark-actions {
        gap: 4px;
        padding: 4px;
        right: 8px;
    }
}

@media (max-width: 480px) {
    .header-section {
        padding: 12px 16px;
        min-height: 70px;
    }
    
    .header-content {
        max-width: 100%;
    }
    
    :deep(.el-input__wrapper) {
        height: 48px;
        border-radius: 20px;
    }
    
    :deep(.el-input__inner) {
        font-size: 15px;
        height: 44px;
        line-height: 44px;
        padding: 0 18px;
    }
    
    :deep(.el-input__inner::placeholder) {
        font-size: 13px;
    }
    
    :deep(.el-input__prefix) {
        font-size: 16px;
        height: 44px;
        margin-left: 6px;
    }
    
    :deep(.el-input__suffix) {
        height: 44px;
        margin-right: 6px;
    }
    
    .filter-btn {
        width: 32px;
        height: 32px;
        margin-right: 12px;
    }
    
    .content-container {
        margin: 0 4px 4px 4px;
        border-radius: 12px;
    }
    
    .toolbar {
        padding: 12px;
    }
    
    .action-btn {
        padding: 10px 16px;
        font-size: 14px;
    }
    
    .bookmarks-container {
        max-width: 100%;
        padding: 0 4px;
    }
    
    .bookmarks-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 2px;
    }
    
    .bookmark-card {
        min-height: 100px;
    }
    
    .bookmark-body {
        padding: 10px;
        gap: 8px;
    }
    
    .favicon {
        width: 32px !important;
        height: 32px !important;
    }
    
    .title-text {
        font-size: 12px;
    }
    
    .url-text {
        font-size: 10px;
        -webkit-line-clamp: 2;
    }
    
    .bookmark-url {
        padding: 6px 8px;
        min-height: 40px;
    }
    
    .action-btn-circle {
        width: 22px;
        height: 22px;
        font-size: 9px;
    }
    
    .bookmark-actions {
        gap: 3px;
        padding: 3px;
        right: 6px;
        border-radius: 10px;
    }
    
    .action-btn-circle {
        width: 24px;
        height: 24px;
        font-size: 10px;
    }
    
    .bookmark-actions {
        gap: 3px;
        padding: 3px 5px;
        top: 4px;
        right: 4px;
        border-radius: 12px;
    }
}

/* 改进搜索框输入样式 */
:deep(.el-input__wrapper) {
    border-radius: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
    height: 60px;
    padding: 0 8px;
}

:deep(.el-input__wrapper:hover) {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

:deep(.el-input__wrapper.is-focus) {
    border-color: #6366f1;
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.25);
    background: white;
    transform: translateY(-2px);
}

:deep(.el-input__inner) {
    font-size: 18px;
    color: #1f2937;
    font-weight: 500;
    padding: 0 24px;
    height: 56px;
    line-height: 56px;
}

:deep(.el-input__inner::placeholder) {
    color: #6b7280;
    font-weight: 400;
    font-size: 16px;
}

:deep(.el-input__prefix) {
    color: #6b7280;
    font-size: 20px;
    margin-left: 8px;
    height: 56px;
    display: flex;
    align-items: center;
}

:deep(.el-input__suffix) {
    height: 56px;
    display: flex;
    align-items: center;
    margin-right: 8px;
}

/* 树形组件样式 */
:deep(.el-tree-node__content) {
    height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    margin: 2px 0;
    transition: all 0.3s ease;
}

:deep(.el-tree-node__content:hover) {
    background: #f3f4f6;
    transform: translateX(4px);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    font-weight: 500;
}

:deep(.el-tree-node__expand-icon) {
    color: #6b7280;
    font-size: 14px;
}

:deep(.is-current .el-tree-node__expand-icon) {
    color: white;
}

/* 下拉菜单样式 */
.filter-dropdown {
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid #e2e8f0;
    padding: 8px;
}

:deep(.el-dropdown-menu__item) {
    border-radius: 8px;
    margin: 2px 0;
    padding: 10px 16px;
    transition: all 0.3s ease;
    font-weight: 500;
}

:deep(.el-dropdown-menu__item:hover) {
    background: #f3f4f6;
    color: #6366f1;
    transform: translateX(4px);
}

/* 卡片头部样式优化 */
:deep(.el-card__header) {
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
    min-height: 80px;
    display: flex;
    align-items: center;
}

:deep(.el-card__body) {
    padding: 16px 20px;
    height: 100px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
}
</style>

<style>
/* 全局样式（不受 scoped 限制）*/
.search-suggestions {
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border: 1px solid #e2e8f0;
    margin-top: 8px;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.95);
}

.search-suggestions .el-autocomplete-suggestion__list {
    padding: 12px;
}

.search-suggestions .el-autocomplete-suggestion__list li {
    border-radius: 12px;
    margin: 4px 0;
    padding: 12px 16px;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid transparent;
}

.search-suggestions .el-autocomplete-suggestion__list li:hover {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    transform: translateX(8px) scale(1.02);
    border-color: #0ea5e9;
    box-shadow: 0 8px 20px rgba(14, 165, 233, 0.15);
}

.search-suggestions .el-autocomplete-suggestion__list li.highlighted {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-color: #3b82f6;
    transform: translateX(8px) scale(1.02);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
}

/* 建议项中的图标和文本样式 */
.search-suggestions .el-avatar {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-suggestions .el-icon {
    color: #6b7280;
    transition: color 0.3s ease;
}

.search-suggestions .el-autocomplete-suggestion__list li:hover .el-icon {
    color: #0ea5e9;
}

.search-suggestions .el-autocomplete-suggestion__list li.highlighted .el-icon {
    color: #3b82f6;
}

/* 搜索建议项内容样式 */
.search-suggestions .el-autocomplete-suggestion__list li > div {
    border-radius: 8px;
}

.search-suggestions .el-autocomplete-suggestion__list li > div > div:first-child {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
    font-size: 15px;
}

.search-suggestions .el-autocomplete-suggestion__list li > div > div:not(:first-child) {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
}

.search-suggestions .el-autocomplete-suggestion__list li:hover > div > div:first-child {
    color: #0ea5e9;
}

.search-suggestions .el-autocomplete-suggestion__list li.highlighted > div > div:first-child {
    color: #3b82f6;
}

/* 对话框样式优化 */
.el-dialog {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(20px);
}

.el-dialog__header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 24px 32px;
    border-bottom: 1px solid #e2e8f0;
}

.el-dialog__title {
    font-weight: 600;
    font-size: 18px;
    color: #1f2937;
}

.el-dialog__body {
    padding: 32px;
}

.el-dialog__footer {
    padding: 24px 32px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

/* 表单样式优化 */
.el-form-item__label {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
}

.el-input {
    border-radius: 12px;
}

.el-input__wrapper {
    border-radius: 12px;
    transition: all 0.3s ease;
}

.el-input__wrapper:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.el-input__wrapper.is-focus {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

/* 按钮样式优化 */
.el-button {
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.el-button:hover {
    transform: translateY(-1px);
}

.el-button--primary {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.el-button--primary:hover {
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.el-button--success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.el-button--success:hover {
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.el-button--danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.el-button--danger:hover {
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

/* 树选择器样式 */
.el-tree-select {
    border-radius: 12px;
}

.el-tree-select__wrapper {
    border-radius: 12px;
}

/* 强制覆盖Element Plus按钮样式 */
:deep(.bookmark-actions .el-button) {
    width: 28px !important;
    height: 28px !important;
    border-radius: 50% !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 12px !important;
    cursor: pointer !important;
    position: relative !important;
    z-index: 100 !important;
    opacity: 0.9 !important;
    visibility: visible !important;
    pointer-events: auto !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    transform: scale(1) !important;
}

:deep(.bookmark-card:hover .bookmark-actions .el-button) {
    opacity: 1 !important;
    transform: scale(1.05) !important;
}

:deep(.bookmark-actions .el-button:hover) {
    transform: translateY(-2px) scale(1.2) !important;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2) !important;
}

:deep(.bookmark-actions .el-button.edit-action) {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
    color: white !important;
}

:deep(.bookmark-actions .el-button.delete-action) {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    color: white !important;
}

:deep(.bookmark-actions .el-button .el-icon) {
    color: white !important;
    font-size: 12px !important;
}
.el-message {
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(10px);
}

/* 加载动画 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.bookmark-card-wrapper {
    animation: fadeInUp 0.6s ease forwards;
}

.bookmark-card-wrapper:nth-child(1) { animation-delay: 0.1s; }
.bookmark-card-wrapper:nth-child(2) { animation-delay: 0.2s; }
.bookmark-card-wrapper:nth-child(3) { animation-delay: 0.3s; }
.bookmark-card-wrapper:nth-child(4) { animation-delay: 0.4s; }
.bookmark-card-wrapper:nth-child(5) { animation-delay: 0.5s; }
.bookmark-card-wrapper:nth-child(6) { animation-delay: 0.6s; }

/* Element Plus Dropdown 菜单样式优化 */
:deep(.el-dropdown-menu) {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 8px 0;
    min-width: 160px;
}

:deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    gap: 8px;
    border-radius: 8px;
    margin: 2px 8px;
    transition: all 0.2s ease;
}

:deep(.el-dropdown-menu__item:hover) {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
}

:deep(.el-dropdown-menu__item:focus) {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
}

:deep(.el-dropdown-menu__item.is-divided) {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: 8px;
}

/* 删除按钮特殊样式 */
:deep(.el-dropdown-menu__item[data-command="delete"]) {
    color: #ef4444;
}

:deep(.el-dropdown-menu__item[data-command="delete"]:hover) {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}
</style>
