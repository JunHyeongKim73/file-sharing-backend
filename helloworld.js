console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
console.log(new Date(+new Date() + 3240 * 10000).toISOString().replace(/T/, ' ').replace(/\..+/, ''));