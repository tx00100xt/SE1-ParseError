1703
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/Fireworks.h"
#include "EntitiesMP/DoorController.h"
%}

class export CFireworksDisplay : CRationalEntity {
name      "Fireworks Display";
thumbnail "";
features  "HasName", "HasTarget", "IsTargetable";

properties:

  1 CTString m_strName = "Fireworks Display",
  2 CEntityPointer m_penTarget,
  3 FLOAT m_tmTimeStarted = 0.0f,     
	4 FLOAT m_tmWait = 0.2f,  // wait time
	5 FLOAT3D m_vWindDirection = FLOAT3D(0,0,0),

components:

	1 class  CLASS_FIREWORKS       "Classes\\Fireworks.ecl",

functions:

	void DisplayFireworks(void)
	{
		//CPrintF("DisplayFireWorks(void)\n");
		//CPrintF("Run Time: %.0f\n", _pTimer->CurrentTick()-m_tmTimeStarted);
    CEntity *pen = NULL;
		CPlacement3D pl;
		pl = CPlacement3D(FLOAT3D(-128, 120, 1961+FRnd()*175), ANGLE3D(0, 0, 0));
    pen = GetWorld()->CopyEntityInWorld( *m_penTarget, pl);
    CFireworks *penFW = ((CFireworks*)pen);	

		if (_pTimer->CurrentTick()<m_tmTimeStarted+5) {
			m_tmWait = 0.4f;
			penFW->m_colColor = 0xDD3B6D00;
			penFW->m_iFireworkType = 0;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+10) {
			m_tmWait = 0.5f;
			penFW->m_colColor = 0xD58A3900;
			penFW->m_iFireworkType = 2;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+15) {
			m_tmWait = 0.5f;
			penFW->m_colColor = 0xE0290A00;
			penFW->m_iFireworkType = 1;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+20) {
			m_tmWait = 0.5f;
			penFW->m_colColor = 0xFFF8FF00;
			penFW->m_iFireworkType = 3;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+25) {
			m_tmWait = 0.4f;
			penFW->m_colColor = 0xB1000100;
			penFW->m_iFireworkType = 4;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+37) {
			m_tmWait = 0.5f;
			penFW->m_colColor = 0xB8040500;
			penFW->m_iFireworkType = 7;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+40) {
			m_tmWait = 0.5f;
			penFW->m_colColor = 0x86659400;
			penFW->m_iFireworkType = 5;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+45) {
			m_tmWait = 0.7f;
			penFW->m_colColor = 0x86659400;
			penFW->m_iFireworkType = 6;
			penFW->m_bMultiColored = FALSE;

		/*} else if (_pTimer->CurrentTick()<m_tmTimeStarted+50) {
			m_tmWait = 0.4f;
			penFW->m_iFireworkType = IRnd()%2;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+60) {
			m_tmWait = 0.4f;
			penFW->m_iFireworkType = IRnd()%2+2;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+70) {
			m_tmWait = 0.4f;
			penFW->m_iFireworkType = IRnd()%2+3;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+80) {
			m_tmWait = 0.4f;
			penFW->m_iFireworkType = IRnd()%2+4;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+90) {
			m_tmWait = 0.4f;
			penFW->m_iFireworkType = IRnd()%2+5;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+100) {
			m_tmWait = 0.4f;
			penFW->m_iFireworkType = IRnd()%2+6;
			penFW->m_bMultiColored = TRUE;

		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+105) {
			m_tmWait = 0.5f;
			penFW->m_colColor = RGBToColor(IRnd()%255, IRnd()%255, IRnd()%255);
			penFW->m_iFireworkType = IRnd()%3;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+110) {
			m_tmWait = 0.5f;
			penFW->m_colColor = RGBToColor(IRnd()%255, IRnd()%255, IRnd()%255);
			penFW->m_iFireworkType = IRnd()%3+2;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+115) {
			m_tmWait = 0.5f;
			penFW->m_colColor = RGBToColor(IRnd()%255, IRnd()%255, IRnd()%255);
			penFW->m_iFireworkType = IRnd()%3+3;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+120) {
			m_tmWait = 0.5f;
			penFW->m_colColor = RGBToColor(IRnd()%255, IRnd()%255, IRnd()%255);
			penFW->m_iFireworkType = IRnd()%3+4;
			penFW->m_bMultiColored = FALSE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+125) {
			m_tmWait = 0.5f;
			penFW->m_colColor = RGBToColor(IRnd()%255, IRnd()%255, IRnd()%255);
			penFW->m_iFireworkType = IRnd()%3+5;
			penFW->m_bMultiColored = FALSE;

		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+130) {
			m_tmWait = 0.5f;
			penFW->m_iFireworkType = IRnd()%4;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+140) {
			m_tmWait = 0.5f;
			penFW->m_iFireworkType = IRnd()%4+2;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+150) {
			m_tmWait = 0.5f;
			penFW->m_iFireworkType = IRnd()%4+3;
			penFW->m_bMultiColored = TRUE;
		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+160) {
			m_tmWait = 0.5f;
			penFW->m_iFireworkType = IRnd()%4+4;
			penFW->m_bMultiColored = TRUE;

		} else if (_pTimer->CurrentTick()<m_tmTimeStarted+190) {
			m_tmWait = 0.4f;
			penFW->m_iFireworkType = IRnd()%4+3;
			penFW->m_bMultiColored = TRUE;*/
		} else {
			m_tmWait = 0.25f;
			FLOAT iRnd  = IRnd()%8;
			if (iRnd==5) { iRnd = 7; }
			penFW->m_iFireworkType = iRnd;
			penFW->m_bMultiColored = TRUE;
		}
		penFW->m_vWindDirection = m_vWindDirection;
    penFW->Initialize();

		/*if (_pTimer->CurrentTick()>m_tmTimeStarted+60) {
			m_tmWait = 60;
		}*/
	}

  void SendFWDisplayEndEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsOfClass(pen, "DoorController")) {
				CDoorController *penDoorController = (CDoorController *)pen;
				if (penDoorController->m_strName=="DC_LastDoor") {
					penDoorController->SendEvent(EActivate());
				}
			}
    }}
  }

	void TeleportPlayers(void)
	{
		INDEX ctPlayers = 0;
		INDEX iCounter = 0;
		FLOAT fPlacement = 2048.0f;
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Player")) {
				ctPlayers++;
				pen->Teleport(CPlacement3D(FLOAT3D(156, 21, fPlacement), ANGLE3D(90, 0, 0)), FALSE);
				if (iCounter==1) {
					fPlacement = fPlacement + (ctPlayers-1)*2.0f;
				}
				if (iCounter==2) {
					fPlacement = fPlacement - (ctPlayers-1)*2.0f;
					iCounter = 0;
				}
				iCounter++;
			}
		}}
	}

procedures:

  Main(EVoid) {
    
    // init as nothing
    InitAsVoid();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

		// create the fireworks class so we can copy it instead of creating them on the fly
    CEntity *pen = NULL;
		CPlacement3D pl;
		pl = CPlacement3D(FLOAT3D(30000, -30000, 30000), ANGLE3D(0, 0, 0));
    m_penTarget = CreateEntity(pl, CLASS_FIREWORKS);

		// wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      otherwise() : { pass; }
    }

		autowait(3.0f);

		TeleportPlayers();

		autowait(2.0f);

		m_tmTimeStarted = _pTimer->CurrentTick();
		m_vWindDirection = FLOAT3D(0,0,-10+FRnd()*5);

		while (_pTimer->CurrentTick()<m_tmTimeStarted+60) {
			autowait(m_tmWait);
			/*if (_pTimer->CurrentTick()>m_tmTimeStarted+70) {
				m_tmTimeStarted = _pTimer->CurrentTick();
			}*/
			DisplayFireworks();
		}

		autowait(1.0f);

		// activate the last doors door controller
		SendFWDisplayEndEvent();

		autowait(1.0f);

    // cease to exist
    Destroy();

    return;
  };
};
