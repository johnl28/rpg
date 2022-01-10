// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 08/01/2022


// Simple Entity
class Entity
{
  virtualID = 0;
  animationSpeed = 0.15;
  scale = 1.0;
  type = "OBJECT";
  container = null;
  collisionBoxes = [];
  rootSprite = null;
  
  constructor(vId, stage)
  {
    let container = this.container = new PIXI.Container();
    this.container.sortableChildren = true;
    container.visible = false;
    stage.addChild(container);
    this.virtualID = vId;
  }

  Destroy()
  {
    this.container.destroy();
  }

  Show(x = 0, y = 0) 
  {
    this.container.x = x;
    this.container.y = y;
    this.container.visible = true;
    log(`Show entity VID ${this.virtualID} POS ${x}x${y} TYPE "${this.type}"`);
  }

  GetHeight()
  {
    return this.container.height;
  }

  GetWidth()
  {
    return this.container.width;
  }

  GetXY()
  {
    return { x: this.container.x, y: this.container.y }
  }

  SetXY(x = 0, y = 0)
  {
    this.container.x = x;
    this.container.y = y;
    this.SetZ(y + this.container.height / 2);
  }

  SetZ(z)
  {
    this.container.zIndex = z;
  }

  SetCollisionBox(x = 0, y = 0, width = 0, height = 0)
  {
    
    let collisionObj = new PIXI.Container();
    this.collisionBoxes.push(collisionObj);
    this.container.addChild(collisionObj);
 
    let nwidth = width ? width: this.container.width;
    collisionObj.width = nwidth;

    collisionObj.height = height ? height: this.container.height;


    if(collisionObj.x == "center")
      collisionObj.x = this.container.width / 2 - collisionObj.width / 2;
    else
      collisionObj.x = x;

    collisionObj.y = y;

  }


  SetRotation(radius)
  {
    this.container.rotation = radius;
  }

  Hide() {
    this.container.visible = false;
  }

  SetScale(scale)
  {
    this.scale = scale;
    if(this.rootSprite) 
      this.rootSprite.scale.set(scale);

  }

  SetDirection(direction)
  {
    if(this.direction == direction) return;
    //this.rootSprite.width *= -1;
    this.container.width *= -1;
    //this.container.x = this.container.x - this.container.width;
    this.direction = direction;
  }

  SetAnimationSpeed(speed)
  {
    this.animationSpeed = this.rootSprite.animationSpeed = speed
  }

  LoadSprite(resourceName)
  {
    let texture = LOADER.resources[resourceName].texture;
    if(!texture) {
      error(`Cannot load texture from resourceName: ${resourceName}.`);
      return;
    }

    let sprite = this.rootSprite;
    if(!sprite)
    {
      this.rootSprite = sprite = new PIXI.Sprite(texture)
      this.container.addChild(sprite);
    }
    else
    {
      sprite.texture = texture;
    }

    sprite.scale.set(this.scale);
    //this.container.pivot.y = this.container.height;
    //this.container.calculateBounds();
  }

  LoadSpriteSheet(resourceName, animationName)
  {
    let sheet = LOADER.resources[resourceName].spritesheet;
    if(!sheet) {
      error(`Cannot load spritesheet from resourceName: ${resourceName}.`);
      return;
    }

    let animation = sheet.animations[animationName];
    if(!animation) {
      error(`Cannot load animation ${animationName} from resourceName: ${resourceName}.`);
      return;
    }

    let sprite = this.rootSprite;
    if(!sprite)
    {
      this.rootSprite = sprite = new PIXI.AnimatedSprite(animation)
      sprite.animationSpeed = this.animationSpeed;
      this.container.addChild(sprite);
    }
    else
    {
      sprite.textures = animation;
    }

    sprite.scale.set(this.scale);
    sprite.play();
    //this.container.calculateBounds();
  }
}

// ACTOR CLASS (Living Entities)
class Actor extends Entity {

  id = 0;

  // Movement
  moveDirection = { x: 0, y: 0 };
  direction = 1; 

  // States
  stateAnimations = {}
  resourceName = "";
  state = "";
  attacking = false;
  onStateComplete = null;

  // Attrs
  name = "ACTOR";
  type = "ACTOR"
  attributes = {
    hp: 100,
    speed: 1,
    damage: 1,
    range: 150
  }

  constructor(id, virtualID, stage)
  {
    super(virtualID, stage);
    this.id = id;
  }

  __updateAttackState() {}

  SetDirection(direction)
  {
    this.SetState("IDLE");
    super.SetDirection(direction);
  }


  SetScale(scale)
  {
    super.SetScale(scale);
    this.container.pivot.x = this.container.width / 2;
    this.container.pivot.y =  this.container.height / 2;
  }


  IsState(state)
  {
    return this.state == state;
  }

  Spawn(x = 0, y = 0)
  {
    this.SetState("IDLE");
    this.Show(x, y);
  }

  GetAttr(key)
  {
    return this.attributes[key];
  }

  SetAttr(key, val)
  {
    this.attributes[key] = val;
  }

  GetSpeed()
  {
    let val = this.IsState("RUN") ? 2: 0;
    return (this.attributes.speed + val);
  }

  GetDamage()
  {
    let totalDamage = this.GetAttr("damage");
    let addDamage = this.stateAnimations[this.state].damage;
    if (addDamage) totalDamage += addDamage;
    return totalDamage;
  }
  
  StateComplete()
  {
    if(this.onStateComplete) {
      this.onStateComplete();
      // this.onStateComplete = null;
    }
  }

  SetState(state, loop = true)
  {
    if(this.state == state) return;
    this.state = state;
    if(this.rootSprite) this.rootSprite.loop = loop;
    this.UpdateAnimation();
    if(this.onStateComplete) {
      this.rootSprite.onComplete = () => this.StateComplete();
    }
  }

  SetIDLE()
  {
    this.moveDirection.x = 0;
    this.moveDirection.y = 0;
    this.SetState("IDLE");
  }

  CheckViewPortOverflow()
  {
    let globalPos = this.container.getGlobalPosition();

    if(globalPos.x < 50 && this.moveDirection.x < 0)
      return true;
    else if(globalPos.x > gameInstance.width - 50 && this.moveDirection.x > 0)
      return true;
  
    if(globalPos.y < 50 && this.moveDirection.y < 0)
      return true;
    else if(globalPos.y > gameInstance.height - 70 && this.moveDirection.y > 0)
      return true;

    return false;
  }

  CheckCollision()
  {
    if(!this.collisionObj) return false;
    let map = gameInstance.map;

    for(let id in map.entities)
    {
      let entity = map.entities[id];
      let targetPos = entity.GetXY();
      let pos = this.GetXY();

      // log(`target ${targetPos.x}  pos ${pos.x} ccc ${entity.collisionObj.width}`);
      if(this.moveDirection.x > 0 && targetPos.x <= pos.x && pos.y == targetPos.y)
      {
        return true;
      }

    }

    return false;
  }

  __updateState()
  {
    if(this.IsState("RUN") || this.IsState("MOVE"))
    {
      let pos = this.GetXY();

      if(!this.moveDirection.x && !this.moveDirection.y) 
      {
        this.SetState("IDLE");
        return;
      }

      if(this.CheckViewPortOverflow()) {
        this.SetIDLE();
        return;
      }

      pos.x += (this.GetSpeed()*this.moveDirection.x);
      pos.y += (this.GetSpeed()*this.moveDirection.y);

      this.SetXY(pos.x, pos.y);
    }
  }

  Die()
  {
    this.onStateComplete = () => {
      this.Destroy();
      let map = gameInstance.map;
      delete map.entities[this.virtualID];
    }

    this.SetState("DIE", false);
  }

  Damage(amount)
  {
    let newHp = this.GetAttr("hp") - amount;
    this.SetAttr("hp", newHp);
    if(newHp <= 0) {
      this.Die();
      return;
    }

    if(this.attacking) return;

    this.onStateComplete = () => {
      if(!this.IsState("HURT"))
        return;

      this.SetState("IDLE");
    }

    this.SetState("HURT", false);
  }

  Attack(entity)
  {
    if(entity.type == "OBJECT") return;
    entity.Damage(this.GetDamage());
  }

  OnTickUpdate(game)
  {
    this.__updateState();
  }

  UpdateAnimation()
  {
    const stateAnimations = this.stateAnimations[this.state];
    if(!stateAnimations) {
      error(`Couldn't load the animation for state ${this.state}, actor id ${this.id}.`);
      this.SetIDLE();
    }

    this.LoadSpriteSheet(this.resourceName, stateAnimations.animation);
    this.SetAnimationSpeed(stateAnimations.speed);
  }

}

