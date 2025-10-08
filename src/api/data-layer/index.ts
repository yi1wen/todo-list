import { initStorage, getTodos, getConflicts, listenStorage } from './storage';
import { 
  addTodo, 
  deleteTodo, 
  toggleTodoStatus, 
  editTodoContent,
  forceCloseTimeWindow
} from './todo-manager';
import { TodoStatus, STORAGE_KEYS, TIME_WINDOW_DURATION } from './types';

// 初始化存储
initStorage();

export const TodoData = {
  // 常量
  TodoStatus,
  STORAGE_KEYS,
  TIME_WINDOW_DURATION,
  
  // 数据获取
  getTodos,
  getConflicts,
  
  // 操作方法
  addTodo,
  deleteTodo,
  toggleTodoStatus,
  editTodoContent,
  forceCloseTimeWindow,
  
  // 存储监听
  listenStorage
};

export default TodoData;