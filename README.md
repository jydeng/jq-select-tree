# jq-select-tree

## 介绍

古早项目的新需求，需要一个下拉树组件，在此背景下开发这个组件，交付给后端 jsp 使用。
集成了 ztree 与 select 的下拉树组件，实现思路是通过魔改 ztree 的外观，合理调用 ztree Api 来实现功能。
![introduce](/pictures/introduce.gif)

## 依赖

- jQuery
- zTree
- fontAwesome
- bootstrap

## 使用方法
```javascript
// 沿用zTree Option
let treeOption = {
        check: {
          enable: true,
          chkStyle: "checkbox",
        },
        view: {
          showIcon: false,
          selectedMulti: false,
        },
        callback: {
          onCheck: function () {
            console.log(arguments);
          },
        },
      };
// zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
let treeData = [
{
    name: "test1",
    id: "1",
    children: [
        {
          name: "test1_1",
          id: "1-1",
          children: [
              { name: "test1_1_1", id: "1-1-1", chkDisabled: true },
              { name: "test1_1_2", id: "1-1-2" },
              ],
          },
          { name: "test1_2", id: "1-2" },
          ],
       },
     {
        name: "test2",
        id: "2",
        children: [
          { name: "test2_1", id: "2-1" },
          { name: "test2_2", id: "2-1" },
        ],
      },
    ];
      
      
$(document).ready(function () {
    // 初始化
    $("#treeDemo").selectTree({ treeOption, treeData, width: 200, placeholder: "请选择" });
        
    // 监听选择回调
    $("#treeDemo").on("change.selectTree", function (e, submitValue, subNodes) {
        console.log(submitValue, subNodes);
    });

    // 设置值
    $("#treeDemo").data("selectTree").setValue(["1"]);
}
```
* 下载、构建后，详见/dist/index.html
