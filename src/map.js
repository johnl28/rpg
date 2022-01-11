// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 08/01/2022

class Map extends PIXI.TilingSprite {
  entityVID = 1000;
  entities = {};
  basePosition = {};
  size = {};

  constructor()
  {
    super(LOADER.resources["grass1"].texture, 500, 500);
    this.sortableChildren = true;
  }

  OnTickUpdate(game)
  {
    this.__updateBackgroundScroll(game.player);

    for(let id in this.entities) {
      this.entities[id].OnTickUpdate(game);
    }
  }

  __updateBackgroundScroll(player)
  {
    if(!player) return;
    let pos = player.container.getGlobalPosition();
    let startMov = 200;
    let velocity = player.GetSpeed();
    let viewPortWidth = gameInstance.width;

    if(pos.x > viewPortWidth) {
      velocity = 300;
    }

    if(pos.x < 0) {
      this.x = 0;
      return;
    }

    if(pos.x > ((viewPortWidth / 2) - 20)
       && this.x > (viewPortWidth - this.width)) 
    {
      this.x -= velocity;
    }
    if(pos.x < ((viewPortWidth / 2) + 20)
    && this.x < 0) 
    {
      this.x += velocity;
    }

    if(pos.y > gameInstance.height - startMov && this.y > (gameInstance.height - this.height)) {
      this.y -= velocity;
    }
    else if(pos.y < startMov && this.y < 0) {
      this.y += velocity;
    }
  }

  SpawnMonster(id, x, y)
  {
    let entProto = gameInstance.mobProto[id];
    let vId = this.entityVID++;
    let entity = new Monster(id, vId, this);
    entity.SetAttributes(entProto.attributes);
    entity.name = entProto.name;
    entity.level = entProto.level;
    entity.resourceName = entProto.sprite_sheet;
    entity.stateAnimations = entProto.animations;
    entity.Spawn(x, y);

    if(entProto.scale) 
      entity.SetScale(entProto.scale);

    entity.SetZ(y + entity.GetHeight());
    if(Math.floor(Math.random() * 2))
    {
      entity.SetDirection(-1);
    }

    this.entities[vId] = entity;
  }

  LoadObjects(objects)
  {
    for(let i in objects)
    {
      let objData = objects[i];
      let obj = new Entity(5000+i, this);
      obj.LoadSprite(objData.texture);
      if(objData.z)
        obj.SetZ(objData.z);
      else
        obj.SetZ(objData.y + obj.GetHeight());
      if(objData.rotation) obj.SetRotation(objData.rotation);
      if(objData.scale) obj.SetScale(objData.scale);
      if(objData.collision) 
      {
        obj.SetCollisionBox(objData.collision[0], 
          objData.collision[1], 
          objData.collision[2], 
          objData.collision[3]);
      }
      
      obj.Show(objData.x, objData.y);
    }
  }

  LoadEntities(entities)
  {
    for(let i in entities)
    {
      let entData = entities[i];
      this.SpawnMonster(entData.id, entData.x, entData.y);
    }
  }

  Load(name, callBack)
  {
    fetch(`assets/map/${name}.json?td=${Math.random()}`)
    .then(response => response.json())
    .then(data => {
      this.width = data.size.width;
      this.height = data.size.height;
      this.basePosition = data.base_position;
      this.texture = LOADER.resources[data.texture].texture;
      this.LoadObjects(data.objects);
      this.LoadEntities(data.entities);
      callBack();
    });
  }
}










