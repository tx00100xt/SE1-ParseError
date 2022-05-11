5003
%{
#include "EntitiesMP/StdH/StdH.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/OverLord";
uses "EntitiesMP/BatteryMarker";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Box";

enum SpawnType {
  0 ST_FIRE_NORMAL		"Fire Normal (Hemispherical Range)", 
  1 ST_FIRE_FORWARD   "Fire Forward (Angular Hemispherical Range)",
};

class export CPESpawnerEG : CRationalEntity {
  name      "PESpawnerEG";
	thumbnail "Thumbnails\\EnemySpawner.tbn";
	features  "HasTarget", "IsTargetable";

properties:

	// area box info

	// editor
  10 CEntityPointer m_penTarget  "> EV - Event Target" COLOR(C_BLUE|0xFF),
  11 enum  SpawnType m_stSpawnType "-> Spawn Type" = ST_FIRE_NORMAL,

  20 RANGE m_fFirePower "-> Firing Range" 'F' = 20.0f,
  21 INDEX m_ctTotal "-> Total Enemy Count (Before Enemy X)" 'T' = 10,
  22 FLOAT m_fEnemyMaxAdjuster "-> Enemy Max Adjuster" 'M' = 1.0f,
  23 CEntityPointer m_penPatrol  "-> Patrol Target" 'P' COLOR(C_lGREEN|0xFF),
	24 FLOAT m_fEnemyXAdjuster "-> Enemy X Adjuster" = 1.0f,
	29 BOOL  m_bUseSingleType "-> Use Single Random Type" 'S' = FALSE,
	30 RANGE m_fTouchBoxSize = 50.0f,
	32 BOOL  m_bUseAllTypes = FALSE,
	33 INDEX m_iCount = 0,
	34 INDEX m_iTouchBoxSize = 1,

	// internal 
  94  FLOAT m_tmSingleWait = 0.3f,
	95	CPlacement3D m_plSpawn = CPlacement3D(FLOAT3D(0,0,0), ANGLE3D(0,0,0)),
	96	RANGE m_fSearchRange = 50.0f,
  99  CEntityPointer m_penTemplate,
  100 CTString m_strDescription = "",
	102 INDEX m_iRandomTotal = 0,
	103 INDEX m_iRandomChosen = 0,
  107 FLOAT m_tmWait = 0.1f,
  108 INDEX m_ctEnemyMax = 0,
	109 INDEX m_ctEnemiesSpawned = 0,
	110 FLOAT m_fEntitySize = 5.0f,

	75 BOOL  m_bUseDemon "01 Use Demon" = FALSE,
	76 BOOL  m_bUseChFreak "02 Use Chainsaw Freak" = FALSE,
	77 BOOL  m_bUseGruntS "03 Use Grunt Soldier" = FALSE,
	78 BOOL  m_bUseGruntC "04 Use Grunt Commander" = FALSE,
	79 BOOL  m_bUseGuffy "05 Use Guffy" = FALSE,

	181 CEntityPointer m_penDemon,
	182 CEntityPointer m_penChFreak,
	183 CEntityPointer m_penGruntS,
	184 CEntityPointer m_penGruntC,
	185 CEntityPointer m_penGuffy,


components:

  1 model   MODEL_SPAWNER							"Models\\Editor\\EnemySpawner.mdl",
  2 texture TEXTURE_SPAWNER						"Models\\Editor\\EnemySpawner.tex",
	3 class   CLASS_BOX									"Classes\\Box.ecl",
	4 class   CLASS_BASIC_EFFECT				"Classes\\BasicEffect.ecl",

functions:

	// get all the templates we might possibly need
  void GetEnemyTemplates(void) {
    // for each entity in the world
		{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
        if (penEnemy->m_bTemplate) {
					if (penEnemy->m_strName=="*Demon Temp")			{ m_penDemon = penEnemy;		}
					if (penEnemy->m_strName=="*ChFreak Temp")		{ m_penChFreak = penEnemy;	}
					if (penEnemy->m_strName=="*GruntS Temp")		{ m_penGruntS = penEnemy;		}
					if (penEnemy->m_strName=="*GruntC Temp")		{ m_penGruntC = penEnemy;		}
					if (penEnemy->m_strName=="*Guffy Temp")			{ m_penGuffy = penEnemy;		}
        }
      }
    }}
  }

	void SetCustomUsesToTrue(void)
	{
		m_bUseChFreak = TRUE;
		m_bUseGruntS = TRUE;
		m_bUseGruntC = TRUE;
		m_bUseGuffy = TRUE;
	}

	void GetCustomRangeTotal(void)
	{
		m_iRandomTotal = 0;

		if (m_bUseDemon)		{ m_iRandomTotal++; }
		if (m_bUseChFreak)	{ m_iRandomTotal++; }
		if (m_bUseGruntS)		{ m_iRandomTotal++; }
		if (m_bUseGruntC)		{ m_iRandomTotal++; }
		if (m_bUseGuffy)		{ m_iRandomTotal++; }

		// make sure we never, ever, divide by zero
		if (m_iRandomTotal<=0) {
			m_iRandomTotal = 1;
		}
		//if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("m_iRandomTotal = %d\n", m_iRandomTotal); }
		//CPrintF("m_iRandomTotal = %d\n", m_iRandomTotal);
	}

	void GetRandomTemplate(void)
	{
		if (m_iRandomTotal<=0) {
			m_iRandomTotal = 1;
		}
		m_iRandomChosen = IRnd()%m_iRandomTotal;
		//if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("m_iRandomChosen = %d\n", m_iRandomChosen); }
		//CPrintF("m_iRandomChosen = %d\n", m_iRandomChosen);
		INDEX iRandomTemp = -1;

		if (m_bUseDemon) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penDemon;
				return;
			}
		}
		if (m_bUseChFreak) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penChFreak;
				return;
			}
		}
		if (m_bUseGruntS) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penGruntS;
				return;
			}
		}
		if (m_bUseGruntC) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penGruntC;
				return;
			}
		}
		if (m_bUseGuffy) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penGuffy;
				return;
			}
		}
	}

  void SpawnEntityOut(void) 
  {
    if (m_penTemplate != NULL) {
      // copy entity into world
      CEntity *pen = NULL;
		  CPlacement3D pl = m_plSpawn;

      pen = GetWorld()->CopyEntityInWorld( *m_penTemplate, pl);

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
      //peb->m_penSpawnerBattery = this;
      peb->m_fFallHeight = -1;
      if (m_penPatrol != NULL) {
        peb->m_penMarker = m_penPatrol;
      }
      pen->Initialize();

      // fire it........
      FLOAT fA = FRnd()*360.0f;
      CMovableEntity *penCritter = (CMovableEntity*)(CEnemyBase*)pen;
      FLOAT fPowerUp = (FRnd()*0.25f+0.5f)*m_fFirePower;
      FLOAT fPowerOut = (FRnd()*0.5f+0.5f)*m_fFirePower;
			((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(CosFast(fA)*fPowerOut, 
				fPowerUp, SinFast(fA)*fPowerOut), penCritter);
    }
  }

  void SpawnEntityForward(void) 
  {
    if (m_penTemplate != NULL) {
      // copy entity into world
      CEntity *pen = NULL;
		  CPlacement3D pl = m_plSpawn;
			pl.pl_OrientationAngle(1) += FRnd()*20.0f-10.0f;
      pen = GetWorld()->CopyEntityInWorld( *m_penTemplate, pl);

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
      //peb->m_penSpawnerBattery = this;
      peb->m_fFallHeight = -1;
      if (m_penPatrol != NULL) {
        peb->m_penMarker = m_penPatrol;
      }
      pen->Initialize();

      // fire it........
      FLOAT fA = FRnd()*360.0f;
      CMovableEntity *penCritter = (CMovableEntity*)(CEnemyBase*)pen;
      FLOAT fPower = (FRnd()*0.5f+1.0f)*m_fFirePower;
      ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(0, FRnd()*1.0f, -fPower), penCritter);
    }
  }

  BOOL CountEnemies(void)
  {
		FLOAT fLag = 0.0f;
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				if (penEnemy->m_bHasBeenSpawned) {
					fLag += penEnemy->m_fLagger;
        }
      }
    }}

		if (m_ctEnemiesSpawned == 10 ) {
			m_tmSingleWait /= 1.5f;
		}

    if (fLag > m_ctEnemyMax) {
			m_tmWait = 0.5f;
      return FALSE;
    } else {
			if (fLag < m_ctEnemyMax/2 && m_ctEnemiesSpawned >  4) {
				m_tmWait = m_tmSingleWait/2;
			} else {
				m_tmWait = m_tmSingleWait;
			}
      return TRUE;
    }
  }

	void SpawnEffect(CPlacement3D pl)
	{
    // spawn teleport effect
		ESpawnEffect ese;
		CPlacement3D plEffect = pl;
		FLOAT fSize = 2.0f;
		/*if (m_fEntitySize>1) {
			fSize = m_fEntitySize;
		}*/
		//fSize *= 2.0f;
		//plEffect.pl_PositionVector(2) += 10.0f;//m_fEntitySize*0.25f;
		ese.colMuliplier = C_WHITE|CT_OPAQUE;
		ese.betType = BET_IMPLOSION;
		ese.vNormal = FLOAT3D(0,1,0);
		ese.vStretch = FLOAT3D(fSize, fSize, fSize);
		CEntityPointer penEffect = CreateEntity(plEffect, CLASS_BASIC_EFFECT);
		penEffect->Initialize(ese);
	}

	void GetRandomPlacement(void)
	{
		INDEX ctMarkers = 0;
		CPlacement3D plPen;

		// get our intitial placement
		CPlacement3D pl = GetPlacement();
		m_plSpawn = pl;
		m_plSpawn.pl_PositionVector(2) += 0.5f;

		// if we should try and find an enemy marker for random spawning placement
		if (m_fSearchRange > 0) {
			// get the number of enemy markers in the search radius
			{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
				CEntity *pen = iten;
				if (IsOfClass(pen, "Enemy Marker")) {
					plPen = pen->GetPlacement();
					if ((pl.pl_PositionVector - plPen.pl_PositionVector).Length() < m_fSearchRange) {
						ctMarkers++;
					}
				}
			}}

			// choose one of the available markers if any
			if (ctMarkers > 0) {
				INDEX iChosenMarker = IRnd()%ctMarkers;
				ctMarkers = 0;
				// for each entity in the world
				{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
					CEntity *pen = iten;
					if (IsOfClass(pen, "Enemy Marker")) {
						CPlacement3D plPen = pen->GetPlacement();
						if ((pl.pl_PositionVector - plPen.pl_PositionVector).Length() < m_fSearchRange) {
							if (ctMarkers == iChosenMarker) {
								// this is where we want to spawn from
								m_plSpawn = plPen;
								m_plSpawn.pl_PositionVector(2) += 0.5f;
								// set the patrol marker to this marker's target
								CEnemyMarker *penEnemyMarker = (CEnemyMarker *)pen;
								m_penPatrol = penEnemyMarker->m_penTarget;
							}
							ctMarkers++;
						}
					}
				}}
			}
		}
	}

  void CreateTouchBox(void)
  {
    CPlacement3D pl;
    CEntity *pen = NULL;
    pl = GetPlacement();
    pen = CreateEntity(pl, CLASS_BOX);
    CBox *box = ((CBox*)pen);
    box->m_penTarget = this;
		box->m_iSize = m_iTouchBoxSize;
    box->Initialize();
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CPESpawnerEG) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/
procedures:

  FireCrittersOut(EVoid) 
  {
    // repeat forever
    while(TRUE) {

      if (CountEnemies()) {
				//SpawnEffect(m_plSpawn);
				//autowait(0.5f);
        m_ctEnemiesSpawned++;
				if (!m_bUseSingleType && m_iRandomTotal > 1) {
					GetRandomTemplate();
				}
				SpawnEntityOut();
      }

			// wait between two entities in group
			autowait(m_tmWait);

      // if no more left
      if (m_ctEnemiesSpawned >= m_ctTotal) {
				return EEnd();
      }
		}
  }

  FireCrittersForward(EVoid) 
  {
    // repeat forever
    while(TRUE) {

      if (CountEnemies()) {
				//SpawnEffect(m_plSpawn);
				//autowait(0.5f);
        m_ctEnemiesSpawned++;
				if (!m_bUseSingleType && m_iRandomTotal > 1) {
					GetRandomTemplate();
				}
				SpawnEntityForward();
      }

			// wait between two entities in group
			autowait(m_tmWait);

      // if no more left
      if (m_ctEnemiesSpawned >= m_ctTotal) {
				return EEnd();
      }
		}
  }
  
  Main(EVoid) {

		//CPrintF("PESpawnerEG Main()\n");
		InitAsEditorModel();
		//InitAsModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
    SetModel(MODEL_SPAWNER);
		SetModelMainTexture(TEXTURE_SPAWNER);

    GetEnemyTemplates();

		if (m_bUseAllTypes) {
			SetCustomUsesToTrue();
		}

		// get the total for m_iRandomTotal 
		GetCustomRangeTotal();

		CreateTouchBox();

		INDEX iExtra = GetGameEnemyMultiplier();
		m_ctEnemyMax = GetSP()->sp_iEnemyMax;
    m_ctEnemyMax = Clamp(INDEX(m_ctEnemyMax*1.5f), INDEX(1), INDEX(1000));

		m_iCount = m_ctTotal;
		m_ctTotal *= Clamp(INDEX(iExtra*m_fEnemyXAdjuster), INDEX(1), INDEX(1000));

		m_ctEnemiesSpawned = 0;

		// wait to be triggered
    wait() {
      on (EBegin) : { resume; }
			on (EEnd) : { stop; };
      on (ETrigger) : { 
				//CPrintF("PESpawnerEG Triggered...\n");
				GetRandomPlacement(); 
				GetRandomTemplate();
				if (m_stSpawnType == ST_FIRE_NORMAL) {
					call FireCrittersOut();
				} else {
					call FireCrittersForward();
				}
				resume; 
			};
      otherwise() : { pass; }
    }

		Destroy();

    return;
  };
};
