
const CONFIG = {
  title: "Game DEMO"
}

let gameInstance = null;
let gameInterface = null;

$(document).ready(function() {
  $("title").text(CONFIG.title);
  gameInterface = new Interface();
  gameInstance = new Game();
  document.addEventListener('keypress', key => gameInstance.OnKeyDown(key));
  document.addEventListener('keyup', key => gameInstance.OnKeyUp(key));
});

