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
  collisionObj = null;
  rootSprite = null;
  
  constructor(vId, stage)
  {
    let container = this.container = new PIXI.Container();
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
    this.container.zIndex = y;
  }

  SetZ(z)
  {
    this.container.zIndex = z;
  }

  SetCollisionBox(x = 0, y = 0, width = 0, height = 0)
  {
    if(!this.collisionObj) {
      this.collisionObj = new PIXI.Container();
      this.container.addChild(this.collisionObj);
    }

    let nwidth = width ? width: this.container.width;
    this.collisionObj.width = nwidth;
    log(`${nwidth} xxxxx ${this.collisionObj.width}`)
    this.collisionObj.height = height ? height: this.container.height;


    if(this.collisionObj.x == "center")
      this.collisionObj.x = this.container.width / 2 - this.collisionObj.width / 2;
    else
      this.collisionObj.x = x;


    this.collisionObj.y = y;

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
    this.container.scale.set(scale);
    if(this.rootSprite) this.rootSprite.scale.set(scale);
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

  // Attrs
  name = "";
  type = "ACTOR"
  attributes = {
    hp: 100,
    speed: 1,
    damage: 1,
  }

  constructor(id, virtualID, stage)
  {
    super(virtualID, stage);
    this.id = id;
  }

  IsState(state)
  {
    return this.state == state;
  }

  Spawn(x = 0, y = 0)
  {
    this.SetState("IDLE");
    this.Show(x, y);
    this.SetCollisionBox(0,0,0,0);
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
    return this.GetAttr("damage");
  }
  

  SetState(state)
  {
    if(this.state == state) return;
    this.state = state;
    this.UpdateAnimation();
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

      log(`target ${targetPos.x}  pos ${pos.x} ccc ${entity.collisionObj.width}`);
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

  __updateAttack()
  {
    if(!this.attacking) return;
    let map = gameInstance.map;

    for(let id in map.entities)
    {
      let entity = map.entities[id];
      let targetPos = entity.GetXY();
      let pos = this.GetXY();
      let dist = distance(pos.x, targetPos.x, pos.y, targetPos.y);
      //log(`dist ${dist} VID ${entity.virtualID}`);
      if(dist > 100) {
        continue;
      }

      this.Attack(entity);

    }
  }

  Damage(amount)
  {
    let newHp = this.GetAttr("hp") - amount;
    if(newHp <= 0) {
      this.rootSprite.loop = false;
      this.SetState("DIE");
      this.rootSprite.onComplete = () => {
        this.Destroy();
        let map = gameInstance.map;
        delete map.entities[this.virtualID];
      }
      return;
    }
    
    this.SetAttr("hp", newHp);
    this.rootSprite.loop = false;
    this.SetState("HURT");
    this.rootSprite.onComplete = () => {
      this.rootSprite.loop = true;
      this.SetState("IDLE");
    }
  }

  Attack(entity)
  {
    if(entity.type == "OBJECT") return;
    entity.Damage(this.GetDamage());

  }

  OnTickUpdate(game)
  {
    this.__updateState();
    this. __updateAttack();
  }

  UpdateAnimation()
  {
    const stateAnimations = this.stateAnimations[this.state];
    if(!stateAnimations) {
      error(`Couldn't load the animation for state ${this.state}, actor id ${this.id}.`);
    }

    this.LoadSpriteSheet(this.resourceName, stateAnimations.animation);
    this.SetAnimationSpeed(stateAnimations.speed);
  }

}

