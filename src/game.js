// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 08/01/2022



let LOADER = PIXI.Loader.shared;
let entityID = 1;

class Game
{
  width = window.innerWidth;
  height = window.innerHeight;
  mobProto = {}
  running = false;

  app = null;
  player = null;
  map = null;

  constructor()
  {
   // this.__initGame();
   window.onresize = () => {
    this.width = this.app.width = window.innerWidth;
    this.height = this.app.height = window.innerHeight;
   };
  }

  GameLoop(ctx)
  {
    // game loop
    if(ctx.player) {
      ctx.player.OnTickUpdate(ctx);
    }

    if(ctx.map) {
      ctx.map.OnTickUpdate(ctx);
    }
  }

  StartGame()
  {
    this.__initGame();
    this.running = true;
  }


  __initGame()
  {
    this.app = new PIXI.Application({ width: this.width, height: this.height });
    document.body.appendChild(this.app.view);
    log("Game init DONE!");
    gameInterface.SetLoadingText("Game initialization...");
    this.__loadAssets();
  }

  __loadAssets()
  {
    gameInterface.SetLoadingText("Load assets...");
    const loader = PIXI.Loader.shared;
    loader.defaultQueryString = '' + Math.random();
    loader.baseUrl = ASSETS_PATH;
    loader.onComplete.add(() => { 
      log("Load assets DONE!");
      this.__loadProto() 
    })

    for(var key in ASSETS) {
      loader.add(key, ASSETS[key])
    }

    loader.load();
  }

  __loadProto()
  {
    gameInterface.SetLoadingText("Load proto tables...");
    fetch("assets/monster_proto.json", {cache: "no-store"})  
    .then(response => response.json())
    .then(data => {
      this.mobProto = data;
      log("Proto load DONE!")
      this.__loadMap();
    });
  }

  __loadMap()
  {
    gameInterface.SetLoadingText("Load map data...");
    this.map = new Map();
    this.map.Load("empire1", () => { 
      log("Map load DONE!")
      this.__loadCharacter() 
    });

    this.app.stage.addChild(this.map);
    this.app.ticker.add(() => this.GameLoop(this));
  }

  __loadCharacter()
  {
    gameInterface.SetLoadingText("Load character...");
    this.player = new Player(0, 0, this.map);
    if(!this.player) {
      error("Player instance fail to create.");
      return;
    }

    let x = this.map.basePosition.x;
    let y = this.map.basePosition.y;
    let data = localStorage.getItem("player_data");
    if(data)
    {
      data = JSON.parse(data);
      y = data.y;
      x = data.x;
      this.player.level = data.level;
      this.player.name = data.name;
      this.player.playTime = data.play_time;
    }

    this.player.Spawn(x, y);
    
    log("Character load DONE!")

    gameInterface.GameLoaded();

    this.timeInterval = setInterval(() => {
      this.player.playTime += 1;
    }, 1000);
  }

  OnKeyUp(key)
  {
    if(!this.running || this.player.IsState("DIE")) return;
    switch(key.code)
    {
      case 'KeyD':
      case 'KeyA':
      case 'KeyW':
      case 'KeyS':
      {
        this.player.SetIDLE();
        break;
      }
      case 'Escape':
      {
        if(gameInterface.mobHud.is(":visible"))
        {
          gameInterface.mobHud.hide();
          return;
        }
        
        if(gameInterface.mainMenu.is(":visible") && this.running)
        {
          gameInterface.mainMenu.hide();
          return;
        }

        gameInterface.mainMenu.show();
        break;
      }
    }
  }

  OnKeyDown(key)
  {
    if(!this.running) 
    {
      return;
    }

    
    switch(key.code)
    {
      case 'KeyR':
      {
        this.player.Respawn();
        break;
      }
      case 'KeyD':
      case 'KeyA':
      {
        this.player.MoveX(key.code);
        break;
      }
      case 'KeyW':
      case 'KeyS':
      {
        this.player.MoveY(key.code);
        break;
      }
      case 'Space':
      case 'KeyF':
      {
        this.player.AttackInput(key.code);
        break;
      }
      default:
        break;
    }
  }
}
