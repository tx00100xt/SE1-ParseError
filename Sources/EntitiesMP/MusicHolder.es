/* Copyright (c) 2002-2012 Croteam Ltd. 
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

222
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/EnemyBase.h"
#include "EntitiesMP/EnemySpawner.h"
#include "EntitiesMP/Trigger.h"
#include "EntitiesMP/Woman.h"
#include "EntitiesMP/OverLord.h"
#include "EntitiesMP/KeyItem.h"
#include "EntitiesMP/Item.h"
#include "EntitiesMP/Copier.h"
#include "EntitiesMP/MovingBrush.h"
#include "EntitiesMP/WorldBase.h"
#include "EntitiesMP/PlayerActionMarker.h"
#include "EntitiesMP/WorldLink.h"
#include "EntitiesMP/PyramidSpaceShip.h"
#include "EntitiesMP/PyramidSpaceShipMarker.h"
#include "EntitiesMP/PESpawnBattery.h"
#include "EntitiesMP/TouchField.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
#include "EntitiesMP/BackgroundViewer.h"
#include "EntitiesMP/TemplateCreatorEG.h"
#include "EntitiesMP/Light.h"
#include "EntitiesMP/Common/LightFixes.h"
#include "EntitiesMP/WeaponItem.h"
extern CTString gam_strGameSpyExtras;
%}

enum MusicType {
  0 MT_LIGHT  "light",
  1 MT_MEDIUM "medium",
  2 MT_HEAVY  "heavy",
  3 MT_EVENT  "event",
  4 MT_CONTINUOUS  "continuous",
};

event EChangeMusic {
  enum MusicType mtType,
  CTFileName fnMusic,
  FLOAT fVolume,
  BOOL bForceStart,
};

%{
#define MUSIC_VOLUMEMIN   0.02f     // minimum volume (considered off)
#define MUSIC_VOLUMEMAX   0.98f     // maximum volume (considered full)

float FadeInFactor(TIME fFadeTime)
{
  return (float) pow(MUSIC_VOLUMEMAX/MUSIC_VOLUMEMIN, 1/(fFadeTime/_pTimer->TickQuantum));
}
float FadeOutFactor(TIME fFadeTime)
{
  return (float) pow(MUSIC_VOLUMEMIN/MUSIC_VOLUMEMAX, 1/(fFadeTime/_pTimer->TickQuantum));
}
%}

class CMusicHolder : CRationalEntity {
name      "MusicHolder";
thumbnail "Thumbnails\\MusicHolder.tbn";
features "HasName", "IsTargetable", "IsImportant";

properties:
  1 CTString m_strName     "" = "MusicHolder",
  2 FLOAT m_fScoreMedium "Score Medium" = 100.0f,
  3 FLOAT m_fScoreHeavy  "Score Heavy"  = 1000.0f,

 10 CTFileName m_fnMusic0 "Music Light" 'M' = CTFILENAME(""),
 11 CTFileName m_fnMusic1 "Music Medium"    = CTFILENAME(""),
 12 CTFileName m_fnMusic2 "Music Heavy"     = CTFILENAME(""),
 13 CTFileName m_fnMusic3                   = CTFILENAME(""),  // event music
 14 CTFileName m_fnMusic4                   = CTFILENAME(""),  // continuous music

 20 FLOAT m_fVolume0  "Volume Light" 'V' = 1.0f,
 21 FLOAT m_fVolume1  "Volume Medium"    = 1.0f,
 22 FLOAT m_fVolume2  "Volume Heavy"     = 1.0f,
 23 FLOAT m_fVolume3                     = 1.0f,  // event volume
 24 FLOAT m_fVolume4                     = 1.0f,  // continuous volume

// internals

100 CEntityPointer m_penBoss,    // current boss if any
102 CEntityPointer m_penCounter,   // enemy counter for wave-fight progress display
104 INDEX m_ctEnemiesInWorld = 0,   // count of total enemies in world
105 CEntityPointer m_penRespawnMarker,    // respawn marker for coop
106 INDEX m_ctSecretsInWorld = 0,   // count of total secrets in world
101 FLOAT m_tmFade = 1.0f,    // music cross-fade speed
103 enum MusicType m_mtCurrentMusic = MT_LIGHT, // current active channel

// for cross-fade purposes
110 FLOAT m_fCurrentVolume0a  = 1.0f,
210 FLOAT m_fCurrentVolume0b  = 1.0f,
111 FLOAT m_fCurrentVolume1a  = 1.0f,
211 FLOAT m_fCurrentVolume1b  = 1.0f,
112 FLOAT m_fCurrentVolume2a  = 1.0f,
212 FLOAT m_fCurrentVolume2b  = 1.0f,
113 FLOAT m_fCurrentVolume3a  = 1.0f,
213 FLOAT m_fCurrentVolume3b  = 1.0f,
114 FLOAT m_fCurrentVolume4a  = 1.0f,
214 FLOAT m_fCurrentVolume4b  = 1.0f,

// the music channels
120 CSoundObject m_soMusic0a,
220 CSoundObject m_soMusic0b,
121 CSoundObject m_soMusic1a,
221 CSoundObject m_soMusic1b,
122 CSoundObject m_soMusic2a,
222 CSoundObject m_soMusic2b,
123 CSoundObject m_soMusic3a,
223 CSoundObject m_soMusic3b,
124 CSoundObject m_soMusic4a,
224 CSoundObject m_soMusic4b,

// next free subchannel markers (all starts at subchannel 1(b), first switch goes to subchannel 0(a))
130 INDEX m_iSubChannel0 = 1,
131 INDEX m_iSubChannel1 = 1,
132 INDEX m_iSubChannel2 = 1,
133 INDEX m_iSubChannel3 = 1,
134 INDEX m_iSubChannel4 = 1,

150 CEntityPointer m_penOverLord,
151 BOOL m_bCreateWorldLink = FALSE,
//152 INDEX m_ctEnemiesInWorldInit = 0,
//153 INDEX m_ctEnemiesInWorldSpawner = 0,
154 FLOAT m_tmCreateKey = 0.0f,
155 BOOL  m_bFixFEKeys = FALSE,

{
  // array of enemies that make fuss
  CDynamicContainer<CEntity> m_cenFussMakers;
}

components:

  1 model   MODEL_MARKER           "Models\\Editor\\MusicHolder.mdl",
  2 texture TEXTURE_MARKER         "Models\\Editor\\MusicHolder.tex",
  3 class   CLASS_OVERLORD         "Classes\\OverLord.ecl",
  4 model   MODEL_BACKPACK         "Models\\Items\\PowerUps\\BackPack\\BackPack.mdl",
  5 texture TEXTURE_BACKPACK       "Models\\Items\\PowerUps\\BackPack\\BackPack.tex",

  6 model   MODEL_AURA             "ModelsMP\\Enemies\\Mental\\Aura.mdl",
  7 texture TEXTURE_AURA           "ModelsMP\\Enemies\\Mental\\Aura.tex",
  8 model   MODEL_BOX              "Models\\Box\\Box.mdl",
  16 model  MODEL_TOUCH_BOX        "Models\\Box\\Sphere.mdl",
  9 texture TEXTURE_BOX            "Models\\Box\\Box.tex",
  10 texture TEXTURE_ES            "ModelsMP\\Enemies\\Mental\\HeadAdmir.tex",

  11 model   MODEL_STAR            "Models\\Star\\Star.mdl",
  12 texture TEXTURE_STAR          "Models\\Star\\Star.tex",
  13 texture TEX_REFL_CHROME       "Models\\ReflectionTextures\\Chrome1.tex",
  14 texture TEX_REFL_GOLD         "Models\\ReflectionTextures\\Gold02.tex",
  15 texture TEX_REFL_COPPER       "Models\\ReflectionTextures\\Copper01.tex",

  20 model   MODEL_PLAYER          "Models\\Player\\Sammy\\Player.mdl",
  21 model   MODEL_BODY            "Models\\Player\\Sammy\\Body.mdl",
  22 model   MODEL_HEAD            "Models\\Player\\Sammy\\Head.mdl",
  23 class CLASS_LIGHT             "Classes\\Light.ecl",

  31 texture TEXTURE_PLAYER        "Models\\Player\\Sammy\\Player.tex",
  32 texture TEXTURE_PLAYER_BLACK  "Models\\Player\\Sammy\\Player_blue.tex",
  33 texture TEXTURE_PLAYER_RED    "Models\\Player\\Sammy\\Player_red.tex",
  34 texture TEXTURE_HEAD          "Models\\Player\\Sammy\\Head.tex",
  35 texture TEXTURE_HEAD_BLACK    "Models\\Player\\Sammy\\Head_Blue.tex",
  
  40 class   CLASS_KEYITEM         "Classes\\KeyItem.ecl",
  41 class   CLASS_WORLDLINK       "Classes\\WorldLink.ecl",
  42 class   CLASS_TRIGGER         "Classes\\Trigger.ecl",
	43 class   CLASS_WSC		         "Classes\\WorldSettingsController.ecl",
	44 class   CLASS_TEMP_CREATOR		 "Classes\\TemplateCreatorEG.ecl",
	45 class   CLASS_WEAPON_ITEM     "Classes\\WeaponItem.ecl",

  50 model   MODEL_WORLDLINK       "Models\\Editor\\WorldLink.mdl",
  51 texture TEXTURE_WORLDLINK     "Models\\Editor\\WorldLink.tex",

  60 model   MODEL_WINGEDLION      "ModelsMP\\Items\\Keys\\WingLion\\WingLion.mdl",

  70 model   MODEL_ENVIRONMENT_PARTICLES_HOLDER    "ModelsMP\\Editor\\EnvironmentParticlesHolder.mdl",
  71 texture TEXTURE_ENVIRONMENT_PARTICLES_HOLDER  "ModelsMP\\Editor\\EnvironmentParticlesHolder.tex",

	80 sound   SOUND_GRENADELAUNCHER_FIRE  "Models\\Weapons\\GrenadeLauncher\\Sounds\\_Fire.wav",

  90 model   MODEL_WORLD_SETTINGS_CONTROLLER     "Models\\Editor\\WorldSettingsController.mdl",
  91 texture TEXTURE_WORLD_SETTINGS_CONTROLLER   "Models\\Editor\\WorldSettingsController.tex",

	// ********* INVULNERABILITY *********
	100 model   MODEL_INVULNER  "ModelsMP\\Items\\PowerUps\\Invulnerability\\Invulnerability.mdl",

	// ********* SERIOUS DAMAGE *********
	110 model   MODEL_DAMAGE    "ModelsMP\\Items\\PowerUps\\SeriousDamage\\SeriousDamage.mdl",
	111 texture TEXTURE_DAMAGE  "ModelsMP\\Items\\PowerUps\\SeriousDamage\\SeriousDamage.tex",

	// ********* SERIOUS SPEED *********
	120 model   MODEL_SPEED     "ModelsMP\\Items\\PowerUps\\SeriousSpeed\\SeriousSpeed.mdl",
	121 texture TEXTURE_SPEED   "ModelsMP\\Items\\PowerUps\\SeriousSpeed\\SeriousSpeed.tex",

	// ********* SERIOUS BOMB *********
	130 model   MODEL_BOMB      "ModelsMP\\Items\\PowerUps\\SeriousBomb\\SeriousBomb.mdl",
	131 texture TEXTURE_BOMB    "ModelsMP\\Items\\PowerUps\\SeriousBomb\\SeriousBomb.tex",

	// ********* MISC *********
	140 texture TEXTURE_SPECULAR_STRONG  "ModelsMP\\SpecularTextures\\Strong.tex",
	141 texture TEXTURE_SPECULAR_MEDIUM  "ModelsMP\\SpecularTextures\\Medium.tex",
	142 texture TEXTURE_REFLECTION_METAL "ModelsMP\\ReflectionTextures\\LightMetal01.tex",
	143 texture TEXTURE_REFLECTION_GOLD  "ModelsMP\\ReflectionTextures\\Gold01.tex",

	// ************** SOUNDS **************
	151 sound   SOUND_PICKUP     "SoundsMP\\Items\\PowerUp.wav",
	152 sound   SOUND_BOMB			 "SoundsMP\\Items\\SeriousBomb.wav",
	153 sound   SOUND_EXPLODE		 "Sounds\\FWExplosion01.wav",
	154 sound   SOUND_EXPLODE1   "ModelsMP\\Enemies\\Summoner\\Sounds\\Explode.wav",
	155 sound   SOUND_EXPLODE2	 "Sounds\\FWExplosion02.wav",
	156 sound   SOUND_EXPLODE3   "SoundsMP\\Misc\\Firecrackers.wav",
	157 sound   SOUND_FLYING     "Sounds\\Weapons\\RocketFly.wav",
	158 sound   SOUND_FLYING2    "Sounds\\Weapons\\ProjectileFly.wav",

  160 model   MODEL_CAMERA     "Models\\Editor\\Camera.mdl",
  161 texture TEXTURE_CAMERA   "Models\\Editor\\Camera.tex",
  162 model   MODEL_QUESTION_MARK         "Models\\QuestionMark\\QuestionMark.mdl",
  163 texture TEXTURE_QUESTION_MARK       "Models\\QuestionMark\\QuestionMark.tex",

functions:

  void Precache(void) {
    PrecacheModel(MODEL_BACKPACK);
    PrecacheTexture(TEXTURE_BACKPACK);
    PrecacheModel(MODEL_BOX);
    PrecacheModel(MODEL_TOUCH_BOX);
    PrecacheTexture(TEXTURE_BOX);
    PrecacheModel(MODEL_AURA);
    PrecacheTexture(TEXTURE_AURA);
    PrecacheTexture(TEXTURE_ES);
    PrecacheModel(MODEL_STAR);
    PrecacheTexture(TEXTURE_STAR);
    PrecacheTexture(TEX_REFL_CHROME);
    PrecacheTexture(TEX_REFL_GOLD);
    PrecacheTexture(TEX_REFL_COPPER);
    PrecacheModel(MODEL_PLAYER);
    PrecacheTexture(TEXTURE_PLAYER);
    PrecacheTexture(TEXTURE_PLAYER_RED);
    PrecacheTexture(TEXTURE_PLAYER_BLACK);
    PrecacheModel(MODEL_BODY);
    PrecacheModel(MODEL_HEAD);
    PrecacheTexture(TEXTURE_HEAD);
    PrecacheTexture(TEXTURE_HEAD_BLACK);
    PrecacheModel(MODEL_WORLDLINK);
    PrecacheTexture(TEXTURE_WORLDLINK);
    PrecacheModel(MODEL_WINGEDLION);
    PrecacheModel(MODEL_ENVIRONMENT_PARTICLES_HOLDER);
    PrecacheTexture(TEXTURE_ENVIRONMENT_PARTICLES_HOLDER);
		PrecacheSound(SOUND_GRENADELAUNCHER_FIRE);
    PrecacheModel(MODEL_WORLD_SETTINGS_CONTROLLER);
    PrecacheTexture(TEXTURE_WORLD_SETTINGS_CONTROLLER);
    PrecacheModel(MODEL_INVULNER);
    PrecacheModel(MODEL_DAMAGE);
    PrecacheTexture(TEXTURE_DAMAGE);
    PrecacheModel(MODEL_SPEED);
    PrecacheTexture(TEXTURE_SPEED);
    PrecacheModel(MODEL_BOMB);
    PrecacheTexture(TEXTURE_BOMB);
		PrecacheTexture(TEXTURE_SPECULAR_STRONG);
		PrecacheTexture(TEXTURE_SPECULAR_MEDIUM);
		PrecacheTexture(TEXTURE_REFLECTION_METAL);
		PrecacheTexture(TEXTURE_REFLECTION_GOLD);
		PrecacheSound(SOUND_PICKUP);
		PrecacheSound(SOUND_BOMB);
    PrecacheModel(MODEL_CAMERA);
    PrecacheTexture(TEXTURE_CAMERA);
		PrecacheSound(SOUND_EXPLODE);
		PrecacheSound(SOUND_EXPLODE1);
		PrecacheSound(SOUND_EXPLODE2);
		PrecacheSound(SOUND_EXPLODE3);
		PrecacheSound(SOUND_FLYING);
		PrecacheSound(SOUND_FLYING2);
    PrecacheModel(MODEL_QUESTION_MARK);
    PrecacheTexture(TEXTURE_QUESTION_MARK);
  }

  class COverLord *GetOverLord(void)
  {
    ASSERT(m_penOverLord!=NULL);
    return (COverLord*) m_penOverLord.ep_pen;
  }

  void FixFEKeyItems(void) 
	{
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsOfClass(pen, "KeyItem")) {
				CKeyItem *penKeyItem = (CKeyItem *)pen;
        penKeyItem->SetMods();
			}
		}}
	}

  void InitializeFEMaps(void)
  {
		BOOL bCreateWSC = TRUE;
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsOfClass(pen, "Enemy Spawner")) {
        pen->Initialize();
      } else if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				// fix issue with enemies falling thru the floor
				if (!penEnemy->m_bTemplate) {
					penEnemy->m_bRandomSize = FALSE;
				}
        pen->Initialize();
      } else if (IsDerivedFromClass(pen, "Moving Brush")) {
        pen->Initialize();
      } else if (IsOfClass(pen, "KeyItem")) {
				CKeyItem *penKeyItem = (CKeyItem *)pen;
        penKeyItem->SetMods();
				//pen->Destroy();
				pen->Initialize();
      } else if (IsOfClass(pen, "WorldBase")) {
        pen->Initialize();
			/*} else if (IsOfClass(pen, "Light")) {
				CLight *penLight = (CLight *)pen;
				if (penLight->m_ltType == LT_DIRECTIONAL) {
					//penLight->m_ltType = LT_AMBIENT;
					penLight->m_colColor = RGBToColor(150, 93, 62)|0;
					penLight->m_colAmbient = RGBToColor(43, 43, 43)|0;
					penLight->m_rFallOffRange = 2.66258f;
					//penLight->m_bDarkLight = TRUE;
					pen->Reinitialize();
					CPrintF("Light color changed\n");
				}*/
      } else if (IsOfClass(pen, "Camera")) {
        pen->Initialize();
      } else if (IsOfClass(pen, "Storm controller")) {
        pen->Initialize();
      } else if (IsOfClass(pen, "WorldSettingsController")) {
				bCreateWSC = FALSE;
        pen->Initialize();
      } else if (IsOfClass(pen, "Lightning")) {
        pen->Initialize();
      } else if (IsOfClass(pen, "Player Marker")) {
        pen->Initialize();
      /*} else if (IsOfClass(pen, "Weapon Item")) {
				CWeaponItem *penWeaponItem = (CWeaponItem *)pen;
				INDEX iType = penWeaponItem->m_EwitType;
				// if we are one of the replaced models, tommy, minigun and double shotgun
				if (iType == 3 || iType == 4 || iType == 5) {
					BOOL bReplaced = penWeaponItem->m_bReplaced;
					if (!bReplaced) {
						// get the needed info
						CEntity *penNew = NULL;
						CPlacement3D pl = penWeaponItem->GetPlacement();
						//CPrintF("iType: %d - ( %.3f, %.3f, %.3f )\n", iType, 
							//pl.pl_PositionVector(1), pl.pl_PositionVector(2), pl.pl_PositionVector(3));
						CEntityPointer penTarget = penWeaponItem->m_penTarget;
						// destroy the old, create the new
						pen->Destroy();
						penNew = CreateEntity(pl, CLASS_WEAPON_ITEM);
						CWeaponItem *penNewWeapon = ((CWeaponItem*)penNew);
						switch (iType) {
							case 3:  penNewWeapon->m_EwitType = WIT_DOUBLESHOTGUN; break;
							case 4:  penNewWeapon->m_EwitType = WIT_TOMMYGUN; break;
							case 5:  penNewWeapon->m_EwitType = WIT_MINIGUN; break;
							default: penNewWeapon->m_EwitType = WIT_MINIGUN;
						}
						// new bool so this doesn't happen twice :p
						penNewWeapon->m_bReplaced = TRUE;
						// Reinit, because Init does not work for creating weapon items in game
						//  could this be part of the prob?  but reint alone does
						//  not work, Diff stream errors for Alpine Mists
						penNewWeapon->Reinitialize();
					}
					//pen->Reinitialize();
				}*/
     } else if (IsDerivedFromClass(pen, "Copier")) {
				CCopier *penCopier = (CCopier *)pen;
        if (penCopier->m_penTarget!=NULL) {
          CEntity *penCT = penCopier->m_penTarget;
          if (IsDerivedFromClass(penCT, "Item")) {
            CItem *penItem = (CItem *)penCT;
            penItem->m_bCreateTouchBox = FALSE;
            penItem->m_bCanBeenPicked = FALSE;
						if (IsOfClass(penCT, "Weapon Item")) {
						}
          }
        }
      }
      if (m_bCreateWorldLink) {
        //CPrintF("m_bCreateWorldLink\n");
        if (IsOfClass(pen, "PlayerActionMarker")) {
				  CPlayerActionMarker *penPAM = (CPlayerActionMarker *)pen;
          if (penPAM->m_strName=="Marker RecStats Coop") {
            //CPrintF("PlayerActionMarker RecStats Coop Tweak\n");
            penPAM->m_penTarget = NULL;
		        CPlacement3D pl;
            CEntity *pen = NULL;
            pl = CPlacement3D(FLOAT3D(0, -32005, 0), ANGLE3D(0, 0, 0));
            pen = CreateEntity(pl, CLASS_WORLDLINK);
//#####
            CTString _strrGameName = (const char *) _pShell->GetString("sam_strGameName");
            if ( _strrGameName == "serioussam") {
               if (GetSP()->sp_iPostTGPLevel==0) {
                 ((CWorldLink&)*pen).m_strWorld = CTFILENAME("Levels\\01_Hatshepsut.wld");
               } else if (GetSP()->sp_iPostTGPLevel==1) {
                 ((CWorldLink&)*pen).m_strWorld = CTFILENAME("Levels\\06_Oasis.wld");
               } else {
                 ((CWorldLink&)*pen).m_strWorld = CTFILENAME("Levels\\10_Metropolis.wld");
               }
            } else {
               if (GetSP()->sp_iPostTGPLevel==0) {
                 ((CWorldLink&)*pen).m_strWorld = CTFILENAME("Levels\\LevelsMP\\1_1_Palenque.wld");
               } else if (GetSP()->sp_iPostTGPLevel==1) {
                 ((CWorldLink&)*pen).m_strWorld = CTFILENAME("Levels\\LevelsMP\\2_1_Ziggurrat.wld");
               } else {
                 ((CWorldLink&)*pen).m_strWorld = CTFILENAME("Levels\\LevelsMP\\3_1_GothicCastle.wld");
               }
            }
//######
            ((CWorldLink&)*pen).m_EwltType = WLT_FIXED;
            ((CWorldLink&)*pen).m_strGroup = "TGP to SdC";
            ((CWorldLink&)*pen).Initialize();
		        CPlacement3D pl1;
            CEntity *pen1 = NULL;
            pl1 = CPlacement3D(FLOAT3D(0, 0, 0), ANGLE3D(0, 0, 0));
            pen1 = CreateEntity(pl, CLASS_TRIGGER);
            ((CTrigger&)*pen1).m_bActive = TRUE;
            ((CTrigger&)*pen1).m_fWaitTime = 60.0f;
            ((CTrigger&)*pen1).m_eetEvent1 = EET_TRIGGER;
            ((CTrigger&)*pen1).m_strName = "Game End";
            ((CTrigger&)*pen1).m_penTarget1 = pen;
            ((CTrigger&)*pen1).Initialize();
						m_bCreateWorldLink = FALSE;
          }
        }
        if (IsOfClass(pen, "PyramidSpaceShip")) {
          //CPrintF("Space Ship Found\n");
				  CPyramidSpaceShip *penPyramidSpaceShip = (CPyramidSpaceShip *)pen;
          penPyramidSpaceShip->Initialize();
        }
        if (IsOfClass(pen, "Pyramid Space Ship Marker")) {
          //CPrintF("Space Ship Marker Found\n");
				  CPyramidSpaceShipMarker *penPyramidSpaceShipMarker = (CPyramidSpaceShipMarker *)pen;
          penPyramidSpaceShipMarker->Initialize();
        }
      }
    }}
		// if there isn't a world settings controller create one so the serious bombs can shake
		if (bCreateWSC) {
			// create just one world settings controller
			CPlacement3D pl;
			CEntity *pen = NULL;
			pl = CPlacement3D(FLOAT3D(0, -32000, 0), ANGLE3D(0, 0, 0));
			pen = CreateEntity(pl, CLASS_WSC);
			CWorldSettingsController *penWSC = (CWorldSettingsController *)pen;
			penWSC->Initialize();
			// obtain bcg viewer(s)
			{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
				CEntity *pen = iten;
				if (IsOfClass(pen, "Background Viewer")) {
					CBackgroundViewer *penBcgViewer = (CBackgroundViewer *)pen;
					if (penBcgViewer != NULL) {
						// if we don't already have a world settings controller, set it to the new one
						if (penBcgViewer->m_penWorldSettingsController==NULL) {
							penBcgViewer->m_penWorldSettingsController = penWSC;
							break;
						}
					} 
				}
			}}
		}
  }

  void InitializeSEMaps(void)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsOfClass(pen, "Copier")) {
				CCopier *penCopier = (CCopier *)pen;
        if (penCopier->m_penTarget!=NULL) {
          CEntity *penCT = penCopier->m_penTarget;
          if (IsDerivedFromClass(penCT, "Item")) {
            CItem *penItem = (CItem *)penCT;
            penItem->m_bCreateTouchBox = FALSE;
						penItem->m_bCanBeenPicked = FALSE;
          }
        }
      } else if (IsOfClass(pen, "Player Marker")) {
        pen->Initialize();
      /*} else if (IsOfClass(pen, "Enemy Marker")) {
        pen->SwitchToModel();
      } else if (IsOfClass(pen, "Weapon Item")) {
        pen->Initialize();*/
			} else if (IsDerivedFromClass(pen, "Enemy Spawner")) {
        pen->Initialize();

      } else if (IsOfClass(pen, "Touch Field")) {
				CTouchField *penTF = (CTouchField *)pen;
				penTF->SetMods();
			}
    }}
  }

	void CreateTemplateCreator(void)
	{
    CPlacement3D pl;
    CEntity *pen = NULL;
    pl = GetPlacement();
    pen = CreateEntity(pl, CLASS_TEMP_CREATOR);
    CTemplateCreatorEG *penTemplateCreator = ((CTemplateCreatorEG*)pen);
    //penTemplateCreator->m_bCreateTemplates = TRUE;
    penTemplateCreator->Initialize();
	}

  // count enemies in current world
  void CountEnemies(void)
  {
    m_ctEnemiesInWorld = 0;
    m_ctSecretsInWorld = 0;
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      // if enemybase
      if (IsDerivedFromClass(pen, "Enemy Base")) {
        CEnemyBase *penEnemy = (CEnemyBase *)pen;
        // if not template
        if (!penEnemy->m_bTemplate) {
          // count one
          m_ctEnemiesInWorld++;
					// make them blind and deaf ?
					//penEnemy->m_bBlind = TRUE;
					//penEnemy->m_bDeaf = TRUE;
		      // if this is a woman, fix it
		      if (IsOfClass(pen, "Woman") && !m_bFixFEKeys) {
			      ((CWoman *)&*pen)->Initialize();
		      }
        }
      // if spawner
      } else if (IsDerivedFromClass(pen, "Enemy Spawner")) {
        CEnemySpawner *penSpawner = (CEnemySpawner *)pen;
        // if not teleporting
        if (penSpawner->m_estType!=EST_TELEPORTER && penSpawner->m_penTarget!=NULL) {
          // add total count
          m_ctEnemiesInWorld+=penSpawner->m_ctTotal;
					//m_ctEnemiesInWorldInit += penSpawner->m_iCount;
        }
      // if spawner battery
      } else if (IsDerivedFromClass(pen, "PESpawnBattery")) {
        CPESpawnBattery *penSpawnerBatt = (CPESpawnBattery *)pen;
        // add total count
        m_ctEnemiesInWorld+=penSpawnerBatt->m_ctTotal*GetGameEnemyMultiplier();
      // if trigger
      } else if (IsDerivedFromClass(pen, "Trigger")) {
        CTrigger *penTrigger = (CTrigger *)pen;
        // if has score
        if (penTrigger->m_fScore>0) {
          // it counts as a secret
          m_ctSecretsInWorld++;
        }
      }
    }}
  }

  //***************************************************************
  //****************  Fix Textures on some levels  ****************
  //***************************************************************

  // Clear Lights
  void ClearLights(void)
  {
    {FOREACHINDYNAMICCONTAINER(_pNetwork->ga_World.wo_cenEntities, CEntity, pen) {
      if(IsDerivedFromClass(pen, "Light")) {
        if(((CLight&)*pen).m_strName == "fix_texture"){
          pen->Destroy();
        }
      }
    }}
  }

  // Fix textures
  void FixTexturesLandOfDamned(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 4; i++) {
      pl = CPlacement3D(FLOAT3D(7.0f, 63.0f, -268.0f), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }    
  }

  void FixTexturesValleyOfTheKings(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 4; i++) {
      FLOAT m_fCoord1 = _fValleyOfTheKingsCoordinates[i][0];
      FLOAT m_fCoord2 = _fValleyOfTheKingsCoordinates[i][1];
      FLOAT m_fCoord3 = _fValleyOfTheKingsCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }    
  }

  void FixTexturesDunes(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 8; i++) {
      FLOAT m_fCoord1 = _fDunesCoordinates[i][0];
      FLOAT m_fCoord2 = _fDunesCoordinates[i][1];
      FLOAT m_fCoord3 = _fDunesCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }
  }

  void FixTexturesSuburbs(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 21; i++) {
      FLOAT m_fCoord1 = _fSuburbsCoordinates[i][0];
      FLOAT m_fCoord2 = _fSuburbsCoordinates[i][1];
      FLOAT m_fCoord3 = _fSuburbsCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }
  }

  void FixTexturesMetropolis(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    FLOAT m_fCoord1 = _fMetropolisCoordinates[0][0];
    FLOAT m_fCoord2 = _fMetropolisCoordinates[0][1];
    FLOAT m_fCoord3 = _fMetropolisCoordinates[0][2];
    pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
  }

  void FixTexturesAlleyOfSphinxes(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 37; i++) {
      FLOAT m_fCoord1 = _fAlleyOfSphinxesCoordinates[i][0];
      FLOAT m_fCoord2 = _fAlleyOfSphinxesCoordinates[i][1];
      FLOAT m_fCoord3 = _fAlleyOfSphinxesCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    } 
  }

  void FixTexturesKarnak(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 41; i++) {
      FLOAT m_fCoord1 = _fKarnakCoordinates[i][0];
      FLOAT m_fCoord2 = _fKarnakCoordinates[i][1];
      FLOAT m_fCoord3 = _fKarnakCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }
    FLOAT m_fCoord1 = _fKarnakCoordinates[41][0];
    FLOAT m_fCoord2 = _fKarnakCoordinates[41][1];
    FLOAT m_fCoord3 = _fKarnakCoordinates[41][2];
    pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
    pen = CreateEntity(pl, CLASS_LIGHT);
    pen->Initialize();
    ((CLight&)*pen).m_colColor = C_GRAY;
    ((CLight&)*pen).m_ltType = LT_POINT;
    ((CLight&)*pen).m_bDarkLight = TRUE;
    ((CLight&)*pen).m_rFallOffRange = 4.0f;
    ((CLight&)*pen).m_strName = "fix_texture";
    pen->en_ulSpawnFlags =0xFFFFFFFF;
    pen->Reinitialize();
  }

  void FixTexturesLuxor(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 51; i++) {
      FLOAT m_fCoord1 = _fLuxorCoordinates[i][0];
      FLOAT m_fCoord2 = _fLuxorCoordinates[i][1];
      FLOAT m_fCoord3 = _fLuxorCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }
    FLOAT m_fCoord1 = _fLuxorCoordinates[51][0];
    FLOAT m_fCoord2 = _fLuxorCoordinates[51][1];
    FLOAT m_fCoord3 = _fLuxorCoordinates[51][2];
    pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
    pen = CreateEntity(pl, CLASS_LIGHT);
    pen->Initialize();
    ((CLight&)*pen).m_colColor = C_GRAY;
    ((CLight&)*pen).m_ltType = LT_POINT;
    ((CLight&)*pen).m_bDarkLight = TRUE;
    ((CLight&)*pen).m_rFallOffRange = 1.0f;
    ((CLight&)*pen).m_strName = "fix_texture";
    pen->en_ulSpawnFlags =0xFFFFFFFF;
    pen->Reinitialize();
  }

  void FixTexturesSacredYards(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 27; i++) {
      FLOAT m_fCoord1 = _fSacredYardsCoordinates[i][0];
      FLOAT m_fCoord2 = _fSacredYardsCoordinates[i][1];
      FLOAT m_fCoord3 = _fSacredYardsCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }
  }

  void FixTexturesKarnakDemo(void) 
  {
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 49; i++) {
      FLOAT m_fCoord1 = _fKarnakDemoCoordinates[i][0];
      FLOAT m_fCoord2 = _fKarnakDemoCoordinates[i][1];
      FLOAT m_fCoord3 = _fKarnakDemoCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    }
    FLOAT m_fCoord1 = _fKarnakDemoCoordinates[49][0];
    FLOAT m_fCoord2 = _fKarnakDemoCoordinates[49][1];
    FLOAT m_fCoord3 = _fKarnakDemoCoordinates[49][2];
    pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
    pen = CreateEntity(pl, CLASS_LIGHT);
    pen->Initialize();
    ((CLight&)*pen).m_colColor = C_GRAY;
    ((CLight&)*pen).m_ltType = LT_POINT;
    ((CLight&)*pen).m_bDarkLight = TRUE;
    ((CLight&)*pen).m_rFallOffRange = 4.0f;
    ((CLight&)*pen).m_strName = "fix_texture";
    pen->en_ulSpawnFlags =0xFFFFFFFF;
    pen->Reinitialize();
  }

  void FixTexturesIntro(void) 
  { 
    ClearLights();
    CEntity *pen = NULL;
    CPlacement3D pl;
    for(int i = 0; i < 8; i++) {
      FLOAT m_fCoord1 = _fIntroCoordinates[i][0];
      FLOAT m_fCoord2 = _fIntroCoordinates[i][1];
      FLOAT m_fCoord3 = _fIntroCoordinates[i][2];
      pl = CPlacement3D(FLOAT3D(m_fCoord1, m_fCoord2, m_fCoord3), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_LIGHT);
      pen->Initialize();
      ((CLight&)*pen).m_colColor = C_GRAY;
      ((CLight&)*pen).m_ltType = LT_POINT;
      ((CLight&)*pen).m_bDarkLight = TRUE;
      ((CLight&)*pen).m_rFallOffRange = 8.0f;
      ((CLight&)*pen).m_strName = "fix_texture";
      pen->en_ulSpawnFlags =0xFFFFFFFF;
      pen->Reinitialize();
    } 
  }

  //***************************************************************
  //*********************** Old metods: ***************************
  //****************  Fix Textures on Obelisk  ********************
  //***************************************************************
  void FixTexturesOnObelisk(CTFileName strLevelName)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      // if it is brush entity
      if (iten->en_RenderType == CEntity::RT_BRUSH) {
        // for each mip in its brush
        FOREACHINLIST(CBrushMip, bm_lnInBrush, iten->en_pbrBrush->br_lhBrushMips, itbm) {
          // for all sectors in this mip
          FOREACHINDYNAMICARRAY(itbm->bm_abscSectors, CBrushSector, itbsc) {
            // for all polygons in sector
            FOREACHINSTATICARRAY(itbsc->bsc_abpoPolygons, CBrushPolygon, itbpo)
            {
              CTFileName strTextureName = itbpo->bpo_abptTextures[1].bpt_toTexture.GetName().FileName();
              int _Obelisk02Light_found   = strncmp((const char *)strTextureName, (const char *) "Obelisk02Light", (size_t) 14 );
              if (_Obelisk02Light_found == 0 ){
                  // Settings:
                  // itbpo->bpo_abptTextures[1].bpt_toTexture.GetName().FileName()
                  // itbpo->bpo_abptTextures[1].s.bpt_ubBlend
                  // itbpo->bpo_abptTextures[1].s.bpt_ubFlags 
                  // itbpo->bpo_abptTextures[1].s.bpt_colColor
                if ( strLevelName=="KarnakDemo" || strLevelName=="Intro" || strLevelName=="08_Suburbs"
                  || strLevelName=="13_Luxor" || strLevelName=="14_SacredYards") {
                  itbpo->bpo_abptTextures[1].s.bpt_colColor = (C_WHITE| 0x5F);
                } else if ( strLevelName=="04_ValleyOfTheKings" || strLevelName=="11_AlleyOfSphinxes" || strLevelName=="12_Karnak"){
                  itbpo->bpo_abptTextures[1].s.bpt_colColor = (C_GRAY| 0x2F);
                }
              }
            }
          }
        }
      } /// END if()
    }}
  }

  //***************************************************************
  //**********^**  Fix Textures on Alley Of Sphinxes  *************
  //***************************************************************
  void FixTexturesOnAlleyOfSphinxes(void)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      // if it is brush entity
      if (iten->en_RenderType == CEntity::RT_BRUSH) {
        // for each mip in its brush
        FOREACHINLIST(CBrushMip, bm_lnInBrush, iten->en_pbrBrush->br_lhBrushMips, itbm) {
          // for all sectors in this mip
          FOREACHINDYNAMICARRAY(itbm->bm_abscSectors, CBrushSector, itbsc) {
            // for all polygons in sector
            FOREACHINSTATICARRAY(itbsc->bsc_abpoPolygons, CBrushPolygon, itbpo)
            {
              CTFileName strTextureName = itbpo->bpo_abptTextures[1].bpt_toTexture.GetName().FileName();
              int _EyeOfRa_found = strncmp((const char *)strTextureName, (const char *) "EyeOfRa", (size_t) 7 );
              int _Wall12_found  = strncmp((const char *)strTextureName, (const char *) "Wall12",  (size_t) 6 );
              int _Wingy02_found = strncmp((const char *)strTextureName, (const char *) "Wingy02", (size_t) 7 );
              if (_EyeOfRa_found == 0 || _Wall12_found == 0 || _Wingy02_found == 0){
                itbpo->bpo_abptTextures[1].s.bpt_ubBlend  = BPT_BLEND_BLEND;
                itbpo->bpo_abptTextures[1].s.bpt_colColor = C_GRAY|0x80;
              }
            }
          }
        }
      } // END if()
    }}
  }

  //***************************************************************
  //***************************************************************
  //***************************************************************

  // check for stale fuss-makers
  void CheckOldFussMakers(void)
  {
    TIME tmNow = _pTimer->CurrentTick();
    TIME tmTooOld = tmNow-10.0f;
    CDynamicContainer<CEntity> cenOldFussMakers;
    // for each fussmaker
    {FOREACHINDYNAMICCONTAINER(m_cenFussMakers, CEntity, itenFussMaker) {
      CEnemyBase & enFussMaker = (CEnemyBase&)*itenFussMaker;
      // if haven't done fuss for too long
      if (enFussMaker.m_tmLastFussTime<tmTooOld) {
        // add to old fuss makers
        cenOldFussMakers.Add(&enFussMaker);
      }
    }}
    // for each old fussmaker
    {FOREACHINDYNAMICCONTAINER(cenOldFussMakers, CEntity, itenOldFussMaker) {
      CEnemyBase &enOldFussMaker = (CEnemyBase&)*itenOldFussMaker;
      // remove from fuss
      enOldFussMaker.RemoveFromFuss();
    }}
  }
  
  // get total score of all active fuss makers
  INDEX GetFussMakersScore(void) {
    INDEX iScore = 0;
    {FOREACHINDYNAMICCONTAINER(m_cenFussMakers, CEntity, itenFussMaker) {
      CEnemyBase &enFussMaker = (CEnemyBase&)*itenFussMaker;
      iScore += (INDEX) enFussMaker.m_iScore;
    }}
    return iScore;
  }

  // change given music channel
  void ChangeMusicChannel(enum MusicType mtType, const CTFileName &fnNewMusic, FLOAT fNewVolume)
  {
    INDEX &iSubChannel = (&m_iSubChannel0)[mtType];
    // take next sub-channel if needed
    if (fnNewMusic!="") {
      iSubChannel = (iSubChannel+1)%2;
    }
    // find channel's variables
    FLOAT &fVolume = (&m_fVolume0)[mtType];
    CSoundObject &soMusic = (&m_soMusic0a)[mtType*2+iSubChannel];
    FLOAT &fCurrentVolume = (&m_fCurrentVolume0a)[mtType*2+iSubChannel];

    // setup looping/non looping flags
    ULONG ulFlags;
    if (mtType==MT_EVENT) {
      ulFlags = SOF_MUSIC;
    } else {
      ulFlags = SOF_MUSIC|SOF_LOOP|SOF_NONGAME;
    }

    // remember volumes
    fVolume = fNewVolume;
    // start new music file if needed
    if (fnNewMusic!="") {
      PlaySound( soMusic, fnNewMusic, ulFlags);
      // initially, not playing
      fCurrentVolume = MUSIC_VOLUMEMIN;
      soMusic.Pause();
      soMusic.SetVolume(fCurrentVolume, fCurrentVolume);
    }
  }

  // fade out one channel
  void FadeOutChannel(INDEX iChannel, INDEX iSubChannel)
  {
    // find channel's variables
    FLOAT &fVolume = (&m_fVolume0)[iChannel];
    CSoundObject &soMusic = (&m_soMusic0a)[iChannel*2+iSubChannel];
    FLOAT &fCurrentVolume = (&m_fCurrentVolume0a)[iChannel*2+iSubChannel];

    // do nothing, if music is not playing
    if( !soMusic.IsPlaying()) { return; }

    // do nothing, if music is already paused
    if( soMusic.IsPaused()) { return; }

    // if minimum volume reached 
    if( fCurrentVolume<MUSIC_VOLUMEMIN) {
      // pause music
      soMusic.Pause();
    } else {
      // music isn't even faded yet, so continue on fading it out
      fCurrentVolume *= FadeOutFactor( m_tmFade);
      soMusic.SetVolume( fCurrentVolume*fVolume, fCurrentVolume*fVolume);
    }
  }

  // fade in one channel
  void FadeInChannel(INDEX iChannel, INDEX iSubChannel)
  {
    // find channel's variables
    FLOAT &fVolume = (&m_fVolume0)[iChannel];
    CSoundObject &soMusic = (&m_soMusic0a)[iChannel*2+iSubChannel];
    FLOAT &fCurrentVolume = (&m_fCurrentVolume0a)[iChannel*2+iSubChannel];

    // do nothing, if music is not playing
    if( !soMusic.IsPlaying()) { return; }

    // resume music if needed
    if( soMusic.IsPaused()) {
      soMusic.Resume();
    }
    // fade in music if needed
    if( fCurrentVolume<MUSIC_VOLUMEMAX) {
      fCurrentVolume *= FadeInFactor( m_tmFade);
      fCurrentVolume = ClampUp( fCurrentVolume, 1.0f);
    }
    soMusic.SetVolume( fCurrentVolume*fVolume, fCurrentVolume*fVolume);
  }

  // fade one channel in or out
  void CrossFadeOneChannel(enum MusicType mtType)
  {
    INDEX iSubChannelActive = (&m_iSubChannel0)[mtType];
    INDEX iSubChannelInactive = (iSubChannelActive+1)%2;
    // if it is current channel
    if (mtType==m_mtCurrentMusic) {
      // fade in active subchannel
      FadeInChannel(mtType, iSubChannelActive);
      // fade out inactive subchannel
      FadeOutChannel(mtType, iSubChannelInactive);
    // if it is not current channel
    } else {
      // fade it out
      FadeOutChannel(mtType, 0);
      FadeOutChannel(mtType, 1);
    }
  }
  
procedures:
  // initialize music
  Main(EVoid) {

    // init as model
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    // wait for game to start
    autowait(_pTimer->TickQuantum);

    // Overlord Stuff
		CTString strLevelName = _pNetwork->ga_fnmWorld.FileName();

		//SetLevelString();
		//CPrintF("g_strLevelName: %s\n", g_strLevelName);

    if (strLevelName=="15_TheGreatPyramid") {
      //CPrintF("m_bCreateWorldLink in MH Main\n");
      m_bCreateWorldLink = TRUE;
    }

		if ( strLevelName=="01_Hatshepsut" 
      || strLevelName=="02_SandCanyon"
			|| strLevelName=="03_TombOfRamses"
			|| strLevelName=="04_ValleyOfTheKings"
      || strLevelName=="05_MoonMountains"
      || strLevelName=="06_Oasis"
      || strLevelName=="07_Dunes"
      || strLevelName=="08_Suburbs"
      || strLevelName=="09_Sewers"
      || strLevelName=="10_Metropolis"
      || strLevelName=="11_AlleyOfSphinxes"
      || strLevelName=="12_Karnak"
      || strLevelName=="13_Luxor"
      || strLevelName=="14_SacredYards"
      || strLevelName=="15_TheGreatPyramid"
      || strLevelName=="alpinemists"
      || strLevelName=="Triphon"
      || strLevelName=="new"
      || strLevelName=="Final Fight"
      || strLevelName=="KarnakDemo"
      || strLevelName=="Return To Moon Mountains 1") {
      InitializeFEMaps();
			//m_bFixFEKeys = TRUE;
			//CreateTemplateCreator();
    } else {
      InitializeSEMaps();
			//CreateTemplateCreator();
    }


    // Get Level Name and Mod Name
    CTString strModName = _pShell->GetValue("sys_strModName");
    INDEX iBugFixMetod = _pShell->GetINDEX("gam_bFixIlluminationsMetod");

    // Fix textures
    if ( /* strModName=="" && */ iBugFixMetod == 2 && strLevelName=="3_2_LandOfDamned") {
      FixTexturesLandOfDamned();
    }

    if(iBugFixMetod == 1) {
      // Fix Obelisk textures
      if ( strModName=="" ) {
        if ( strLevelName=="04_ValleyOfTheKings" || strLevelName=="11_AlleyOfSphinxes" || strLevelName=="12_Karnak" 
          || strLevelName=="13_Luxor" || strLevelName=="KarnakDemo" || strLevelName=="Intro" 
          || strLevelName=="08_Suburbs" || strLevelName=="14_SacredYards") {
          FixTexturesOnObelisk(strLevelName);
        }
      }
      // Fix Alley Of Sphinxes textures
      if (/* strModName=="" && */ strLevelName=="11_AlleyOfSphinxes") {
        FixTexturesOnAlleyOfSphinxes();
      }
    } else if(iBugFixMetod == 2) {
      // Fix textures
      if (/* strModName=="" && */ strLevelName=="04_ValleyOfTheKings") {
        FixTexturesValleyOfTheKings();
      } else if (/* strModName=="" && */ strLevelName=="07_Dunes") {
        FixTexturesDunes();
      } else if (/* strModName=="" && */ strLevelName=="08_Suburbs") {
        FixTexturesSuburbs();
      } else if (/* strModName=="" && */ strLevelName=="10_Metropolis") {
        FixTexturesMetropolis();
      } else if (/* strModName=="" && */ strLevelName=="11_AlleyOfSphinxes") {
        FixTexturesAlleyOfSphinxes();
      } else if (/* strModName=="" && */ strLevelName=="12_Karnak") {
        FixTexturesKarnak();
      } else if (/* strModName=="" && */ strLevelName=="13_Luxor") {
        FixTexturesLuxor();
      } else if (/* strModName=="" && */ strLevelName=="14_SacredYards") {
        FixTexturesSacredYards();
      } else if (/* strModName=="" && */ strLevelName=="KarnakDemo") {
        FixTexturesKarnakDemo();
      } else if (/* strModName=="" && */ strLevelName=="Intro") {
        FixTexturesIntro();
      }
    }

		//CTString str = "15.567";
		//CPrintF("str: %.3f\n", atof(str));

    // spawn your OverLord 
    m_penOverLord = CreateEntity(GetPlacement(), CLASS_OVERLORD);
    EOverLordInit eInitOverLord;
    eInitOverLord.penOwner = this;
    GetOverLord()->Initialize(eInitOverLord);

    // prepare initial music channel values
    ChangeMusicChannel(MT_LIGHT,        m_fnMusic0, m_fVolume0);
    ChangeMusicChannel(MT_MEDIUM,       m_fnMusic1, m_fVolume1);
    ChangeMusicChannel(MT_HEAVY,        m_fnMusic2, m_fVolume2);
    ChangeMusicChannel(MT_EVENT,        m_fnMusic3, m_fVolume3);
    ChangeMusicChannel(MT_CONTINUOUS,   m_fnMusic4, m_fVolume4);

    // start with light music
    m_mtCurrentMusic = MT_LIGHT;
    m_fCurrentVolume0a = MUSIC_VOLUMEMAX*0.98f;
    m_tmFade = 0.01f;
    CrossFadeOneChannel(MT_LIGHT);

    // must react after enemyspawner and all enemies, but before player for proper enemy counting
    // (total wait is two ticks so far) 
		// before Dk that is, we need to add some more time here because
		// the SetMods() function in EnemySpawner takes some extra time
    autowait(0.2f);

    // count enemies in current world
    CountEnemies();

		//m_tmCreateKey = 0.0f;

    //CPrintF("m_ctEnemiesInWorld: %d\n", m_ctEnemiesInWorld );
    //CPrintF("m_ctEnemiesInWorldInit: %d\n", m_ctEnemiesInWorldInit );
    //CPrintF("m_ctEnemiesInWorldSpawner: %d\n", m_ctEnemiesInWorldSpawner );
    // main loop
    while(TRUE) {
      // wait a bit
      wait(0.1f) {
        on (ETimer) : {
          stop;
        };
        // if music is to be changed
        on (EChangeMusic ecm) : { 
          CTString strfnMusic = ecm.fnMusic;
          //CPrintF("MusicHolder music change, %s\n", strfnMusic);
          // change parameters
          ChangeMusicChannel(ecm.mtType, ecm.fnMusic, ecm.fVolume);
          // if force started
          if (ecm.bForceStart) {
            // set as current music
            m_mtCurrentMusic = ecm.mtType;
          }
          // stop waiting
          stop;
        }
      }
      // check fuss
      CheckOldFussMakers();
      // get total score of all active fuss makers
      FLOAT fFussScore = GetFussMakersScore();
      // if event is on
      if (m_mtCurrentMusic==MT_EVENT) {
        // if event has ceased playing
        if (!m_soMusic3a.IsPlaying() && !m_soMusic3b.IsPlaying()) {
          // switch to light music
          m_mtCurrentMusic=MT_LIGHT;
        }
      }
      // if heavy fight is on
      if (m_mtCurrentMusic==MT_HEAVY) {
        // if no more fuss
        if (fFussScore<=0.0f) {
          // switch to no fight
          m_mtCurrentMusic=MT_LIGHT;
        }
      // if medium fight is on
      } else if (m_mtCurrentMusic==MT_MEDIUM) {
        // if no more fuss
        if (fFussScore<=0.0f) {
          // switch to no fight
          m_mtCurrentMusic=MT_LIGHT;
        // if larger fuss
        } else if (fFussScore>=m_fScoreHeavy) {
          // switch to heavy fight
          m_mtCurrentMusic=MT_HEAVY;
        }
      // if no fight is on
      } else if (m_mtCurrentMusic==MT_LIGHT) {
        // if heavy fuss
        if (fFussScore>=m_fScoreHeavy) {
          // switch to heavy fight
          m_mtCurrentMusic=MT_HEAVY;
        // if medium fuss
        } else if (fFussScore>=m_fScoreMedium) {
          // switch to medium fight
          m_mtCurrentMusic=MT_MEDIUM;
        }
      }

      // setup fade speed depending on music type
      if (m_mtCurrentMusic==MT_LIGHT) {
        m_tmFade = 2.0f;
      } else if (m_mtCurrentMusic==MT_MEDIUM) {
        m_tmFade = 1.0f;
      } else if (m_mtCurrentMusic==MT_HEAVY) {
        m_tmFade = 1.0f;
      } else if (m_mtCurrentMusic==MT_EVENT || m_mtCurrentMusic==MT_CONTINUOUS) {
        m_tmFade = 0.5f;
      }

      // fade all channels
      CrossFadeOneChannel(MT_LIGHT);
      CrossFadeOneChannel(MT_MEDIUM);
      CrossFadeOneChannel(MT_HEAVY);
      CrossFadeOneChannel(MT_EVENT);
      CrossFadeOneChannel(MT_CONTINUOUS);

			/*if (m_bFixFEKeys) {
				m_tmCreateKey += 0.1f;
				if (m_tmCreateKey>2.0f) {
					FixFEKeyItems();
					m_bFixFEKeys = FALSE;
				}
			}*/
    }
    return;
  }
};
