/**
 * 防抖
 */
export function debounce(fn, delay = 200) {
  let timer;

  return function () {
    let that = this;
    let args = arguments;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(function () {
      timer = null;
      fn.apply(that, args);
    }, delay);
  };
}

/**
 * 节流
 */
export function throttle(fn, interval = 200) {
  let last;
  let timer;

  return function () {
    let that = this;
    let args = arguments;
    let now = +new Date();

    if (last && now - last < interval) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        last = now;
        fn.apply(that, args);
      }, interval);
    } else {
      last = now;
      fn.apply(that, args);
    }
  };
}

/**
 * 获取ztree所有子节点
 */
export function getAllChildNodes(treeNode, result) {
  if (treeNode.isParent) {
    var childrenNodes = treeNode.children;
    if (childrenNodes) {
      for (var i = 0; i < childrenNodes.length; i++) {
        result += "," + childrenNodes[i].id;
        result = getAllChildNodes(childrenNodes[i], result);
      }
    }
  }
  return result;
}
