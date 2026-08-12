import '@/styles/main.scss';

const board = document.querySelector<HTMLDivElement>('#board');

if (!board) {
  throw new Error('#board nicht gefunden – stimmt die ID in der index.html?');
}

board.textContent = 'Setup steht: Vite, TypeScript und SCSS sind verbunden.';
