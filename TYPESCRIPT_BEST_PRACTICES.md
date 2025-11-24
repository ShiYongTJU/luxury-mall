# TypeScript 开发最佳实践和常见错误避免指南

## 本次发现的问题总结

### 1. **接口/类型修改后未同步更新所有使用处**
**问题描述：**
- 修改 `Page` 接口添加 `name` 字段后，忘记更新 `pg-db.ts` 中 `getPageById` 函数的返回值
- 导致编译错误：`Property 'name' is missing in type`

**解决方案：**
- 修改接口/类型定义后，必须全局搜索并更新所有使用该类型的地方
- 使用 IDE 的重构功能（如 VS Code 的 "Rename Symbol"）可以自动更新所有引用

**检查清单：**
- [ ] 修改接口后，搜索所有返回该类型的地方
- [ ] 修改接口后，搜索所有创建该类型对象的地方
- [ ] 修改接口后，搜索所有使用该类型作为参数的地方

---

### 2. **重复定义**
**问题描述：**
- `product.ts` 中 `getProductById` 方法被定义了两次
- 导致编译错误：`An object literal cannot have multiple properties with the same name`

**解决方案：**
- 添加新方法前，先检查是否已存在同名方法
- 使用 IDE 的查找功能（Ctrl+F）搜索方法名

**检查清单：**
- [ ] 添加新方法前，检查文件中是否已存在同名方法
- [ ] 合并代码时，检查是否有重复定义

---

### 3. **未使用的导入和变量**
**问题描述：**
- 导入但未使用的 `Tag`、`PlusOutlined`
- 声明但未使用的变量 `isInitializedRef`、`products`、`index`、`onUpdate`

**解决方案：**
- 定期清理未使用的导入和变量
- 对于暂时未使用的参数，使用下划线前缀（如 `_onUpdate`）表示有意未使用
- 使用 ESLint 或 TypeScript 的 `noUnusedLocals` 和 `noUnusedParameters` 选项

**检查清单：**
- [ ] 移除未使用的导入
- [ ] 移除未使用的变量声明
- [ ] 未使用的函数参数使用下划线前缀

---

### 4. **类型定义与实际使用不一致**
**问题描述：**
- `PageDesigner.tsx` 使用了 `dataSource` 字段，但 `UpdatePageData` 类型中未定义
- 导致编译错误：`'dataSource' does not exist in type 'UpdatePageData'`

**解决方案：**
- 使用字段前，确保类型定义包含该字段
- 或者先更新类型定义，再使用字段

**检查清单：**
- [ ] 使用新字段前，检查类型定义是否包含
- [ ] 修改类型定义时，检查所有使用该类型的地方是否需要更新

---

### 5. **JSX 语法错误 - 重复属性**
**问题描述：**
- `PageDesigner.tsx` 中 `ComponentConfigPanel` 的 `onUpdate` prop 被重复定义
- 导致编译错误：`Identifier expected`、`Expression expected`

**解决方案：**
- 检查 JSX 属性是否有重复
- 合并代码时特别注意不要重复定义属性

**检查清单：**
- [ ] 检查 JSX 组件属性是否有重复
- [ ] 合并代码时，检查是否有重复的属性定义

---

## 开发前检查清单

### 修改类型/接口时
1. ✅ 全局搜索该类型的所有使用处
2. ✅ 更新所有返回该类型的函数
3. ✅ 更新所有创建该类型对象的地方
4. ✅ 更新所有使用该类型作为参数的地方

### 添加新代码时
1. ✅ 检查是否已存在同名方法/变量
2. ✅ 检查导入是否都已使用
3. ✅ 检查变量是否都已使用
4. ✅ 未使用的参数使用下划线前缀

### 合并代码时
1. ✅ 检查是否有重复定义
2. ✅ 检查是否有重复的 JSX 属性
3. ✅ 检查类型定义是否一致

### 提交代码前
1. ✅ 运行 `npm run build` 确保编译通过
2. ✅ 检查是否有未使用的导入/变量
3. ✅ 检查类型定义是否完整
4. ✅ 检查是否有语法错误

---

## TypeScript 编译选项建议

在 `tsconfig.json` 中启用以下选项可以帮助发现这些问题：

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,        // 检查未使用的局部变量
    "noUnusedParameters": true,    // 检查未使用的参数
    "noImplicitReturns": true,     // 检查所有代码路径都有返回值
    "strict": true                 // 启用所有严格类型检查
  }
}
```

---

## 常见错误模式

### ❌ 错误模式 1：修改接口后忘记更新使用处
```typescript
// 修改了接口
interface Page {
  name: string  // 新增字段
  // ...
}

// 忘记更新返回该类型的函数
function getPage(): Page {
  return {
    // name 字段缺失！
    // ...
  }
}
```

### ❌ 错误模式 2：重复定义
```typescript
const api = {
  getData: () => {},
  getData: () => {}  // 重复定义！
}
```

### ❌ 错误模式 3：未使用的导入
```typescript
import { Tag, Button } from 'antd'  // Tag 未使用

function Component() {
  return <Button>Click</Button>
}
```

### ❌ 错误模式 4：类型定义不完整
```typescript
interface UpdateData {
  name?: string
  // dataSource 缺失
}

function update(data: UpdateData) {
  data.dataSource = '...'  // 错误！
}
```

### ❌ 错误模式 5：重复的 JSX 属性
```typescript
<Component
  prop1={value1}
  prop1={value2}  // 重复！
/>
```

---

## ✅ 正确模式

### ✅ 正确模式 1：修改接口后同步更新
```typescript
// 修改接口
interface Page {
  name: string
  // ...
}

// 同步更新所有使用处
function getPage(): Page {
  return {
    name: '...',  // 包含新字段
    // ...
  }
}
```

### ✅ 正确模式 2：检查后再添加
```typescript
// 添加前先检查
const api = {
  getData: () => {},
  // 确认没有 getData 后再添加新方法
  getDataById: (id: string) => {}
}
```

### ✅ 正确模式 3：清理未使用的导入
```typescript
import { Button } from 'antd'  // 只导入需要的

function Component() {
  return <Button>Click</Button>
}
```

### ✅ 正确模式 4：完整的类型定义
```typescript
interface UpdateData {
  name?: string
  dataSource?: string  // 包含所有可能使用的字段
}

function update(data: UpdateData) {
  data.dataSource = '...'  // 正确！
}
```

### ✅ 正确模式 5：未使用的参数使用下划线前缀
```typescript
function Component({ 
  used, 
  _unused  // 下划线前缀表示有意未使用
}: Props) {
  return <div>{used}</div>
}
```

---

## 记住这些要点

1. **修改类型定义 = 全局搜索更新**
2. **添加代码前 = 检查是否已存在**
3. **提交代码前 = 运行编译检查**
4. **未使用的 = 立即清理或标记**
5. **类型定义 = 必须完整**

---

**最后更新：** 2025-11-24
**基于错误：** Jenkins 构建失败 #71, #72

