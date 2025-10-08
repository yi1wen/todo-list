import { OperationLog, TodoItem, TodoStatus, OperationType } from './types';
import { addConflictMessage } from './storage';

// 按ID分组操作
const groupOperationsById = (operations: OperationLog[]): Record<string, OperationLog[]> => {
  return operations.reduce((groups, operation) => {
    const id = operation.data.id;
    if (!id && operation.action !== OperationType.ADD) return groups;
    
    // 对于添加操作，使用临时ID或内容作为分组键
    const groupKey = id || `add-${operation.data.content}-${operation.timestamp}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(operation);
    return groups;
  }, {} as Record<string, OperationLog[]>);
};

// 合并操作，解决冲突
export const mergeOperations = (operations: OperationLog[]): OperationLog[] => {
  const grouped = groupOperationsById(operations);
  const mergedOperations: OperationLog[] = [];
  
  // 处理每个分组
  Object.values(grouped).forEach(group => {
    if (group.length <= 1) {
      // 没有冲突，直接添加
      mergedOperations.push(...group);
      return;
    }
    
    // 按时间戳排序，最新的在后面
    const sorted = [...group].sort((a, b) => a.timestamp - b.timestamp);
    // 取时间戳最老的一个作为有效操作
    const resolvedOperation = sorted[0];
    // 剩下的都是冲突操作
    const conflictingOperations = sorted.slice(1);
    
    // 记录冲突信息
    if (resolvedOperation.data.id) {
      addConflictMessage({
        message: `检测到${group.length}个并发操作，已采用最新的操作结果`,
        conflictingOperations,
        resolvedOperation
      });
    }
    
    mergedOperations.push(resolvedOperation);
  });
  
  return mergedOperations;
};
// 应用操作到待办列表
export const applyOperations = (todos: TodoItem[], operations: OperationLog[]): TodoItem[] => {
  let updatedTodos = [...todos];
  
  operations.forEach(operation => {
    const { id } = operation.data;
    
    switch (operation.action) {
      case OperationType.ADD:
        if (operation.data.content) {
          // 生成新ID
          const newId = Date.now().toString();
          updatedTodos.push({
            id: newId,
            content: operation.data.content,
            status: TodoStatus.PENDING,
          });
        }
        break;
        
      case OperationType.DELETE:
        if (id) {
          updatedTodos = updatedTodos.filter(todo => todo.id !== id);
        }
        break;
        
      case OperationType.UPDATE:
        if (id && operation.data.content) {
          updatedTodos = updatedTodos.map(todo => 
            todo.id === id 
              ? { ...todo, content: operation.data.content, lastModified: operation.timestamp }
              : todo
          ) as TodoItem[];
        }
        break;
        
      case OperationType.TOGGLE_STATUS:
        if (id && operation.data.status) {
          updatedTodos = updatedTodos.map(todo => 
            todo.id === id 
              ? { ...todo, status: operation.data.status, lastModified: operation.timestamp }
              : todo
          ) as TodoItem[];
        }
        break;
    }
  });
  
  return updatedTodos;
};