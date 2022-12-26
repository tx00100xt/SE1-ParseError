5016
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/Demon.h"
#include "EntitiesMP/ChainsawFreak.h"
#include "EntitiesMP/Grunt.h"
#include "EntitiesMP/Guffy.h"
%}

class CTemplateCreatorEG: CRationalEntity {
name  "TemplateCreatorEG";
thumbnail "";

properties:

	1 BOOL m_bCreateAll = TRUE,
	2 BOOL m_bCreateDemon = FALSE,
	3 BOOL m_bCreateChFreak = FALSE,
	4 BOOL m_bCreateGruntS = FALSE,
	5 BOOL m_bCreateGruntC = FALSE,
	6 BOOL m_bCreateGuffy = FALSE,

components:

	1 class   CLASS_DEMON        "Classes\\Demon.ecl",
	2 class   CLASS_CHAIN_FREAK  "Classes\\ChainsawFreak.ecl",
	3 class   CLASS_GRUNT        "Classes\\Grunt.ecl",
	4 class   CLASS_GUFFY        "Classes\\Guffy.ecl",

functions:

	void CreateTemplates(void)
	{
		//CPrintF("Creating Templates...\n");
		CPlacement3D pl;
		CEntity *pen;

		// demon
		if (m_bCreateDemon) {
			pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
			pen = CreateEntity(pl, CLASS_DEMON);
			((CDemon&)*pen).m_bTemplate = TRUE;
			((CDemon&)*pen).m_strName = "*Demon Temp";
			((CDemon&)*pen).Initialize();
		}
		// chainsaw freak
		if (m_bCreateChFreak) {
			pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
			pen = CreateEntity(pl, CLASS_CHAIN_FREAK);
			((CChainsawFreak&)*pen).m_bTemplate = TRUE;
			((CChainsawFreak&)*pen).m_strName = "*ChFreak Temp";
			((CChainsawFreak&)*pen).Initialize();
		}
		// grunts
		if (m_bCreateGruntS) {
			pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
			pen = CreateEntity(pl, CLASS_GRUNT);
			((CGrunt&)*pen).m_bTemplate = TRUE;
			((CGrunt&)*pen).m_gtType = GT_SOLDIER;
			((CGrunt&)*pen).m_strName = "*GruntS Temp";
			((CGrunt&)*pen).Initialize();
		}
		if (m_bCreateGruntC) {
			pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
			pen = CreateEntity(pl, CLASS_GRUNT);
			((CGrunt&)*pen).m_bTemplate = TRUE;
			((CGrunt&)*pen).m_gtType = GT_COMMANDER;
			((CGrunt&)*pen).m_strName = "*GruntC Temp";
			((CGrunt&)*pen).Initialize();
		}
		// guffy
		if (m_bCreateGuffy) {
			pl = CPlacement3D(FLOAT3D(1E6f+FRnd()*300.0f, 0, 0), ANGLE3D(0, 0, 0));
			pen = CreateEntity(pl, CLASS_GUFFY);
			((CGuffy&)*pen).m_bTemplate = TRUE;
			((CGuffy&)*pen).m_strName = "*Guffy Temp";
			((CGuffy&)*pen).Initialize();
		}
	}

procedures:

  Main(EVoid)
  {
    // init as nothing
    InitAsVoid();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

		if (m_bCreateAll) {
			m_bCreateDemon = TRUE;
			m_bCreateGruntS = TRUE;
			m_bCreateGruntC = TRUE;
			m_bCreateChFreak = TRUE;
			m_bCreateGuffy = TRUE;
		}

		CreateTemplates();

		autowait(10.0f);	

		Destroy();

    return;
  }
};
