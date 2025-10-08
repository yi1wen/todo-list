import { TodoItem, TimeWindow, STORAGE_KEYS, ConflictInfo } from './types';

const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, newValue) {
    const setItemEvent = new Event('setItemEvent');
    (setItemEvent as any)[key] = newValue;
    window.dispatchEvent(setItemEvent);
    originalSetItem.apply(this, [key, newValue]);};

// 初始化
export const initStorage = (): void => {
    if (!localStorage.getItem(STORAGE_KEYS.TODOS)) {
        localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIME_WINDOW)) {
        const initialWindow: TimeWindow = {
            isOpen: false,
            operations: []
        };
        localStorage.setItem(STORAGE_KEYS.TIME_WINDOW, JSON.stringify(initialWindow));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFLICTS)) {
        localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify([]));
    }
};
// 获取待办列表
export const getTodos = (): TodoItem[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TODOS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('获取待办列表失败', error);
        return [];
    }
};
// 保存待办列表
export const saveTodos = (todos: TodoItem[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch (error) {
        console.error('保存待办列表失败', error);
    }
};
// 获取时间窗口
export const getTimeWindow = (): TimeWindow => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TIME_WINDOW);
        return data ? JSON.parse(data) : { isOpen: false, operations: [] };
    } catch (error) {
        console.error('获取时间窗口失败', error);
        return { isOpen: false, operations: [] };
    }
};
// 保存时间窗口
export const saveTimeWindow = (window: TimeWindow): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.TIME_WINDOW, JSON.stringify(window));
    } catch (error) {
        console.error('保存时间窗口失败', error);
    }
};

// 获取冲突信息
export const getConflicts = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('获取冲突信息失败', error);
        return [];
    }
};

// 保存冲突信息
export const saveConflicts = (messages: ConflictInfo[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(messages));
    } catch (error) {
        console.error('保存冲突信息失败', error);
    }
};
// 添加冲突信息
export const addConflictMessage = (message: ConflictInfo): void => {
    const messages = getConflicts();
    const newMessage: ConflictInfo = {
        ...message,
    };
    saveConflicts([...messages, newMessage]);
};
  
// key是变化的存储键名, value是新的值
export const listenStorage = (callback: (key: string, value: unknown) => void) => {
    const handleStorageChange = (e: StorageEvent) => {
        if (Object.values(STORAGE_KEYS).includes(e.key as string) && e.newValue) {
            try {
                console.log('listenStorage', e.key, e.newValue);
                const value = JSON.parse(e.newValue);
                callback(e.key as string, value);
            } catch (error) {
                console.error('解析存储数据失败', error);
            }
        }
    };
    console.log('listenStorage', 'addEventListener');

    window.addEventListener('storage', handleStorageChange);
  
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
};