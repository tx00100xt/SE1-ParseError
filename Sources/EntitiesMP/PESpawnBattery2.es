5012
%{
#include "EntitiesMP/StdH/StdH.h"
#include <Engine/CurrentVersion.h>

%}

uses "EntitiesMP/PESpawnProjectile2";
uses "EntitiesMP/Player";
uses "EntitiesMP/BatteryMarker";

enum EnemyType2 {
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
	12 ET_CH_FREAK "Chainsaw Freak",
	13 ET_GRUNT    "Grunt",
	14 ET_GUFFY    "Guffy",
};

enum EnemyType3 {
  0 ET_BONEMAN    "Boneman",      
  1 ET_HEADMAN    "Headman Rocketman", 
	2 ET_HEADMAN    "Headman Bomberman",
	3 ET_HEADMAN    "Headman Firecracker", 
	4 ET_HEADMAN    "Headman Kamikazi", 
  5 ET_EYEMAN     "Eyeman",  
  3 ET_WEREBULL   "Werebull",
	4 ET_GRUNT      "Grunt",
	5 ET_CH_FREAK   "Chainsaw Freak",
	6 ET_GUFFY      "Guffy",
  7 ET_WALKER     "Walker",  
  8 ET_BEAST      "Beast", 
	9 ET_DEMON      "Demon",
  10 ET_FISH      "Fish",  
  11 ET_HARPY     "Harpy",
  12 ET_GIZMO     "Gizmo", 
  13 ET_SCORPMAN  "Scorpman",  
  14 ET_ELEMENTAL "Elemental",
};

	70 BOOL  m_bUseCustomRange "Use A Custom Range If so set below" = FALSE,
	71 BOOL  m_bUseBMan "Use Boneman" = FALSE,
	72 BOOL  m_bUseHManR "Use Headman Rocketman" = FALSE,
	73 BOOL  m_bUseHManB "Use Headman Bomberman" = FALSE,
	74 BOOL  m_bUseHManF "Use Headman Firecracker" = FALSE,
	75 BOOL  m_bUseHManK "Use Headman Kamikazi" = FALSE,
	76 BOOL  m_bUseEManSE "Use Eyeman Sergeant" = FALSE,
	77 BOOL  m_bUseEManSO "Use Eyeman Soldier" = FALSE,
	78 BOOL  m_bUseWBull "Use Werebull" = FALSE,
	79 BOOL  m_bUseWalkerSE "Use Walker Sergeant" = FALSE,
	80 BOOL  m_bUseWalkerSO "Use Walker Soldier" = FALSE,
	81 BOOL  m_bUseBeastH "Use Beast Normal" = FALSE,
	82 BOOL  m_bUseBeastB "Use Beast Big" = FALSE,
	83 BOOL  m_bUseBeastN "Use Beast Huge" = FALSE,
	84 BOOL  m_bUseElemL "Use Elemental Large" = FALSE,
	85 BOOL  m_bUseElemB "Use Elemental Big" = FALSE,
	86 BOOL  m_bUseElemS "Use Elemental Small" = FALSE,
	87 BOOL  m_bUseSManG "Use Scorpman General" = FALSE,
	88 BOOL  m_bUseSManS "Use Scorpman Soldier" = FALSE,
	89 BOOL  m_bUseGizmo "Use Gizmo" = FALSE,
	90 BOOL  m_bUseFish "Use Fish" = FALSE,
	91 BOOL  m_bUseHarpy "Use Harpy" = FALSE,
	92 BOOL  m_bUseDemon "Use Demon" = FALSE,
	93 BOOL  m_bUseChainFreak "Use Chainsaw Freak" = FALSE,
	94 BOOL  m_bUseGruntS "Use Grunt Solier" = FALSE,
	95 BOOL  m_bUseGruntC "Use Grunt Commander" = FALSE,
	96 BOOL  m_bUseGuffy "Use Guffy" = FALSE,

/*enum EnemyTypeRange {
  0 ETR_NONE					"None", 
  1 ETR_BMAN_HMAN			"Boneman - Headman",    
  2 ETR_BMAN_EMAN			"Boneman - Eyeman",  
  3 ETR_BMAN_WBULL		"Boneman - Werebull",  
  5 ETR_BMAN_GRUNT		"Boneman - Grunt",
	6 ETR_BMAN_CHFREAK	"Boneman - ChainFreak",
	7 ETR_BMAN_GUFFY		"Boneman - Guffy",
  4 ETR_BMAN_WALKER		"Boneman - Walker",
	8 ETR_BMAN_BEAST		"Boneman - Beast",
	9 ETR_BMAN_DEMON		"Boneman - Demon",
};*/

enum EnemyTypeRange {
  0 ETR_NONE					"None", 
  1 ETR_BMAN_HMAN			"Boneman thru Headman",    
  2 ETR_BMAN_EMAN			"Boneman thru Eyeman",  
  3 ETR_BMAN_WBULL		"Boneman thru Werebull",   
  4 ETR_BMAN_WALKER		"Boneman thru Walker",  
  5 ETR_BMAN_BEAST		"Boneman thru Beast", 
	6 ETR_BMAN_GRUNT		"Boneman thru Grunt",
	7 ETR_BMAN_CHFREAK	"Boneman thru ChainFreak",
	8 ETR_BMAN_GUFFY		"Boneman thru Guffy",
};


class CPESpawnBattery : CMovableModelEntity {
  name      "PESpawnBattery";
  thumbnail "Thumbnails\\SpawnerBattery.tbn";
  features  "HasName", "HasTarget", "IsTargetable";

properties:

  1  CEntityPointer m_penTarget  "Death Target" 'T' COLOR(C_BLUE|0xFF),
  2  CTString m_strName = "Spawner Battery - ",
  3  FLOAT m_fX = 0.0f,
  4  FLOAT m_fY = 0.0f,
  5  FLOAT m_fZ = 0.0f,
  6  FLOAT m_tmSingleWait = 0.4f,
  7  RANGE m_fFirePower "Firing Range" 'F' = 40.0f,
	8  INDEX m_ctGroupSize "Number of Projectiles" 'N' = 2,
  9  enum  EnemyTypeRange m_etrTypeRange "Enemy Type Range" 'R' = ETR_NONE,
	10 INDEX m_ctInGroup = 0,
  11 INDEX m_ctTotal "Total Enemy Count" 'C' = 10,
  12 INDEX m_iType = 0,
  13 FLOAT m_fEnemyMaxAdjuster "Enemy Max Adjuster" 'M' = 1.0f,
  14 FLOAT m_tmWait = 0.2f,
  16 BOOL  m_bUseBosses = FALSE,
  17 enum  EnemyType2 m_etType "Enemy Type" 'E' = ET_BONEMAN, 
  18 FLOAT m_tmDelay = 2.0f,
  20 RANGE m_fProjectileSize = 8.0f,
  21 CEntityPointer m_penSpawnMarker,
  22 BOOL  m_bSelfTriggered "* Create Touch Field *" 'C' = FALSE,
  23 INDEX m_ctCoordCount = 0,
  24 CTString strCoords = "",
  25 CEntityPointer m_penTemplate,
  26 CEntityPointer m_penPatrol  "Patrol Target" 'P' COLOR(C_lGREEN|0xFF),
  27 BOOL m_bGetTemplates = FALSE,
  28 BOOL m_bActive = TRUE,
  29 CTString m_strDescription = "",
  30 INDEX m_iEventCount = 0,
  31 INDEX m_iSendCount = 0,
  32 INDEX m_ctPerSpawnerTotal = 0,
  33 enum EventEType m_eetEvent "Death Target Event Type" = EET_TRIGGER,


  50 CEntityPointer m_penBMan,
  51 CEntityPointer m_penHManB,
  52 CEntityPointer m_penHManF,
  53 CEntityPointer m_penHManK,
  54 CEntityPointer m_penEManSE,
  55 CEntityPointer m_penEManSO,
  56 CEntityPointer m_penWBull,
  57 CEntityPointer m_penWalkerSE,
  58 CEntityPointer m_penWalkerSO,
  59 CEntityPointer m_penBeastB,
  60 CEntityPointer m_penBeastN,
  61 CEntityPointer m_penElemL,
  62 CEntityPointer m_penElemB,
  63 CEntityPointer m_penElemS,
  64 CEntityPointer m_penSManG,
  65 CEntityPointer m_penSManS,
  66 CEntityPointer m_penGizmo,
  67 CEntityPointer m_penFish,
  68 CEntityPointer m_penHarpy,
	69 CEntityPointer m_penDemon,
	70 CEntityPointer m_penChainFreak,
	71 CEntityPointer m_penGruntS,
	72 CEntityPointer m_penGruntC,
	73 CEntityPointer m_penGuffy,
  74 CEntityPointer m_penHManR,

	80 BOOL  m_bUseCustomRange "Use A Custom Range (If so set below)" = FALSE,
	81 BOOL  m_bUseBMan "Use Boneman" = FALSE,
	82 BOOL  m_bUseHManR "Use Headman Rocketman" = FALSE,
	83 BOOL  m_bUseHManB "Use Headman Bomberman" = FALSE,
	84 BOOL  m_bUseHManF "Use Headman Firecracker" = FALSE,
	85 BOOL  m_bUseHManK "Use Headman Kamikazi" = FALSE,
	86 BOOL  m_bUseEManSE "Use Eyeman Sergeant" = FALSE,
	87 BOOL  m_bUseEManSO "Use Eyeman Soldier" = FALSE,
	88 BOOL  m_bUseWBull "Use Werebull" = FALSE,
	89 BOOL  m_bUseWalkerSE "Use Walker Sergeant" = FALSE,
	90 BOOL  m_bUseWalkerSO "Use Walker Soldier" = FALSE,
	91 BOOL  m_bUseBeastH "Use Beast Normal" = FALSE,
	92 BOOL  m_bUseBeastB "Use Beast Big" = FALSE,
	93 BOOL  m_bUseBeastN "Use Beast Huge" = FALSE,
	94 BOOL  m_bUseElemL "Use Elemental Large" = FALSE,
	95 BOOL  m_bUseElemB "Use Elemental Big" = FALSE,
	96 BOOL  m_bUseElemS "Use Elemental Small" = FALSE,
	97 BOOL  m_bUseSManG "Use Scorpman General" = FALSE,
	98 BOOL  m_bUseSManS "Use Scorpman Soldier" = FALSE,
	99 BOOL  m_bUseGizmo "Use Gizmo" = FALSE,
	100 BOOL  m_bUseFish "Use Fish" = FALSE,
	101 BOOL  m_bUseHarpy "Use Harpy" = FALSE,
	102 BOOL  m_bUseDemon "Use Demon" = FALSE,
	103 BOOL  m_bUseChainFreak "Use Chainsaw Freak" = FALSE,
	104 BOOL  m_bUseGruntS "Use Grunt Solier" = FALSE,
	105 BOOL  m_bUseGruntC "Use Grunt Commander" = FALSE,
	106 BOOL  m_bUseGuffy "Use Guffy" = FALSE,

components:

  1 model   MODEL_BALL								"Models\\PESpawnProjectile\\PESpawnProjectile.mdl",
  2 texture TEXTURE_BALL							"Models\\PESpawnProjectile\\PESpawnProjectile.tex",
  3 model   MODEL_BATTERY							"Models\\PESpawnBattery\\PESpawnBattery.mdl",
  4 texture TEXTURE_BATTERY						"Models\\PESpawnBattery\\PESpawnBattery.tex",
  5 class   CLASS_PESPAWNPROJECTILE2	"Classes\\PESpawnProjectile2.ecl",
  6 class   CLASS_BATTERYMARKER				"Classes\\BatteryMarker.ecl",

functions:

	// precache the spawner projectiles stuff and name ourself with our coords and if we have a self created touchfield name it too
  void Precache(void) {
    PrecacheModel(MODEL_BALL);
    PrecacheTexture(TEXTURE_BALL);
		CPESpawnBattery *pen = this;
    CPlacement3D pl;
		pl.pl_PositionVector = pen->GetPlacement().pl_PositionVector;
    strCoords.PrintF(TRANS("(%.0f, %.0f, %.0f)"), pl.pl_PositionVector(1), pl.pl_PositionVector(2), pl.pl_PositionVector(3));
    m_strName = "Spawner Battery - " + strCoords;
    if (m_penSpawnMarker!=NULL) {
      ((CBatteryMarker&)*m_penSpawnMarker).m_strName = "Spawner Battery - " + strCoords + "TField" ;
    }
  }

	// create a description of ourselves
  const CTString &GetDescription(void) const {
    ((CTString&)m_strDescription).PrintF("-><none>");
    if (m_penTarget!=NULL) {
      ((CTString&)m_strDescription).PrintF("->%s", m_penTarget->GetName());
    }
    if (m_etrTypeRange!=ETR_NONE) {
      ((CTString&)m_strDescription) = EnemyTypeRange_enum.NameForValue(INDEX(m_etrTypeRange))
        + m_strDescription;
    } else {
      ((CTString&)m_strDescription) = EnemyType2_enum.NameForValue(INDEX(m_etType))
        + m_strDescription;
    }
    return m_strDescription;
  }

  // Adjust model mip factor in SEd
  void AdjustMipFactor(FLOAT &fMipFactor)
  {
    fMipFactor = 0;
  }

	// fire a spawner projectile
  void FireProjectile(void) {
    FLOAT3D vHere = GetPlacement().pl_PositionVector;
    FLOAT fAng = FRnd()*360.0f;
    FLOAT fPower = m_fFirePower/2*FRnd()+1;
		CPlacement3D pl;
    CEntityPointer pen = NULL;
    pl = CPlacement3D(vHere+FLOAT3D(0, 0.5f, 0), ANGLE3D(0, 0, 0));
    pen = CreateEntity(pl, CLASS_PESPAWNPROJECTILE2);

    ((CPESpawnProjectile2&)*pen).m_ctTotal = m_ctPerSpawnerTotal;
    ((CPESpawnProjectile2&)*pen).m_tmSingleWait = m_tmSingleWait;
    ((CPESpawnProjectile2&)*pen).m_fEnemyMaxAdjuster = m_fEnemyMaxAdjuster;
    ((CPESpawnProjectile2&)*pen).m_bUseBosses = m_bUseBosses;
    ((CPESpawnProjectile2&)*pen).m_fProjectileSize = 8.0f;
    ((CPESpawnProjectile2&)*pen).m_penTemplate = m_penTemplate;
    ((CPESpawnProjectile2&)*pen).m_penTarget = this;
    ((CPESpawnProjectile2&)*pen).m_penPatrol = m_penPatrol;
    ((CPESpawnProjectile2&)*pen).Initialize();
		((CPESpawnProjectile2&)*pen).LaunchAsFreeProjectile(FLOAT3D(CosFast(fAng)*fPower, 
     m_fFirePower/3*FRnd()*2.0f+10.0f, SinFast(fAng)*fPower), this);
    ((CPESpawnProjectile2&)*pen).SetDesiredRotation(ANGLE3D(0, 0, 0));
  };

	// place a touch field where we are
  void PlaceModel(void) {
    if (m_penSpawnMarker!=NULL) {      
      CEntity *pen = m_penSpawnMarker;
      pen->Destroy();
      m_penSpawnMarker = NULL;
    }
    if (m_penSpawnMarker==NULL) {
      CPlacement3D plMarker;
      plMarker = CPlacement3D(GetPlacement().pl_PositionVector+FLOAT3D(0, 0, -5), ANGLE3D(0,0,0));
      m_penSpawnMarker = CreateEntity(plMarker, CLASS_BATTERYMARKER);
      ((CBatteryMarker&)*m_penSpawnMarker).m_penTarget = this;
      ((CBatteryMarker&)*m_penSpawnMarker).Initialize();
    }
  };

	// get all the templates we might possibly need
  void GetEnemyTemplates(void) {
    // for each entity in the world
	  FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
        if (penEnemy->m_bTemplate) {
				  if (penEnemy->m_strName=="*BMan Temp") {
            m_penBMan = penEnemy;
          }
				  if (penEnemy->m_strName=="*HManR Temp") {
            m_penHManR = penEnemy;
          }
				  if (penEnemy->m_strName=="*HManB Temp") {
            m_penHManB = penEnemy;
          }
				  if (penEnemy->m_strName=="*HManF Temp") {
            m_penHManF = penEnemy;
          }
				  if (penEnemy->m_strName=="*HManK Temp") {
            m_penHManK = penEnemy;
          }
				  if (penEnemy->m_strName=="*EManSE Temp") {
            m_penEManSE = penEnemy;
          }
				  if (penEnemy->m_strName=="*EManSO Temp") {
            m_penEManSO = penEnemy;
          }
				  if (penEnemy->m_strName=="*WBull Temp") {
            m_penWBull = penEnemy;
          }
				  if (penEnemy->m_strName=="*WalkerSE Temp") {
            m_penWalkerSE = penEnemy;
          }
				  if (penEnemy->m_strName=="*WalkerSO Temp") {
            m_penWalkerSO = penEnemy;
          }
				  if (penEnemy->m_strName=="*BeastN Temp") {
            m_penBeastN = penEnemy;
          }
				  if (penEnemy->m_strName=="*BeastB Temp") {
            m_penBeastB = penEnemy;
          }
				  if (penEnemy->m_strName=="*SManS Temp") {
            m_penSManS = penEnemy;
          }
				  if (penEnemy->m_strName=="*SManG Temp") {
            m_penSManG = penEnemy;
          }
				  if (penEnemy->m_strName=="*ElemL Temp") {
            m_penElemL = penEnemy;
          }
				  if (penEnemy->m_strName=="*ElemB Temp") {
            m_penElemB = penEnemy;
          }
				  if (penEnemy->m_strName=="*ElemS Temp") {
            m_penElemS = penEnemy;
          }
				  if (penEnemy->m_strName=="*Gizmo Temp") {
            m_penGizmo = penEnemy;
          }
				  if (penEnemy->m_strName=="*Fish Temp") {
            m_penFish = penEnemy;
          }
				  if (penEnemy->m_strName=="*Harpy Temp") {
            m_penHarpy = penEnemy;
          }
				  if (penEnemy->m_strName=="*Demon Temp") {
            m_penDemon = penEnemy;
          }
				  if (penEnemy->m_strName=="*Chainsaw Freak Temp") {
            m_penChainFreak = penEnemy;
          }
				  if (penEnemy->m_strName=="*Grunt Temp") {
            m_penGrunt = penEnemy;
          }
				  if (penEnemy->m_strName=="*Guffy Temp") {
            m_penGuffy = penEnemy;
          }
        }
      }
    }
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
    if( slPropertyOffset == offsetof(CPESpawnBattery, m_penPatrol)) {
      return (penTarget!=NULL && IsDerivedFromClass(penTarget, "Enemy Marker"));
    }    
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }

	// get a custom set of randomized templates
	void GetRandomTemplate1(void)
	{

		INDEX iRandomTotal = 0;
		if (m_bUseBMan) {
			iRandomTotal++;
		}
		if (m_bUseHManR) {
			iRandomTotal++;
		}
		if (m_bUseHManB) {
			iRandomTotal++;
		}
		if (m_bUseHManF) {
			iRandomTotal++;
		}
		if (m_bUseHManK) {
			iRandomTotal++;
		}
		if (m_bUseEManSE) {
			iRandomTotal++;
		}
		if (m_bUseEManSO) {
			iRandomTotal++;
		}
		if (m_bUseWBull) {
			iRandomTotal++;
		}
		if (m_bUseWalkerSE) {
			iRandomTotal++;
		}
		if (m_bUseWalkerSO) {
			iRandomTotal++;
		}
		if (m_bUseBeastH) {
			iRandomTotal++;
		}
		if (m_bUseBeastB) {
			iRandomTotal++;
		}
		if (m_bUseBeastN) {
			iRandomTotal++;
		}
		if (m_bUseElemL) {
			iRandomTotal++;
		}
		if (m_bUseElemB) {
			iRandomTotal++;
		}
		if (m_bUseElemS) {
			iRandomTotal++;
		}
		if (m_bUseSManG) {
			iRandomTotal++;
		}
		if (m_bUseSManS) {
			iRandomTotal++;
		}
		if (m_bUseGizmo) {
			iRandomTotal++;
		}
		if (m_bUseFish) {
			iRandomTotal++;
		}
		if (m_bUseHarpy) {
			iRandomTotal++;
		}
		if (m_bUseDemon) {
			iRandomTotal++;
		}
		if (m_bUseChainFreak) {
			iRandomTotal++;
		}
		if (m_bUseGruntS) {
			iRandomTotal++;
		}
		if (m_bUseGruntC) {
			iRandomTotal++;
		}
		if (m_bUseGuffy) {
			iRandomTotal++;
		}

    INDEX iRandom = IRnd()%iRandomTotal;

		CPrintF("iRandom = %d\n", iRandom);

		if (m_etrTypeRange==ETR_BMAN_HMAN) {
      m_iType = IRnd()%2;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_EMAN) {
      m_iType = IRnd()%3;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_WBULL) {
      m_iType = IRnd()%4;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else if (m_iType==2) {
        m_tmSingleWait = 0.3f;
        m_penTemplate = m_penWBull;
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_WALKER) {
      m_iType = IRnd()%5;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else if (m_iType==2) {
        m_tmSingleWait = 0.3f;
        m_penTemplate = m_penWBull;
      } else if (m_iType==3) {
			  if (iRandomSubClass<2) {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penWalkerSE;
			  } else {
          m_tmSingleWait = 0.3f;
				  m_penTemplate = m_penWalkerSO;
			  }
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_BEAST) {
      m_iType = IRnd()%6;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else if (m_iType==2) {
        m_tmSingleWait = 0.3f;
        m_penTemplate = m_penWBull;
      } else if (m_iType==3) {
			  if (iRandomSubClass<2) {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penWalkerSE;
			  } else {
          m_tmSingleWait = 0.3f;
				  m_penTemplate = m_penWalkerSO;
			  }
      } else if (m_iType==4) {
			  if (m_bUseBosses) {
          m_tmSingleWait = 0.7f;
				  m_penTemplate = m_penBeastB;
			  } else {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penBeastN;
			  }
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    }
	}

	// get a preset random range of templates
	void GetRandomTemplate2(void)
	{
    INDEX iRandomSubClass = IRnd()%4;

		CPrintF("iRandomSubClass = %d\n", iRandomSubClass);
    if (m_etrTypeRange==ETR_BMAN_HMAN) {
      m_iType = IRnd()%2;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_EMAN) {
      m_iType = IRnd()%3;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_WBULL) {
      m_iType = IRnd()%4;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else if (m_iType==2) {
        m_tmSingleWait = 0.3f;
        m_penTemplate = m_penWBull;
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_WALKER) {
      m_iType = IRnd()%5;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else if (m_iType==2) {
        m_tmSingleWait = 0.3f;
        m_penTemplate = m_penWBull;
      } else if (m_iType==3) {
			  if (iRandomSubClass<2) {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penWalkerSE;
			  } else {
          m_tmSingleWait = 0.3f;
				  m_penTemplate = m_penWalkerSO;
			  }
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    } else if (m_etrTypeRange==ETR_BMAN_BEAST) {
      m_iType = IRnd()%6;
      m_tmSingleWait = 0.2f;
      if (m_iType==0) {
        m_penTemplate = m_penBMan;
      } else if (m_iType==1) {
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else if (m_iType==2) {
        m_tmSingleWait = 0.3f;
        m_penTemplate = m_penWBull;
      } else if (m_iType==3) {
			  if (iRandomSubClass<2) {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penWalkerSE;
			  } else {
          m_tmSingleWait = 0.3f;
				  m_penTemplate = m_penWalkerSO;
			  }
      } else if (m_iType==4) {
			  if (m_bUseBosses) {
          m_tmSingleWait = 0.7f;
				  m_penTemplate = m_penBeastB;
			  } else {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penBeastN;
			  }
      } else {
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      }
    }
	}

	// get a single class template with random subclasses
	void GetRandomTemplate3(void)
	{
    INDEX iRandomSubClass = IRnd()%4;

		CPrintF("iRandomSubClass = %d\n", iRandomSubClass);
    if (m_etrTypeRange==ETR_NONE) {
      if (m_etType==ET_BONEMAN) {
        m_tmSingleWait = 0.2f;
        m_penTemplate = m_penBMan;
      } else if (m_etType==ET_EYEMAN) {
        m_tmSingleWait = 0.2f;
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penEManSE;
			  } else {
				  m_penTemplate = m_penEManSO;
			  }
      } else if (m_etType==ET_HEADMAN) {
        m_tmSingleWait = 0.2f;
			  if (iRandomSubClass==0) {
				  m_penTemplate = m_penHManK;
			  } else if (iRandomSubClass==1) {
				  m_penTemplate = m_penHManF;
			  } else if (iRandomSubClass==2) {
				  m_penTemplate = m_penHManR;
			  } else {
				  m_penTemplate = m_penHManB;
			  }
      } else if (m_etType==ET_WEREBULL) {
        m_tmSingleWait = 0.3f;
        m_penTemplate = m_penWBull;
      } else if (m_etType==ET_WALKER) {
			  if (iRandomSubClass<2) {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penWalkerSE;
			  } else {
          m_tmSingleWait = 0.3f;
				  m_penTemplate = m_penWalkerSO;
			  }
      } else if (m_etType==ET_BEAST) {
			  if (m_bUseBosses) {
          m_tmSingleWait = 0.7f;
				  m_penTemplate = m_penBeastB;
			  } else {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penBeastN;
			  }
      } else if (m_etType==ET_SCORPMAN) {
        m_tmSingleWait = 0.5f;
			  if (iRandomSubClass<2) {
				  m_penTemplate = m_penSManG;
			  } else {
				  m_penTemplate = m_penSManS;
			  }
      } else if (m_etType==ET_GIZMO) {
        m_tmSingleWait = 0.1f;
        m_penTemplate = m_penGizmo;
      } else if (m_etType==ET_FISH) {
        m_tmSingleWait = 0.2f;
        m_penTemplate = m_penFish;
      } else if (m_etType==ET_HARPY) {
        m_tmSingleWait = 0.2f;
        m_penTemplate = m_penHarpy;
      } else {
			  if (m_bUseBosses) {
          m_tmSingleWait = 0.5f;
				  m_penTemplate = m_penElemL;
			  } else if (iRandomSubClass<2) {
				  m_penTemplate = m_penElemB;
			  } else {
				  m_penTemplate = m_penElemS;
			  }
      }
    }
	}

  /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/
procedures:

  WaitForTrigger()
  {
    while (TRUE) {
      wait() {
        on (EBegin) : { resume; }
        on (ETrigger) : { stop; };
        otherwise() : { pass; }
      }

			// create a random delay? may help with randomizing....
			m_tmDelay = FRnd();

			autowait(m_tmDelay);

      jump FireProjectiles();

      // wait a bit to recover
      autowait(0.1f);
    }
  }

  FireProjectiles() 
  {

    wait() {
      on (EBegin) : { 
        m_ctTotal *= GetGameEnemyMultiplier();
        m_ctPerSpawnerTotal = Clamp(INDEX(m_ctTotal/m_ctGroupSize), INDEX(1), INDEX(1000));
        m_ctPerSpawnerTotal--;
        stop; }
      otherwise() : { pass; }
    }

    // repeat forever
    while(TRUE) {
      //CPrintF("Spawner Battery has Fired a Projectile\n");
			m_ctInGroup++;

      // if no more left
      if (m_ctInGroup>m_ctGroupSize) {
        //Destroy();
        m_bActive = FALSE;
        jump Inactive();
      }
      
			if (m_bUseCustomRange) {
				GetRandomTemplate1();
			} else if (m_etrTypeRange==ETR_NONE) {
				GetRandomTemplate2();
			} else {
				GetRandomTemplate3();
			}

			FireProjectile();

      // wait between two entities in group
      autowait(m_tmWait);

    }
  }

  Inactive() {
    ASSERT(!m_bActive);
    while (TRUE) {
      // wait 
      wait() {
        // if activated
        on (EActivate) : {
          // go to active state
          m_bActive = TRUE;
          jump WaitForTrigger();
        }
        on (EStopAttack) : {
          //CPrintF("Death Event Sent to Death Target\n");
          SendToTarget(m_penTarget, m_eetEvent, this);
          Destroy();
        }
        otherwise() : {
          resume;
        };
      };
      
      // wait a bit to recover
      autowait(0.1f);
    }
  }
  
  Main() {

    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
    SetModel(MODEL_BATTERY);
		SetModelMainTexture(TEXTURE_BATTERY);

		// if first template target is NULL, they all are, so get them
    if (m_penBMan==NULL) {
      GetEnemyTemplates();
    }

		// if we want to create a touchfield do so
    if (m_bSelfTriggered) {
      PlaceModel();
      m_bSelfTriggered = FALSE;
    }

    /*if (m_fProjectileSize>m_fFirePower/4) {
      m_fProjectileSize = m_fFirePower/4;
    }

    if (m_fProjectileSize<=1) {
      m_fProjectileSize = 1.0f;
      m_fProjectileSize = m_fFirePower/4;
    }*/

    // go into active or inactive state
    if (m_bActive) {
      jump WaitForTrigger();
    } else {
      jump Inactive();
    }

		Destroy();

    return;
  };
};
