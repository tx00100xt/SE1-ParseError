5014
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/EnemyBase.h"
#include "EntitiesMP/EnemySpawner.h"
#include "EntitiesMP/Trigger.h"
#include "EntitiesMP/Beast.h"
#include "EntitiesMP/Boneman.h"
#include "EntitiesMP/Elemental.h"
#include "EntitiesMP/Eyeman.h"
#include "EntitiesMP/Headman.h"
#include "EntitiesMP/Scorpman.h"
#include "EntitiesMP/Walker.h"
#include "EntitiesMP/Werebull.h"
#include "EntitiesMP/Gizmo.h"
#include "EntitiesMP/Fish.h"
#include "EntitiesMP/Woman.h"
#include "EntitiesMP/Demon.h"
#include "EntitiesMP/ChainsawFreak.h"
#include "EntitiesMP/Grunt.h"
#include "EntitiesMP/Guffy.h"
%}

class CTemplateCreator: CRationalEntity {
name      "Template Creator";
thumbnail "Thumbnails\\TemplateCreator.tbn";
features  "HasName";

properties:

  1 CTString m_strName "Name" = "Template Creator",
  2 BOOL m_bCreateTemplates "Generate Templates" = FALSE,
	3 BOOL m_bIntialTCCheck = TRUE,

components:

  1 model   MODEL_MARKER				"Models\\Editor\\Axis.mdl",
  2 texture TEXTURE_MARKER			"Models\\Editor\\Vector.tex",

	10 class   CLASS_BEAST        "Classes\\Beast.ecl",
	11 class   CLASS_BONEMAN      "Classes\\Boneman.ecl",
	12 class   CLASS_ELEMENTAL    "Classes\\Elemental.ecl",
	13 class   CLASS_EYEMAN       "Classes\\Eyeman.ecl",
	16 class   CLASS_HEADMAN      "Classes\\Headman.ecl",
	17 class   CLASS_SCORPMAN     "Classes\\Scorpman.ecl",
	18 class   CLASS_WALKER       "Classes\\Walker.ecl",
	19 class   CLASS_WEREBULL     "Classes\\Werebull.ecl",
	20 class   CLASS_GIZMO        "Classes\\Gizmo.ecl",
	21 class   CLASS_FISH         "Classes\\Fish.ecl",
	22 class   CLASS_WOMAN        "Classes\\Woman.ecl",
	23 class   CLASS_DEMON        "Classes\\Demon.ecl",
	24 class   CLASS_CHAIN_FREAK  "Classes\\ChainsawFreak.ecl",
	25 class   CLASS_GRUNT        "Classes\\Grunt.ecl",
	26 class   CLASS_GUFFY        "Classes\\Guffy.ecl",

functions:

  void CheckForExistingTC(void) {
    // for each entity in the world
		{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			// there can be only one Template Creator
			if (IsOfClass(pen, "Template Creator")) {
				if (pen!=this) {
					CPrintF("Already Existing Template Creator, Destroying Old...\n");
					pen->Destroy();
				}
			}
		}}
	}

	// destroy all previously existing templates
  void DestroyExistingTemplates(void) {
    // for each entity in the world
		{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
        if (penEnemy->m_bTemplate) {
				  if (penEnemy->m_strName=="*BMan Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManR Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManB Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManF Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManK Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSE Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSO Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSEF Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSOF Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*WBull Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*WalkerSE Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*WalkerSO Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*BeastH Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*BeastB Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*BeastN Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*SManS Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*SManG Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ElemL Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ElemB Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ElemS Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Gizmo Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Fish Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Harpy Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HarpyW Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Demon Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ChFreak Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*GruntS Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*GruntC Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Guffy Temp") {
						penEnemy->Destroy();
          }
        }
      }
    }}
		{FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
        if (penEnemy->m_bTemplate) {
				  if (penEnemy->m_strName=="*BMan Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManR Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManB Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManF Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HManK Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSE Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSO Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSEF Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*EManSOF Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*WBull Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*WalkerSE Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*WalkerSO Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*BeastH Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*BeastB Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*BeastN Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*SManS Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*SManG Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ElemL Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ElemB Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ElemS Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Gizmo Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Fish Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Harpy Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*HarpyW Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Demon Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*ChFreak Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*GruntS Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*GruntC Temp") {
						penEnemy->Destroy();
          }
				  if (penEnemy->m_strName=="*Guffy Temp") {
						penEnemy->Destroy();
          }
        }
      }
    }}
  }

	void CreateTemplates(void)
	{
		//CPrintF("Creating Templates...\n");
		CPlacement3D pl;
		CEntity *pen;
		// boneman
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_BONEMAN);
		((CBoneman&)*pen).m_bTemplate = TRUE;
		((CBoneman&)*pen).m_strName = "*BMan Temp";
		((CBoneman&)*pen).Initialize();

		// headmen
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_HEADMAN);
		((CHeadman&)*pen).m_hdtType = HDT_BOMBERMAN;
		((CHeadman&)*pen).m_bTemplate = TRUE;
		((CHeadman&)*pen).m_strName = "*HManB Temp";
		((CHeadman&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_HEADMAN);
		((CHeadman&)*pen).m_hdtType = HDT_FIRECRACKER;
		((CHeadman&)*pen).m_bTemplate = TRUE;
		((CHeadman&)*pen).m_strName = "*HManF Temp";
		((CHeadman&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_HEADMAN);
		((CHeadman&)*pen).m_hdtType = HDT_KAMIKAZE;
		((CHeadman&)*pen).m_bTemplate = TRUE;
		((CHeadman&)*pen).m_strName = "*HManK Temp";
		((CHeadman&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_HEADMAN);
		((CHeadman&)*pen).m_hdtType = HDT_ROCKETMAN;
		((CHeadman&)*pen).m_bTemplate = TRUE;
		((CHeadman&)*pen).m_strName = "*HManR Temp";
		((CHeadman&)*pen).Initialize();

		// eyemen
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_EYEMAN);
		((CEyeman&)*pen).m_EeftType = EFT_GROUND_ONLY;
		((CEyeman&)*pen).m_EecChar = EYC_SERGEANT;
		((CEyeman&)*pen).m_bTemplate = TRUE;
		((CEyeman&)*pen).m_strName = "*EManSE Temp";
		((CEyeman&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_EYEMAN);
		((CEyeman&)*pen).m_EeftType = EFT_GROUND_ONLY;
		((CEyeman&)*pen).m_EecChar = EYC_SOLDIER;
		((CEyeman&)*pen).m_bTemplate = TRUE;
		((CEyeman&)*pen).m_strName = "*EManSO Temp";
		((CEyeman&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_EYEMAN);
		((CEyeman&)*pen).m_EeftType = EFT_FLY_AIR_AIR;
		((CEyeman&)*pen).m_EecChar = EYC_SERGEANT;
		((CEyeman&)*pen).m_bTemplate = TRUE;
		((CEyeman&)*pen).m_strName = "*EManSEF Temp";
		((CEyeman&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_EYEMAN);
		((CEyeman&)*pen).m_EeftType = EFT_FLY_AIR_AIR;
		((CEyeman&)*pen).m_EecChar = EYC_SOLDIER;
		((CEyeman&)*pen).m_bTemplate = TRUE;
		((CEyeman&)*pen).m_strName = "*EManSOF Temp";
		((CEyeman&)*pen).Initialize();

		// werebull
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_WEREBULL);
		((CWerebull&)*pen).m_bTemplate = TRUE;
		((CWerebull&)*pen).m_strName = "*WBull Temp";
		((CWerebull&)*pen).Initialize();

		// walkers
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_WALKER);
		((CWalker&)*pen).m_EwcChar = WLC_SERGEANT;
		((CWalker&)*pen).m_bTemplate = TRUE;
		((CWalker&)*pen).m_strName = "*WalkerSE Temp";
		((CWalker&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_WALKER);
		((CWalker&)*pen).m_EwcChar = WLC_SOLDIER;
		((CWalker&)*pen).m_bTemplate = TRUE;
		((CWalker&)*pen).m_strName = "*WalkerSO Temp";
		((CWalker&)*pen).Initialize();

		// beasts
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_BEAST);
		((CBeast&)*pen).m_bcType = BT_HUGE;
		((CBeast&)*pen).m_bTemplate = TRUE;
		((CBeast&)*pen).m_strName = "*BeastH Temp";
		((CBeast&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_BEAST);
		((CBeast&)*pen).m_bcType = BT_BIG;
		((CBeast&)*pen).m_bTemplate = TRUE;
		((CBeast&)*pen).m_strName = "*BeastB Temp";
		((CBeast&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_BEAST);
		((CBeast&)*pen).m_bcType = BT_NORMAL;
		((CBeast&)*pen).m_bTemplate = TRUE;
		((CBeast&)*pen).m_strName = "*BeastN Temp";
		((CBeast&)*pen).Initialize();

		// scorps
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_SCORPMAN);
		((CScorpman&)*pen).m_smtType = SMT_GENERAL;
		((CScorpman&)*pen).m_bTemplate = TRUE;
		((CScorpman&)*pen).m_strName = "*SManG Temp";
		((CScorpman&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_SCORPMAN);
		((CScorpman&)*pen).m_smtType = SMT_SOLDIER;
		((CScorpman&)*pen).m_bTemplate = TRUE;
		((CScorpman&)*pen).m_strName = "*SManS Temp";
		((CScorpman&)*pen).Initialize();

		// elementals
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_ELEMENTAL);
		((CElemental&)*pen).m_EecChar = ELC_LARGE;
		((CElemental&)*pen).m_bTemplate = TRUE;
		((CElemental&)*pen).m_strName = "*ElemL Temp";
		((CElemental&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_ELEMENTAL);
		((CElemental&)*pen).m_EecChar = ELC_BIG;
		((CElemental&)*pen).m_bTemplate = TRUE;
		((CElemental&)*pen).m_strName = "*ElemB Temp";
		((CElemental&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_ELEMENTAL);
		((CElemental&)*pen).m_EecChar = ELC_SMALL;
		((CElemental&)*pen).m_bTemplate = TRUE;
		((CElemental&)*pen).m_strName = "*ElemS Temp";
		((CElemental&)*pen).Initialize();

		// gizmo
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_GIZMO);
		((CGizmo&)*pen).m_bTemplate = TRUE;
		((CGizmo&)*pen).m_strName = "*Gizmo Temp";
		((CGizmo&)*pen).Initialize();

		// fish
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_FISH);
		((CFish&)*pen).m_bTemplate = TRUE;
		((CFish&)*pen).m_strName = "*Fish Temp";
		((CFish&)*pen).Initialize();

		// harpy
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_WOMAN);
		((CWoman&)*pen).m_bTemplate = TRUE;
		((CWoman&)*pen).m_strName = "*Harpy Temp";
		((CWoman&)*pen).Initialize();

		// harpy walk
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_WOMAN);
		((CWoman&)*pen).m_bTemplate = TRUE;
		((CWoman&)*pen).m_EeftType = EFT_GROUND_ONLY;
		((CWoman&)*pen).m_strName = "*HarpyW Temp";
		((CWoman&)*pen).Initialize();

		// demon
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_DEMON);
		((CDemon&)*pen).m_bTemplate = TRUE;
		((CDemon&)*pen).m_strName = "*Demon Temp";
		((CDemon&)*pen).Initialize();

		// chainsaw freak
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_CHAIN_FREAK);
		((CChainsawFreak&)*pen).m_bTemplate = TRUE;
		((CChainsawFreak&)*pen).m_strName = "*ChFreak Temp";
		((CChainsawFreak&)*pen).Initialize();

		// grunts
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_GRUNT);
		((CGrunt&)*pen).m_bTemplate = TRUE;
		((CGrunt&)*pen).m_gtType = GT_SOLDIER;
		((CGrunt&)*pen).m_strName = "*GruntS Temp";
		((CGrunt&)*pen).Initialize();

		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_GRUNT);
		((CGrunt&)*pen).m_bTemplate = TRUE;
		((CGrunt&)*pen).m_gtType = GT_COMMANDER;
		((CGrunt&)*pen).m_strName = "*GruntC Temp";
		((CGrunt&)*pen).Initialize();

		// guffy
		pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
		pen = CreateEntity(pl, CLASS_GUFFY);
		((CGuffy&)*pen).m_bTemplate = TRUE;
		((CGuffy&)*pen).m_strName = "*Guffy Temp";
		((CGuffy&)*pen).Initialize();
	}

procedures:

  Main()
  {
		//CPrintF("TeplateCreator Main()\n");
		// There can be only ONE Template Creator!!!
		if (m_bIntialTCCheck) {
			CheckForExistingTC();
			m_bIntialTCCheck = FALSE;
		}
		
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    if (m_bCreateTemplates) {
			DestroyExistingTemplates();
			CreateTemplates();
      m_bCreateTemplates = FALSE;
    }

    // never start ai in wed
    autowait(_pTimer->TickQuantum);

    return;
  }
};
