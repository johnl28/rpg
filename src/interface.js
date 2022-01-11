// Copyright Ioan Criste (Johnl), All rights reseved
// Date: 09/01/2022

function StartGame()
{
  $("#main-menu").hide();
  gameInstance.StartGame();
  $("#loading-window").show();
}

function Resume()
{
  $("#main-menu").hide();
}

function Save()
{
  let player = gameInstance.player;
  let basicData = {
    "x": player.GetXY().x,
    "y": player.GetXY().y,
    "level": player.level,
    "name": player.name,
    "play_time": player.playTime
  }

  localStorage.setItem("player_data", JSON.stringify(basicData))
  localStorage.setItem("player_attr", JSON.stringify(player.attributes))
}

class Interface
{
  ui = null;
  mainMenu = null;
  hud = null;
  loading = null;
  mobHud = null;
  
  constructor()
  {
    this.ui = $("#ui");

    this.AppendElement("#died-text", `<div id="died-text">YOU DIED! PRESS (R) FOR REVIVING.</div>`);
    $("#died-text").hide();
    this.__initMainMenu();
    this.__initHud();
    this.__initMobHud();
    this.__initLoadingUi();
    log("Init UI DONE!")
  }

  GameLoaded()
  {
    $("#start-btn").hide();
    this.mainMenu.prepend(`<div class="menu-btn" onclick="Resume()">Close</div>`);
    this.mainMenu.prepend(`<div class="menu-btn" onclick="Save()">Save</div>`);
    this.loading.hide();
    this.hud.show();
  }

  AppendElement(id, htmlCode)
  {
    this.ui.append(htmlCode);
    return $(id);
  }

  SetLoadingText(text)
  {
    $("#loading-text").text(text);
  }
  
  UpdateMobHud(monster)
  {
    let curHp = monster.GetAttr("hp");
    let maxHp = monster.GetAttr("maxHp");
    
    this.mobHud.css("display", "flex");
    let percentage = (parseFloat(curHp) / parseFloat(maxHp)) * 100.00;
    let value = percentage / 100.0 * 200.0;
    $("#monster-name").text(`Lv.${monster.level} ${monster.name}`);
    $("#monster-hp").css("width", value);
    $("#monster-hp").text(`${curHp}/${maxHp}`);
  }

  ToggleDiedText()
  {
    let div = $("#died-text");
    if(div.is(":visible"))
    {
      div.hide();
      return;
    }

    div.show();
  }

  __initMobHud()
  {
    this.mobHud = this.AppendElement("#mob-hud", `<div id="mob-hud" class="box"></div>`);
    this.mobHud.append(`<div id="monster-name">Name Monster</div>`);
    this.mobHud.append(`<div class="hp-bar" id="monster-hp"></div>`);

    // this.ui.on("click", () => this.mobHud.hide());
  }

  __initMainMenu()
  {
    this.mainMenu = this.AppendElement("#main-menu", `<div id="main-menu"></div>`);
    this.mainMenu.append(`<div id="start-btn" class="menu-btn" onclick="StartGame()">Start</div>`);
    this.mainMenu.append(`<div class="menu-btn" onclick="OpenSettings()">Settings</div>`);
    this.mainMenu.append(`<div class="menu-btn" onclick="OpenCredits()">Credits</div>`);
  }

  __initLoadingUi()
  {
    this.loading = this.AppendElement("#loading-window", `<div id="loading-window"></div>`);
    this.loading.append(`<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`);
    this.loading.append(`<div id="loading-text"></div>`);
    this.loading.hide();
  }

  __createTaskBar()
  {

  }

  __initHud()
  {
    let hud = this.hud = this.AppendElement("#hud", `<div id="hud" class="box"></div>`);
    hud.append(`<div class="row">Name: <label id="player-name"></label></div>`);
    hud.append(`<div class="row">Level: <label id="player-level" /></div>`);
    hud.append(`<div class="row"><div id="player-hp" class="hp-bar" /></div>`);
    hud.append(`<div class="row">Coordinates: <label id="player-coor" /></div>`);
    hud.hide();
  }
}






