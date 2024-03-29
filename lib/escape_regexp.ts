function escapeRegExp(str: string) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  // http://stackoverflow.com/a/6969486
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

export = escapeRegExp;
