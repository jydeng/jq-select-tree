import "./ztree.awesomeStyle.css";
import "./style.css";
import { debounce } from "./utils.js";
import $ from "jQuery";

/**
 * 基于ztree的tree select
 * @authors jydeng (jydeng@live.cn)
 */
function SelectTree(option) {
  let def = {
    label: "name",
    value: "id",
    separator: "/",
    width: 300,
    placeholder: "请选择",
    treeOption: {},
  };
  this.$el = $(option.el);
  this.option = $.extend(true, def, option);
  this.treeNo = 0;
  this.init();
}

SelectTree.prototype.init = function () {
  this.wrapEl();
  this.creatDropdownEl();
  this.initZTree();
  this.initEvent();
  this.inited = true;
};

SelectTree.prototype.wrapEl = function () {
  const $showBtn = $(
    `<button type="button" class="btn btn-default" title="${this.option.placeholder}" aria-expanded="false">
      请选择 <b class="fa fa-caret-down"></b>
    </button>`
  );

  this.$showBtn = $showBtn;
  this.$el.wrap(`<div class="zTree-select-wrapper"></div>`).hide();
  this.$el.after($showBtn);
};

SelectTree.prototype.creatDropdownEl = function () {
  const treeId = this.getTreeElId();
  this.$dropdownEl = $(`<div class="zTree-select-dropdown-container"></div>`);
  this.$searchEl = $(
    `<div class="input-group search">
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

  if (this.option.treeOption.check.chkStyle === "checkbox") {
    this.$allCheckEl = $(`<div class="allCheck"><label><input type="checkbox" /><span>全选</span></label></div>`);
    this.$allChecked = this.$allCheckEl.find("input");
    this.$dropdownEl.append(this.$allCheckEl);
  }

  this.$dropdownEl.append(this.$treeEl);

  $("body").append(this.$dropdownEl);
};

SelectTree.prototype.getTreeElId = function () {
  this.treeNo++;
  return "zTree-select" + this.treeNo;
};

SelectTree.prototype.initZTree = function () {
  let me = this;
  let option = me.option;
  let setting = option.treeOption;
  let treeData = option.treeData; // 非ajax方式
  setting = me.initZTreeSetting();
  let tree = $.fn.zTree.init(me.$treeEl, setting, treeData);

  me.tree = tree;
  me.hideNodes = [];
  me.nodeLength = tree.transformToArray(tree.getNodes()).filter((t) => !!!t.children && !!!t.chkDisabled).length;

  if (setting.onTreeInited) {
    setting.onTreeInited.call(this, tree);
  }
};

SelectTree.prototype.initZTreeSetting = function () {
  let me = this;
  let option = me.option;
  let setting = $.extend({}, option.treeOption);
  let callback = setting.callback;

  if (callback.onCheck && typeof callback.onCheck === "function") {
    let fn = callback.onCheck;
    callback.onCheck = function () {
      me.emit();
      fn.apply(me, arguments);
    };
  }
  setting.callback = $.extend({}, callback, {});

  return setting;
};

SelectTree.prototype.emit = function (slient) {
  let me = this;
  let checkedNodes = me.tree.getCheckedNodes(true);
  let subNodes = checkedNodes.filter((t) => !!!t.children);
  let submitValue = subNodes.map((t) => t[me.option.label]).join(",");
  let showLabel = subNodes.length === 0 ? "请输入" : subNodes.length <= 3 ? submitValue : `${subNodes.length} selected`;

  if (me.option.treeOption.check.chkStyle === "checkbox") {
    me.$allChecked.prop("checked", subNodes.length === me.nodeLength);
    if (subNodes.length === me.nodeLength) {
      showLabel = "全选";
    }
  }

  me.$showBtn.html(showLabel + ' <b class="fa fa-caret-down"></b>');
  !!!slient && me.$el.trigger("change.selectTree", [submitValue, subNodes]);
};

SelectTree.prototype.setValue = function (val) {
  let me = this;
  let option = me.option;

  console.log(val);

  if (option.treeOption.check.chkStyle === "checkbox") {
    let arr = Array.isArray(val) ? val : [val];
    let nodes = me.tree.getNodesByFilter(function (node) {
      return arr.indexOf(node[option.value]) > -1;
    });

    nodes.forEach((node) => {
      me.tree.checkNode(node, true, false);
    });
  } else {
    let v = Array.isArray(val) ? val[0] : val;
    let nodes = me.tree.getNodesByFilter(function (node) {
      return node[option.value] === v;
    });

    console.log(nodes);

    nodes.forEach((node) => {
      me.tree.checkNode(node, true, true, false);
    });
  }

  me.emit();
};

SelectTree.prototype.showDropdown = function () {
  let position = this.$showBtn.offset();
  let elH = this.$showBtn.outerHeight(true); // 计算input带边框的高度

  this.$dropdownEl.css({
    left: position.left,
    top: position.top + elH,
    width: this.option.width,
  });
  this.$dropdownEl.show();
};

SelectTree.prototype.hideDropdown = function () {
  this.$dropdownEl.hide();
};

SelectTree.prototype.initEvent = function () {
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

  if (me.option.treeOption.check.chkStyle === "checkbox") {
    me.$allChecked.on("change", function () {
      me.tree.checkAllNodes(this.checked);
      me.emit();
    });
  }

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

SelectTree.prototype.filterTree = function (keyword) {
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

$.fn.selectTree = function (opt) {
  let res;
  this.each(function () {
    let $this = $(this);
    let treeSelect = $this.data("selectTree");
    if (treeSelect) {
      res = treeSelect[opt]();
      if (res !== undefined) {
        return false;
      }
    } else {
      let option = $.extend({ el: this }, opt);
      $this.data("selectTree", new SelectTree(option));
    }
  });
  if (res !== undefined) {
    return res;
  } else {
    return this;
  }
};
