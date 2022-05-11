1065
%{
#include "EntitiesMP/StdH/StdH.h"
%}

//uses "EntitiesMP/Box";
uses "EntitiesMP/ESBigHead";
uses "EntitiesMP/MusicChanger";

class CEndShow : CMovableModelEntity {
  name      "EndShow";
  thumbnail "";
  features  "HasName", "HasTarget", "IsTargetable";

properties:

  1 CTString m_strName = "EndShow",
  2 CEntityPointer m_penTarget,

  20 INDEX m_iEventCount = 0,
  21 INDEX m_iAnimation = 0,
  22 BOOL  m_bMoveRight = FALSE,
  23 BOOL  m_bMoveLeft = FALSE,
  24 INDEX m_iCount = 0,
  25 CSoundObject m_soEffect,
  26 BOOL  m_bStartMusic = TRUE,
  27 CEntityPointer m_penMusicChanger,
  28 BOOL  m_bPlayAnims = TRUE,
  29 INDEX m_ctSwellInterval = 0,
  30 FLOAT fSize = 2.0f,
  31 INDEX m_iSwellCount = 0,
  32 INDEX m_iDestroyCount = 0,
  33 FLOAT fX = -1000.0f,
  34 FLOAT fZ = -187.5f,
  35 INDEX m_iMentalCount = 0,

components:

  1 class   CLASS_ESBIGHEAD       "Classes\\ESBigHead.ecl",
  2 model   MODEL_BOX             "Models\\PESpawnProjectile\\Box.mdl",
  3 texture TEXTURE_BOX           "Models\\PESpawnProjectile\\Box.tex",
  4 class   CLASS_BOX             "Classes\\Box.ecl",
  5 class   CLASS_MUSIC_CHANGER   "Classes\\MusicChanger.ecl",
  6 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

functions:

  void CreateMental(INDEX iHeadTex) {
		CPlacement3D pl;
    CEntity *pen = NULL;

    // create mental
    pl = CPlacement3D(FLOAT3D(fX, 0.2f, fZ), ANGLE3D(270, 0, 0));
    pen = CreateEntity(pl, CLASS_ESBIGHEAD);
    CESBigHead *bh = ((CESBigHead*)pen);
		bh->m_iHeadTexture = iHeadTex;
    bh->Initialize();

    // move to next spot
    fZ -= 10.0f;
  }

  void SendAnimEvents(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "ESBigHead")) {
        CESBigHead *penBH = ((CESBigHead*)pen);
        if (m_iAnimation==1) {
          penBH->JumpAnim();
          penBH->SetTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
        } else if (m_iAnimation==2) {
          penBH->RunAnim();
          penBH->SetTranslation(FLOAT3D(1.0f, 0.0f, 0.0f));
        } else if (m_iAnimation==3) {
          penBH->JumpAnim();
          penBH->SetTranslation(FLOAT3D(0.0f, 1.0f, 0.0f));
        } else if (m_iAnimation==4) {
          penBH->RunAnim();
          penBH->SetRotation(182.0f);
        } else if (m_iAnimation==5) {
          penBH->ShakeHeadAnim();
          penBH->SetRotation(0.0f);
        } else if (m_iAnimation==6) {
          penBH->RunAnim();
          penBH->SetTranslation(FLOAT3D(0.0f, 0.0f, 1.0f));
        } else if (m_iAnimation==7) {
          penBH->JumpAnim();
          penBH->SetTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
        } else if (m_iAnimation==8) {
          penBH->RunAnim();
          penBH->SetRotation(-182.0f);
        } else if (m_iAnimation==9) {
          penBH->Odd1Anim();
          penBH->SetRotation(0.0f);
          m_iEventCount = 2;
        } else if (m_iAnimation==10) {
          penBH->RunAnim();
          penBH->SetTranslation(FLOAT3D(0.0f, 0.0f, 1.0f));
        } else if (m_iAnimation==11) {
          penBH->Odd2Anim();
          penBH->SetTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
          m_iEventCount = 2;
        } else if (m_iAnimation==12) {
          penBH->RunAnim();
          penBH->SetTranslation(FLOAT3D(0.0f, 0.0f, -1.0f));
        } else if (m_iAnimation==13) {
          penBH->ShakeHeadAnim();
          penBH->SetTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
        } 
      }
    }}
  }

  void StartGreetAnim(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "ESBigHead")) {
        CESBigHead *penBH = ((CESBigHead*)pen);
        penBH->GreetAnim();
      }
    }}
  }

  void SwellHeads(void) 
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "ESBigHead")) {
        CESBigHead *penBH = ((CESBigHead*)pen);
        // Swell or Shrink Head
        penBH->fSize = fSize;
        penBH->SwellHead();
      }
    }}
  }

  void DestroyMentals(void) 
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "ESBigHead")) {
        CESBigHead *penBH = ((CESBigHead*)pen);
        penBH->SendEvent(EDeath());
      }
    }}
  }

  void SendMusicStart(void)
  {
    // find music holder for this level
    CEntity *penMusicHolder = _pNetwork->GetEntityWithName("MusicHolder", 0);
    // if not existing
    if (penMusicHolder==NULL) {
      // error
      CPrintF("No MusicHolder on this level, cannot change music!\n");
    // if existing
    } else {
      // send event to change music
      EChangeMusic ecm;
      ecm.fnMusic = CTFILENAME("Ogg\\ChickenDance.ogg");
      ecm.fVolume = 2.0f;
      ecm.mtType  = MT_EVENT;
      ecm.bForceStart = TRUE;
      penMusicHolder->SendEvent(ecm);
    }
  }


 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/

procedures:

  Active()
  {
    // start the end show's music
    SendMusicStart();
    // start the mental's first animation
    StartGreetAnim();
    // repeat
    while(TRUE) {

      m_iCount++;

      if (m_iCount>10) {
        m_iEventCount++;
        if (m_iEventCount==4 && m_bPlayAnims) {
          m_iAnimation++;
          m_iEventCount = 0;
          SendAnimEvents();          
        }
      }

      if (m_iCount>60 && m_iSwellCount<1) {
        m_bPlayAnims = FALSE;
        if (fSize<3) {
          //CPrintF("Swell Heads for Explosion\n");
          fSize *= 1.05f;
          SwellHeads();
          m_iSwellCount = 0;
        } else {          
          m_iSwellCount = 1;
        }
      }

      if (m_iSwellCount==1) {
        DestroyMentals();          
        m_iSwellCount = 2;
      }

      //CPrintF("m_iAnimation: %d, m_iEventCount: %d\n", m_iAnimation, m_iEventCount);
      //CPrintF("m_iCount: %d, m_iSwellCount: %d\n", m_iCount, m_iSwellCount);
 
      // wait a bit
      autowait(0.5f);

      if (m_iSwellCount==2) {
        m_iDestroyCount++;
        if (m_iDestroyCount==11) {
          return EEnd();
        }
      }

    }
  }

  SpawnMentals()
  {
    // repeat
    while(TRUE) {

      if (m_iMentalCount>=10) {
        jump Active();
      }

      CreateMental(m_iMentalCount);
      m_iMentalCount++;

      autowait(0.1f);
    }
  }

  Main() {

    InitAsVoid();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    //main loop
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : {
        // go into active state
        jump SpawnMentals();
      }
      on (EEnd) : { stop; }
    }

    Destroy();

    return;
  };
};
