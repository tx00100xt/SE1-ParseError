7003
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/Grunt/Grunt.h"
#include "Models/Enemies/Headman/headman.h"
#include "Models/Enemies/SCORPMAN/Gun.h"
#include "Models/Player/Sammy/Player.h"
#include "Models/Player/Sammy/Body.h"
#include "Models/Player/Sammy/Head.h"
#include "Models/Weapons/Mini2/Mini2GunItem.h"
#include "Models/Weapons/Mini2/Body.h"
#include "Models/Weapons/RocketLauncher/RocketLauncherItem.h"
#include "EntitiesMP/HealthItem.h"
#include "EntitiesMP/ArmorItem.h"
#include "EntitiesMP/WeaponItem.h"
#include "EntitiesMP/AmmoItem.h"
#include "EntitiesMP/PowerUpItem.h"
#include "EntitiesMP/MessageItem.h"
#include "EntitiesMP/AmmoPack.h"
#include "EntitiesMP/KeyItem.h"
#include "EntitiesMP/DoorController.h"
extern void JumpFromBouncer(CEntity *penToBounce, CEntity *penBouncer);
//extern INDEX hud_bShowPEInfo;
extern INDEX dwk_bShowExtraStats;
//extern INDEX ol_ctEnemiesAlive;
%}

uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Projectile";
uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Bullet";
uses "EntitiesMP/Player";
uses "EntitiesMP/Summoner";
//uses "EntitiesMP/Camera";
uses "EntitiesMP/Item";
uses "EntitiesMP/Star";
uses "EntitiesMP/TouchField";
uses "EntitiesMP/Tracer";

enum BotState {
  0 BOT_FOLLOWING "Following",
  1 BOT_MOVING    "Moving to Enemy",
  2 BOT_ROTATING  "Rotating",
  3 BOT_FIRING    "Firing at Enemy",
  5 BOT_STANDING  "Standing",
  6 BOT_SWIM      "Swimming",
  7 BOT_SWIM_IDLE "Swim Idle",
  8 BOT_INIT      "Bot Initial",
  9 BOT_BACKPEDAL "Bot Backing Up",
};

enum BotType {
  0 BT_SNIPER   "Sniper Bot",
  1 BT_BOMBER   "Bomber Bot",
  2 BT_ROCKETER "Rocketer Bot",
};

event EJump {
};

%{
// info structure
static EntityInfo eiPlayerBot = {
  EIBT_FLESH, 100.0f,
  0.0f, 2.5f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
#define DISTANCE_ELECTRICITY   8.0f
%}

class CPlayerBot: CMovableModelEntity {
name      "PlayerBot";
thumbnail "Thumbnails\\PlayerBot.tbn";
features  "HasName";

properties:

  3 CSoundObject m_soSound,
  4 CEntityPointer m_penEnemy,
  5 FLOAT3D m_vDesiredPosition = FLOAT3D(0,0,0),
  6 ANGLE m_aRotateSpeed = 0,
  7 FLOAT m_fMoveSpeed = 0.0f,
  8 FLOAT m_fMoveFrequency = 0.0f,
  9 FLOAT fHealth = 0.0f,
  10 BOOL m_bCanFire = FALSE,
  11 FLOAT3D m_vTeleportPosition = FLOAT3D(0,0,0),
  12 FLOAT m_fTargetTime = 0.0f,
  13 enum BotState m_botState = BOT_FOLLOWING,
  14 FLOAT m_fFireAngle = 0.0f,
  15 INDEX m_iFollowCount = 0,
  16 FLOAT m_tmSpawned = 0.0f,
  17 enum BotState m_botStatePrior = BOT_FOLLOWING,
  18 CEntityPointer m_penOwner,
  19 enum BotType m_btType = BT_SNIPER,
  20 FLOAT m_fFireFrequency = 0.0f,
  21 CTString m_strName = "Bot",
  22 FLOAT m_fKillTime = 0.0f,
  23 FLOAT m_fRealSpeed = 0.0f,
  24 FLOAT m_tmSeriousSpeed = 0.0f,
  25 FLOAT m_fCurrentSpeed = 0.0f,
  26 BOOL  m_bFiring = FALSE,
  27 BOOL  m_bCanTeleport = FALSE,
  28 INDEX m_ctBeforeTeleport = 0,
  29 FLOAT m_tmSeriousDamage   = 0.0f,
  30 FLOAT3D m_vTeleportPositionLast = FLOAT3D(0,0,0),
  31 CEntityPointer m_penStar,
  32 INDEX m_iTurn = 0, // 0 is none, 1 is right, 2 left
  33 INDEX m_iMoveCount = 0,
  34 INDEX m_ctTeleportPosition = 0,
  35 BOOL  m_bSwimming = FALSE,
  36 FLOAT fMaxY = 8.0f,
  37 CEntityPointer m_penRayHit,         // entity hit by ray
  38 FLOAT m_fRayHitDistance = 100.0f,   // distance from hit point
  39 FLOAT3D m_vRayHit = FLOAT3D(0,0,0), // coordinates where ray hit
  40 FLOAT3D m_vRayHitLast = FLOAT3D(0,0,0), // coordinates where ray hit last
  //41 CEntityPointer m_penView,             // bot view
  42 CEntityPointer m_penHoming,
  43 BOOL  bGetNewTarget = FALSE,
  44 BOOL  m_bRenderElectricity1 = FALSE,
  45 FLOAT m_fReactionTime = 0.0f,
  46 FLOAT m_fMaxDistance = 0.0f,
  47 INDEX m_ctInfoUpdate = 0,
  48 CEntityPointer m_penCurrent,
  49 INDEX m_ctFireBullet = 0,
  50 INDEX m_ctFireProjectile = 0,
  51 FLOAT m_fOriginX = 0.0f,
  52 FLOAT m_fOriginZ = 0.0f,
  53 FLOAT m_fLimitX = 0.0f,
  54 FLOAT m_fLimitZ = 0.0f,
  55 CEntityPointer m_penItem,
  //56 INDEX m_ulItemPickedMask =  0x00,
  //57 BOOL  m_bSetItemMask = TRUE,
  //58 INDEX m_ctNewEnemy = 0,
  60 BOOL  m_bRenderElectricity2 = FALSE,
  //61 CEntityPointer m_penTouchField,
  62 BOOL  m_bRenderElectricity3 = FALSE,
  63 INDEX m_ctCkVisiblity = 0,
  64 INDEX m_ctCkVisiblity1 = 0,
  65 FLOAT m_tmUpdateInfo = 0.0f,
  66 FLOAT m_tmUpdateTeleportPos = 0.0f,
  67 FLOAT m_tmFindItem = 0.0f,
  68 FLOAT m_tmTeleportDelay = 0.0f,
  69 CTString m_strViewName = "",
  70 FLOAT m_tmFollowPause = 0.0f,
  71 FLOAT m_fDamageAmount = 1.0f,
  72 BOOL  m_bSwimmingPrior = FALSE,
	//73 CPlacement3D m_plView = CPlacement3D(FLOAT3D(0,0,0), ANGLE3D(0,0,0)),
	74 BOOL  m_bUseSpecialLevelInfo = FALSE,
	75 INDEX m_iLevelIndex = 0,
	76 BOOL  m_bSkipVisibilityCheck = FALSE,
	77 INDEX m_bJump = FALSE,
	78 BOOL  m_bInAir = FALSE,
	79 FLOAT m_fAirTime = 0.0f,

  // minigun
  100 FLOAT m_aMiniGun = 0.0f,
  101 FLOAT m_aMiniGunLast = 0.0f,
  102 FLOAT m_aMiniGunSpeed = 0.0f,

{
  CEntity *penBullet;     // bullet
  CModelObject *pmoModel; // model
}
    
components:

	1 class   CLASS_BULLET          "Classes\\Bullet.ecl",
	2 class   CLASS_PROJECTILE      "Classes\\Projectile.ecl",
	//3 class   CLASS_PLAYERBOT_VIEW  "Classes\\PlayerBotView.ecl",
	4 class   CLASS_CAMERA          "Classes\\Camera.ecl",
	5 class   CLASS_STAR            "Classes\\Star.ecl",
	6 class   CLASS_TRACER          "Classes\\Tracer.ecl",

	10 model   MODEL_PLAYER          "Models\\Player\\Sammy\\Player.mdl",
	11 model   MODEL_BODY            "Models\\Player\\Sammy\\Body.mdl",
	12 model   MODEL_HEAD            "Models\\Player\\Sammy\\Head.mdl",

	21 texture TEXTURE_PLAYER        "Models\\Player\\Sammy\\Player.tex",
	22 texture TEXTURE_PLAYER_BLACK  "Models\\Player\\Sammy\\Player_blue.tex",
	23 texture TEXTURE_PLAYER_RED    "Models\\Player\\Sammy\\Player_red.tex",
	24 texture TEXTURE_HEAD          "Models\\Player\\Sammy\\Head.tex",
	25 texture TEXTURE_HEAD_BLACK    "Models\\Player\\Sammy\\Head_Blue.tex",

	30 sound SOUND_JUMP						 "SoundsMP\\Player\\Female\\Jump.wav",
	31 sound SOUND_LAND						 "SoundsMP\\Player\\Female\\Land.wav",

	// ************** DA BOMB ************** 
	40 model   MODEL_BOMB            "Models\\Weapons\\Bomb\\BombSmall.mdl",
	41 texture TEXTURE_BOMB          "Models\\Weapons\\Bomb\\Bomb.tex",

	// ************** SOUNDS **************
	50 sound   SOUND_FIRE            "Models\\Weapons\\MiniGun\\Sounds\\Fire.wav",

	// ************** FLARES **************
	60 model   MODEL_FLARE02         "Models\\Effects\\Weapons\\Flare02\\Flare.mdl",
	61 texture TEXTURE_FLARE02       "Models\\Effects\\Weapons\\Flare02\\Flare.tex",

	// ************** MINIGUN **************
	80 model   MODEL_MINIGUN         "Models\\Weapons\\Mini2\\Mini2GunItem.mdl",
	81 model   MODEL_MG_BODY         "Models\\Weapons\\Mini2\\Body.mdl",
	82 texture TEXTURE_MG_BODY       "Models\\Weapons\\Mini2\\Body.tex",
	83 model   MODEL_MG_BARRELS01    "Models\\Weapons\\Mini2\\Barrels01.mdl",
	84 model   MODEL_MG_BARRELS02    "Models\\Weapons\\Mini2\\Barrels02.mdl",
	85 texture TEXTURE_MG_BARRELS    "Models\\Weapons\\Mini2\\Barrels.tex",
	86 model   MODEL_MG_ENGINE       "Models\\Weapons\\Mini2\\Engine.mdl",

	// ************** ROCKET LAUNCHER **************
	90 model   MODEL_ROCKETLAUNCHER        "Models\\Weapons\\RocketLauncher\\RocketLauncherItem.mdl",
	91 model   MODEL_RL_BODY               "Models\\Weapons\\RocketLauncher\\Body.mdl",
	92 texture TEXTURE_RL_BODY             "Models\\Weapons\\RocketLauncher\\Body.tex",
	93 model   MODEL_RL_ROTATINGPART       "Models\\Weapons\\RocketLauncher\\RotatingPart.mdl",
	94 texture TEXTURE_RL_ROTATINGPART     "Models\\Weapons\\RocketLauncher\\RotatingPart.tex",
	95 model   MODEL_RL_ROCKET             "Models\\Weapons\\RocketLauncher\\Projectile\\Rocket.mdl",
	96 texture TEXTURE_RL_ROCKET           "Models\\Weapons\\RocketLauncher\\Projectile\\Rocket.tex",

	// ************** REFLECTIONS **************
	100 texture TEX_REFL_LIGHTMETAL01       "Models\\ReflectionTextures\\LightMetal01.tex",
	101 texture TEX_REFL_DARKMETAL          "Models\\ReflectionTextures\\DarkMetal.tex",

	// ************** SPECULAR **************
	110 texture TEX_SPEC_MEDIUM             "Models\\SpecularTextures\\Medium.tex",

functions:

/************************************************************
 *                   MISC. FUNCTIONS                        *
 ************************************************************/

  void PostMoving(void)
  {
    /*if (m_penView!=NULL) {
      CPlacement3D plNew = GetPlacement();
      plNew.pl_PositionVector(2) += 2.1f;
			// get delta to desired position
			m_vDesiredPosition(2) += 0.5f;
			FLOAT3D vDelta = m_vDesiredPosition - plNew.pl_PositionVector;
			// get desired pitch orientation
			FLOAT3D vDir = vDelta;
			vDir.SafeNormalize();
			ANGLE aHeading = GetRelativeHeading(vDir);
			aHeading = Clamp(aHeading, -30.0f, 30.0f);
			plNew.pl_OrientationAngle(1) = aHeading;
			ANGLE aPitch = GetRelativePitch(vDir);
			aPitch = Clamp(aPitch, -30.0f, 70.0f);
			plNew.pl_OrientationAngle(2) = aPitch;
			m_plView = plNew;
		}*/
    CMovableModelEntity::PostMoving();
    FLOAT tmNow = _pTimer->CurrentTick();
    FLOAT fCurrentTranslation = en_vCurrentTranslationAbsolute.Length();
    // if moving
    if (fCurrentTranslation>8) {
      if (tmNow>m_tmUpdateInfo) {
        UpdateTargetingInfo();
        m_tmUpdateInfo = tmNow+2.0f;
      }        
      if (tmNow>m_tmFindItem) {
        GetItem(m_penItem);
        m_tmFindItem = tmNow+2.5f;
        m_ctCkVisiblity1 = 0;
      }
      if (tmNow>m_tmUpdateTeleportPos) {
        m_vTeleportPositionLast = m_vTeleportPosition;
        FLOAT fDist = (m_vTeleportPosition-m_vDesiredPosition).Length();
        if (fDist>15) {
          m_vTeleportPosition = m_vDesiredPosition;
        }
        m_tmUpdateTeleportPos = tmNow+3.0f;
      }
      m_ctBeforeTeleport = 0;
    } else {
      if (m_bCanTeleport) {
        m_ctBeforeTeleport++;
        if (m_ctBeforeTeleport>=10) {
          TeleportEntity(this, CPlacement3D(m_vTeleportPositionLast+FLOAT3D(0, 0.5f, 0), GetPlacement().pl_OrientationAngle));
          m_ctBeforeTeleport = 0;
        }
      }
    }
    // if owner has serious speed so do we....
    if (m_tmSeriousSpeed>tmNow) {
      m_fCurrentSpeed = m_fRealSpeed*2; 
      en_fDeceleration = 300.0f;
    } else {
      m_fCurrentSpeed = m_fRealSpeed;
      en_fDeceleration = 200.0f;
    }
    // if we are in swimmable content
    if ((GetWorld()->wo_actContentTypes[en_iDnContent].ct_ulFlags&CTF_SWIMABLE)) {
      // change collision box, and set swimming BOOL to TRUE
      if (ChangeCollisionBoxIndexNow(PLAYER_COLLISION_BOX_SWIM) && !m_bSwimming) {
        m_bSwimming = TRUE;
        en_fDensity = 1000.0f; // same density as water
				if (m_bInAir) {
					m_bInAir = FALSE;
				} 
      }
    } else {
      if (ChangeCollisionBoxIndexNow(PLAYER_COLLISION_BOX_STAND)) {
        m_bSwimming = FALSE;
        en_fDensity = 2000.0f;
      }
    }
    // flying control
    CBrushSector *pbsc = GetSectorFromPoint(GetPlacement().pl_PositionVector);
    if (pbsc==NULL) {
      ////CPrintF( "Player Bot - NO Sector....\n");
      // teleport 
      TeleportEntity(this, CPlacement3D(m_vTeleportPositionLast+FLOAT3D(0, 0.5f, 0), GetPlacement().pl_OrientationAngle));
    }
    // render particles
    /*if (m_penEnemy!=NULL) {
      m_bRenderElectricity1 = TRUE;
    } else {
      m_bRenderElectricity1 = FALSE;
    }
    if (m_penItem!=NULL) {
      m_bRenderElectricity2 = TRUE;
    } else {
      m_bRenderElectricity2 = FALSE;
    }
    if (m_penTouchField!=NULL) {
      m_bRenderElectricity3 = TRUE;
    } else {
      m_bRenderElectricity3 = FALSE;
    }*/
  }

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiPlayerBot;
  };

  void TeleportEntity(CEntity *pen, const CPlacement3D &pl)
  {
    // teleport 
    pen->Teleport(pl, FALSE);
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
		if (m_penEnemy==NULL && IsDerivedFromClass(penInflictor, "Enemy Base")) {
			m_penEnemy = penInflictor;
			m_fTargetTime = _pTimer->CurrentTick()+1.0f;
		}

		/*if(dmtType==DMT_IMPACT || dmtType==DMT_BRUSH) {
			return;
		}
    ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);*/
    return;
  };

  // render particles
  void RenderParticles(void)
  {
    FLOAT tmNow = _pTimer->GetLerpedCurrentTick();
    if (m_tmSeriousSpeed>tmNow) {
      Particles_RunAfterBurner(this, m_tmSeriousSpeed, 0.3f, 0);
    }
    if (m_tmSeriousDamage>tmNow) {
      Particles_ModelGlow(this, m_tmSeriousDamage, PT_GLOW, 0.2f, 3, 0.03f, 0xff777700);
    }
    /*if( m_bRenderElectricity1 && m_penEnemy!=NULL) {
      // render one lightning toward enemy
      FLOAT3D vSource = GetPlacement().pl_PositionVector;
      vSource += FLOAT3D(0, 1.5f, 0);
      FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      vTarget += FLOAT3D(0, 1.5f, 0);
      COLOR colLine = C_BLUE|CT_OPAQUE;
      if (m_btType==BT_SNIPER) {
        colLine = C_RED|CT_OPAQUE;
      } else if (m_btType==BT_ROCKETER) {
        colLine = C_GREEN|CT_OPAQUE;
      }
      Particles_Raycast(vSource, vTarget, 64, 0.5f, colLine);
    }
    if( m_bRenderElectricity2 && m_penItem!=NULL) {
      // render one lightning toward enemy
      FLOAT3D vSource = GetPlacement().pl_PositionVector;
      vSource += FLOAT3D(0, 1.5f, 0);
      FLOAT3D vTarget = m_penItem->GetPlacement().pl_PositionVector;
      vTarget += FLOAT3D(0, 1.5f, 0);
      COLOR colLine = C_MAGENTA|CT_OPAQUE;
      if (m_btType==BT_SNIPER) {
        colLine = C_CYAN|CT_OPAQUE;
      } else if (m_btType==BT_ROCKETER) {
        colLine = C_YELLOW|CT_OPAQUE;
      }
      Particles_Raycast(vSource, vTarget, 64, 0.5f, colLine);
    }
    if( m_bRenderElectricity3 && m_penTouchField!=NULL) {
      // render one lightning toward enemy
      FLOAT3D vSource = GetPlacement().pl_PositionVector;
      vSource += FLOAT3D(0, 1.5f, 0);
      FLOAT3D vTarget = m_penTouchField->GetPlacement().pl_PositionVector;
      vTarget += FLOAT3D(0, 1.5f, 0);
      COLOR colLine = C_BROWN|CT_OPAQUE;
      if (m_btType==BT_SNIPER) {
        colLine = C_ORANGE|CT_OPAQUE;
      } else if (m_btType==BT_ROCKETER) {
        colLine = C_PINK|CT_OPAQUE;
      }
      Particles_Raycast(vSource, vTarget, 64, 0.5f, colLine);
    }*/
  }

 /* Receive item */
  BOOL ReceiveItem(const CEntityEvent &ee)
  {
    // null current target
    m_penItem = NULL;

    // *********** HEALTH ***********
    if( ee.ee_slEvent == EVENTCODE_EHealth) {
      return TRUE;
    } 
    // *********** ARMOR ***********
    else if( ee.ee_slEvent == EVENTCODE_EArmor) {
      return TRUE;
    }
    // *********** WEAPON ***********
    else if (ee.ee_slEvent == EVENTCODE_EWeaponItem) {
      return TRUE;
    }
    // *********** AMMO ***********
    else if (ee.ee_slEvent == EVENTCODE_EAmmoItem) {
      return FALSE;
    }
    else if (ee.ee_slEvent == EVENTCODE_EAmmoPackItem) {
      return FALSE;
    }
    // *********** KEYS ***********
    else if (ee.ee_slEvent == EVENTCODE_EKey) {
      return FALSE;
    }
    // nothing picked
    return FALSE;
  };

  /* Adjust model shading parameters */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
      colAmbient = C_dGRAY;
      return FALSE;
  }

  // Adjust model mip factor if needed.
  void AdjustMipFactor(FLOAT &fMipFactor)
  {
    fMipFactor = 0;
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CPlayerBot) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

	void SpawnDependents(void)
	{
		// destroy any existing dependents
    /*if (m_penView!=NULL || m_penStar!=NULL) {
			DestroyDependents();
		}

    // spawn 3rd person view camera
    m_penView = NULL;
    CPlacement3D pl = GetPlacement();
    pl.pl_PositionVector(2) += 2.5f;
    pl.pl_PositionVector(3) += 5.0f;
    pl.pl_OrientationAngle(1) = 0.0f;
    m_penView = CreateEntity(pl, CLASS_CAMERA);
    ((CCamera&)*m_penView).m_tmTime = 1E6f;
    ((CCamera&)*m_penView).m_bWideScreen = FALSE;
    ((CCamera&)*m_penView).m_strName = m_strViewName;
		((CCamera&)*m_penView).m_bBotView = TRUE;
		((CCamera&)*m_penView).m_penOwner = this;
    m_penView->SetParent(this);
    m_penView->Initialize();*/
    
		// spawn our star
    m_penStar = NULL;
    CPlacement3D plBot = GetPlacement();
    plBot.pl_PositionVector(2) += 2.3f;
    m_penStar = CreateEntity(plBot, CLASS_STAR);
		// set it's appearance
    if (m_btType==BT_SNIPER) {
      ((CStar&)*m_penStar).m_stType = ST_GOLD;
    } else if (m_btType==BT_ROCKETER) {
      ((CStar&)*m_penStar).m_stType = ST_COPPER;
    } else {
      ((CStar&)*m_penStar).m_stType = ST_CHROME;
    }
    ((CStar&)*m_penStar).SetParent(this);
    ((CStar&)*m_penStar).Initialize();
	}

	void DestroyDependents(void)
	{
    // destroy 3rd person view camera
    /*if (m_penView!=NULL) {
			m_penView->SendEvent(EEnd());
		}*/
  	// destroy our star
    if (m_penStar!=NULL) {
			m_penStar->SendEvent(EEnd());
		}
	}

/************************************************************
 *                  ANIMATION FUNCTIONS                     *
 ************************************************************/

  void GetAnimation(void)
  {
    // if our state has changed, reset animation
    //if (m_botStatePrior!=m_botState || m_bSwimmingPrior!=m_bSwimming) {
      // if swimming
      if (m_bSwimming) {
        if (m_botState==BOT_STANDING) {
          SwimIdleAnim();
        } else if (m_botState==BOT_ROTATING
          || m_botState==BOT_BACKPEDAL
          || m_botState==BOT_FIRING) {
          SwimAnim();
        } else {
          SwimAnim();
        }
      // if not swimming
      } else {
        if (m_botState==BOT_STANDING) {
          StandingAnim();
        } else if (m_botState==BOT_ROTATING) {
          RotatingAnim();
        } else if (m_botState==BOT_BACKPEDAL) {
          BackPedalAnim();
        } else if (m_botState==BOT_FIRING) {
          RunningAnim();
        } else {
          RunningAnim();
        }
      }
      // set state priors, we need 2 because of swimming clipping problems
      m_botStatePrior = m_botState;
      m_bSwimmingPrior = m_bSwimming;

      if (dwk_bShowExtraStats) {
        CTString strState = BotState_enum.NameForValue(INDEX(m_botState));
        //CPrintF("%s's Bot State: %s\n", m_strName, strState);
      }
    //}
  }

  void StandingAnim(void) {
    StartModelAnim(PLAYER_ANIM_STAND, AOF_LOOPING|AOF_NORESTART);
    if (m_btType==BT_SNIPER) {
      GetBody()->PlayAnim(BODY_ANIM_MINIGUN_STAND, AOF_LOOPING|AOF_NORESTART);
    } else if (m_btType==BT_BOMBER) {
      GetBody()->PlayAnim(BODY_ANIM_COLT_STAND, AOF_LOOPING|AOF_NORESTART);
    } else {
      GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_STAND, AOF_LOOPING|AOF_NORESTART);
    }
  };

  void BackPedalAnim(void) {
    StartModelAnim(PLAYER_ANIM_BACKPEDAL, AOF_LOOPING|AOF_NORESTART);
    if (m_btType==BT_SNIPER) {
      GetBody()->PlayAnim(BODY_ANIM_MINIGUN_STAND, AOF_LOOPING|AOF_NORESTART);
    } else if (m_btType==BT_BOMBER) {
      GetBody()->PlayAnim(BODY_ANIM_COLT_STAND, AOF_LOOPING|AOF_NORESTART);
    } else {
      GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_STAND, AOF_LOOPING|AOF_NORESTART);
    }
  };

  void FireAnim(void)
  {
    if (m_bSwimming) {      
      if (m_btType==BT_SNIPER) {
        GetBody()->PlayAnim(BODY_ANIM_MINIGUN_SWIM_FIRESHORT, AOF_LOOPING|AOF_NORESTART);
      } else if (m_btType==BT_BOMBER) {
        GetBody()->PlayAnim(BODY_ANIM_KNIFE_SWIM_ATTACK, AOF_LOOPING|AOF_NORESTART);
      } else {
        GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_SWIM_FIRESHORT, AOF_LOOPING|AOF_NORESTART);
      }
    } else {      
      if (m_btType==BT_SNIPER) {
        GetBody()->PlayAnim(BODY_ANIM_MINIGUN_FIRESHORT, AOF_LOOPING|AOF_NORESTART);
      } else if (m_btType==BT_BOMBER) {
        GetBody()->PlayAnim(BODY_ANIM_KNIFE_ATTACK, AOF_LOOPING|AOF_NORESTART);;
      } else {
        GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_FIRESHORT, AOF_LOOPING|AOF_NORESTART);
      }
    }
  };
        
  void StopFireAnim(void)
  {
    if (m_bSwimming) {
      if (m_btType==BT_SNIPER) {
        GetBody()->PlayAnim(BODY_ANIM_MINIGUN_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
      } else if (m_btType==BT_BOMBER) {
        GetBody()->PlayAnim(BODY_ANIM_COLT_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
      } else {
        GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
      }
    } else {
      if (m_btType==BT_SNIPER) {
        GetBody()->PlayAnim(BODY_ANIM_MINIGUN_STAND, AOF_LOOPING|AOF_NORESTART);
      } else if (m_btType==BT_BOMBER) {
        GetBody()->PlayAnim(BODY_ANIM_COLT_STAND, AOF_LOOPING|AOF_NORESTART);
      } else {
        GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_STAND, AOF_LOOPING|AOF_NORESTART);
      }
    }
  }

  void RunningAnim(void) {
    StartModelAnim(PLAYER_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    if (m_btType==BT_SNIPER) {
      GetBody()->PlayAnim(BODY_ANIM_MINIGUN_STAND, AOF_LOOPING|AOF_NORESTART);
    } else if (m_btType==BT_BOMBER) {
      GetBody()->PlayAnim(BODY_ANIM_COLT_STAND, AOF_LOOPING|AOF_NORESTART);
    } else {
      GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_STAND, AOF_LOOPING|AOF_NORESTART);
    }
  };

  void SwimAnim(void)
  {
    StartModelAnim(PLAYER_ANIM_SWIM, AOF_LOOPING|AOF_NORESTART);
    if (m_btType==BT_SNIPER) {
      GetBody()->PlayAnim(BODY_ANIM_MINIGUN_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
    } else if (m_btType==BT_BOMBER) {
      GetBody()->PlayAnim(BODY_ANIM_COLT_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
    } else {
      GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
    }
  }

  void SwimIdleAnim(void)
  {
    StartModelAnim(PLAYER_ANIM_SWIMIDLE, AOF_LOOPING|AOF_NORESTART);
    if (m_btType==BT_SNIPER) {
      GetBody()->PlayAnim(BODY_ANIM_MINIGUN_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
    } else if (m_btType==BT_BOMBER) {
      GetBody()->PlayAnim(BODY_ANIM_COLT_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
    } else {
      GetBody()->PlayAnim(BODY_ANIM_SHOTGUN_SWIM_STAND, AOF_LOOPING|AOF_NORESTART);
    }
  }

  void RotatingAnim(void) {
    //StandingAnim();
		StartModelAnim(PLAYER_ANIM_TURNRIGHT, AOF_LOOPING|AOF_NORESTART);
  };

  void JumpStartAnim(void) {
		m_soSound.Set3DParameters(100.0f, 5.0f, 0.5f, 1.0f);
		PlaySound(m_soSound, SOUND_JUMP, SOF_3D);
    StartModelAnim(PLAYER_ANIM_JUMPSTART, AOF_NORESTART);
  };

  void JumpEndAnim(void) {
		m_soSound.Set3DParameters(100.0f, 5.0f, 0.5f, 1.0f);
		PlaySound(m_soSound, SOUND_LAND, SOF_3D);
    StartModelAnim(PLAYER_ANIM_JUMPEND, AOF_NORESTART);
  };

  // body and head animation/orientation
  void BodyAndHeadOrientation(void) {
		// body
    CAttachmentModelObject *pamoBody = GetModelObject()->GetAttachmentModel(PLAYER_ATTACHMENT_TORSO);
    // get delta to desired position
    FLOAT3D vDelta = m_vDesiredPosition - GetPlacement().pl_PositionVector;
    // get desired pitch orientation
    FLOAT3D vDir = vDelta;
    vDir.SafeNormalize();
    ANGLE aPitch = GetRelativePitch(vDir);
    aPitch = Clamp(aPitch, -30.0f, 70.0f);
    ////CPrintF("aPitch: %g\n", aPitch);
    pamoBody->amo_plRelative.pl_OrientationAngle(2) = aPitch;
		// set the head's heading and pitch to zero
		CPlayerBot &pl = (CPlayerBot&)*this;
    CAttachmentModelObject *pamoHead = pl.GetModelObject()->GetAttachmentModelList(
    PLAYER_ATTACHMENT_TORSO, BODY_ATTACHMENT_HEAD, -1);
    pamoHead->amo_plRelative.pl_OrientationAngle(2) = 0.0f;
    pamoHead->amo_plRelative.pl_OrientationAngle(1) = 0.0f;
    /*if (m_penView!=NULL) {
      CPlacement3D plNew = GetPlacement();
      plNew.pl_PositionVector(2) += 2.5f;
      plNew.pl_PositionVector(3) += 5.0f;
      //plNew.pl_OrientationAngle(1) = 0.0f;
			plNew.pl_OrientationAngle(2) = aPitch;
			m_plView = plNew;
		}*/
  };

  // just head animation/orientation
  void HeadOrientation(void) {
		// reset body to zero
    CAttachmentModelObject *pamoBody = GetModelObject()->GetAttachmentModel(PLAYER_ATTACHMENT_TORSO);
		pamoBody->amo_plRelative.pl_OrientationAngle(2) = 0.0f;
		// adjust head instead
		CPlayerBot &pl = (CPlayerBot&)*this;
    CAttachmentModelObject *pamoHead = pl.GetModelObject()->GetAttachmentModelList(
    PLAYER_ATTACHMENT_TORSO, BODY_ATTACHMENT_HEAD, -1);
    // get delta to desired position
    FLOAT3D vDelta = m_vDesiredPosition - GetPlacement().pl_PositionVector;
    // get desired pitch orientation
    FLOAT3D vDir = vDelta;
    vDir.SafeNormalize();
    ANGLE aPitch = GetRelativePitch(vDir);
    aPitch = Clamp(aPitch, -30.0f, 50.0f);
    ////CPrintF("aPitch: %g\n", aPitch);
    pamoHead->amo_plRelative.pl_OrientationAngle(2) = aPitch;
    ANGLE aHeading = GetRelativeHeading(vDir);
    aHeading = Clamp(aHeading, -30.0f, 30.0f);
    ////CPrintF("aHeading: %g\n", aHeading);
    pamoHead->amo_plRelative.pl_OrientationAngle(1) = aHeading*1.1f;
    /*if (m_penView!=NULL) {
      CPlacement3D plNew = GetPlacement();
      plNew.pl_PositionVector(2) += 2.5f;
      plNew.pl_PositionVector(3) += 5.0f;
      //plNew.pl_OrientationAngle(1) = aHeading;
			plNew.pl_OrientationAngle(2) = aPitch*1.1f;
			m_plView = plNew;
		}*/
  };

/************************************************************
 *                 ATTACHMENT FUNCTIONS                     *
 ************************************************************/

  CModelObject *GetBody(void)
  {
    return &GetModelObject()->GetAttachmentModel(PLAYER_ATTACHMENT_TORSO)->amo_moModelObject;
  }

  // Add attachment model
  void AddAttachmentModel(CModelObject *mo, INDEX iAttachment, ULONG ulIDModel, ULONG ulIDTexture,
                          ULONG ulIDReflectionTexture, ULONG ulIDSpecularTexture, ULONG ulIDBumpTexture) {
    SetComponents(&mo->AddAttachmentModel(iAttachment)->amo_moModelObject, ulIDModel, 
                  ulIDTexture, ulIDReflectionTexture, ulIDSpecularTexture, ulIDBumpTexture);
  };

  // Add weapon attachment
  void AddWeaponAttachment(INDEX iAttachment, ULONG ulIDModel, ULONG ulIDTexture,
                           ULONG ulIDReflectionTexture, ULONG ulIDSpecularTexture, ULONG ulIDBumpTexture) {
    AddAttachmentModel(pmoModel, iAttachment, ulIDModel, ulIDTexture,
                       ulIDReflectionTexture, ulIDSpecularTexture, ulIDBumpTexture);
  };

  // set active attachment (model)
  void SetAttachment(INDEX iAttachment) {
    pmoModel = &(pmoModel->GetAttachmentModel(iAttachment)->amo_moModelObject);
  };

  // Set components
  void SetComponents(CModelObject *mo, ULONG ulIDModel, ULONG ulIDTexture,
                     ULONG ulIDReflectionTexture, ULONG ulIDSpecularTexture, ULONG ulIDBumpTexture) {
    // model data
    mo->SetData(GetModelDataForComponent(ulIDModel));
    // texture data
    mo->mo_toTexture.SetData(GetTextureDataForComponent(ulIDTexture));
    // reflection texture data
    if (ulIDReflectionTexture>0) {
      mo->mo_toReflection.SetData(GetTextureDataForComponent(ulIDReflectionTexture));
    } else {
      mo->mo_toReflection.SetData(NULL);
    }
    // specular texture data
    if (ulIDSpecularTexture>0) {
      mo->mo_toSpecular.SetData(GetTextureDataForComponent(ulIDSpecularTexture));
    } else {
      mo->mo_toSpecular.SetData(NULL);
    }
    // bump texture data
    if (ulIDBumpTexture>0) {
      mo->mo_toBump.SetData(GetTextureDataForComponent(ulIDBumpTexture));
    } else {
      mo->mo_toBump.SetData(NULL);
    }
    ModelChangeNotify();
  };

/************************************************************
 *                      FIRE BULLET                         *
 ************************************************************/

  void PrepareBullet(FLOAT fDamage) {
    // bullet start position
    CPlacement3D plBullet;
    plBullet.pl_OrientationAngle = ANGLE3D(0,0,0);
    plBullet.pl_PositionVector = FLOAT3D(0, 1.7f, 0);
    plBullet.RelativeToAbsolute(GetPlacement());
    // create bullet
    penBullet = CreateEntity(plBullet, CLASS_BULLET);
    // init bullet
    EBulletInit eInit;
    eInit.penOwner = this;
    eInit.fDamage = fDamage;
    penBullet->Initialize(eInit);
  };

  // fire bullet
  void FireBullet(void) {
    // bullet
    FLOAT fDamageAm = 100.0f*m_fDamageAmount;
    PrepareBullet(fDamageAm);
    ((CBullet&)*penBullet).CalcTarget(m_penEnemy, 400);
    ((CBullet&)*penBullet).m_fBulletSize = 0.1f;
    ((CBullet&)*penBullet).CalcJitterTarget(0.0f);
    ((CBullet&)*penBullet).LaunchBullet( TRUE, FALSE, FALSE, FALSE);
    ((CBullet&)*penBullet).DestroyBullet();
  };

  // fire tracer
  void FireTracer(void) {
    // tracer start position
    CPlacement3D plTracer;
    plTracer.pl_OrientationAngle = ANGLE3D(0,0,0);
    plTracer.pl_PositionVector = FLOAT3D(0, 1.7f, 0);
    plTracer.RelativeToAbsolute(GetPlacement());
    CEntityPointer penTracer = CreateEntity(plTracer, CLASS_TRACER);
    // init and launch tracer
    ELaunchTracer eLaunch;
    eLaunch.penLauncher = this;
    penTracer->Initialize(eLaunch);
  };

  void FlareOn(void) {
    ShowFlare(BODY_ATTACHMENT_MINIGUN, MINI2GUNITEM_ATTACHMENT_BODY, BODY_ATTACHMENT_FLARE01);
    ShowFlare(BODY_ATTACHMENT_MINIGUN, MINI2GUNITEM_ATTACHMENT_BODY, BODY_ATTACHMENT_FLARE02);
		m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D|SOF_LOOP); 
  }

  void FlareOff(void) {
    HideFlare(BODY_ATTACHMENT_MINIGUN, MINI2GUNITEM_ATTACHMENT_BODY, BODY_ATTACHMENT_FLARE01);
    HideFlare(BODY_ATTACHMENT_MINIGUN, MINI2GUNITEM_ATTACHMENT_BODY, BODY_ATTACHMENT_FLARE02);
    m_soSound.Stop();
  }

  // show flare
  void ShowFlare(INDEX iAttachWeapon, INDEX iAttachObject, INDEX iAttachFlare) {
    CPlayerBot &pl = (CPlayerBot&)*this;
    CAttachmentModelObject *pamo = pl.GetModelObject()->GetAttachmentModelList(
      PLAYER_ATTACHMENT_TORSO, iAttachWeapon, iAttachObject, iAttachFlare, -1);
    if (pamo!=NULL) {
      pamo->amo_plRelative.pl_OrientationAngle(3) = (rand()*360.0f)/RAND_MAX;
      CModelObject &mo = pamo->amo_moModelObject;
      mo.StretchModel(FLOAT3D(1, 1, 1));
    }
  }

  // hide flare
  void HideFlare(INDEX iAttachWeapon, INDEX iAttachObject, INDEX iAttachFlare) {
    CPlayerBot &pl = (CPlayerBot&)*this;
    CAttachmentModelObject *amo = pl.GetModelObject()->GetAttachmentModelList(
    PLAYER_ATTACHMENT_TORSO, BODY_ATTACHMENT_MINIGUN, MINI2GUNITEM_ATTACHMENT_BARRELS01, -1);
    m_aMiniGunLast = m_aMiniGun = amo->amo_plRelative.pl_OrientationAngle(3);
    CAttachmentModelObject *pamo = pl.GetModelObject()->GetAttachmentModelList(
      PLAYER_ATTACHMENT_TORSO, iAttachWeapon, iAttachObject, iAttachFlare, -1);
    if (pamo!=NULL) {
      CModelObject &mo = pamo->amo_moModelObject;
      mo.StretchModel(FLOAT3D(0, 0, 0));
    }
  }

  void RotateMinigun(void) {
    ANGLE aAngle = Lerp(m_aMiniGunLast, m_aMiniGun, _pTimer->GetLerpFactor());
    if (aAngle>0) {
      aAngle *= -1;
    }
    ////CPrintF( "aAngle: %.0f\n", aAngle);
    // rotate minigun barrels
    CPlayerBot &pl = (CPlayerBot&)*this;
    CAttachmentModelObject *pamo1 = pl.GetModelObject()->GetAttachmentModelList(
    PLAYER_ATTACHMENT_TORSO, BODY_ATTACHMENT_MINIGUN, MINI2GUNITEM_ATTACHMENT_BARRELS01, -1);
    CAttachmentModelObject *pamo2 = pl.GetModelObject()->GetAttachmentModelList(
    PLAYER_ATTACHMENT_TORSO, BODY_ATTACHMENT_MINIGUN, MINI2GUNITEM_ATTACHMENT_BARRELS02, -1);
    if (pamo1!=NULL && pamo2!=NULL) {
      pamo1->amo_plRelative.pl_OrientationAngle(3) = aAngle; 
      pamo2->amo_plRelative.pl_OrientationAngle(3) = -aAngle;
    }
  };

/************************************************************
 *                    FIRE PROJECTILE                       *
 ************************************************************/

  // prepare propelled projectile
  void PreparePropelledProjectile(CPlacement3D &plProjectile, FLOAT3D vShootTarget,
    FLOAT3D &vOffset, ANGLE3D &aOffset)
  {
    FLOAT3D vDiff = (vShootTarget - (GetPlacement().pl_PositionVector + vOffset*GetRotationMatrix())).SafeNormalize();
    
    // find orientation towards target
    FLOAT3D mToTargetX, mToTargetY, mToTargetZ;
    mToTargetZ = -vDiff;
    mToTargetY = -en_vGravityDir;
    mToTargetX = (mToTargetY*mToTargetZ).SafeNormalize();
    mToTargetY = (mToTargetZ*mToTargetX).SafeNormalize();
    FLOATmatrix3D mToTarget;
    mToTarget(1,1) = mToTargetX(1); mToTarget(1,2) = mToTargetY(1); mToTarget(1,3) = mToTargetZ(1);
    mToTarget(2,1) = mToTargetX(2); mToTarget(2,2) = mToTargetY(2); mToTarget(2,3) = mToTargetZ(2);
    mToTarget(3,1) = mToTargetX(3); mToTarget(3,2) = mToTargetY(3); mToTarget(3,3) = mToTargetZ(3);

    // calculate placement of projectile to be at given offset
    plProjectile.pl_PositionVector = GetPlacement().pl_PositionVector + vOffset*GetRotationMatrix();
    FLOATmatrix3D mDirection;
    MakeRotationMatrixFast(mDirection, aOffset);
    DecomposeRotationMatrixNoSnap(plProjectile.pl_OrientationAngle, mToTarget*mDirection);
  };

  // shoot projectile at an exact spot
  CEntity *ShootProjectileAt(FLOAT3D vShootTarget, enum ProjectileType pt, FLOAT3D vOffset, ANGLE3D aOffset) {
    ASSERT(m_penEnemy != NULL);

    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    //vShootTarget += FLOAT3D(0, 0.5f, 0);
    PreparePropelledProjectile(pl, vShootTarget, vOffset, aOffset);
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = pt;
    penProjectile->Initialize(eLaunch);

    return penProjectile;
  };

  // shoot projectile on enemy
  CEntity *ShootPredictedProjectile(enum ProjectileType pt, FLOAT3D vPredictedPos, FLOAT3D vOffset, ANGLE3D aOffset) {
    ASSERT(m_penEnemy != NULL);

    // target enemy body (predicted)
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget = vPredictedPos;
    if (peiTarget != NULL)
    {
      // get body center vector
      FLOAT3D vBody = FLOAT3D(peiTarget->vTargetCenter[0],peiTarget->vTargetCenter[1],peiTarget->vTargetCenter[2]);
      FLOATmatrix3D mRotation;
      MakeRotationMatrixFast(mRotation, m_penEnemy->GetPlacement().pl_OrientationAngle);
      vShootTarget = vPredictedPos + vBody*mRotation;
    }
    // launch
    CPlacement3D pl;
    PreparePropelledProjectile(pl, vShootTarget, vOffset, aOffset);
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = pt;
    penProjectile->Initialize(eLaunch);

    return penProjectile;
  };

  /* calculates predicted position for propelled projectile */
  FLOAT3D CalculatePredictedPosition( FLOAT3D vShootPos, FLOAT3D vTarget, 
    FLOAT fSpeedSrc, FLOAT3D vSpeedDst, FLOAT fClampY)
  {
    FLOAT3D vNewTarget = vTarget;
    FLOAT3D &vGravity = en_vGravityDir;
    FLOAT fTime = 0.0f;
    FLOAT fLastTime = 0.0f;
    INDEX iIterations = 0;
    FLOAT3D vDistance = vNewTarget-vShootPos;

		//CPrintF("Iterate\n");
    // iterate to obtain accurate position
    do
    {
      iIterations++;
      fLastTime=fTime;
      fTime = vDistance.Length()/fSpeedSrc;
      vNewTarget = vTarget + vSpeedDst*fTime*2 + vGravity*0.5f*fTime*fTime;
      //vNewTarget(2) = ClampDn( vNewTarget(2), fClampY);
      vDistance = vNewTarget-vShootPos;
			//CPrintF("fTime: %.3f\n", fTime);
    }
    while( (Abs(fTime-fLastTime) > _pTimer->TickQuantum) && (iIterations<10) );
		//CPrintF("return vNewTarget\n");
    return vNewTarget;
  }

/************************************************************
 *                     TARGETING - INFO                     *
 ************************************************************/

  void GetTarget(CEntity *penEnemy)
  {
		//CPrintF("GetTarget()\n");
    // pen the current target so we can get a new one
    if (m_penEnemy!=NULL) {
      m_penCurrent = m_penEnemy;
    }
    // null the target so we can get a new one
    m_penEnemy = NULL;
		// get the our height
    FLOAT fBotY = GetPlacement().pl_PositionVector(2);
		// limiter ?
    //INDEX iCrittersCounted = 0;
		// enemy placements
    FLOAT fCritterX = 0.0f;
    FLOAT fCritterY = 0.0f;
    FLOAT fCritterZ = 0.0f;
		// how far we are going to try to look
		FLOAT fDist = 500.0f;
		FLOAT fCritterDist = 0.0f;
	  {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				// skip if it's the one we just had or is ugh
        if (pen==m_penCurrent || IsOfClass(pen, "Devil")) { continue; }
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				// skip if targeted by another bot, hasn't been spawned, temp frozen, or not alive
        if (penEnemy->m_penBotTargeted!=NULL || penEnemy->m_bTemplate 
          || penEnemy->m_bFrozen || !(penEnemy->GetFlags()&ENF_ALIVE)) { 
          continue; 
        }
				// get the enemy's postition
        fCritterX = penEnemy->GetPlacement().pl_PositionVector(1);
        fCritterY = penEnemy->GetPlacement().pl_PositionVector(2);
        fCritterZ = penEnemy->GetPlacement().pl_PositionVector(3);
				// if the enemy is inside our seeing range
        if (fCritterX>m_fOriginX && fCritterX<m_fLimitX && fCritterZ<m_fOriginZ && fCritterZ>m_fLimitZ 
          && fCritterY>fBotY-10.0f && fCritterY<fBotY+50.0f) { 
					// get it's distance from us
					fCritterDist = (penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector).Length();
					// pick if closer
          if (IsInFrustum1(penEnemy, CosFast(20.0f)) && fCritterDist<fDist) {
						fDist = fCritterDist;
            m_penEnemy = penEnemy;
          }
        }
      }
    }}
		if (m_penEnemy==NULL) {
			fDist = 500.0f;
			{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
				CEntity *pen = iten;
				if (IsDerivedFromClass(pen, "Enemy Base")) {
					if (pen==m_penCurrent || IsOfClass(pen, "Devil")) { continue; }
					CEnemyBase *penEnemy = (CEnemyBase *)pen;
					if (penEnemy->m_penBotTargeted!=NULL || penEnemy->m_bTemplate 
						|| penEnemy->m_bFrozen || !(penEnemy->GetFlags()&ENF_ALIVE)) { 
						continue; 
					}
					fCritterX = penEnemy->GetPlacement().pl_PositionVector(1);
					fCritterY = penEnemy->GetPlacement().pl_PositionVector(2);
					fCritterZ = penEnemy->GetPlacement().pl_PositionVector(3);
					if (fCritterX>m_fOriginX && fCritterX<m_fLimitX && fCritterZ<m_fOriginZ && fCritterZ>m_fLimitZ 
						&& fCritterY>fBotY-10.0f && fCritterY<fBotY+50.0f) { 
						fCritterDist = (penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector).Length();
						if (IsInFrustum1(penEnemy, CosFast(45.0f)) && fCritterDist<fDist) {
							fDist = fCritterDist;
							m_penEnemy = penEnemy;
						}
					}
				}
			}}
		}
		if (m_penEnemy==NULL) {
			fDist = 500.0f;
			{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
				CEntity *pen = iten;
				if (IsDerivedFromClass(pen, "Enemy Base")) {
					if (pen==m_penCurrent || IsOfClass(pen, "Devil")) { continue; }
					CEnemyBase *penEnemy = (CEnemyBase *)pen;
					if (penEnemy->m_penBotTargeted!=NULL || penEnemy->m_bTemplate 
						|| penEnemy->m_bFrozen || !(penEnemy->GetFlags()&ENF_ALIVE)) { 
						continue; 
					}
					fCritterX = penEnemy->GetPlacement().pl_PositionVector(1);
					fCritterY = penEnemy->GetPlacement().pl_PositionVector(2);
					fCritterZ = penEnemy->GetPlacement().pl_PositionVector(3);
					if (fCritterX>m_fOriginX && fCritterX<m_fLimitX && fCritterZ<m_fOriginZ && fCritterZ>m_fLimitZ 
						&& fCritterY>fBotY-10.0f && fCritterY<fBotY+50.0f) { 
						fCritterDist = (penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector).Length();
						if (IsInFrustum1(penEnemy, CosFast(90.0f)) && fCritterDist<fDist) {
							fDist = fCritterDist;
							m_penEnemy = penEnemy;
						}
					}
				}
			}}
		}
		if (m_penEnemy==NULL) {
			fDist = 500.0f;
			{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
				CEntity *pen = iten;
				if (IsDerivedFromClass(pen, "Enemy Base")) {
					if (pen==m_penCurrent || IsOfClass(pen, "Devil")) { continue; }
					CEnemyBase *penEnemy = (CEnemyBase *)pen;
					if (penEnemy->m_penBotTargeted!=NULL || penEnemy->m_bTemplate 
						|| penEnemy->m_bFrozen || !(penEnemy->GetFlags()&ENF_ALIVE)) { 
						continue; 
					}
					fCritterX = penEnemy->GetPlacement().pl_PositionVector(1);
					fCritterY = penEnemy->GetPlacement().pl_PositionVector(2);
					fCritterZ = penEnemy->GetPlacement().pl_PositionVector(3);
					if (fCritterX>m_fOriginX && fCritterX<m_fLimitX && fCritterZ<m_fOriginZ && fCritterZ>m_fLimitZ 
						&& fCritterY>fBotY-10.0f && fCritterY<fBotY+50.0f) { 
						fCritterDist = (penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector).Length();
						if (fCritterDist<fDist) {
							fDist = fCritterDist;
							m_penEnemy = penEnemy;
						}
					}
				}
			}}
		}
		if (m_penEnemy==NULL) {
			fDist = 500.0f;
			{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
				CEntity *pen = iten;
				if (IsDerivedFromClass(pen, "Enemy Base")) {
					if (pen==m_penCurrent || IsOfClass(pen, "Devil")) { continue; }
					CEnemyBase *penEnemy = (CEnemyBase *)pen;
					if (penEnemy->m_penBotTargeted!=NULL || penEnemy->m_bTemplate 
						|| penEnemy->m_bFrozen || !(penEnemy->GetFlags()&ENF_ALIVE)) { 
						continue; 
					}
					fCritterX = penEnemy->GetPlacement().pl_PositionVector(1);
					fCritterY = penEnemy->GetPlacement().pl_PositionVector(2);
					fCritterZ = penEnemy->GetPlacement().pl_PositionVector(3);
					if (fCritterX>m_fOriginX && fCritterX<m_fLimitX && fCritterZ<m_fOriginZ && fCritterZ>m_fLimitZ 
						&& fCritterY>fBotY-10.0f && fCritterY<fBotY+50.0f) { 
						if (IsOfClass(pen, "Summoner")) {
							CSummoner *penSummoner = (CSummoner *)pen;
							if (penSummoner->m_bVisible) {
								m_penEnemy = penSummoner;
								break;
							}
						}
					}
				}
			}}
		}
    //CPrintF("iCrittersCounted: %d\n", iCrittersCounted);
    if (m_penEnemy==NULL) {
			//CPrintF("m_penEnemy==NULL\n");
      m_fTargetTime = 0.0f;
    } else {
			if (m_penEnemy!=NULL) {
				((CEnemyBase *) m_penEnemy.ep_pen)->m_penBotTargeted = this;
			}
      m_fTargetTime = _pTimer->CurrentTick()+2.0f;
    }
  }

  /*void GetTarget(CEntity *penEnemy)
  {
    // pen the current target so we can get a new one
    if (m_penEnemy!=NULL) {
      m_penCurrent = m_penEnemy;
    }
    // null the target so we can get a new one
    m_penEnemy = NULL;
    FLOAT fBotY = GetPlacement().pl_PositionVector(2);
    INDEX iCrittersCounted = 0;
    FLOAT fCritterX = 0.0f;
    FLOAT fCritterY = 0.0f;
    FLOAT fCritterZ = 0.0f;
	  {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
        if (pen==m_penCurrent || IsOfClass(pen, "Devil")) { continue; }
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
        if (penEnemy->m_penBotTargeted!=NULL || penEnemy->m_bTemplate 
          || penEnemy->m_bFrozen || !(penEnemy->GetFlags()&ENF_ALIVE)) { 
          continue; 
        }
        fCritterX = penEnemy->GetPlacement().pl_PositionVector(1);
        fCritterY = penEnemy->GetPlacement().pl_PositionVector(2);
        fCritterZ = penEnemy->GetPlacement().pl_PositionVector(3);
        if (fCritterX>m_fOriginX && fCritterX<m_fLimitX && fCritterZ<m_fOriginZ && fCritterZ>m_fLimitZ 
          && fCritterY>fBotY-10.0f && fCritterY<fBotY+50.0f) { 
          if (iCrittersCounted>=4) { 
            break; 
          }
          FLOAT fDistToEnemy = DistanceTo(this, penEnemy);
          if (fDistToEnemy<50) {
            if (m_bFiring) {
              if (IsInFrustum1(penEnemy, CosFast(90.0f))) {
                iCrittersCounted++;
                if (IsVisible(penEnemy)) {
                  penEnemy->m_penBotTargeted = this;
                  m_penEnemy = penEnemy;
                  break;
                }
              }
            } else {
              iCrittersCounted++;
              if (IsVisible(penEnemy)) {
                penEnemy->m_penBotTargeted = this;
                m_penEnemy = penEnemy;
                break;
              }
            }
          } else if (fDistToEnemy<100) {
            if (m_bFiring) {
              if (IsInFrustum1(penEnemy, CosFast(90.0f))) {
                iCrittersCounted++;
                if (IsVisible(penEnemy)) {
                  penEnemy->m_penBotTargeted = this;
                  m_penEnemy = penEnemy;
                  break;
                }
              }
            } else {
              iCrittersCounted++;
              if (IsVisible(penEnemy)) {
                penEnemy->m_penBotTargeted = this;
                m_penEnemy = penEnemy;
                break;
              }
            }
          } else {
            if (m_bFiring) {
              if (IsInFrustum1(penEnemy, CosFast(90.0f))) {
                iCrittersCounted++;
                if (IsVisible(penEnemy)) {
                  penEnemy->m_penBotTargeted = this;
                  m_penEnemy = penEnemy;
                  break;
                }
              }
            } else {
              iCrittersCounted++;
              if (IsVisible(penEnemy)) {
                penEnemy->m_penBotTargeted = this;
                m_penEnemy = penEnemy;
                break;
              }
            }
          }
          if (IsOfClass(pen, "Summoner")) {
            CSummoner *penSummoner = (CSummoner *)pen;
            if (penSummoner->m_bVisible) {
              m_penEnemy = penSummoner;
              break;
            }
          }
        }

      }
    }}
    ////CPrintF("iCrittersCounted: %d\n", iCrittersCounted);
    if (m_penEnemy==NULL) {
      m_fTargetTime = 0.0f;
    } else {
      m_fTargetTime = _pTimer->CurrentTick()+1.0f;
    }
  }*/

  void GetItem(CEntity *penEntity)
  {
    m_penItem = NULL;
    // max distance in meters
    FLOAT fDist = 400.0f;
    //INDEX ctItems = 0;
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Item")) {
        if (IsOfClass(pen, "KeyItem")) {
          continue;
        }
        /*if (!GetSP()->sp_bInfiniteAmmo && (IsOfClass(pen, "Ammo Item") || IsOfClass(pen, "Ammo Pack"))) {
          continue;
        }*/
        if (IsOfClass(pen, "Ammo Item") || IsOfClass(pen, "Ammo Pack")) {
          continue;
        }
        CItem *penItem = (CItem *)pen;
        // if item has no target, respawns, or is not able to trigger skip it
        if (penItem->m_penTarget==NULL || penItem->m_bPickupOnce || penItem->m_bRespawn) { 
          continue; 
        }
        //ctItems++;
        // if it can be picked by a bot (has yet to be picked by anyone)
        if (penItem->m_bCanBeenPicked) {
          // get the items coords
          FLOAT fItemX = penItem->GetPlacement().pl_PositionVector(1);
          FLOAT fItemZ = penItem->GetPlacement().pl_PositionVector(3);
          // if it's in the area we can see in
          if (fItemX>m_fOriginX && fItemX<m_fLimitX && fItemZ<m_fOriginZ && fItemZ>m_fLimitZ) {
            FLOAT fDistToItem = DistanceTo(this, penItem);
            FLOAT fItemY = penItem->GetPlacement().pl_PositionVector(2);
            FLOAT fBotY = GetPlacement().pl_PositionVector(2);
            // if it's not too high, nor too low
            if (fDistToItem<fDist && fItemY>=fBotY-8 && fItemY<fBotY+8) {
              // if we can see it, is it the closest?
              if (IsVisible(penItem)) {
                fDist = fDistToItem;
                m_penItem = penItem;
                ////CPrintF("%s, Item: %s\n", m_strName, penItem->GetName());
              }
            }
          }
        }
      }
    }}
    ////CPrintF("ctItems: %d\n", ctItems);
  }

  INDEX CountEnemies(void)
  {
		INDEX iEnemies = 0;
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				if (penEnemy->m_bHasBeenSpawned) {
          iEnemies++;
        }
      }
    }}
    return iEnemies;
  }

  BOOL IsAlive(CEntity *penEnemy)
  {
		fHealth = 0.0f;
    if (penEnemy!=NULL) {
      fHealth = ((CEnemyBase&)*penEnemy).GetHealth();
    }
    if (fHealth>0 && penEnemy!=NULL) {
      return TRUE;
    } else {
      return FALSE;
    }
  }

  // calc distance to entity in one plane (relative to owner gravity)
  FLOAT CalcDistanceInPlane(FLOAT3D &vDesiredPosition) 
  { 
    // find vector from you to target in XZ plane
    FLOAT3D vNormal;
    GetNormalComponent(vDesiredPosition - GetPlacement().pl_PositionVector, en_vGravityDir, vNormal);
    return vNormal.Length();
  };

  // cast a ray to entity checking for all
  BOOL IsVisibleAll(CEntity *penEntity) 
  {
    // get ray source and target
    FLOAT3D vSource = FLOAT3D(0,2,0);
		FLOAT3D vTarget = FLOAT3D(0,2,0);
		if (penEntity!=NULL) {
			GetPositionCastRay(this, penEntity, vSource, vTarget);
			vSource(2) += 2.0f;
			vTarget(2) += 1.0f;
			// cast the ray
			CCastRay crRay(this, vSource, vTarget);
			crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;   // check for model collision box
			en_pwoWorld->CastRay(crRay);
			// if the ray hits wanted entity
			return crRay.cr_penHit==penEntity;
		}

		return FALSE;
  };


  // cast a ray to entity checking only for brushes
  BOOL IsVisible(CEntity *penEntity) 
  {
    // get ray source and target
    FLOAT3D vSource = FLOAT3D(0,2,0);
		FLOAT3D vTarget = FLOAT3D(0,2,0);
		if (penEntity!=NULL) {
			GetPositionCastRay(this, penEntity, vSource, vTarget);
			vSource(2) += 2.0f;
			vTarget(2) += 1.0f;
			// cast the ray
			CCastRay crRay(this, vSource, vTarget);
			crRay.cr_ttHitModels = CCastRay::TT_NONE;  // check for brushes only
			en_pwoWorld->CastRay(crRay);
			// if hit nothing (no brush) the entity can be seen
			return (crRay.cr_penHit==NULL); 
		}

		return FALSE;
  };

  // determine if you can see something in given direction
  BOOL IsInFrustum1(CEntity *penEntity, FLOAT fCosHalfFrustum) 
  {
    // get direction to the entity
    FLOAT3D vDelta =  penEntity->GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector;
    // find front vector
    FLOAT3D vFront = -GetRotationMatrix().GetColumn(3);
    // make dot product to determine if you can see target (view angle)
    FLOAT fDotProduct = (vDelta/vDelta.Length())%vFront;
    return fDotProduct >= fCosHalfFrustum;
  };

  // determine if you can see something in given direction
  BOOL IsInFrustum(FLOAT fCosHalfFrustum) 
  {
    // get direction to the entity
    FLOAT3D vDelta =  m_vDesiredPosition - GetPlacement().pl_PositionVector;
    // find front vector
    FLOAT3D vFront = -GetRotationMatrix().GetColumn(3);
    // make dot product to determine if you can see target (view angle)
    FLOAT fDotProduct = (vDelta/vDelta.Length())%vFront;
    return fDotProduct >= fCosHalfFrustum;
  };

  // cast a ray from current position
  void UpdateTargetingInfo(void)
  {
    // center of bot
    FLOAT3D vBase = GetPlacement().pl_PositionVector;
    vBase += FLOAT3D(0, 2, 0);
    //CPrintF("Position: (%.2f, %.2f, %.2f)\n", GetPlacement().pl_PositionVector(1), 
     // GetPlacement().pl_PositionVector(2), GetPlacement().pl_PositionVector(3));
		if (m_bUseSpecialLevelInfo) {
			FLOAT fZ = GetPlacement().pl_PositionVector(3);
			if (m_iLevelIndex==1) {
				//CPrintF("UpdateTargetingInfo(), fZ = %.0f\n", fZ);
				m_fOriginX = -108.0f;
				m_fLimitX = 108.0f;
				if (fZ>820) { // first area
					////CPrintF("First Area\n");
					m_fOriginZ = 1020.0f;
					m_fLimitZ = 820.0f;
				} else {
					m_fOriginZ = 820.0f;
					m_fLimitZ = 575.0f;
				}
			}
		} else {
			// create a set of rays to test for collision with brushes
			FLOAT3D vDest, vRayHit;
			FLOAT fA = 180.0f;
			FLOAT fD = 400.0f;
			FLOAT fDist = fD;
			m_fMaxDistance = 0.0f;

			// for each ray
			for (INDEX i=0; i<4; i++) {
				vDest = vBase+FLOAT3D(CosFast(fA)*fD, 20, SinFast(fA)*fD);
				CCastRay crRay(this, vBase, vDest);
				crRay.cr_ttHitModels = CCastRay::TT_NONE; 
				GetWorld()->CastRay(crRay);
				vRayHit = crRay.cr_vHit;
				// if hit something
				if (crRay.cr_penHit!=NULL) {
					fDist = crRay.cr_fHitDistance;
					if (crRay.cr_fHitDistance>m_fMaxDistance) {
						m_fMaxDistance = crRay.cr_fHitDistance;
					}
					if (i==0) { // min X
						m_fOriginX = vRayHit(1)-4.0f;
					} else if (i==1) { // max Z
						m_fOriginZ = vRayHit(3)+4.0f;
					} else if (i==2) { // max X
						m_fLimitX = vRayHit(1)+4.0f;
					} else { // min Z
						m_fLimitZ = vRayHit(3)-4.0f;
					}
					//CPrintF("vRayHit - %d: (%.2f, %.2f, %.2f)\n", i, vRayHit(1), vRayHit(2), vRayHit(3));
				} else {
					m_fMaxDistance = fDist = fD;
					if (i==0) {
						m_fOriginX = GetPlacement().pl_PositionVector(1)-400.0f;
					} else if (i==1) {
						m_fOriginZ = GetPlacement().pl_PositionVector(3)+400.0f;
					} else if (i==2) {
						m_fLimitX = GetPlacement().pl_PositionVector(1)+400.0f;
					} else {
						m_fLimitZ = GetPlacement().pl_PositionVector(3)-400.0f;
					}
				}
				//CPrintF("%d -- m_fMaxDistance: %.2f, fDist: %.2f\n", i, m_fMaxDistance, fDist);      
				fA -= 90.0f;
			}
		}
    //CPrintF("m_fOriginX: %.0f, m_fLimitX: %.0f, m_fOriginZ: %.0f, m_fLimitZ: %.0f\n\n", m_fOriginX, m_fLimitX, m_fOriginZ, m_fLimitZ);
  }

/************************************************************
 *                    MOVING FUNCTIONS                      *
 ************************************************************/

  // set desired rotation and translation to go/orient towards desired position
  void SetDesiredMovement(void) 
  {   
    // if we may rotate
    if (m_aRotateSpeed>0.0f) {
      // get delta to desired position
      FLOAT3D vDelta = m_vDesiredPosition - GetPlacement().pl_PositionVector;
      // get desired heading orientation
      FLOAT3D vDir = vDelta;
      vDir.SafeNormalize();
      ANGLE aWantedHeadingRelative = GetRelativeHeading(vDir);
      // normalize it to [-180,+180] degrees
      aWantedHeadingRelative = NormalizeAngle(aWantedHeadingRelative);
      ////CPrintF("aWantedHeadingRelative: %g\n", aWantedHeadingRelative);
      ANGLE aHeadingRotation;
      // keep just the adjusting fraction of speed 
      aHeadingRotation = aWantedHeadingRelative/m_fMoveFrequency;
      // start rotating
      SetDesiredRotation(ANGLE3D(aHeadingRotation, 0, 0));
    // if we may not rotate
    } else {
      // stop rotating
      SetDesiredRotation(ANGLE3D(0, 0, 0));
    }

    // if we may move
    if (m_fMoveSpeed!=0.0f) {
      // if swimming
      if (m_bSwimming) {
        // fix translation for 3d movement
        FLOAT3D vTranslation = (m_vDesiredPosition - GetPlacement().pl_PositionVector) * !en_mRotation;
        vTranslation(1) = 0.0f;
        if (vTranslation(3)>0) { 
          vTranslation(3) = 0.0f;
        }
        vTranslation.Normalize();
        vTranslation *= m_fMoveSpeed;
        // start moving
        SetDesiredTranslation(vTranslation);
      } else {
        // determine translation speed
        FLOAT3D vTranslation(0.0f, 0.0f, 0.0f);
        vTranslation(3) = -m_fMoveSpeed;
				if (m_bJump) {
					//vTranslation(2) = 11.0f;
					SetDesiredTranslation(FLOAT3D(0, 11.0f, 0));
					JumpStartAnim();
					m_bJump = FALSE;
					m_bInAir = TRUE;
					m_fAirTime = _pTimer->CurrentTick() + 0.2f;
				}
        // start moving
        SetDesiredTranslation(vTranslation);
      }
    // if we may not move
    } else {
      // stop translating
			if (m_bJump) {
				SetDesiredTranslation(FLOAT3D(0, 11.0f, 0));
				JumpStartAnim();
				m_bJump = FALSE;
				m_bInAir = TRUE;
				m_fAirTime = _pTimer->CurrentTick() + 0.2f;
			} else {
				SetDesiredTranslation(FLOAT3D(0, 0, 0));
			}
    }
  };

  void FollowingActions(void) 
  {
    // get owner's position    
    if (m_penOwner!=NULL) {
			m_vDesiredPosition = m_penOwner->GetPlacement().pl_PositionVector;
		}

    FLOAT fDistToOwner = 10.0f;

    if (m_bSwimming) {
      fDistToOwner = (m_vDesiredPosition - GetPlacement().pl_PositionVector).Length();
    } else {
      fDistToOwner = CalcDistanceInPlane(m_vDesiredPosition);
    }

		if (_pTimer->CurrentTick()>m_tmFollowPause) {
			// too far away?  just teleport to owner
			if (fDistToOwner>400) {
				TeleportEntity(this, CPlacement3D(m_vDesiredPosition+FLOAT3D(0, 2.5f, 0), GetPlacement().pl_OrientationAngle));
			// far enough away to move towards, do it
			} else if (fDistToOwner>10) {
				// adjust direction and speed          
				m_fMoveSpeed = m_fCurrentSpeed;
				m_aRotateSpeed = 5000.0f;
				// move towards owner
				 m_botState = BOT_FOLLOWING;
				m_bCanTeleport = TRUE;
			} else if (fDistToOwner<=10 && fDistToOwner>5) {
			// if close enough stop, rotate if needed, and stand
				m_fMoveSpeed = 0.0f;
				if (IsInFrustum(CosFast(40.0f))) {
					m_aRotateSpeed = 0.0f;
					m_botState = BOT_STANDING;
				} else {
					m_aRotateSpeed = 5000.0f;
					m_botState = BOT_ROTATING;
				}
				m_iFollowCount = 0;
				m_bCanTeleport = FALSE;
			// back up
			} else {
				// adjust direction and speed          
				m_fMoveSpeed = -m_fCurrentSpeed;
				m_aRotateSpeed = 5000.0f;
				// move towards owner
				//m_botState = BOT_BACKPEDAL;
				if (IsInFrustum(CosFast(30.0f))) {
					m_aRotateSpeed = 0.0f;
					m_botState = BOT_BACKPEDAL;
				} else {
					m_aRotateSpeed = 5000.0f;
					m_botState = BOT_ROTATING;
				}
				m_bCanTeleport = FALSE;
			}
		} else {
			m_fMoveSpeed = 0.0f;
			m_aRotateSpeed = 0.0f;
			m_botState = BOT_STANDING;
		}

    SetDesiredMovement();

		// do a random jump every now and then
		if (!m_bSwimming) {
			FLOAT fRndJump = FRnd();
			if (fRndJump > 0.98f) {
				m_bJump = TRUE;
			}
		}

		// if not currently jumping, get our proper animation
    if (!m_bInAir) {
			GetAnimation();
		}
      
    if (IsInFrustum(CosFast(30.0f))) {  
      HeadOrientation();
    }

  }

  void ItemActions(void) 
  {		
		//m_bJump = FALSE;
		/*if (m_fAirTime<_pTimer->CurrentTick()) {
			m_bInAir = FALSE;
		}*/
    // get Item's position 
		if (m_penItem!=NULL) {
			m_vDesiredPosition = m_penItem->GetPlacement().pl_PositionVector;
		}

    // adjust direction and speed          
    m_fMoveSpeed = m_fCurrentSpeed;
    m_aRotateSpeed = 5000.0f;

    // move towards item
    m_botState = BOT_FOLLOWING;

    m_bCanTeleport = FALSE;

    SetDesiredMovement();

		// do a random jump every now and then
		if ((m_vDesiredPosition-GetPlacement().pl_PositionVector).Length()>50.0f) {
			INDEX iRndJump = IRnd()%50;
			if (iRndJump == 0) {
				m_bJump = TRUE;
			}
		}

		// if not currently jumping, get our proper animation
    if (!m_bInAir) {
			GetAnimation();
		}
      
    BodyAndHeadOrientation();

    if (m_penItem!=NULL) {
      if ( ((CItem&)*m_penItem).m_bCanBeenPicked==FALSE ) {
        m_penItem = NULL;
      }
    }

    m_ctCkVisiblity1++;
    if (m_ctCkVisiblity1>=20 && m_penItem!=NULL) {
      if (!IsVisible(m_penItem)) {
        m_penItem = NULL;
      }
      m_ctCkVisiblity1 = 0;
    }

  }

  void WaitForAction(void) 
  {		
		// look straight ahead
    FLOATmatrix3D m;
    MakeRotationMatrixFast(m, GetPlacement().pl_OrientationAngle);
		m_vDesiredPosition = GetPlacement().pl_PositionVector - m.GetColumn(3)*5.0f;

    // stop and stand          
    m_fMoveSpeed = 0.0f;
    m_aRotateSpeed = 0.0f;
    m_botState = BOT_STANDING;

    m_bCanTeleport = FALSE;

		// maybe do a random jump every now and then
		INDEX iRndJump = IRnd()%80;
		if (iRndJump == 0) {
			m_bJump = TRUE;
		}

    SetDesiredMovement();

		// if not currently jumping, get our proper animation
    if (!m_bInAir) {
			GetAnimation();
		}
      
    BodyAndHeadOrientation();
  }

  void AttackingActions(void) 
  {		
		//m_bJump = FALSE;
    // get enemy's postition
		if (m_penEnemy!=NULL) {
			m_vDesiredPosition = m_penEnemy->GetPlacement().pl_PositionVector;
		}

    FLOAT fDistance = 10.0f;
    if (m_bSwimming) {
      fDistance = (m_vDesiredPosition-GetPlacement().pl_PositionVector).Length();
      if (fDistance>5) {
        m_fMoveSpeed = m_fCurrentSpeed;
        m_aRotateSpeed = 1000.0f;
				m_botState = BOT_FIRING;
      } else {
        m_fMoveSpeed = 0.0f;
        m_aRotateSpeed = 1000.0f;
				m_botState = BOT_ROTATING;
      }
    } else {
      fDistance = CalcDistanceInPlane(m_vDesiredPosition);
      if (fDistance>30) {
        m_fMoveSpeed = m_fCurrentSpeed;
        m_aRotateSpeed = 1000.0f;
				m_botState = BOT_FIRING;
      } else {
        m_fMoveSpeed = 0.0f;
        m_aRotateSpeed = 1000.0f;
				m_botState = BOT_ROTATING;
      }
    }
    
    m_iFollowCount = 0;
    m_bCanTeleport = FALSE;

		// do a random jump every now and then
		INDEX iRndJump = IRnd()%50;
		if (iRndJump == 0) {
			m_bJump = TRUE;
		}

    SetDesiredMovement();

		// if not currently jumping, get our proper animation
    if (!m_bInAir) {
			GetAnimation();
		}

    if (IsInFrustum(CosFast(60.0f))) {  
      BodyAndHeadOrientation();
    }

  }

/************************************************************
 *                       F I R E                            *
 ************************************************************/

  void Fire(void) {
    if (m_btType==BT_SNIPER) {      
      FireBullet();
			FireTracer();
			m_fReactionTime = _pTimer->CurrentTick()+m_fFireFrequency;
    } else {
      FLOAT3D vGunPosAbs = GetPlacement().pl_PositionVector + FLOAT3D(0.0f, 1.5f, 0.0f)*GetRotationMatrix();
      FLOAT3D vEnemySpeed = FLOAT3D(0,0,0);
			FLOAT3D vEnemyPos = FLOAT3D(0,0,0);
			if (m_penEnemy!=NULL) {
				vEnemySpeed =((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
				vEnemyPos = ((CMovableEntity&) *m_penEnemy).GetPlacement().pl_PositionVector;
			}
      FLOAT   fSpeed  = 400.0f; // m/s
      FLOAT3D vPredictedEnemyPosition = CalculatePredictedPosition(vGunPosAbs,
        vEnemyPos, fSpeed, vEnemySpeed, GetPlacement().pl_PositionVector(2) );
      // fire bomb or rocket
      if (m_btType==BT_BOMBER) {
        // do fire animation
        FireAnim();
        ShootPredictedProjectile(PRT_BOT_BOMB, vPredictedEnemyPosition, FLOAT3D(0.0f, 1.5f, 0.0f), ANGLE3D(0, 0, 0));
        m_fReactionTime = _pTimer->CurrentTick()+m_fFireFrequency;
      } else {
        if (IsDerivedFromClass(m_penEnemy, "Woman")) {
          m_penHoming = m_penEnemy;
          ShootProjectileAt(m_penHoming->GetPlacement().pl_PositionVector, 
            PRT_BOT_HOMING_ROCKET, FLOAT3D(0.13f, 1.5f, -0.85f), ANGLE3D(m_fFireAngle, 0, 0));
          bGetNewTarget = TRUE;
          m_fReactionTime = _pTimer->CurrentTick()+(m_fFireFrequency*2);
        } else {
          ShootPredictedProjectile(PRT_BOT_ROCKET, vPredictedEnemyPosition, FLOAT3D(0.0f, 1.5f, 0.0f), ANGLE3D(0, 0, 0));
          m_fReactionTime = _pTimer->CurrentTick()+m_fFireFrequency;
        }
      }
    }
    //m_fReactionTime = _pTimer->CurrentTick()+m_fFireFrequency;
  }

procedures:
    
/************************************************************
 *                A C T I V E   A C T I O N S               *
 ************************************************************/

  // think and move
  Active(EVoid) 
  {
    while (TRUE) {  

			// if owner doesn't exist anymore
			if( m_penOwner==NULL) {
				// kill ourselves
				SendEvent(EDeath());
			}
      
      // if we need a new enemy.... get one
      if (m_penEnemy==NULL && CountEnemies()>0) {
        GetTarget(m_penEnemy);
      }

      // if we have an enemy, can we see it?
      if (m_penEnemy!=NULL) {
				// if not, dump it...
				if (!IsVisible(m_penEnemy)) {
					((CEnemyBase *) m_penEnemy.ep_pen)->m_penBotTargeted = NULL;
					m_penEnemy = NULL;
				}
			}

      // if we have an enemy move towards it and fire
      if (m_penEnemy!=NULL) {
        m_bFiring = TRUE;
        m_penHoming = NULL;
        // get actions and animations
        AttackingActions();
        // if needed, turn on flare
        if (m_btType==BT_SNIPER) {
          // spin up
          while (m_aMiniGunSpeed<200) {
            // every tick
            autowait(0.05f);
            // get actions and animations
            AttackingActions();
            // increase speed
            m_aMiniGunLast = m_aMiniGun;
            m_aMiniGun += m_aMiniGunSpeed*0.1f;
            m_aMiniGunSpeed += 10;
            RotateMinigun();
          }
          // do fire animation
          FireAnim();
          FlareOn();
          m_aMiniGunSpeed = 200;
        } else if (m_btType==BT_ROCKETER) {
          // do fire animation
          FireAnim();
        }
        while (m_penEnemy!=NULL && IsAlive(m_penEnemy) && _pTimer->CurrentTick()<m_fTargetTime) {
					if (_pTimer->CurrentTick()>m_fReactionTime) {
						if (IsInFrustum(CosFast(30.0f))) {
							Fire();
							// spin
							if (m_btType==BT_SNIPER) {
								m_aMiniGunLast = m_aMiniGun;
								m_aMiniGun += m_aMiniGunSpeed*0.1f;
								RotateMinigun();
							}
						}
					}
          autowait(0.05f);
          // get actions and animations
          AttackingActions();
        }
        if (m_penEnemy!=NULL) {
          ((CEnemyBase *) m_penEnemy.ep_pen)->m_penBotTargeted = NULL;
        }
        if (CountEnemies()>0 || _pTimer->CurrentTick()>=m_fTargetTime) {
					m_fReactionTime = _pTimer->CurrentTick()+m_fFireFrequency;
					while (_pTimer->CurrentTick()>m_fReactionTime) {
						autowait(0.05f);
						// get actions and animations
						AttackingActions();
					}
          GetTarget(m_penEnemy);
        }
        m_bFiring = FALSE;
        // if sniper, turn off flare
        if (m_btType==BT_SNIPER) {
          FlareOff(); 
        }
        // stop fire animation
        StopFireAnim();
        // set pause before following owner
        m_tmFollowPause = _pTimer->CurrentTick() + 2.0f;
      // if we have an item to pick up
      } else if (m_penItem!=NULL) {
        m_bFiring = FALSE;
        ItemActions();
      // nothing to do? follow owner
      } else if (m_penOwner!=NULL && _pTimer->CurrentTick()>m_tmFollowPause) {
        m_bFiring = FALSE;
        FollowingActions();
      } else {
        m_bFiring = FALSE;
        WaitForAction();
			}
      if (m_btType==BT_SNIPER) { 
        if (m_aMiniGunSpeed>0) {
          // spin down
          m_aMiniGunLast = m_aMiniGun;
          m_aMiniGun += m_aMiniGunSpeed*0.1f;
          m_aMiniGunSpeed -= 7;
          RotateMinigun();
        } else if (m_aMiniGunSpeed<=0) {
          m_aMiniGunSpeed = 0;
        }     
      }

      // wait a bit
      autowait(0.05f);
    }
  };

  // react to outside influences
  StandardBehavior()
  {
    // this is the main loop for catching events
    wait() {
      // set initial properties
      on (EBegin) : {
        m_penEnemy = NULL;
        m_penItem = NULL;
        StandingAnim();
        m_botState = BOT_STANDING;
        m_bSwimming = FALSE;
        m_bFiring = FALSE;
        if (m_btType==BT_SNIPER) {
          FlareOff();
        }
				//SpawnDependents();

        // set sound default parameters
        m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
        // call Active() but keep this procedure active to catch events
        call Active();
      };
      on (ETouch eTouch) : {
        // support for jumping using bouncers
        if (IsOfClass(eTouch.penOther, "Bouncer")) {
          JumpFromBouncer(this, eTouch.penOther);
        }
        // if enemy touches us, inflict range damage
        if (IsDerivedFromClass(eTouch.penOther, "Enemy Base")) {
          InflictRangeDamage(this, DMT_EXPLOSION, 1000.0f, GetPlacement().pl_PositionVector+FLOAT3D(0, 1.5f, 0), 4.0f, 6.0f);
        }
				// jump if something is in our way
        if (eTouch.penOther->GetRenderType()==CEntity::RT_BRUSH) {
          FLOAT3D vDir = en_vDesiredTranslationRelative;
          vDir.SafeNormalize();
          vDir*=GetRotationMatrix();
          if ((eTouch.plCollision%vDir)<-0.5f && m_botState!=BOT_BACKPEDAL) {
            CEntity *pen = this;
            CMovableEntity *pmen = (CMovableEntity *)pen;
            FLOAT3D vDir;
            AnglesToDirectionVector(ANGLE3D(0,90,0), vDir);
            FakeJump(pmen->en_vIntendedTranslation, vDir, 10.0f, 0.0f, 1.0f, 200.0f, 5.0f);
          }
					if (m_bInAir && m_fAirTime < _pTimer->CurrentTick()) {
						JumpEndAnim();
						m_bInAir = FALSE;
					} 
          resume;
        }
        resume;
      }
      // if our owner picks up a serious speed when we have none, start it now 
      on (EStop) : {
        m_tmSeriousSpeed = _pTimer->CurrentTick()+120.0f;
        resume;
      }
      // if owner already has serious speed, just add it to current
      on (EStart) : {
        m_tmSeriousSpeed += 120.0f;
        resume;
      }
      // if our owner picks up a serious damage when we have none, start it now
      on (EStopAttack) : {
        m_tmSeriousDamage = _pTimer->CurrentTick()+120.0f;
        resume;
      }
      // if owner already has serious damage, just add it to current
      on (EStartAttack) : {
        m_tmSeriousDamage += 120.0f;
        resume;
      }
      // if we are no longer needed (owner leaves game)
      on (EDeath) : {
				////CPrintF("EDeath\n");
				// destroy our dependents
        DestroyDependents();
        // then destroy ourself
        Destroy();
        resume;
      }
			/*on (EPreLevelChange) : {
				//CPrintF("EPreLevelChange\n");
				// destroy our dependents
        DestroyDependents();
        // then destroy ourself
        Destroy();
        m_penEnemy = NULL;
        m_penItem = NULL;
        StandingAnim();
        m_botState = BOT_STANDING;
        m_bSwimming = FALSE;
        m_bFiring = FALSE;
        if (m_btType==BT_SNIPER) {
          FlareOff();
        }
				// stop all movements
				SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
				SetDesiredRotation(ANGLE3D(0.0f, 0.0f, 0.0f));
				// destroy our dependents, fuckin level change BS
				//DestroyDependents();
				resume;
			}*/
      /*on (EPostLevelChange) : { 
        //CPrintF("EPostLevelChange\n");
				CTString strLevelName= _pNetwork->ga_fnmWorld.FileName();
				if (strLevelName=="08_Suburbs") {
					m_bUseSpecialLevelInfo = m_bSkipVisibilityCheck = TRUE;
					m_iLevelIndex = 1;
				}
        m_penEnemy = NULL;
        m_penItem = NULL;
        StandingAnim();
        m_botState = BOT_STANDING;
        m_bSwimming = FALSE;
        m_bFiring = FALSE;
        if (m_btType==BT_SNIPER) {
          FlareOff();
        }
				// stop all movements
				SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
				SetDesiredRotation(ANGLE3D(0.0f, 0.0f, 0.0f));
				// create new dependents since we had to destroy the old ones cause they'll crash us ??
				//SpawnDependents();
        // set sound default parameters
        m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
        resume; 
      }
			on (EJump) : {
				if (!m_bInAir && m_penItem==NULL && m_penEnemy==NULL) {
					m_bJump = TRUE;
				}
				resume;
			}*/
    }
  };


/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/

  Main(EVoid) {

    // if owner doesn't exist (could be destroyed in initialization)
    if( m_penOwner==NULL) {
      // don't do anything
      Destroy();
      return;
    }

    // declare yourself as a model
    InitAsModel(); // we can be seen
    SetPhysicsFlags(EPF_MODEL_WALKING); // we can move around
    SetCollisionFlags(ECF_MODEL); // we collide with our surroundings
    SetFlags(GetFlags()|ENF_ALIVE|ENF_NOTIFYLEVELCHANGE); // we are considered alive by AI
    // set entity properties
    //en_tmMaxHoldBreath = 5.0f; // we can be in water for 5 secs then we start receiving damage
    en_fDensity = 2000.0f; // we have to have enough density to behave properly in gravity situations
    en_fStepDnHeight = -1; // this means we can step off edges (fall)
    en_fStepUpHeight = 5.0f; // this means we can jump up 5 meters if we need to, set this too high and we do weird stuff on steps
    en_fAcceleration = 100.0f; // we accelerate pretty fast
    en_fDeceleration = 150.0f; // we decelerate really fast

    // set speed the same the owner's
    m_fRealSpeed = 20.0f*GetSP()->sp_fSpeedAdjuster;
    m_fMoveFrequency = 0.1f;
    FLOAT fBotSkill = GetSP()->sp_fBotSkill;
    Clamp(fBotSkill, 1.0f, 10.0f);
		//fBotSkill *= 4;
    m_fReactionTime = 0.05f;
    m_tmFindItem = _pTimer->CurrentTick()+5.0f;
    m_bFiring = FALSE;
    m_fDamageAmount = GetSP()->sp_fWeaponsDamage;

    // set appearance, firing speed, name, and add common attachments
    SetModel(MODEL_PLAYER);  
		//m_btType = BT_ROCKETER;
    if (m_btType==BT_SNIPER) {
      fMaxY = 60.0f;
      m_fFireFrequency = 0.05f*fBotSkill;
      m_aMiniGun = 0;
      m_aMiniGunLast = 0;
      m_aMiniGunSpeed = 0;
      m_strName = "Betty Badass";
			m_strViewName = "Betty";
      SetModelMainTexture(TEXTURE_PLAYER_BLACK);
      AddAttachment(PLAYER_ATTACHMENT_TORSO, MODEL_BODY, TEXTURE_PLAYER_BLACK);
      AddAttachmentModel(GetBody(), BODY_ATTACHMENT_HEAD, MODEL_HEAD, TEXTURE_HEAD_BLACK, 0, 0, 0);
    } else if (m_btType==BT_ROCKETER) {
      fMaxY = 60.0f;
      m_fFireFrequency = 0.05f*fBotSkill;
      m_strName = "Annie Annihlator";
			m_strViewName = "Annie";
      SetModelMainTexture(TEXTURE_PLAYER);
      AddAttachment(PLAYER_ATTACHMENT_TORSO, MODEL_BODY, TEXTURE_PLAYER);
      AddAttachmentModel(GetBody(), BODY_ATTACHMENT_HEAD, MODEL_HEAD, TEXTURE_HEAD, 0, 0, 0);
    } else {
      fMaxY = 60.0f;
      m_fFireFrequency = 0.05f*fBotSkill;
      m_strName = "Sally Slaughter";
			m_strViewName = "Sally";
      SetModelMainTexture(TEXTURE_PLAYER_RED);
      AddAttachment(PLAYER_ATTACHMENT_TORSO, MODEL_BODY, TEXTURE_PLAYER_RED);
      AddAttachmentModel(GetBody(), BODY_ATTACHMENT_HEAD, MODEL_HEAD, TEXTURE_HEAD, 0, 0, 0);
    }

    // add weapon attachments, piece by piece....
    CPlayerBot &pl = (CPlayerBot&)*this;
    pmoModel = &(pl.GetModelObject()->GetAttachmentModel(PLAYER_ATTACHMENT_TORSO)->amo_moModelObject);
    if (m_btType==BT_SNIPER) {
      AddWeaponAttachment(BODY_ATTACHMENT_MINIGUN, MODEL_MINIGUN, TEXTURE_MG_BODY, 0, 0, 0);
      SetAttachment(BODY_ATTACHMENT_MINIGUN);
      AddWeaponAttachment(MINI2GUNITEM_ATTACHMENT_BODY, MODEL_MG_BODY, TEXTURE_MG_BODY, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);          
			AddWeaponAttachment(MINI2GUNITEM_ATTACHMENT_BARRELS01, MODEL_MG_BARRELS01, TEXTURE_MG_BARRELS, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0); 
      AddWeaponAttachment(MINI2GUNITEM_ATTACHMENT_BARRELS02, MODEL_MG_BARRELS02, TEXTURE_MG_BARRELS, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0); 
			AddWeaponAttachment(MINI2GUNITEM_ATTACHMENT_ENGINE, MODEL_MG_ENGINE, TEXTURE_MG_BARRELS, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);      
      SetAttachment(MINI2GUNITEM_ATTACHMENT_BODY);
      AddWeaponAttachment(BODY_ATTACHMENT_FLARE01, MODEL_FLARE02, TEXTURE_FLARE02, 0.13, 0,  0);
      AddWeaponAttachment(BODY_ATTACHMENT_FLARE02, MODEL_FLARE02, TEXTURE_FLARE02, -0.13, 0, 0);
    } else if (m_btType==BT_ROCKETER) {
      AddWeaponAttachment(BODY_ATTACHMENT_ROCKET_LAUNCHER, MODEL_ROCKETLAUNCHER, TEXTURE_RL_BODY, 0, 0, 0);
      SetAttachment(BODY_ATTACHMENT_ROCKET_LAUNCHER);
      AddWeaponAttachment(ROCKETLAUNCHERITEM_ATTACHMENT_BODY, MODEL_RL_BODY, TEXTURE_RL_BODY, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
      AddWeaponAttachment(ROCKETLAUNCHERITEM_ATTACHMENT_ROTATINGPART, MODEL_RL_ROTATINGPART, TEXTURE_RL_ROTATINGPART, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
      AddWeaponAttachment(ROCKETLAUNCHERITEM_ATTACHMENT_ROCKET1, MODEL_RL_ROCKET, TEXTURE_RL_ROCKET, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
      AddWeaponAttachment(ROCKETLAUNCHERITEM_ATTACHMENT_ROCKET2, MODEL_RL_ROCKET, TEXTURE_RL_ROCKET, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
      AddWeaponAttachment(ROCKETLAUNCHERITEM_ATTACHMENT_ROCKET3, MODEL_RL_ROCKET, TEXTURE_RL_ROCKET, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
      AddWeaponAttachment(ROCKETLAUNCHERITEM_ATTACHMENT_ROCKET4, MODEL_RL_ROCKET, TEXTURE_RL_ROCKET, TEX_REFL_LIGHTMETAL01, TEX_SPEC_MEDIUM, 0);
    } else {
      AddWeaponAttachment(BODY_ATTACHMENT_KNIFE, MODEL_BOMB, TEXTURE_BOMB, TEX_REFL_DARKMETAL, TEX_SPEC_MEDIUM, 0);
    }

		SpawnDependents();

		// see if we need to do anything special on this level..
		/*CTString strLevelName= _pNetwork->ga_fnmWorld.FileName();
		if (strLevelName=="08_Suburbs") {
			//CPrintF("MainLevelCk\n");
			m_bUseSpecialLevelInfo = m_bSkipVisibilityCheck = TRUE;
			m_iLevelIndex = 1;
		}*/

    // jump to event handling loop, never to return..........
    jump StandardBehavior();

  };
};
