3407
%{
#include "EntitiesMP/StdH/StdH.h"
#include "ModelsMP/Enemies/Mental/Mental.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Debris";


class CESBigHead: CMovableModelEntity {
name      "ESBigHead";
thumbnail "Thumbnails\\Mental.tbn";

properties:

  1 BOOL m_bEndShow = FALSE,
  2 FLOAT fSize = 2.0f,

  7 BOOL  m_bRenderParticles = FALSE,
	8 INDEX m_iHeadTexture = 0,
	9 FLOAT m_tmSpiritStart = 0.0f,  // time when spirit effect has started
	10 BOOL m_bFadeOut = FALSE,
	11 FLOAT m_fFadeStartTime = 0.0f,
	12 FLOAT m_fFadeTime = 0.0f,


components:

  1 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
  2 class   CLASS_DEBRIS          "Classes\\Debris.ecl",

 // ************** DATA **************
 10 model   MODEL_MENTAL          "ModelsMP\\Enemies\\Mental\\Mental.mdl",
 11 texture TEXTURE_MENTAL        "ModelsMP\\Enemies\\Mental\\Mental.tex",
 12 model   MODEL_HEAD            "ModelsMP\\Enemies\\Mental\\Head.mdl",
 13 model   MODEL_AURA            "ModelsMP\\Enemies\\Mental\\Aura.mdl",
 14 texture TEXTURE_AURA          "ModelsMP\\Enemies\\Mental\\Aura.tex",

 20 texture TEXTURE_HEAD          "ModelsMP\\Enemies\\Mental\\HeadAdmir.tex",
 21 texture TEXTURE_HEAD1         "Models\\Enemies\\Mental\\HeadAlen.tex",
 22 texture TEXTURE_HEAD2         "Models\\Enemies\\Mental\\HeadDavor.tex",
 23 texture TEXTURE_HEAD3         "Models\\Enemies\\Mental\\HeadDean.tex",
 24 texture TEXTURE_HEAD4         "Models\\Enemies\\Mental\\HeadDinko.tex",
 25 texture TEXTURE_HEAD5         "Models\\Enemies\\Mental\\HeadDamjan.tex",
 26 texture TEXTURE_HEAD6         "Models\\Enemies\\Mental\\HeadPetar.tex",
 27 texture TEXTURE_HEAD7         "Models\\Enemies\\Mental\\HeadPong.tex",
 28 texture TEXTURE_HEAD8         "Models\\Enemies\\Mental\\HeadRiba.tex",
 29 texture TEXTURE_HEAD9         "Models\\Enemies\\Mental\\HeadTome.tex",

 40 model   MODEL_FLESH           "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 41 texture TEXTURE_FLESH_RED     "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",


functions:

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
		return;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(MENTAL_ANIM_GROUNDREST, AOF_LOOPING|AOF_NORESTART);
  };

  void GreetAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_GREETLOOP1, AOF_LOOPING|AOF_NORESTART);
  };

  void GreetRightAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_GREETLOOPRIGHT1, AOF_LOOPING|AOF_NORESTART);
  };

  void GreetLeftAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_GREETLOOPLEFT1, AOF_LOOPING|AOF_NORESTART);
  };

  void RunAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };

  void JumpAnim(void)
  {
    //StartModelAnim(MENTAL_ANIM_GREETJUMP01, AOF_LOOPING|AOF_NORESTART);
    StartModelAnim(MENTAL_ANIM_BOWLJUMP, AOF_LOOPING|AOF_NORESTART);
  };

  void ShakeHeadAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_PANIC, AOF_LOOPING|AOF_NORESTART);
  };

  void Odd1Anim(void)
  {
    StartModelAnim(MENTAL_ANIM_CRATEANIMRIGHT, AOF_LOOPING|AOF_NORESTART);
  };

  void Odd2Anim(void)
  {
    StartModelAnim(MENTAL_ANIM_CRATEANIMLEFT, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkZombieAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_WALKZOMBIE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkAngelAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_WALKANGEL, AOF_LOOPING|AOF_NORESTART);
  };

  void WaveHandsAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_GREETLOOPBOTH02, AOF_LOOPING|AOF_NORESTART);
  };

  void DeathAnim(void)
  {
    StartModelAnim(MENTAL_ANIM_DEATH, AOF_NORESTART);
  };

  void SwellHead(void)
  {
    // Grow or Shrink Head
    GetModelObject()->GetAttachmentModel(0)->amo_moModelObject.StretchModel(FLOAT3D(fSize, fSize, fSize));
    //GetModelObject()->GetAttachmentModel(2)->amo_moModelObject.StretchModel(FLOAT3D(fSize, fSize, fSize));
    ModelChangeNotify();
  }

  void ExplodeHead(void)    
  {
    // remove head attchments
    GetModelObject()->RemoveAttachmentModel(0);
    GetModelObject()->RemoveAttachmentModel(2);

    // spawn explosion
    CPlacement3D plExplosion = GetPlacement();
    plExplosion.pl_PositionVector += FLOAT3D(0, 6, 0);
    CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_BOMB;
    eSpawnEffect.vStretch = FLOAT3D(1.5f, 1.5f, 1.5f);
    penExplosion->Initialize(eSpawnEffect);

    // explosion debris
    eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
    CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
    penExplosionDebris->Initialize(eSpawnEffect);

    FLOAT3D vNormalizedDamage = FLOAT3D(-1, 2, 0);
    //vNormalizedDamage *= 0.25f;
    FLOAT3D vBodySpeed = FLOAT3D(-1, 2, 0);

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_NONE, BET_NONE, 5.0f, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
    for( INDEX iDebris = 0; iDebris<4; iDebris++) {
      Debris_Spawn( this, this, MODEL_FLESH, TEXTURE_FLESH_RED, 0, 0, 0, IRnd()%4, 0.5f,
                    FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    }  
  }

  void SetTranslation(FLOAT3D vTrans)
  {
    SetDesiredTranslation(vTrans);
  }

  void SetRotation(FLOAT fRot)
  {
    SetDesiredRotation(ANGLE3D(fRot, 0, 0));
  }

  // render particles
  void RenderParticles(void)
  {
    /*FLOAT tmNow = _pTimer->GetLerpedCurrentTick()+10.0f;
    if (m_bRenderParticles) {
      Particles_RunAfterBurner(this, tmNow, 0.3f, 0);
    }*/
    if(m_tmSpiritStart!=0.0f) {
      Particles_Death(this, m_tmSpiritStart);
    }
  }

  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    //colAmbient = C_GRAY|255;
		if( m_bFadeOut) {
			FLOAT fTimeRemain = m_fFadeStartTime + m_fFadeTime - _pTimer->CurrentTick();
			if( fTimeRemain < 0.0f) { fTimeRemain = 0.0f; }
			COLOR colAlpha;
			colAlpha = GetModelObject()->mo_colBlendColor;
			colAlpha = (colAlpha&0xFFFFFF00) + (COLOR(fTimeRemain/m_fFadeTime*0xFF)&0xFF);
			GetModelObject()->mo_colBlendColor = colAlpha;
		}
		return FALSE;
		//return CESBigHead::AdjustShadingParameters(vLightDirection, colLight, colAmbient);
  }


  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CESBigHead) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

procedures:

  Active()
  {
    // repeat
    wait() {
      // if dead
      on(EDeath) : {
        // die
        jump Die();
      }
      otherwise() : {
        resume;
      }
    }
  }

  Die()
  {
    while (TRUE) {
      ExplodeHead();
      DeathAnim();
      autowait(9.0f);
			m_bFadeOut = TRUE;
			m_fFadeTime = 3.0f;
			m_fFadeStartTime = _pTimer->CurrentTick();
			autowait(m_fFadeTime);
			SwitchToEditorModel();
			m_tmSpiritStart = _pTimer->CurrentTick();
			autowait(5.0f);
      Destroy();
      return;
    }
  }

  /************************************************************
 *                       M  A  I  N                         *
 ************************************************************/

  Main() {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);

    // set your appearance
    SetModel(MODEL_MENTAL);
    SetModelMainTexture(TEXTURE_MENTAL);
		AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD);

		/*switch (m_iHeadTexture) {
			case 0: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD);  break;
			case 1: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD1); break;
			case 2: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD2); break;
			case 3: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD3); break;
			case 4: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD4); break;
			case 5: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD5); break;
			case 6: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD6); break;
			case 7: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD7); break;
			case 8: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD8); break;
			case 9: AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD9); break;
		}*/

    AddAttachment(MENTAL_ATTACHMENT_AURA, MODEL_AURA, TEXTURE_AURA);

    // set stretch factors for height and width
    GetModelObject()->StretchModel(FLOAT3D(fSize, fSize, fSize));
    ModelChangeNotify();
    StandingAnim();

    // continue behavior in base class
    jump Active();
  };
};
