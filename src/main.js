
const CONFIG = {
  title: "Game DEMO"
}

let gameInstance = null;



function StartGame()
{
  $("#main-menu").hide();
  gameInstance.StartGame();
}



$(document).ready(function() {
  $("title").text(CONFIG.title);
  
  gameInstance = new Game();
  document.addEventListener('keypress', key => gameInstance.OnKeyDown(key));
  document.addEventListener('keyup', key => gameInstance.OnKeyUp(key));
});

