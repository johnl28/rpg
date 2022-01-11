// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 08/01/2022


class Monster extends Actor
{
  type = "MONSTER";
  hpLabel = null;

  attributes = {
    hp: 100,
    maxHp: 100,
    speed: 2,
    damage: 2
  }

  constructor(id, virtualID, stage)
  {
    super(id, virtualID, stage);
    this.container.interactive = true;
    this.container.on('mousedown', (event) => {
      this.SelfClick();
    });
    this.KeepAlive();
  }
  
  
  SelfClick()
  {
    gameInterface.TargetMob = this.virtualID;
    gameInterface.UpdateMobHud(this);
  }

  SetAttributes(attributes)
  {
    for(let attr in attributes)
    {
      this.SetAttr(attr, attributes[attr]);
    }

    if(attributes.maxHp) {
      this.SetAttr("hp", attributes.maxHp);
    }
  }
  
  Die()
  {
    log("HEY I DIED!!!")
    gameInterface.mobHud.hide();
    super.Die();
  }

  __updateAttackState()
  {
    if(this.attacking || gameInstance.player.IsState("DIE")
      || this.IsState("DIE")) return;

    let targetPos = gameInstance.player.GetXY();
    let pos = this.GetXY();
    let dist = distance(pos.x, targetPos.x, pos.y, targetPos.y);

    if(dist < this.GetAttr("range")) {
      this.onStateComplete = () => {
        this.attacking = false;
        this.Attack(gameInstance.player);
        this.SetIDLE();
      }

      if(pos.x < targetPos.x - 50 && this.direction == -1 ||
        pos.x > targetPos.x && this.direction == 1
        ) {
        this.SetDirection(this.direction * -1);
      }
      this.attacking = true;
      this.SetState("ATTACK", false);
    }
  }

  OnTickUpdate(game)
  {
    super.OnTickUpdate(game);
    this.__updateAttackState();
  }

  Damage(amount)
  {
    if(this.IsState("DIE")) return;
    super.Damage(amount);
    gameInterface.UpdateMobHud(this);
  }

  KeepAlive()
  {
    if(this.IsState("IDLE"))
    {
      this.moveDirection.x = random(-1,2);
      this.moveDirection.y = random(-1,2);

      if(this.moveDirection.x != this.direction && this.moveDirection.x)
      {
        this.SetDirection(this.moveDirection.x);
      }

      this.SetState("MOVE");
      setTimeout(() => {
        this.KeepAlive();
      }, random(1000,2000));
      return;
    }
    else if(this.IsState("MOVE"))
    {
      this.SetIDLE();
    }

    setTimeout(() => {
      this.KeepAlive();
    }, random(5000,15000));
  }
}


