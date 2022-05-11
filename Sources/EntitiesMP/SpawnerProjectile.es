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

507
%{
#include "EntitiesMP/StdH/StdH.h"
extern INDEX dwk_bShowEnemyCount;
 
#define ECF_SPAWNERPROJECTILE ( \
  ((ECBI_BRUSH)<<ECB_TEST) |\
  ((ECBI_MODEL|ECBI_CORPSE|ECBI_ITEM|ECBI_PROJECTILE_MAGIC|ECBI_PROJECTILE_SOLID)<<ECB_PASS) |\
  ((ECBI_MODEL)<<ECB_IS))
#define EPF_SPAWNERPROJECTILE  ( \
  EPF_ONBLOCK_STOP|EPF_ORIENTEDBYGRAVITY|\
  EPF_TRANSLATEDBYGRAVITY|EPF_MOVABLE)

%}


uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Summoner";
uses "EntitiesMP/Player";
uses "EntitiesMP/OverLord";

// input parameter for twister
event ESpawnerProjectile {
  CEntityPointer penOwner,         // entity which owns it
  CEntityPointer penTemplate,      // template of the enemy to be spawned
};

%{
void CSpawnerProjectile_OnPrecache(CDLLEntityClass *pdec, INDEX iUser) 
{
  pdec->PrecacheClass(CLASS_BASIC_EFFECT, BET_CANNON);
  pdec->PrecacheModel(MODEL_INVISIBLE);
};
%}

class CSpawnerProjectile : CMovableModelEntity {
  name      "SpawnerProjectile";
  thumbnail "";
  features "ImplementsOnPrecache";

properties:
  1 CEntityPointer m_penOwner,                  // entity which owns it
  2 CEntityPointer m_penTemplate,               // entity which owns it
  4 FLOAT m_fSize = 0.0f,       // for particle rendering
  5 FLOAT m_fTimeAdjust = 0.0f, // for particle rendering
  6 BOOL  m_bExploding = FALSE,
  7 FLOAT m_fExplosionDuration = 0.25f, // how long to explode
  8 FLOAT m_tmExplosionBegin = 0.0f, // explosion beginning time
  9 FLOAT m_tmSpawn = 0.0f,         // for particle rendering

  10 INDEX m_ctTotal = 0,
  11 FLOAT m_fSpawnR = 0.0f,
  12 INDEX m_ctEnemyMax = 0,
	13 FLOAT m_tmWait = 0.0f,
	14 FLOAT m_tmSingleWait = 0.4f,

components:
  
  1 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
 10 model   MODEL_INVISIBLE     "ModelsMP\\Enemies\\Summoner\\SpawnerProjectile\\Invisible.mdl",
    
functions:
  
  void SpawnEntity()
  {
    if (m_penTemplate!=NULL) {
      CEntity *pen = NULL;
      // copy template entity
      pen = GetWorld()->CopyEntityInWorld( *m_penTemplate,
        CPlacement3D(FLOAT3D(-32000.0f+FRnd()*200.0f, -32000.0f+FRnd()*200.0f, 0), ANGLE3D(0, 0, 0)) );
    
      // change needed properties
      pen->End();
    
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
      peb->m_tmSpawned = _pTimer->CurrentTick();
      pen->Initialize();    
  
		  // calculate new position
		  FLOAT fR = m_fSpawnR*FRnd();
		  FLOAT fA = FRnd()*360.0f;
		  CPlacement3D pl(FLOAT3D(CosFast(fA)*fR, 0.1f*m_fSpawnR, SinFast(fA)*fR), ANGLE3D(0, 0, 0));
		  pl.RelativeToAbsolute(GetPlacement());
		  pen->Teleport(pl, FALSE);
    }
      
    ChangeEnemyNumberForAllPlayers(+1);

  };
  
  void Explode(void)
  {
    // spawn explosion
    CPlacement3D plExplosion = GetPlacement();
    CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_EXPLOSION02;
    eSpawnEffect.vStretch = FLOAT3D(1.0f,1.0f,1.0f);
    penExplosion->Initialize(eSpawnEffect);

    // explosion debris
    eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
    CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    penExplosionDebris->Initialize(eSpawnEffect);
/*
    // explosion smoke
    eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
    CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    penExplosionSmoke->Initialize(eSpawnEffect);
    
    
    // spawn smoke effect
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_CANNON;
    ese.vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    CEntityPointer penEffect = CreateEntity(this->GetPlacement(), CLASS_BASIC_EFFECT);
    penEffect->Initialize(ese);
    */
  };
  
  void RenderParticles(void) {
    Particles_AfterBurner( this, m_tmSpawn, 1.0f, 1);
    if (m_bExploding)
    {
      //Particles_SummonerProjectileExplode( this, m_fSize, m_tmExplosionBegin, m_fExplosionDuration, m_fTimeAdjust );
    }
  }

  // adjust outer circle
  void AdjustOuterCircle(void)  
  { 
    //  center of spawner
    const FLOAT3D &vBase = GetPlacement().pl_PositionVector;

    // create a set of rays to test for collision with brushes
    FLOAT3D vDest;
    FLOAT fA = 0.0f;
    FLOAT fD = 30.0f;
    m_fSpawnR = fD;
    INDEX iAngleCount = 0;
    BOOL bGetAngDistance = TRUE;

    // for each ray
    for (INDEX i=0; i<16; i++) {
      vDest = vBase+FLOAT3D(CosFast(fA)*fD, 1, SinFast(fA)*fD);
      CCastRay crRay(this, vBase, vDest);
      fA += 22.5f;
      iAngleCount++;
      if (iAngleCount>1) {
        iAngleCount = 0;
        bGetAngDistance = TRUE;
      }
      crRay.cr_bHitTranslucentPortals = TRUE;
      crRay.cr_ttHitModels = CCastRay::TT_NONE; 
      crRay.cr_fTestR = 0.1f;
      GetWorld()->CastRay(crRay);
	    // if hit something
      if (crRay.cr_penHit!=NULL && crRay.cr_fHitDistance<m_fSpawnR) {
        m_fSpawnR = crRay.cr_fHitDistance;
	    }
	  }
		if (m_fSpawnR>=fD || m_fSpawnR<=0) { 
      m_fSpawnR = fD; 
    }
    m_fSpawnR *= 0.8f;
  };

  BOOL CountEnemies(void)
  {
		FLOAT fLag = 0.0f;
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "OverLord")) {
				COverLord *penOverLord = (COverLord *)pen;
				fLag = penOverLord->m_fLag;
      }
    }}
    if (fLag>m_ctEnemyMax) {
			m_tmWait = m_tmSingleWait*2;
      return FALSE;
    } else {
			if (fLag<m_ctEnemyMax/2) {
				m_tmWait = m_tmSingleWait/2;
			} else {
				m_tmWait = m_tmSingleWait;
			}
      return TRUE;
    }
  };


  void ChangeEnemyNumberForAllPlayers(INDEX iDelta)
  {
    // get music holder if it exists
    CMusicHolder *penMusicHolder = GetMusicHolder();

    //  if it exists, increase the number of spawned enemies in music holder
    if (penMusicHolder!=NULL) {
      penMusicHolder->m_ctEnemiesInWorld+=iDelta;
    }

    // find actual number of players
    INDEX ctMaxPlayers = GetMaxPlayers();
    CEntity *penPlayer;
    
    for(INDEX i=0; i<ctMaxPlayers; i++) {
      penPlayer=GetPlayerEntity(i);
      if (penPlayer) {
        // set totals for level and increment for game
        ((CPlayer &)*penPlayer).m_psLevelTotal.ps_iKills+=iDelta;
        ((CPlayer &)*penPlayer).m_psGameTotal.ps_iKills+=iDelta;
      }
    }
  };

  CMusicHolder *GetMusicHolder()
  {
    CEntity *penMusicHolder;
    penMusicHolder = _pNetwork->GetEntityWithName("MusicHolder", 0);
    return (CMusicHolder *)&*penMusicHolder;
  }
  
 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/
procedures:

  SpawnGroup() {
    wait() {
      on (EBegin) : { 
        Explode();
        SwitchToEditorModel();       
        stop; 
      }
      otherwise() : { pass; }
    }
    // repeat
    while(TRUE) {

      // if no more left
      if (m_ctTotal<=0) {
        // finish entire spawner
        Destroy();
      }     
      
      if (CountEnemies()) {
        m_ctTotal--;
        SpawnEntity();
      }

      autowait(m_tmWait);      
    }
  }
  
  // --->>> MAIN
  Main(ESpawnerProjectile esp) {
    // remember the initial parameters
    ASSERT(esp.penOwner!=NULL);
    ASSERT(esp.penTemplate!=NULL);
    ASSERT(IsDerivedFromClass(esp.penTemplate, "Enemy Base"));
    m_penOwner = esp.penOwner;
    m_penTemplate = esp.penTemplate;

    if ( IsDerivedFromClass(m_penTemplate, "Demon" )) {
			m_ctTotal = 1;
    } else if ( IsDerivedFromClass(m_penTemplate, "Beast" )) {
			m_ctTotal = 1;
    } else if ( IsDerivedFromClass(m_penTemplate, "Elemental")) { 
			m_ctTotal = 1;
    } else if ( IsDerivedFromClass(m_penTemplate, "Walker")) {
			m_ctTotal = INDEX(GetGameEnemyMultiplier()/2);
		} else {
			m_ctTotal = GetGameEnemyMultiplier();
		}

    m_fTimeAdjust = FRnd()*5.0f;
    EntityInfo *pei = (EntityInfo*) (m_penTemplate->GetEntityInfo());
    m_fSize = pei->vSourceCenter[1]*0.2f;

    m_tmSpawn=_pTimer->CurrentTick();

    // initialization
    InitAsModel();
    SetPhysicsFlags(EPF_SPAWNERPROJECTILE);
    SetCollisionFlags(ECF_SPAWNERPROJECTILE);
    SetFlags(GetFlags() | ENF_SEETHROUGH);
    SetModel(MODEL_INVISIBLE);
    
    Particles_AfterBurner_Prepare(this);

    m_ctTotal = GetGameEnemyMultiplier();

    m_ctEnemyMax = GetSP()->sp_iEnemyMax*0.5f;

    // loop untill touched something
    wait() {
      on (EBegin) : { resume; }
      on (ETouch et) : { stop; }
      otherwise (): { resume; }
    }
    
    m_bExploding = TRUE;
    m_tmExplosionBegin = _pTimer->CurrentTick();
    AdjustOuterCircle();

    jump SpawnGroup();    
   
    return;
  }
};
