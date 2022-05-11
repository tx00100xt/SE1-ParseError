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

304
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/Trigger.h"
#include "EntitiesMP/MovingBrush.h"
#include "EntitiesMP/Box.h"
#include "EntitiesMP/PowerUpItem.h"
#include "EntitiesMP/Beast.h"
#include "EntitiesMP/Elemental.h"
#include "EntitiesMP/Walker.h"
extern INDEX hud_bShowPEInfo;
static const CPlayer *_penPlayer;
//extern CPlayer *_apenPlayers[NET_MAXGAMEPLAYERS];
%}


uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/PESpawnProjectile";
uses "EntitiesMP/OverLord";
uses "EntitiesMP/PESpawnerEG";

enum EnemySpawnerType {
  0 EST_SIMPLE          "Simple",           // spawns on trigger
  1 EST_RESPAWNER       "Respawner",        // respawn after death
  2 EST_DESTROYABLE     "Destroyable",      // spawns untill killed
  3 EST_TRIGGERED       "Triggered",        // spawn one group on each trigger
  4 EST_TELEPORTER      "Teleporter",       // teleport the target instead copying it - usable only once
  5 EST_RESPAWNERBYONE  "OBSOLETE - Don't use!",  // respawn only one (not entire group) after death
  6 EST_MAINTAINGROUP   "MaintainGroup",    // respawn by need to maintain the number of active enemies
  7 EST_RESPAWNGROUP    "RespawnerByGroup", // respawn the whole group when it's destroyed
};

enum EnemyType {
  0 ET_BONEMAN   "Boneman",      
  1 ET_HEADMAN   "Headman",    
  2 ET_EYEMAN    "Eyeman",  
  3 ET_WEREBULL  "Werebull",   
  4 ET_WALKER    "Walker",  
  5 ET_BEAST     "Beast",   
  6 ET_SCORPMAN  "Scorpman",  
  7 ET_ELEMENTAL "Elemental",
  8 ET_GIZMO     "Gizmo",   
  9 ET_FISH      "Fish",  
  10 ET_HARPY    "Harpy",
  11 ET_DEMON    "Demon",
  12 ET_CFREAK   "Chainsaw Freak",
  13 ET_GUFFY    "Guffy",
  14 ET_GRUNT    "Grunt",
};

class CEnemySpawner: CRationalEntity {
name      "Enemy Spawner";
thumbnail "Thumbnails\\EnemySpawner.tbn";
features  "HasName", "HasTarget", "IsTargetable";

properties:

  1 CEntityPointer m_penTarget  "Template Target" 'T'  COLOR(C_BLUE|0x20),        // template entity to duplicate
  2 CTString m_strDescription = "",
  3 CTString m_strName          "Name" 'N' = "Enemy spawner",
  
  6 RANGE m_fInnerCircle         = 0.0f,    // inner circle for creation
  7 RANGE m_fOuterCircle         = 0.0f,    // outer circle for creation
  9 FLOAT m_tmDelay              = 0.0f,      // how long to delay before spawning
 16 FLOAT m_tmSingleWait         = 0.1f,    // delay inside one group
  5 FLOAT m_tmGroupWait          = 0.1f,     // delay between two groups
 17 INDEX m_ctGroupSize         "Group Size (0 = No Group)"  'G' = 1,
  8 INDEX m_ctTotal             "Total Count (Before Enemy X)" 'C' = 1,        // max. number of spawned enemies
 13 CEntityPointer m_penPatrol  "Patrol target" 'P'  COLOR(C_lGREEN|0xFF),          // for spawning patrolling 
 15 enum EnemySpawnerType m_estType  = EST_SIMPLE,      // type of spawner
 18 BOOL m_bTelefrag  = FALSE,                  // telefrag when spawning
 19 BOOL m_bSpawnEffect "Spawn Sound Effect" 'S' = TRUE, // show effect and play sound
 20 BOOL m_bDoubleInSerious = FALSE,
 21 CEntityPointer m_penSeriousTarget  "Template for Serious"  COLOR(C_RED|0x20),
 22 BOOL m_bFirstPass = TRUE,
 
 50 CSoundObject m_soSpawn,    // sound channel
 51 INDEX m_iInGroup=0,        // in group counter for loops
 52 INDEX m_iEnemiesTriggered=0,  // number of times enemies triggered the spawner on death

 60 CEntityPointer m_penTacticsHolder,
 61 BOOL m_bTacticsAutostart = TRUE,

 // Parse Error chit
 100 BOOL  m_bPE = TRUE,
 101 enum  EnemyType m_etType = ET_BONEMAN,

 102 INDEX m_iCount = 0,
 103 INDEX m_ctEnemyMax = 0,
 104 INDEX m_iEnemyRadius = 0,
 105 INDEX m_ctEnemiesSpawned = 0,

 110 BOOL  m_bReduce "Reduce Enemy X by 1/2" = FALSE, // make an index?
 111 BOOL  m_bTriggered = FALSE,
 112 BOOL  m_bLimitFiringRange "Fire Only Up" 'U' = FALSE, // make an index?
 113 BOOL  m_bFireForwardOnly "Fire Only Forward" 'F' = FALSE,
 114 BOOL  m_bLinear = FALSE, // make an index?
 115 BOOL  m_bPerp = FALSE,
 116 BOOL  m_bMovingX = FALSE, // make an index?
 124 BOOL  m_bMovingY = FALSE,
 117 BOOL  m_bMovingZ = FALSE,
 118 BOOL  m_bReduceMore "Reduce Enemy X by 2/3" = FALSE,
 119 BOOL  m_bSpawnSeriousDamage = FALSE,
 120 BOOL  m_bHighlight = FALSE,
 123 BOOL  m_bFixup1 = FALSE,
 125 BOOL  m_bDestroy = FALSE,
 126 BOOL  m_bSetLevelMods = TRUE,
 127 BOOL  m_bSpawn2ndGroup = FALSE,
 128 BOOL  m_bSendUghEvents = FALSE,
 129 BOOL  m_bSendKarnak = FALSE,
 130 BOOL  m_bLetFall = TRUE,

 121 BOOL  m_bUseProjectile = FALSE,

 140 FLOAT m_tmWait = 0.0f,
 141 FLOAT SpawnerX = 0.0f, // make an array?
 142 FLOAT SpawnerY = 0.0f,
 143 FLOAT SpawnerZ = 0.0f,
 144 FLOAT SpawnerH = 0.0f,
 145 FLOAT SpawnerB = 0.0f,
 146 FLOAT SpawnerP = 0.0f,
 147 FLOAT fEntityR = 0.0f,
 148 FLOAT m_fFirePower "Fire Power" 'P' = 1.0f,
 149 FLOAT m_fEnemyMaxAdjuster "Enemy Max Adjuster" 'M' = 1.0f,
 150 FLOAT m_fMovingYHeight = 10.0f, // combine?
 151 FLOAT m_fMovingXZWidth = 40.0f,

 160 CEntityPointer  m_penDeathTarget,
 161 CEntityPointer m_penSpawnTarget,
 162 CEntityPointer m_penOverlord,


components:

  1 model   MODEL_ENEMYSPAWNER    "Models\\Editor\\EnemySpawner.mdl",
  2 texture TEXTURE_ENEMYSPAWNER  "Models\\Editor\\EnemySpawner.tex",
  3 sound   SOUND_TELEPORT        "Sounds\\Misc\\Teleport.wav",
  4 class   CLASS_PESPAWNPROJ			"Classes\\PESpawnProjectile.ecl",
  5 model   MODEL_BALL						"Models\\PESpawnProjectile\\PESpawnProjectile.mdl",
  6 texture TEXTURE_BALL					"Models\\PESpawnProjectile\\PESpawnProjectile.tex",
  7 texture TEXTURE_BALL1					"Models\\PESpawnProjectile\\PESpawnProjectile1.tex",
  8 texture TEXTURE_BALL2					"Models\\PESpawnProjectile\\PESpawnProjectile2.tex",
  9 texture TEXTURE_BALL3					"Models\\PESpawnProjectile\\PESpawnProjectile3.tex",
	10 class  CLASS_BASIC_EFFECT		"Classes\\BasicEffect.ecl",
  11 class  CLASS_BOX							"Classes\\Box.ecl",
	12 class  CLASS_POWERUP_ITEM		"Classes\\PowerUpItem.ecl",
	13 class  CLASS_PESPAWNEREG			"Classes\\PESpawnerEG.ecl",

functions:

  void Precache(void)
  {
    //SetSpawnFlags(0x0005000f);
    PrecacheSound(SOUND_TELEPORT);
    PrecacheClass(CLASS_PESPAWNPROJ);
    PrecacheModel(MODEL_BALL);
    PrecacheTexture(TEXTURE_BALL);
    PrecacheTexture(TEXTURE_BALL1);
    PrecacheTexture(TEXTURE_BALL2);
    PrecacheTexture(TEXTURE_BALL3);
  }

  const CTString &GetDescription(void) const
  {
    ((CTString&)m_strDescription).PrintF("-><none>");
    if (m_penTarget!=NULL) {
      ((CTString&)m_strDescription).PrintF("->%s", (const char *) m_penTarget->GetName());
      if (m_penSeriousTarget!=NULL) {
        ((CTString&)m_strDescription).PrintF("->%s, %s", 
          (const char *) m_penTarget->GetName(), (const char *) m_penSeriousTarget->GetName());
      }
    }
    ((CTString&)m_strDescription) = EnemySpawnerType_enum.NameForValue(INDEX(m_estType))
      + m_strDescription;
    return m_strDescription;
  }

  // check if one template is valid for this spawner
  BOOL CheckTemplateValid(CEntity *pen) {
    if (pen==NULL || !IsDerivedFromClass(pen, "Enemy Base")) {
      return FALSE;
    }
    if (m_estType==EST_TELEPORTER) {
      return !(((CEnemyBase&)*pen).m_bTemplate);
    } else {
      return ((CEnemyBase&)*pen).m_bTemplate;
    }
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
    if( slPropertyOffset == _offsetof(CEnemySpawner, m_penTarget)) {
      return CheckTemplateValid(penTarget);
    } else if( slPropertyOffset == _offsetof(CEnemySpawner, m_penPatrol)) {
      return (penTarget!=NULL && IsDerivedFromClass(penTarget, "Enemy Marker"));
    } else if( slPropertyOffset == _offsetof(CEnemySpawner, m_penSeriousTarget)) {
      return CheckTemplateValid(penTarget);
    }   
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }


  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    if (m_penTarget==NULL) { return FALSE; }
    m_penTarget->FillEntityStatistics(pes);
    pes->es_ctCount = m_ctTotal;
    pes->es_strName += " (spawned)";
    if (m_penSeriousTarget!=NULL) {
      pes->es_strName += " (has serious)";
    }
    return TRUE;
  }
  
  BOOL CanSpawn(void)
  {
		BOOL bResult = TRUE;
		FLOAT fLag = 0.0f;
		INDEX ctActiveSpawners = 0;

		// for each entity in the world
		{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				if (penEnemy->m_bHasBeenSpawned) {
					fLag += penEnemy->m_fLagger;
				}
			} else if (IsDerivedFromClass(pen, "Enemy Spawner")) {
				CEnemySpawner *penSpawner = (CEnemySpawner *)pen;
				if (penSpawner->m_bTriggered) {
					ctActiveSpawners++;;
				}
			}
		}}

		/*if (m_ctEnemiesSpawned == 10) {
			m_tmSingleWait /= 1.5f;
		}*/

		if (m_ctEnemiesSpawned < 1) {
			fLag *= 0.9f;
		}

		if (fLag > m_ctEnemyMax) {
			if (m_ctEnemiesSpawned < 1) {
				m_tmWait = 1.0f;
			} else {
				m_tmWait = 0.5f;
			}
			if (ctActiveSpawners > 10) {
				m_tmWait *= 2.0f;
			}
			bResult =  FALSE;
		} else {
			if (ctActiveSpawners > 5) {
				if (fLag < m_ctEnemyMax/2 && m_ctEnemiesSpawned > 4) {
					m_tmWait = m_tmSingleWait;
				} else {
					m_tmWait = m_tmSingleWait*2;
				}
				if (ctActiveSpawners > 10) {
					m_tmWait *= 2.0f;
				}
			} else {
				if (fLag < m_ctEnemyMax/2 && m_ctEnemiesSpawned > 4) {
					m_tmWait = m_tmSingleWait/2;
				} else {
					m_tmWait = m_tmSingleWait;
				}
			}
		}
		
		/*if (m_penOverlord != NULL) {
			FLOAT fLag = ((COverLord *) m_penOverlord.ep_pen)->m_fLag;
			if (fLag > m_ctEnemyMax) {
				if (m_ctEnemiesSpawned < 1) {
					m_tmWait = 1.0f;
				} else {
					m_tmWait = 0.5f;
				}
				bResult =  FALSE;
			} else {
				if (fLag < m_ctEnemyMax/2 && m_ctEnemiesSpawned > 5) {
					m_tmWait = m_tmSingleWait;
				} else {
					m_tmWait = m_tmSingleWait*2;
				}
			}
		}*/

		return bResult;
  };

	void FindMarker(void)
	{
		CEntity *penNew = NULL;
		FLOAT fMinDist = 50.0f;
		// for each sector this entity is in
		{FOREACHSRCOFDST(en_rdSectors, CBrushSector, bsc_rsEntities, pbsc) {
			// for each navigation marker in that sector
			{FOREACHDSTOFSRC(pbsc->bsc_rsEntities, CEntity, en_rdSectors, pen) {
				if (!IsOfClass(pen, "Enemy Marker")) { continue; }
				// get distance from source
				FLOAT fDist = (GetPlacement().pl_PositionVector - pen->GetPlacement().pl_PositionVector).Length();
				// if closer than best found
				if(fDist < fMinDist) {
					if (IsMarkerInFront(pen, CosFast(45.0f))) {
						penNew = pen;
						break;
					}
				}
			}
			ENDFOR;}
		}
		ENDFOR;}
		
		if (penNew!=NULL) {
			m_penPatrol = penNew;
		}
	}

  // determine if you can see a marker in front of you
  BOOL IsMarkerInFront(CEntity *penEntity, FLOAT fCosHalfFrustum) 
  {
		// get direction to the entity
		FLOAT3D vDelta = penEntity->GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector;
		// find front vector
		FLOAT3D vBack = -GetRotationMatrix().GetColumn(3);
		// make dot product to determine if you can see target (view angle)
		FLOAT fDotProduct = (vDelta/vDelta.Length())%vBack;
		if (fDotProduct >= fCosHalfFrustum) {
			if (IsMarkerVisible(penEntity)) {
				return TRUE;
			} else {
				return FALSE;
			}
		}
		return FALSE;
  };

  // cast a ray to entity checking only for brushes
  BOOL IsMarkerVisible(CEntity *penEntity) 
  {
    // get ray source and target
    FLOAT3D vSource = GetPlacement().pl_PositionVector;
		if (penEntity!=NULL) {
			FLOAT3D vTarget = penEntity->GetPlacement().pl_PositionVector;
			//GetPositionCastRay(this, penEntity, vSource, vTarget);
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

  void SetLevelMods(void) 
  {
    //  center of spawner
	  CEnemySpawner *penSpawner = this;
    CPlacement3D plSpawner;
	  plSpawner.pl_PositionVector = penSpawner->GetPlacement().pl_PositionVector;
		plSpawner.pl_OrientationAngle = penSpawner->GetPlacement().pl_OrientationAngle;

		// ( X, Y, Z ) Coords of Spawner
		SpawnerX = plSpawner.pl_PositionVector(1);
		SpawnerY = plSpawner.pl_PositionVector(2);
		SpawnerZ = plSpawner.pl_PositionVector(3);
		SpawnerH = plSpawner.pl_OrientationAngle(1);
		SpawnerP = plSpawner.pl_OrientationAngle(2);
		SpawnerB = plSpawner.pl_OrientationAngle(3);

    m_iCount = m_ctTotal;

    m_ctEnemyMax = GetSP()->sp_iEnemyMax;

    CTString strLevelName = _pNetwork->ga_fnmWorld.FileName();

    INDEX iExtra = GetGameEnemyMultiplier();
		BOOL  bExtra = TRUE;
		BOOL  bReduceEvenMore = FALSE;

    m_ctGroupSize = 0;
		m_bSpawn2ndGroup = TRUE;

    // specific target info for tweaks
    if (m_penTarget!=NULL) {
			m_penDeathTarget = ((CEnemyBase&)*m_penTarget).m_penDeathTarget;
      if (m_penTarget->en_pciCollisionInfo!=NULL) {
        fEntityR = m_penTarget->en_pciCollisionInfo->GetMaxFloorRadius();
        //fEntityR *= 0.8f;
        if (fEntityR<=0.5f) {
          fEntityR = 0.5f;
        }
        //CPrintF("Target: %s, EntityR = %g\n", m_penTarget->GetName(), fEntityR);
      }
      if ( IsDerivedFromClass(m_penTarget, "Demon"  )) {
        m_etType = ET_DEMON;
        bExtra = FALSE;
        m_bPE = FALSE;
        m_tmSingleWait = 0.2f;
      } else if ( IsDerivedFromClass(m_penTarget, "Beast"  )) {
        m_etType = ET_BEAST;
        bExtra = FALSE;
        m_bPE = FALSE;
        m_tmSingleWait = 0.2f; 
				if(((CBeast&)*m_penTarget).m_bcType==BT_BIG) {
					m_tmSingleWait = 1.0f; 
				}
      } else if ( IsDerivedFromClass(m_penTarget, "Elemental" )) {
        m_etType = ET_ELEMENTAL;
        bExtra = FALSE;
        m_bPE = FALSE;
        m_tmSingleWait = 0.2f; 
        if(((CElemental&)*m_penTarget).m_EecChar==ELC_LARGE) {
          m_tmSingleWait = 1.0f;
				} else {
          m_tmSingleWait = 0.3f;
				}
      } else if ( IsDerivedFromClass(m_penTarget, "Scorpman" )) {
        m_etType = ET_SCORPMAN;
        m_bReduceMore = TRUE;
        m_tmSingleWait = 0.2f;   
				m_fFirePower = 1.25f;
      } else if (IsDerivedFromClass(m_penTarget, "Guffy" )) {
        SpawnerY += 0.5f;
        m_etType = ET_GUFFY;
        m_bReduce = TRUE;
        m_tmSingleWait = 0.2f;   
      } else if (IsDerivedFromClass(m_penTarget, "Walker" )) {
        m_etType = ET_WALKER;
        if(((CWalker&)*m_penTarget).m_EwcChar==WLC_SERGEANT) {
          m_tmSingleWait = 0.3f;
				} else {
          m_tmSingleWait = 0.2f;
				}
        m_fFirePower = 1.5f;
				m_bReduce = TRUE;
      } else if ( IsDerivedFromClass(m_penTarget, "Werebull" )) {
        m_etType = ET_WEREBULL;
        m_tmSingleWait = 0.1f;
        //fEntityR = 2.0f;
      } else if ( IsDerivedFromClass(m_penTarget, "ChainsawFreak" )) {
        m_etType = ET_CFREAK;
        m_tmSingleWait = 0.1f;   
      } else if ( IsDerivedFromClass(m_penTarget, "Eyeman" )) {
        m_etType = ET_EYEMAN;
        m_tmSingleWait = 0.1f;
      } else if ( IsDerivedFromClass(m_penTarget, "Santa" )) {
        m_tmSingleWait = 0.5f;
      } else if ( IsDerivedFromClass(m_penTarget, "Fish" )) {
        m_etType = ET_FISH;
        m_tmSingleWait = 0.1f;
        m_fFirePower = 5.0f;
      } else if (IsDerivedFromClass(m_penTarget, "Headman" )) {
        m_etType = ET_HEADMAN;
        m_tmSingleWait = 0.1f; 
      } else if (IsDerivedFromClass(m_penTarget, "Grunt" )) {
        m_etType = ET_GRUNT;
        m_tmSingleWait = 0.1f; 
				m_bReduceMore = TRUE;
      } else if ( IsDerivedFromClass(m_penTarget, "Boneman" )) {
        m_etType = ET_BONEMAN;
        m_tmSingleWait = 0.1f;   
      } else if (IsDerivedFromClass(m_penTarget, "Gizmo" )) {
        m_etType = ET_GIZMO;
				if (m_fOuterCircle>1) {
					m_bPE = FALSE;
				}
				m_bReduce = TRUE;
        m_tmSingleWait = 0.05f; 
      } else if (IsDerivedFromClass(m_penTarget, "Woman" )) {
        m_etType = ET_HARPY;
        m_bReduce = TRUE;
        m_bPE = FALSE;
        //m_bAdjustOC = FALSE;
        m_tmSingleWait = 0.2f;   
      } else if (IsDerivedFromClass(m_penTarget, "CannonRotating" )
      || IsDerivedFromClass(m_penTarget, "CannonStatic" )) {
        bExtra = FALSE;
        m_bPE = FALSE;
      }
      //m_tmSingleWait /= 2;
      m_tmDelay = 0.0f;
    } else {
      m_bDestroy = TRUE;
    }

    // >>>>>>> LEVEL MODS <<<<<<<<<
    if (strLevelName=="1_1_Palenque") {
      m_bLimitFiringRange = FALSE;
		  m_ctEnemyMax *= 0.7f;
		  if (SpawnerX>480 && SpawnerX<500 && SpawnerY<26) { // kami and kleer after mask jump
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 0.5f;
      }
      if (SpawnerX>460 && SpawnerX<500 && SpawnerZ<-190) { // first room after mask jump
        if (m_etType!=ET_CFREAK) {
          m_tmDelay = 5.0;
          m_ctGroupSize = 2;
        }
      }
		  if (SpawnerX<420 || SpawnerX>720) { // beginning and ending valleys
		  	 m_ctEnemyMax *= 0.7f;
      }
      if (SpawnerY==23.625f) { // guffy's by pond
        SpawnerY += 20.0f;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 2.0f;
      }
      if (SpawnerZ==-33.0f) { // first kleer spawner coop
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 0.5f;
      }
      if (SpawnerX==1135.25f) { // scorps on island
        SpawnerX = 1228.0f;
        SpawnerZ = -82.5f;
        SpawnerH = 90.0f;
      }
    }
	  // The Valley of the Jaquar
	  else if (strLevelName=="1_2_Palenque") {
      m_ctEnemyMax *= 0.9f;
      if (SpawnerZ>400.0f) { // the valley
        //m_ctEnemyMax *= 0.9f;
      } else {
        m_bReduceMore = TRUE;
        m_ctEnemyMax *= 0.5f;
      }
      if (SpawnerZ<100 && SpawnerX>550) { // right jag area
        m_ctEnemyMax *= 1.3f;
        if (m_etType!=ET_HEADMAN) {
          m_ctTotal *= 2;
        }
        if (m_etType==ET_HARPY) { // birds that are dorkin up
          m_bPE = TRUE;
          m_bFireForwardOnly = TRUE;
          m_fFirePower = 3.0f;
        }
        if (SpawnerX>720 && m_etType!=ET_FISH) {
          SpawnerY -= 5.0f;
        }
        if (m_etType==ET_WEREBULL) {
          m_bFireForwardOnly = TRUE;
        }
      }
      if (SpawnerX==503.25f) { // first guffy's
        SpawnerY += 10.0f;
        m_bPE = FALSE;
        m_fOuterCircle = 6.0f;
      }
      if (SpawnerX==70.0f) { // first valley kleer
        m_bReduce = TRUE;
        m_bPE = FALSE;
      }
      if ( (SpawnerZ<-160 && SpawnerX>320) // valley upper right spawners
        || (SpawnerZ<-260 && SpawnerX<-260) // valley upper left spawners
        || (SpawnerZ>320 && SpawnerX<-370)) { // valley lower left spawners
        m_bFireForwardOnly = TRUE;
        //m_bUseProjectile = TRUE;
        SpawnerY += 20.0f;
        fEntityR = 20.0f;
        m_fFirePower = 2.0f;
      }
    }
    // The City of the Gods
    else if ( strLevelName == "1_3_Teotihuacan" ) {
      m_ctEnemyMax *= 0.8f;
      if (SpawnerZ<-100 && SpawnerZ>-200) { // kleer trap room
        m_ctEnemyMax *= 0.5f;
				m_bFireForwardOnly = TRUE;
				m_fFirePower = 0.5f;
				if (SpawnerX>-200) {
					SpawnerX = -201.0f;
					SpawnerY = -86.0f;
				} else {
					SpawnerX = -231.0f;
					SpawnerY = -86.0f;
				}
        //m_bPE = FALSE;
        //m_tmSingleWait = 0.2f;
      }
      if (SpawnerZ<-640 && SpawnerX<-300) { // last battle
				m_tmSingleWait *= 2;
        m_ctEnemyMax *= 1.3f;
      }
      if (SpawnerZ>270) { // major lag entry, and grunt area, sp
        m_ctEnemyMax *= 0.8f;
      }
      if (SpawnerZ>120 && SpawnerZ<270 && SpawnerX<-120) { // area before coop begin, sp
       m_ctEnemyMax *= 0.8f;
      }
      if (SpawnerX==-158.0f || SpawnerX==-238.0f || SpawnerX==-68.5f) { // bouncer spawners for sp
        m_fOuterCircle = 2.0f;
        m_bPE = FALSE;
      } 
      if (m_strName=="Walker Srg Trap spawner") { // walker trap for sp
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 1.0f;
      }
      if (SpawnerZ<-600 && SpawnerX>-300) { // area before last battle
        m_bPE = FALSE;       
      }
			if (GetSP()->sp_bCooperative) {
				if (SpawnerZ>270.0f || (SpawnerZ>120.0f && SpawnerX<-120.0f)) {
					m_bDestroy = TRUE;
				}
				if (SpawnerZ>120.0f || (SpawnerX<50.0f && SpawnerX>-120.0f)) {
					m_bDestroy = TRUE;
				}
			}
    }
    // The Serpent Yards
    else if (strLevelName=="1_4_Teotihuacan") {    
      m_ctEnemyMax *= 0.7f;
      m_bLimitFiringRange = FALSE;
      /*if (SpawnerZ>335) {  // first area
        m_ctGroupSize = 0;
      }*/
      if (SpawnerZ>440) { // beasts and guffy's on top of entry building
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 1.2f;
        m_ctEnemyMax += 5;
        if (SpawnerX<-280) {
          SpawnerH = 325.0f;
        } else {
          SpawnerH = 35.0f;
        }
      }
      if (SpawnerX==-434.125f) {  // guffy between buildings
        m_bFireForwardOnly = TRUE;
        //m_fFirePower = 1.0f;
      }
      if ((m_etType==ET_WALKER || m_etType==ET_GRUNT || m_etType==ET_WEREBULL) && SpawnerX>-700) {
        m_bFireForwardOnly = TRUE;
        //m_bUseProjectile = TRUE;
      }
      if (m_etType==ET_HARPY) {
        bExtra = FALSE;
        m_tmDelay = 0.0f;
      }
      if (m_etType==ET_BONEMAN && SpawnerZ>0) {
        m_ctEnemyMax += 5;
        m_bReduceMore = TRUE;
      }
      if (SpawnerX==-207.25f) {  // kleer behind building in first area
        SpawnerX -= 34.0f;
      }
      if (SpawnerZ<325 &&SpawnerZ>265 && m_etType==ET_GRUNT) { // after first area
        m_ctGroupSize = 1;
      }
      if (SpawnerX==-582.75f || SpawnerZ==-262.5f   // switch critters    
        || SpawnerX==-527.375f || SpawnerX==-522.5f || SpawnerX==-564.0f) {
        m_ctGroupSize = 1;
      }
    }
    // The Pit
    else if (strLevelName=="1_5_Teotihuacan") {
      if (SpawnerX<-200) {
        m_fOuterCircle = 8.0f;
        m_bPE = FALSE;
        m_bPerp = TRUE;
      }
      if (SpawnerX<65 && SpawnerX>0 && SpawnerZ<150) { // bouncy room
        m_ctEnemyMax *= 1.3f;
        if (m_etType==ET_BONEMAN) {
          m_ctTotal *= 2;
        }
      }
      if (SpawnerX<120 && SpawnerX>0 && SpawnerY<-60 && SpawnerY>-110 && SpawnerZ>235) { // barrel room
        //fY = 5.0f;
        //m_ctEnemyMax *= 1.1f;
        m_ctTotal *= 2;
        m_bPE = TRUE;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 1.0f;
        if (m_etType==ET_GIZMO) {
          m_bReduce = TRUE;
          //m_ctEnemyMax *= 1.1f;
          m_fFirePower = 2.0f;
        }
      }
      if (SpawnerX<60 && SpawnerX>-30 && SpawnerZ<230 && SpawnerX>160) { // tilt room
        m_ctEnemyMax *= 0.7f;
        m_bReduce = TRUE; 
      }
      if (SpawnerX<-40 && SpawnerZ>150) { // the tower area sp
        m_ctEnemyMax *= 0.8f;
        m_bReduce = TRUE;
      }
      if (SpawnerX<390 && SpawnerX>150) { // mech arena
        m_ctEnemyMax *= 0.5f;
        m_bReduce = TRUE;
        m_bFireForwardOnly = TRUE;
        SpawnerY += 5.0f;
      }
      if (SpawnerX>400) {  // end battle
        m_iCount++;
        m_ctEnemyMax *= 0.8f;
        if (SpawnerX>800 || SpawnerX<500 ||
            SpawnerZ<130 || SpawnerZ>380) {
          if (SpawnerY>-180) {
            m_fFirePower = 1.5f;
            m_bFireForwardOnly = TRUE;
          } else {
            SpawnerZ -= 35.0f;
            m_bPE = FALSE;
            m_bLinear = TRUE;
            m_fOuterCircle = 40.0f;
          }
        }
        if (m_etType==ET_GRUNT) {
          m_bReduce = TRUE;
        }
      }
      if (m_strDescription=="Simple->Gizmo N Temp") { // first room after pool frogs
        m_ctTotal *= 4;
      }
      if (SpawnerZ>-25 && SpawnerZ<50) { // area after frogs
        m_ctGroupSize = 1;
      }
      if (SpawnerX>-160 && SpawnerX<-80 && SpawnerZ<-110) { // first area after pool
        if (m_etType==ET_GRUNT) {
          m_ctGroupSize = 1;
        }
      }
      if (m_strDescription=="RespawnerByGroup->Boneman Rot Exit Fight Temp") { // kleer loop room
        m_ctTotal *= 4;
        m_ctEnemyMax *= 0.8f;
      }
      if (SpawnerX==52.25f) {
        m_bFixup1 = TRUE;
        m_ctGroupSize = 10;
      }
      if (m_etType==ET_GRUNT) {
        m_bReduce = TRUE;
      }
			if (SpawnerX<-40.0f && SpawnerZ>145.0f) {
				m_bDestroy = TRUE;
			}
			if (m_strDescription=="Simple->Fish N Temp") {
				m_bDestroy = TRUE;
			}

    }
    // The Ziggurrat	
    else if (strLevelName=="2_1_Ziggurrat") {
      if (SpawnerZ<0 && SpawnerZ>-260) {
        m_ctEnemyMax *= 1.2f;
      }
      if ((SpawnerX>120 || SpawnerX<-120) && SpawnerZ>-250) {
        m_ctEnemyMax *= 1.2f;
      }
      if (m_strName=="Crusher spawner") {
        SpawnerY -= 8.0f;
        if (SpawnerX>-20) {
          SpawnerX -= 13.0f;
          SpawnerH += 90.0f;
        } else {
          SpawnerX += 13.0f;
          SpawnerH -= 90.0f;
        }
      }
      if (m_etType==ET_GIZMO) { // frogs
        m_bReduce = TRUE;
        m_bPE = FALSE;
        if (SpawnerZ>370) {
          if (SpawnerX>-20) {
            m_bPE = TRUE; 
            SpawnerX -= 10.0f;
          } else {
            SpawnerX += 10.0f;
          }
        }
      }
      if (SpawnerZ<-380 && SpawnerX>-32 && SpawnerX<32) { // end battle
        m_ctEnemyMax *= 0.7f;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 0.4f;
      }
      if (SpawnerZ>125) {
        m_ctEnemyMax *= 0.8f;
      }
      if (SpawnerZ>300) {
        m_ctEnemyMax *= 0.8f;
      }
      if (SpawnerZ<120 && SpawnerZ>12) {
        m_ctEnemyMax *= 0.5f;
      }
      if (SpawnerZ==109.0f) {
        m_tmDelay = 2.0f*iExtra;
        bExtra = FALSE;
        m_bReduce =  FALSE;
      }
      if (SpawnerY<8 && m_bLimitFiringRange) {
        m_bLimitFiringRange = FALSE;
      }
      if (m_strDescription=="Respawner->Boneman ND Coop Count") { // kleer trap room
				SpawnerX = 0.0f;
				SpawnerY = 19.0f;
        SpawnerZ = -360.0f;
        m_fOuterCircle = 13.0f;
        m_bPE = FALSE; 
        m_ctEnemyMax *= 0.6f;
      }
      if (m_etType==ET_BEAST && SpawnerY>40) {
        m_bPE = FALSE;
        bExtra = FALSE;
      }
      if (m_strName=="Chainsaw spawner 4 Coop" ||
          m_strName=="Kamikaze 4 spawner Coop" ||
          m_strDescription=="Respawner->Boneman NBD Count Column room") {
        SpawnerZ -= 24.0f;
        m_fOuterCircle = 10.0f;
        m_bPE = FALSE;
        m_bPerp = TRUE;
        m_ctEnemyMax *= 1.5f;
        if (SpawnerZ<50) {
          if (SpawnerX>0) {
            SpawnerX -= 13.0f;
            SpawnerH += 90.0f;
          } else {
            SpawnerX += 13.0f;
            SpawnerH -= 90.0f;
          }
        } else {
          if (SpawnerX<0) {
            SpawnerX -= 13.0f;
            SpawnerH += 90.0f;
          } else {
            SpawnerX += 13.0f;
            SpawnerH -= 90.0f;
          }
        }
      }
    }
    // The Elephant Atrium
	  else if (strLevelName=="2_2_Persepolis") {
      m_ctEnemyMax *= 0.9f;
      if (m_strDescription=="MaintainGroup->Kamikaze Brush Temp" ) { // moving brush kamis
        SpawnerX = 140.0f;
        SpawnerY = 35.0f;
        SpawnerZ = 448.0f;
        m_bMovingX = TRUE;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 2.0f;
      }
      if ( m_strDescription=="MaintainGroup->Boneman ND Flying Count Temp" ) { // moving brush kleer
        SpawnerX = 70.0f;
        SpawnerY = 30.0f;
        SpawnerZ = 160.0f;
        m_bMovingZ = TRUE;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 0.8f;
      }
      if (m_etType==ET_BEAST || m_etType==ET_DEMON) {
        if (SpawnerX>-140 && SpawnerY>5 && SpawnerZ>176 && SpawnerZ<430) {  // beasts and demons, first area
          m_bFireForwardOnly = TRUE;
          m_fFirePower = 1.5f;
        }
        if (SpawnerX==74.25f) {  // beast up high first outside area
          SpawnerX = 148.0f;
          SpawnerY = 40.0f;
          SpawnerZ = 456.0f;
          m_bFireForwardOnly = TRUE;
          m_fFirePower = 1.5f;
        }
        if (SpawnerX==-174.25f) {  // beast up high next to below
          m_bPE = FALSE;
          bExtra = FALSE;
          m_bReduce =  FALSE;
        }
        if (SpawnerX==-240.25f) {  // beast up high on top of blown up building
          m_bDestroy = TRUE;
        }
      }
      if (m_etType==ET_SCORPMAN || m_etType==ET_BEAST || m_etType==ET_DEMON) { // scorps, beasts, demons
        if (SpawnerY<7) {
          m_bLimitFiringRange = FALSE;
        }
      }
      if (SpawnerX>-113 && SpawnerX<-110 && SpawnerZ>130) {  // scorp and eyeman spawner inside
        m_tmDelay = 7.0f*iExtra;
        m_ctGroupSize = 1;
      }
      if (SpawnerX==0.75f) {  // friggin walker after bath
        SpawnerZ += 70.0f;
      }
      if (m_etType==ET_GIZMO) {
        m_tmSingleWait *= 2;
      }
    }
    // The Courtyards of Gilgamesh
    else if (strLevelName=="2_3_Persepolis") {
      m_ctEnemyMax *= 0.9f;
      if (SpawnerZ<-720) { // end battle
        m_ctEnemyMax *= 1.3f;
        if (m_etType==ET_HARPY) {
          m_bReduceMore = TRUE;
        }
        if (SpawnerZ==-992.0f) {
          m_tmSingleWait = 0.025f;
          m_fFirePower = 2.0f;
          m_bReduce = TRUE;
        }
        // The Grand Finale
        if (SpawnerZ==-1254.5f) { // red mechs
          m_bPE = FALSE;
          m_ctTotal *= 2;
          //m_tmDelay = 7.0f*iExtra;
          m_fOuterCircle = 40.0f;
          m_tmSingleWait = 0.3f;
          SpawnerZ -= 43.0f;
        }
        if (m_strDescription=="Triggered->Walker small") { // small walkers
          m_bPE = FALSE;
          //m_ctTotal *= 2;
          //m_tmDelay = 5.0f*iExtra;
          m_tmSingleWait = 0.2f;
          if (SpawnerX==62.5f) {
            m_fOuterCircle = 30.0f;
          }
          if (SpawnerX==127.0f) {
            m_fOuterCircle = 30.0f;
            SpawnerX -= 50.0f;
            SpawnerZ -= 5.0f;
          }
          if (SpawnerX==-4.0f) {
            m_fOuterCircle = 35.0f;
            SpawnerX  += 53.0f;
            SpawnerZ -= 8.0f;
          }
        }
        if (SpawnerZ==-1146.0f) { // bulls
          m_tmSingleWait = 0.1f;
          m_bPE = FALSE;
          m_ctTotal *= 3;
          //m_tmDelay = 3.0f*iExtra;
        }
      }
      if (SpawnerZ<-496 && SpawnerY>-10) { // area next to end battle
        m_ctEnemyMax *= 1.15f; 
      }
      if (SpawnerX==-332.0f || SpawnerX==-329.0f) { // kleer in laser room 
        SpawnerY += 12.0f;
        SpawnerZ += 40.0f;
        m_fOuterCircle = 10.0f;
        m_bPE = FALSE;
      }
      /*if (m_etType==ET_BEAST && SpawnerY>10) {
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 2.3f;
      }*/
      if (SpawnerZ>-502.0f && SpawnerZ<-498.0f) { // guffy's before last battle
        SpawnerH += 180.0f;
        SpawnerZ -= 30.0f;
        m_fOuterCircle = 15.0f;
        m_bPE = FALSE;
      }
      if (SpawnerZ==-267.75f) { // scorps after winged lion
        SpawnerZ += 8.0f;
      }
      if (SpawnerZ==-308.5f) { // hallway kleer spawner
        m_bReduce = TRUE;
      }
      if (SpawnerX==107.0f) { // hallway bull spawner
        m_bPE = FALSE;
        m_bLinear = TRUE;
        m_fOuterCircle = 6.0f;
      }
      if (SpawnerX>30 && SpawnerZ<-335 && SpawnerZ>-430) { // floor fall lower levels
        if (SpawnerY<-56) {
          //m_ctGroupSize = 2;
          if (m_etType==ET_SCORPMAN) {
            m_ctGroupSize = 1;
            //m_tmDelay = 2.0f+iExtra;
          }
          /*if (m_etType==ET_GIZMO) {
            m_bUseProjectile = TRUE;
          }*/
        }
      }
      if (SpawnerX==-240.25f) {  // major CT oops with the big beast temp
			  m_iCount = 0;
			}
      if (SpawnerX==68.5f || SpawnerZ==-239.0f) {  // grunts after lion
			  m_ctGroupSize = 2;
			}
      if (SpawnerX==83.5f || SpawnerX==122.625f || SpawnerZ==-235.25f) {  // kleer and lava golem after heart trap
			  m_ctGroupSize = 1;
        m_tmDelay = 3.0f*iExtra;
			}
      if (SpawnerZ<-290 && SpawnerZ>-330) { // hallway
        m_ctEnemyMax *= 0.8f; 
      }
      if (SpawnerZ==-318.0f) { // guffy before this is getting serious
        SpawnerZ = -307.0f; 
      }
    }
    // The Tower of Babel
    else if (strLevelName=="2_4_TowerOfBabylon") {
		  m_ctEnemyMax *= 0.8f;
      /*if (SpawnerZ>630) { // first battle
        m_bUseProjectile = TRUE;
      }*/
      if (SpawnerZ>470 && SpawnerZ<624) { // staircase area
			  m_ctEnemyMax *= 0.9f;        
        if (SpawnerY>-30) {
          bExtra = FALSE;
          m_bPE = FALSE;
          m_bLetFall = FALSE;
        } else {
          m_bReduce = TRUE;
          m_bFireForwardOnly = TRUE;
          if (m_etType==ET_SCORPMAN) {
            m_bFireForwardOnly = FALSE ;
            if (SpawnerX==42.25f) {
              SpawnerX = 17.5f;
              SpawnerZ = 586.5f;
              SpawnerH = 345.0f;
            } else {
              SpawnerX = 24.0f;
              SpawnerZ = 528.0f;
              SpawnerH = 168.0f;
            }
          }
        }
      }
      if (SpawnerZ<470 && SpawnerZ>370) { // kleer in hallway
        m_ctTotal *= 2;
        m_tmSingleWait /= 2;
      }
      /*if (SpawnerZ<370 && SpawnerZ>300) { // trap room
        m_bUseProjectile = TRUE;
        m_bFireForwardOnly = FALSE;
      }*/
      if (SpawnerZ<300) { // outside
				//m_penPatrol = NULL;
				m_ctEnemyMax *= 0.8f;
        //m_bUseProjectile = TRUE;
        //m_bFireForwardOnly = TRUE;
        if (SpawnerZ>68 && SpawnerZ<78 && SpawnerX<-134) { // bomberman dorkin it up before first tablet
			    SpawnerZ += 10.0f;
        }
        if (SpawnerX==-129.5f) { // same as a above
          SpawnerX -= 10.0f;
          SpawnerZ += 10.0f;
        }
        if (/*m_etType==ET_WALKER && */SpawnerY>6) { // mechs up high
          m_bFireForwardOnly = TRUE;
          //m_bUseProjectile = FALSE;
					m_fFirePower = 0.8f;
          SpawnerY += 5.0f;
          if (SpawnerX==205.0f) {
            SpawnerH = 135.0f;
          }
          if (SpawnerX==216.5f) {
            SpawnerH = 90.0f;
          }
          if (SpawnerX==215.75f) {
            SpawnerX = 206.0f;
            SpawnerZ = -229.0f;
            SpawnerH = 90.0f;
          }
          if (SpawnerX==215.0f) {
            SpawnerX = 198.0f;
            SpawnerZ = -232.0f;
            SpawnerH = 180.0f;
          }
          if (SpawnerX==198.375f) {
            SpawnerX = 196.0f;
            SpawnerZ = -28.0f;
            SpawnerH = 90.0f;
          }
        }
        if (SpawnerX==-170.0f) { // scorp dorkin up by the first tablet
          m_bFireForwardOnly = TRUE;
        }
        if (m_strDescription=="Simple->Gizmo Secret  Temp") {
          //m_tmDelay = 1.0f*FRnd();
					m_ctGroupSize = 1;
          m_bPE = FALSE;
          m_bReduce = TRUE;
          m_bUseProjectile = FALSE;
          m_tmSingleWait = 0.3f;
          //CPrintF("m_tmDelay: %g\n", m_tmDelay);
        }
        if (m_etType==ET_HEADMAN && SpawnerX>-15 && SpawnerX<60 && SpawnerZ<-120) { // too many damn bomberman 
			    m_bReduce = TRUE;
        }
        if (m_etType==ET_HEADMAN && SpawnerX>65 && SpawnerZ<10) { // damn shit gettin set off early 
			    m_ctGroupSize = 1;
        }
        if (m_etType==ET_HEADMAN && SpawnerX>120 && SpawnerZ>65) { // damn shit gettin set off early 
			    m_ctGroupSize = 1;
        }
        if (SpawnerX==130.625f) { // chainsaw freak, same as above
          m_ctGroupSize = 1;
        }
        if (m_etType==ET_HEADMAN && SpawnerX>120 && SpawnerZ>65) { // damn shit gettin set off early 
			    m_ctGroupSize = 2;
        }
        /*if (m_etType==ET_HARPY) {
          m_bUseProjectile = FALSE;
        }*/
        if (SpawnerX>-20 && SpawnerX<-5 && SpawnerZ>108 && SpawnerZ<200) { // bulls by bridge
			    SpawnerX -= 20.0f;
        }
				if (m_ctGroupSize<=0) {
					m_ctGroupSize = 5;
				}
      }
    }
    // The Citadel
    else if (strLevelName=="3_1_GothicCastle") {
      m_ctEnemyMax *= 0.6f;
      m_bReduce = TRUE;
      // gizmo teleporters fuckin up
			if (m_strDescription=="Teleporter->Gizmo Stealer") {
				m_bSpawnSeriousDamage = TRUE;
				SpawnerX = 0;
				SpawnerY = -5.0f;
				SpawnerZ = -264.0f;
			}
			if (SpawnerZ==-4.5f) {
				m_bSpawnSeriousDamage = TRUE;
				SpawnerX = 114.0f;
				SpawnerY = 5.0f;
				SpawnerZ = 11.0f;
			}
			if (SpawnerZ==5.75f) {
				m_bSpawnSeriousDamage = TRUE;
				SpawnerX = 114.0f;
				SpawnerY = 5.0f;
				SpawnerZ = 25.0f;
			}
      if (SpawnerZ<-530) { // first area
        //m_bUseProjectile = TRUE;
        m_bFireForwardOnly = TRUE;
        //m_fFirePower = 0.5f;
      }
      /*if (SpawnerZ>-530 && SpawnerZ<-500) { // first inside area, grunts
        m_bUseProjectile = TRUE;
      }*/
      if (SpawnerZ>-460 && SpawnerZ<-164) { // second outside area
        m_bFireForwardOnly = TRUE;
        m_bLetFall = FALSE;
        if (SpawnerY==-12.75f) { // Guffy on Bridge
          SpawnerZ -= 5.0f;
          m_bPE = FALSE;
          m_fOuterCircle = 4.0f;
        }
        if (SpawnerZ<-316 && SpawnerZ>-317) { // grunts next to bridge
          m_bPE = FALSE;
          m_tmSingleWait = 1.0f;
        }
      }
      if (SpawnerZ>-164) { // castle surrounding area
        m_tmSingleWait *= 2;
        //m_ctGroupSize = 1;
        //m_bUseProjectile = TRUE;
        //m_fFirePower = 0.5f;
        if (SpawnerX>-40 && SpawnerX<40 && SpawnerZ>-66 && SpawnerZ<66) { // castle 
          m_tmSingleWait *=2;
          m_ctEnemyMax *= 0.7f;
          if (SpawnerY>50) { // last area
            m_bReduceMore = TRUE;
            m_ctEnemyMax *= 0.7f;
            m_tmDelay = 6.0f*iExtra;
            m_fFirePower = 0.5f;
            m_bFireForwardOnly = TRUE;
            m_bUseProjectile = FALSE;
            m_ctGroupSize = 1;
          }
        }
        if (SpawnerZ==61.375f) { // mechs gettin stuck
          SpawnerZ -= 15.0f;
        }
        if (SpawnerZ==60.875f) { // bulls gettin stuck
          SpawnerZ -= 15.0f;
        }
        if (SpawnerX==79.75f) {
          m_bPE = FALSE;
          m_fOuterCircle = 4.0f;
          m_bUseProjectile = FALSE;
        }
        if (SpawnerZ>66 && SpawnerX>-37) {
          m_ctGroupSize = 1;
          if (SpawnerX==112.5f || SpawnerX==113.0f) {
            m_bPE = FALSE;
            SpawnerH = 0.0f;
            m_fOuterCircle = 8.0f;
            m_bUseProjectile = FALSE;
          }
          if (SpawnerY<-1) {
            m_bPE = FALSE;
            m_bUseProjectile = FALSE;
          }
          /*if (m_etType==ET_BONEMAN && SpawnerX<50) {
            m_tmDelay = 2.0f*iExtra;
          }
          if (m_etType==ET_GRUNT && SpawnerX<50) {
            m_tmDelay = 1.0f*iExtra;
          }*/
          if (SpawnerX==34.5f) { // freaks too damn close to walls
            m_bPE = TRUE;
            m_bUseProjectile = FALSE;
            SpawnerX = 40.0f;
            SpawnerY = -14.0f;
            SpawnerZ = 152.0f;
          }
          if (SpawnerX==66.0f) { // freaks too damn close to walls
            m_bPE = TRUE;
            m_bUseProjectile = FALSE; 
            SpawnerX = 59.0f;
            SpawnerY = -14.0f;
            SpawnerZ = 140.0f;
            SpawnerP = 0.0f;
          }
        }
        if (m_etType==ET_GIZMO || m_etType==ET_BEAST || m_etType==ET_DEMON) {
          m_bPE = FALSE;
          m_bUseProjectile = FALSE;
        }
        if (m_etType==ET_HEADMAN) {
          m_bReduce = TRUE;
        }
      }
      if (SpawnerX==-85.875f) { // kleer nobody ever gets
        //m_bUseProjectile = TRUE;
        SpawnerX = -123.0f;
        SpawnerY = 1.0f;
        SpawnerZ = 100.0f;
        SpawnerH = 225.0f;
      }
			if (m_ctGroupSize<=0) {
				m_ctGroupSize = 3;
			}
      if (m_strDescription=="MaintainGroup->Boneman Guardian N Temp") { // kleer gettin stuck before entering castle
        m_bPE = TRUE;
        m_bUseProjectile = FALSE;
        m_bFireForwardOnly = FALSE;
        if (SpawnerX<-100) {
          SpawnerX += 14.0f;
          SpawnerY = 1.0f;
          SpawnerZ -= 17.0f;
        } else {
          SpawnerX -= 36.0f;
          SpawnerY = 1.0f;
          SpawnerZ -= 10.0f;
        }
      }
      if (SpawnerZ==-452.0f) { // bridge kleer spawners
        SpawnerZ += 27.0f;
        SpawnerY += 5.0f;
        m_bFireForwardOnly = TRUE;
        m_bUseProjectile = FALSE;
      }
      if (SpawnerX>66 && SpawnerX<160 && SpawnerZ>-160 && SpawnerZ<-66) {
        if (m_etType!=ET_CFREAK) {
          m_ctGroupSize = 2;
          m_ctEnemyMax *= 0.8f;
          m_bPE = TRUE;
          m_bReduceMore = TRUE;
          m_bUseProjectile = FALSE;
        }
      }
    }
    // Land of the Damned	
    else if (strLevelName=="3_2_LandOfDamned") {
      if (SpawnerZ>3000) { // end area
        /*if (m_etType!=ET_DEMON) {
          m_bUseProjectile = TRUE;
        }*/
      } else {
        if (m_etType==ET_HEADMAN) {
          m_bReduce = TRUE;
        }
        /*if (SpawnerZ>-160) {
          m_bUseProjectile = TRUE;
        }*/
        if (SpawnerX>339 && SpawnerX<560 && SpawnerZ<-300) { 
          m_ctGroupSize = 1;
          m_bReduce = TRUE;
          m_ctEnemyMax *= 0.8f;
        }
        if (m_strDescription=="Simple->Huge Beast Temp") {
          SpawnerY += 80.0f;
          m_bPE = FALSE;
			    m_fOuterCircle = 40.0f;
			    m_fInnerCircle = 30.0f;
        }
        if (m_strDescription=="Respawner->WalkerS N Temp") {
          m_bFireForwardOnly = TRUE;
        }
      }
      if (SpawnerX<290.0f && SpawnerZ<200.0f) {
        m_bDestroy = TRUE;
      }
    }
    // The Grand Cathederal
    else if (strLevelName=="3_3_CorridorOfDeath") {
      m_ctEnemyMax *= 0.8f;
      m_tmSingleWait *= 2;
      /*if (SpawnerX>260 && SpawnerX<372 && SpawnerZ>-200) {
        m_ctGroupSize = 1;
      }*/
      if (SpawnerX>-307 && SpawnerX<-295) { // raise the walkers in the bouncer area to keep em from gettin stuck
        SpawnerY += 25.0f;
        SpawnerX += 15.0f;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 1.0f;
      }
      if (m_etType==ET_HEADMAN || m_etType==ET_GRUNT) { // too many kamis and grunts
        m_bReduce = TRUE;
        if (SpawnerZ>-80 && SpawnerX>550) { // grunts in first area
          m_bReduceMore = TRUE;
        }
      }
      if (SpawnerX<-305) { // open yard before cathederal
        m_ctEnemyMax *= 1.2f;
        if (m_strDescription=="Simple->Lava Boss") { // only need one of these bad boys
          m_ctTotal = 1;
        } else {
          SpawnerY += 20.0f;
          /*if (m_etType!=ET_BEAST || m_etType!=ET_DEMON) {
            m_bFireForwardOnly = TRUE;
            m_bUseProjectile = TRUE;
            fEntityR = 60.0f;
            m_fFirePower = 2.5f;
          }*/
        }
      }
      if (SpawnerY<-10) { // secret areas
        m_ctEnemyMax += 30;
        if (m_etType==ET_BEAST) {
          bExtra = TRUE;
          m_bReduce = TRUE;
        }
      }
      if (SpawnerX==381.0f) { // kleer on roof by beasts
        m_bFireForwardOnly = TRUE;
      }
      if (m_etType==ET_BEAST && SpawnerX>-288 && SpawnerX<-100) { // beasts in bouncer area
        bExtra = TRUE;
        m_bReduce = TRUE;
        m_bPE = FALSE;
        m_bLinear = TRUE;
        m_fInnerCircle = 5.0f;
        m_fOuterCircle = 30.0f;
        if (SpawnerX==-273.5f) {
          SpawnerX += 20.0f;
        }
        if (SpawnerX==-277.5f) {
          SpawnerX -= 20.0f;
        }
        if (SpawnerX==-113.0f) {
          SpawnerX += 20.0f;
        }
        if (SpawnerX==-129.5f) {
          SpawnerX += 10.0f;
        }
      }
      if (m_etType==ET_BONEMAN && SpawnerX>400) {
        m_ctEnemyMax += 5;
        m_bReduce = TRUE;
      }
    }
    // Portals Canyon
    else if (strLevelName=="zzcanyon") {      
      m_bPE = FALSE;
      m_bUseProjectile = FALSE;
      if (SpawnerX>380 && SpawnerZ<200 && SpawnerZ>110) { // inside critters
        m_ctEnemyMax *= 1.2f;
      } else {
        m_ctEnemyMax *= 0.8f;
      }
      if (SpawnerZ==508.0f) { // fix the first stupid grunts
        SpawnerY = 180.0f;
        SpawnerZ -= 46.0f;
      }
      if (SpawnerY<130 && SpawnerX<200) {
        m_tmSingleWait *= 3; 
      }
      if (m_strDescription=="MaintainGroup->finalWaveGuffy") {
        m_tmSingleWait *= 3; 
      }
      /*if (SpawnerZ==508.0f) { // fix the first stupid guffy's
        SpawnerY = 200.0f;
        m_bPE = TRUE;
        m_fFirePower = 2.0f;
        m_bFireForwardOnly = TRUE;
      }
      if (SpawnerZ==-404.0f || SpawnerZ==-412.0f) { // fix the second stupid guffy's
        SpawnerY = 230.0f;
        SpawnerZ = -34 .0f;
        m_bPE = TRUE;
        m_fFirePower = 2.0f;
        m_bFireForwardOnly = TRUE;
      }*/  
    }
    // Portals Fortress
    else if (strLevelName=="cmap") {
      m_ctEnemyMax *= 1.2f;
      // raise the walkers on the bouncer
      if (SpawnerX>90 && SpawnerX<190 && SpawnerZ>75 && SpawnerZ<175) {
        m_bFireForwardOnly = TRUE;
        SpawnerY += 10.0f;
        if (m_strName=="final telep walker 10" || m_strName=="final telep walker 11") { 
          SpawnerY += 20.0f;
        }
      }
      if (m_strName=="valley50 eyeman10") { 
        SpawnerX -= 9.0f;
        SpawnerY += 18.0f;
        SpawnerZ -= 23.0f;
        m_bPE = FALSE;
        m_bLinear = TRUE;
        m_fOuterCircle = 25.0f;
      }
      if (SpawnerZ==-524.0f) { // fix the stupid grunts
        SpawnerH = 180.0f;
        m_bFireForwardOnly = TRUE;
      }
      if (SpawnerX>-160 && SpawnerX<-40 && SpawnerZ>-320 && SpawnerZ<-150 && SpawnerY>5) { // critters by first moving brush
        SpawnerX = 80.0f;
      }
    }
    // Portals Canyon
    else if (strLevelName=="mm_arena") {
      m_ctEnemyMax *= 0.8f;
      m_bPE = FALSE;
      m_bUseProjectile = FALSE;
    }
    else if (strLevelName=="01_Hatshepsut") { 
			m_ctEnemyMax *= 0.3f;
			if (SpawnerZ<-440) {
        SpawnerZ += 25.0f;
			}
			m_bReduce = TRUE; 
    }  
		else if (strLevelName=="02_SandCanyon") {
			// Inside
			if (SpawnerY < -3.1f) {
				m_ctEnemyMax *= 0.8f;
			} else {
				m_ctEnemyMax *= 0.6f;
			}
      if (m_etType==ET_GIZMO) { 
        //m_bPE = FALSE;
				m_bFireForwardOnly = TRUE;
				m_tmSingleWait = 0.1f;
				m_ctGroupSize = 3;
			}
      if (SpawnerX==270.0f || SpawnerX==293.5f 
         || SpawnerX==161.75f || SpawnerX==184.25f) {
        m_bFireForwardOnly = TRUE;
      } 
      if (SpawnerX>210 && SpawnerX<222 && SpawnerZ>-210 && SpawnerZ<-200) {
        m_bFireForwardOnly = TRUE;
      }
			if (SpawnerX<0 && SpawnerZ>-80) { 
				//m_bDestroy = TRUE;
				m_bFireForwardOnly = TRUE;
				m_ctEnemyMax *= 0.6f;
			}
			if (SpawnerX==63.0f) {
				bExtra = FALSE;
			}
    }    
		else if (strLevelName=="03_TombOfRamses") {
      m_ctEnemyMax *= 0.6f;
      if (m_etType==ET_SCORPMAN && SpawnerX < 96) {
        m_bLimitFiringRange = TRUE;
      }
      if (m_etType == ET_BONEMAN && SpawnerZ > -410 && SpawnerX > 96 && SpawnerY > 72) { 
        SpawnerY -= 5.0f;
      }
			// Move the pill spawners out from the doorway some
			if (SpawnerX == -104.0f || SpawnerX == -104.25f) {
				SpawnerX = -110.0f;
			}
    }
		else if (strLevelName=="04_ValleyOfTheKings") {
			// Valley   
			if (SpawnerZ>-250 && SpawnerY>-60) {
				m_ctEnemyMax *= 0.9f;
        SpawnerY += 5.0f;
        m_bPE = TRUE;
				m_bFireForwardOnly = TRUE;
			}		
			// First inside area
			if (SpawnerZ < -250  && SpawnerY > -97) {
				m_ctEnemyMax *= 0.8f;
			}	
			// Step down into lag area
			if (SpawnerZ < -480 && SpawnerY < -97) {
				m_ctEnemyMax *= 0.4f;
				m_bReduce = TRUE; 
				// End frog spawner
				if (SpawnerX == -16.0f) {
					m_bPE = FALSE;
					m_fOuterCircle = 20.0f;
				}
				// End frog spawner up on beam, moved it to above spawner location and heading
				if (SpawnerX == -103.5f) {
					m_bPE = FALSE;
					m_fOuterCircle = 20.0f;
					SpawnerX = -126.0f;
					SpawnerY = -18.625f;
					SpawnerZ = -548.0f;
					SpawnerH = 270.0f; 
				}
				// End scorp spawner up on beam, moved it to behind the light pyramid
				if (SpawnerX == -102.25f) {
					m_bPE = FALSE;
					m_fOuterCircle = 20.0f;
					SpawnerX = -138.0f;
					SpawnerY = -125.0f;
					SpawnerZ = -548.0f;
					SpawnerH = 270.0f; 
				}
			}			 
			/*if (SpawnerZ<-520 && SpawnerX<-100) {
				m_ctEnemyMax *= 0.8f;
			}
			if (SpawnerZ<-520 && SpawnerX<-55 && SpawnerX>-100) {
				m_ctEnemyMax *= 0.7f;
			}
			if (SpawnerZ<-520 && SpawnerZ<-580 && SpawnerX<0 && SpawnerX>-55 && SpawnerY<-99) {
				m_ctEnemyMax *= 0.7f;
			}*/

			if (SpawnerZ <- 250) {
				m_ctGroupSize = 3;
			}
			if (SpawnerX<-7.9f && SpawnerX>-10 && SpawnerZ>-501) {
				if (m_etType!=ET_SCORPMAN) {
					m_ctTotal *= 5;
				}
			}
      if (SpawnerZ==-520.5f) {
        m_bPE = TRUE;
        SpawnerZ =  545.0f;
      } 
      if (SpawnerX==-32.5f) {
        m_bPE = TRUE;
        SpawnerY = -92.0f;
        SpawnerZ = -542.0f;
      } 
      if (m_etType==ET_GIZMO) {
        m_bReduce = TRUE;
      }
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
      }
      if (SpawnerX==-52.25f) {
        m_tmDelay = 2.0f*iExtra;
      }
		}
		else if (strLevelName=="05_MoonMountains") {
      m_bLimitFiringRange = TRUE;
      m_fFirePower = 0.7f;
      m_bLetFall = FALSE;
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
      }
    }
		else if (strLevelName=="06_Oasis") { 
      /*if (m_etType==ET_GIZMO) { //  if i'm a frog spawner
        m_bPE = FALSE;
			}*/
      if (m_etType==ET_SCORPMAN) {
        m_bLimitFiringRange = FALSE;
      }
			if (SpawnerZ > -115) { // first area
        m_ctEnemyMax *= 0.8f;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 0.5f;
        m_bReduce = TRUE;
			}
			else if (SpawnerZ < -115 && SpawnerZ > -210) { // first inside areas
				m_bReduce = TRUE;
				m_ctGroupSize = 3;
				m_ctEnemyMax *= 0.5f;
				if (m_etType == ET_GIZMO) { // move these spawners to the center of the room
					m_bPE = FALSE;
          SpawnerX = 19.75f;  
          SpawnerZ = -178.5f;
					m_fOuterCircle = 7.0f; 
				}
			}
      else if (SpawnerZ < -210  && SpawnerZ > -300) { // frog room 
				m_bPE = TRUE;
        m_bFireForwardOnly = TRUE;
        m_fFirePower = 0.5f;
				m_ctEnemyMax *= 0.7f;
				if (SpawnerY > 23) {
					SpawnerY = 28.0f;
				}
			} else {
				m_ctEnemyMax *= 0.7f;
			}
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
      }
    }
		else if (strLevelName=="07_Dunes") { 
			m_ctEnemyMax *= 1.2f; 
			if (m_strDescription=="Simple->Beast Small - Static") {
        m_bFireForwardOnly = TRUE;
			}
			if (m_strDescription=="Simple->ABird on dunes") {
        SpawnerX -= 100.0f;
        SpawnerZ -= 260.0f;
			}
			if (m_strDescription=="Simple->Bomber 1") {
				m_ctTotal *= 10;
        m_bFireForwardOnly = TRUE;
			}
      if (SpawnerZ>63) {
        m_bFireForwardOnly = TRUE;
      }
			if ( m_strName=="Spawn Beast 1"
				|| m_strName=="Spawn Beast 2"
				|| m_strName=="Spawn Beast 4"
				|| m_strName=="Spawn Beast 6" 
				|| m_strName=="Spawn Beast 7") {
        m_bFireForwardOnly = TRUE;
			}
			if (SpawnerX>-80 && SpawnerX<80 && SpawnerZ<-208) {
				m_ctEnemyMax *= 0.6f;
				m_bReduce = TRUE;
        if (m_fFirePower>0.8f) {
          m_fFirePower = 0.8f;
        }
				if (m_etType==ET_BEAST) {
					m_bReduceMore = TRUE;
				}
			}
			if (SpawnerX>-94 && SpawnerX<80 && SpawnerZ>-200 && SpawnerZ<-170) {
				m_bFireForwardOnly = TRUE; 
        m_fFirePower = 1.0f;
			}
      if ( m_strName=="1st wave bull spawners"
				|| m_strName=="2nd wave bull spawners"
        || m_strName=="Spawn BigWalker on dunes") {
        m_bFireForwardOnly = TRUE;
        SpawnerY +=10.0f;
      }
      if (m_strDescription=="Simple->Beast Big") {
        SpawnerY += 20.0f;
        m_fFirePower = 1.5f;
      }
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
      }
			m_ctGroupSize = 0;
		}
		else if (strLevelName=="08_Suburbs") {
			m_ctEnemyMax *= 0.7f;
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
      }
			if (SpawnerX==-187.375f) {
        m_bFireForwardOnly = TRUE;
			}
			if (SpawnerZ<824 && SpawnerZ>820) {
        m_bFireForwardOnly = TRUE;
			}
      if (SpawnerZ==884.5f) {
        m_fFirePower = 1.5f;
      }
      if ((m_etType==ET_BEAST || m_etType==ET_SCORPMAN || m_etType==ET_WALKER)
        && SpawnerY>8) {
        m_bFireForwardOnly = TRUE;
      }
      if (SpawnerX==63.0f) {
        SpawnerH = 90.0f;
      }
      if (SpawnerX==59.0f) {
        SpawnerH = 180.0f;
      }
			m_ctGroupSize = 5;
			m_bReduce = TRUE;
		}
		else if (strLevelName=="09_Sewers") {
      m_ctEnemyMax *= 0.5f;
			if (m_etType==ET_GIZMO) { 
        m_bPE = FALSE;
				if (SpawnerX==-20.75f) {
					m_fOuterCircle = 6.0f;
        } 
        if (SpawnerX<-35 && SpawnerZ<-60 && SpawnerZ>-115) {
					SpawnerZ -= 6.0f;
					m_fOuterCircle = 2.8f;
        }
			}
			if (SpawnerZ<-220.0f) {
				m_ctTotal *= 10;
        m_bPE = FALSE;
				if (SpawnerX==-56.875f) {
					SpawnerX += 15.0f;
					SpawnerZ -= 22.0f;
					m_fOuterCircle = 13.0f;
        } else {
					SpawnerX += 3.0f;
					SpawnerZ -= 2.5f;
					m_fOuterCircle = 10.5f;
        }
      } else {
        m_bLimitFiringRange = TRUE;
      }
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
      }
			m_ctGroupSize = 5;
		}
		else if (strLevelName=="10_Metropolis") {
			m_ctEnemyMax *= 0.8f;
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
        m_bLimitFiringRange = TRUE;
				m_bReduce = TRUE;
      }
			if (SpawnerX>841) { 
				if (SpawnerX>925) {
					m_ctEnemyMax *= 1.3f;
				}
				m_bSpawn2ndGroup = FALSE;
        /*if (m_etType==ET_HARPY) {
          m_ctTotal *= 2;
        }*/
				if (SpawnerX<925 && m_etType==ET_BONEMAN) {
					m_bReduceMore = TRUE;
				}
			}
			if (SpawnerX<210 && SpawnerX>70) {
				m_ctEnemyMax *= 0.7f; 
				bExtra = FALSE; 
			}
			if (SpawnerX==1136.0f) { // bull on line spawners
        SpawnerZ -= FRnd()*40.0f;
				if (GetSP()->sp_gdGameDifficulty==CSessionProperties::GD_EXTREME) {
					if (m_bDoubleInSerious) {
						m_ctTotal /= 2;
						m_ctTotal *= 3;
					} else {
						m_ctTotal *= 3;
					}
				}
        m_bPE = FALSE;
        m_bLinear = TRUE;
        if (SpawnerZ>27) {
          m_fOuterCircle = 8.0f;
        } else {
          m_fOuterCircle = 21.0f;
        }
			}
			if (SpawnerX>653 && SpawnerX<662) {
        m_bReduce = TRUE;
			}
			if (SpawnerX>725 && SpawnerX<922) {
        m_ctEnemyMax *= 0.9f;
				m_bReduce = TRUE;
			}
      if (SpawnerX>450 && SpawnerX<840) {
        m_ctEnemyMax *= 0.5f;
				m_bReduce = TRUE;
      }
			if (SpawnerX<450 && SpawnerX>220) {
        bReduceEvenMore = TRUE;
			}
			if (SpawnerX>845 && SpawnerX<880) {
				m_ctTotal *= 6;
        if (SpawnerX==879.0f) {
          SpawnerX -= 5.0f;
          SpawnerZ += 74.0f;
          m_bPE = FALSE;
          m_fOuterCircle = 16.0f;
        } else {
          SpawnerX -= 22.0f;
          SpawnerZ += 88.0f;
          m_bPE = FALSE;
          m_fOuterCircle = 16.0f;
        }
			}
      if (m_etType==ET_SCORPMAN && SpawnerY>5) {
        m_bLimitFiringRange = TRUE;
      }
		}
		else if (strLevelName=="11_AlleyOfSphinxes") {
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
				m_bReduce = TRUE;
        if (SpawnerY>5) {
          m_bFireForwardOnly = TRUE;
        }
      }
			if (SpawnerX >= 1604) { // alleyway
				m_ctEnemyMax *= 0.9f;
				if (SpawnerX==1974.0f) {
					SpawnerX -= 50.0f;
					m_bPE = FALSE;
					m_fOuterCircle = 50.0f;
					m_tmSingleWait = 0.05f;
					m_bReduceMore = TRUE;
				}
				if (SpawnerX>1894 && SpawnerX<1910) {
					SpawnerZ += ((60.0f*FRnd())-30.0f);
					m_fFirePower = 2.0f;
				}
				if (SpawnerX>1604 && SpawnerX<1650) {
					m_bFireForwardOnly = TRUE;
					m_bMovingY = TRUE;
					m_fFirePower = 1.7f;
					m_fMovingYHeight = 40.0f;
				}
      }
			else if (SpawnerX>=1340 && SpawnerX<1604) { // first arena
				m_ctEnemyMax *= 0.75f;
				m_bFireForwardOnly = TRUE;
        m_bMovingY = TRUE;
				m_fMovingYHeight = 15.0f;
      }
			else if (SpawnerX<1340) { // last arena
				m_ctEnemyMax *= 0.5f;
        m_bReduceMore = TRUE;
				if (SpawnerX==1080.0f) {
					//m_ctTotal *= 2;
					bExtra = TRUE;
					m_bLinear = TRUE;
					m_bPE = FALSE;
					m_fOuterCircle = 200.0f;
					SpawnerH = 270.0f;
				} else {
					if (SpawnerX==1253.5f || SpawnerZ==1985.75f) { 
						m_bFireForwardOnly = TRUE;
						m_fFirePower = 2.0f;
					} else {
						m_bFireForwardOnly = TRUE;
						m_bMovingY = TRUE;
						m_fMovingYHeight = 15.0f;
					}
				}
      }
			m_ctGroupSize = 0;
    }
    else if (strLevelName=="12_Karnak") { 
			//m_ctEnemyMax *= 1.1f;
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
        if (SpawnerY>5) {
          m_bLimitFiringRange = FALSE;
          m_bFireForwardOnly = TRUE;
        }
        if (SpawnerZ>2450) {
          m_fFirePower = 0.3f;
        }
      }
			if ( m_strDescription=="Simple->ABull Running Through Door"
				|| m_strDescription=="Simple->AKamikaze After Bull" ) { // spawners that used to run out the door, can't have them there...
        SpawnerX + = 25.0f;
				SpawnerY += 0.25; 
        m_bMovingY = TRUE;
        m_bFireForwardOnly = TRUE;
			}
			if (SpawnerX<5.0f) { // end battle
				m_ctEnemyMax *= 1.2f;
				m_bSpawn2ndGroup = FALSE;
				if (m_etType==ET_BONEMAN) {
					m_ctTotal *= 2;
				}
        if (m_etType==ET_SCORPMAN) {
          m_bFireForwardOnly = TRUE;
        }
			}
      if (SpawnerX==615.5f) {
        m_bFireForwardOnly = FALSE;
        m_bLimitFiringRange = FALSE;
      }
      if (SpawnerX<125 && SpawnerX>4) { // frog pit spawners
				m_ctEnemyMax *= 0.8f;
        if (SpawnerY > 4) {
          SpawnerY += 10.0f;
          m_bFireForwardOnly = TRUE;
        }
			  if (m_strName=="Gizmo jump spawner") {
          m_bPE = TRUE;
					m_tmSingleWait *= 3.0f;
					m_ctGroupSize = 2;
			  }
			  if (m_strName=="Kamikaze jump spawner") {
          m_fFirePower = 0.5f;
					m_tmSingleWait *= 3.0f;
					m_ctGroupSize = 2;
			  }
        if (SpawnerZ==2041.0f) {
          m_bSendKarnak = TRUE;
        }
      }
      if (SpawnerX<442 && SpawnerX>392 && SpawnerZ<2100 && SpawnerZ>2000) { // heart in trap room spawners
        m_ctEnemyMax *= 0.5f;
				m_tmSingleWait *= 2.0f;
			  if (SpawnerX<416 && SpawnerX>400 && SpawnerZ<2064 && SpawnerZ>2032) {
				  m_ctEnemyMax *= 1.2f;
				  m_ctTotal *= 2;
			  }
      }
      /*if (SpawnerX<0 && SpawnerX>-136 && m_etType==ET_WALKER) {
        if (SpawnerZ<1940 || SpawnerZ>2152) {
          m_bMovingX = TRUE;
          m_bFireForwardOnly = TRUE;
          m_fFirePower = 1.5f;
          if (SpawnerX<-100) {
            SpawnerX += 10.0f;
          }
        }
			}*/
			if (SpawnerX==237.5f) { // kleer spawners in the hallway before the frog pit
        SpawnerZ -= 0.5f;
				m_ctTotal *= 10;
        m_bPE = FALSE;
        m_bLinear = TRUE;
        m_fOuterCircle = 20.0f;
        m_ctEnemyMax *= 0.8f;
			}
      if (SpawnerX==674.0f) { // the 4 kleer and bull spawners in the first hall
        SpawnerX = 701.0f;
        m_bPE = FALSE;
        m_fOuterCircle = 10.0f;
				m_bReduce = TRUE;
      }   
      if (SpawnerX==681.5f) {
        SpawnerX = 716.5f;
        m_bPE = FALSE;
        m_fOuterCircle = 12.0f;
				m_bReduce = TRUE;
      }
      if (SpawnerX==676.0f) {
        m_bPE = FALSE;
        m_fOuterCircle = 10.0f; 
				m_bReduce = TRUE;
        SpawnerX = 703.5f;
      }
      if (SpawnerX==623.25f) {
        m_bMovingY = TRUE;
        m_bFireForwardOnly = TRUE;
        /*SpawnerX -= 7.5f;
        SpawnerZ -= 10.0f;
        m_bPE = FALSE;
        m_bLinear = TRUE;
        m_fOuterCircle = 30.0f;*/
      }
			// reduce the max in the first 2 areas before the switches
      if (SpawnerX>580 && SpawnerX<780 && SpawnerZ>2000) {
        m_ctEnemyMax *=0.7f;
        m_bReduce = TRUE;
      }
			// move all these spawners around some since they are all packed together
      if (SpawnerX>357 && SpawnerX<370 && SpawnerZ>2440 && SpawnerZ<2452) { 
        SpawnerZ -= FRnd()*26.0f;
				SpawnerX -= 20.0f-FRnd()*40.0f;
      }
			// fix those dang destoyables
      if (m_estType==EST_DESTROYABLE) {
        m_tmSingleWait *= 2;
        m_bReduce = TRUE;
        m_bPE = TRUE;
      }
			if (SpawnerX>500 && SpawnerX<750 && SpawnerZ<2000) {
				m_ctGroupSize = 5;
			}
		}
		else if (strLevelName=="13_Luxor") { 
			m_ctEnemyMax *= 0.7f;
      m_bReduce = TRUE;
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
        if (SpawnerY>5) {
          m_bLimitFiringRange = TRUE;
        }
      }
			if (SpawnerX>-200) {
				m_ctEnemyMax *= 0.9f;
			}
			if (SpawnerY>15 && SpawnerX>20) {
				m_bFireForwardOnly = TRUE;
			}
			if (SpawnerX==-366.0f) {
				SpawnerZ -= 71.0f;
			}
			if (SpawnerX>-164 && SpawnerX<-16) {
				m_ctTotal *= 10;
			}
			if (SpawnerY==34.5f) {
				SpawnerY -= 23.0;
				SpawnerZ -= 21.0f;
			}
			if (SpawnerX==-366.0f) {
        m_bFireForwardOnly = TRUE;
      }
		}
		else if (strLevelName=="14_SacredYards" && !GetSP()->sp_bSinglePlayer) { 
			m_ctEnemyMax *= 0.7f;
      m_bReduce = TRUE;
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
        if (SpawnerY>5) {
          m_bLimitFiringRange = TRUE;
        }
      }
			if (m_strDescription=="Simple->AGizmo template, ABoneman Template" || SpawnerZ<275) { 
				m_bDestroy = TRUE;
			}
		}
    else if (strLevelName=="15_TheGreatPyramid") {
      m_bFireForwardOnly = TRUE;
      if (m_etType==ET_BEAST) {
        bExtra = TRUE;
        m_bPE = TRUE;
      }
      if (SpawnerZ>-220) { // First Area
        m_ctEnemyMax *= 1.2f;
        if (m_etType==ET_BEAST && SpawnerY<1) {
          m_bReduce = TRUE;
        }
        if (m_etType==ET_WEREBULL) {
          m_fFirePower = 2.5f;
					if (m_strName=="Bulls2 spawner 4" || m_strName=="Bulls2 spawner 3") {
						m_ctTotal = 10;
					}
					m_ctTotal *= 2;
        }
        if (m_etType==ET_WALKER) {
          m_fFirePower = 1.0f;
          if (SpawnerX>120) {
            SpawnerX -= 77.0f;
            SpawnerY = 20.0f;
          } else if (SpawnerX<-120) {
            SpawnerX += 77.0f;
            SpawnerY = 20.0f;
          } 
					if (m_strName=="WalkerBig2 spawner" || m_strName=="WalkerBig2R spawner") {
						m_ctTotal *= 2;
					}
					m_ctTotal *= 2;
        }
      } else { // Pyramid Area
        m_ctEnemyMax *= 0.75f;
        if (m_etType==ET_WEREBULL) { // Bulls
          if (SpawnerZ<-750 && SpawnerZ>-770) { // End Bulls
						m_ctTotal *= 2; 
            fEntityR = 70.0f;
            m_fFirePower = 0.5f;
            //m_bUseProjectile2 = TRUE;
            m_tmSingleWait = 0.1f;
          } else { // The Others
						m_ctTotal = 8; 
					}
        }
        if (SpawnerZ>-1000) { // Non-Slope Critters
          m_bFireForwardOnly = FALSE;
          if (m_etType!=ET_BEAST) {
						/*if (m_ctTotal<11) {
							m_ctTotal *= 2;
						}*/
            //fEntityR = 20.0f;
            m_fFirePower = 2.0f;
            //m_bUseProjectile = TRUE;
            if (SpawnerZ>-880) {
              fEntityR = 70.0f;
            }
          } 
          if ( m_strDescription=="MaintainGroup->ABonemanOnSlope"
            || m_strDescription=="Simple->AKamikaze on slope") {
            //fEntityR = 70.0f;
            m_fFirePower = 0.5f;
            //m_bUseProjectile2 = TRUE;
            m_tmSingleWait = 0.1f;
          }
          SpawnerY += 25.0f;
        }
        if (SpawnerX==0.375f) { // Final Mechs
          SpawnerY += 40.0f;
          SpawnerZ += 100.0f;
					m_ctEnemyMax *= 1.2f;
					m_ctTotal *= 5;
          m_tmSingleWait = 0.1f;
          fEntityR = 70.0f;
          m_fFirePower = 2.5f;
          //m_bUseProjectile2 = TRUE;
          //m_fFirePower = 1.5f;
				}
			  if ( m_strName=="Boneman on Slope spawner" ) {
					bExtra = FALSE; 
			  }
        //if (SpawnerX==74.25f) { // end bulls
        if (SpawnerX==67.0f) { // end kamis
          m_bSendUghEvents = TRUE;
			  }
      }
    }
		else if (strLevelName == "alpinemists" ) {
			m_ctEnemyMax *= 1.3;
			m_ctTotal *=2;
			if (SpawnerX==-98.5f) {
			}
			if (SpawnerX==-1003.0f) {
				SpawnerY += 10.0f;
			}
			if (SpawnerZ==192.0f) {
				SpawnerY += 15.0f;
			}
			if (SpawnerX>-620 && SpawnerX<-520 && SpawnerZ<-250) {
				m_ctEnemyMax *= 0.7f;
				m_ctTotal *= 2;
				if (m_etType!=ET_WALKER) {
					m_ctTotal *= 2;
				}
			}
			if (SpawnerZ==-140.0f) {
				SpawnerZ += 15.0f;
				m_bFireForwardOnly = TRUE;
			}
			if (SpawnerX>-250 && SpawnerX<-130 && SpawnerZ<-60) {
				SpawnerY += 1.0f;
			}
			if (SpawnerX>-875 && SpawnerX<-860 && SpawnerZ<-200 && SpawnerZ>-210) {
				m_bFireForwardOnly = TRUE;
        if (SpawnerY>-85) {
          SpawnerY = -2.5f;
        }
			}
			if (SpawnerZ>-65 && SpawnerZ<-45 && SpawnerX<-860 && SpawnerX>-920) {
				m_bFireForwardOnly = TRUE;
			}
			if (SpawnerX==-210.0f) {
        m_fFirePower = 0.5f;
        m_tmSingleWait = 0.1f;
        m_bLimitFiringRange = FALSE;
				m_ctTotal *= 3;
			}
		}
		else if (strLevelName=="Triphon") { 
			if (SpawnerX<-300 && SpawnerZ<1170) {
				m_ctTotal * = 4;
				m_ctEnemyMax *= 1.6f;
			}
			if (SpawnerX>-250 && SpawnerZ<825) {
				m_ctEnemyMax *= 1.8f;
				if (m_etType==ET_BONEMAN) {
					m_ctTotal *= 2;
				}
			}
			if (m_etType==ET_HARPY || m_etType==ET_GIZMO) {
				m_ctEnemyMax *= 0.8f;
			}
			if (m_strDescription=="Simple->boss1") { 
				m_bPE = FALSE;
        m_bLinear = TRUE;
        m_fOuterCircle = 100.0f;
			}
		}
		else if (strLevelName=="new") {
			if (SpawnerY < =0.5f) {
				SpawnerY += 0.5f;
			}
			if (SpawnerX==112.0f) { 
				SpawnerY += 2.5f;
			}
			if (m_etType==ET_HARPY) {
				m_ctEnemyMax *= 1.4f;
			}
      if (m_strName=="Enemy3 Spawner1") {
        SpawnerY -= 2.0f;
        m_fFirePower = 0.7f;
      }
      if (SpawnerY<66) {
        m_ctEnemyMax *= 0.8f;
      }
		}
		else if (strLevelName=="Final Fight") { 
			m_ctEnemyMax *= 1.3f;
			if (SpawnerX<880 && SpawnerZ>780) {
				m_ctEnemyMax *= 0.9f;
				if (SpawnerX==840.75f) { 
					SpawnerY += 5.0f;
			    if (m_etType==ET_GIZMO) {
				    m_ctEnemyMax *= 1.3f;
			    }				
        }
			}
			if (m_strDescription=="Simple->TP harpy air") { 
        m_bPE = FALSE;
        SpawnerZ -= 32.0f;
			}
			if (SpawnerX>880 && SpawnerZ>500) {
			}
			if (SpawnerZ>300 && SpawnerZ<500) {
				m_ctEnemyMax *= 1.5f;
			}
      if (SpawnerZ<0) {
        m_ctTotal *= 4;
      }
      if (SpawnerX==931.0f) { // target is not a template, oops
        m_bDestroy = TRUE;
      }
		}
    else if (strLevelName=="Return To Moon Mountains 1") {
      if (m_strDescription=="Simple->EnemyFrogTunnel") {
        m_ctEnemyMax *= 0.7f;
        SpawnerX = -76.0f;
        SpawnerY = 9.0f;
        SpawnerZ = 10.0f-(FRnd()*30.0f);
        m_bPE = TRUE;
        m_fFirePower = 0.8f;
      }
      if (m_strDescription=="Simple->EnemyKleer") {
        m_ctEnemyMax *= 0.7f;
        SpawnerX = -76.0f;
        SpawnerY = 9.0f;
        SpawnerZ = -10.0f-(FRnd()*30.0f);
        m_bPE = TRUE;
        m_fFirePower = 0.8f;
			}
    }
    else if (strLevelName=="KarnakDemo") { 
			 m_ctEnemyMax *= 1.1f;
			if ( m_strDescription=="Simple->ABull Running Through Door"
				|| m_strDescription=="Simple->AKamikaze After Bull" ) {
        SpawnerX -= 25.0f;
				SpawnerY += 0.25;
			}
			if (SpawnerX<5.0f) {
				m_ctEnemyMax *= 1.1f;
				if (m_etType==ET_BONEMAN) {
					m_ctTotal *= 2;
				}
        if (m_etType==ET_SCORPMAN) {
          m_bFireForwardOnly = TRUE;
        }
			}
      if (SpawnerX==615.5f) {
        m_bFireForwardOnly = FALSE;
        m_bLimitFiringRange = FALSE;
      }
      if (SpawnerX<442 && SpawnerX>392 && SpawnerZ<2100 && SpawnerZ>2000) { // heart in trap room spawners
        m_ctEnemyMax *= 0.5f;
				m_tmSingleWait *= 2.0f;
			  if (SpawnerX<416 && SpawnerX>400 && SpawnerZ<2064 && SpawnerZ>2032) {
				  m_ctEnemyMax *= 1.2f;
				  m_ctTotal *= 2;
			  }
      }
			if (SpawnerX==237.5f) {
        SpawnerZ -= 0.5f;
				m_ctTotal *= 10;
        m_bPE = FALSE;
        m_bLinear = TRUE;
        m_fOuterCircle = 20.0f;
        m_ctEnemyMax *= 0.8f;
			}
      if (SpawnerX>580 && SpawnerX<780 && SpawnerZ>2000) {
        m_ctEnemyMax *=0.7f;
      }
      if (m_strName=="Spawn bull last fight") {
        m_bSendKarnak = TRUE;
      }
			// fix the death target mistake
			if (m_etType==ET_WALKER) {
				if (SpawnerX==297.0f || SpawnerX==351.5f || SpawnerX==663.0f || SpawnerX==565.5f) {
					m_iCount = 0;
				}
			}
		}

    m_ctEnemyMax = Clamp(INDEX(m_ctEnemyMax*m_fEnemyMaxAdjuster*1.5f), INDEX(1), INDEX(600));
		
    if (bExtra) {
			if (bReduceEvenMore) {
				m_ctTotal *= Clamp(INDEX(iExtra/6), INDEX(1), INDEX(1000));
			} else if (m_bReduce && !m_bReduceMore) {
			  m_ctTotal *= Clamp(INDEX(iExtra/2), INDEX(1), INDEX(1000));
      } else if (m_bReduceMore) {
        m_ctTotal *= Clamp(INDEX(iExtra/3), INDEX(1), INDEX(1000));
      } else {
			  m_ctTotal *= iExtra;
      }
		} else {
			m_ctTotal = m_ctTotal;
		}

    //m_tmSingleWait *= 1.5f;
    m_tmGroupWait = m_tmSingleWait;

		if (m_tmDelay <= 0) {
			m_tmDelay = 1.0f*FRnd();
		}

    //m_bSpawn2ndGroup = TRUE;

    /*if (m_ctGroupSize>0 && m_bUseProjectile) {
      m_bUseProjectile = FALSE;
      m_bPE = TRUE;
    }*/
    /*if (m_ctGroupSize==0) {
      //m_bSpawn2ndGroup = FALSE;
			m_ctGroupSize = 6;
    }*/

		m_bUseProjectile = FALSE;
		//m_bUseProjectile2 = FALSE;

    //m_ctGroupSize = 1;
  }

  /*void FireProjectile(void) 
  {
    if (m_penTarget!=NULL) {
      FLOAT fAng = FRnd()*360.0f;
		  CPlacement3D pl;
      CEntity *pen = NULL;
      if (m_bFireForwardOnly) {
        pl = CPlacement3D(FLOAT3D(SpawnerX, SpawnerY, SpawnerZ)+FLOAT3D(0, 0.5f, 0), ANGLE3D(SpawnerH+FRnd()*20.0f-10.0f, 0, 0));
      } else {
        pl = CPlacement3D(FLOAT3D(SpawnerX, SpawnerY, SpawnerZ)+FLOAT3D(0, 0.5f, 0), ANGLE3D(SpawnerH, SpawnerP, SpawnerB));
      }
      //pl = CPlacement3D(vHere+FLOAT3D(fX,fY+0.5f,fZ), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_PESPAWNPROJ);
      m_penSpawnTarget = pen;

      CPESpawnProjectile *psp = ((CPESpawnProjectile*)pen);
      psp->m_ctTotal = m_ctTotal;
      psp->m_tmSingleWait = m_tmSingleWait;
      psp->m_ctEnemyMax = m_ctEnemyMax;
      psp->m_iCount = m_iCount;
      psp->m_fH = SpawnerH;
      psp->m_fProjectileSize = fEntityR;
      psp->m_penTemplate = m_penTarget;
      //psp->m_ctGroupSize = m_ctGroupSize;
      psp->m_penPatrol = m_penPatrol;
      //psp->m_bReduce = m_bReduce;
      psp->SpawnerX = SpawnerX;
      psp->SpawnerY = SpawnerY;
      psp->SpawnerZ = SpawnerZ;
      psp->Initialize();
      
      CMovableEntity *penP = (CMovableEntity*)(CPESpawnProjectile*)pen;
      if (m_bFireForwardOnly) {
        FLOAT fPower = (FRnd()*20.0f+30.0f)*m_fFirePower;
        ((CPESpawnProjectile&)*penP).LaunchAsFreeProjectile(FLOAT3D(0, FRnd()*5.0f+5.0f, -fPower), penP);
      } else {
        FLOAT fPower = (10.0f+FRnd()*10.0f)*m_fFirePower;
		    ((CPESpawnProjectile&)*penP).LaunchAsFreeProjectile(FLOAT3D(CosFast(fAng)*fPower, fPower, SinFast(fAng)*fPower), penP);
      }
    }
  };*/

  // spawn new entity PE style
  void SpawnEntityPE(void) 
  {
    if (m_penTarget!=NULL) {
      // copy entity into world
      CEntity *pen = NULL;
		  CPlacement3D pl;
      if (m_bFireForwardOnly) {
        if (m_bMovingX) {
          pl = CPlacement3D(FLOAT3D(SpawnerX-m_fMovingXZWidth/2+FRnd()*m_fMovingXZWidth, SpawnerY+0.1f, SpawnerZ), 
            ANGLE3D(SpawnerH+FRnd()*20.0f-10.0f, SpawnerP, SpawnerB));
        } else if (m_bMovingZ) {
          pl = CPlacement3D(FLOAT3D(SpawnerX, SpawnerY+0.1f, SpawnerZ-m_fMovingXZWidth/2+FRnd()*m_fMovingXZWidth), 
            ANGLE3D(SpawnerH+FRnd()*20.0f-10.0f, SpawnerP, SpawnerB));
        } else if (m_bMovingY) {
          pl = CPlacement3D(FLOAT3D(SpawnerX, SpawnerY+FRnd()*m_fMovingYHeight, SpawnerZ), 
            ANGLE3D(SpawnerH+FRnd()*90.0f-45.0f, SpawnerP, SpawnerB));
        } else {
          pl = CPlacement3D(FLOAT3D(SpawnerX, SpawnerY+0.1f, SpawnerZ), 
            ANGLE3D(SpawnerH+FRnd()*20.0f-10.0f, SpawnerP, SpawnerB));
        }
      } else {
        pl = CPlacement3D(FLOAT3D(SpawnerX, SpawnerY+0.1, SpawnerZ), 
					ANGLE3D(SpawnerH, SpawnerP, SpawnerB));
      }
      pen = GetWorld()->CopyEntityInWorld( *m_penTarget, pl);

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
			if (m_ctEnemiesSpawned<=m_ctGroupSize) {
				peb->m_penSpawnerTarget = this;
			}
			peb->m_penSpawnerTarget2 = this;
      //peb->m_bPESpawned = TRUE;
      if (m_bLetFall) {
        peb->m_fFallHeight = -1;
      } else {
        peb->m_fFallHeight = 1;
      }
      if (m_penPatrol!=NULL) {
        peb->m_penMarker = m_penPatrol;
      }
      if (m_ctEnemiesSpawned>=m_ctTotal) {
        peb->m_iCount = m_iCount;        
      }
      pen->Initialize();

      // fire it........
      FLOAT fA = FRnd()*360.0f;
      CMovableEntity *penCritter = (CMovableEntity*)(CEnemyBase*)pen;
      if (m_bLimitFiringRange && !m_bFireForwardOnly) {
        ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(0, 50.0f*m_fFirePower, 0), penCritter);
      } else if (m_bFireForwardOnly) {
        FLOAT fPower = (FRnd()*30.0f+30.0f)*m_fFirePower;
        ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(0, FRnd()*10.0f, -fPower), penCritter);
      } else {
          FLOAT fPowerUp = FRnd()*5.0f+10.0f*m_fFirePower;
          FLOAT fPowerOut = FRnd()*15.0f+10.0f*m_fFirePower;
        ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(CosFast(fA)*fPowerOut, fPowerUp, SinFast(fA)*fPowerOut), penCritter);
      }

		  if (m_bSpawnEffect) {
			  // spawn teleport Sound
			  FLOAT fSize = fEntityR*2;
			  if (fSize > 10.0f) { fSize = 10.0f; }
			  m_soSpawn.Set3DParameters(30.0f*fSize, 10.0f*fSize, 0.5f*fSize, 0.125f*fSize);
			  PlaySound(m_soSpawn, SOUND_TELEPORT, SOF_3D);
		  }
    }
  };

  // spawn new entity Croteam style
  void SpawnEntityCT(void) 
  {
    if (m_penTarget!=NULL) {
      //CPrintF("CT Spawned\n");
      // copy template entity
      CEntity *pen = NULL;
      pen = GetWorld()->CopyEntityInWorld( *m_penTarget,
        CPlacement3D(FLOAT3D(-32000.0f+FRnd()*200.0f, -32000.0f+FRnd()*200.0f, 0), ANGLE3D(0, 0, 0)) );

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
			if (m_ctEnemiesSpawned<=m_ctGroupSize) {
				peb->m_penSpawnerTarget = this;
			}
			peb->m_penSpawnerTarget2 = this;
      //peb->m_bPESpawned = TRUE;
      if (m_bLetFall) {
        peb->m_fFallHeight = -1;
      } else {
        peb->m_fFallHeight = 1;
      }
      if (m_penPatrol!=NULL) {
        peb->m_penMarker = m_penPatrol;
      }
      if (m_ctEnemiesSpawned>=m_ctTotal) {
        peb->m_iCount = m_iCount;
      }
      pen->Initialize();
      
			// calculate new position
			FLOAT fA = FRnd()*360.0f;
      // adjust circle radii to account for enemy size
      FLOAT fOuterCircle = ClampDn(m_fOuterCircle-fEntityR, 0.0f);
      // calculate new position
      FLOAT fR = fEntityR + FRnd()*fOuterCircle;
			FLOAT fMX, fMY, fMZ;
	    if (m_bLinear) {
				fMX = CosFast(fA)*fR;
				fMY = 0.2f+fEntityR/3;
				fMZ = -2.5f+FRnd()*5.0f;
      } else if (m_bPerp) {
				fMX = -2.5f+FRnd()*5.0f;
				fMY = 0.2f+fEntityR/3;
				fMZ = SinFast(fA)*fR;
	    } else {
				fMX = CosFast(fA)*fR;
				fMY = 0.2f+fEntityR/3;
				fMZ = SinFast(fA)*fR;
	    }

      CPlacement3D pl = CPlacement3D(FLOAT3D(SpawnerX, SpawnerY, SpawnerZ), ANGLE3D(SpawnerH, 0, 0));
      CPlacement3D plSpawn(FLOAT3D(fMX, fMY, fMZ), ANGLE3D(0, 0, 0));
	    plSpawn.RelativeToAbsolute(pl);
	    pen->Teleport(plSpawn, FALSE);

		  if (m_bSpawnEffect) {
			  // spawn teleport Sound
			  FLOAT fSize = fEntityR*2;
			  if (fSize > 10.0f) { fSize = 10.0f; }
			  m_soSpawn.Set3DParameters(30.0f*fSize, 10.0f*fSize, 0.5f*fSize, 0.125f*fSize);
			  PlaySound(m_soSpawn, SOUND_TELEPORT, SOF_3D);
		  } 
    }
  };

  // teleport entity
  void TeleportEntity(void) {
		if (m_bSpawnSeriousDamage) {
			SpawnSeriousDamage(FLOAT3D(SpawnerX, SpawnerY, SpawnerZ));
		} else if (CheckTemplateValid(m_penTarget) && !m_bDestroy) {
      // Teleport entity
      CEntity *pen = NULL;
      pen = m_penTarget;
      m_penTarget = NULL; 
      if (pen != NULL) {
        CPlacement3D pl(FLOAT3D(0, 0.5f, 0), ANGLE3D(0, 0, 0));
        pl.RelativeToAbsolute(GetPlacement());
        // teleport back
				if (pen != NULL) {
					pen->Teleport(pl, FALSE);
				}
			}
		}
  };

  void SendOverLordEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "OverLord")) {
        pen->SendEvent(EBecomeActive());
      }
    }}
  }

  void SendPitEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Enemy Spawner")) {
        if (((CEnemySpawner *)&*pen)->m_strDescription=="Triggered->Boneman Temp Mika") {
          ((CEnemySpawner *)&*pen)->SendEvent(ETrigger());
        }
      }
    }}
  }

  void SendUghEvents(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Trigger")) {
        if (((CTrigger *)&*pen)->fX==-10.25f || ((CTrigger *)&*pen)->fX==-46.0f) { // Ugh
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
        }
        if (((CTrigger *)&*pen)->fX==-47.0f && ((CTrigger *)&*pen)->fZ==-931.0f) { // Kleer on Kamis
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
        }
        if (((CTrigger *)&*pen)->fX==-56.0f && ((CTrigger *)&*pen)->fZ==-931.0f) { // Bull on Kleer
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
        }
        if (((CTrigger *)&*pen)->fX==-58.0f && ((CTrigger *)&*pen)->fZ==-925.0f) { // Bull on Bull
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
        }
        if (((CTrigger *)&*pen)->fX==-65.0f && ((CTrigger *)&*pen)->fZ==-930.0f) { // Walker on Bull
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
        }
      }
    }}
  }

  void SendKarnakEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Moving Brush")) {
        if (((CMovingBrush *)&*pen)->fX==1.0f) {
				  ((CMovingBrush *)&*pen)->SendEvent(ETrigger());
        }
      }
    }}
  }

  void CreateTouchBox(void)
  {
    if (GetSP()->sp_bControlRunning) {
      CPlacement3D pl;
      CEntity *pen = NULL;
      pl = GetPlacement();
      pen = CreateEntity(pl, CLASS_BOX);
      CBox *box = ((CBox*)pen);
      box->m_penTarget = this;
      box->Initialize();
    }
  }

	void SpawnSeriousDamage(FLOAT3D vPosVector)
	{
    CEntity *pen = NULL;
		CPowerUpItem *penDamage;
		CPlacement3D plInit = CPlacement3D(FLOAT3D(0, -32000.0f, 0), ANGLE3D(0, 0, 0));

		// create a serious damage
    pen = CreateEntity(plInit, CLASS_POWERUP_ITEM); // create the class
    penDamage = ((CPowerUpItem*)pen); // create a pointer so we can set it's initial vars
    penDamage->m_puitType = PUIT_DAMAGE; // set it's type
    penDamage->Initialize(); // initialize it	

    // if the target doesn't exist, or is destroyed, do nothing
    if (penDamage==NULL) { return; }

		// copy it
    CEntity *penNew = GetWorld()->CopyEntityInWorld( *penDamage,
      CPlacement3D(FLOAT3D(-32000.0f+FRnd()*200.0f, -32000.0f+FRnd()*200.0f, 0), ANGLE3D(0, 0, 0)) );

    // teleport it
    CPlacement3D plWhere = CPlacement3D(vPosVector, ANGLE3D(0, 0, 0));
    plWhere.pl_PositionVector(2) += 0.05f;
    penNew->Teleport(plWhere, FALSE);
	}

	/*void CreatePESpawner(void)
	{
    CPlacement3D pl;
    CEntity *pen = NULL;
    pl = GetPlacement();
		//pl.pl_PositionVector(2) += 5.0f;
    pen = CreateEntity(pl, CLASS_PESPAWNEREG);
    CPESpawnerEG *penPESpawner = ((CPESpawnerEG*)pen);
    penPESpawner->m_bUseAllTypes = TRUE;
    penPESpawner->m_ctTotal = m_ctTotal;
		penPESpawner->m_penTarget = m_penDeathTarget;
		penPESpawner->m_iCount = m_iCount;
		penPESpawner->m_penPatrol= m_penPatrol;
    m_penSpawnTarget = penPESpawner;
    penPESpawner->Initialize();
	}*/

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CEnemySpawner) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strDescription.Length();
    slUsedMemory += m_strName.Length();
    slUsedMemory += 1* sizeof(CSoundObject);
    return slUsedMemory;
  }

  /* Adjust model shading parameters */
  /*BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
		if (m_bHighlight) {
			colAmbient = C_RED;
		} else {
			colAmbient = C_WHITE;
		}
		return FALSE;
	}*/

	const CTString GetSpawnerInfo(void)
	{
		CTString strEntityInfo = "";
		CTString strInfo = "";

		strEntityInfo = "m_strName: " + m_strName + "\n";

		((CTString&)strInfo).PrintF("SpawnerX: %.3f, SpawnerY: %.3f, SpawnerZ: %.3f\n", SpawnerX, SpawnerY, SpawnerZ);
		strEntityInfo += strInfo;

		if (m_penTarget != NULL) {
      strEntityInfo = strEntityInfo + "m_penTarget: " + m_penTarget->GetName() + "\n";
		}

		if (m_penSeriousTarget != NULL) {
      strEntityInfo = strEntityInfo + "m_penSeriousTarget: " + m_penSeriousTarget->GetName() + "\n";
		}

		if (m_bFireForwardOnly) {
			strEntityInfo = strEntityInfo + "Fire Only Forward\n";
		} else if (m_bLimitFiringRange) {
			strEntityInfo = strEntityInfo + "Fire Only Up\n";
		} else {
			strEntityInfo = strEntityInfo + "Uber\n";
		}

		if (m_bPE) {
			strEntityInfo = strEntityInfo + "m_bPE: TRUE\n";
		} else {
			strEntityInfo = strEntityInfo + "m_bPE: FALSE\n";
		}

		((CTString&)strInfo).PrintF("m_fFirePower: %.3f\n", m_fFirePower);
		strEntityInfo += strInfo;

		if (m_bUseProjectile) {
			strEntityInfo = strEntityInfo + "m_bUseProjectile: TRUE\n";
		} else {
			strEntityInfo = strEntityInfo + "m_bUseProjectile: FALSE\n";
		}

    return strEntityInfo;
	}

	/*void GetOverlord(void)
	{
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsOfClass(pen, "OverLord")) {
				m_penOverlord = pen;
      }
    }}		
	}*/

	void Triggered(void)
	{
    m_bTriggered = TRUE;
    //m_ctEnemyMax -= _pNetwork->ga_sesSessionState.GetPlayersCount() * 2;
		//GetOverlord();

		/*if (m_penPatrol == NULL) {
			FindMarker();
		}*/

    if (m_bFixup1) {
      SendPitEvent();
    }
    if (m_bSendUghEvents) {
      SendUghEvents();
    }
    if (m_bSendKarnak) {
      SendKarnakEvent();
    }
	}


procedures:

  Uber() 
  {
    // wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      on (EStart) : { stop; };
      otherwise() : { pass; }
    }

    // if should delay
    if (m_tmDelay > 0) {
      // wait delay
      autowait(m_tmDelay);
    }

		Triggered();

    // repeat forever
    while(TRUE) {

			// if allowed, spawn a critter
			if (CanSpawn()) {
        // increase the total enemies spawned
        m_ctEnemiesSpawned++;
        // spawn it
        if (m_bPE) {
          SpawnEntityPE();
        } else {
          SpawnEntityCT();
        }
      }
		
      // wait between two entities in group
      autowait(m_tmWait);

      // if no more left
      if (m_ctEnemiesSpawned >= m_ctTotal) {
        // finish entire spawner
        return EEnd();
      }
    }
  }

  UberGroup()
  {
    // wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      on (EActivate) : { stop; };
      otherwise() : { pass; }
		}

    // if should delay
    if (m_tmDelay>0) {
      // wait delay
      autowait(m_tmDelay);
    }

		Triggered();

    // repeat forever
    while(TRUE) {

			// if we haven't had any killed and our group has spawned
      if (m_bSpawn2ndGroup && m_ctEnemiesSpawned>=m_ctGroupSize) {
				// wait a loooong time
				m_tmWait = 360.0f;
      } 
			// if allowed, spawn a critter
			else if (CanSpawn()) {
        // increase the total enemies spawned
        m_ctEnemiesSpawned++;
        // spawn it
        if (m_bPE) {
          SpawnEntityPE();
        } else {
          SpawnEntityCT();
        }
      }
		
      // wait between two entities in group
      wait(m_tmWait) {
        on (EBegin) : { resume; }
        on (EStart) : {
					if (m_bSpawn2ndGroup) {
						m_bSpawn2ndGroup = FALSE;
						stop;
					} else {
						m_bSpawn2ndGroup = FALSE;
						resume; 
					}
        }
        on (ETimer) : { stop; }
        otherwise() : { pass; }
      }

      // if no more left
      if (m_ctEnemiesSpawned >= m_ctTotal) {
        // finish entire spawner
        return EEnd();
      }
    }
  }

  // teleports the template
  Teleporter()
  {
    // wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      on (EStart) : { stop; };
      otherwise() : { pass; }
    }

    // if should delay
    if (m_tmDelay>0) {
      // wait delay
      autowait(m_tmDelay);
    }

    // teleport it
    TeleportEntity();

		autowait(0.2f);

    // end the spawner
    return EEnd();
  }

  // spawn new entities until you are stopped
  Destroyable()
  {
    // wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      on (EActivate) : { stop; };
      otherwise() : { pass; }
		}

    Triggered();

    // repeat forever
    while(TRUE) {

			// if allowed, spawn a critter
			if (CanSpawn()) {
        // increase the total enemies spawned
        m_ctEnemiesSpawned++;
        // spawn it
        if (m_bPE) {
          SpawnEntityPE();
        } else {
          SpawnEntityCT();
        }
      }
		
      // wait between two entities in group
      autowait(m_tmWait);

      // if no more left
      if (m_ctEnemiesSpawned >= m_ctTotal) {
        // finish entire spawner
        return EEnd();
      }
    }
  }

  Main() {

    // init as nothing
    InitAsEditorModel();
		//InitAsModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_ENEMYSPAWNER);
    SetModelMainTexture(TEXTURE_ENEMYSPAWNER);

    if (m_tmSingleWait <= 0.0f) { m_tmSingleWait = 0.05f; }
    if (m_tmGroupWait <= 0.0f) { m_tmGroupWait = 0.05f; }
        
    // set range
    if (m_fInnerCircle > m_fOuterCircle) {
      m_fInnerCircle = m_fOuterCircle;
    }

    if (m_estType == EST_RESPAWNERBYONE) {
      m_estType = EST_MAINTAINGROUP;
    }

    // check target
    if (m_penTarget != NULL) {
      if (!IsDerivedFromClass(m_penTarget, "Enemy Base")) {
        WarningMessage("Target '%s' is of wrong class!", (const char *) m_penTarget->GetName());
        m_penTarget = NULL;
      }
    }
    if (m_penSeriousTarget != NULL) {
      if (!IsDerivedFromClass(m_penSeriousTarget, "Enemy Base")) {
        WarningMessage("Target '%s' is of wrong class!", (const char *) m_penSeriousTarget->GetName());
        m_penSeriousTarget = NULL;
      }
    }

    // never start ai in wed
    autowait(_pTimer->TickQuantum);

    if (m_bDoubleInSerious && GetSP()->sp_gdGameDifficulty == CSessionProperties::GD_EXTREME) {
      m_ctGroupSize*=2;
      m_ctTotal*=2;
    }
    if (m_penSeriousTarget != NULL && GetSP()->sp_gdGameDifficulty == CSessionProperties::GD_EXTREME) {
      m_penTarget = m_penSeriousTarget;
    }

    m_bFirstPass = TRUE;

    if (m_bSetLevelMods) {
      m_bSetLevelMods = FALSE;
      SetLevelMods();
    }

		if (m_bDestroy) {
       Destroy();
       return;
    }

    if (m_penTarget != NULL) {
			CEntityPointer pen = NULL;
			pen = m_penTarget;
			m_penDeathTarget = ((CEnemyBase&)*pen).m_penDeathTarget;
		}

    wait() {
      on(EBegin) : {
        if (m_estType == EST_TELEPORTER) {
          call Teleporter();
        } else if (m_estType == EST_DESTROYABLE) {
          call Destroyable();
        } else {
					if (m_ctGroupSize == 0) {
						call Uber();
					} else {
						call UberGroup();
					}
        }
      }
			on (EStop) : {
				if (hud_bShowPEInfo) { CPrintF("Purge Event Received\n"); }
				if (hud_bShowPEInfo) { CPrintF("* Spawner Purged *\n"); }
				if (m_penDeathTarget != NULL) {
					for (INDEX a=0; a<m_iCount; a++) {
						SendToTarget(m_penDeathTarget, EET_TRIGGER, this);
					}
				}
				stop;
			}
      on(EEnd) : {
        stop;
      }
    }

		//CPrintF("Spawner Destroyed\n");
    Destroy();

    return;
  };
};
