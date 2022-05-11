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

324
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Enemies/Walker/Walker.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/Projectile";

enum WalkerChar {
  0 WLC_SOLDIER   "Soldier",    // soldier
  1 WLC_SERGEANT  "Sergeant",   // sergeant
};

%{
// info structure
static EntityInfo eiWalkerSE = {
  EIBT_FLESH, 1000.0f,
  0.0f, 5.4f, 0.0f,
  0.0f, 4.0f, 0.0f,
};

static EntityInfo eiWalkerSO = {
  EIBT_FLESH, 1000.0f,
  0.0f, 2.4f, 0.0f,
  0.0f, 2.5f, 0.0f,
};

#define SIZE_SOLDIER   (0.5f)
#define SIZE_SERGEANT  (1.0f)
#define FIRE_LEFT_ARM   FLOAT3D(-2.5f, 5.0f, 0.0f)
#define FIRE_RIGHT_ARM  FLOAT3D(+2.5f, 5.0f, 0.0f)
#define FIRE_DEATH_LEFT   FLOAT3D( 0.0f, 7.0f, -2.0f)
#define FIRE_DEATH_RIGHT  FLOAT3D(3.75f, 4.2f, -2.5f)

#define WALKERSOUND(soundname) ((m_EwcChar==WLC_SOLDIER)? (SOUND_SOLDIER_##soundname) : (SOUND_SERGEANT_##soundname))
%}


class CWalker : CEnemyBase {
name      "Walker";
thumbnail "Thumbnails\\Walker.tbn";

properties:
  1 enum WalkerChar m_EwcChar   "Character" 'C' = WLC_SOLDIER,
  2 INDEX m_iLoopCounter = 0,
  3 FLOAT m_fSize = 1.0f,
  4 BOOL m_bWalkSoundPlaying = FALSE,
  5 FLOAT m_fThreatDistance = 5.0f,

  10 CSoundObject m_soFeet,
  11 CSoundObject m_soFire1,
  12 CSoundObject m_soFire2,
  13 CSoundObject m_soFire3,
  14 CSoundObject m_soFire4,

	15 BOOL m_bStretchModel = FALSE,
/* 
  1026 CEntityPointer m_penWalker,  
  1029 FLOAT WalkerX = 0.0f,
  1030 FLOAT WalkerY = 0.0f,
  1031 FLOAT WalkerZ = 0.0f, 
//*/
components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",

 10 model   MODEL_WALKER              "Models\\Enemies\\Walker\\Walker.mdl",
 11 texture TEXTURE_WALKER_SOLDIER    "Models\\Enemies\\Walker\\Walker02.tex",
 12 texture TEXTURE_WALKER_SERGEANT   "Models\\Enemies\\Walker\\Walker01.tex",
 14 model   MODEL_LASER               "Models\\Enemies\\Walker\\Laser.mdl",
 15 texture TEXTURE_LASER             "Models\\Enemies\\Walker\\Laser.tex",
 16 model   MODEL_ROCKETLAUNCHER      "Models\\Enemies\\Walker\\RocketLauncher.mdl",
 17 texture TEXTURE_ROCKETLAUNCHER    "Models\\Enemies\\Walker\\RocketLauncher.tex",

// ************** SOUNDS **************
 50 sound   SOUND_SOLDIER_IDLE        "Models\\Enemies\\Walker\\Sounds\\Soldier\\Idle.wav",
 51 sound   SOUND_SOLDIER_SIGHT       "Models\\Enemies\\Walker\\Sounds\\Soldier\\Sight.wav",
 53 sound   SOUND_SOLDIER_FIRE_LASER  "Models\\Enemies\\Walker\\Sounds\\Soldier\\Fire.wav",
 54 sound   SOUND_SOLDIER_DEATH       "Models\\Enemies\\Walker\\Sounds\\Soldier\\Death.wav",
 55 sound   SOUND_SOLDIER_WALK        "Models\\Enemies\\Walker\\Sounds\\Soldier\\Walk.wav",

 60 sound   SOUND_SERGEANT_IDLE        "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Idle.wav",
 61 sound   SOUND_SERGEANT_SIGHT       "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Sight.wav",
 63 sound   SOUND_SERGEANT_FIRE_ROCKET "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Fire.wav",
 64 sound   SOUND_SERGEANT_DEATH       "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Death.wav",
 65 sound   SOUND_SERGEANT_WALK        "Models\\Enemies\\Walker\\Sounds\\Sergeant\\Walk.wav",

// ************** DEBRIS ************* 
 70 model   MODEL_WALKER_HEAD01     "Models\\Enemies\\Walker\\Debris\\Head01.mdl",
 71 model   MODEL_WALKER_HEAD02     "Models\\Enemies\\Walker\\Debris\\Head02.mdl",
 72 model   MODEL_WALKER_HEAD03     "Models\\Enemies\\Walker\\Debris\\Head03.mdl",
 73 model   MODEL_WALKER_HEAD04     "Models\\Enemies\\Walker\\Debris\\Head04.mdl",
 74 model   MODEL_WALKER_HEAD05     "Models\\Enemies\\Walker\\Debris\\Head05.mdl",
 75 model   MODEL_WALKER_LEG01      "Models\\Enemies\\Walker\\Debris\\Leg01.mdl",
 76 model   MODEL_WALKER_LEG02      "Models\\Enemies\\Walker\\Debris\\Leg02.mdl",
 77 model   MODEL_WALKER_LEG03      "Models\\Enemies\\Walker\\Debris\\Leg03.mdl",
 78 texture TEXTURE_DEBRIS01        "Models\\Enemies\\Walker\\Debris\\Debris01.tex",
 79 texture TEXTURE_DEBRIS02        "Models\\Enemies\\Walker\\Debris\\Debris02.tex",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANSV("A Biomech blew %s away"), (const char *) strPlayerName);
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier,  "Data\\Messages\\Enemies\\WalkerSmall.txt");
    static DECLARE_CTFILENAME(fnmSergeant, "Data\\Messages\\Enemies\\WalkerBig.txt");
    switch(m_EwcChar) {
    default: ASSERT(FALSE);
    case WLC_SOLDIER:   return fnmSoldier;
    case WLC_SERGEANT: return fnmSergeant;
    }
  }
  // overridable function to get range for switching to another player
  FLOAT GetThreatDistance(void)
  {
    return m_fThreatDistance;
  }

  void Precache(void) {
    CEnemyBase::Precache();

    PrecacheModel(MODEL_WALKER);

    if (GetSP()->sp_bGibs) {
      PrecacheModel(MODEL_WALKER_HEAD01);
      PrecacheModel(MODEL_WALKER_HEAD02);
      PrecacheModel(MODEL_WALKER_HEAD03);
      PrecacheModel(MODEL_WALKER_HEAD04);
      PrecacheModel(MODEL_WALKER_HEAD05);
      PrecacheModel(MODEL_WALKER_LEG01);
      PrecacheModel(MODEL_WALKER_LEG02);
      PrecacheModel(MODEL_WALKER_LEG03);
      PrecacheTexture(TEXTURE_DEBRIS01);
      PrecacheTexture(TEXTURE_DEBRIS02);
    }

    if (m_EwcChar==WLC_SOLDIER)
    {
      // sounds
      PrecacheSound(SOUND_SOLDIER_IDLE );
      PrecacheSound(SOUND_SOLDIER_SIGHT);
      PrecacheSound(SOUND_SOLDIER_DEATH);
      PrecacheSound(SOUND_SOLDIER_FIRE_LASER);
      PrecacheSound(SOUND_SOLDIER_WALK);
      // model's texture
      PrecacheTexture(TEXTURE_WALKER_SOLDIER);
      // weapon
      PrecacheModel(MODEL_LASER);
      PrecacheTexture(TEXTURE_LASER);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_CYBORG_LASER);
    }
    else
    {
      // sounds
      PrecacheSound(SOUND_SERGEANT_IDLE);
      PrecacheSound(SOUND_SERGEANT_SIGHT);
      PrecacheSound(SOUND_SERGEANT_DEATH);
      PrecacheSound(SOUND_SERGEANT_FIRE_ROCKET);
      PrecacheSound(SOUND_SERGEANT_WALK);
      // model's texture
      PrecacheTexture(TEXTURE_WALKER_SERGEANT);
      // weapon
      PrecacheModel(MODEL_ROCKETLAUNCHER);
      PrecacheTexture(TEXTURE_ROCKETLAUNCHER);
      // projectile
      PrecacheClass(CLASS_PROJECTILE, PRT_WALKER_ROCKET);
    }
  };
  /* Entity info */
  void *GetEntityInfo(void) {
		if (m_EwcChar==WLC_SOLDIER) {
			return &eiWalkerSO;
		} else {
			return &eiWalkerSE;
		}
  };

  FLOAT GetCrushHealth(void)
  {
    if (m_EwcChar==WLC_SERGEANT) {
      return 100.0f;
    }
    return 0.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
		if(dmtType==DMT_IMPACT || dmtType==DMT_BRUSH) {
			return;
		}

    // walker can't harm walker
    if (!IsOfClass(penInflictor, "Walker") ||
      ((CWalker*)penInflictor)->m_EwcChar!=m_EwcChar) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // virtual anim functions
  void StandingAnim(void) {
    DeactivateWalkingSound();
    StartModelAnim(WALKER_ANIM_STAND01, AOF_LOOPING|AOF_NORESTART);
  };
  void StandingAnimFight(void)
  {
    DeactivateWalkingSound();
    StartModelAnim(WALKER_ANIM_IDLEFIGHT, AOF_LOOPING|AOF_NORESTART);
  }
  void WalkingAnim(void) {
    ActivateWalkingSound();
    if (m_EwcChar==WLC_SERGEANT) {
      StartModelAnim(WALKER_ANIM_WALKBIG, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(WALKER_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    WalkingAnim();
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, WALKERSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, WALKERSOUND(SIGHT), SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, WALKERSOUND(DEATH), SOF_3D);
  };

  // walking sounds
  void ActivateWalkingSound(void)
  {
    if (!m_bWalkSoundPlaying) {
      PlaySound(m_soFeet, WALKERSOUND(WALK), SOF_3D|SOF_LOOP);
      m_bWalkSoundPlaying = TRUE;
    }
  }
  void DeactivateWalkingSound(void)
  {
    m_soFeet.Stop();
    m_bWalkSoundPlaying = FALSE;
  }

  // fire death rocket
  void FireDeathRocket(const FLOAT3D &vPos) {
    CPlacement3D plRocket;
    plRocket.pl_PositionVector = vPos;
    plRocket.pl_OrientationAngle = ANGLE3D(0, -5.0f-FRnd()*10.0f, 0);
    plRocket.RelativeToAbsolute(GetPlacement());
    CEntityPointer penProjectile = CreateEntity(plRocket, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_WALKER_ROCKET;
    penProjectile->Initialize(eLaunch);
  };
  // fire death laser
  void FireDeathLaser(const FLOAT3D &vPos) {
    CPlacement3D plLaser;
    plLaser.pl_PositionVector = vPos;
    plLaser.pl_OrientationAngle = ANGLE3D(0, -5.0f-FRnd()*10.0f, 0);
    plLaser.RelativeToAbsolute(GetPlacement());
    CEntityPointer penProjectile = CreateEntity(plLaser, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_CYBORG_LASER;
    penProjectile->Initialize(eLaunch);
  };



  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFeet.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire1.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire3.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire4.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
  };

  /* Adjust model shading parameters */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    if (GetSP()->sp_bMental) {
      if (GetHealth()<=0) {
				if (m_EwcChar==WLC_SERGEANT) {
					colAmbient = C_mlRED;
				} else {
					colAmbient = C_mlBLUE;
				}
      } else {
				if (m_bStretchModel) {
					if (m_EwcChar==WLC_SERGEANT) {
						GetModelObject()->mo_colBlendColor = C_mlRED|0;
					} else {
						GetModelObject()->mo_colBlendColor = C_mlBLUE|0;
					}		
				} else {
					GetModelObject()->mo_colBlendColor = C_dGRAY|0;
				}
			}
		} else {
			if (m_bStretchModel) {
				if (m_EwcChar==WLC_SERGEANT) {
					colAmbient = C_mlRED;
				} else {
					colAmbient = C_mlBLUE;
				}
			} else {
				colAmbient = C_dGRAY;
			}
			if( m_bFadeOut) {
				FLOAT fTimeRemain = m_fFadeStartTime + m_fFadeTime - _pTimer->CurrentTick();
				if( fTimeRemain < 0.0f) { fTimeRemain = 0.0f; }
				COLOR colAlpha;
				if(en_RenderType == RT_SKAMODEL || en_RenderType == RT_SKAEDITORMODEL) {
					colAlpha = GetModelInstance()->GetModelColor();
					colAlpha = (colAlpha&0xFFFFFF00) + (COLOR(fTimeRemain/m_fFadeTime*0xFF)&0xFF);
					GetModelInstance()->SetModelColor(colAlpha);
				}
				else {
					colAlpha = GetModelObject()->mo_colBlendColor;
					colAlpha = (colAlpha&0xFFFFFF00) + (COLOR(fTimeRemain/m_fFadeTime*0xFF)&0xFF);
					GetModelObject()->mo_colBlendColor = colAlpha;
				}       
			}
		}
		return FALSE;
  }

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  // spawn body parts
  void BlowUp(void)
  {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

		vNormalizedDamage = FLOAT3D(FRnd(),FRnd()*2.0f,FRnd());
		vBodySpeed = FLOAT3D(FRnd(),FRnd()*2.0f,FRnd());

    FLOAT fRnd = FRnd()*2.0f;

    // spawn debris
		if (m_EwcChar==WLC_SERGEANT) {
			Debris_Begin(EIBT_FLESH, DPT_NONE, BET_NONE, fEntitySize*0.8, -vNormalizedDamage*3, vBodySpeed, 0.5f, 1.0f);
			/*void Debris_Begin(EntityInfoBodyType Eeibt, enum DebrisParticlesType dptParticles,
				enum BasicEffectType  betStain, FLOAT fEntitySize,  const FLOAT3D &vSpeed,
				const FLOAT3D &vSpawnerSpeed, const FLOAT fConeSize,
				const FLOAT fSpeedUp, const COLOR colDebris=C_WHITE )*/
      if (fRnd<1) {
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD01, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD03, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD05, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
			  Debris_Spawn(this, this, MODEL_WALKER_LEG02, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
      } else {
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD02, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD04, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
			  Debris_Spawn(this, this, MODEL_WALKER_LEG01, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
			  Debris_Spawn(this, this, MODEL_WALKER_LEG03, TEXTURE_DEBRIS01, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*5.0f-2.5f, FRnd()*0.5f+0.5f, FRnd()*5.0f-2.5f)); 
      }
		} else {
			Debris_Begin(EIBT_FLESH, DPT_NONE, BET_NONE, fEntitySize*0.8f, -vNormalizedDamage, vBodySpeed, 0.5f, 1.0f);
      if (fRnd<1) {
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD01, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD03, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD05, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
			  Debris_Spawn(this, this, MODEL_WALKER_LEG02, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      } else {
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD02, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
			  Debris_Spawn(this, this, MODEL_WALKER_HEAD04, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
			  Debris_Spawn(this, this, MODEL_WALKER_LEG01, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
			  Debris_Spawn(this, this, MODEL_WALKER_LEG03, TEXTURE_DEBRIS02, 0, 0, 0, 0, 0.125f,
				  FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      }
		}
    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    DeactivateWalkingSound();
    // to fire
    StartModelAnim(WALKER_ANIM_TOFIRE, 0);
    m_fLockOnEnemyTime = GetModelObject()->GetAnimLength(WALKER_ANIM_TOFIRE);
    autocall CEnemyBase::LockOnEnemy() EReturn;

    // sergeant 4 rockets
    if (m_EwcChar==WLC_SERGEANT) {
      StartModelAnim(WALKER_ANIM_FIRERIGHT, AOF_LOOPING);
      ShootProjectile(PRT_WALKER_ROCKET, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire1, SOUND_SERGEANT_FIRE_ROCKET, SOF_3D);
      m_fLockOnEnemyTime = 2.0f;

      autocall CEnemyBase::LockOnEnemy() EReturn;
      StartModelAnim(WALKER_ANIM_FIRELEFT, AOF_LOOPING);
      ShootProjectile(PRT_WALKER_ROCKET, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
      PlaySound(m_soFire2, SOUND_SERGEANT_FIRE_ROCKET, SOF_3D);

//      m_fLockOnEnemyTime = 0.25f;
//      autocall CEnemyBase::LockOnEnemy() EReturn;
    } 
    if (m_EwcChar==WLC_SOLDIER) {
      m_iLoopCounter = 2;
      while(m_iLoopCounter>0) {
        if (m_iLoopCounter%2) {
          StartModelAnim(WALKER_ANIM_FIRELEFT, AOF_LOOPING);
          ShootProjectile(PRT_CYBORG_LASER, FIRE_LEFT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        } else {
          StartModelAnim(WALKER_ANIM_FIRERIGHT, AOF_LOOPING);
          ShootProjectile(PRT_CYBORG_LASER, FIRE_RIGHT_ARM*m_fSize, ANGLE3D(0, 0, 0));
        }
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
//        } else if (iChannel==2) {
//          PlaySound(m_soFire3, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
//        } else if (iChannel==3) {
//          PlaySound(m_soFire4, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 0.4f;
          } else {
            m_fLockOnEnemyTime = 0.1f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
    }
    StopMoving();

    MaybeSwitchToAnotherPlayer();

    // from fire
    StartModelAnim(WALKER_ANIM_FROMFIRE, 0);
    autowait(GetModelObject()->GetAnimLength(WALKER_ANIM_FROMFIRE));

    // wait for a while
    StandingAnimFight();
    autowait(FRnd()*0.1f+0.1f);

    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    // stop moving
    StopMoving();
    DeathSound();     // death sound
    DeactivateWalkingSound();

    // set physic flags
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags() | ENF_SEETHROUGH);

    // death notify (change collision box)
    ChangeCollisionBoxIndexWhenPossible(WALKER_COLLISION_BOX_DEATH);

    // start death anim
    StartModelAnim(WALKER_ANIM_DEATH, 0);
    autowait(0.9f);

    // one rocket/laser from left or right arm
    if (m_EwcChar==WLC_SERGEANT) {
      if (IRnd()&1) {
        FireDeathRocket(FIRE_DEATH_RIGHT*m_fSize);
      } else {
        FireDeathRocket(FIRE_DEATH_LEFT*m_fSize);
      }
      PlaySound(m_soSound, SOUND_SERGEANT_FIRE_ROCKET, SOF_3D);
    }
    if (m_EwcChar==WLC_SOLDIER) {
      if (IRnd()&1) {
        FireDeathLaser(FIRE_DEATH_RIGHT*m_fSize);
      } else {
        FireDeathLaser(FIRE_DEATH_LEFT*m_fSize);
      }
      PlaySound(m_soFire2, SOUND_SOLDIER_FIRE_LASER, SOF_3D);
    }

		autowait(0.2f);
		// start fading
    m_fFadeStartTime = _pTimer->CurrentTick();
		m_fFadeTime = 0.5f;
    m_bFadeOut = TRUE;
    autowait(0.4f);

    return EEnd();
  };

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
	
//	GetWalkerCoords();

    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    if (m_EwcChar==WLC_SERGEANT) {
      SetHealth(750.0f);
      m_fMaxHealth = 750.0f;
    } else {
      SetHealth(150.0f);
      m_fMaxHealth = 150.0f;
    }
    en_fDensity = 3000.0f;

    m_sptType = SPT_ELECTRICITY_SPARKS;
	 
		FLOAT fWhatever = 1.0f;
		if (m_bRandomSize) {
			fWhatever = Clamp(1.3f-(FRnd()*0.5f), 0.8f, 1.3f);
		}
 		if (m_bTemplate) {
			fWhatever = 0.1f;
		}     
    // set your appearance
    SetModel(MODEL_WALKER);
    if (m_EwcChar==WLC_SERGEANT) {
      m_fSize = 1.0f*fWhatever;
			if (m_bStretchModel) {
				m_fSize = 2.0f;
			}
      SetModelMainTexture(TEXTURE_WALKER_SERGEANT);
      AddAttachment(WALKER_ATTACHMENT_ROCKETLAUNCHER_LT, MODEL_ROCKETLAUNCHER, TEXTURE_ROCKETLAUNCHER);
      AddAttachment(WALKER_ATTACHMENT_ROCKETLAUNCHER_RT, MODEL_ROCKETLAUNCHER, TEXTURE_ROCKETLAUNCHER);
      GetModelObject()->StretchModel(FLOAT3D(m_fSize, m_fSize, m_fSize));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(WALKER_ATTACHMENT_ROCKETLAUNCHER_RT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-m_fSize, m_fSize, m_fSize));
      m_fBlowUpAmount = 1E10f;
      m_iScore = 7500;
      m_fThreatDistance = 15;
			m_fLagger = 2.5f;
    } else {
      m_fSize = 0.5f*fWhatever;
			if (m_bStretchModel) {
				m_fSize = 1.0f;
			}
      SetModelMainTexture(TEXTURE_WALKER_SOLDIER);
      AddAttachment(WALKER_ATTACHMENT_LASER_LT, MODEL_LASER, TEXTURE_LASER);
      AddAttachment(WALKER_ATTACHMENT_LASER_RT, MODEL_LASER, TEXTURE_LASER);
      GetModelObject()->StretchModel(FLOAT3D(m_fSize, m_fSize, m_fSize));
      ModelChangeNotify();
      CModelObject *pmoRight = &GetModelObject()->GetAttachmentModel(WALKER_ATTACHMENT_LASER_RT)->amo_moModelObject;
      pmoRight->StretchModel(FLOAT3D(-m_fSize, m_fSize, m_fSize));
      m_fBlowUpAmount = 1E10f;
      m_iScore = 2000;
      m_fThreatDistance = 5;
			m_fLagger = 2.0f;
    }
//    en_fStepDnHeight = -1;
//    m_fFallHeight = -1;
    m_fStepHeight = 10.0f; 

    StandingAnim();
    // setup moving speed
    /*m_fWalkSpeed = FRnd()*2.5f + 9.0f*fWhatever;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f)*fWhatever;
    m_fAttackRunSpeed = m_fWalkSpeed;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2*fWhatever;
    m_fCloseRunSpeed = m_fWalkSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2*fWhatever;*/
    m_fWalkSpeed = FRnd()*1.5f + 9.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*50.0f + 500.0f);
    m_fAttackRunSpeed = m_fWalkSpeed;
    m_aAttackRotateSpeed = m_aWalkRotateSpeed/2;
    m_fCloseRunSpeed = m_fWalkSpeed;
    m_aCloseRotateSpeed = m_aWalkRotateSpeed/2;
		m_fWalkSpeed/=2.0f;
    // setup attack distances
    m_fAttackDistance = 1000.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 15.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 1000.0f;
    // damage/explode properties
    m_fBodyParts = 8;
    m_fDamageWounded = 100000.0f;
    m_bDeaf = FALSE;    // deaf
    m_bBlind  = FALSE;    // blind
    m_bUseTactics = FALSE;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
