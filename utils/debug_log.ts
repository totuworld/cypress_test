const env: string = process.env.NODE_ENV || 'develop';
const colors = [
  { name: 'cyan', value: '\x1b[36m' },
  { name: 'yellow', value: '\x1b[33m' },
  { name: 'red', value: '\x1b[31m' },
  { name: 'green', value: '\x1b[32m' },
  { name: 'magenta', value: '\x1b[35m' },
];
const resetColor = '\x1b[0m';

/** debug는 production 환경과 브라우저일 때 미노출 된다 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function debug(tag: string) {
  const randIdx = Math.floor(Math.random() * colors.length) % colors.length;
  const color = colors[randIdx];
  return (msg: any) => {
    const logString = `${color.value}[${tag}]${resetColor} ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`;
    if (env !== 'production') {
      console.log(logString);
    }
  };
}

export default debug;
