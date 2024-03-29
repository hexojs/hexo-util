interface Options {
  width?: number;
}

// https://github.com/rails/rails/blob/v4.2.0/actionview/lib/action_view/helpers/text_helper.rb#L240
function wordWrap(str: string, options: Options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const width = options.width || 80;
  const regex = new RegExp(`(.{1,${width}})(\\s+|$)`, 'g');
  const lines = str.split('\n');

  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i];

    if (line.length > width) {
      lines[i] = line.replace(regex, '$1\n').trim();
    }
  }

  return lines.join('\n');
}

export = wordWrap;
