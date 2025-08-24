// 测试导出功能的HTML格式
import { bookmarksToHtml } from './src/utils/parser.js';

// 测试数据
const testBookmarks = [
    {
        id: '1',
        type: 'folder',
        title: '开发工具',
        dateAdded: Date.now(),
        dateGroupModified: Date.now(),
        children: [
            {
                id: '2',
                type: 'bookmark',
                title: 'GitHub',
                url: 'https://github.com',
                dateAdded: Date.now(),
                icon: 'https://github.com/favicon.ico'
            },
            {
                id: '3',
                type: 'bookmark', 
                title: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                dateAdded: Date.now(),
                icon: 'https://stackoverflow.com/favicon.ico'
            }
        ]
    },
    {
        id: '4',
        type: 'bookmark',
        title: 'Google',
        url: 'https://google.com',
        dateAdded: Date.now(),
        icon: 'https://google.com/favicon.ico'
    },
    {
        id: '5',
        type: 'separator',
        title: ''
    }
];

// 生成HTML并输出
const html = bookmarksToHtml(testBookmarks, '测试书签');
console.log('Generated HTML:');
console.log(html);