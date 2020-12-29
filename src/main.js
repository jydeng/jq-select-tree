import "./ztree.awesomeStyle.css";
import "./style.css";
import { debounce, getAllChildNodes } from "./utils.js";
import $ from "jQuery";

/**
 * 基于ztree的tree select
 * @authors jydeng (jydeng@live.cn)
 */
function TreeSelect(option) {
  let def = {
    label: "name",
    value: "id",
    separator: "/",
    treeOption: {
      callback: {
        onCheck: () => {
          let checkedNodes = this.tree.getCheckedNodes(true);
          let subNodes = checkedNodes.filter((t) => !!!t.children);
          let submitValue = subNodes.map((t) => t[this.option.label]).join(",");
          let showLabel =
            subNodes.length === 0 ? "请输入" : subNodes.length <= 3 ? submitValue : `${subNodes.length} selected`;
          this.$showBtn.html(showLabel + ' <b class="fa fa-caret-down"></b>');
          this.$el.trigger("change.ztreeSelect", [submitValue, subNodes]);
        },
      },
    },
  };
  this.$el = $(option.el);
  this.option = $.extend(true, def, option);
  this.treeNo = 0;
  this.init();
}

TreeSelect.prototype.init = function () {
  this.wrapEl();
  this.creatDropdownEl();
  this.initZTree();
  this.initEvent();
  // this.initValue();
  this.inited = true;
};

TreeSelect.prototype.wrapEl = function () {
  const $showBtn = $(
    `<button type="button" class="btn btn-default" title="请选择" aria-expanded="false">
      请选择 <b class="fa fa-caret-down"></b>
    </button>`
  );

  this.$showBtn = $showBtn;
  this.$el.wrap(`<div class="zTree-select-wrapper"></div>`).hide();
  this.$el.after($showBtn);
};

TreeSelect.prototype.creatDropdownEl = function () {
  const treeId = this.getTreeElId();
  this.$dropdownEl = $(`<div class="zTree-select-dropdown-container"></div>`);
  this.$searchEl = $(
    `<div class="input-group">
      <span class="input-group-addon">
        <i class="glyphicon glyphicon-search"></i>
      </span>
      <input class="form-control" type="text" placeholder="Search">
      <span class="input-group-btn">
        <button class="btn btn-default" type="button">
          <i class="glyphicon glyphicon glyphicon-remove"></i>
        </button>
      </span>
    </div>`
  );
  this.treeId = treeId;
  this.$treeEl = $('<ul id="' + treeId + '" class="ztree"></ul>');
  this.$searchInput = this.$searchEl.find("input");
  this.$searchClear = this.$searchEl.find(".btn");
  this.$dropdownEl.append(this.$searchEl);
  this.$dropdownEl.append(this.$treeEl);
  $("body").append(this.$dropdownEl);
};

TreeSelect.prototype.getTreeElId = function () {
  this.treeNo++;
  return "zTree-select" + this.treeNo;
};

TreeSelect.prototype.initZTree = function () {
  let me = this;
  let option = me.option;
  let setting = option.treeOption;
  let treeData = option.treeData; // 非ajax方式
  setting = me.initZTreeSetting();
  let tree = $.fn.zTree.init(me.$treeEl, setting, treeData);

  me.tree = tree;
  me.hideNodes = [];
  me.nodeLength = tree.transformToArray(tree.getNodes()).filter((t) => !!!t.children).length;

  if (setting.onTreeInited) {
    setting.onTreeInited.call(this, tree);
  }
};

TreeSelect.prototype.initZTreeSetting = function () {
  let me = this;
  let option = me.option;
  let setting = $.extend({}, option.treeOption);
  let callback = setting.callback;

  setting.callback = $.extend({}, callback, {});

  return setting;
};

TreeSelect.prototype.setValue = function (treeNode) {
  let me = this;
  let option = me.option;
  let showProp = option.label;
  let valueProp = option.value;
  let separator = option.separator;
  let path = (treeNode && treeNode.getPath && treeNode.getPath()) || [];
  let showValue = [];
  let submitValue = (treeNode && treeNode[valueProp]) || "";

  $.each(path, function (index, item) {
    showValue.push(item[showProp]);
  });

  me.$showInput.val(showValue.join(separator));

  // 不是初始化完成前调用setValue，不触发事件；
  if (!me.inited || me.oldSubmitValue == submitValue) {
    return;
  }

  me.oldSubmitValue = submitValue;
  me.$el.val(submitValue);
  me.$el.trigger("change.ztreeSelect", [submitValue, treeNode]);
};

TreeSelect.prototype.showDropdown = function () {
  let position = this.$showBtn.offset();
  let elH = this.$showBtn.outerHeight(true); // 计算input带边框的高度

  this.$dropdownEl.css({
    left: position.left,
    top: position.top + elH + 5,
    width: 300,
  });
  this.$dropdownEl.show();
};

TreeSelect.prototype.hideDropdown = function () {
  this.$dropdownEl.hide();
};

TreeSelect.prototype.initEvent = function () {
  let me = this;
  let timer;

  me.$showBtn.on("click", function (event) {
    me.showDropdown();
    event.stopPropagation();
  });

  me.$dropdownEl.on("click", function (event) {
    event.stopPropagation();
  });

  me.$searchInput.on(
    "input",
    debounce(function (e) {
      me.filterTree(me.$searchInput.val());
    }, 500)
  );

  me.$searchClear.on("click", function (event) {
    me.$searchInput.val("");
    me.filterTree("");
  });

  $(document).on("click", function (event) {
    let target = event.target;
    let reg = new RegExp("^" + me.treeId + "_");

    if (reg.test(target.id)) {
      return;
    }

    timer = setTimeout(function () {
      me.hideDropdown();
      timer = null;
    }, 2);
  });
};

TreeSelect.prototype.clearValue = function () {
  this.setValue({});
  this.tree.cancelSelectedNode();
};

TreeSelect.prototype.filterTree = function (keyword) {
  let me = this;
  let option = me.option;
  let hideNodes = me.hideNodes;
  let tree = me.tree;

  if (hideNodes.length > 0) {
    tree.showNodes(hideNodes);
    me.hideNodes = [];
  }

  if (String(keyword).length > 0) {
    let filterNodes = tree.getNodesByFilter(function (node) {
      return node[option.label].indexOf(keyword) === -1;
    });

    me.hideNodes = filterNodes;
    tree.hideNodes(filterNodes);
  }
};

$.fn.ztreeSelect = function (opt) {
  let res;
  this.each(function () {
    let $this = $(this);
    let treeSelect = $this.data("ztreeSelect");
    if (treeSelect) {
      res = treeSelect[opt]();
      if (res !== undefined) {
        return false;
      }
    } else {
      let option = $.extend({ el: this }, opt);
      $this.data("ztreeSelect", new TreeSelect(option));
    }
  });
  if (res !== undefined) {
    return res;
  } else {
    return this;
  }
};
