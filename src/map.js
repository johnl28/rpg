// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 08/01/2022

class Map extends PIXI.TilingSprite {
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
  }

  __updateBackgroundScroll(player)
  {
    if(!player) return;
    let pos = player.container.getGlobalPosition();
    let startMov = 200;
    let velocity = player.GetSpeed();
    if(pos.x > gameInstance.width / 2 - 100 && this.x > (gameInstance.width - this.width)) {
      this.x -= velocity;
    }
    else if(pos.x < gameInstance.width / 2 - 100 && this.x < 0) {
      this.x += velocity;
    }

    if(pos.y > gameInstance.height - startMov && this.y > (gameInstance.height - this.height)) {
      this.y -= velocity;
    }
    else if(pos.y < startMov && this.y < 0) {
      this.y += velocity;
    }
  }

  LoadObjects(objects)
  {
    for(let i in objects)
    {
      let objData = objects[i];
      let obj = new Entity(5000+i, this);
      obj.LoadSprite(objData.texture);
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
      let entProto = gameInstance.mobProto[entData.id];
      let vId = 1000+i;
      let entity = new Monster(entData.id, vId, this);

      entity.resourceName = entProto.sprite_sheet;
      entity.stateAnimations = entProto.animations;
      entity.Spawn(entData.x, entData.y);
      if(entProto.scale) entity.SetScale(entProto.scale);
      this.entities[vId] = entity;
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
      this.LoadObjects(data.objects);
      this.LoadEntities(data.entities);
      callBack();
    });
  }
}










