import type { BookmarkTreeNode } from '../types/bookmark';
import { v7 } from 'uuid';

/**
 * 从HTML字符串解析书签数据
 * @param html HTML字符串
 * @returns 解析后的书签树节点数组
 */
export function parseHtmlToBookmarks(html: string): BookmarkTreeNode[] {
    // 创建一个临时DOM元素来解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 获取所有的DL元素（书签列表容器）
    const dlElements = doc.querySelectorAll('dl');
    if (dlElements.length === 0) {
        return [];
    }

    // 从最外层的DL开始解析
    const rootDl = dlElements[0];
    if (!rootDl) {
        return [];
    }
    return processDlElement(rootDl);
}

/**
 * 将书签数据转换为标准HTML格式
 * @param bookmarks 书签树节点数组
 * @param title 书签文件的标题
 * @returns HTML字符串
 */
export function bookmarksToHtml(bookmarks: BookmarkTreeNode[], title: string = 'Bookmarks'): string {
    
    // HTML文档头部
    const htmlHeader = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(title)}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<dl><p>`;
    
    // HTML文档尾部
    const htmlFooter = `</dl></p>
</body>
</html>`;
    
    // 转换书签树为HTML内容
    const htmlContent = bookmarksToHtmlRecursive(bookmarks);
    
    return htmlHeader + htmlContent + htmlFooter;
}

/**
 * 递归将书签树节点转换为HTML
 * @param bookmarks 书签节点数组
 * @param level 嵌套层级（用于缩进）
 * @returns HTML字符串
 */
function bookmarksToHtmlRecursive(bookmarks: BookmarkTreeNode[], level: number = 0): string {
    let html = '';
    const indent = '    '.repeat(level + 1);
    
    for (const bookmark of bookmarks) {
        if (bookmark.type === 'folder') {
            // 文件夹
            const addDate = bookmark.dateAdded ? Math.floor(bookmark.dateAdded / 1000) : Math.floor(Date.now() / 1000);
            const lastModified = bookmark.dateGroupModified ? Math.floor(bookmark.dateGroupModified / 1000) : addDate;
            
            let folderAttributes = `add_date="${addDate}" last_modified="${lastModified}"`;
            
            // 添加特殊文件夹属性
            if (bookmark.folderType === 'bookmarks-bar') {
                folderAttributes += ' personal_toolbar_folder="true"';
            }
            
            html += `${indent}<dt><h3 ${folderAttributes}>${escapeHtml(bookmark.title || '')}</h3>\n`;
            
            // 如果有子书签，递归处理
            if (bookmark.children && bookmark.children.length > 0) {
                html += `${indent}    <dl><p>\n`;
                html += bookmarksToHtmlRecursive(bookmark.children, level + 2);
                html += `${indent}    </dl></p>\n`;
            }
            
            html += `${indent}</dt>\n`;
            
        } else if (bookmark.type === 'bookmark' && bookmark.url) {
            // 书签
            const addDate = bookmark.dateAdded ? Math.floor(bookmark.dateAdded / 1000) : Math.floor(Date.now() / 1000);
            let attributes = `href="${escapeHtml(bookmark.url)}" add_date="${addDate}"`;
            
            // 添加图标
            if (bookmark.icon) {
                attributes += ` icon="${escapeHtml(bookmark.icon)}"`;
            }
            
            // 添加最后访问时间
            if (bookmark.dateLastUsed) {
                attributes += ` last_visit="${Math.floor(bookmark.dateLastUsed / 1000)}"`;
            }
            
            html += `${indent}<dt><a ${attributes}>${escapeHtml(bookmark.title || '')}</a></dt>\n`;
            
        } else if (bookmark.type === 'separator') {
            // 分隔符
            html += `${indent}<dt><hr></dt>\n`;
        }
    }
    
    return html;
}

/**
 * HTML转义函数
 * @param text 需要转义的文本
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 处理DL元素并返回书签节点数组
 * @param dl DL元素
 * @returns 书签节点数组
 */
function processDlElement(dl: HTMLDListElement): BookmarkTreeNode[] {
    const bookmarks: BookmarkTreeNode[] = [];
    let index = 0;

    // 遍历DL的直接子节点
    for (let i = 0; i < dl.children.length; i++) {
        const child = dl.children[i];
        if (!child) continue;

        // 只处理DT元素（使用小写比较）
        if (child.tagName.toLowerCase() !== 'dt') {
            continue;
        }

        // 获取DT的第一个元素子节点
        const firstElementChild = getFirstElementChild(child);
        if (!firstElementChild) {
            continue;
        }

        let bookmarkNode: BookmarkTreeNode | null = null;
        const tagName = firstElementChild.tagName.toLowerCase();

        // 根据元素类型处理不同的书签节点（使用小写比较）
        if (tagName === 'a') {
            // 书签节点
            bookmarkNode = processAnchorElement(firstElementChild as HTMLAnchorElement, index);
        } else if (tagName === 'h3') {
            // 文件夹节点
            bookmarkNode = processHeadingElement(firstElementChild as HTMLHeadingElement, child, index);
        } else if (tagName === 'hr') {
            // 分隔符节点
            bookmarkNode = processHrElement(index);
        }

        if (bookmarkNode) {
            bookmarks.push(bookmarkNode);
            index++;
        }
    }

    return bookmarks;
}

/**
 * 处理A标签元素（书签）
 * @param a A标签元素
 * @param index 索引位置
 * @returns 书签节点
 */
function processAnchorElement(a: HTMLAnchorElement, index: number): BookmarkTreeNode {
    const addDate = a.getAttribute('add_date');
    const icon = a.getAttribute('icon');
    const lastVisit = a.getAttribute('last_visit');

    return {
        id: v7(),
        type: 'bookmark',
        title: a.textContent?.trim() || '',
        url: a.href,
        dateAdded: addDate ? parseInt(addDate) * 1000 : Date.now(),
        dateLastUsed: lastVisit ? parseInt(lastVisit) * 1000 : undefined,
        icon: icon || new URL(a.href).origin + '/favicon.ico',
        index,
    };
}

/**
 * 处理H3标签元素（文件夹）
 * @param h3 H3标签元素
 * @param dt 父DT元素
 * @param index 索引位置
 * @returns 文件夹节点
 */
function processHeadingElement(h3: HTMLHeadingElement, dt: Element, index: number): BookmarkTreeNode {
    const addDate = h3.getAttribute('add_date');
    const lastModified = h3.getAttribute('last_modified');

    // 查找DT元素中的DL子元素（文件夹内容）
    const dl = Array.from(dt.children).find((el) => el.tagName.toLowerCase() === 'dl') as HTMLDListElement;

    const folderNode: BookmarkTreeNode = {
        id: v7(),
        type: 'folder',
        title: h3.textContent?.trim() || '',
        dateAdded: addDate ? parseInt(addDate) * 1000 : Date.now(),
        dateGroupModified: lastModified ? parseInt(lastModified) * 1000 : undefined,
        index,
    };

    // 检查是否是特殊文件夹类型
    const personalToolbar = h3.getAttribute('personal_toolbar_folder');
    if (personalToolbar === 'true') {
        folderNode.folderType = 'bookmarks-bar';
    }

    // 如果存在子DL元素，递归处理
    if (dl) {
        folderNode.children = processDlElement(dl);
    }

    return folderNode;
}

/**
 * 处理HR元素（分隔符）
 * @param index 索引位置
 * @returns 分隔符节点
 */
function processHrElement(index: number): BookmarkTreeNode {
    return {
        id: v7(),
        type: 'separator',
        title: '', // 分隔符无标题
        index,
    };
}

/**
 * 获取元素的第一个元素子节点
 * @param element 父元素
 * @returns 第一个元素子节点或null
 */
function getFirstElementChild(element: Element): Element | null {
    for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        if (child && child.nodeType === 1) {
            // 元素节点
            return child;
        }
    }
    return null;
}
