// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 08/01/2022


class Player extends Actor
{
  type = "PLAYER";
  resourceName = "player";

  stateAnimations = {
    "IDLE": {
      animation: "adventurer-idle-2",
      speed: 0.15
    },
    "KICK": {
      animation: "adventurer-kick",
      speed: 0.2
    },
    "ATTACK2": {
      animation: "adventurer-attack2",
      speed: 0.2
    },
    "ATTACK3": {
      animation: "adventurer-attack3",
      speed: 0.2
    },
    "MOVE": {
      animation: "adventurer-walk",
      speed: 0.2
    },
    "RUN": {
      animation: "adventurer-run2",
      speed: 0.25
    },
    "TURN": {
      animation: "adventurer-idle",
      speed: 0.12
    }
  };

  name = "Test Name";
  level = 1;
  scale = 0.5;
  attributes = {
    hp: 100,
    maxHp: 100,
    speed: 2,
    damage: 2
  }

  constructor(id, virtualID, stage)
  {
    super(id, virtualID, stage);
    this.UpdateUI();
  }

  UpdateUI()
  {
    $("#player-name").text(this.name);
    $("#player-level").text(this.level);
    $("#player-hp").text(`${this.GetAttr('hp')}/${this.GetAttr('maxHp')}`);
  }

  Spawn(x, y)
  {
    super.Spawn(x, y);
  }

  TranslateInput(input)
  {
    switch(input)
    {
      case 'KeyA':
      case 'KeyW':
        return -1;
      case 'KeyD':
      case 'KeyS':
        return 1;
    }

    return 1;
  }


  MoveX(input)
  {
    let direction = this.TranslateInput(input);
    if(this.direction != direction)
    {
      this.SetState("TURN");
      this.container.scale.x *= -1;
      this.direction = direction;
      // return;
    }

    this.moveDirection.x = direction;

    this.SetState("RUN");
  }

  MoveY(input)
  {
    this.moveDirection.y = this.TranslateInput(input);

    this.SetState("MOVE");
  }

  __updateState()
  {
    super.__updateState();
    let coord = this.GetXY();
    $("#player-coor").text(`${coord.x}x${coord.y}`);
  }


  AttackInput(key)
  {
    if(this.attacking)
      return;

    let state = "KICK";
    if(key == "Space")
    {
      state = "ATTACK2";
    }
    else if(key == "Combo")
    {
      state = "ATTACK3";
    }


    this.rootSprite.loop = false;
    this.SetState(state);
    this.attacking = true;

    this.rootSprite.onComplete = () => {

      this.attacking = false;
  
      if(!this.IsState("ATTACK3") && Math.floor(Math.random() * 101) < 50) {
        this.AttackInput("Combo");
        return;
      }

      this.rootSprite.loop = true;
      this.SetState("IDLE");
      
    }
  }
}


