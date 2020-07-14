let sample = 'lala(minh ne)';
let reg = sample.match(/\((\w+\s*)*\)/g);
let lala = reg[0].match(/\w+/g);
console.log(lala.toString().replace(',',''));

