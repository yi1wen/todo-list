import { 
  OperationLog, 
  OperationType, 
  TimeWindow, 
  TIME_WINDOW_DURATION,
  TodoStatus,
} from './types';
import { 
  getTodos, 
  saveTodos, 
  getTimeWindow, 
  saveTimeWindow 
} from './storage';
import { mergeOperations, applyOperations } from './conflict-resolve';

let windowTimeout: number | null = null;

const createOperation = (
  action: OperationType,
  data: OperationLog['data']
): OperationLog => {
  return {
    action,
    timestamp: Date.now(),
    data
  };
};

// 关闭时间窗口，合并并应用操作
const closeTimeWindow = (): void => {
  const window = getTimeWindow();
  
  if (!window.isOpen) return;
  
  // 合并操作
  const mergedOperations = mergeOperations(window.operations);
  
  // 应用合并后的操作
  const currentTodos = getTodos();
  const updatedTodos = applyOperations(currentTodos, mergedOperations);
  saveTodos(updatedTodos);
  
  // 重置时间窗口
  const newWindow: TimeWindow = {
    isOpen: false,
    operations: []
  };
  saveTimeWindow(newWindow);
  
  // 清除超时 - 使用浏览器的clearTimeout
  if (windowTimeout !== null) {
    clearTimeout(windowTimeout);
    windowTimeout = null;
  }
};

// 管理时间窗口，打开或返回现有窗口
const manageTimeWindow = (): TimeWindow => {
  const window = getTimeWindow();
  
  // 如果窗口未打开，创建新窗口
  if (!window.isOpen) {
    const newWindow: TimeWindow = {
      isOpen: true,
      operations: [...window.operations]
    };
    
    saveTimeWindow(newWindow);

    windowTimeout = setTimeout(closeTimeWindow, TIME_WINDOW_DURATION);
    
    return newWindow;
  }
  
  // 窗口已打开，直接返回
  return window;
};

// 向时间窗口添加操作
const addOperationToWindow = (operation: OperationLog): void => {
  const window = manageTimeWindow();
  
  const updatedWindow: TimeWindow = {
    ...window,
    operations: [...window.operations, operation]
  };
  
  saveTimeWindow(updatedWindow);
};

// 新增待办
export const addTodo = (operation: OperationLog): void => {

  const newOperation = createOperation(OperationType.ADD, operation.data);

  addOperationToWindow(newOperation);
};
// 删除待办
export const deleteTodo = (todoId: string): void => {
  const operation = createOperation(OperationType.DELETE, {
    id: todoId
  });
  
  addOperationToWindow(operation);
};

// 切换待办状态
export const toggleTodoStatus = (todoId: string, newStatus: TodoStatus): void => {
  const todos = getTodos();
  const todo = todos.find(t => t.id === todoId);
  
  if (!todo) return;
  
  const operation = createOperation(OperationType.TOGGLE_STATUS, {
    id: todoId,
    status: newStatus
  });
  
  addOperationToWindow(operation);
};
// 编辑待办内容
export const editTodoContent = (todoId: string, newContent: string): void => {
  if (!newContent.trim()) return;
  
  const operation = createOperation(OperationType.UPDATE, {
    id: todoId,
    content: newContent
  });
  
  addOperationToWindow(operation);
};

// 强制关闭时间窗口
export const forceCloseTimeWindow = (): void => {
  closeTimeWindow();
};