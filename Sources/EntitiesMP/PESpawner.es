5003
%{
#include "EntitiesMP/StdH/StdH.h"
#include <Engine/CurrentVersion.h>
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/OverLord";
uses "EntitiesMP/BatteryMarker";
uses "EntitiesMP/BasicEffects";

enum EventSendType {
	0 EST_ALL_ENEMIES		"Send on all enemies killed",
	1 EST_SPAWNER_END		"Send on spawner end",
	2 EST_NONE					"None",
};

class export CPESpawner : CRationalEntity {
  name      "PESpawner";
	thumbnail "Thumbnails\\EnemySpawner.tbn";
	features  "HasName", "HasTarget", "IsTargetable";

properties:

	// editor

  1  BOOL  m_bSelfTriggered "- Create Touch Field -" 'C' = FALSE,

  10 CEntityPointer m_penTarget  "> EV - Event Target" COLOR(C_BLUE|0xFF),
  11 enum  EventEType m_eetEvent "> EV - Event Type" = EET_TRIGGER,
	12 enum  EventSendType m_estEvent "> EV - Event Send Type" = EST_SPAWNER_END,

  20 RANGE m_fFirePower "-> Firing Range" 'F' = 40.0f,
  21 INDEX m_ctTotal "-> Total Enemy Count (Before Enemy X)" 'T' = 10,
  22 FLOAT m_fEnemyMaxAdjuster "-> Enemy Max Adjuster" 'M' = 1.0f,
  23 CEntityPointer m_penPatrol  "-> Patrol Target" 'P' COLOR(C_lGREEN|0xFF),
	24 BOOL  m_bReduce "-> Reduce Enemy X by 1/2" = FALSE,
	25 BOOL  m_bReduceMore "-> Reduce Enemy X by 2/3" = FALSE,
	26 BOOL  m_bIgnoreX "-> Ignore Enemy X" = FALSE,
  27 BOOL  m_bLimitFiringRange "-> Fire Only Up" 'U' = FALSE,
  28 BOOL  m_bFireForwardOnly "-> Fire Only Forward" 'F' = FALSE,
	29 BOOL  m_bUseSingleType "-> Use Single Random Type" 'S' = FALSE,
  30 BOOL  m_bActive "-> Active" 'A' = TRUE,
	31 BOOL  m_bWaitForReTrigger "-> Re-Triggerable?" = FALSE,
	32 BOOL  m_bUseAllTypes = FALSE,

	50 BOOL  m_bSetAllCustomUseToFalse "00 - Clear All Uses -" = FALSE,
	51 BOOL  m_bUseBMan "01 Use Boneman" = FALSE,
	52 BOOL  m_bUseHManR "02 Use Headman Rocketman" = FALSE,
	53 BOOL  m_bUseHManB "03 Use Headman Bomberman" = FALSE,
	54 BOOL  m_bUseHManF "04 Use Headman Firecracker" = FALSE,
	55 BOOL  m_bUseHManK "05 Use Headman Kamikazi" = FALSE,
	56 BOOL  m_bUseEManSE "06 Use Eyeman Sergeant" = FALSE,
	57 BOOL  m_bUseEManSO "07 Use Eyeman Soldier" = FALSE,
	58 BOOL  m_bUseEManSEF "08 Use Eyeman Sergeant Fly" = FALSE,
	59 BOOL  m_bUseEManSOF "09 Use Eyeman Soldier Fly" = FALSE,
	60 BOOL  m_bUseWBull "10 Use Werebull" = FALSE,
	61 BOOL  m_bUseWalkerSE "11 Use Walker Sergeant" = FALSE,
	62 BOOL  m_bUseWalkerSO "12 Use Walker Soldier" = FALSE,
	63 BOOL  m_bUseBeastH "13 Use Beast Huge" = FALSE,
	64 BOOL  m_bUseBeastB "14 Use Beast Big" = FALSE,
	65 BOOL  m_bUseBeastN "15 Use Beast Normal" = FALSE,
	66 BOOL  m_bUseElemL "16 Use Elemental Large" = FALSE,
	67 BOOL  m_bUseElemB "17 Use Elemental Big" = FALSE,
	68 BOOL  m_bUseElemS "18 Use Elemental Small" = FALSE,
	69 BOOL  m_bUseSManS "19 Use Scorpman Soldier" = FALSE,
	70 BOOL  m_bUseSManG "20 Use Scorpman General" = FALSE,
	71 BOOL  m_bUseGizmo "21 Use Gizmo" = FALSE,
	72 BOOL  m_bUseFish "22 Use Fish" = FALSE,
	73 BOOL  m_bUseHarpyW "23 Use Harpy Fly" = FALSE,
	74 BOOL  m_bUseHarpy "24 Use Harpy Walk" = FALSE,
	75 BOOL  m_bUseDemon "25 Use Demon" = FALSE,
	76 BOOL  m_bUseChFreak "26 Use Chainsaw Freak" = FALSE,
	77 BOOL  m_bUseGruntS "27 Use Grunt Soldier" = FALSE,
	78 BOOL  m_bUseGruntC "28 Use Grunt Commander" = FALSE,
	79 BOOL  m_bUseGuffy "29 Use Guffy" = FALSE,

	// internal 
  90  CTString m_strName = "- PE Spawner - ",
  91  FLOAT m_fX = 0.0f,
  92  FLOAT m_fY = 0.0f,
  93  FLOAT m_fZ = 0.0f,
  94  FLOAT m_tmSingleWait = 0.1f,
	95  INDEX m_ctInGroup = 0,
  97  CEntityPointer m_penSpawnMarker,
  98  CTString strCoords = "",
  99  CEntityPointer m_penTemplate,
  100 CTString m_strDescription = "",
  101 INDEX m_iEventCount = 0,
	102 INDEX m_iRandomTotal = 0,
	103 INDEX m_iRandomChosen = 0,
  107 FLOAT m_tmWait = 1.0f,
  108 INDEX m_ctEnemyMax = 0,
	109 INDEX m_ctEnemiesSpawned = 0,
	110 FLOAT m_fEntitySize = 1.0f,

  160 CEntityPointer m_penBMan,
  161 CEntityPointer m_penHManR,
  162 CEntityPointer m_penHManB,
  163 CEntityPointer m_penHManF,
  164 CEntityPointer m_penHManK,
  165 CEntityPointer m_penEManSE,
  166 CEntityPointer m_penEManSO,
  167 CEntityPointer m_penWBull,
  168 CEntityPointer m_penWalkerSE,
  169 CEntityPointer m_penWalkerSO,
  170 CEntityPointer m_penBeastH,
  171 CEntityPointer m_penBeastB,
  172 CEntityPointer m_penBeastN,
  173 CEntityPointer m_penElemL,
  174 CEntityPointer m_penElemB,
  175 CEntityPointer m_penElemS,
  176 CEntityPointer m_penSManG,
  177 CEntityPointer m_penSManS,
  178 CEntityPointer m_penGizmo,
  179 CEntityPointer m_penFish,
  180 CEntityPointer m_penHarpy,
	181 CEntityPointer m_penDemon,
	182 CEntityPointer m_penChFreak,
	183 CEntityPointer m_penGruntS,
	184 CEntityPointer m_penGruntC,
	185 CEntityPointer m_penGuffy,
  186 CEntityPointer m_penEManSEF,
  187 CEntityPointer m_penEManSOF,
	188 CEntityPointer m_penHarpyW,

components:

  1 model   MODEL_SPAWNER							"Models\\Editor\\EnemySpawner.mdl",
  2 texture TEXTURE_SPAWNER						"Models\\Editor\\EnemySpawner.tex",
	3 class   CLASS_BATTERYMARKER				"Classes\\BatteryMarker.ecl",
	4 class   CLASS_BASIC_EFFECT				"Classes\\BasicEffect.ecl",

functions:

	// precache the spawner projectiles stuff and name ourself with our coords and if we have a self created touchfield name it too
  void Precache(void) {
    CPlacement3D pl;
		pl.pl_PositionVector = this->GetPlacement().pl_PositionVector;
    strCoords.PrintF(TRANS("(%.0f, %.0f, %.0f)"), pl.pl_PositionVector(1), pl.pl_PositionVector(2), pl.pl_PositionVector(3));
    m_strName = "- PE Spawner - " + strCoords;
    if (m_penSpawnMarker!=NULL) {
      ((CBatteryMarker&)*m_penSpawnMarker).m_strName = "- TField - PE Spawner - " + strCoords;
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
					if (penEnemy->m_strName=="*EManSEF Temp")		{ m_penEManSEF = penEnemy;	}
					if (penEnemy->m_strName=="*EManSOF Temp")		{ m_penEManSOF = penEnemy;	}
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
					if (penEnemy->m_strName=="*HarpyW Temp")		{ m_penHarpyW = penEnemy;		}
					if (penEnemy->m_strName=="*Demon Temp")			{ m_penDemon = penEnemy;		}
					if (penEnemy->m_strName=="*ChFreak Temp")		{ m_penChFreak = penEnemy;	}
					if (penEnemy->m_strName=="*GruntS Temp")		{ m_penGruntS = penEnemy;		}
					if (penEnemy->m_strName=="*GruntC Temp")		{ m_penGruntC = penEnemy;		}
					if (penEnemy->m_strName=="*Guffy Temp")			{ m_penGuffy = penEnemy;		}
        }
      }
    }}
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
		m_bUseEManSEF = FALSE;
		m_bUseEManSOF = FALSE;
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
		m_bUseHarpyW = FALSE;
		m_bUseDemon = FALSE;
		m_bUseChFreak = FALSE;
		m_bUseGruntS = FALSE;
		m_bUseGruntC = FALSE;
		m_bUseGuffy = FALSE;
	}

	void SetCustomUsesToTrue(void)
	{
		m_bUseBMan= TRUE;
		m_bUseHManR = TRUE;
		m_bUseHManB = TRUE;
		m_bUseHManF = TRUE;
		m_bUseHManK = TRUE;
		m_bUseEManSE = TRUE;
		m_bUseEManSO = TRUE;
		m_bUseEManSEF = TRUE;
		m_bUseEManSOF = TRUE;
		m_bUseWBull = TRUE;
		//m_bUseWalkerSE = TRUE;
		m_bUseWalkerSO = TRUE;
		//m_bUseBeastH = TRUE;
		m_bUseBeastN = TRUE;
		//m_bUseBeastB = TRUE;
		//m_bUseElemL = TRUE;
		//m_bUseElemB = TRUE;
		m_bUseElemS = TRUE;
		//m_bUseSManS = TRUE;
		//m_bUseSManG = TRUE;
		m_bUseGizmo = TRUE;
		//m_bUseFish = TRUE;
		m_bUseHarpy = TRUE;
		m_bUseHarpyW = TRUE;
		//m_bUseDemon = TRUE;
		m_bUseChFreak = TRUE;
		m_bUseGruntS = TRUE;
		m_bUseGruntC = TRUE;
		m_bUseGuffy = TRUE;
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
		if (m_bUseEManSEF)	{ m_iRandomTotal++; }
		if (m_bUseEManSOF)	{ m_iRandomTotal++; }
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
		if (m_bUseHarpyW)		{ m_iRandomTotal++; }
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
		if (m_bUseEManSEF) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penEManSEF;
				return;
			}
		}
		if (m_bUseEManSOF) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penEManSOF;
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
				m_penTemplate = m_penGizmo;
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
		if (m_bUseHarpyW) {
			iRandomTemp++;
			if (m_iRandomChosen==iRandomTemp) {
				m_penTemplate = m_penHarpyW;
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
    if (m_penTemplate!=NULL) {
			CEntity *pen = m_penTemplate;
			CEnemyBase *peb = ((CEnemyBase*)pen);
			FLOATaabbox3D box;
			peb->GetBoundingBox(box);
			m_fEntitySize = box.Size().MaxNorm()/2;
		}
	}

  // spawn new entity PE style
  void SpawnEntity(void) 
  {
    if (m_penTemplate!=NULL) {
      // copy entity into world
      CEntity *pen = NULL;
		  CPlacement3D pl;
      if (m_bFireForwardOnly) {
				pl = GetPlacement();
				pl.pl_OrientationAngle(1) += FRnd()*20.0f-10.0f;
      } else {
        pl = GetPlacement();
      }
      pen = GetWorld()->CopyEntityInWorld( *m_penTemplate, pl);

      // change needed properties
      pen->End();
      CEnemyBase *peb = ((CEnemyBase*)pen);
      peb->m_bTemplate = FALSE;
      peb->m_bHasBeenSpawned = TRUE;
		  peb->m_tmSpawned = _pTimer->CurrentTick();
      peb->m_penSpawnerBattery = this;
      peb->m_fFallHeight = -1;
      if (m_penPatrol!=NULL) {
        peb->m_penMarker = m_penPatrol;
      }
      pen->Initialize();

      // fire it........
      FLOAT fA = FRnd()*360.0f;
      CMovableEntity *penCritter = (CMovableEntity*)(CEnemyBase*)pen;
      if (m_bLimitFiringRange && !m_bFireForwardOnly) {
        ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(0, 1.0f*m_fFirePower, 0), penCritter);
      } else if (m_bFireForwardOnly) {
        FLOAT fPower = (FRnd()*0.5f+0.5f)*m_fFirePower;
        ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(0, FRnd()*10.0f, -fPower), penCritter);
      } else {
          FLOAT fPowerUp = FRnd()*0.25f+0.5f*m_fFirePower;
          FLOAT fPowerOut = FRnd()*0.5f+0.5f*m_fFirePower;
        ((CEnemyBase&)*penCritter).LaunchAsFreeProjectile(FLOAT3D(CosFast(fA)*fPowerOut, fPowerUp, SinFast(fA)*fPowerOut), penCritter);
      }
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
		pl.pl_PositionVector(1) += CosFast(fA)*1.0f;
		pl.pl_PositionVector(3) += SinFast(fA)*1.0f;
    ese.vStretch = FLOAT3D(m_fEntitySize, m_fEntitySize, m_fEntitySize);
    CEntityPointer penEffect = CreateEntity(pl, CLASS_BASIC_EFFECT);
    penEffect->Initialize(ese);
	}

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CPESpawner) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/
procedures:

  WaitForTrigger()
  {
		if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("PESpawner WaitForTrigger()\n"); }

		// wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      otherwise() : { pass; }
    }

		m_bActive = TRUE;
		m_ctEnemiesSpawned = 0;
		m_iEventCount = 0;

    jump FireCritters();

		return;
  }

  FireCritters() 
  {
		if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("PESpawner FireCritters()\n"); }

    // repeat forever
    while(TRUE) {

      // if no more left
      if (m_ctEnemiesSpawned>=m_ctTotal) {
				if (m_estEvent==EST_SPAWNER_END) {
					if (m_penTarget!=NULL) {
						if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Death Event Sent to Death Target on PESpawner End\n"); }
						SendToTarget(m_penTarget, m_eetEvent, this);
					}
				}
				if (m_bWaitForReTrigger) {
					jump WaitForTrigger();
				} else {
					Destroy();
				}
      }

      if (CountEnemies()) {
				// get our template(s)
				if (m_bUseSingleType) {
					if (m_ctEnemiesSpawned==0) {
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
				SpawnEffect();
		    m_ctInGroup++;
        m_ctEnemiesSpawned++;
		    SpawnEntity();
      }

			// wait between two entities in group
			wait(m_tmWait) {
				on (EBegin) : { resume; }
				on (EStopAttack) : {
					if (m_estEvent==EST_ALL_ENEMIES) {
						m_iEventCount++;
						if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Event %d Received by PESpawner from Enemy Base while FireCritters()\n", m_iEventCount); }
					}
					resume;
				}
				on (ETimer) : { stop; }
				otherwise() : { pass; }
			}
		}
  }

  Inactive() {
		if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("PESpawner Inactive()\n"); }
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
					if (m_estEvent==EST_ALL_ENEMIES) {
						m_iEventCount++;
						if (GetSP()->sp_bTestSpawnerBatteries) { CPrintF("Event %d Received by Spawner Battery from Enemy Base while Inactive()\n", m_iEventCount); }
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

		//CPrintF("PESpawner Main()\n");
		InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
    SetModel(MODEL_SPAWNER);
		SetModelMainTexture(TEXTURE_SPAWNER);
    // stretch model
    GetModelObject()->StretchModel(FLOAT3D(2.5f, 2.5f, 2.5f));
    ModelChangeNotify();

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

		if (m_bUseAllTypes) {
			SetCustomUsesToTrue();
		}

		//GetEnemyTemplates();

		INDEX iExtra = GetGameEnemyMultiplier();
		m_ctEnemyMax = GetSP()->sp_iEnemyMax;
    m_ctEnemyMax = Clamp(INDEX(m_ctEnemyMax*m_fEnemyMaxAdjuster), INDEX(1), INDEX(300));

		if (!m_bIgnoreX) {
			if (m_bReduce && !m_bReduceMore) {
				m_ctTotal *= Clamp(INDEX(iExtra/2), INDEX(1), INDEX(1000));
			} else if (m_bReduceMore) {
				m_ctTotal *= Clamp(INDEX(iExtra/3), INDEX(1), INDEX(1000));
			} else {
				m_ctTotal *= iExtra;
			}
		}

		// get the total for m_iRandomTotal 
		GetCustomRangeTotal();

    // go into active or inactive state
    if (m_bActive) {
      jump WaitForTrigger();
    } else {
      jump Inactive();
    }

    return;
  };
};
