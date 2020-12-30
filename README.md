# jq-select-tree

## 介绍

古早项目的需求，需要一个下拉树组件，在此背景下开发这个组件，交付给后端 jsp 使用。
集成了 ztree 与 select 的下拉树组件，实现思路是通过魔改 ztree 的外观，合理调用 ztree Api 来实现功能。

## 依赖

- jQuery
- ztree
- fontAwesome
- bootstrap

## 使用方法
```
$(document).ready(function () {
    // 初始化
    $("#treeDemo").selectTree({ treeOption, treeData, width: 200, placeholder: "请选择" });
        
    // 监听选择回调
    $("#treeDemo").on("change.selectTree", function (e, submitValue, subNodes) {
        console.log(submitValue, subNodes);
    });

    // 设置值
    $("#treeDemo").data("selectTree").setValue(["1"]);

        // 初始化2
    });
}
```
* 下载、构建后，详见/dist/index.html