5007
%{
#include "EntitiesMP/StdH/StdH.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/OverLord";
uses "EntitiesMP/BasicEffects";

class CPESpawnProjectile2 : CMovableModelEntity {
  name      "PESpawnProjectile2";
  thumbnail "";
  //features "ImplementsOnPrecache";

properties:

  1  CEntityPointer m_penTarget,
  2  FLOAT m_tmSingleWait = 0.0f,
  3  INDEX m_tmDelay = 4.0f,
	6  INDEX m_ctInGroup = 0,
  7  INDEX m_iType = 0,
  8  INDEX m_iRandomSubClass = 0,
  9  INDEX m_ctTotal = 0,
  10 INDEX m_ctEnemyMax = 0,
  11 INDEX m_ctEnemiesInWorld = 0,
  12 BOOL  m_bUseBosses = FALSE,
  13 FLOAT m_fEnemyMaxAdjuster = 1.0f,
  14 BOOL  m_bUseRandomType = FALSE,
  15 INDEX m_iTypeRange = 0,
  16 CSoundObject m_soEffect,
  17 FLOAT m_fSoundTime = 0.0f,
  18 FLOAT m_fProjectileSize = 10.0f,
  19 CEntityPointer m_penTemplate,
  20 CEntityPointer m_penPatrol,
  21 BOOL m_bFinalProjectile = FALSE,
  22 INDEX m_ctEnemiesSpawned = 0,
	23 FLOAT m_tmWait = 0.0f,
	24 INDEX m_iEventType = 0,
	25 FLOAT m_fEntitySize = 1.0f,
  26 FLOAT m_fMX = 1.0f,
  27 FLOAT m_fMZ = 1.0f,

 {
   // array of enemies
   CDynamicContainer<CEntity> m_cenLagMakers;
 }

components:
  
  1 model   MODEL_BALL          "Models\\PESpawnProjectile\\PESpawnProjectile.mdl",
  2 texture TEXTURE_BALL        "Models\\PESpawnProjectile\\PESpawnProjectile.tex",
	3 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  4 sound   SOUND_TELEPORT      "Sounds\\Misc\\Teleport.wav",

functions:

  void Precache(void) {
    PrecacheModel(MODEL_BALL);
    PrecacheTexture(TEXTURE_BALL);
  }

  void PostMoving(void)
  {
    CMovableModelEntity::PostMoving();
    if (en_vCurrentTranslationAbsolute.Length()<0.5f) {
      SendEvent(EStop());
    }
  }

  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    colAmbient = C_WHITE;
    return FALSE;
  }

  // spawn new entity PE style
  void SpawnEntity(void) 
  {
    if (m_penTemplate!=NULL) {
      // copy entity into world
      CEntity *pen = NULL;
		  CPlacement3D pl;
      pl = GetPlacement();
			pl.pl_PositionVector(2) += 0.1f;
			// calculate new position
			FLOAT fA = FRnd()*360.0f;
			pl.pl_PositionVector(1) += m_fMX;
			pl.pl_PositionVector(3) += m_fMZ;
      pen = GetWorld()->CopyEntityInWorld( *m_penTemplate, pl);

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
			if (m_iEventType==2) {
				peb->m_penSpawnerBattery = m_penTarget;
			}
      peb->m_fFallHeight = -1;
      if (m_penPatrol!=NULL) {
        peb->m_penMarker = m_penPatrol;
      }
      pen->Initialize();

      // fire it........
      CMovableEntity *penCritter = (CMovableEntity*)(CEnemyBase*)pen;
      FLOAT fPowerUp = FRnd()*5.0f+15.0f;
      FLOAT fPowerOut = FRnd()*15.0f+15.0f;
			((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(CosFast(fA)*fPowerOut, fPowerUp, SinFast(fA)*fPowerOut), penCritter);
    }
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

	void SpawnEffect(void)
	{
    // spawn teleport effect
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.betType = BET_IMPLOSION;
    ese.vNormal = FLOAT3D(0,1,0);
		CPlacement3D pl;
    pl = GetPlacement();
		pl.pl_PositionVector(2) += 0.1f;
		// calculate new position
		FLOAT fA = FRnd()*360.0f;
		m_fMX = CosFast(fA)*5.0f;
		pl.pl_PositionVector(1) += m_fMX;
		m_fMZ = SinFast(fA)*5.0f;
		pl.pl_PositionVector(3) += m_fMZ;
    ese.vStretch = FLOAT3D(m_fEntitySize, m_fEntitySize, m_fEntitySize);
    CEntityPointer penEffect = CreateEntity(pl, CLASS_BASIC_EFFECT);
    penEffect->Initialize(ese);
	}

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CPESpawnProjectile2) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/

procedures:

  SpawnGroup() 
  {
    // repeat forever
    while(TRUE) {

      // if no more left
      if (m_ctInGroup>m_ctTotal) {
        // finish entire spawner
				if (m_iEventType==1 && m_penTarget!=NULL) {
					SendToTarget(m_penTarget, EET_STOPATTACK, this);
				}
				autowait(0.1f);
        Destroy();
				return;
      }

      if (CountEnemies()) {
				SpawnEffect();
		    m_ctInGroup++;
        m_ctEnemiesSpawned++;
		    SpawnEntity();
      }
				
			autowait(m_tmWait);
    }
  }
  
  // --->>> MAIN
  Main() {

    // initialization
		if (GetSP()->sp_bTestSpawnerBatteries) {
			InitAsModel();
		} else {
			InitAsEditorModel();
		}
    SetPhysicsFlags(EPF_MODEL_BOUNCING);
    SetCollisionFlags(ECF_PROJECTILE_SOLID);
    SetFlags(GetFlags() | ENF_SEETHROUGH);
    SetModel(MODEL_BALL);
		SetModelMainTexture(TEXTURE_BALL);
    GetModelObject()->StretchModel(FLOAT3D(m_fProjectileSize, m_fProjectileSize, m_fProjectileSize));
    ModelChangeNotify();

		en_fBounceDampNormal   = 0.1f;
		en_fBounceDampParallel = 0.5f;

    m_ctEnemyMax =  GetSP()->sp_iEnemyMax;
    m_ctEnemyMax  *= m_fEnemyMaxAdjuster;
    m_ctEnemyMax -= _pNetwork->ga_sesSessionState.GetPlayersCount()*2;
    
    if (m_penTemplate!=NULL) {
			CEntity *pen = m_penTemplate;
			CEnemyBase *peb = ((CEnemyBase*)pen);
			FLOATaabbox3D box;
			peb->GetBoundingBox(box);
			m_fEntitySize = box.Size().MaxNorm()/2;
		}

    // loop until touched something
    wait() {
      on (EBegin) : { 
				if (m_penTemplate!=NULL) {
					resume; 
				} else {
					stop;
				}
			}
      on (EStop) : { call SpawnGroup(); }
			on (EEnd) : { stop; }
    }

		Destroy();

    return;
  }
};
