5007
%{
#include "EntitiesMP/StdH/StdH.h"
extern INDEX dwk_bShowEnemyCount;
//extern INDEX ol_ctSpawnersActive;
//extern FLOAT ol_fSpawnersMaxAge;
//extern FLOAT ol_fLag;
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemySpawner";
uses "EntitiesMP/OverLord";

%{
// projectile solid
#define ECF_PE_SPAWN_PROJ ( \
  ((ECBI_MODEL|ECBI_BRUSH|ECBI_PROJECTILE_SOLID|ECBI_CORPSE|ECBI_MODEL_HOLDER|ECBI_MODEL_HOLDER)<<ECB_TEST) |\
  ((ECBI_PROJECTILE_SOLID)<<ECB_IS) |\
  ((ECBI_MODEL|ECBI_MODEL_HOLDER|ECBI_CORPSE)<<ECB_PASS) )
%}

class CPESpawnProjectile : CMovableModelEntity {
  name      "PESpawnProjectile";
  thumbnail "";

properties:

  1  CEntityPointer m_penTarget,
  2  FLOAT m_tmSingleWait = 0.0f,
  9  INDEX m_ctTotal = 0,
  10 INDEX m_ctEnemyMax = 0,
  11 INDEX m_ctEnemiesInWorld = 0,
  12 BOOL  m_bUseSpray = TRUE,
  13 FLOAT m_fEnemyMaxAdjuster = 1.0f,
  16 CSoundObject m_soEffect,
  17 FLOAT m_fSoundTime = 0.0f,
  18 FLOAT m_fProjectileSize = 1.0f,
  19 CEntityPointer m_penTemplate,
  20 CEntityPointer m_penPatrol,
  22 INDEX m_ctEnemiesSpawned = 0,
  23 INDEX m_iCount = 0,
  24 FLOAT m_fSpawnR = 0.0f,
  25 INDEX m_ctGroupSize = 0,
  26 FLOAT m_tmExpandBox = 0.0001f,
  27 FLOAT m_fStartTime = 0.0f,
  28 INDEX m_iSize = 0,
  29 INDEX m_iSizeLast = 0,
  30 BOOL  m_bPurgeSpawner = FALSE,
  31 CEntityPointer  m_penDeathTarget,
  32 FLOAT m_fH = 0.0f,
  33 BOOL  m_bReduce = FALSE,
  34 BOOL  m_bIsActive = FALSE,
  35 FLOAT m_tmTriggered = 0.0f,
  36 CTString strName = "PES - ",
  37 CTString strCoords = "",
  38 BOOL  m_bReduceWait = FALSE,
  39 BOOL  m_bTriggered = FALSE,
  40 CEntityPointer m_penOverLord,
  42 BOOL  m_bSpawn2ndGroup = TRUE,
  43 FLOAT m_tmWait = 0.0f,

components:
  
  1 model   MODEL_BALL          "Models\\PESpawnProjectile\\PESpawnProjectile.mdl",
  2 texture TEXTURE_BALL        "Models\\PESpawnProjectile\\PESpawnProjectile.tex",
  4 texture TEXTURE_BALL1       "Models\\PESpawnProjectile\\PESpawnProjectile1.tex",
  5 texture TEXTURE_BALL2       "Models\\PESpawnProjectile\\PESpawnProjectile2.tex",
  6 texture TEXTURE_BALL3       "Models\\PESpawnProjectile\\PESpawnProjectile3.tex",

functions:

  void PostMoving(void)
  {
    CMovableModelEntity::PostMoving();
    // stop 
    if (en_vCurrentTranslationAbsolute.Length()<0.5f) {
      ForceFullStop();
      if (m_bUseSpray) {
        AdjustOuterCircle();
      }
      SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
      /*if (!m_bUseSpray) {
        GetModelObject()->StretchModel(FLOAT3D(1, 1, 1)*m_fSpawnR);
        if (m_bReduce)  {
          SetModelMainTexture(TEXTURE_BALL3);
        } else {
          SetModelMainTexture(TEXTURE_BALL1);
        }
      }*/
      GetModelObject()->StretchModel(FLOAT3D(0, 0, 0));
      ModelChangeNotify();
      // trigger self
      this->SendEvent(ETrigger());
    }
  }

  void SpawnEntity(void) {
    if (m_penTemplate!=NULL) {
		  // spawn new entity
		  CEntity *pen = NULL;
      FLOAT3D vHere = GetPlacement().pl_PositionVector;
      //pen = GetWorld()->CopyEntityInWorld( *m_penTemplate,
        //CPlacement3D(FLOAT3D(-32000.0f+FRnd()*200.0f, -32000.0f+FRnd()*200.0f, 0), ANGLE3D(0, 0, 0)) );
      //pl = CPlacement3D(vHere+FLOAT3D(0,0.5f,0), ANGLE3D(m_fH, 0, 0));
		  FLOAT fR = m_fSpawnR*FRnd();
		  FLOAT fA = FRnd()*360.0f;
		  CPlacement3D pl(vHere+FLOAT3D(CosFast(fA)*fR, 0.2f+0.05f*m_fSpawnR, SinFast(fA)*fR), ANGLE3D(m_fH, 0, 0));
      pen = GetWorld()->CopyEntityInWorld( *m_penTemplate, pl);

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
      peb->m_penSpawnerTarget = this;
      peb->m_fFallHeight = -1;
      /*if (m_ctGroupSize>0) {
        peb->m_bPESpawned = TRUE;
      }*/
      if (m_penPatrol!=NULL) {
        peb->m_penMarker = m_penPatrol;
      }        
      if (peb->m_penDeathTarget!=NULL && m_ctEnemiesSpawned>=m_ctTotal) {
        peb->m_iCount = m_iCount;
      }
      pen->Initialize();

		  // calculate new position
		  /*FLOAT fR = m_fSpawnR*FRnd();
		  FLOAT fA = FRnd()*360.0f;
		  CPlacement3D pl(FLOAT3D(CosFast(fA)*fR, 0.1f*m_fSpawnR, SinFast(fA)*fR), ANGLE3D(0, 0, 0));
		  pl.RelativeToAbsolute(GetPlacement());
		  pen->Teleport(pl, FALSE);*/
    }
  };
  
  void SpawnEntity2(void) {
    if (m_penTemplate!=NULL) {
      FLOAT3D vHere = GetPlacement().pl_PositionVector;
		  // spawn new entity
		  CEntity *pen = NULL;
		  CPlacement3D pl;
      FLOAT fA = IRnd()%359;
      pl = CPlacement3D(vHere+FLOAT3D(0,0.5f,0), ANGLE3D(m_fH, 0, 0));
      pen = GetWorld()->CopyEntityInWorld( *m_penTemplate, pl);

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
      peb->m_penSpawnerTarget = this;
      peb->m_fFallHeight = -1;
      /*if (m_ctGroupSize>0) {
        peb->m_bPESpawned = TRUE;
      }*/
      if (m_penPatrol!=NULL) {
        peb->m_penMarker = m_penPatrol;
      }        
      if (peb->m_penDeathTarget!=NULL && m_ctEnemiesSpawned>=m_ctTotal) {
        peb->m_iCount = m_iCount;
      }
      pen->Initialize();

      CMovableEntity *penCritter = (CMovableEntity*)(CEnemyBase*)pen;
      FLOAT fPower = FRnd()*10.0f+15.0f;
      ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(CosFast(fA)*fPower, 
        fPower, SinFast(fA)*fPower), penCritter);
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


  // adjust outer circle
  /*void AdjustOuterCircle(void)  
  { 
    //  center of spawner
    FLOAT3D vBase = GetPlacement().pl_PositionVector;
		vBase(2) += 2.0f;

    // create a set of rays to test for collision with brushes
    FLOAT3D vDest;
    FLOAT fA = 0.0f;
    FLOAT fD = 60.0f;
    m_fSpawnR = fD;

    // for each ray
    for (INDEX i=0; i<12; i++) {
      vDest = vBase+FLOAT3D(CosFast(fA)*fD, 1, SinFast(fA)*fD);
      CCastRay crRay(this, vBase, vDest);
      fA += 30.0f;
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
    if (m_fSpawnR<m_fProjectileSize*3) {
      m_bUseSpray = TRUE;
    }
    CPrintF("m_fSpawnR: %g\n", m_fSpawnR);
  };*/

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
    BOOL bGetAngDistance = TRUE;

    // for each ray
    for (INDEX i=0; i<12; i++) {
      vDest = vBase+FLOAT3D(CosFast(fA)*fD, 1, SinFast(fA)*fD);
      CCastRay crRay(this, vBase, vDest);
      fA += 30.0f;
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
		//CPrintF("m_fSpawnR: %g\n", m_fSpawnR);
  };

  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    colAmbient = C_WHITE;
    return FALSE;
  }

  void SendOverLordEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "OverLord")) {
        pen->SendEvent(EBecomeActive());
      }
    }}
  }

  // Handle an event, return false if the event is not handled
  BOOL HandleEvent(const CEntityEvent &ee)
  {
    if (ee.ee_slEvent==EVENTCODE_ETrigger) {
      ETrigger eTrigger = ((ETrigger &) ee);
      if(IsOfClass(eTrigger.penCaused, "OverLord")) {
				m_bPurgeSpawner = TRUE;
			}
    }
    return CRationalEntity::HandleEvent(ee);
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CPESpawnProjectile) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/
procedures:

  SpawnGroup() 
  {
    // wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      otherwise() : { pass; }
    }

    // repeat forever
    while(TRUE) {

      // if purged, send events and end spawner
      if (m_bPurgeSpawner) {
        //CPrintF(">>>>> PESP purged <<<<<\n");
			  if (m_penDeathTarget!=NULL) {
          for (INDEX a=0; a<m_iCount; a++) {
				    SendToTarget(m_penDeathTarget, EET_TRIGGER, this);
          }
			  }
        Destroy();
        return;
      }

      // if no more left
      if (m_ctEnemiesSpawned>=m_ctTotal) {
        //autowait(60.0f);
        Destroy();
        return;
      }

      if (CountEnemies()) {
        if (!m_bIsActive) {
          m_tmTriggered = _pTimer->CurrentTick();
          m_bIsActive = TRUE;
        }
        m_ctEnemiesSpawned++;
        if (m_bUseSpray) {
		      SpawnEntity2();
        } else {
		      SpawnEntity();
        }
        m_tmWait = m_tmSingleWait;
      } else {
        m_tmWait = m_tmSingleWait*3;
      }

      // wait between two entities in group
      autowait(m_tmWait);
    }
  }

  // --->>> MAIN
  Main() {

    // initialization
    InitAsEditorModel();
    //InitAsModel();
    SetPhysicsFlags(EPF_MODEL_BOUNCING);
    SetCollisionFlags(ECF_PE_SPAWN_PROJ);
    SetModel(MODEL_BALL);
    SetModelMainTexture(TEXTURE_BALL);

    // initialization test
    /*InitAsModel();
    SetPhysicsFlags(EPF_MODEL_BOUNCING);
    SetCollisionFlags(ECF_PE_SPAWN_PROJ);
    SetModel(MODEL_BALL);
    if (m_bReduce)  {
      SetModelMainTexture(TEXTURE_BALL2);
    } else {
      SetModelMainTexture(TEXTURE_BALL);
    }*/
    GetModelObject()->StretchModel(FLOAT3D(1, 1, 1)*m_fProjectileSize);
    ModelChangeNotify();

    /*en_fBounceDampNormal   = 0.05f;
    en_fBounceDampParallel = 0.06f;
    en_fJumpControlMultiplier = 0.0f;
    en_fCollisionSpeedLimit = 45.0f;
    en_fCollisionDamageFactor = 10.0f;
    en_fDeceleration = 5.0f;*/

    if (m_fProjectileSize>20) {
      m_bUseSpray = FALSE;
    } 

    m_fSpawnR = m_fProjectileSize*0.8f;

    if (m_penTemplate!=NULL) {
			CEntityPointer pen = NULL;
			pen = m_penTemplate;
			m_penDeathTarget = ((CEnemyBase&)*pen).m_penDeathTarget;
    } else {
      CPrintF("PESP has NO TEMPLATE!!!!!\n");
    }
    
    //m_tmTriggered = _pTimer->CurrentTick();
    //FLOAT tmDelay = FRnd()*0.3f;

    //autowait(tmDelay);

    jump SpawnGroup();

    return;
  }
};
