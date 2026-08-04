console.clear();

const name = 'HofMANn';
const el = document.querySelector('.anim div');

if (el) {

  const nameArr = name.split('');
  let index = 0;

  setInterval(() => {
    if (index >= nameArr.length) index = 0;
    el.dataset.char = nameArr[index++];
  }, 500);

}
