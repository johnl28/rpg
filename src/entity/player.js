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
    "ATTACK1": {
      animation: "adventurer-attack3",
      speed: 0.2
    },
    "ATTACK2": {
      animation: "adventurer-attack2",
      speed: 0.2
    },
    "ATTACK3": {
      animation: "adventurer-air-attack1",
      speed: 0.2,
      damage: 10
    },
    "MOVE": {
      animation: "adventurer-run",
      speed: 0.2
    },
    "RUN": {
      animation: "adventurer-run3", 
      speed: 0.25
    },
    "TURN": {
      animation: "adventurer-idle2",
      speed: 0.12
    },
    "HURT": {
      animation: "adventurer-hurt",
      speed: 0.12
    },
    "DIE": {
      animation: "adventurer-die",
      speed: 0.12
    }
  };

  playTime = 0;
  name = "Test Name";
  level = 1;
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

    let curHp = this.GetAttr("hp");
    let maxHp = this.GetAttr("maxHp");
    
    let percentage = (parseFloat(curHp) / parseFloat(maxHp)) * 100.00;
    $("#player-hp").css("width", `${percentage}%`);
    $("#player-hp").text(`${curHp}/${maxHp}`);
  }

  Spawn(x, y)
  {
    super.Spawn(x, y);
    this.SetScale(0.5);
    this.SetZ(y);
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
    if(this.IsState("DIE")) return;
    let direction = this.TranslateInput(input);
    if(this.direction != direction)
    {
      this.SetDirection(direction);
      // this.SetState("MOVE");
      // return;
    }

    this.moveDirection.x = direction;

    this.SetState("RUN");
  }

  MoveY(input)
  {
    if(this.IsState("DIE")) return;
    this.moveDirection.y = this.TranslateInput(input);

    this.SetState("MOVE");
  }

  __updateState()
  {
    super.__updateState();
    //this.container.rotation += 0.1;
    let coord = this.GetXY();
    $("#player-coor").text(`${coord.x}x${coord.y}`);
  }

  Damage(amount)
  {
    super.Damage(amount);
    this.attacking = false;
    this.UpdateUI();
  }

  Respawn()
  {
    let map = gameInstance.map;
    this.SetXY(map.basePosition.x, map.basePosition.y);
    this.SetIDLE();
    this.SetAttr("hp", this.GetAttr("maxHp"))
    this.UpdateUI();
    gameInterface.ToggleDiedText();
  }

  Die()
  {
    this.onStateComplete = () => {
      gameInterface.ToggleDiedText();
    }

    this.SetState("DIE", false);
  }

  __updateAttackState()
  {
    if(!this.attacking || this.IsState("DIE")) return;
    let map = gameInstance.map;

    for(let id in map.entities)
    {
      let entity = map.entities[id];

      let targetPos = entity.GetXY();
      let pos = this.GetXY();
      let dist = distance(pos.x, targetPos.x, pos.y, targetPos.y);
      //log(`dist ${dist} VID ${entity.virtualID}`);
      if(dist > 150 || entity.IsState("DIE")) {
        continue;
      }

      this.Attack(entity);

    }
  }

  AttackInput(key)
  {
    if(this.attacking || this.IsState("DIE"))
      return;

    let state = "ATTACK1";
    if(key == "Space")
    {
      state = "ATTACK2";
    }
    else if(key == "Combo")
    {
      state = "ATTACK3";
    }

    this.onStateComplete = () => {
      this.__updateAttackState();
      this.attacking = false;
  
      if(!this.IsState("ATTACK3") && Math.floor(Math.random() * 101) < 50) {
        this.AttackInput("Combo");
        return;
      }

      this.SetState("IDLE");
    }

    this.attacking = true;
    this.SetState(state, false);

  }
}


