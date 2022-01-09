// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 08/01/2022


class Monster extends Actor
{
  type = "MONSTER";

  attributes = {
    hp: 100,
    maxHp: 100,
    speed: 2,
    damage: 2
  }

  constructor(id, virtualID, stage)
  {
    super(id, virtualID, stage);
  }

}


