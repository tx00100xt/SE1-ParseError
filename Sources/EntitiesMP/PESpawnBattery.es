5011
%{
#include "EntitiesMP/StdH/StdH.h"
#include <Engine/CurrentVersion.h>
%}

uses "EntitiesMP/PESpawnProjectile2";
uses "EntitiesMP/Player";
uses "EntitiesMP/BatteryMarker";

enum EventSendType1 {
	0 EST1_ALL_ENEMIES		"Send on all enemies killed",
	1 EST1_SPAWNER_END		"Send on spawner end",
	2 EST1_NONE					"None",
};

class CPESpawnBattery : CMovableModelEntity {
  name      "PESpawnBattery";
  thumbnail "Thumbnails\\SpawnerBattery.tbn";
  features  "HasName", "HasTarget", "IsTargetable";

properties:

  1  CEntityPointer m_penTarget  "> EV - Event Target" COLOR(C_BLUE|0xFF),
  2  CTString m_strName = "- PE Spawn Battery - ",
  3  FLOAT m_fX = 0.0f,
  4  FLOAT m_fY = 0.0f,
  5  FLOAT m_fZ = 0.0f,
  6  FLOAT m_tmSingleWait = 0.2f,
  7  RANGE m_fFirePower "-> Firing Range" 'F' = 40.0f,
	8  INDEX m_ctGroupSize "-> Number of Projectiles" 'N' = 2,
	10 INDEX m_ctInGroup = 0,
  11 INDEX m_ctTotal "-> Total Enemy Count (Before Enemy X)" 'T' = 10,
  12 FLOAT m_fEnemyMaxAdjuster "-> Enemy Max Adjuster" 'M' = 1.0f,
  13 FLOAT m_tmDelay = 2.0f,
  14 RANGE m_fProjectileSize = 8.0f,
  15 CEntityPointer m_penSpawnMarker,
  16 BOOL  m_bSelfTriggered "- Create Touch Field -" 'C' = FALSE,
  17 CTString strCoords = "",
  18 CEntityPointer m_penTemplate,
  19 CEntityPointer m_penPatrol  "-> Patrol Target" 'P' COLOR(C_lGREEN|0xFF),
  20 BOOL m_bActive "-> Active" 'A' = TRUE,
  21 CTString m_strDescription = "",
  22 INDEX m_iEventCount = 0,
  23 INDEX m_ctPerSpawnerTotal = 0,
  24 enum EventEType m_eetEvent "> EV - Event Target Event Type" = EET_TRIGGER,
	25 INDEX m_iRandomTotal = 0,
	26 INDEX m_iRandomChosen = 0,
	//27 BOOL  m_bSendEventOnAllProjectilesEnd "> EV - Send Event on All Projectiles End" = FALSE,
	//28 BOOL  m_bSendEventOnAllEnemiesKilled "> EV - Send Event on All Enemies Killed" = FALSE,
	29 BOOL  m_bSetAllCustomUseToFalse "00 - Clear All Uses -" = FALSE,
	30 BOOL  m_bWaitForReTrigger "-> Re-Triggerable?" = FALSE,
	//31 BOOL  m_bSendEventOnAllProjectilesEndOld = FALSE,
	//32 BOOL  m_bSendEventOnAllEnemiesKilledOld = FALSE,
	//33 BOOL  m_bWaitForReTriggerOld = FALSE,
	//34 ANGLE3D m_aDirectionR "-> Max Fire Right" 'R' = ANGLE3D(315,5,0),
	//35 ANGLE3D m_aDirectionL "-> Max Fire Left" 'L' = ANGLE3D(45,5,0),
	36 BOOL  m_bUseSingleType "-> Use Single Random Type" 'S' = FALSE,
	37 enum  EventSendType1 m_estEvent "> EV - Event Send Type" = EST1_SPAWNER_END,

  40 CEntityPointer m_penBMan,
  41 CEntityPointer m_penHManR,
  42 CEntityPointer m_penHManB,
  43 CEntityPointer m_penHManF,
  44 CEntityPointer m_penHManK,
  45 CEntityPointer m_penEManSE,
  46 CEntityPointer m_penEManSO,
  47 CEntityPointer m_penWBull,
  48 CEntityPointer m_penWalkerSE,
  49 CEntityPointer m_penWalkerSO,
  50 CEntityPointer m_penBeastH,
  51 CEntityPointer m_penBeastB,
  52 CEntityPointer m_penBeastN,
  53 CEntityPointer m_penElemL,
  54 CEntityPointer m_penElemB,
  55 CEntityPointer m_penElemS,
  56 CEntityPointer m_penSManG,
  57 CEntityPointer m_penSManS,
  58 CEntityPointer m_penGizmo,
  59 CEntityPointer m_penFish,
  60 CEntityPointer m_penHarpy,
	61 CEntityPointer m_penDemon,
	62 CEntityPointer m_penChFreak,
	63 CEntityPointer m_penGruntS,
	64 CEntityPointer m_penGruntC,
	65 CEntityPointer m_penGuffy,

	70 BOOL  m_bUseBMan "01 Use Boneman" = FALSE,
	71 BOOL  m_bUseHManR "02 Use Headman Rocketman" = FALSE,
	72 BOOL  m_bUseHManB "03 Use Headman Bomberman" = FALSE,
	73 BOOL  m_bUseHManF "04 Use Headman Firecracker" = FALSE,
	74 BOOL  m_bUseHManK "05 Use Headman Kamikazi" = FALSE,
	75 BOOL  m_bUseEManSE "06 Use Eyeman Sergeant" = FALSE,
	76 BOOL  m_bUseEManSO "07 Use Eyeman Soldier" = FALSE,
	77 BOOL  m_bUseWBull "08 Use Werebull" = FALSE,
	78 BOOL  m_bUseWalkerSE "09 Use Walker Sergeant" = FALSE,
	79 BOOL  m_bUseWalkerSO "10 Use Walker Soldier" = FALSE,
	80 BOOL  m_bUseBeastH "11 Use Beast Huge" = FALSE,
	81 BOOL  m_bUseBeastB "12 Use Beast Big" = FALSE,
	82 BOOL  m_bUseBeastN "13 Use Beast Normal" = FALSE,
	83 BOOL  m_bUseElemL "14 Use Elemental Large" = FALSE,
	84 BOOL  m_bUseElemB "15 Use Elemental Big" = FALSE,
	85 BOOL  m_bUseElemS "16 Use Elemental Small" = FALSE,
	86 BOOL  m_bUseSManS "17 Use Scorpman Soldier" = FALSE,
	87 BOOL  m_bUseSManG "18 Use Scorpman General" = FALSE,
	88 BOOL  m_bUseGizmo "19 Use Gizmo" = FALSE,
	89 BOOL  m_bUseFish "20 Use Fish" = FALSE,
	90 BOOL  m_bUseHarpy "21 Use Harpy" = FALSE,
	91 BOOL  m_bUseDemon "22 Use Demon" = FALSE,
	92 BOOL  m_bUseChFreak "23 Use Chainsaw Freak" = FALSE,
	93 BOOL  m_bUseGruntS "24 Use Grunt Soldier" = FALSE,
	94 BOOL  m_bUseGruntC "25 Use Grunt Commander" = FALSE,
	95 BOOL  m_bUseGuffy "26 Use Guffy" = FALSE,

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
    m_strName = "- PE Spawn Battery - " + strCoords;
    if (m_penSpawnMarker!=NULL) {
      ((CBatteryMarker&)*m_penSpawnMarker).m_strName = "- TField - PE Spawn Battery - " + strCoords;
    }
  }

	// create a description of ourselves
  const CTString &GetDescription(void) const {
    ((CTString&)m_strDescription).PrintF("-><none>");
    if (m_penTarget!=NULL) {
      ((CTString&)m_strDescription).PrintF("->%s", m_penTarget->GetName());
    }
		CTString strRange = "";
		if (m_bUseBMan)			{ strRange += "BMan "; }
		if (m_bUseHManR)		{ strRange += "HManR "; }
		if (m_bUseHManB)		{ strRange += "HManB "; }
		if (m_bUseHManF)		{ strRange += "HManF "; }
		if (m_bUseHManK)		{ strRange += "HManK "; }
		if (m_bUseEManSE)		{ strRange += "EManSE "; }
		if (m_bUseEManSO)		{ strRange += "EManSO "; }
		if (m_bUseWBull)		{ strRange += "WBull "; }
		if (m_bUseWalkerSE) { strRange += "WalkerSE "; }
		if (m_bUseWalkerSO)	{ strRange += "WalkerSO "; }
		if (m_bUseBeastH)		{ strRange += "BeastH "; }
		if (m_bUseBeastB)		{ strRange += "BeastB "; }
		if (m_bUseBeastN)		{ strRange += "BeastN "; }
		if (m_bUseElemL)		{ strRange += "ElemL "; }
		if (m_bUseElemB)		{ strRange += "ElemB "; }
		if (m_bUseElemS)		{ strRange += "ElemS "; }
		if (m_bUseSManG)		{ strRange += "SManG "; }
		if (m_bUseSManS)		{ strRange += "SManS "; }
		if (m_bUseGizmo)		{ strRange += "Gizmo "; }
		if (m_bUseFish)			{ strRange += "Fish "; }
		if (m_bUseHarpy)		{ strRange += "Harpy "; }
		if (m_bUseDemon)		{ strRange += "Demon "; }
		if (m_bUseChFreak)	{ strRange += "ChFreak "; }
		if (m_bUseGruntS)		{ strRange += "GruntS "; }
		if (m_bUseGruntC)		{ strRange += "GruntC "; }
		if (m_bUseGuffy)		{ strRange += "Guffy "; }
		((CTString&)m_strDescription) = strRange + m_strDescription;
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
    FLOAT fPower = (FRnd()+1.0f)*m_fFirePower*0.2f;
		CPlacement3D pl;
    CEntityPointer pen = NULL;
    pl = CPlacement3D(vHere+FLOAT3D(0, 2.0f, 0), ANGLE3D(0, 0, 0));
    pen = CreateEntity(pl, CLASS_PESPAWNPROJECTILE2);

    ((CPESpawnProjectile2&)*pen).m_ctTotal = m_ctPerSpawnerTotal;
    ((CPESpawnProjectile2&)*pen).m_tmSingleWait = m_tmSingleWait;
    ((CPESpawnProjectile2&)*pen).m_fEnemyMaxAdjuster = m_fEnemyMaxAdjuster;
    ((CPESpawnProjectile2&)*pen).m_fProjectileSize = 8.0f;
    ((CPESpawnProjectile2&)*pen).m_penTemplate = m_penTemplate;
    ((CPESpawnProjectile2&)*pen).m_penTarget = this;
    ((CPESpawnProjectile2&)*pen).m_penPatrol = m_penPatrol;
		if (m_estEvent==EST1_SPAWNER_END) {
			((CPESpawnProjectile2&)*pen).m_iEventType = 1;
		} else if (m_estEvent==EST1_ALL_ENEMIES) {
			((CPESpawnProjectile2&)*pen).m_iEventType = 2;
		}  else {
			((CPESpawnProjectile2&)*pen).m_iEventType = 0;
		}
    ((CPESpawnProjectile2&)*pen).Initialize();
		((CPESpawnProjectile2&)*pen).LaunchAsFreeProjectile(FLOAT3D(CosFast(fAng)*fPower, 
     (FRnd()+1.0f)*m_fFirePower*0.3f, SinFast(fAng)*fPower), this);
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
		{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
        if (penEnemy->m_bTemplate) {
					if (penEnemy->m_strName=="*BMan Temp")			{ m_penBMan = penEnemy;			}
					if (penEnemy->m_strName=="*HManR Temp")			{ m_penHManR = penEnemy;		}
					if (penEnemy->m_strName=="*HManB Temp")			{ m_penHManB = penEnemy;		}
					if (penEnemy->m_strName=="*HManF Temp")			{ m_penHManF = penEnemy;		}
					if (penEnemy->m_strName=="*HManK Temp")			{ m_penHManK = penEnemy;		}
					if (penEnemy->m_strName=="*EManSE Temp")		{ m_penEManSE = penEnemy;		}
					if (penEnemy->m_strName=="*EManSO Temp")		{ m_penEManSO = penEnemy;		}
					if (penEnemy->m_strName=="*WBull Temp")			{ m_penWBull = penEnemy;		}
					if (penEnemy->m_strName=="*WalkerSE Temp")	{ m_penWalkerSE = penEnemy; }
					if (penEnemy->m_strName=="*WalkerSO Temp")	{ m_penWalkerSO = penEnemy; }
					if (penEnemy->m_strName=="*BeastH Temp")		{ m_penBeastH = penEnemy;		}
					if (penEnemy->m_strName=="*BeastB Temp")		{ m_penBeastB = penEnemy;		}
					if (penEnemy->m_strName=="*BeastN Temp")		{ m_penBeastN = penEnemy;		}
					if (penEnemy->m_strName=="*SManS Temp")			{ m_penSManS = penEnemy;		}
					if (penEnemy->m_strName=="*SManG Temp")			{ m_penSManG = penEnemy;		}
					if (penEnemy->m_strName=="*ElemL Temp")			{ m_penElemL = penEnemy;		}
					if (penEnemy->m_strName=="*ElemB Temp")			{ m_penElemB = penEnemy;		}
					if (penEnemy->m_strName=="*ElemS Temp")			{ m_penElemS = penEnemy;		}
					if (penEnemy->m_strName=="*Gizmo Temp")			{ m_penGizmo = penEnemy;		}
					if (penEnemy->m_strName=="*Fish Temp")			{ m_penFish = penEnemy;			}
					if (penEnemy->m_strName=="*Harpy Temp")			{ m_penHarpy = penEnemy;		}
					if (penEnemy->m_strName=="*Demon Temp")			{ m_penDemon = penEnemy;		}
					if (penEnemy->m_strName=="*ChFreak Temp")		{ m_penChFreak = penEnemy;	}
					if (penEnemy->m_strName=="*GruntS Temp")		{ m_penGruntS = penEnemy;		}
					if (penEnemy->m_strName=="*GruntC Temp")		{ m_penGruntC = penEnemy;		}
					if (penEnemy->m_strName=="*Guffy Temp")			{ m_penGuffy = penEnemy;		}
        }
      }
    }}
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
    if( slPropertyOffset == offsetof(CPESpawnBattery, m_penPatrol)) {
      return (penTarget!=NULL && IsDerivedFromClass(penTarget, "Enemy Marker"));
    }    
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }

	void SetCustomUsesToFalse(void)
	{
		m_bUseBMan= FALSE;
		m_bUseHManR = FALSE;
		m_bUseHManB = FALSE;
		m_bUseHManF = FALSE;
		m_bUseHManK = FALSE;
		m_bUseEManSE = FALSE;
		m_bUseEManSO = FALSE;
		m_bUseWBull = FALSE;
		m_bUseWalkerSE = FALSE;
		m_bUseWalkerSO = FALSE;
		m_bUseBeastH = FALSE;
		m_bUseBeastN = FALSE;
		m_bUseBeastB = FALSE;
		m_bUseElemL = FALSE;
		m_bUseElemB = FALSE;
		m_bUseElemS = FALSE;
		m_bUseSManS = FALSE;
		m_bUseSManG = FALSE;
		m_bUseGizmo = FALSE;
		m_bUseFish = FALSE;
		m_bUseHarpy = FALSE;
		m_bUseDemon = FALSE;
		m_bUseChFreak = FALSE;
		m_bUseGruntS = FALSE;
		m_bUseGruntC = FALSE;
		m_bUseGuffy = FALSE;
	}

	void GetCustomRangeTotal(void)
	{
		m_iRandomTotal = 0;

		if (m_bUseBMan)			{ m_iRandomTotal++; }
		if (m_bUseHManR)		{ m_iRandomTotal++; }
		if (m_bUseHManB)		{ m_iRandomTotal++; }
		if (m_bUseHManF)		{ m_iRandomTotal++; }
		if (m_bUseHManK)		{ m_iRandomTotal++; }
		if (m_bUseEManSE)		{ m_iRandomTotal++; }
		if (m_bUseEManSO)		{ m_iRandomTotal++; }
		if (m_bUseWBull)		{ m_iRandomTotal++; }
		if (m_bUseWalkerSE) { m_iRandomTotal++; }
		if (m_bUseWalkerSO)	{ m_iRandomTotal++; }
		if (m_bUseBeastH)		{ m_iRandomTotal++; }
		if (m_bUseBeastB)		{ m_iRandomTotal++; }
		if (m_bUseBeastN)		{ m_iRandomTotal++; }
		if (m_bUseElemL)		{ m_iRandomTotal++; }
		if (m_bUseElemB)		{ m_iRandomTotal++; }
		if (m_bUseElemS)		{ m_iRandomTotal++; }
		if (m_bUseSManG)		{ m_iRandomTotal++; }
		if (m_bUseSManS)		{ m_iRandomTotal++; }
		if (m_bUseGizmo)		{ m_iRandomTotal++; }
		if (m_bUseFish)			{ m_iRandomTotal++; }
		if (m_bUseHarpy)		{ m_iRandomTotal++; }
		if (m_bUseDemon)		{ m_iRandomTotal++; }
		if (m_bUseChFreak)	{ m_iRandomTotal++; }
		if (m_bUseGruntS)		{ m_iRandomTotal++; }
		if (m_bUseGruntC)		{ m_iRandomTotal++; }
		if (m_bUseGuffy)		{ m_iRandomTotal++; }

		// make sure we never, ever, divide by zero
		if (m_iRandomTotal<=0) {
			m_iRandomTotal = 1;
		}
		if (m_iRandomTotal==1) {
			m_bUseSingleType = TRUE;
		}
		if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("m_iRandomTotal = %d\n", m_iRandomTotal); }
	}

	void GetRandomTemplate(void)
	{
		m_iRandomChosen = IRnd()%m_iRandomTotal;
		if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("m_iRandomChosen = %d\n", m_iRandomChosen); }
		INDEX iRandomTemp = -1;

		if (m_bUseBMan) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penBMan;
				return;
			}
		}
		if (m_bUseHManR) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penHManR;
				return;
			}
		}
		if (m_bUseHManB) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penHManB;
				return;
			}
		}
		if (m_bUseHManF) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penHManF;
				return;
			}
		}
		if (m_bUseHManK) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penHManK;
				return;
			}
		}
		if (m_bUseEManSE) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penEManSE;
				return;
			}
		}
		if (m_bUseEManSO) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penEManSO;
				return;
			}
		}
		if (m_bUseWBull) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penWBull;
				return;
			}
		}
		if (m_bUseWalkerSE) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penWalkerSE;
				return;
			}
		}
		if (m_bUseWalkerSO) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penWalkerSO;
				return;
			}
		}
		if (m_bUseBeastH) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penBeastH;
				return;
			}
		}
		if (m_bUseBeastB) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penBeastB;
				return;
			}
		}
		if (m_bUseBeastN) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penBeastN;
				return;
			}
		}
		if (m_bUseElemL) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penElemL;
				return;
			}
		}
		if (m_bUseElemB) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penElemB;
				return;
			}
		}
		if (m_bUseElemS) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penElemS;
				return;
			}
		}
		if (m_bUseSManG) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penSManG;
				return;
			}
		}
		if (m_bUseSManS) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penSManS;
				return;
			}
		}
		if (m_bUseGizmo) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penFish;
				return;
			}
		}
		if (m_bUseFish) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penFish;
				return;
			}
		}
		if (m_bUseHarpy) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penHarpy;
				return;
			}
		}
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

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CPESpawnBattery) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

  /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/
procedures:

  WaitForTrigger()
  {
		// wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      otherwise() : { pass; }
    }

		m_bActive = TRUE;
		m_ctInGroup = 0;
		m_iEventCount = 0;

    jump FireProjectiles();

		return;
  }

  FireProjectiles() 
  {
    // repeat forever
    while(TRUE) {;

      // if no more left
      if (m_ctInGroup>=m_ctGroupSize) {
        m_bActive = FALSE;				
        jump Inactive();
      }

			// get our template(s)
			if (m_bUseSingleType) {
				if (m_ctInGroup==0) {
					GetRandomTemplate();
				}
			} else {
				GetRandomTemplate();
			}

			if (m_penTemplate==NULL) {
				CPrintF("ERROR:  No 'Uses' Selected ... NO TEMPLATE!!!\n");
				if (m_penTarget!=NULL) {
					SendToTarget(m_penTarget, m_eetEvent, this);
					if (m_bWaitForReTrigger) {
						m_bActive = TRUE;
						jump WaitForTrigger();
					} else {
						Destroy();
					}
				}
			}

			m_ctInGroup++;
			// fire a spawner projectile
			FireProjectile();

			if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Fire Projectile: %d\n", m_ctInGroup); }
      // wait between two entities in group
			m_tmDelay = FRnd()*0.2f;
			// wait between two entities in group
			wait(m_tmDelay) {
				on (EBegin) : { resume; }
				on (EStopAttack) : {
					if (m_estEvent==EST1_SPAWNER_END) {
						if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Event Received by Spawner Battery from SpawnerProjectile2 during firing\n"); }
						m_iEventCount++;
					} else if (m_estEvent==EST1_ALL_ENEMIES) {
						if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Event Received by Spawner Battery from Enemy Base during firing\n"); }
						m_iEventCount++;
					}
					resume;
				}
				on (ETimer) : { stop; }
				otherwise() : { pass; }
			} 
		}
  }

  Inactive() {

		if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Inactive()\n"); }

		while (TRUE) {
      // wait 
      wait() {
        // if activated
        on (EActivate) : {
          // go to active state
          m_bActive = TRUE;
          jump WaitForTrigger();
					resume;
        }
        on (EStopAttack) : {
					if (m_estEvent==EST1_SPAWNER_END) {
						if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Event Received by Spawner Battery from SpawnerProjectile2 while Inactive()\n"); }
						m_iEventCount++;
						if (m_iEventCount>=m_ctGroupSize && m_penTarget!=NULL) {
							if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Death Event Sent to Death Target on All Projectiles End\n"); }
							SendToTarget(m_penTarget, m_eetEvent, this);
							if (m_bWaitForReTrigger) {
								m_bActive = TRUE;
								jump WaitForTrigger();
							} else {
								Destroy();
							}
						}
					} else if (m_estEvent==EST1_ALL_ENEMIES) {
						if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Event Received by Spawner Battery from Enemy Base while Inactive()\n"); }
						m_iEventCount++;
						if (m_iEventCount>=m_ctTotal && m_penTarget!=NULL) {
							if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Death Event Sent to Death Target on All Enemies Killed\n"); }
							SendToTarget(m_penTarget, m_eetEvent, this);
							if (m_bWaitForReTrigger) {
								m_bActive = TRUE;
								jump WaitForTrigger();
							} else {
								Destroy();
							}
						}
					} else {
						if (m_bWaitForReTrigger) {
							m_bActive = TRUE;
							jump WaitForTrigger();
						} else {
							Destroy();
						}
					}
					resume;
        }
        otherwise() : {
          resume;
        };
      };
      
      // wait a bit to recover
      autowait(0.1f);
    }
  }
  
  Main(EVoid) {

		if (GetSP()->sp_bTestSpawnerBatteries) {
			InitAsModel();
		} else {
			InitAsEditorModel();
		}
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
    SetModel(MODEL_BATTERY);
		SetModelMainTexture(TEXTURE_BATTERY);

		// if first template target is NULL, they all are, so get them
    GetEnemyTemplates();

		// reset all uses to FALSE
		if (m_bSetAllCustomUseToFalse) {
			SetCustomUsesToFalse();
			m_bSetAllCustomUseToFalse = FALSE;
		}

		// if we want to create a touchfield do so
    if (m_bSelfTriggered) {
      PlaceModel();
      m_bSelfTriggered = FALSE;
    }

    // never start ai in wed
    autowait(_pTimer->TickQuantum);

		GetEnemyTemplates();

		// get the total for m_iRandomTotal 
		GetCustomRangeTotal();

    m_ctTotal *= GetGameEnemyMultiplier();
    m_ctPerSpawnerTotal = Clamp(INDEX(m_ctTotal/m_ctGroupSize), INDEX(1), INDEX(1000));
    m_ctPerSpawnerTotal--;

    // go into active or inactive state
    if (m_bActive) {
      jump WaitForTrigger();
    } else {
      jump Inactive();
    }

    return;
  };
};
