exports.partition = (arr, fn) => {
  let pass = [];
  let fail = [];
  arr.forEach(element => {
    let bucket = fn(element) ? pass : fail;
    bucket.push(element);
  });

  return [pass, fail];
};

exports.replaceIndex = (arr, index, element) => {
  return arr.slice(0, index)
    .concat(Array.isArray(element) ? element : [element])
    .concat(arr.slice(index + 1));
};
