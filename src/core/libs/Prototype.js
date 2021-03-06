let config = {};

// 时间格式化
/**
 * @returns {string}
 */
Date.prototype.dateHandle = function (fmt) {
  fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
  let obj =
    {
      'y': this.getFullYear(), // 年份，注意必须用getFullYear
      'M': this.getMonth() + 1, // 月份，注意是从0-11
      'd': this.getDate(), // 日期
      'w': this.getDay(),
      'H': this.getHours(), // 24小时制
      'h': this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, // 12小时制
      'm': this.getMinutes(), // 分钟
      's': this.getSeconds(), // 秒
      'S': this.getMilliseconds() // 毫秒
    };
  let week = ['日', '一', '二', '三', '四', '五', '六'];
  for (let i in obj) {
    fmt = fmt.replace(new RegExp(i + '+', 'g'), function (wfy) {
      let val = obj[i] + '';
      if (i === 'w') return (wfy.length > 2 ? '星期' : '周') + week[val];
      for (let j = 0, len = val.length; j < wfy.length - len; j++) val = '0' + val;
      return wfy.length === 1 ? val : val.substring(val.length - wfy.length);
    });
  }
  return fmt;
};

// 限制长度
String.prototype.shearStr = function (number, suffix = '...') {
  typeof number === 'boolean' && !number && (number = this.length)
  return this.slice(0, number) + suffix;
};

//手机号隐藏显示
String.prototype.formatPhone=function () {
    return this.substr(0,3) + "****" + this.substr(7,4);
};

//剩余时间,倒计时
Date.prototype.remain = function(){
  let remain = Math.abs(this.getTime() - Date.now());
  if(remain>24 * 60 * 60 * 1000){
    let day = Math.floor(remain / (24 * 60 * 60 * 1000));
    return `${day}d`;
  }
  if(remain>60 * 60 * 1000){
    let hour = Math.floor(remain / (60 * 60 * 1000));
    return `${hour}h`;
  }
  if(remain>60*1000){
    let min = Math.floor(remain / (60 * 1000));
    return `${min}min`;
  }
  return `${remain}s`;
};

//结束时间（月-日，xx-xx，超过当年的显示年-月-日，xxxx-xx-xx）
Date.prototype.end = function () {
  let dy = this.getFullYear() - new Date().getFullYear();
  if(dy === 0){
    return this.dateHandle("MM-dd");
  }
  return this.dateHandle("yyyy-MM-dd");
};

// 数组拆分成二维数组
Array.prototype.subArray = function(size){
  let newArr = [];
  for (let x = 0; x < Math.ceil(this.length / size); x++) {
    let start = x * size;
    let end = start + size;
    newArr.push(this.slice(start, end));
  }
  return newArr;
};

// 格式化小数点, isCompletion -不足是否补0
String.prototype.fix = function (n, isCompletion = true) {
  let txt = this.toString();
  let i = txt.indexOf(".");
  if(n <= 0){
    return i < 0 ? txt : txt.substring(0,i);
  }
  if(i < 0){
    return isCompletion ? txt + "."+"0".repeat(n) : txt;
  }
  if(i > this.length - n - 1){
    return isCompletion ? txt + "0".repeat(n - this.length + i + 1) : txt;
  }
  return txt.substr(0, i + n + 1);
};

Number.prototype.fix = function (n, isCompletion) {
  return this.toString().fix(n, isCompletion);
};

export default {
  install(app, configCache) {
    config = configCache
  }
}
